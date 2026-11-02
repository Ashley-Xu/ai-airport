import { useSyncExternalStore } from "react";

/* ══════════════════════════════════════════════════════════════
   TIME FREEZE — a global pause for the whole experience.

   Built for driving this live in front of a CEO: freeze the clock so
   nothing advances, no mechanic drains, and the AI's confirm window
   does not expire while you are mid-sentence. Everything that drives
   progression goes through `startPausableTimeout` or checks
   `timeFrozen()` inside its tick, so there is one switch, not twenty.

   Note this pauses *game* time only. React still renders, framer
   still animates; nothing visually snaps when you toggle it.
   ══════════════════════════════════════════════════════════════ */

let frozen = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
};

/** Non-reactive read — use inside tick loops and callbacks. */
export const timeFrozen = () => frozen;

/** Reactive read — for UI that shows the frozen state. */
export function useFrozen(): boolean {
  return useSyncExternalStore(subscribe, () => frozen, () => false);
}

export function setFrozen(v: boolean) {
  if (frozen === v) return;
  frozen = v;
  emit();
}

export const toggleFrozen = () => setFrozen(!frozen);

const TICK = 50;

/**
 * setTimeout whose budget only burns while time is unfrozen. Drop-in
 * replacement: returns a cancel function. Implemented with an interval
 * rather than Date.now() deltas across a single timeout, so a freeze of
 * any length simply extends the wait instead of firing late-but-at-once.
 */
export function startPausableTimeout(fn: () => void, ms: number): () => void {
  let remaining = ms;
  let last = Date.now();
  const id = setInterval(() => {
    const now = Date.now();
    const dt = now - last;
    last = now;
    if (frozen) return;                 // budget does not advance while frozen
    remaining -= dt;
    if (remaining <= 0) { clearInterval(id); fn(); }
  }, TICK);
  return () => clearInterval(id);
}
