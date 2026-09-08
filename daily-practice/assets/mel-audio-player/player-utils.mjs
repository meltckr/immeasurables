export const PLAYBACK_RATES = Object.freeze([1, 1.5, 2]);

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const wholeSeconds = Math.floor(seconds);
  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const remainder = String(wholeSeconds % 60).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${remainder}`;
  }

  return `${minutes}:${remainder}`;
}

export function normalizePlaybackRate(value) {
  const requested = Number(value);
  return PLAYBACK_RATES.includes(requested) ? requested : 1;
}

