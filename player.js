/**
 * Spotify Clone Player Controller
 * Wraps HTML5 Audio API and implements Spotify playback mechanics:
 * play/pause, next/prev, shuffle, repeat, volume controls, and a dual-queue system.
 */

import { storage } from "./storage.js";

export class SpotifyPlayer extends EventTarget {
  constructor(allTracks) {
    super();
    this.allTracks = allTracks; // full track catalog
    this.audio = new Audio();
    
    // Playback state
    this.currentTrack = null;
    this.playlistQueue = []; // tracks from active playlist context
    this.customQueue = []; // tracks manually queued by user
    this.history = [];
    this.isPlaying = false;
    this.isShuffle = false;
    this.repeatMode = "off"; // "off" | "all" | "one"
    
    // Initialize volume from storage
    this.audio.volume = storage.getVolume();

    // Bind HTML5 Audio events to custom SpotifyPlayer events
    this.audio.addEventListener("timeupdate", () => {
      this.dispatchEvent(new CustomEvent("timeupdate", {
        detail: {
          currentTime: this.audio.currentTime,
          duration: this.audio.duration || this.currentTrack?.duration || 0,
          percent: (this.audio.currentTime / (this.audio.duration || 1)) * 100
        }
      }));
    });

    this.audio.addEventListener("ended", () => {
      this.handleTrackEnded();
    });

    this.audio.addEventListener("play", () => {
      this.isPlaying = true;
      this.dispatchEvent(new CustomEvent("playbackstatechange", { detail: { isPlaying: true } }));
    });

    this.audio.addEventListener("pause", () => {
      this.isPlaying = false;
      this.dispatchEvent(new CustomEvent("playbackstatechange", { detail: { isPlaying: false } }));
    });

    this.audio.addEventListener("volumechange", () => {
      this.dispatchEvent(new CustomEvent("volumechange", { detail: { volume: this.audio.volume, isMuted: this.audio.muted } }));
    });

    this.audio.addEventListener("error", (e) => {
      console.error("Audio playback error, skipping to next...", e);
      // Auto skip to avoid lock
      setTimeout(() => this.next(), 1000);
    });
  }

  // --- Core Controls ---

  // Play a specific track and set the active playlist queue context
  playTrack(track, contextTracks = []) {
    if (!track) return;
    
    // Save previous to history
    if (this.currentTrack && this.currentTrack.id !== track.id) {
      this.history.push(this.currentTrack);
      if (this.history.length > 20) this.history.shift();
    }

    this.currentTrack = track;

    // Set playlist context queue (exclude current track from upcoming if starting it)
    if (contextTracks.length > 0) {
      const idx = contextTracks.findIndex(t => t.id === track.id);
      if (idx !== -1) {
        // Queue consists of remaining tracks after the playing track
        this.playlistQueue = contextTracks.slice(idx + 1);
      } else {
        this.playlistQueue = [...contextTracks];
      }
    } else {
      this.playlistQueue = [];
    }

    // Apply shuffle if active
    if (this.isShuffle) {
      this.shufflePlaylistQueue();
    }

    this.audio.src = track.url;
    this.audio.load();
    this.audio.play()
      .then(() => {
        this.dispatchEvent(new CustomEvent("trackchange", { detail: { track } }));
        this.dispatchEvent(new CustomEvent("queuechange"));
      })
      .catch(err => {
        console.warn("Playback failed. Interaction required or resource issue.", err);
      });
  }

  togglePlay() {
    if (!this.currentTrack) {
      // Play first song in catalog if nothing loaded
      if (this.allTracks.length > 0) {
        this.playTrack(this.allTracks[0], this.allTracks);
      }
      return;
    }

    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play().catch(e => console.warn(e));
    }
  }

  next() {
    // 1. Check custom queue
    if (this.customQueue.length > 0) {
      const nextTrack = this.customQueue.shift();
      this.playTrack(nextTrack, [...this.customQueue, ...this.playlistQueue]);
      return;
    }

    // 2. Check playlist queue
    if (this.playlistQueue.length > 0) {
      const nextTrack = this.playlistQueue.shift();
      // If repeat all, append current track back to playlistQueue
      if (this.repeatMode === "all" && this.currentTrack) {
        this.playlistQueue.push(this.currentTrack);
      }
      this.playTrack(nextTrack, this.playlistQueue);
      return;
    }

    // 3. Queue empty, check repeat mode
    if (this.repeatMode === "all" && this.currentTrack) {
      // Re-fill queue with all tracks except current, or just restart
      if (this.history.length > 0) {
        const fullContext = [...this.history, this.currentTrack];
        this.history = [];
        this.playTrack(fullContext[0], fullContext);
      } else {
        this.seek(0);
        this.audio.play().catch(e => {});
      }
    } else {
      // Stop playback at end of queue
      this.audio.currentTime = 0;
      this.audio.pause();
      this.dispatchEvent(new CustomEvent("playbackstatechange", { detail: { isPlaying: false } }));
    }
  }

  previous() {
    // If track is more than 3 seconds in, restart it
    if (this.audio.currentTime > 3) {
      this.seek(0);
      return;
    }

    // Otherwise, play previous from history
    if (this.history.length > 0) {
      const prevTrack = this.history.pop();
      // Put current track at the beginning of playlistQueue
      if (this.currentTrack) {
        this.playlistQueue.unshift(this.currentTrack);
      }
      this.playTrack(prevTrack, this.playlistQueue);
    } else {
      // Restart current track if no history
      this.seek(0);
    }
  }

  seek(seconds) {
    if (!this.currentTrack) return;
    this.audio.currentTime = seconds;
  }

  // --- Volume Management ---

  setVolume(val) {
    const clamped = Math.max(0, Math.min(1, val));
    this.audio.volume = clamped;
    this.audio.muted = false;
    storage.saveVolume(clamped);
  }

  toggleMute() {
    this.audio.muted = !this.audio.muted;
    this.dispatchEvent(new CustomEvent("volumechange", { detail: { volume: this.audio.volume, isMuted: this.audio.muted } }));
  }

  // --- Shuffle & Repeat Toggles ---

  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    if (this.isShuffle) {
      this.shufflePlaylistQueue();
    } else {
      // Ideally rebuild order from current playing, but simple version is fine
    }
    this.dispatchEvent(new CustomEvent("queuechange"));
  }

  toggleRepeat() {
    if (this.repeatMode === "off") {
      this.repeatMode = "all";
    } else if (this.repeatMode === "all") {
      this.repeatMode = "one";
    } else {
      this.repeatMode = "off";
    }
    this.dispatchEvent(new CustomEvent("queuechange"));
  }

  // --- Queue Additions ---

  addToQueue(track) {
    if (!track) return;
    if (this.customQueue.some(t => t.id === track.id)) return; // already queued
    this.customQueue.push(track);
    this.dispatchEvent(new CustomEvent("queuechange"));
  }

  clearQueue() {
    this.customQueue = [];
    this.playlistQueue = [];
    this.dispatchEvent(new CustomEvent("queuechange"));
  }

  // --- Internal Helpers ---

  handleTrackEnded() {
    if (this.repeatMode === "one") {
      this.seek(0);
      this.audio.play().catch(e => {});
    } else {
      this.next();
    }
  }

  shufflePlaylistQueue() {
    // Fisher-Yates shuffle algorithm
    for (let i = this.playlistQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.playlistQueue[i], this.playlistQueue[j]] = [this.playlistQueue[j], this.playlistQueue[i]];
    }
  }

  getFullQueue() {
    return {
      current: this.currentTrack,
      nextUp: [...this.customQueue, ...this.playlistQueue]
    };
  }
}
