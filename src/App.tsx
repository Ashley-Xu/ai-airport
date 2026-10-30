import { useEffect, useState } from "react";
import Game from "./game/Game";
import DeepDive from "./DeepDive";
import "./index.css";

/* ══════════════════════════════════════════════════════════════
   Router: the GAME is the primary experience; the scroll-page
   ("deep-dive") is the full argument in prose. A floating toggle
   switches between them. Both share story, palette, type, SVGs.
   ══════════════════════════════════════════════════════════════ */

type View = "game" | "deepdive";

export default function App() {
  const [view, setView] = useState<View>("game");
  // ?demo=1 → auto-play the game (for automated verification / live-drive fallback)
  const demo = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("demo");

  // hash routing so ?deepdive / #deepdive opens the argument directly
  useEffect(() => {
    const h = (window.location.hash + window.location.search).toLowerCase();
    if (h.includes("deepdive") || h.includes("argument")) setView("deepdive");
  }, []);

  const go = (v: View) => {
    setView(v);
    try { window.history.replaceState(null, "", v === "deepdive" ? "#deepdive" : "#"); } catch { /* noop */ }
    window.scrollTo(0, 0);
  };

  return (
    <>
      {view === "game" ? <Game demo={demo} onDeepDive={() => go("deepdive")} /> : <DeepDive />}
      <div className="view-toggle">
        <button className={view === "game" ? "on" : ""} onClick={() => go("game")}>Game</button>
        <button className={view === "deepdive" ? "on" : ""} onClick={() => go("deepdive")}>Argument</button>
      </div>
    </>
  );
}
