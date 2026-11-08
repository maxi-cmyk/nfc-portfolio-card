// Window state that is not a place: which windows are minimized to their
// desktop icon (and where they were), and which are zoomed. Pure.

// Minimizing a window parks its URL under its icon; opening that icon again
// restores exactly where you were.
export function createWindowMemory() {
  const parked = new Map();
  return {
    minimize(key, hash) {
      parked.set(key, hash);
    },
    restore(key) {
      const hash = parked.get(key) ?? null;
      parked.delete(key);
      return hash;
    },
    clear(key) {
      parked.delete(key);
    },
    has: (key) => parked.has(key),
    keys: () => [...parked.keys()],
  };
}

export function parseZoomed(raw) {
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value)
      ? value.filter((item) => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function toggleZoomed(list, scene) {
  return list.includes(scene)
    ? list.filter((item) => item !== scene)
    : [...list, scene];
}
