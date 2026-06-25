/**
 * Spotify Clone UI Manager
 * Handles DOM rendering, view switching, click events, drag handles, context menus,
 * dynamic theme styling, and state changes emitted by the SpotifyPlayer.
 */

import { tracks, defaultPlaylists, searchYouTubeMusic } from "./data.js";
import { storage } from "./storage.js";

export class SpotifyUI {
  constructor(player) {
    this.player = player;
    this.currentView = "home";
    this.activePlaylistId = null;
    this.historyStack = ["home"];
    this.historyIndex = 0;
    this.searchDebounceTimeout = null;

    // Cache DOM Elements
    this.dom = {
      appContainer: document.getElementById("app-container"),
      viewRenderer: document.getElementById("view-renderer-target"),
      gradientBackdrop: document.getElementById("view-gradient-backdrop"),
      mainScrollContainer: document.getElementById("main-scroll-container"),
      lyricsPane: document.getElementById("lyrics-panel-view"),
      lyricsLines: document.getElementById("lyrics-lines-container"),
      rightSidebar: document.getElementById("right-sidebar"),
      
      // Sidebar Links
      navHome: document.getElementById("nav-link-home"),
      navSearch: document.getElementById("nav-link-search"),
      libraryToggle: document.getElementById("library-collapse-toggle"),
      libraryList: document.getElementById("library-items-list"),
      libraryCreateBtn: document.getElementById("library-create-playlist-btn"),
      librarySearchBox: document.getElementById("library-search-box"),
      librarySearchIcon: document.getElementById("library-search-icon"),
      librarySearchInput: document.getElementById("library-search-input"),
      
      // Top Navigation
      prevBtn: document.getElementById("header-prev-btn"),
      nextBtn: document.getElementById("header-next-btn"),
      topSearchBar: document.getElementById("top-search-bar"),
      searchInput: document.getElementById("main-search-input"),
      
      // Bottom Player Bar
      playerCover: document.getElementById("player-track-cover"),
      playerMetaInfo: document.getElementById("player-meta-info"),
      playerTitle: document.getElementById("player-track-title"),
      playerArtist: document.getElementById("player-track-artist"),
      playerLikeBtn: document.getElementById("player-like-btn"),
      
      // Bottom Controls
      shuffleBtn: document.getElementById("player-shuffle-btn"),
      prevControlBtn: document.getElementById("player-prev-btn"),
      playBtn: document.getElementById("player-play-btn"),
      playIcon: document.getElementById("player-play-icon"),
      nextControlBtn: document.getElementById("player-next-btn"),
      repeatBtn: document.getElementById("player-repeat-btn"),
      
      // Timeline Sliders
      currentTimeText: document.getElementById("player-current-time"),
      durationText: document.getElementById("player-duration"),
      timelineSlider: document.getElementById("timeline-slider-wrapper"),
      timelineProgress: document.getElementById("timeline-slider-progress"),
      timelineThumb: document.getElementById("timeline-slider-thumb"),
      
      // Utilities
      lyricsBtn: document.getElementById("utility-lyrics-btn"),
      queueBtn: document.getElementById("utility-queue-btn"),
      nowPlayingBtn: document.getElementById("utility-nowplaying-btn"),
      muteBtn: document.getElementById("player-mute-btn"),
      volumeIcon: document.getElementById("player-volume-icon"),
      volumeSlider: document.getElementById("volume-slider-wrapper"),
      volumeProgress: document.getElementById("volume-slider-progress"),
      volumeThumb: document.getElementById("volume-slider-thumb"),
      
      // Modals
      createPlaylistModal: document.getElementById("create-playlist-modal"),
      playlistNameInput: document.getElementById("playlist-name-input"),
      playlistDescInput: document.getElementById("playlist-desc-input"),
      playlistModalCancel: document.getElementById("playlist-modal-cancel"),
      playlistModalSubmit: document.getElementById("playlist-modal-submit"),
      
      // Context Menu
      songContextMenu: document.getElementById("song-context-menu")
    };

    this.initEventListeners();
    this.initPlayerEventBindings();
    this.renderLibrarySidebar();
    this.navigate("home");
  }

  // --- Initialization ---

