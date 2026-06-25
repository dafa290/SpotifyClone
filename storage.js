/**
 * Spotify Clone Storage Manager
 * Handles local persistence of Liked Songs, user playlists, volume, and playback state.
 */

const STORAGE_KEYS = {
  LIKED_SONGS: "spotify_clone_liked_songs",
  USER_PLAYLISTS: "spotify_clone_user_playlists",
  VOLUME: "spotify_clone_volume",
  RECENT_SEARCHES: "spotify_clone_recent_searches"
};

export const storage = {
  // --- Liked Songs ---
  getLikedSongs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LIKED_SONGS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading liked songs", e);
      return [];
    }
  },

  saveLikedSongs(songIds) {
    try {
      localStorage.setItem(STORAGE_KEYS.LIKED_SONGS, JSON.stringify(songIds));
    } catch (e) {
      console.error("Error saving liked songs", e);
    }
  },

  toggleLikeSong(songId) {
    const liked = this.getLikedSongs();
    const index = liked.indexOf(songId);
    let isLiked = false;
    if (index === -1) {
      liked.push(songId);
      isLiked = true;
    } else {
      liked.splice(index, 1);
    }
    this.saveLikedSongs(liked);
    return isLiked;
  },

  isSongLiked(songId) {
    return this.getLikedSongs().includes(songId);
  },

  // --- Playlists ---
  getUserPlaylists() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PLAYLISTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading user playlists", e);
      return [];
    }
  },

  saveUserPlaylists(playlists) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PLAYLISTS, JSON.stringify(playlists));
    } catch (e) {
      console.error("Error saving playlists", e);
    }
  },

  createPlaylist(name, description = "") {
    const playlists = this.getUserPlaylists();
    const newPlaylist = {
      id: "user-playlist-" + Date.now(),
      name: name || `My Playlist #${playlists.length + 1}`,
      description: description || "A custom playlist by you.",
      cover: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=300&auto=format&fit=crop",
      color: "#282828",
      isSystem: false,
      tracks: []
    };
    playlists.push(newPlaylist);
    this.saveUserPlaylists(playlists);
    return newPlaylist;
  },

  deletePlaylist(playlistId) {
    let playlists = this.getUserPlaylists();
    playlists = playlists.filter(p => p.id !== playlistId);
    this.saveUserPlaylists(playlists);
  },

  addTrackToPlaylist(playlistId, trackId) {
    const playlists = this.getUserPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist && !playlist.tracks.includes(trackId)) {
      playlist.tracks.push(trackId);
      this.saveUserPlaylists(playlists);
      return true;
    }
    return false;
  },

  removeTrackFromPlaylist(playlistId, trackId) {
    const playlists = this.getUserPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
      playlist.tracks = playlist.tracks.filter(tid => tid !== trackId);
      this.saveUserPlaylists(playlists);
      return true;
    }
    return false;
  },

  // --- Volume ---
  getVolume() {
    const vol = localStorage.getItem(STORAGE_KEYS.VOLUME);
    return vol !== null ? parseFloat(vol) : 0.7; // default 70%
  },

  saveVolume(volume) {
    localStorage.setItem(STORAGE_KEYS.VOLUME, volume.toString());
  },

  // --- Recent Searches ---
  getRecentSearches() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  addRecentSearch(query) {
    if (!query || !query.trim()) return;
    let searches = this.getRecentSearches();
    searches = searches.filter(s => s.toLowerCase() !== query.toLowerCase());
    searches.unshift(query.trim());
    if (searches.length > 5) searches.pop(); // keep top 5
    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(searches));
  },

  clearRecentSearches() {
    localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
  }
};
