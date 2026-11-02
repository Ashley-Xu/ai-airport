import { useSyncExternalStore } from "react";

/* ══════════════════════════════════════════════════════════════
   NAV — one Back button in the HUD that steps back through whatever
   run is currently on screen.

   Each run owns its own step/scene state, so rather than lifting that
   state into Game.tsx, the active run REGISTERS a back handler here and
   the HUD calls it. Same module-store pattern as time.ts / plateActive,
   which keeps the HUD dumb and each run in charge of its own history.

   `canBack` is tracked separately so the button can disable itself
   instead of silently doing nothing.
   ══════════════════════════════════════════════════════════════ */

type BackHandler = (() => void) | null;

let handler: BackHandler = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
};

/** Register (or clear) the current run's back handler. */
export function setBackHandler(fn: BackHandler) {
  handler = fn;
  emit();
}

/** Call the registered handler. No-op when there is nothing to go back to. */
export function goBack() {
  handler?.();
}

/** Reactive: is there anywhere to go back to? Drives the button's disabled state. */
export function useCanBack(): boolean {
  return useSyncExternalStore(subscribe, () => handler !== null, () => false);
}
