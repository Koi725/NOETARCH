// localStorage-guarded "shown once" tracking for tours.
// Every access is try/catch-guarded so private browsing / blocked storage never breaks
// the UI — a failed read simply behaves as "not seen yet", a failed write is ignored.

const PREFIX = "noetarch.tour.";

export function hasSeenTour(key: string): boolean {
  try {
    return window.localStorage.getItem(PREFIX + key) === "seen";
  } catch {
    return false;
  }
}

export function markTourSeen(key: string): void {
  try {
    window.localStorage.setItem(PREFIX + key, "seen");
  } catch {
    // Ignore — storage being unavailable must not prevent the app from rendering.
  }
}

export function resetTourSeen(key: string): void {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // Ignore.
  }
}
