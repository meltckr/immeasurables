import { clamp, formatTime, normalizePlaybackRate, PLAYBACK_RATES } from "./player-utils.mjs";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      --player-bg: #111827;
      --player-surface: rgba(255, 255, 255, 0.075);
      --player-border: rgba(255, 255, 255, 0.13);
      --player-text: #f8fafc;
      --player-muted: #a9b4c5;
      --player-accent: #f36b4a;
      --player-accent-soft: rgba(243, 107, 74, 0.2);
      --player-focus: #f6c453;
      color-scheme: dark;
      display: block;
      font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      max-width: 760px;
    }

    * { box-sizing: border-box; }

    .player {
      background:
        radial-gradient(circle at 92% 4%, rgba(243, 107, 74, 0.13), transparent 31%),
        linear-gradient(145deg, #172033 0%, var(--player-bg) 70%);
      border: 1px solid var(--player-border);
      border-radius: 22px;
      box-shadow: 0 22px 56px rgba(3, 7, 18, 0.24);
      color: var(--player-text);
      overflow: hidden;
      padding: clamp(18px, 4vw, 28px);
      position: relative;
    }

    .topline {
      align-items: flex-start;
      display: flex;
      gap: 16px;
      justify-content: space-between;
    }

    .identity { min-width: 0; }

    .eyebrow {
      color: var(--player-accent);
      font-size: 0.72rem;
      font-weight: 760;
      letter-spacing: 0.13em;
      margin: 0 0 7px;
      text-transform: uppercase;
    }

    .title {
      font-size: clamp(1.05rem, 3vw, 1.3rem);
      font-weight: 720;
      letter-spacing: -0.025em;
      line-height: 1.2;
      margin: 0;
      overflow-wrap: anywhere;
    }

    .duration-label {
      color: var(--player-muted);
      font-size: 0.78rem;
      font-variant-numeric: tabular-nums;
      margin: 3px 0 0;
      white-space: nowrap;
    }

    .transport {
      align-items: center;
      display: grid;
      gap: clamp(10px, 3vw, 18px);
      grid-template-columns: 48px 62px 48px;
      justify-content: center;
      margin: 24px auto 20px;
    }

    button {
      -webkit-tap-highlight-color: transparent;
      appearance: none;
      background: var(--player-surface);
      border: 1px solid var(--player-border);
      color: var(--player-text);
      cursor: pointer;
      font: inherit;
    }

    button:focus-visible,
    input:focus-visible,
    a:focus-visible {
      outline: 3px solid var(--player-focus);
      outline-offset: 3px;
    }

    button:hover { background: rgba(255, 255, 255, 0.13); }

    .skip {
      align-items: center;
      border-radius: 50%;
      display: inline-flex;
      font-size: 0.76rem;
      font-weight: 750;
      height: 48px;
      justify-content: center;
      position: relative;
      width: 48px;
    }

    .skip svg {
      height: 32px;
      inset: 7px;
      position: absolute;
      stroke: currentColor;
      width: 32px;
    }

    .skip span { position: relative; z-index: 1; }

    .play {
      align-items: center;
      background: var(--player-text);
      border: 0;
      border-radius: 50%;
      color: var(--player-bg);
      display: inline-flex;
      height: 62px;
      justify-content: center;
      transition: transform 150ms ease, background 150ms ease;
      width: 62px;
    }

    .play:hover { background: #ffffff; transform: scale(1.035); }
    .play svg { fill: currentColor; height: 26px; width: 26px; }
    .play[data-state="playing"] .play-icon { display: none; }
    .play:not([data-state="playing"]) .pause-icon { display: none; }

    .timeline { margin-top: 2px; }

    .time-row {
      color: var(--player-muted);
      display: flex;
      font-size: 0.76rem;
      font-variant-numeric: tabular-nums;
      justify-content: space-between;
      margin-top: 8px;
    }

    input[type="range"] {
      --progress: 0%;
      appearance: none;
      background: linear-gradient(
        to right,
        var(--player-accent) 0,
        var(--player-accent) var(--progress),
        rgba(255, 255, 255, 0.18) var(--progress),
        rgba(255, 255, 255, 0.18) 100%
      );
      border-radius: 999px;
      cursor: pointer;
      display: block;
      height: 5px;
      margin: 0;
      width: 100%;
    }

    input[type="range"]::-webkit-slider-thumb {
      appearance: none;
      background: #fff;
      border: 3px solid var(--player-accent);
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.34);
      height: 18px;
      width: 18px;
    }

    input[type="range"]::-moz-range-thumb {
      background: #fff;
      border: 3px solid var(--player-accent);
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.34);
      height: 13px;
      width: 13px;
    }

    .footer {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 12px 16px;
      justify-content: space-between;
      margin-top: 20px;
    }

    .speed-group {
      align-items: center;
      display: flex;
      gap: 6px;
    }

    .speed-label {
      color: var(--player-muted);
      font-size: 0.76rem;
      font-weight: 680;
      margin-right: 3px;
    }

    .speed {
      border-radius: 999px;
      font-size: 0.76rem;
      font-weight: 720;
      min-height: 34px;
      min-width: 42px;
      padding: 6px 10px;
    }

    .speed[aria-pressed="true"] {
      background: var(--player-accent-soft);
      border-color: var(--player-accent);
      color: #ffd6cb;
    }

    .links { display: flex; flex-wrap: wrap; gap: 12px; }

    a {
      color: var(--player-muted);
      font-size: 0.76rem;
      font-weight: 660;
      text-decoration-color: rgba(255, 255, 255, 0.35);
      text-underline-offset: 3px;
    }

    a:hover { color: var(--player-text); }
    [hidden] { display: none !important; }

    .status {
      height: 1px;
      margin: -1px;
      overflow: hidden;
      padding: 0;
      position: absolute;
      width: 1px;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }

    @media (max-width: 470px) {
      .player { border-radius: 18px; }
      .topline { gap: 10px; }
      .transport { margin-top: 20px; }
      .footer { align-items: flex-start; flex-direction: column; }
      .speed-group { justify-content: space-between; width: 100%; }
      .speed { flex: 1; }
    }

    @media (prefers-reduced-motion: reduce) {
      .play { transition: none; }
    }
  </style>

  <section class="player" aria-label="Audio player">
    <audio preload="metadata"></audio>
    <div class="topline">
      <div class="identity">
        <p class="eyebrow"></p>
        <h2 class="title"></h2>
      </div>
      <p class="duration-label" aria-hidden="true">Audio brief</p>
    </div>

    <div class="transport">
      <button class="skip back" type="button" aria-label="Go back 15 seconds">
        <svg aria-hidden="true" viewBox="0 0 36 36" fill="none"><path d="M10.5 11.5V5.8M10.5 5.8H4.8M10.5 5.8A14 14 0 1 1 4.2 19" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span>15</span>
      </button>
      <button class="play" type="button" aria-label="Play audio" aria-pressed="false" data-state="paused">
        <svg class="play-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M8 5.2v13.6L18.6 12 8 5.2Z"/></svg>
        <svg class="pause-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z"/></svg>
      </button>
      <button class="skip forward" type="button" aria-label="Go forward 15 seconds">
        <svg aria-hidden="true" viewBox="0 0 36 36" fill="none"><path d="M25.5 11.5V5.8M25.5 5.8h5.7M25.5 5.8A14 14 0 1 0 31.8 19" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span>15</span>
      </button>
    </div>

    <div class="timeline">
      <input class="seek" type="range" min="0" max="0" step="0.1" value="0" aria-label="Audio position" />
      <div class="time-row" aria-hidden="true">
        <span class="current">0:00</span>
        <span class="duration">0:00</span>
      </div>
    </div>

    <div class="footer">
      <div class="speed-group" role="group" aria-label="Playback speed">
        <span class="speed-label">Speed</span>
        <button class="speed" type="button" data-rate="1" aria-pressed="true">1×</button>
        <button class="speed" type="button" data-rate="1.5" aria-pressed="false">1.5×</button>
        <button class="speed" type="button" data-rate="2" aria-pressed="false">2×</button>
      </div>
      <div class="links">
        <a class="transcript" hidden>Read transcript</a>
        <a class="download" download hidden>Download audio</a>
      </div>
    </div>

    <p class="status" role="status" aria-live="polite"></p>
  </section>
