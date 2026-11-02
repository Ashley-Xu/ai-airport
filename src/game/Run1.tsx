import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlightDeck, AltitudeTrace, Figure } from "./Visuals";
import { ArtCross, preloadArt, PlateOverlay, plateActive, resetPlates } from "./SceneArt";
import { timeFrozen, startPausableTimeout } from "./time";
import { setBackHandler, setSkipHandler } from "./nav";
import type { ArtKey } from "./art";

preloadArt([
  "s1-captain", "s1-hand", "s1-door-open",
  "s2-passenger", "s2-fight", "s2-subdued",
  "s3-dive", "s3-interior", "s3-controls",
  "s4-pilots", "s4-landing", "s4-reunion",
]);

/* ══════════════════════════════════════════════════════════════
   RUN 1 — "The humans." First-person replay, character-switching.
   One font (JetBrains Mono via .g-root), one bottom DOCK per scene:
   objective + control + meters + key hint in a single panel, so
   there's exactly one place to look and one thing to do.
   ══════════════════════════════════════════════════════════════ */

type Scene = "intro" | "captain" | "passengers" | "controls" | "reveal" | "done";

export default function Run1({ onComplete, clockRef, demo = false }: { onComplete: () => void; clockRef: React.MutableRefObject<number>; demo?: boolean }) {
  const [scene, setScene] = useState<Scene>(() => {
    // test hook: ?r1=captain deep-links to a scene (deterministic screenshots)
    const s = new URLSearchParams(window.location.search).get("r1");
    const valid: Scene[] = ["intro", "captain", "passengers", "controls", "reveal"];
    return (s && valid.includes(s as Scene)) ? (s as Scene) : "intro";
  });
  const [history, setHistory] = useState<Scene[]>([]);
  const next = (s: Scene) => { setHistory((h) => [...h, scene]); setScene(s); };
  // Read from state (not an updater) — mutating scene inside a setHistory
  // updater would be a side effect that StrictMode double-invokes.
  const back = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setScene(prev);
    // the scene remounts with its own clean plate
    resetPlates();
    // reset the run clock so the HUD does not show a time ahead of the scene
    clockRef.current = 0;
  };

  // expose Back to the HUD while this run owns the screen
  useEffect(() => {
    setBackHandler(history.length > 0 && scene !== "done" ? back : null);
    return () => setBackHandler(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, scene]);

  // expose Skip-to-end: this run's ending is the REVEAL, which then plays out
  // and hands off to Run 2 — it does NOT jump to the dossier, or the whole
  // AI replay would be skipped by one click.
  useEffect(() => {
    const skip = () => { next("reveal"); resetPlates(); };
    setSkipHandler(scene !== "reveal" && scene !== "done" ? skip : null);
    return () => setSkipHandler(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  // A (re)started run plates every image again. Must happen during RENDER,
  // not in an effect: child effects (PlateOverlay setting lastPlatedArt) run
  // BEFORE parent effects, so an effect here would wipe the value the child
  // had just written and repeat-detection would never fire.
  const platesReset = useRef(false);
  if (!platesReset.current) { platesReset.current = true; resetPlates(); }

  useEffect(() => {
    if (scene !== "done") return;
    return startPausableTimeout(onComplete, demo ? 400 : 900);
  }, [scene, onComplete, demo]);

  return (
    <div className="g-stage">
      <div id="r1probe" data-scene={scene} style={{ display: "none" }} />
      <AnimatePresence mode={demo ? "sync" : "wait"}>
        {scene === "intro" && <Run1Intro key="intro" demo={demo} onNext={() => next("captain")} />}
        {scene === "captain" && <CaptainScene key="cap" demo={demo} onDone={() => next("passengers")} clockRef={clockRef} />}
        {scene === "passengers" && <PassengerScene key="pax" demo={demo} onDone={() => next("controls")} />}
        {scene === "controls" && <ControlsScene key="ctl" demo={demo} onDone={() => next("reveal")} />}
        {scene === "reveal" && <RevealScene key="rev" demo={demo} onDone={() => next("done")} />}
        {scene === "done" && <motion.div key="done" exit={{ opacity: 0 }} />}
      </AnimatePresence>
    </div>
  );
}

const fade = {
  initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

/* ── look beat: sync the image with the situation before the clock starts ── */
function LookBeat({ text }: { text: React.ReactNode }) {
  return (
    <motion.div className="g-brief"
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
      <span className="g-brief-k">Reading the scene</span>
      <div className="g-brief-t">{text}</div>
    </motion.div>
  );
}

/* ── shared dock shell ── */
function Dock({ objective, children, hint }: { objective: React.ReactNode; children: React.ReactNode; hint: React.ReactNode }) {
  return (
    <div className="g-dock">
      <div className="g-dock-obj"><span className="lab">Objective</span><span className="txt">{objective}</span></div>
      <div className="g-dock-main">{children}</div>
      <div className="g-dock-hint">{hint}</div>
    </div>
  );
}

function Meter({ name, pct, color, danger }: { name: string; pct: number; color: "coral" | "gold"; danger?: boolean }) {
  return (
    <div className={`g-meter-row ${danger ? "danger" : ""}`}>
      <span className="nm">{name}</span>
      <span className="bar"><i className={color} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} /></span>
      <span className="val">{Math.round(Math.max(0, Math.min(100, pct)))}%</span>
    </div>
  );
}

/* ── INTRO ── */
function Run1Intro({ onNext, demo = false }: { onNext: () => void; demo?: boolean }) {
  useEffect(() => { if (demo) { const t = setTimeout(onNext, 900); return () => clearTimeout(t); } }, [demo, onNext]);
  return (
    <motion.div className="g-center" {...fade}>
      <div className="g-vig-coral" />
      <div className="g-kicker coral">Run 1 · The humans</div>
      <div className="g-title" style={{ fontSize: "clamp(30px,4.6vw,52px)" }}>
        <br />a co-pilot attacked<br />the captain.
      </div>
      <p className="g-prose" style={{ margin: "24px auto 0" }}>
        Your roles: the captain, a passenger, the controls.
      </p>
      <div className="g-legend">
        <div className="li"><span className="k">HOLD</span><span className="t">keep pressing</span></div>
        <div className="li"><span className="k">TAP</span><span className="t">hit the mark</span></div>
        <div className="li"><span className="k">SPACE</span><span className="t">or use the key</span></div>
      </div>
      <div className="g-actions" style={{ marginTop: 34 }}>
        <button className="g-btn big gold" onClick={onNext}>Start →</button>
      </div>
      <div className="g-fineprint"></div>
    </motion.div>
  );
}

/* ── Scene 1: THE CAPTAIN — hold to unlock while strength drains ── */
function CaptainScene({ onDone, clockRef, demo = false }: { onDone: () => void; clockRef: React.MutableRefObject<number>; demo?: boolean }) {
  // clean plate: the picture alone first; nothing starts until it lifts
  const [plateArt, setPlateArt] = useState<ArtKey>("s1-captain");
  const [revealed, setRevealed] = useState(false);
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!revealed) return;
    return startPausableTimeout(() => setArmed(true), demo ? 700 : 2600);
  }, [demo, revealed]);
  const [strength, setStrength] = useState(100);
  const [ring, setRing] = useState(0);
  const [holding, setHolding] = useState(false);
  const [phase, setPhase] = useState<"struggle" | "beat">("struggle");
  const holdingRef = useRef(false);
  const ringRef = useRef(0);
  const strRef = useRef(100);
  const elapsed = useRef(0);
  const done = useRef(false);

  useEffect(() => {
    if (!demo || !armed || !revealed) return;
    holdingRef.current = true; setHolding(true);
    const id = setInterval(() => {
      if (timeFrozen()) return; // frozen: strength does not drain
      const dt = 0.2; elapsed.current += dt; clockRef.current = elapsed.current;
      strRef.current = Math.max(0, strRef.current - dt * (3.2 + elapsed.current * 0.22));
      setStrength(strRef.current);
      ringRef.current = Math.max(0, Math.min(100, ringRef.current + (10 + 34 * (strRef.current / 100)) * dt));
      setRing(ringRef.current);
      if ((ringRef.current >= 100 || elapsed.current > 12) && !done.current) {
        done.current = true; setRing(100); setPhase("beat"); clearInterval(id);
        setRevealed(false); setPlateArt("s1-door-open");   // new image -> clean plate
        startPausableTimeout(onDone, 1600 + 2850); // + door-open plate hold & fade
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, armed, revealed]);

  useEffect(() => {
    if (demo || !armed || !revealed) return;
    let raf = 0; let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      // frozen: keep the RAF alive but advance nothing. `last` is already
      // updated above, so unfreezing does not dump the whole frozen span
      // into one dt — strength resumes draining from where it stopped.
      if (timeFrozen()) { raf = requestAnimationFrame(loop); return; }
      elapsed.current += dt; clockRef.current = elapsed.current;
      strRef.current = Math.max(0, strRef.current - dt * (3.2 + elapsed.current * 0.22));
      setStrength(strRef.current);
      const rate = holdingRef.current ? (10 + 34 * (strRef.current / 100)) : -16;
      ringRef.current = Math.max(0, Math.min(100, ringRef.current + rate * dt));
      setRing(ringRef.current);
      if ((ringRef.current >= 100 || elapsed.current > 24) && !done.current) {
        done.current = true; ringRef.current = 100; setRing(100); setPhase("beat");
        setRevealed(false); setPlateArt("s1-door-open");   // new image -> clean plate
        startPausableTimeout(onDone, 3400 + 2850); return; // + door-open plate hold & fade
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [onDone, clockRef, armed, revealed]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.code === "Space") { e.preventDefault(); holdingRef.current = true; setHolding(true); } };
    const up = () => { holdingRef.current = false; setHolding(false); };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  const shake = strength < 40 ? (40 - strength) / 40 : 0;
  const vignette = 1 - strength / 100;
  const art: ArtKey = phase === "beat" ? "s1-door-open" : ring > 35 ? "s1-hand" : "s1-captain";
  const hold = () => { holdingRef.current = true; setHolding(true); };
  const release = () => { holdingRef.current = false; setHolding(false); };

  // the captain -> reaching-hand art switch gets its own clean plate
  useEffect(() => {
    if (phase === "struggle" && ring > 35) setPlateArt("s1-hand");
  }, [ring, phase]);

  return (
    <motion.div className="g-stage" {...fade}>
      <motion.div style={{ position: "absolute", inset: 0, zIndex: 2 }}
        animate={phase === "struggle" ? { x: [0, shake * 6, -shake * 5, shake * 4, 0], rotate: [0, shake * 0.6, -shake * 0.5, 0] } : {}}
        transition={{ duration: 0.4, repeat: phase === "struggle" ? Infinity : 0, repeatType: "mirror" }}>
        <ArtCross art={art} dim={armed || phase === "beat" ? 0.5 : 0.34}
          fallback={<FlightDeck doorOpen={phase === "beat" ? 1 : ring / 100 * 0.5} threat captainDown={phase === "beat"} highlightDoor={phase === "struggle"} paxAtDoor={phase === "beat" ? 3 : 0} />} />
      </motion.div>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3,
        background: `radial-gradient(ellipse at 50% 50%, transparent ${40 - vignette * 28}%, rgba(0,0,0,${0.35 + vignette * 0.55}) 100%)` }} />

      {revealed && <div className="g-scene-label">Scene <b style={{fontFamily:'var(--g-display)',fontSize:16,fontWeight:500,color:'var(--g-cyan)'}}>01</b> · In the air<span className="role coral">You are the captain</span></div>}

      <PlateOverlay art={plateArt} demo={demo} onReveal={() => setRevealed(true)} />
      {phase === "beat" ? (
        revealed ? (
          <motion.div className="g-center" style={{ zIndex: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
            <div className="g-beat">He reached the lock.<br /><span className="coral">Barely.</span></div>
            <div className="g-prose" style={{ margin: "16px auto 0", textAlign: "center" }}>Ten seconds later — unconscious — this door is a wall.</div>
          </motion.div>
        ) : null
      ) : !revealed ? null : !armed ? (
        <LookBeat text={<>T+1:05 · 38,000 ft. You are the captain. Stabbed. Fading. The door locks from the inside.</>} />
      ) : (
        <Dock objective="Unlock the flight-deck door"
          hint={<>Hold — or <span className="kbd">SPACE</span>. It slips as you fade.</>}>
          <button className={`g-holdbtn ${holding ? "on" : ""} ${ring >= 100 ? "done" : ""}`}
            onPointerDown={(e) => { e.preventDefault(); hold(); }} onPointerUp={release} onPointerLeave={release} onPointerCancel={release}>
            <HoldRingMini value={ring} />
            {ring >= 100 ? "Unlocked" : holding ? "Reaching the lock…" : "Hold to reach the lock"}
          </button>
          <div className="g-dock-meters">
            <Meter name="Remaining strength" pct={strength} color="coral" danger />
            <Meter name="Door unlocked" pct={ring} color="gold" />
          </div>
        </Dock>
      )}
    </motion.div>
  );
}

function HoldRingMini({ value }: { value: number }) {
  const R = 10, C = 2 * Math.PI * R;
  return (
    <svg className="ring" width="26" height="26" viewBox="0 0 26 26">
      <circle cx="13" cy="13" r={R} fill="none" stroke="rgba(212,175,106,0.2)" strokeWidth="3" />
      <circle cx="13" cy="13" r={R} fill="none" stroke={value >= 100 ? "var(--g-cyan)" : "var(--g-gold)"}
        strokeWidth="3" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - value / 100)} transform="rotate(-90 13 13)" />
    </svg>
  );
}

/* ── Scene 2: THE PASSENGERS — tap the timing bar ── */
function PassengerScene({ onDone, demo = false }: { onDone: () => void; demo?: boolean }) {
  // clean plate on every new image: the picture alone before anything sits on it
  const [plateArt, setPlateArt] = useState<ArtKey>("s2-passenger");
  const [revealed, setRevealed] = useState(false);
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!revealed) return;
    return startPausableTimeout(() => setArmed(true), demo ? 700 : 2600);
  }, [demo, revealed]);
  const [pos, setPos] = useState(0);
  const [hits, setHits] = useState(0);
  const [phase, setPhase] = useState<"struggle" | "beat">("struggle");
  const dir = useRef(1); const posRef = useRef(0);
  const HITS_NEEDED = 4;
  const done = useRef(false);
  const elapsed = useRef(0);

  useEffect(() => {
    if (!demo || !armed) return;
    let p = 0; let d = 1;
    const id = setInterval(() => {
      if (plateActive() || timeFrozen()) return; // picture alone, or time frozen
      p += d * 6; if (p > 100) { p = 100; d = -1; } if (p < 0) { p = 0; d = 1; }
      posRef.current = p; setPos(p);
      if (p > 40 && p < 60 && !done.current) {
        const h = hits + 1; setHits(h);
        if (h >= HITS_NEEDED) { done.current = true; finish(); }
      }
    }, 130);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, hits, armed]);

  useEffect(() => {
    if (demo || !armed) return;
    let raf = 0; let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!plateActive() && !timeFrozen()) {
      elapsed.current += dt;
      posRef.current += dir.current * dt * 78;
      if (posRef.current > 100) { posRef.current = 100; dir.current = -1; }
      if (posRef.current < 0) { posRef.current = 0; dir.current = 1; }
      setPos(posRef.current);
      if (elapsed.current > 20 && !done.current) { done.current = true; finish(); }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed]);

  function finish() {
    setPhase("beat"); setRevealed(false); setPlateArt("s2-subdued"); // new image -> clean plate
    startPausableTimeout(onDone, (demo ? 1400 : 3200) + 2850);
  }
  function tryHit() {
    if (phase !== "struggle" || done.current || !armed) return;
    if (posRef.current > 38 && posRef.current < 62) {
      const h = hits + 1; setHits(h);
      if (h >= HITS_NEEDED) { done.current = true; finish(); }
    } else setHits((v) => Math.max(0, v - 1));
  }
  useEffect(() => {
    // `armed` MUST be in the deps: the handler closes over `tryHit`, which
    // early-returns while `!armed`. Without it the effect registers once at
    // mount (armed=false) and never re-registers when the scene arms — so
    // every SPACE press was silently swallowed while mouse clicks worked
    // (the onClick path always uses the fresh closure from the current render).
    const k = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); tryHit(); }
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hits, phase, armed]);

  // the struggle art switch (passenger -> fight) gets its own clean plate
  useEffect(() => {
    if (phase === "struggle" && hits >= 2) setPlateArt("s2-fight");
  }, [hits, phase]);

  return (
    <motion.div className="g-stage" {...fade}>
      <motion.div style={{ position: "absolute", inset: 0, zIndex: 2 }}
        animate={phase === "struggle" ? { x: [0, 5, -4, 3, 0] } : {}}
        transition={{ duration: 0.35, repeat: phase === "struggle" ? Infinity : 0, repeatType: "mirror" }}>
        <ArtCross art={phase === "beat" ? "s2-subdued" : hits >= 2 ? "s2-fight" : "s2-passenger"} dim={armed || phase === "beat" ? 0.52 : 0.34}
          fallback={<FlightDeck doorOpen={1} threat={phase === "struggle"} attackerDown={phase === "beat"} paxAtDoor={2 + hits} />} />
      </motion.div>

      {revealed && <div className="g-scene-label">Scene <b style={{fontFamily:'var(--g-display)',fontSize:16,fontWeight:500,color:'var(--g-cyan)'}}>02</b> · In the cabin<span className="role coral">You are a passenger</span></div>}

      <PlateOverlay art={plateArt} demo={demo} onReveal={() => setRevealed(true)} />
      {phase === "beat" ? (
        revealed ? (
          <motion.div className="g-center" style={{ zIndex: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
            <div className="g-beat">Taken down.<br /><span className="coral">Still falling.</span></div>
            <div className="g-prose" style={{ margin: "16px auto 0", textAlign: "center" }}>And nobody here can fly it.</div>
          </motion.div>
        ) : null
      ) : !revealed ? null : !armed ? (
        <LookBeat text={<>Rows back. You are a passenger. The captain is down. The aircraft is still falling.</>} />
      ) : (
        <Dock objective="Get in and subdue the attacker"
          hint={<>Tap when the marker hits <b>HIT</b> — or <span className="kbd">SPACE</span>. 4 clean moves.</>}>
          <div className="g-tap" onClick={tryHit} style={{ cursor: "pointer" }}>
            <div className="g-tap-track">
              <div className="g-tap-zone" style={{ left: "38%", width: "24%" }} />
              <div className="g-tap-marker" style={{ left: `${pos}%` }} />
            </div>
            <div className="g-tap-pips">
              {Array.from({ length: HITS_NEEDED }).map((_, i) => (<div key={i} className={`pip ${i < hits ? "on" : ""}`} />))}
            </div>
          </div>
        </Dock>
      )}
    </motion.div>
  );
}

/* ── Scene 3: THE CONTROLS — keep pitch in the band ── */
function ControlsScene({ onDone, demo = false }: { onDone: () => void; demo?: boolean }) {
  // clean plate on every new image: the picture alone before anything sits on it
  const [plateArt, setPlateArt] = useState<ArtKey>("s3-dive");
  const [revealed, setRevealed] = useState(false);
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!revealed) return;
    return startPausableTimeout(() => setArmed(true), demo ? 700 : 2600);
  }, [demo, revealed]);
  const [pitch, setPitch] = useState(30);
  const [holding, setHolding] = useState(false);
  const [stable, setStable] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"struggle" | "beat">("struggle");
  const pitchRef = useRef(30); const holdRef = useRef(false); const stableRef = useRef(0);
  const done = useRef(false); const elapsed = useRef(0);
  const bandLo = 52, bandHi = 74;

  useEffect(() => {
    if (!demo || !armed) return;
    const id = setInterval(() => {
      if (plateActive() || timeFrozen()) return; // picture alone, or time frozen
      const dt = 0.2; elapsed.current += dt;
      const target = (bandLo + bandHi) / 2;
      holdRef.current = pitchRef.current < target; setHolding(holdRef.current);
      const wob = Math.sin(elapsed.current * 7) * 6;
      pitchRef.current += ((holdRef.current ? 78 : -46) + wob * (holdRef.current ? 0.6 : 1)) * dt;
      pitchRef.current = Math.max(0, Math.min(100, pitchRef.current));
      setPitch(pitchRef.current); setProgress(Math.min(1, elapsed.current / 10));
      const inBand = pitchRef.current > bandLo && pitchRef.current < bandHi;
      stableRef.current = Math.max(0, stableRef.current + (inBand ? dt : -dt * 1.6));
      setStable(stableRef.current);
      if ((stableRef.current > 3.2 || elapsed.current > 12) && !done.current) {
        done.current = true; setPhase("beat"); clearInterval(id);
        setRevealed(false); setPlateArt("s3-controls"); // new image -> clean plate
        startPausableTimeout(onDone, 1600 + 2850);
      }
    }, 200);
    return () => clearInterval(id);
  }, [demo, onDone, armed]);

  useEffect(() => {
    if (demo || !armed) return;
    let raf = 0; let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!plateActive() && !timeFrozen()) {
      elapsed.current += dt;
      const wob = Math.sin(elapsed.current * 7) * 6;
      pitchRef.current += ((holdRef.current ? 78 : -46) + wob * (holdRef.current ? 0.6 : 1)) * dt;
      pitchRef.current = Math.max(0, Math.min(100, pitchRef.current));
      setPitch(pitchRef.current); setProgress(Math.min(1, elapsed.current / 16));
      const inBand = pitchRef.current > bandLo && pitchRef.current < bandHi;
      stableRef.current = Math.max(0, stableRef.current + (inBand ? dt : -dt * 1.6));
      setStable(stableRef.current);
      if ((stableRef.current > 3.2 || elapsed.current > 18) && !done.current) {
        done.current = true; setPhase("beat");
        setRevealed(false); setPlateArt("s3-controls"); // new image -> clean plate
        startPausableTimeout(onDone, 3400 + 2850); return;
      }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [onDone, armed]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.code === "Space") { e.preventDefault(); holdRef.current = true; setHolding(true); } };
    const up = () => { holdRef.current = false; setHolding(false); };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  const hold = () => { holdRef.current = true; setHolding(true); };
  const release = () => { holdRef.current = false; setHolding(false); };
  // marker position in the horizontal bar: dive(left) .. climb(right); band mapped to 52..74 → 38%..62%
  const markPct = Math.max(0, Math.min(100, pitch));

  // the dive -> interior art switch gets its own clean plate
  useEffect(() => {
    if (phase === "struggle" && stable > 1.2) setPlateArt("s3-interior");
  }, [stable, phase]);

  return (
    <motion.div className="g-stage" {...fade}>
      <motion.div style={{ position: "absolute", inset: 0, zIndex: 2 }}
        animate={phase === "struggle" ? { rotate: [(100 - pitchRef.current) * -0.12, (100 - pitchRef.current) * -0.12 - 1.5, (100 - pitchRef.current) * -0.12 + 1.5], x: [0, 7, -6, 0] } : { rotate: 0 }}
        transition={{ duration: 0.5, repeat: phase === "struggle" ? Infinity : 0, repeatType: "mirror" }}>
        <ArtCross art={phase === "beat" ? "s3-controls" : stable > 1.2 ? "s3-interior" : "s3-dive"} dim={armed || phase === "beat" ? 0.5 : 0.34}
          kenburns={phase === "beat"}
          fallback={<div style={{ display: "grid", placeItems: "center", height: "100%" }}><AltitudeTrace mode={phase === "beat" ? "guarded" : "dive"} progress={progress} showSafeBand /></div>} />
      </motion.div>

      <PlateOverlay art={plateArt} demo={demo} onReveal={() => setRevealed(true)} />

      {revealed && <div className="g-scene-label">Scene <b style={{fontFamily:'var(--g-display)',fontSize:16,fontWeight:500,color:'var(--g-cyan)'}}>03</b> · At the controls<span className="role coral">You have never flown a plane</span></div>}

      {phase === "beat" ? (
        revealed ? (
          <motion.div className="g-center" style={{ zIndex: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
            <div className="g-beat"><span className="teal">Stabilized.</span><br />Not landed.</div>
            <div className="g-prose" style={{ margin: "16px auto 0", textAlign: "center" }}>Just no longer falling. Nobody here knows how to land it.</div>
          </motion.div>
        ) : null
      ) : !revealed ? null : !armed ? (
        <LookBeat text={<>Attacker down. Captain not getting up. The yoke is right here. The plane is diving 500 ft per sec.</>} />
      ) : (
        <Dock objective="Pull out of the dive — hold level flight"
          hint={<>Hold to pull up · release to fall · or <span className="kbd">SPACE</span>. Keep it in <b>LEVEL</b>.</>}>
          <button className={`g-holdbtn ${holding ? "on" : ""}`}
            onPointerDown={(e) => { e.preventDefault(); hold(); }} onPointerUp={release} onPointerLeave={release} onPointerCancel={release}>
            {holding ? "Pulling up…" : "Hold to pull up"}
          </button>
          <div className="g-pitch">
            <div className="g-pitch-track">
              <div className="g-pitch-band" style={{ left: `${bandLo}%`, width: `${bandHi - bandLo}%` }} />
              <div className="g-pitch-mark" style={{ left: `${markPct}%` }} />
            </div>
            <div className="g-pitch-ends"><span className="dive">▼ Dive</span><span>Level</span><span>Climb ▲</span></div>
          </div>
          <div className="g-dock-meters">
            <Meter name="Level flight held" pct={stable / 3.2 * 100} color="gold" />
          </div>
        </Dock>
      )}
    </motion.div>
  );
}

/* ── Scene 4: THE REVEAL ──
   Each of the three images gets its own clean plate; the beat text appears
   only after the picture has had the screen to itself, and the next image
   waits for that beat to land before it cuts. No timer can collide with a
   plate because the sequence is driven by the reveal event. */
function RevealScene({ onDone, demo = false }: { onDone: () => void; demo?: boolean }) {
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const dwell = demo ? 900 : 2400;   // how long the beat text reads before the next picture
  const last = step >= 3;
  const art: ArtKey = step === 0 ? "s4-pilots" : step === 1 ? "s4-landing" : "s4-reunion";

  // a new PICTURE needs a new plate; step 3 reuses the reunion image, so it
  // must not wait for a reveal that will never come
  useEffect(() => { setRevealed(false); }, [art]);

  // advance only after the current image has been revealed AND its beat has dwelled
  useEffect(() => {
    if (!revealed || last) return;
    return startPausableTimeout(() => setStep((s) => s + 1), dwell);
  }, [revealed, last, dwell]);

  // the closing title ("Luck is not a safety system") holds, then hands off
  useEffect(() => {
    if (!revealed || !last) return;
    return startPausableTimeout(onDone, demo ? 2600 : 4200);
  }, [revealed, last, onDone, demo]);

  return (
    <motion.div className="g-stage" {...fade}>
      <div className="g-vig-teal" />
      <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
        <ArtCross art={art} dim={step >= 2 ? 0.62 : 0.56}
          fallback={<div style={{ display: "grid", placeItems: "center", height: "100%", opacity: 0.5 }}><FlightDeck doorOpen={1} threat={false} attackerDown paxAtDoor={4} /></div>} />
      </div>
      {revealed && step === 0 && (
        <svg className="g-deck" viewBox="0 0 520 300" style={{ position: "absolute", width: "min(600px,88vw)", pointerEvents: "none", opacity: 0.9, zIndex: 3 }}>
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <Figure x={300} y={110} scale={1.1} color="var(--g-cyan)" />
            <Figure x={352} y={200} scale={1.1} color="var(--g-cyan)" />
            <circle className="node-ring ai" cx={300} cy={110} r="18" fill="none" stroke="var(--g-cyan)" strokeWidth="1.5" />
            <circle className="node-ring ai" cx={352} cy={200} r="18" fill="none" stroke="var(--g-cyan)" strokeWidth="1.5" />
          </motion.g>
        </svg>
      )}

      {revealed && <div className="g-scene-label">Scene <b style={{fontFamily:'var(--g-display)',fontSize:16,fontWeight:500,color:'var(--g-cyan)'}}>04</b> · The reveal</div>}
      <PlateOverlay art={art} demo={demo} onReveal={() => setRevealed(true)} />
      <motion.div className="g-center" style={{ zIndex: 6, marginTop: step >= 3 ? 120 : 0, transition: "margin 0.8s", opacity: revealed ? 1 : 0 }}
        initial={{ opacity: 0 }} animate={{ opacity: revealed ? 1 : 0 }} transition={{ duration: 0.8 }}>
        <AnimatePresence mode="wait">
          {revealed && step === 0 && (<motion.div key="s0" exit={{ opacity: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="g-beat">Two people stand up in the cabin and walk forward.</div></motion.div>)}
          {revealed && step === 1 && (<motion.div key="s1" exit={{ opacity: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="g-beat"><span className="teal">Two off-duty pilots.</span> By chance.</div></motion.div>)}
          {revealed && step === 2 && (<motion.div key="s2" exit={{ opacity: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="g-beat">They land it safely. <span className="teal">174 walk away.</span></div><div className="g-prose" style={{ margin: "16px auto 0", textAlign: "center" }}>A dying man's arm. A handful of strangers. Two licences that happened to be aboard.</div></motion.div>)}
          {revealed && step >= 3 && (
            <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="g-title" style={{ fontSize: "clamp(30px,4.4vw,52px)", color: "var(--g-gold)" }}>Luck is not a safety system.</div>
              <div style={{ marginTop: 16, fontSize: 10.5, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--g-faint)", fontWeight: 500 }}>Now run it again — with a nervous system</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
