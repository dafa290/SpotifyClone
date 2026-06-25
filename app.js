/**
 * Spotify Clone App Bootstrapper
 * Entry point that instantiates the SpotifyPlayer class and SpotifyUI controller,
 * wire them together, and initializes state upon DOM content loading.
 */

import { tracks } from "./data.js";
import { SpotifyPlayer } from "./player.js";
import { SpotifyUI } from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing Spotify Web Player Clone...");

  try {
    // 1. Instantiate Core Audio Player Controller
    const player = new SpotifyPlayer(tracks);

    // 2. Instantiate User Interface Layer
    const ui = new SpotifyUI(player);

    // 3. Keep references in global namespace for dev testing/debugging
    window.spotifyPlayer = player;
    window.spotifyUI = ui;

    console.log("Spotify Web Player initialized successfully!");
  } catch (error) {
    console.error("Critical error during Spotify Clone initialization:", error);
  }
});
