export interface Writer {
  writerId: string;
  name: string;
  writerNumber: string;
  dob: string;
  email: string;
  favoriteGenre: string;
  bio: string;
  createdAt: string;
}

export interface StorySeed {
  id: string;
  genre: string;
  setting: string;
  emotionalTone: string;
  additionalIdeas?: string;
  seedText: string;
  creatorWriterId?: string | null;
  creatorName?: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
}

export const GENRES_WITH_SETTINGS = {
  "Sci-Fi": [
    "Neo-Tokyo Cyber-Slums",
    "Deserted Orbital Research Outpost",
    "The Last Bio-Dome on a Scorched Earth",
    "A Subterranean Water-Mining Colony",
    "An Interstellar Sleeper Ship's Engine Core"
  ],
  "Fantasy": [
    "A Whispering Elven Forest Canopy",
    "The Floating Ruins of an Ancient Citadel",
    "A Bustling Alchemist Market Alley",
    "The Frozen Throne of the Wyrm King",
    "A Forgotten Oasis Protected by Stone Golems"
  ],
  "Mystery & Thriller": [
    "An Isolated Cliffside Manor During a Storm",
    "A Foggy Victorian London Dockyard",
    "A Seedy Jazz Club in 1940s New York",
    "A High-Speed Trans-Siberian Sleeper Train",
    "An Abandoned Carnival Ground at Midnight"
  ],
  "Horror": [
    "A Dilapidated Asylum Deep in the Woods",
    "An Offshore Oil Rig Silent Since Yesterday",
    "A Colonial Village that Appears on No Maps",
    "A Cold, Windowless Basement in an Old Suburb",
    "A Deep Ocean Trench Research Vessel"
  ],
  "Romance & Drama": [
    "A Sun-Drenched Vineyard in Tuscany",
    "A Cozy Independent Bookstore in Edinburgh",
    "A Rooftop Community Garden in Chicago",
    "A Coastal Lighthouse Station in Maine",
    "A Vibrant Street Cafe in Paris"
  ],
  "Historical Fiction": [
    "A Roman Military Camp on the Scottish Border",
    "A Renaissance Inventor's Workshop in Florence",
    "A Dust Bowl Farm in 1930s Oklahoma",
    "A Samurai Guard Station in Feudal Edo",
    "A Coal Mining Town in 19th Century Wales"
  ]
};

export const EMOTIONAL_TONES = [
  "Suspenseful & Tense",
  "Melancholic & Somber",
  "Mystical & Wonder-filled",
  "Hopeful & Uplifting",
  "Dark, Gritty & Dangerous",
  "Whimsical & Playful",
  "Claustrophobic & Paranoid",
  "Nostalgic & Bitter-sweet"
];
