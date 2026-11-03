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

/**
 * Progression releases the freeze.
 *
 * Freeze exists so a presenter can talk over a screen without it walking itself
 * forward. That intent ENDS the moment they choose to move on — so every
 * forward transition calls this, and the next scene arrives live instead of
 * requiring a second click on Resume before anything happens. Without it a
 * presenter driving the whole piece has to press Freeze and then Resume at every
 * beat, which is exactly the fumble you cannot afford in front of a CEO.
 *
 * One helper rather than a `setFrozen(false)` at each call site so the rule is
 * stated once and greppable; both runs' transition functions route through it.
 *
 * Deliberately NOT called by `back()`: rewinding is a presenter move that often
 * happens mid-explanation, and the frozen banner stays visible above every layer,
 * so a frozen previous screen is recoverable without trapping anyone.
 *
 * No audio bookkeeping needed — the scheduler reads timeFrozen() live on every
 * tick, so releasing here lifts the duck and the 260 Hz lowpass by itself.
 */
export const unfreezeForAdvance = () => setFrozen(false);

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
