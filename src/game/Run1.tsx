import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlightDeck, AltitudeTrace, Figure } from "./Visuals";
import { ArtCross, preloadArt } from "./SceneArt";
import type { ArtKey } from "./art";

// warm the cache for every Run-1 image so scene transitions never flash
preloadArt([
  "s1-captain", "s1-hand", "s1-door-open",
  "s2-passenger", "s2-fight", "s2-subdued",
  "s3-dive", "s3-interior", "s3-controls",
  "s4-pilots", "s4-landing", "s4-reunion",
]);

/* ══════════════════════════════════════════════════════════════
   RUN 1 — "The humans." First-person replay, character-switching.
   Canonical path always succeeds (mirrors reality); mechanics make
   the player FEEL the difficulty. Emotion via mechanics, not gore.
   ══════════════════════════════════════════════════════════════ */

type Scene = "intro" | "captain" | "passengers" | "controls" | "reveal" | "done";

export default function Run1({ onComplete, clockRef, demo = false }: { onComplete: () => void; clockRef: React.MutableRefObject<number>; demo?: boolean }) {
  const [scene, setScene] = useState<Scene>("intro");
  const next = (s: Scene) => setScene(s);

  // hand off to Run 2 once the reveal finishes
  useEffect(() => {
    if (scene !== "done") return;
    const t = setTimeout(onComplete, demo ? 400 : 900);
    return () => clearTimeout(t);
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

function Run1Intro({ onNext, demo = false }: { onNext: () => void; demo?: boolean }) {
  useEffect(() => { if (demo) { const t = setTimeout(onNext, 900); return () => clearTimeout(t); } }, [demo, onNext]);
  return (
    <motion.div className="g-center" {...fade}>
      <div className="g-vig-coral" />
      <div className="g-kicker coral">Run 1 · The humans</div>
      <div className="g-title" style={{ fontSize: "clamp(30px,4.6vw,54px)" }}>
        Last month, on a Dubai–Tel Aviv flight,<br />a co-pilot attacked the captain.
      </div>
      <p style={{ marginTop: 22, fontSize: 17, color: "var(--ink-dim)", maxWidth: 620, margin: "22px auto 0", lineHeight: 1.65 }}>
        174 people landed safely. You are going to find out <em style={{ color: "var(--ink)" }}>why</em> — from
        inside it. You will be the captain, then a passenger, then the only hand on the
        controls. There is no experience that prepares you for any of it.
      </p>
      <div className="g-actions" style={{ marginTop: 36 }}>
        <button className="g-btn big gold" onClick={onNext}>Take his seat</button>
      </div>
      <div style={{ marginTop: 18, fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.1em", color: "var(--ink-faint)", textTransform: "uppercase" }}>
        Abstract depiction · no faces, no blood · grounded in a real event
      </div>
    </motion.div>
  );
}

/* ── Scene 1: THE CAPTAIN — hold to unlock while strength drains ── */
function CaptainScene({ onDone, clockRef, demo = false }: { onDone: () => void; clockRef: React.MutableRefObject<number>; demo?: boolean }) {
  const [strength, setStrength] = useState(100);
  const [ring, setRing] = useState(0);       // 0..100 unlock progress
  const [holding, setHolding] = useState(false);
  const [phase, setPhase] = useState<"struggle" | "beat">("struggle");
  const holdingRef = useRef(false);
  const ringRef = useRef(0);
  const strRef = useRef(100);
  const elapsed = useRef(0);
  const done = useRef(false);

  // demo: timer-driven simulation (RAF doesn't advance under headless virtual-time)
  useEffect(() => {
    if (!demo) return;
    holdingRef.current = true; setHolding(true);
    const id = setInterval(() => {
      const dt = 0.2; elapsed.current += dt; clockRef.current = elapsed.current;
      strRef.current = Math.max(0, strRef.current - dt * (3.2 + elapsed.current * 0.22));
      setStrength(strRef.current);
      ringRef.current = Math.max(0, Math.min(100, ringRef.current + (10 + 34 * (strRef.current / 100)) * dt));
      setRing(ringRef.current);
      if ((ringRef.current >= 100 || elapsed.current > 12) && !done.current) {
        done.current = true; setRing(100); setPhase("beat");
        clearInterval(id);
        setTimeout(onDone, 1600);
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo]);

  useEffect(() => {
    if (demo) return;
    let raf = 0; let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      elapsed.current += dt;
      clockRef.current = elapsed.current;

      // strength drains faster over time (you are dying)
      strRef.current = Math.max(0, strRef.current - dt * (3.2 + elapsed.current * 0.22));
      setStrength(strRef.current);

      // hold fills the ring; rate scales with remaining strength (min floor so it's winnable)
      const rate = holdingRef.current ? (10 + 34 * (strRef.current / 100)) : -16;
      ringRef.current = Math.max(0, Math.min(100, ringRef.current + rate * dt));
      setRing(ringRef.current);

      // failsafe: the captain reached the lock in reality — guarantee completion
      if ((ringRef.current >= 100 || elapsed.current > 24) && !done.current) {
        done.current = true; ringRef.current = 100; setRing(100);
        setPhase("beat");
        setTimeout(onDone, demo ? 1400 : 3400);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [onDone, clockRef]);

  // keyboard + pointer hold
  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); holdingRef.current = true; setHolding(true); } };
    const up = () => { holdingRef.current = false; setHolding(false); };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  const shake = strength < 40 ? (40 - strength) / 40 : 0;
  const vignette = 1 - strength / 100;
  // art progression: captain → bloody-hand POV as you reach → door opens
  const art: ArtKey = phase === "beat" ? "s1-door-open" : ring > 35 ? "s1-hand" : "s1-captain";

  return (
    <motion.div className="g-stage" {...fade}>
      <motion.div style={{ position: "absolute", inset: 0 }}
        animate={phase === "struggle" ? { x: [0, shake * 6, -shake * 5, shake * 4, 0], rotate: [0, shake * 0.6, -shake * 0.5, 0] } : {}}
        transition={{ duration: 0.4, repeat: phase === "struggle" ? Infinity : 0, repeatType: "mirror" }}>
        <ArtCross art={art} dim={0.45}
          fallback={
            <FlightDeck doorOpen={phase === "beat" ? 1 : ring / 100 * 0.5} threat captainDown={phase === "beat"}
              highlightDoor={phase === "struggle"} paxAtDoor={phase === "beat" ? 3 : 0} />
          } />
      </motion.div>

      {/* darkening vignette as strength fades */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 50% 50%, transparent ${40 - vignette * 28}%, rgba(0,0,0,${0.35 + vignette * 0.55}) 100%)` }} />

      <div className="g-scene-label">
        Scene 1 · In the air
        <span className="role coral">You are the captain</span>
      </div>

      {phase === "struggle" ? (
        <>
          <div className="g-meter-wrap">
            <div className="g-meter-label"><span>Remaining strength</span><span className="val">{Math.round(strength)}%</span></div>
            <div className="g-meter"><div className="g-meter-fill" style={{ width: `${strength}%` }} /></div>
          </div>
          <div className="g-prompt">
            <div className="instr">Stabbed. Bleeding. The door only opens from <span className="key">inside</span>.</div>
            <div className="hint">HOLD the ring — or hold SPACE — to reach the lock. It slips as you fade.</div>
          </div>
          <HoldRing value={ring} holding={holding}
            onDown={() => { holdingRef.current = true; setHolding(true); }}
            onUp={() => { holdingRef.current = false; setHolding(false); }} />
        </>
      ) : (
        <motion.div className="g-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
          <div className="g-beat">
            He reached the lock with his <span className="coral">remaining strength</span>.
            <br />Ten seconds earlier into unconsciousness — <span className="coral">this door is a wall.</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function HoldRing({ value, holding, onDown, onUp }: { value: number; holding: boolean; onDown: () => void; onUp: () => void }) {
  const R = 52, C = 2 * Math.PI * R;
  return (
    <div className={`g-hold ${value >= 100 ? "done" : ""}`}
      onPointerDown={(e) => { e.preventDefault(); onDown(); }}
      onPointerUp={onUp} onPointerLeave={onUp}
      onPointerCancel={onUp}>
      <svg width="132" height="132" viewBox="0 0 132 132">
        <circle cx="66" cy="66" r={R} fill="none" stroke="rgba(212,175,106,0.18)" strokeWidth="8" />
        <motion.circle cx="66" cy="66" r={R} fill="none"
          stroke={value >= 100 ? "var(--ai)" : "var(--gold)"} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - value / 100)}
          transform="rotate(-90 66 66)"
          style={{ filter: holding ? "drop-shadow(0 0 8px rgba(212,175,106,0.6))" : "none" }} />
      </svg>
      <div className="lab">{value >= 100 ? "UNLOCKED" : holding ? "HOLDING" : "HOLD"}</div>
    </div>
  );
}

/* ── Scene 2: THE PASSENGERS — timing bar, subdue the attacker ── */
function PassengerScene({ onDone, demo = false }: { onDone: () => void; demo?: boolean }) {
  const [pos, setPos] = useState(0);        // marker 0..100
  const [hits, setHits] = useState(0);
  const [phase, setPhase] = useState<"struggle" | "beat">("struggle");
  const dir = useRef(1); const posRef = useRef(0);
  const HITS_NEEDED = 4;
  const done = useRef(false);
  const elapsed = useRef(0);

  // demo: fully timer-driven (RAF doesn't advance under headless virtual-time)
  useEffect(() => {
    if (!demo) return;
    let p = 0; let d = 1;
    const id = setInterval(() => {
      p += d * 6; if (p > 100) { p = 100; d = -1; } if (p < 0) { p = 0; d = 1; }
      posRef.current = p; setPos(p);
      if (p > 40 && p < 60 && !done.current) {
        const h = hits + 1; setHits(h);
        if (h >= HITS_NEEDED) { done.current = true; finish(); }
      }
    }, 130);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, hits]);

  useEffect(() => {
    if (demo) return;
    let raf = 0; let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      elapsed.current += dt;
      posRef.current += dir.current * dt * 78;
      if (posRef.current > 100) { posRef.current = 100; dir.current = -1; }
      if (posRef.current < 0) { posRef.current = 0; dir.current = 1; }
      setPos(posRef.current);
      // failsafe: canonical success
      if (elapsed.current > 20 && !done.current) { done.current = true; finish(); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish() {
    setPhase("beat");
    setTimeout(onDone, demo ? 1400 : 3200);
  }
  function tryHit() {
    if (phase !== "struggle" || done.current) return;
    // zone is the middle band
    if (posRef.current > 38 && posRef.current < 62) {
      const h = hits + 1; setHits(h);
      if (h >= HITS_NEEDED) { done.current = true; finish(); }
    } else {
      setHits((v) => Math.max(0, v - 1));
    }
  }
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); tryHit(); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hits, phase]);

  return (
    <motion.div className="g-stage" {...fade}>
      <motion.div style={{ position: "absolute", inset: 0 }}
        animate={phase === "struggle" ? { x: [0, 5, -4, 3, 0] } : {}}
        transition={{ duration: 0.35, repeat: phase === "struggle" ? Infinity : 0, repeatType: "mirror" }}>
        <ArtCross art={phase === "beat" ? "s2-subdued" : hits >= 2 ? "s2-fight" : "s2-passenger"} dim={0.5}
          fallback={
            <FlightDeck doorOpen={1} threat={phase === "struggle"} attackerDown={phase === "beat"}
              paxAtDoor={2 + hits} />
          } />
      </motion.div>

      <div className="g-scene-label">
        Scene 2 · In the cabin
        <span className="role coral">You are a passenger</span>
      </div>

      {phase === "struggle" ? (
        <>
          <div className="g-timing" onClick={tryHit} style={{ cursor: "pointer" }}>
            <div className="g-timing-track">
              <div className="g-timing-zone" style={{ left: "38%", width: "24%" }} />
              <div className="g-timing-marker" style={{ left: `${pos}%` }} />
            </div>
            <div className="g-timing-hits">
              {Array.from({ length: HITS_NEEDED }).map((_, i) => (
                <div key={i} className={`pip ${i < hits ? "on" : ""}`} />
              ))}
            </div>
          </div>
          <div className="g-prompt">
            <div className="instr">The door is open. Go in. <span className="key">Others are behind you.</span></div>
            <div className="hint">TAP / SPACE when the marker is in the band — 4 clean moves subdue him</div>
          </div>
        </>
      ) : (
        <motion.div className="g-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
          <div className="g-beat">
            Taken down. But the aircraft is still falling — and{" "}
            <span className="coral">nobody up here can fly it.</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ── Scene 3: THE CONTROLS — keep pitch in a shrinking band ── */
function ControlsScene({ onDone, demo = false }: { onDone: () => void; demo?: boolean }) {
  const [pitch, setPitch] = useState(30);    // 0 (dive) .. 100 (climb); safe ~ 55..75
  const [holding, setHolding] = useState(false);
  const [stable, setStable] = useState(0);   // cumulative seconds in band
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"struggle" | "beat">("struggle");
  const pitchRef = useRef(30); const holdRef = useRef(false); const stableRef = useRef(0);
  const done = useRef(false); const elapsed = useRef(0);
  const bandLo = 52, bandHi = 74;

  // demo: fully timer-driven simulation (RAF doesn't advance under headless virtual-time)
  useEffect(() => {
    if (!demo) return;
    const id = setInterval(() => {
      const dt = 0.2;
      elapsed.current += dt;
      const target = (bandLo + bandHi) / 2;
      holdRef.current = pitchRef.current < target;
      setHolding(holdRef.current);
      const wob = Math.sin(elapsed.current * 7) * 6;
      pitchRef.current += ((holdRef.current ? 78 : -46) + wob * (holdRef.current ? 0.6 : 1)) * dt;
      pitchRef.current = Math.max(0, Math.min(100, pitchRef.current));
      setPitch(pitchRef.current);
      setProgress(Math.min(1, elapsed.current / 10));
      const inBand = pitchRef.current > bandLo && pitchRef.current < bandHi;
      stableRef.current = Math.max(0, stableRef.current + (inBand ? dt : -dt * 1.6));
      setStable(stableRef.current);
      if ((stableRef.current > 3.2 || elapsed.current > 12) && !done.current) {
        done.current = true; setPhase("beat"); clearInterval(id); setTimeout(onDone, 1600);
      }
    }, 200);
    return () => clearInterval(id);
  }, [demo, onDone]);

  useEffect(() => {
    if (demo) return;
    let raf = 0; let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      elapsed.current += dt;
      // gravity pulls toward dive; holding pulls up — oversensitive, wobbly
      const wob = Math.sin(elapsed.current * 7) * 6;
      pitchRef.current += ((holdRef.current ? 78 : -46) + wob * (holdRef.current ? 0.6 : 1)) * dt;
      pitchRef.current = Math.max(0, Math.min(100, pitchRef.current));
      setPitch(pitchRef.current);
      setProgress(Math.min(1, elapsed.current / 16));

      const inBand = pitchRef.current > bandLo && pitchRef.current < bandHi;
      stableRef.current = Math.max(0, stableRef.current + (inBand ? dt : -dt * 1.6));
      setStable(stableRef.current);

      if ((stableRef.current > 3.2 || elapsed.current > 18) && !done.current) {
        done.current = true; setPhase("beat"); setTimeout(onDone, 3400); return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.code === "Space") { e.preventDefault(); holdRef.current = true; setHolding(true); } };
    const up = () => { holdRef.current = false; setHolding(false); };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  // vertical indicator position: pitch 0 = bottom, 100 = top
  const yPos = 100 - pitch;

  return (
    <motion.div className="g-stage" {...fade}>
      <motion.div style={{ position: "absolute", inset: 0 }}
        animate={phase === "struggle" ? { rotate: [(100 - pitchRef.current) * -0.12, (100 - pitchRef.current) * -0.12 - 1.5, (100 - pitchRef.current) * -0.12 + 1.5], x: [0, 7, -6, 0] } : { rotate: 0 }}
        transition={{ duration: 0.5, repeat: phase === "struggle" ? Infinity : 0, repeatType: "mirror" }}>
        <ArtCross art={phase === "beat" ? "s3-controls" : stable > 1.2 ? "s3-interior" : "s3-dive"} dim={0.5}
          kenburns={phase === "beat"}
          fallback={<div style={{ display: "grid", placeItems: "center", height: "100%" }}><AltitudeTrace mode={phase === "beat" ? "guarded" : "dive"} progress={progress} showSafeBand /></div>} />
      </motion.div>

      {/* vertical pitch ladder */}
      <div className="g-alt-band">
        <svg width="120" height="300" viewBox="0 0 120 300">
          <rect x="20" y={300 - bandHi * 3} width="80" height={(bandHi - bandLo) * 3} fill="rgba(79,209,197,0.12)" stroke="rgba(79,209,197,0.3)" />
          <motion.rect x="10" width="100" height="6" rx="3" fill="var(--today)"
            animate={{ y: 300 - yPos * 3 - 3 }} transition={{ duration: 0.05, ease: "linear" }} />
          <text x="60" y="20" textAnchor="middle" className="lbl" fill="var(--ink-faint)" style={{ fontFamily: "var(--mono)", fontSize: 9 }}>PITCH</text>
        </svg>
      </div>

      <div className="g-scene-label">
        Scene 3 · At the controls
        <span className="role coral">You have never flown a plane</span>
      </div>

      {phase === "struggle" ? (
        <>
          <div className="g-meter-wrap">
            <div className="g-meter-label"><span>Holding level flight</span><span className="val" style={{ color: "var(--ai)" }}>{Math.max(0, Math.round(stable / 3.2 * 100))}%</span></div>
            <div className="g-meter" style={{ borderColor: "var(--ai-line)", background: "rgba(79,209,197,0.1)" }}>
              <div className="g-meter-fill" style={{ width: `${Math.min(100, stable / 3.2 * 100)}%`, background: "linear-gradient(90deg,#2b8f88,var(--ai))" }} />
            </div>
          </div>
          <div className="g-prompt">
            <div className="instr">14,000 feet in 30 seconds. <span className="key">Pull it out.</span></div>
            <div className="hint">HOLD to pull up · RELEASE to let it fall · keep the marker in the band</div>
          </div>
          <div className="g-dive">
            <button className="g-btn gold" onPointerDown={(e) => { e.preventDefault(); holdRef.current = true; setHolding(true); }}
              onPointerUp={() => { holdRef.current = false; setHolding(false); }}
              onPointerLeave={() => { holdRef.current = false; setHolding(false); }}
              style={{ transform: holding ? "scale(0.96)" : "none" }}>
              {holding ? "PULLING UP…" : "HOLD TO PULL UP"}
            </button>
          </div>
        </>
      ) : (
        <motion.div className="g-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
          <div className="g-beat">
            <span className="teal">Stabilized.</span> Not landed — just no longer falling.
            <br />And nobody alive up here knows how to land it.
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ── Scene 4: THE REVEAL — two off-duty pilots ── */
function RevealScene({ onDone, demo = false }: { onDone: () => void; demo?: boolean }) {
  const F = demo ? 0.4 : 1;
  useEffect(() => { const t = setTimeout(onDone, 13000 * F); return () => clearTimeout(t); }, [onDone, F]);
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 2200 * F);
    const t2 = setTimeout(() => setStep(2), 5200 * F);
    const t3 = setTimeout(() => setStep(3), 8600 * F);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [F]);

  const art: ArtKey = step === 0 ? "s4-pilots" : step === 1 ? "s4-landing" : "s4-reunion";

  return (
    <motion.div className="g-stage" {...fade}>
      <div className="g-vig-teal" />
      <ArtCross art={art} dim={step >= 2 ? 0.6 : 0.55}
        fallback={<div style={{ display: "grid", placeItems: "center", height: "100%", opacity: 0.5 }}><FlightDeck doorOpen={1} threat={false} attackerDown paxAtDoor={4} /></div>} />
      {/* two off-duty pilot figures highlighted (over art or fallback) */}
      {step === 0 && (
        <svg className="g-deck" viewBox="0 0 520 300" style={{ position: "absolute", width: "min(620px,90vw)", pointerEvents: "none", opacity: 0.9 }}>
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <Figure x={300} y={110} scale={1.1} color="var(--ai)" />
            <Figure x={352} y={200} scale={1.1} color="var(--ai)" />
            <circle className="node-ring ai" cx={300} cy={110} r="18" fill="none" stroke="var(--ai)" strokeWidth="1.5" />
            <circle className="node-ring ai" cx={352} cy={200} r="18" fill="none" stroke="var(--ai)" strokeWidth="1.5" />
          </motion.g>
        </svg>
      )}

      <div className="g-scene-label">Scene 4 · The reveal</div>
      <motion.div className="g-center" style={{ marginTop: step >= 3 ? 200 : step >= 1 ? 180 : 0, transition: "margin 0.8s" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" exit={{ opacity: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="g-beat">Two people stand up from the cabin and walk to the flight deck.</div>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="s1" exit={{ opacity: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="g-beat">They are <span className="teal">two off-duty pilots</span>. They were sitting in the cabin. By chance.</div>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="s2" exit={{ opacity: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="g-beat">They land it safely. 174 people walk away — because of a dying man's arm, a handful of strangers, and two licences that <span className="coral">happened to be aboard.</span></div>
            </motion.div>
          )}
          {step >= 3 && (
            <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="g-title" style={{ fontSize: "clamp(26px,4vw,46px)", color: "var(--gold)", fontStyle: "italic" }}>
                Luck is not a safety system.
              </div>
              <div style={{ marginTop: 18, fontFamily: "var(--mono)", fontSize: 11.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-faint)" }}>
                Now run it again — with a nervous system
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
