import { MongoClient, Db } from "mongodb";
import fs from "fs";
import path from "path";

// Define interfaces
export interface Writer {
  writerId: string; // e.g. WR-4912
  name: string;
  writerNumber: string;
  dob: string;
  email: string;
  favoriteGenre: string;
  bio: string;
  createdAt: string;
  password?: string;
}

export interface StorySeed {
  id: string;
  genre: string;
  setting: string;
  emotionalTone: string;
  additionalIdeas?: string;
  seedText: string;
  creatorWriterId?: string;
  creatorName?: string;
  createdAt: string;
  likes?: number;
  likedBy?: string[]; // array of writerIds
}

// Memory / Local file fallback
interface LocalDatabase {
  writers: Writer[];
  seeds: StorySeed[];
}

const LOCAL_DB_PATH = path.join(process.cwd(), "db.json");

function readLocalDb(): LocalDatabase {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const raw = fs.readFileSync(LOCAL_DB_PATH, "utf8");
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error("Error reading local db file, using fresh db:", error);
  }
  return { writers: [], seeds: [] };
}

function writeLocalDb(data: LocalDatabase) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing local db file:", error);
  }
}

// Database Connection Manager
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let isMongoActive = false;

export async function initDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("MONGODB_URI is not set. Falling back to local JSON database storage (db.json).");
    return;
  }

  try {
    console.log("Connecting to MongoDB...");
    mongoClient = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    await mongoClient.connect();
    mongoDb = mongoClient.db("story_seeds");
    isMongoActive = true;
    console.log("Successfully connected to MongoDB Atlas!");
  } catch (error) {
    console.error("Failed to connect to MongoDB. Falling back to local JSON database. Error:", error);
    isMongoActive = false;
  }
}

// ----------------------
// WRITERS ACTIONS
// ----------------------
export async function getWriterByEmail(email: string): Promise<Writer | null> {
  if (isMongoActive && mongoDb) {
    const coll = mongoDb.collection<Writer>("writers");
    const writer = await coll.findOne({ email: email.toLowerCase().trim() });
    return writer;
  } else {
    const db = readLocalDb();
    const writer = db.writers.find(w => w.email.toLowerCase().trim() === email.toLowerCase().trim());
    return writer || null;
  }
}

export async function getWriterById(writerId: string): Promise<Writer | null> {
  if (isMongoActive && mongoDb) {
    const coll = mongoDb.collection<Writer>("writers");
    const writer = await coll.findOne({ writerId: writerId });
    return writer;
  } else {
    const db = readLocalDb();
    const writer = db.writers.find(w => w.writerId === writerId);
    return writer || null;
  }
}

export async function createWriter(writerData: Omit<Writer, "writerId" | "createdAt">): Promise<Writer> {
  // Generate random Writer ID
  const num = Math.floor(1000 + Math.random() * 9000); // 4-digit ID
  const writerId = `WR-${num}`;
  const createdAt = new Date().toISOString();
  
  const newWriter: Writer = {
    ...writerData,
    writerId,
    email: writerData.email.toLowerCase().trim(),
    createdAt,
  };

  if (isMongoActive && mongoDb) {
    const coll = mongoDb.collection<Writer>("writers");
    await coll.insertOne(newWriter);
  } else {
    const db = readLocalDb();
    db.writers.push(newWriter);
    writeLocalDb(db);
  }

  return newWriter;
}

// ----------------------
// STORY SEEDS ACTIONS
// ----------------------
export async function getAllSeeds(): Promise<StorySeed[]> {
  if (isMongoActive && mongoDb) {
    const coll = mongoDb.collection<StorySeed>("seeds");
    return await coll.find({}).sort({ createdAt: -1 }).toArray();
  } else {
    const db = readLocalDb();
    return [...db.seeds].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function getSeedsByWriter(writerId: string): Promise<StorySeed[]> {
  if (isMongoActive && mongoDb) {
    const coll = mongoDb.collection<StorySeed>("seeds");
    return await coll.find({ creatorWriterId: writerId }).sort({ createdAt: -1 }).toArray();
  } else {
    const db = readLocalDb();
    return db.seeds
      .filter(s => s.creatorWriterId === writerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function createSeed(seedData: Omit<StorySeed, "id" | "createdAt" | "likes" | "likedBy">): Promise<StorySeed> {
  const id = "seed_" + Math.random().toString(36).substring(2, 15);
  const createdAt = new Date().toISOString();
  
  const newSeed: StorySeed = {
    ...seedData,
    id,
    createdAt,
    likes: 0,
    likedBy: [],
  };

  if (isMongoActive && mongoDb) {
    const coll = mongoDb.collection<StorySeed>("seeds");
    await coll.insertOne(newSeed);
  } else {
    const db = readLocalDb();
    db.seeds.push(newSeed);
    writeLocalDb(db);
  }

  return newSeed;
}

export async function toggleLikeSeed(seedId: string, writerId: string): Promise<StorySeed | null> {
  if (isMongoActive && mongoDb) {
    const coll = mongoDb.collection<StorySeed>("seeds");
    const seed = await coll.findOne({ id: seedId });
    if (!seed) return null;

    const likedBy = seed.likedBy || [];
    const index = likedBy.indexOf(writerId);
    if (index > -1) {
      likedBy.splice(index, 1);
    } else {
      likedBy.push(writerId);
    }

    const likes = likedBy.length;
    await coll.updateOne({ id: seedId }, { $set: { likedBy, likes } });
    return { ...seed, likedBy, likes };
  } else {
    const db = readLocalDb();
    const seedIndex = db.seeds.findIndex(s => s.id === seedId);
    if (seedIndex === -1) return null;

    const seed = db.seeds[seedIndex];
    const likedBy = seed.likedBy || [];
    const index = likedBy.indexOf(writerId);
    if (index > -1) {
      likedBy.splice(index, 1);
    } else {
      likedBy.push(writerId);
    }

    seed.likedBy = likedBy;
    seed.likes = likedBy.length;
    
    writeLocalDb(db);
    return seed;
  }
}

export async function deleteSeed(seedId: string, writerId: string): Promise<boolean> {
  if (isMongoActive && mongoDb) {
    const coll = mongoDb.collection<StorySeed>("seeds");
    const result = await coll.deleteOne({ id: seedId, creatorWriterId: writerId });
    return result.deletedCount > 0;
  } else {
    const db = readLocalDb();
    const originalLength = db.seeds.length;
    db.seeds = db.seeds.filter(s => !(s.id === seedId && s.creatorWriterId === writerId));
    writeLocalDb(db);
    return db.seeds.length < originalLength;
  }
}
