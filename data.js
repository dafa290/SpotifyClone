/**
 * Spotify Clone Data Catalog
 * Includes tracks with metadata, dynamic gradient accent colors, and synchronized lyrics.
 */

export const tracks = [
  {
    id: "1",
    title: "Midnight City Drive",
    artist: "Neon Horizon",
    album: "Synthwave Breeze",
    duration: 372, // seconds (matching soundhelix duration approx)
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    color: "#6b21a8", // purple theme
    cover: "https://images.unsplash.com/photo-1515462277126-270d878326e5?q=80&w=300&auto=format&fit=crop",
    lyrics: [
      { time: 0, text: "🎵 (Instrumental Intro) 🎵" },
      { time: 12, text: "Electric lights flicker in the night" },
      { time: 24, text: "Driving through the streets of neon bright" },
      { time: 36, text: "Hold onto the wheel, we're taking flight" },
      { time: 48, text: "No looking back, just you and I" },
      { time: 60, text: "🎵 (Synth Solo) 🎵" },
      { time: 80, text: "Midnight city, feel the pulse arise" },
      { time: 92, text: "Starry skies reflecting in your eyes" },
      { time: 104, text: "We are chasing shadows till the dawn" },
      { time: 116, text: "In this digital world, we carry on" }
    ],
    artistBio: {
      bio: "Neon Horizon is a synthwave duo based in Miami, producing nostalgic 80s retrowave soundtracks with a modern electronic pulse.",
      followers: "1,240,593",
      listeners: "3,892,100",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=350&auto=format&fit=crop"
    }
  },
  {
    id: "2",
    title: "Chilled Lofi Rain",
    artist: "Lofi Hour",
    album: "Acoustic Raindrops",
    duration: 373,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    color: "#1e3a8a", // blue theme
    cover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300&auto=format&fit=crop",
    lyrics: [
      { time: 0, text: "🌧️ (Rain sounds dripping on the window) 🌧️" },
      { time: 15, text: "Rain falls down on the window pane" },
      { time: 30, text: "Sipping coffee, washing off the pain" },
      { time: 45, text: "Nothing here but hours left to pass" },
      { time: 60, text: "Watching tiny droplets slide on glass" },
      { time: 75, text: "Take a breath, let the world slow down" },
      { time: 90, text: "Hear the quiet music of the town" },
      { time: 110, text: "🎵 (Chill piano chords) 🎵" }
    ],
    artistBio: {
      bio: "Lofi Hour creates relaxing, study-focused instrumental lo-fi hip hop tracks blended with organic foley sounds and vinyl crackle.",
      followers: "4,502,110",
      listeners: "12,401,902",
      image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=350&auto=format&fit=crop"
    }
  },
  {
    id: "3",
    title: "Digital Energy Pulse",
    artist: "Cyberpunk Echo",
    album: "Futuristic Glitch",
    duration: 302,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    color: "#065f46", // teal theme
    cover: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=300&auto=format&fit=crop",
    lyrics: [
      { time: 0, text: "⚡ (Computer boot sequence) ⚡" },
      { time: 10, text: "System online, ready to receive" },
      { time: 20, text: "Virtual illusions we believe" },
      { time: 30, text: "Code running through our cybernetic veins" },
      { time: 40, text: "Breaking free from our physical chains" },
      { time: 55, text: "🎵 (Heavy electronic drop) 🎵" },
      { time: 75, text: "Speed of light, signal through the mesh" },
      { time: 85, text: "We are more than steel, we are more than flesh" }
    ],
    artistBio: {
      bio: "Cyberpunk Echo pushes the boundaries of dark electronic synthwave and industrial glitch pop, drawing inspiration from retro-futuristic arcade themes.",
      followers: "890,245",
      listeners: "2,541,883",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=350&auto=format&fit=crop"
    }
  },
  {
    id: "4",
    title: "Summer Sunshine",
    artist: "Sunray Acoustic",
    album: "Sandy Toes",
    duration: 502,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    color: "#b45309", // amber theme
    cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop",
    lyrics: [
      { time: 0, text: "☀️ (Acoustic guitar strums) ☀️" },
      { time: 12, text: "Sandy beaches running to the shore" },
      { time: 24, text: "Summer sunshine, couldn't ask for more" },
      { time: 36, text: "Warm wind blowing through your golden hair" },
      { time: 48, text: "Leaving all our worries, we don't care" },
      { time: 60, text: "Singing together, laughing in the heat" },
      { time: 72, text: "Dancing barefoot, feeling the sand beat" }
    ],
    artistBio: {
      bio: "Sunray Acoustic is an indie folk band from California, combining warm acoustic melodies, ukulele, and rich vocal harmonies.",
      followers: "2,109,422",
      listeners: "6,921,400",
      image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=350&auto=format&fit=crop"
    }
  },
  {
    id: "5",
    title: "Acoustic Sunset Trails",
    artist: "The Woods",
    album: "Pine Valley",
    duration: 383,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    color: "#15803d", // forest green theme
    cover: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=300&auto=format&fit=crop",
    lyrics: [
      { time: 0, text: "🌲 (Forest wind rustling) 🌲" },
      { time: 10, text: "Follow the trail up to the mountain peak" },
      { time: 25, text: "Into the wild, the quietness we seek" },
      { time: 40, text: "Campfire crackles as the stars align" },
      { time: 55, text: "Whispering pines, standard of design" }
    ],
    artistBio: {
      bio: "The Woods are a modern folk collective dedicated to capturing the organic acoustics of nature and traditional storytelling.",
      followers: "1,540,111",
      listeners: "4,120,490",
      image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=350&auto=format&fit=crop"
    }
  },
  {
    id: "6",
    title: "Deep Space Ambient",
    artist: "Orbit Alpha",
    album: "Cosmic Whispers",
    duration: 390,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    color: "#0369a1", // sky blue theme
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=300&auto=format&fit=crop",
    lyrics: [
      { time: 0, text: "🌌 (Cosmic hum and space drone) 🌌" },
      { time: 20, text: "Floating in the zero-gravity sphere" },
      { time: 45, text: "Earth is shrinking, fading out our fear" },
      { time: 70, text: "Millions of stars, shining ever bright" },
      { time: 95, text: "We are but dust in the cosmic night" }
    ],
    artistBio: {
      bio: "Orbit Alpha uses modular analog synthesizers and space-age reverb engines to compose deep cosmic ambient tracks suitable for sleep and deep focus.",
      followers: "670,492",
      listeners: "1,980,110",
      image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=350&auto=format&fit=crop"
    }
  },
  {
    id: "7",
    title: "Funk Deluxe",
    artist: "Groove Station",
    album: "Gold Coast",
    duration: 418,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    color: "#b91c1c", // red theme
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop",
    lyrics: [
      { time: 0, text: "🎸 (Slap bass intro) 🎸" },
      { time: 10, text: "Get up, feel the bassline in your soul" },
      { time: 20, text: "We got the rhythm, taking back control" },
      { time: 30, text: "Step to the dancefloor, let your body move" },
      { time: 40, text: "Ain't nothing else but keeping in the groove" }
    ],
    artistBio: {
      bio: "Groove Station is an 8-piece funk and soul revival band known for energetic brass sections and infectious danceable bass grooves.",
      followers: "1,120,400",
      listeners: "3,450,112",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=350&auto=format&fit=crop"
    }
  },
  {
    id: "8",
    title: "Hyperdrive Speed",
    artist: "Neon Horizon",
    album: "Turbo Charged",
    duration: 518,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    color: "#be185d", // pink/magenta theme
    cover: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=300&auto=format&fit=crop",
    lyrics: [
      { time: 0, text: "🏎️ (Engine revving) 🏎️" },
      { time: 15, text: "Hyperdrive engaged, ready to ignite" },
      { time: 30, text: "Moving at the speed of electronic light" },
      { time: 45, text: "Grid lines rushing past, racing to the edge" },
      { time: 60, text: "Hold onto the wheel, standing on the ledge" }
    ],
    artistBio: {
      bio: "Neon Horizon is a synthwave duo based in Miami, producing nostalgic 80s retrowave soundtracks with a modern electronic pulse.",
      followers: "1,240,593",
      listeners: "3,892,100",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=350&auto=format&fit=crop"
    }
  }
];

