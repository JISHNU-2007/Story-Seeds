import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { 
  initDb, 
  createWriter, 
  getWriterByEmail, 
  getWriterById, 
  getAllSeeds, 
  getSeedsByWriter, 
  createSeed, 
  toggleLikeSeed, 
  deleteSeed 
} from "../server/db.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize AI Studio Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Initialize Database (Atlas Connection if URI available, else fallback to JSON file)
initDb().catch((err) => {
  console.error("Failed to connect to database on startup:", err);
});

// ----------------------
// AUTH API ENDPOINTS
// ----------------------

// Sign up
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, writerNumber, dob, email, favoriteGenre, bio, password } = req.body;
    
    if (!name || !writerNumber || !dob || !email || !password) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const existingWriter = await getWriterByEmail(email);
    if (existingWriter) {
      return res.status(400).json({ error: "A writer with this email already exists." });
    }

    const newWriter = await createWriter({
      name,
      writerNumber,
      dob,
      email,
      favoriteGenre: favoriteGenre || "General",
      bio: bio || "",
      password, // stored simply for mockup preview authentication
    });

    // Avoid returning password to client
    const { password: _, ...safeWriter } = newWriter;
    res.status(201).json({ success: true, writer: safeWriter });
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(500).json({ error: error.message || "Internal server error during signup." });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password." });
    }

    const writer = await getWriterByEmail(email);
    if (!writer || writer.password !== password) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const { password: _, ...safeWriter } = writer;
    res.json({ success: true, writer: safeWriter });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message || "Internal server error during login." });
  }
});

// Get specific writer details
app.get("/api/writers/:id", async (req, res) => {
  try {
    const writer = await getWriterById(req.params.id);
    if (!writer) {
      return res.status(404).json({ error: "Writer not found." });
    }
    const { password: _, ...safeWriter } = writer;
    res.json(safeWriter);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------
// SEED GENERATION & SEEDS ENDPOINTS
// ----------------------

// AI Generation
app.post("/api/generate-seed", async (req, res) => {
  try {
    const { genre, setting, emotionalTone, additionalIdeas, writerId } = req.body;

    if (!genre || !setting || !emotionalTone) {
      return res.status(400).json({ error: "Genre, setting, and emotional tone are required." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "Gemini API Key is missing. Please set GEMINI_API_KEY in the Secrets panel." 
      });
    }

    // Build precise prompt for generating the dramatic story seed
    const prompt = `Write a dramatic, compelling Story Seed based on these parameters:
- Genre: ${genre}
- Setting: ${setting}
- Emotional Tone: ${emotionalTone}
${additionalIdeas ? `- Additional ideas/keywords to weave in: ${additionalIdeas}` : ""}

A Story Seed is a short, one-paragraph description of a community, place, or situation with some dramatic tension already baked in, ready to kickstart writing.
It must set up a conflict or mystery without resolving it. Write in an evocative, highly atmospheric style with rich sensory details.
Keep it strictly under 5-6 sentences (one paragraph). Output ONLY the paragraph, nothing else.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the AI Muse of Story Seeds. You compose highly engaging, atmosphere-rich, single-paragraph writing prompts (seeds) with inherent narrative conflict.",
        temperature: 0.85,
      }
    });

    const seedText = response.text?.trim() || "Could not generate seed text.";

    // Fetch creator details if logged in
    let creatorName = "Anonymous Writer";
    if (writerId) {
      const creator = await getWriterById(writerId);
      if (creator) {
        creatorName = creator.name;
      }
    }

    const seed = await createSeed({
      genre,
      setting,
      emotionalTone,
      additionalIdeas: additionalIdeas || "",
      seedText,
      creatorWriterId: writerId || null,
      creatorName,
    });

    res.status(201).json(seed);
  } catch (error: any) {
    console.error("Seed generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate story seed." });
  }
});

// Get all story seeds (public community gallery)
app.get("/api/seeds", async (req, res) => {
  try {
    const seeds = await getAllSeeds();
    res.json(seeds);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get seeds created by a specific writer
app.get("/api/seeds/writer/:writerId", async (req, res) => {
  try {
    const seeds = await getSeedsByWriter(req.params.writerId);
    res.json(seeds);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle Like a Seed
app.post("/api/seeds/:id/like", async (req, res) => {
  try {
    const { writerId } = req.body;
    if (!writerId) {
      return res.status(400).json({ error: "Writer ID is required to like a seed." });
    }
    const updatedSeed = await toggleLikeSeed(req.params.id, writerId);
    if (!updatedSeed) {
      return res.status(404).json({ error: "Seed not found." });
    }
    res.json(updatedSeed);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete seed
app.delete("/api/seeds/:id", async (req, res) => {
  try {
    const { writerId } = req.body;
    if (!writerId) {
      return res.status(400).json({ error: "Writer ID is required to delete." });
    }
    const success = await deleteSeed(req.params.id, writerId);
    if (!success) {
      return res.status(404).json({ error: "Seed not found or you are not authorized to delete it." });
    }
    res.json({ success: true, message: "Seed deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------
// VITE / STATIC MIDDLEWARE
// ----------------------

if (process.env.NODE_ENV !== "production") {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Story Seeds Server] Running on http://0.0.0.0:${PORT}`);
  });
}

export default app;