`;

export class MelAudioPlayer extends HTMLElement {
  static observedAttributes = ["src", "title", "eyebrow", "transcript", "download"];

  constructor() {
    super();
    this.attachShadow({ mode: "open" }).append(template.content.cloneNode(true));
    this.audio = this.shadowRoot.querySelector("audio");
    this.playButton = this.shadowRoot.querySelector(".play");
    this.seek = this.shadowRoot.querySelector(".seek");
    this.currentLabel = this.shadowRoot.querySelector(".current");
    this.durationLabel = this.shadowRoot.querySelector(".duration");
    this.briefLabel = this.shadowRoot.querySelector(".duration-label");
    this.status = this.shadowRoot.querySelector(".status");
    this.speedButtons = [...this.shadowRoot.querySelectorAll(".speed")];
    this.boundPauseOtherPlayers = (event) => {
      if (event.detail !== this && !this.audio.paused) this.audio.pause();
    };
  }

  connectedCallback() {
    this.setAttribute("role", "region");
    if (!this.hasAttribute("tabindex")) this.tabIndex = 0;
    this.syncAttributes();
    this.bindEvents();
    this.setPlaybackRate(this.readStoredRate());
    this.updateTimeline();
  }

  disconnectedCallback() {
    window.removeEventListener("mel-audio-player:play", this.boundPauseOtherPlayers);
  }

  attributeChangedCallback() {
    if (this.isConnected) this.syncAttributes();
  }

  bindEvents() {
    if (this.eventsBound) return;
    this.eventsBound = true;

    this.playButton.addEventListener("click", () => this.togglePlayback());
    this.shadowRoot.querySelector(".back").addEventListener("click", () => this.seekBy(-15));
    this.shadowRoot.querySelector(".forward").addEventListener("click", () => this.seekBy(15));

    this.seek.addEventListener("input", () => {
      this.audio.currentTime = Number(this.seek.value);
      this.updateTimeline();
    });
    this.seek.addEventListener("change", () => this.announce(`Moved to ${formatTime(this.audio.currentTime)}`));

    this.speedButtons.forEach((button) => {
      button.addEventListener("click", () => this.setPlaybackRate(button.dataset.rate, true));
    });

    ["loadedmetadata", "durationchange", "canplay", "timeupdate"].forEach((eventName) => {
      this.audio.addEventListener(eventName, () => this.updateTimeline());
    });
    ["play", "pause", "ended"].forEach((eventName) => {
      this.audio.addEventListener(eventName, () => this.updatePlayState());
    });
    this.audio.addEventListener("error", () => this.announce("Audio is unavailable. Use the transcript if provided."));
    this.addEventListener("keydown", (event) => this.handleKeyboard(event));
    window.addEventListener("mel-audio-player:play", this.boundPauseOtherPlayers);
  }

  syncAttributes() {
    const src = this.getAttribute("src") || "";
    if (this.audio.getAttribute("src") !== src) {
      this.audio.src = src;
      this.audio.load();
    }

    const title = this.getAttribute("title") || "Listen to this brief";
    this.shadowRoot.querySelector(".title").textContent = title;
    this.shadowRoot.querySelector(".eyebrow").textContent = this.getAttribute("eyebrow") || "Executive audio";
    this.setAttribute("aria-label", `${title} audio player`);

    this.syncLink(".transcript", "transcript");
    this.syncLink(".download", "download", src);
  }

  syncLink(selector, attribute, fallback = "") {
    const link = this.shadowRoot.querySelector(selector);
    const value = this.getAttribute(attribute);
    const href = value === "" ? fallback : value;
    link.hidden = !href;
    if (href) link.href = href;
    else link.removeAttribute("href");
  }

  async togglePlayback() {
    if (!this.audio.src) {
      this.announce("No audio source is available.");
      return;
    }

    if (this.audio.paused || this.audio.ended) {
      window.dispatchEvent(new CustomEvent("mel-audio-player:play", { detail: this }));
      try {
        await this.audio.play();
        this.announce("Audio playing");
      } catch {
        this.announce("Audio could not start. Try the play button again.");
      }
    } else {
      this.audio.pause();
      this.announce("Audio paused");
    }
  }

  seekBy(seconds) {
    const duration = Number.isFinite(this.audio.duration) ? this.audio.duration : 0;
    this.audio.currentTime = clamp(this.audio.currentTime + seconds, 0, duration || 0);
    this.updateTimeline();
    this.announce(`${seconds < 0 ? "Moved back" : "Moved forward"} 15 seconds to ${formatTime(this.audio.currentTime)}`);
  }

  setPlaybackRate(value, persist = false) {
    const rate = normalizePlaybackRate(value);
    this.audio.playbackRate = rate;
    this.audio.preservesPitch = true;
    this.audio.webkitPreservesPitch = true;

    this.speedButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(Number(button.dataset.rate) === rate));
    });

    if (persist) {
      try { localStorage.setItem("mel-audio-player:rate", String(rate)); } catch { /* storage is optional */ }
      this.announce(`Playback speed ${rate === 1 ? "normal" : `${rate} times`}`);
    }
  }

  readStoredRate() {
    try { return localStorage.getItem("mel-audio-player:rate") || 1; } catch { return 1; }
  }

  handleKeyboard(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.code === "Space" && event.target === this) {
      event.preventDefault();
      this.togglePlayback();
      return;
    }
    if (event.target !== this || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;

    event.preventDefault();
    const direction = event.key === "ArrowLeft" ? -1 : 1;
    this.seekBy(direction * (event.shiftKey ? 15 : 5));
  }

  updateTimeline() {
    const duration = Number.isFinite(this.audio.duration) ? this.audio.duration : 0;
    const current = Number.isFinite(this.audio.currentTime) ? this.audio.currentTime : 0;
    const progress = duration > 0 ? (current / duration) * 100 : 0;

    this.seek.max = String(duration || 0);
    this.seek.value = String(clamp(current, 0, duration || 0));
    this.seek.style.setProperty("--progress", `${progress}%`);
    this.seek.setAttribute("aria-valuetext", `${formatTime(current)} of ${formatTime(duration)}`);
    this.currentLabel.textContent = formatTime(current);
    this.durationLabel.textContent = formatTime(duration);
    this.briefLabel.textContent = duration > 0 ? `${formatTime(duration)} audio` : "Audio brief";
  }

  updatePlayState() {
    const playing = !this.audio.paused && !this.audio.ended;
    this.playButton.dataset.state = playing ? "playing" : "paused";
    this.playButton.setAttribute("aria-label", playing ? "Pause audio" : "Play audio");
    this.playButton.setAttribute("aria-pressed", String(playing));
  }

  announce(message) {
    this.status.textContent = "";
    requestAnimationFrame(() => { this.status.textContent = message; });
  }
}

if (!customElements.get("mel-audio-player")) {
  customElements.define("mel-audio-player", MelAudioPlayer);
}

export { PLAYBACK_RATES };

