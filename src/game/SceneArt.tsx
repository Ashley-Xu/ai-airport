import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ART, HAVE, type ArtKey } from "./art";

/* ══════════════════════════════════════════════════════════════
   Scene art layer: full-bleed generated image with a readability
   dim + slow Ken Burns drift, cross-fading between art keys.
   If an image is missing (not yet generated) or fails to load,
   it renders the provided vector fallback instead — the game is
   always complete.

   CLEAN PLATE: before any image is used as a game background or
   gets text on it, it is shown alone — full brightness, nothing
   overlaid, HUD hidden — for PLATE_MS. Then the scene layers in.
   ══════════════════════════════════════════════════════════════ */

const loaded: Record<string, boolean> = {};

/** Warm the image cache so scene transitions don't flash. */
export function preloadArt(keys: ArtKey[]) {
  if (typeof window === "undefined") return;
  keys.forEach((k) => {
    const src = ART[k];
    if (HAVE[k] && !loaded[src]) {
      loaded[src] = true;
      const img = new Image();
      img.src = src;
    }
  });
}

export function ArtCross({
  art, dim = 0.5, fallback, kenburns = true,
}: {
  art: ArtKey;
  dim?: number;          // mid-frame darkness (0..1); bottom is always heavier for HUD text
  fallback?: React.ReactNode;
  kenburns?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const have = HAVE[art] && !failed;

  // reset the failed flag when the key changes
  useEffect(() => setFailed(false), [art]);

  return (
    <div className="g-art-layer">
      {!have && fallback !== undefined && <div className="g-art-fallback">{fallback}</div>}
      <AnimatePresence>
        {have && (
          <motion.div key={art} className="g-art-wrap"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
            <img className={`g-art${kenburns ? " kb" : ""}`} src={ART[art]} alt=""
              draggable={false} onError={() => setFailed(true)} />
            <div className="g-art-dim" style={{
              background: `linear-gradient(180deg, rgba(5,7,12,0.62) 0%, rgba(5,7,12,${dim}) 48%, rgba(5,7,12,0.86) 100%)`,
            }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CLEAN PLATE — the image alone, full brightness, nothing on it.
   Shown for a few seconds before the scene layers text/HUD over
   it. A tiny module-level store lets the HUD hide itself and the
   mechanic loops pause while a plate is up, without prop-drilling.
   ══════════════════════════════════════════════════════════════ */

let plateCount = 0;
const plateListeners = new Set<() => void>();
function subscribePlate(cb: () => void) { plateListeners.add(cb); return () => { plateListeners.delete(cb); }; }
function notifyPlate() { plateListeners.forEach((l) => l()); }

/** true while any clean plate is on screen (HUD hides itself). */
export function usePlateActive(): boolean {
  return useSyncExternalStore(subscribePlate, () => plateCount > 0, () => false);
}

/** Non-reactive read, for pausing mechanic loops while a plate is up. */
export const plateActive = () => plateCount > 0;

/** Hold duration for a clean plate. Shorter in demo/auto-drive mode. */
export const plateMs = (demo?: boolean, base = 2200) => (demo ? Math.round(base * 0.35) : base);

const FADE_MS = 650;

/**
 * The clean plate itself: an opaque full-bleed image at FULL brightness
 * (no dim, no vignette, no text, no HUD) that holds, then fades away to
 * reveal the scene underneath. Re-runs whenever `art` changes, so every
 * newly-shown image gets its moment alone. Skips itself if art is missing.
 *
 * `onReveal` fires when the fade BEGINS — that's the cue for the scene to
 * start its own staging (captions, mechanics, HUD).
 */
export function PlateOverlay({ art, demo, ms, onReveal }: {
  art?: ArtKey; demo?: boolean; ms?: number; onReveal?: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const have = !!art && HAVE[art] && !failed;
  const hold = ms ?? plateMs(demo);

  // reset when the image changes so each new picture gets its own plate
  useEffect(() => setFailed(false), [art]);

  const [phase, setPhase] = useState<"up" | "fade" | "gone">(have ? "up" : "gone");
  const revealRef = useRef(onReveal); revealRef.current = onReveal;

  // re-trigger on every art change: each newly-shown image gets its own plate
  useEffect(() => {
    if (!have) { setPhase("gone"); return; }
    setPhase("up");
    const t1 = setTimeout(() => setPhase("fade"), hold);
    const t2 = setTimeout(() => setPhase("gone"), hold + FADE_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [have, hold, art]);

  useEffect(() => {
    // "gone" also covers the skip case (missing/failed art) — the scene must
    // still be told to start, otherwise it waits for a plate that never lifts
    if (phase === "fade" || phase === "gone") revealRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // register only while the plate actually covers the screen
  useEffect(() => {
    if (phase !== "up") return;
    plateCount += 1; notifyPlate();
    return () => { plateCount -= 1; notifyPlate(); };
  }, [phase]);

  if (!have || phase === "gone") return null;
  return (
    <motion.div className="g-plate"
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === "up" ? 1 : 0 }}
      transition={{ duration: phase === "up" ? 0.45 : FADE_MS / 1000, ease: [0.22, 1, 0.36, 1] }}>
      <img className="g-plate-img" src={ART[art!]} alt="" draggable={false} onError={() => setFailed(true)} />
    </motion.div>
  );
}

/**
 * Convenience wrapper: renders the scene, with its clean plate on top.
 * The scene mounts immediately (so its entrance animation composes behind
 * the opaque plate) but stays invisible until the plate lifts.
 */
export function Plated({ art, demo, ms, onReveal, children }: {
  art?: ArtKey; demo?: boolean; ms?: number; onReveal?: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <PlateOverlay art={art} demo={demo} ms={ms} onReveal={onReveal} />
    </>
  );
}
