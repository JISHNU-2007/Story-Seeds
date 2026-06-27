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
  fires?: number;
  firedBy?: string[];
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

export interface AppTheme {
  id: string;
  name: string;
  colorName: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  gradientFrom: string;
  gradientTo: string;
  gradientText: string;
  glowColor: string;
  hoverGlow: string;
  badgeClass: string;
  buttonPrimary: string;
  selectionClass: string;
  textMuted: string;
  scrollbarColor: string;
  light1: string;
  light2: string;
}

export const THEMES: AppTheme[] = [
  {
    id: "sunset",
    name: "Sunset Sanctuary",
    colorName: "Amber & Rose",
    accentText: "text-amber-400",
    accentBg: "bg-amber-500/10",
    accentBorder: "border-amber-500/20",
    gradientFrom: "from-amber-500",
    gradientTo: "to-rose-500",
    gradientText: "from-amber-400 via-rose-400 to-indigo-500",
    glowColor: "shadow-rose-500/10",
    hoverGlow: "hover:shadow-amber-500/20",
    badgeClass: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    buttonPrimary: "bg-gradient-to-r from-amber-500 to-rose-500",
    selectionClass: "selection:bg-amber-500/30 selection:text-amber-200",
    textMuted: "text-amber-400/90",
    scrollbarColor: "rgba(249, 115, 22, 0.2)",
    light1: "bg-amber-500/5",
    light2: "bg-rose-500/5"
  },
  {
    id: "cosmic",
    name: "Cosmic Ledger",
    colorName: "Indigo & Violet",
    accentText: "text-indigo-400",
    accentBg: "bg-indigo-500/10",
    accentBorder: "border-indigo-500/20",
    gradientFrom: "from-indigo-500",
    gradientTo: "to-purple-500",
    gradientText: "from-indigo-400 via-purple-400 to-pink-500",
    glowColor: "shadow-purple-500/10",
    hoverGlow: "hover:shadow-indigo-500/20",
    badgeClass: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    buttonPrimary: "bg-gradient-to-r from-indigo-500 to-purple-500",
    selectionClass: "selection:bg-indigo-500/30 selection:text-indigo-200",
    textMuted: "text-indigo-400/90",
    scrollbarColor: "rgba(99, 102, 241, 0.2)",
    light1: "bg-indigo-500/5",
    light2: "bg-purple-500/5"
  },
  {
    id: "emerald",
    name: "Emerald Forest",
    colorName: "Emerald & Teal",
    accentText: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
    accentBorder: "border-emerald-500/20",
    gradientFrom: "from-emerald-500",
    gradientTo: "to-teal-500",
    gradientText: "from-emerald-400 via-teal-400 to-sky-500",
    glowColor: "shadow-teal-500/10",
    hoverGlow: "hover:shadow-emerald-500/20",
    badgeClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    buttonPrimary: "bg-gradient-to-r from-emerald-500 to-teal-500",
    selectionClass: "selection:bg-emerald-500/30 selection:text-emerald-200",
    textMuted: "text-emerald-400/90",
    scrollbarColor: "rgba(16, 185, 129, 0.2)",
    light1: "bg-emerald-500/5",
    light2: "bg-teal-500/5"
  },
  {
    id: "crimson",
    name: "Crimson Crypt",
    colorName: "Rose & Red",
    accentText: "text-rose-400",
    accentBg: "bg-rose-500/10",
    accentBorder: "border-rose-500/20",
    gradientFrom: "from-rose-500",
    gradientTo: "to-red-500",
    gradientText: "from-rose-400 via-red-400 to-amber-500",
    glowColor: "shadow-red-500/10",
    hoverGlow: "hover:shadow-rose-500/20",
    badgeClass: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    buttonPrimary: "bg-gradient-to-r from-rose-500 to-red-500",
    selectionClass: "selection:bg-rose-500/30 selection:text-rose-200",
    textMuted: "text-rose-400/90",
    scrollbarColor: "rgba(244, 63, 94, 0.2)",
    light1: "bg-rose-500/5",
    light2: "bg-red-500/5"
  },
  {
    id: "vintage",
    name: "Vintage Parchment",
    colorName: "Gold & Sepia",
    accentText: "text-yellow-500",
    accentBg: "bg-yellow-500/10",
    accentBorder: "border-yellow-500/20",
    gradientFrom: "from-yellow-500",
    gradientTo: "to-amber-600",
    gradientText: "from-yellow-400 via-amber-500 to-yellow-600",
    glowColor: "shadow-amber-500/10",
    hoverGlow: "hover:shadow-yellow-500/20",
    badgeClass: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
    buttonPrimary: "bg-gradient-to-r from-yellow-500 to-amber-600",
    selectionClass: "selection:bg-yellow-500/30 selection:text-yellow-200",
    textMuted: "text-yellow-500/90",
    scrollbarColor: "rgba(234, 179, 8, 0.2)",
    light1: "bg-yellow-500/5",
    light2: "bg-amber-500/5"
  }
];

