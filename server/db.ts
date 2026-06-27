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
  friends?: string[]; // array of friend writerIds
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

const LOCAL_DB_PATH_ROOT = path.join(process.cwd(), "db.json");
const LOCAL_DB_PATH_TMP = "/tmp/db.json";

let memoryDb: LocalDatabase = { writers: [], seeds: [] };
let usedDbPath = LOCAL_DB_PATH_ROOT;

function readLocalDb(): LocalDatabase {
  try {
    if (fs.existsSync(usedDbPath)) {
      const raw = fs.readFileSync(usedDbPath, "utf8");
      return JSON.parse(raw);
    } else if (usedDbPath !== LOCAL_DB_PATH_TMP && fs.existsSync(LOCAL_DB_PATH_TMP)) {
      usedDbPath = LOCAL_DB_PATH_TMP;
      const raw = fs.readFileSync(LOCAL_DB_PATH_TMP, "utf8");
      return JSON.parse(raw);
    } else if (fs.existsSync(LOCAL_DB_PATH_ROOT)) {
      const raw = fs.readFileSync(LOCAL_DB_PATH_ROOT, "utf8");
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error("Error reading local db file, using memory db:", error);
  }
  return memoryDb;
}

function writeLocalDb(data: LocalDatabase) {
  memoryDb = data; // Keep in memory in-sync
  try {
    fs.writeFileSync(usedDbPath, JSON.stringify(data, null, 2), "utf8");
  } catch (error: any) {
    console.warn(`Failed to write to local db path ${usedDbPath}: ${error.message}. Falling back to /tmp/db.json...`);
    try {
      fs.writeFileSync(LOCAL_DB_PATH_TMP, JSON.stringify(data, null, 2), "utf8");
      usedDbPath = LOCAL_DB_PATH_TMP;
      console.log("Successfully switched db persistence path to /tmp/db.json");
    } catch (tmpErr: any) {
      console.error("Failed to write db to /tmp/db.json. Running strictly in-memory.", tmpErr.message);
    }
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
    try {
      const coll = mongoDb.collection<Writer>("writers");
      const writer = await coll.findOne({ email: email.toLowerCase().trim() });
      return writer;
    } catch (err) {
      console.error("MongoDB getWriterByEmail failed, falling back to local JSON:", err);
      isMongoActive = false;
    }
  }
  const db = readLocalDb();
  const writer = db.writers.find(w => w.email.toLowerCase().trim() === email.toLowerCase().trim());
  return writer || null;
}

export async function getWriterById(writerId: string): Promise<Writer | null> {
  if (isMongoActive && mongoDb) {
    try {
      const coll = mongoDb.collection<Writer>("writers");
      const writer = await coll.findOne({ writerId: writerId });
      return writer;
    } catch (err) {
      console.error("MongoDB getWriterById failed, falling back to local JSON:", err);
      isMongoActive = false;
    }
  }
  const db = readLocalDb();
  const writer = db.writers.find(w => w.writerId === writerId);
  return writer || null;
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
    try {
      const coll = mongoDb.collection<Writer>("writers");
      await coll.insertOne(newWriter);
      return newWriter;
    } catch (err) {
      console.error("MongoDB createWriter failed, falling back to local JSON:", err);
      isMongoActive = false;
    }
  }

  const db = readLocalDb();
  db.writers.push(newWriter);
  writeLocalDb(db);

  return newWriter;
}

export async function getAllWriters(): Promise<Writer[]> {
  if (isMongoActive && mongoDb) {
    try {
      const coll = mongoDb.collection<Writer>("writers");
      return await coll.find({}).toArray();
    } catch (err) {
      console.error("MongoDB getAllWriters failed, falling back to local JSON:", err);
      isMongoActive = false;
    }
  }
  const db = readLocalDb();
  return db.writers || [];
}

