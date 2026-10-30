import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ART, HAVE, type ArtKey } from "./art";

/* ══════════════════════════════════════════════════════════════
   Scene art layer: full-bleed generated image with a readability
   dim + slow Ken Burns drift, cross-fading between art keys.
   If an image is missing (not yet generated) or fails to load,
   it renders the provided vector fallback instead — the game is
   always complete.
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