  initEventListeners() {
    // 1. Navigation clicks
    this.dom.navHome.addEventListener("click", () => this.navigate("home"));
    this.dom.navSearch.addEventListener("click", () => this.navigate("search"));
    
    // Sidebar Library Toggles & search
    this.dom.libraryToggle.addEventListener("click", () => {
      this.dom.appContainer.classList.toggle("sidebar-collapsed");
    });
    
    this.dom.librarySearchIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      this.dom.librarySearchBox.classList.toggle("expanded");
      if (this.dom.librarySearchBox.classList.contains("expanded")) {
        this.dom.librarySearchInput.focus();
      }
    });

    this.dom.librarySearchInput.addEventListener("input", () => {
      this.renderLibrarySidebar();
    });

    // History Buttons
    this.dom.prevBtn.addEventListener("click", () => this.goBack());
    this.dom.nextBtn.addEventListener("click", () => this.goForward());

    // Search bar logic
    this.dom.searchInput.addEventListener("input", (e) => {
      clearTimeout(this.searchDebounceTimeout);
      const val = e.target.value;
      this.searchDebounceTimeout = setTimeout(() => {
        this.handleSearch(val);
      }, 500);
    });

    // 2. Playback buttons
    this.dom.playBtn.addEventListener("click", () => this.player.togglePlay());
    this.dom.prevControlBtn.addEventListener("click", () => this.player.previous());
    this.dom.nextControlBtn.addEventListener("click", () => this.player.next());
    
    this.dom.shuffleBtn.addEventListener("click", () => {
      this.player.toggleShuffle();
    });
    this.dom.repeatBtn.addEventListener("click", () => {
      this.player.toggleRepeat();
    });

    // Like active song
    this.dom.playerLikeBtn.addEventListener("click", () => {
      if (this.player.currentTrack) {
        const isLiked = storage.toggleLikeSong(this.player.currentTrack.id);
        this.updateLikeButton(isLiked);
        this.renderLibrarySidebar();
        // If viewing Liked Songs or Playlist, re-render it to keep synced
        if (this.currentView === "playlist" && this.activePlaylistId === "liked-songs") {
          this.renderPlaylistView("liked-songs");
        }
      }
    });

    // Sidebar creation modals
    this.dom.libraryCreateBtn.addEventListener("click", () => {
      this.dom.createPlaylistModal.style.display = "flex";
      this.dom.playlistNameInput.focus();
    });

    this.dom.playlistModalCancel.addEventListener("click", () => {
      this.closePlaylistModal();
    });

    this.dom.playlistModalSubmit.addEventListener("click", () => {
      this.submitCreatePlaylist();
    });

    this.dom.playlistNameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.submitCreatePlaylist();
    });

    // 3. Right side sidebar now playing toggle
    this.dom.nowPlayingBtn.addEventListener("click", () => {
      this.toggleRightSidebar();
    });

    // Queue View Button
    this.dom.queueBtn.addEventListener("click", () => {
      if (this.currentView === "queue") {
        this.goBack();
      } else {
        this.navigate("queue");
      }
    });

    // Lyrics View Button
    this.dom.lyricsBtn.addEventListener("click", () => {
      if (this.currentView === "lyrics") {
        this.dom.lyricsPane.style.display = "none";
        this.currentView = this.historyStack[this.historyIndex];
      } else {
        this.navigate("lyrics");
      }
    });

    // 4. Volume and Timeline dragging logic
    this.setupSlider(this.dom.timelineSlider, (pct) => {
      if (this.player.audio.duration) {
        const seconds = pct * this.player.audio.duration;
        this.player.seek(seconds);
      }
    });

    this.setupSlider(this.dom.volumeSlider, (pct) => {
      this.player.setVolume(pct);
    });

    this.dom.muteBtn.addEventListener("click", () => {
      this.player.toggleMute();
    });

    // Dismiss context menus & modals on window click
    window.addEventListener("click", (e) => {
      if (!this.dom.songContextMenu.contains(e.target)) {
        this.dom.songContextMenu.style.display = "none";
      }
    });
  }

  initPlayerEventBindings() {
    this.player.addEventListener("trackchange", (e) => {
      const track = e.detail.track;
      this.updatePlayerBarTrack(track);
      this.updateRightSidebar(track);
      this.updateThemeColors(track.color);
      this.updateLyricsLayout(track);
    });

    this.player.addEventListener("playbackstatechange", (e) => {
      const isPlaying = e.detail.isPlaying;
      if (isPlaying) {
        this.dom.playIcon.className = "fa-solid fa-pause";
        this.dom.playBtn.title = "Pause";
      } else {
        this.dom.playIcon.className = "fa-solid fa-play";
        this.dom.playBtn.title = "Play";
      }
      
      // Update play icon on rows in list
      const activeRows = document.querySelectorAll(`.play-icon-active`);
      activeRows.forEach(el => {
        el.className = isPlaying ? "fa-solid fa-pause play-icon-active" : "fa-solid fa-play play-icon-active";
      });
    });

    this.player.addEventListener("timeupdate", (e) => {
      const { currentTime, duration, percent } = e.detail;
      
      // Update text
      this.dom.currentTimeText.innerText = this.formatTime(currentTime);
      this.dom.durationText.innerText = this.formatTime(duration);
      
      // Update slider positions
      this.dom.timelineProgress.style.width = `${percent}%`;
      this.dom.timelineThumb.style.left = `${percent}%`;

      // Synced Lyrics Highlight
      if (this.currentView === "lyrics") {
        this.highlightLyric(currentTime);
      }
    });

    this.player.addEventListener("volumechange", (e) => {
      const { volume, isMuted } = e.detail;
      const pct = isMuted ? 0 : volume * 100;
      this.dom.volumeProgress.style.width = `${pct}%`;
      this.dom.volumeThumb.style.left = `${pct}%`;

      // Update speaker icon
      if (isMuted || volume === 0) {
        this.dom.volumeIcon.className = "fa-solid fa-volume-xmark";
      } else if (volume < 0.3) {
        this.dom.volumeIcon.className = "fa-solid fa-volume-off";
      } else if (volume < 0.7) {
        this.dom.volumeIcon.className = "fa-solid fa-volume-low";
      } else {
        this.dom.volumeIcon.className = "fa-solid fa-volume-high";
      }
    });

    this.player.addEventListener("queuechange", () => {
      this.dom.shuffleBtn.classList.toggle("active-state", this.player.isShuffle);
      this.dom.repeatBtn.classList.toggle("active-state", this.player.repeatMode !== "off");
      
      // Update repeat icon text based on mode
      const icon = this.dom.repeatBtn.querySelector("i");
      if (this.player.repeatMode === "one") {
        icon.className = "fa-solid fa-repeat-1"; // Custom icon text mock
        this.dom.repeatBtn.innerHTML = `<i class="fa-solid fa-repeat"></i><span style="font-size:0.5rem;position:absolute;top:-4px;right:-4px;background:var(--spotify-green);color:black;border-radius:50%;width:10px;height:10px;display:flex;align-items:center;justify-content:center;font-weight:bold;">1</span>`;
      } else {
        this.dom.repeatBtn.innerHTML = `<i class="fa-solid fa-repeat"></i>`;
      }

      if (this.currentView === "queue") {
        this.renderQueueView();
      }
    });
  }

  // Helper for custom mouse sliders dragging (timeline/volume)
  setupSlider(element, callback) {
    let isDragging = false;

    const getPercentage = (e) => {
      const rect = element.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      let pct = (clientX - rect.left) / rect.width;
      return Math.max(0, Math.min(1, pct));
    };

    const onStart = (e) => {
      isDragging = true;
      const pct = getPercentage(e);
      callback(pct);
      e.preventDefault();
    };

    const onMove = (e) => {
      if (!isDragging) return;
      const pct = getPercentage(e);
      callback(pct);
    };

    const onEnd = () => {
      isDragging = false;
    };

    element.addEventListener("mousedown", onStart);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);

    // Touch events for mobile compatibility
    element.addEventListener("touchstart", onStart);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onEnd);
  }

  // --- Router / History Handling ---

  navigate(view, playlistId = null) {
    // Hide lyrics panel if navigating away
    if (view !== "lyrics") {
      this.dom.lyricsPane.style.display = "none";
    }

    this.currentView = view;
    this.activePlaylistId = playlistId;

    // Push history stack
    if (this.historyStack[this.historyIndex] !== view || (view === "playlist" && this.activePlaylistId !== playlistId)) {
      this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
      this.historyStack.push({ view, playlistId });
      this.historyIndex = this.historyStack.length - 1;
    }

    this.updateNavigationButtons();

    // Toggle nav active classes
    this.dom.navHome.classList.toggle("active", view === "home");
    this.dom.navSearch.classList.toggle("active", view === "search");

    // Toggle header search bar
    this.dom.topSearchBar.style.display = (view === "search") ? "flex" : "none";

    // Scroll back to top on view switch
    this.dom.mainScrollContainer.scrollTop = 0;

    // Render corresponding view
    switch (view) {
      case "home":
        this.renderHomeView();
        break;
      case "search":
        this.renderSearchView();
        break;
      case "playlist":
        this.renderPlaylistView(playlistId);
        break;
      case "queue":
        this.renderQueueView();
        break;
      case "lyrics":
        this.renderLyricsView();
        break;
      default:
        this.renderHomeView();
    }
  }

  goBack() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const target = this.historyStack[this.historyIndex];
      if (typeof target === "string") {
        this.navigate(target);
      } else {
        this.navigate(target.view, target.playlistId);
      }
    }
  }

  goForward() {
    if (this.historyIndex < this.historyStack.length - 1) {
      this.historyIndex++;
      const target = this.historyStack[this.historyIndex];
      if (typeof target === "string") {
        this.navigate(target);
      } else {
        this.navigate(target.view, target.playlistId);
      }
    }
  }

  updateNavigationButtons() {
    this.dom.prevBtn.disabled = this.historyIndex === 0;
    this.dom.nextBtn.disabled = this.historyIndex === this.historyStack.length - 1;
  }

  // --- Sidebar Renderer ---

  renderLibrarySidebar() {
    const searchVal = this.dom.librarySearchInput.value.toLowerCase().trim();
    const systemPlaylists = defaultPlaylists.map(p => {
      if (p.id === "liked-songs") {
        return { ...p, tracks: storage.getLikedSongs() };
      }
      return p;
    });
    
    const userPlaylists = storage.getUserPlaylists();
    const allPlaylists = [...systemPlaylists, ...userPlaylists];

    // Filter
    const filtered = allPlaylists.filter(playlist => {
      // Library Search
      if (searchVal) {
        return playlist.name.toLowerCase().includes(searchVal);
      }
      return true;
    });

    let html = "";
    filtered.forEach(p => {
      const isLikedSongs = p.id === "liked-songs";
      const totalTracks = isLikedSongs ? p.tracks.length : p.tracks.length;
      
      html += `
        <div class="library-item" data-id="${p.id}">
          <img class="library-item-cover" src="${p.cover}" alt="${p.name}">
          <div class="library-item-info">
            <div class="library-item-title">${p.name}</div>
            <div class="library-item-subtitle">
              ${isLikedSongs ? `<i class="fa-solid fa-pin" style="color:var(--spotify-green);"></i>` : ""}
              Playlist • ${totalTracks} song${totalTracks !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      `;
    });

    this.dom.libraryList.innerHTML = html || `<div style="padding:16px;color:var(--text-secondary);font-size:0.8rem;">No playlists found.</div>`;

    // Add click listeners to items
    const items = this.dom.libraryList.querySelectorAll(".library-item");
    items.forEach(item => {
      item.addEventListener("click", () => {
        const id = item.dataset.id;
        this.navigate("playlist", id);
      });
    });
  }

  // --- Home View ---

  renderHomeView() {
    this.updateThemeColors("#535353"); // Reset gradient
    
    // Greeting
    const hour = new Date().getHours();
    let greeting = "Good Evening";
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";

    // 6 Quick Shortcuts (using loaded playlists)
    const systemPlaylists = defaultPlaylists.map(p => {
      if (p.id === "liked-songs") return { ...p, tracks: storage.getLikedSongs() };
      return p;
    });
    const allPlaylists = [...systemPlaylists, ...storage.getUserPlaylists()];
    const shortcuts = allPlaylists.slice(0, 6);

    let shortcutsHtml = "";
    shortcuts.forEach(p => {
      shortcutsHtml += `
        <div class="shortcut-card" data-id="${p.id}">
          <img class="shortcut-card-img" src="${p.cover}" alt="${p.name}">
          <div class="shortcut-card-title">${p.name}</div>
          <button class="hover-play-btn" data-id="${p.id}" title="Play ${p.name}">
            <i class="fa-solid fa-play"></i>
          </button>
        </div>
      `;
    });

    // Recommended items card row
    let recsHtml = "";
    tracks.slice(0, 4).forEach(t => {
      recsHtml += `
        <div class="music-item-card" data-track-id="${t.id}">
          <div class="card-img-wrapper">
            <img class="card-img" src="${t.cover}" alt="${t.title}">
            <button class="hover-play-btn card-play-trigger" data-track-id="${t.id}" title="Play ${t.title}">
              <i class="fa-solid fa-play"></i>
            </button>
          </div>
          <div class="card-title">${t.title}</div>
          <div class="card-desc">By ${t.artist} • ${t.album}</div>
        </div>
      `;
    });

    // Trending Artists row
    let artistsHtml = "";
    const uniqueArtists = [];
    tracks.forEach(t => {
      if (!uniqueArtists.some(a => a.artist === t.artist)) {
        uniqueArtists.push(t);
      }
    });

    uniqueArtists.slice(0, 4).forEach(t => {
      artistsHtml += `
        <div class="music-item-card artist-card" data-artist="${t.artist}">
          <div class="card-img-wrapper">
            <img class="card-img artist" src="${t.artistBio.image}" alt="${t.artist}">
          </div>
          <div class="card-title">${t.artist}</div>
          <div class="card-desc">Artist • ${t.artistBio.listeners} monthly listeners</div>
        </div>
      `;
    });

    this.dom.viewRenderer.innerHTML = `
      <div class="home-section">
        <h1 style="font-size: 2rem; font-weight: 800; margin-bottom: 20px;">${greeting}</h1>
        
        <!-- Top shortcuts 6 items -->
        <div class="top-shortcuts-grid">
          ${shortcutsHtml}
        </div>
      </div>

      <div class="home-section">
        <div class="home-section-title">
          <span>Recently Played & Recommended</span>
          <a href="#">Show all</a>
        </div>
        <div class="cards-scroll-row">
          ${recsHtml}
        </div>
      </div>

      <div class="home-section">
        <div class="home-section-title">
          <span>Popular Artists</span>
          <a href="#">Show all</a>
        </div>
        <div class="cards-scroll-row">
          ${artistsHtml}
        </div>
      </div>
    `;

    // Click bindings for home shortcuts
    this.dom.viewRenderer.querySelectorAll(".shortcut-card").forEach(el => {
      el.addEventListener("click", (e) => {
        // If play button clicked, play playlist tracks immediately
        if (e.target.closest(".hover-play-btn")) {
          e.stopPropagation();
          const playlistId = el.dataset.id;
          this.playPlaylistImmediately(playlistId);
          return;
        }
        this.navigate("playlist", el.dataset.id);
      });
    });

    // Click bindings for music item cards
    this.dom.viewRenderer.querySelectorAll(".music-item-card:not(.artist-card)").forEach(el => {
      el.addEventListener("click", (e) => {
        const trackId = el.dataset.trackId;
        const trackObj = tracks.find(t => t.id === trackId);
        if (e.target.closest(".card-play-trigger")) {
          e.stopPropagation();
          this.player.playTrack(trackObj, tracks);
          return;
        }
        // Play song on click
        this.player.playTrack(trackObj, tracks);
      });
    });
  }

  // --- Search View ---

  renderSearchView() {
    this.updateThemeColors("#121212"); // Plain grey search underlay
    this.dom.viewRenderer.innerHTML = `
      <div id="search-idle-categories">
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 16px;">Browse All</h2>
        <div class="search-categories-grid">
          <div class="genre-card" style="background: linear-gradient(135deg, #27856a, #1e3264);" data-genre="Synthwave">
            <span class="genre-card-title">Synthwave</span>
            <img class="genre-card-img" src="https://images.unsplash.com/photo-1515462277126-270d878326e5?q=80&w=150&auto=format&fit=crop" alt="genre image">
          </div>
          <div class="genre-card" style="background: linear-gradient(135deg, #1e3264, #a0c8d8);" data-genre="Lofi">
            <span class="genre-card-title">Lofi Beats</span>
            <img class="genre-card-img" src="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=150&auto=format&fit=crop" alt="genre image">
          </div>
          <div class="genre-card" style="background: linear-gradient(135deg, #8d67ab, #e8115b);" data-genre="Electronic">
            <span class="genre-card-title">Electronic</span>
            <img class="genre-card-img" src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=150&auto=format&fit=crop" alt="genre image">
          </div>
          <div class="genre-card" style="background: linear-gradient(135deg, #e8115b, #bc5900);" data-genre="Acoustic">
            <span class="genre-card-title">Acoustic</span>
            <img class="genre-card-img" src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=150&auto=format&fit=crop" alt="genre image">
          </div>
        </div>
      </div>
      <div id="search-results-viewport" style="display: none;"></div>
    `;

    // Click search filters
    this.dom.viewRenderer.querySelectorAll(".genre-card").forEach(card => {
      card.addEventListener("click", () => {
        const genre = card.dataset.genre;
        this.dom.searchInput.value = genre;
        this.handleSearch(genre);
      });
    });
  }

  async handleSearch(query) {
    const resultsContainer = document.getElementById("search-results-viewport");
    const idleCategories = document.getElementById("search-idle-categories");

    if (!query || !query.trim()) {
      if (resultsContainer) resultsContainer.style.display = "none";
      if (idleCategories) idleCategories.style.display = "block";
      return;
    }

    if (idleCategories) idleCategories.style.display = "none";
    if (resultsContainer) {
      resultsContainer.style.display = "block";
      resultsContainer.innerHTML = `
        <div style="padding:48px 0; text-align:center; color:var(--text-secondary);">
          <i class="fa-solid fa-circle-notch fa-spin" style="font-size:2.5rem; margin-bottom:12px; display:block; color:var(--spotify-green);"></i>
          <h3>Searching everywhere...</h3>
        </div>
      `;
    }

    const term = query.toLowerCase().trim();

    // 1. Filter local tracks
    const localMatches = tracks.filter(t => 
      t.title.toLowerCase().includes(term) ||
      t.artist.toLowerCase().includes(term) ||
      t.album.toLowerCase().includes(term)
    );

    // 2. Fetch YouTube Music results
    let ytMatches = [];
    try {
      ytMatches = await searchYouTubeMusic(query);
    } catch (e) {
      console.warn("YouTube search failed", e);
    }

    // Combine results (local matches first, then youtube matches)
    const allMatches = [...localMatches, ...ytMatches];

    if (allMatches.length === 0) {
      resultsContainer.innerHTML = `
        <div style="padding:48px 0; text-align:center; color:var(--text-secondary);">
          <i class="fa-regular fa-face-frown" style="font-size:2.5rem; margin-bottom:12px; display:block;"></i>
          <h3>No results found for "${query}"</h3>
          <p style="font-size:0.85rem; margin-top:6px;">Please check spelling or try a different term.</p>
        </div>
      `;
      return;
    }

    // Top Result: Play first match
    const topResult = allMatches[0];

    // Songs Rows List
    let songsHtml = "";
    allMatches.slice(0, 12).forEach((t, idx) => {
      const isLiked = storage.isSongLiked(t.id);
      const isActive = this.player.currentTrack?.id === t.id;
      const isPlaying = isActive && this.player.isPlaying;
      const isYt = t.id.startsWith("yt-");

      songsHtml += `
        <div class="song-list-row search-song-row" data-track-id="${t.id}">
          <div class="song-row-num">
            ${isPlaying 
              ? `<i class="fa-solid fa-volume-high play-icon-active" style="color:var(--spotify-green);"></i>` 
              : (idx + 1)
            }
          </div>
          <div class="song-row-details">
            <img src="${t.cover}" alt="cover">
            <div class="song-title-col">
              <span class="song-title-text ${isActive ? 'active' : ''}">${t.title}</span>
              <span class="song-artist-text">${t.artist}</span>
            </div>
          </div>
          <div class="song-album-col" style="display:flex; align-items:center;">
            ${isYt ? `<span style="background:rgba(255,255,255,0.08); padding:2px 8px; border-radius:100px; font-size:0.68rem; color:#ef4444; margin-right:8px; display:inline-flex; align-items:center; gap:4px; font-weight:600;"><i class="fa-brands fa-youtube"></i>YouTube</span>` : ""}
            ${t.album}
          </div>
          <div class="song-actions-col">
            <button class="song-row-like-btn ${isLiked ? 'liked' : ''}" data-track-id="${t.id}">
              <i class="${isLiked ? 'fa-solid fa-check' : 'fa-regular fa-plus'}"></i>
            </button>
            <span class="song-row-duration">${this.formatTime(t.duration)}</span>
          </div>
        </div>
      `;
    });

    resultsContainer.innerHTML = `
      <div class="search-results-section">
        
        <div class="top-result-container">
          <h2 style="font-size:1.45rem; font-weight:700; margin-bottom:16px;">Top Result</h2>
          <div class="top-result-card" data-track-id="${topResult.id}">
            <img src="${topResult.cover}" alt="${topResult.title}">
            <div class="top-result-title" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${topResult.title}</div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="top-result-badge" style="background:${topResult.id.startsWith("yt-") ? '#ef4444' : '#1db954'}; color:${topResult.id.startsWith("yt-") ? 'white' : 'black'}; font-weight:800;">${topResult.id.startsWith("yt-") ? "YOUTUBE" : "LOCAL"}</span>
              <span style="font-size:0.85rem; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;">By ${topResult.artist}</span>
            </div>
            <button class="hover-play-btn" data-track-id="${topResult.id}">
              <i class="fa-solid fa-play"></i>
            </button>
          </div>
        </div>

        <div class="search-songs-list-container">
          <h2 style="font-size:1.45rem; font-weight:700; margin-bottom:16px;">Songs</h2>
          <div style="display:flex; flex-direction:column; gap:4px; max-height:420px; overflow-y:auto; padding-right:4px;">
            ${songsHtml}
          </div>
        </div>

      </div>
    `;

    // Row clicks
    resultsContainer.querySelectorAll(".search-song-row").forEach(row => {
      row.addEventListener("click", (e) => {
        const trackId = row.dataset.trackId;
        const trackObj = allMatches.find(t => t.id === trackId);
        
        // Check Like click
        const likeBtn = e.target.closest(".song-row-like-btn");
        if (likeBtn) {
          e.stopPropagation();
          const isLiked = storage.toggleLikeSong(trackId);
          likeBtn.classList.toggle("liked", isLiked);
          likeBtn.querySelector("i").className = isLiked ? "fa-solid fa-check" : "fa-regular fa-plus";
          this.renderLibrarySidebar();
          return;
        }

        this.player.playTrack(trackObj, allMatches);
      });
    });

    // Top Result click
    const topCard = resultsContainer.querySelector(".top-result-card");
    if (topCard) {
      topCard.addEventListener("click", () => {
        this.player.playTrack(topResult, allMatches);
      });
    }
  }

  // --- Playlist View ---

  renderPlaylistView(playlistId) {
    let playlist = null;
    let playlistTracks = [];

    // System Liked Playlist
    if (playlistId === "liked-songs") {
      const likedSongIds = storage.getLikedSongs();
      playlist = {
        id: "liked-songs",
        name: "Liked Songs",
        description: "Your personally saved collection of music tracks.",
        cover: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=300&auto=format&fit=crop",
        color: "#3c0764", // dynamic dark violet
        isSystem: true
      };
      playlistTracks = tracks.filter(t => likedSongIds.includes(t.id));
    } else {
      // Find standard or custom playlist
      playlist = defaultPlaylists.find(p => p.id === playlistId) || storage.getUserPlaylists().find(p => p.id === playlistId);
      if (playlist) {
        playlistTracks = playlist.tracks.map(tid => tracks.find(t => t.id === tid)).filter(Boolean);
      }
    }

    if (!playlist) {
      this.navigate("home");
      return;
    }

    this.updateThemeColors(playlist.color);

    // Build tracks table list
    let tableRowsHtml = "";
    if (playlistTracks.length === 0) {
      tableRowsHtml = `
        <div style="padding:48px 0; text-align:center; color:var(--text-secondary); grid-column: 1 / -1;">
          <i class="fa-solid fa-music" style="font-size:2.5rem; margin-bottom:12px; display:block;"></i>
          <h3>This playlist is empty</h3>
          <p style="font-size:0.85rem; margin-top:6px;">Go to Search or Home to discover and add songs!</p>
        </div>
      `;
    } else {
      playlistTracks.forEach((t, idx) => {
        const isLiked = storage.isSongLiked(t.id);
        const isActive = this.player.currentTrack?.id === t.id;
        const isPlaying = isActive && this.player.isPlaying;

        tableRowsHtml += `
          <div class="tracks-table-row playlist-track-row" data-track-id="${t.id}">
            <div class="track-number-cell">
              ${isPlaying 
                ? `<i class="fa-solid fa-volume-high play-icon-active" style="color:var(--spotify-green);"></i>` 
                : `<span>${idx + 1}</span><i class="fa-solid fa-play row-play-icon"></i>`
              }
            </div>
            <div class="track-title-cell">
              <img src="${t.cover}" alt="cover">
              <div class="track-text-details">
                <span class="track-title-link ${isActive ? 'active' : ''}">${t.title}</span>
                <span class="track-artist-link" data-artist="${t.artist}">${t.artist}</span>
              </div>
            </div>
            <div class="track-album-cell">${t.album}</div>
            <div class="track-time-cell">
              <button class="song-row-like-btn ${isLiked ? 'liked' : ''}" data-track-id="${t.id}">
                <i class="${isLiked ? 'fa-solid fa-check' : 'fa-regular fa-plus'}"></i>
              </button>
              <span>${this.formatTime(t.duration)}</span>
              <button class="utility-icon-btn row-options-btn" data-track-id="${t.id}" title="More options">
                <i class="fa-solid fa-ellipsis"></i>
              </button>
            </div>
          </div>
        `;
      });
    }

    const isCustom = !playlist.isSystem;

    this.dom.viewRenderer.innerHTML = `
      <div class="playlist-hero-banner">
        <img class="playlist-cover-big" src="${playlist.cover}" alt="${playlist.name}">
        <div class="playlist-details-info">
          <span class="playlist-tag">Playlist</span>
          <h1 class="playlist-title-big">${playlist.name}</h1>
          <p style="color:var(--text-secondary); font-size:0.88rem; margin:4px 0;">${playlist.description}</p>
          <div class="playlist-meta">
            <span class="playlist-meta-owner">Spotify Clone</span>
            <span class="playlist-meta-bullet"></span>
            <span class="playlist-meta-stats">${playlistTracks.length} song${playlistTracks.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <div class="playlist-action-bar">
        ${playlistTracks.length > 0 ? `
          <button class="playlist-play-btn-circle" id="playlist-hero-play-btn" title="Play playlist">
            <i class="fa-solid fa-play"></i>
          </button>
        ` : ''}
        ${isCustom ? `
          <button class="playlist-action-btn-outline" id="playlist-delete-btn">Delete Playlist</button>
        ` : ''}
      </div>

      <!-- Header row columns -->
      <div class="tracks-table-header">
        <div>#</div>
        <div>Title</div>
        <div>Album</div>
        <div style="text-align:right; padding-right:12px;">Duration</div>
      </div>

      <div style="display:flex; flex-direction:column; gap:2px; margin-top:8px;">
        ${tableRowsHtml}
      </div>
    `;

    // Click play buttons
    const playBtn = document.getElementById("playlist-hero-play-btn");
    if (playBtn) {
      playBtn.addEventListener("click", () => {
        this.playPlaylistImmediately(playlistId);
      });
    }

    // Click delete custom playlist
    const deleteBtn = document.getElementById("playlist-delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        if (confirm(`Are you sure you want to delete the playlist "${playlist.name}"?`)) {
          storage.deletePlaylist(playlistId);
          this.renderLibrarySidebar();
          this.navigate("home");
        }
      });
    }

    // Row interactions
    const rows = this.dom.viewRenderer.querySelectorAll(".playlist-track-row");
    rows.forEach(row => {
      row.addEventListener("click", (e) => {
        const trackId = row.dataset.trackId;
        const trackObj = tracks.find(t => t.id === trackId);

        // Check Like click
        const likeBtn = e.target.closest(".song-row-like-btn");
        if (likeBtn) {
          e.stopPropagation();
          const isLiked = storage.toggleLikeSong(trackId);
          likeBtn.classList.toggle("liked", isLiked);
          likeBtn.querySelector("i").className = isLiked ? "fa-solid fa-check" : "fa-regular fa-plus";
          this.renderLibrarySidebar();
          // If in liked view, reload
          if (playlistId === "liked-songs") this.renderPlaylistView("liked-songs");
          return;
        }

        // Check options click
        const optBtn = e.target.closest(".row-options-btn");
        if (optBtn) {
          e.stopPropagation();
          this.openContextMenu(e, trackId, playlistId);
          return;
        }

        // Standard row click: Play track
        this.player.playTrack(trackObj, playlistTracks);
      });
    });
  }

  playPlaylistImmediately(playlistId) {
    let playlistTracks = [];
    if (playlistId === "liked-songs") {
      const likedIds = storage.getLikedSongs();
      playlistTracks = tracks.filter(t => likedIds.includes(t.id));
    } else {
      const p = defaultPlaylists.find(x => x.id === playlistId) || storage.getUserPlaylists().find(x => x.id === playlistId);
      if (p) {
        playlistTracks = p.tracks.map(tid => tracks.find(t => t.id === tid)).filter(Boolean);
      }
    }
    if (playlistTracks.length > 0) {
      this.player.playTrack(playlistTracks[0], playlistTracks);
    }
  }

  // --- Synced Lyrics View ---

  renderLyricsView() {
    this.dom.lyricsPane.style.display = "flex";
    this.updateLyricsLayout(this.player.currentTrack);
  }

  updateLyricsLayout(track) {
    if (!track || !track.lyrics || track.lyrics.length === 0) {
      this.dom.lyricsLines.innerHTML = `
        <div class="lyrics-line active" style="font-size:2rem; text-align:center;">
          Lyrics aren't available for this song.
        </div>
      `;
      return;
    }

    let lyricsHtml = "";
    track.lyrics.forEach((line, idx) => {
      lyricsHtml += `
        <div class="lyrics-line" id="lyric-line-${idx}" data-time="${line.time}">
          ${line.text}
        </div>
      `;
    });

    this.dom.lyricsLines.innerHTML = lyricsHtml;
  }

  highlightLyric(time) {
    if (!this.player.currentTrack || !this.player.currentTrack.lyrics) return;
    const lyrics = this.player.currentTrack.lyrics;
    
    // Find index of current lyric line matching current time
    let activeIdx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (time >= lyrics[i].time) {
        activeIdx = i;
      } else {
        break;
      }
    }

    // Toggle active class on DOM
    const lines = this.dom.lyricsLines.querySelectorAll(".lyrics-line");
    lines.forEach((line, idx) => {
      const isActive = idx === activeIdx;
      line.classList.toggle("active", isActive);
      
      // Auto Scroll active line to center of container
      if (isActive) {
        const lineTop = line.offsetTop;
        const paneHeight = this.dom.lyricsPane.clientHeight;
        const targetScroll = lineTop - (paneHeight / 2.5);
        this.dom.lyricsPane.scrollTo({
          top: targetScroll,
          behavior: "smooth"
        });
      }
    });
  }

  // --- Queue View ---

  renderQueueView() {
    this.updateThemeColors("#121212");
    
    const { current, nextUp } = this.player.getFullQueue();

    let currentHtml = "";
    if (current) {
      currentHtml = `
        <div class="song-list-row" style="background-color: var(--spotify-grey-hover);">
          <div class="song-row-num" style="color:var(--spotify-green);">▶</div>
          <div class="song-row-details">
            <img src="${current.cover}" alt="cover">
            <div class="song-title-col">
              <span class="song-title-text active">${current.title}</span>
              <span class="song-artist-text">${current.artist}</span>
            </div>
          </div>
          <div class="song-album-col">${current.album}</div>
          <div class="song-actions-col">
            <span class="song-row-duration">${this.formatTime(current.duration)}</span>
          </div>
        </div>
      `;
    } else {
      currentHtml = `<div style="padding:16px; color:var(--text-secondary);">No active song playing.</div>`;
    }

    let nextHtml = "";
    if (nextUp.length === 0) {
      nextHtml = `<div style="padding:16px; color:var(--text-secondary); font-size:0.88rem;">Queue is empty. Next tracks from playlists will appear here.</div>`;
    } else {
      nextUp.forEach((t, idx) => {
        nextHtml += `
          <div class="song-list-row queue-song-row" data-idx="${idx}">
            <div class="song-row-num">${idx + 1}</div>
            <div class="song-row-details">
              <img src="${t.cover}" alt="cover">
              <div class="song-title-col">
                <span class="song-title-text">${t.title}</span>
                <span class="song-artist-text">${t.artist}</span>
              </div>
            </div>
            <div class="song-album-col">${t.album}</div>
            <div class="song-actions-col">
              <span class="song-row-duration">${this.formatTime(t.duration)}</span>
            </div>
          </div>
        `;
      });
    }

    this.dom.viewRenderer.innerHTML = `
      <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 24px;">Play Queue</h1>
      
      <div style="margin-bottom: 32px;">
        <h2 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 12px; color:var(--text-secondary);">Now Playing</h2>
        ${currentHtml}
      </div>

      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h2 style="font-size: 1.2rem; font-weight: 700; color:var(--text-secondary);">Next Up</h2>
          ${nextUp.length > 0 ? `<button class="playlist-action-btn-outline" id="clear-queue-btn" style="padding:4px 12px;">Clear Queue</button>` : ""}
        </div>
        <div style="display:flex; flex-direction:column; gap:4px;">
          ${nextHtml}
        </div>
      </div>
    `;

    const clearBtn = document.getElementById("clear-queue-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.player.clearQueue();
      });
    }

    // Row play trigger
    this.dom.viewRenderer.querySelectorAll(".queue-song-row").forEach(row => {
      row.addEventListener("click", () => {
        const idx = parseInt(row.dataset.idx);
        // Play song at index, advance queue
        const targetSong = nextUp[idx];
        // Split queues
        this.player.playTrack(targetSong, nextUp.slice(idx));
      });
    });
  }

  // --- Bottom Player Sync ---

  updatePlayerBarTrack(track) {
    if (!track) {
      this.dom.playerCover.style.opacity = 0;
      this.dom.playerMetaInfo.style.display = "none";
      this.dom.playerLikeBtn.style.display = "none";
      return;
    }

    this.dom.playerCover.src = track.cover;
    this.dom.playerCover.style.opacity = 1;
    this.dom.playerTitle.innerText = track.title;
    this.dom.playerArtist.innerText = track.artist;
    this.dom.playerMetaInfo.style.display = "flex";
    this.dom.playerLikeBtn.style.display = "block";

    this.updateLikeButton(storage.isSongLiked(track.id));
  }

  updateLikeButton(isLiked) {
    this.dom.playerLikeBtn.classList.toggle("liked", isLiked);
    const icon = this.dom.playerLikeBtn.querySelector("i");
    if (isLiked) {
      icon.className = "fa-solid fa-check";
      this.dom.playerLikeBtn.title = "Saved to Liked Songs";
    } else {
      icon.className = "fa-regular fa-plus";
      this.dom.playerLikeBtn.title = "Save to Liked Songs";
    }
  }

  // --- Right Sidebar now playing panel ---

  updateRightSidebar(track) {
    if (!track) {
      this.dom.rightSidebar.innerHTML = `<div style="padding:24px; text-align:center; color:var(--text-secondary);">Play a song to view details</div>`;
      return;
    }

    const { bio, followers, listeners, image } = track.artistBio;

    this.dom.rightSidebar.innerHTML = `
      <div class="now-playing-panel-header">
        <span>Now Playing Details</span>
        <button class="library-action-btn" id="right-sidebar-close-btn">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="now-playing-panel-content">
        <img class="now-playing-big-cover" src="${track.cover}" alt="cover">
        
        <div class="now-playing-panel-details">
          <div class="now-playing-panel-title">${track.title}</div>
          <div class="now-playing-panel-artist">${track.artist}</div>
        </div>

        <div class="artist-bio-card">
          <div class="artist-bio-image-wrapper">
            <img class="artist-bio-image" src="${image}" alt="${track.artist}">
            <div class="artist-bio-gradient-overlay"></div>
            <div class="artist-bio-name-tag">${track.artist}</div>
          </div>
          <div class="artist-bio-stats">
            <div class="artist-bio-listeners">
              <span>Monthly Listeners</span>
              ${listeners}
            </div>
            <p class="artist-bio-text">${bio}</p>
          </div>
        </div>
      </div>
    `;

    document.getElementById("right-sidebar-close-btn").addEventListener("click", () => {
      this.toggleRightSidebar(false);
    });
  }

  toggleRightSidebar(forceState = null) {
    const isVisible = this.dom.appContainer.style.getPropertyValue("--right-sidebar-width") === "320px";
    const nextState = forceState !== null ? forceState : !isVisible;

    if (nextState) {
      this.dom.appContainer.style.setProperty("--right-sidebar-width", "320px");
      this.dom.nowPlayingBtn.classList.add("active");
    } else {
      this.dom.appContainer.style.setProperty("--right-sidebar-width", "0px");
      this.dom.nowPlayingBtn.classList.remove("active");
    }
  }

  // --- Dynamic Color Custom Property ---

  updateThemeColors(colorHex) {
    if (!colorHex) return;
    
    // Set dynamic css accent gradient variable
    this.dom.appContainer.style.setProperty("--theme-gradient-color", colorHex);
  }

  // --- Modals Management ---

  closePlaylistModal() {
    this.dom.createPlaylistModal.style.display = "none";
    this.dom.playlistNameInput.value = "";
    this.dom.playlistDescInput.value = "";
  }

  submitCreatePlaylist() {
    const name = this.dom.playlistNameInput.value.trim();
    const desc = this.dom.playlistDescInput.value.trim();
    if (!name) {
      alert("Playlist name cannot be empty!");
      return;
    }
    const playlist = storage.createPlaylist(name, desc);
    this.closePlaylistModal();
    this.renderLibrarySidebar();
    
    // Auto navigate to new playlist details
    this.navigate("playlist", playlist.id);
  }

  // --- Song Context Dropdown (Playlist Customizations) ---

  openContextMenu(e, trackId, activePlaylistId) {
    const rect = e.target.getBoundingClientRect();
    const top = rect.bottom + window.scrollY;
    const left = rect.left - 130 + window.scrollX;

    const userPlaylists = storage.getUserPlaylists();
    const isSongLiked = storage.isSongLiked(trackId);

    let playlistsSubmenu = "";
    if (userPlaylists.length === 0) {
      playlistsSubmenu = `<div class="dropdown-item" style="color:var(--text-secondary);font-size:0.75rem;">No user playlists.</div>`;
    } else {
      userPlaylists.forEach(up => {
        playlistsSubmenu += `
          <div class="dropdown-item playlist-add-option" data-playlist-id="${up.id}">
            Add to: ${up.name}
          </div>
        `;
      });
    }

    this.dom.songContextMenu.innerHTML = `
      <div class="dropdown-item toggle-like-option">
        <i class="${isSongLiked ? 'fa-solid fa-check' : 'fa-regular fa-plus'}"></i>
        <span>${isSongLiked ? "Unlike song" : "Like song"}</span>
      </div>
      <div class="dropdown-item queue-add-option">
        <i class="fa-solid fa-list-ol"></i>
        <span>Add to queue</span>
      </div>
      
      <hr style="border:none; border-bottom: 1px solid var(--border-subtle); margin:4px 0;">
      
      <div style="max-height: 150px; overflow-y:auto;">
        ${playlistsSubmenu}
      </div>

      ${activePlaylistId && activePlaylistId !== "liked-songs" && !activePlaylistId.startsWith("liked") ? `
        <hr style="border:none; border-bottom: 1px solid var(--border-subtle); margin:4px 0;">
        <div class="dropdown-item danger remove-track-option">
          <i class="fa-solid fa-trash-can"></i>
          <span>Remove from playlist</span>
        </div>
      ` : ""}
    `;

    this.dom.songContextMenu.style.top = `${top}px`;
    this.dom.songContextMenu.style.left = `${left}px`;
    this.dom.songContextMenu.style.display = "block";

    // Bind item actions
    this.dom.songContextMenu.querySelector(".toggle-like-option").addEventListener("click", () => {
      storage.toggleLikeSong(trackId);
      this.renderLibrarySidebar();
      if (this.currentView === "playlist") this.renderPlaylistView(this.activePlaylistId);
      this.dom.songContextMenu.style.display = "none";
    });

    this.dom.songContextMenu.querySelector(".queue-add-option").addEventListener("click", () => {
      const track = tracks.find(t => t.id === trackId);
      this.player.addToQueue(track);
      this.dom.songContextMenu.style.display = "none";
    });

    this.dom.songContextMenu.querySelectorAll(".playlist-add-option").forEach(opt => {
      opt.addEventListener("click", () => {
        const playlistId = opt.dataset.playlistId;
        const added = storage.addTrackToPlaylist(playlistId, trackId);
        if (added) {
          alert("Added song to playlist!");
        } else {
          alert("Song already in playlist!");
        }
        this.renderLibrarySidebar();
        this.dom.songContextMenu.style.display = "none";
      });
    });

    const removeOpt = this.dom.songContextMenu.querySelector(".remove-track-option");
    if (removeOpt) {
      removeOpt.addEventListener("click", () => {
        storage.removeTrackFromPlaylist(activePlaylistId, trackId);
        this.renderPlaylistView(activePlaylistId);
        this.renderLibrarySidebar();
        this.dom.songContextMenu.style.display = "none";
      });
    }
  }

  // --- Utility Helpers ---

  formatTime(secs) {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}