export async function toggleFriend(writerId: string, friendId: string): Promise<Writer | null> {
  if (isMongoActive && mongoDb) {
    try {
      const coll = mongoDb.collection<Writer>("writers");
      const writer = await coll.findOne({ writerId: writerId });
      if (writer) {
        const friends = writer.friends || [];
        const index = friends.indexOf(friendId);
        if (index > -1) {
          friends.splice(index, 1);
        } else {
          friends.push(friendId);
        }
        await coll.updateOne({ writerId: writerId }, { $set: { friends: friends } });
        return { ...writer, friends };
      }
    } catch (err) {
      console.error("MongoDB toggleFriend failed, falling back to local JSON:", err);
      isMongoActive = false;
    }
  }

  const db = readLocalDb();
  const idx = db.writers.findIndex(w => w.writerId === writerId);
  if (idx === -1) return null;

  const writer = db.writers[idx];
  const friends = writer.friends || [];
  const index = friends.indexOf(friendId);
  if (index > -1) {
    friends.splice(index, 1);
  } else {
    friends.push(friendId);
  }
  writer.friends = friends;
  writeLocalDb(db);
  return writer;
}

// ----------------------
// STORY SEEDS ACTIONS
// ----------------------
export async function getAllSeeds(): Promise<StorySeed[]> {
  if (isMongoActive && mongoDb) {
    try {
      const coll = mongoDb.collection<StorySeed>("seeds");
      return await coll.find({}).sort({ createdAt: -1 }).toArray();
    } catch (err) {
      console.error("MongoDB getAllSeeds failed, falling back to local JSON:", err);
      isMongoActive = false;
    }
  }
  const db = readLocalDb();
  return [...db.seeds].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getSeedsByWriter(writerId: string): Promise<StorySeed[]> {
  if (isMongoActive && mongoDb) {
    try {
      const coll = mongoDb.collection<StorySeed>("seeds");
      return await coll.find({ creatorWriterId: writerId }).sort({ createdAt: -1 }).toArray();
    } catch (err) {
      console.error("MongoDB getSeedsByWriter failed, falling back to local JSON:", err);
      isMongoActive = false;
    }
  }
  const db = readLocalDb();
  return db.seeds
    .filter(s => s.creatorWriterId === writerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
    try {
      const coll = mongoDb.collection<StorySeed>("seeds");
      await coll.insertOne(newSeed);
      return newSeed;
    } catch (err) {
      console.error("MongoDB createSeed failed, falling back to local JSON:", err);
      isMongoActive = false;
    }
  }

  const db = readLocalDb();
  db.seeds.push(newSeed);
  writeLocalDb(db);

  return newSeed;
}

export async function toggleLikeSeed(seedId: string, writerId: string): Promise<StorySeed | null> {
  if (isMongoActive && mongoDb) {
    try {
      const coll = mongoDb.collection<StorySeed>("seeds");
      const seed = await coll.findOne({ id: seedId });
      if (seed) {
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
      }
    } catch (err) {
      console.error("MongoDB toggleLikeSeed failed, falling back to local JSON:", err);
      isMongoActive = false;
    }
  }

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

export async function deleteSeed(seedId: string, writerId: string | null): Promise<boolean> {
  if (isMongoActive && mongoDb) {
    try {
      const coll = mongoDb.collection<StorySeed>("seeds");
      const seed = await coll.findOne({ id: seedId });
      if (!seed) return false;
      // If seed is anonymous, allow anyone to delete it. If it has an owner, check matching writerId
      if (seed.creatorWriterId === null || (writerId !== null && seed.creatorWriterId === writerId)) {
        const result = await coll.deleteOne({ id: seedId });
        return result.deletedCount > 0;
      }
      return false;
    } catch (err) {
      console.error("MongoDB deleteSeed failed, falling back to local JSON:", err);
      isMongoActive = false;
    }
  }

  const db = readLocalDb();
  const originalLength = db.seeds.length;
  db.seeds = db.seeds.filter(s => {
    if (s.id !== seedId) return true;
    // For the target seed:
    if (s.creatorWriterId === null) return false; // Allow deleting anonymous seeds
    return s.creatorWriterId !== writerId; // Allow deleting if writerId matches
  });
  writeLocalDb(db);
  return db.seeds.length < originalLength;
}