// Global cache for dynamically loaded YouTube tracks to ensure persistence
export const ytTracksCache = new Map();

// Load cache from localStorage
try {
  const cached = localStorage.getItem("spotify_clone_yt_cache");
  if (cached) {
    const parsed = JSON.parse(cached);
    Object.keys(parsed).forEach(key => {
      ytTracksCache.set(key, parsed[key]);
    });
  }
} catch (e) {
  console.warn("Could not load YouTube track cache from localStorage", e);
}

export function saveYtTrackToCache(track) {
  if (!track || !track.id.startsWith("yt-")) return;
  ytTracksCache.set(track.id, track);
  try {
    const obj = {};
    ytTracksCache.forEach((value, key) => {
      obj[key] = value;
    });
    localStorage.setItem("spotify_clone_yt_cache", JSON.stringify(obj));
  } catch (e) {
    console.warn("Could not save YouTube track cache to localStorage", e);
  }
}

// Helper to get a track by ID
export function getTrackById(id) {
  if (id && id.startsWith("yt-")) {
    return ytTracksCache.get(id);
  }
  return tracks.find(track => track.id === id);
}

// Seed Playlists
export const defaultPlaylists = [
  {
    id: "liked-songs",
    name: "Liked Songs",
    description: "Your personal collection of saved tracks.",
    cover: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=300&auto=format&fit=crop",
    color: "#535353",
    isSystem: true,
    tracks: []
  },
  {
    id: "playlist-1",
    name: "Synthwave Escape",
    description: "Get lost in neon grids and retro pulses.",
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop",
    color: "#6b21a8",
    isSystem: false,
    tracks: ["1", "8", "3"]
  },
  {
    id: "playlist-2",
    name: "Focus & Flow Lofi",
    description: "Gentle rain and soft lo-fi beats to boost study productivity.",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=300&auto=format&fit=crop",
    color: "#1e3a8a",
    isSystem: false,
    tracks: ["2", "6", "5"]
  },
  {
    id: "playlist-3",
    name: "Energy Booster",
    description: "Upbeat tracks to get you moving and grooving.",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300&auto=format&fit=crop",
    color: "#b91c1c",
    isSystem: false,
    tracks: ["7", "3", "8", "4"]
  }
];

// Dynamic YouTube Music Search via Local Server Proxy
export async function searchYouTubeMusic(query) {
  try {
    const url = `/api/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    // Register tracks in localStorage cache so player/UI can access them later
    data.forEach(track => saveYtTrackToCache(track));
    return data;
  } catch (err) {
    console.error("YouTube search request via local proxy failed:", err);
    return [];
  }
}

