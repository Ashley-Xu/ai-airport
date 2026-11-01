import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Run1 from "./Run1";
import Run2, { type Run2Choices } from "./Run2";
import Dossier from "./Dossier";
import { AltitudeTrace } from "./Visuals";
import "./game.css";

/* ══════════════════════════════════════════════════════════════
   GAME shell: title → cold-open → Run 1 → Run 2 → dossier.
   Clip slots (§6 of the design): <ClipSlot name=... /> renders a
   generated video if present, else a code-drawn fallback. The game
   is complete without any clip.
   ══════════════════════════════════════════════════════════════ */

type Phase = "title" | "coldopen" | "run1" | "run2" | "dossier";

export default function Game({ onDeepDive, demo = false }: { onDeepDive: () => void; demo?: boolean }) {
  const [phase, setPhase] = useState<Phase>(() => {
    // test hooks: ?r2=<step> or ?r1=<scene> jump straight into that run (deterministic screenshots)
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search);
      if (q.has("r2")) return "run2";
      if (q.has("r1")) return "run1";
    }
    return demo ? "coldopen" : "title";
  });
  const [choices, setChoices] = useState<Run2Choices>({});
  const clockRef = useRef(0); // seconds within a run
  const [clock, setClock] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setClock(clockRef.current), 100);
    return () => clearInterval(id);
  }, []);

  const restart = () => { clockRef.current = 0; setChoices({}); setPhase("title"); };

  return (
    <div className="g-root">
      <ClipLayer phase={phase} />
      {phase !== "title" && phase !== "dossier" && (
        <div className="g-hud">
          <span className={`run ${phase === "run1" ? "today" : "ai"}`}>
            {phase === "run1" ? <>Run 1 · <b>The humans</b></> : phase === "run2" ? <>Run 2 · <b>The nervous system</b></> : <b>&nbsp;</b>}
          </span>
          {phase === "coldopen" && <span className="run">Prologue</span>}
          {(phase === "run1" || phase === "run2") && (
            <span className="clock">{fmtClock(clock)}</span>
          )}
          {phase === "coldopen" && (
            <button className="skip" onClick={() => setPhase("run1")}>Skip →</button>
          )}
        </div>
      )}

      <AnimatePresence mode={demo ? "sync" : "wait"}>
        {phase === "title" && <Title key="t" onBegin={() => setPhase("coldopen")} onDeepDive={onDeepDive} />}
        {phase === "coldopen" && <ColdOpen key="c" demo={demo} onDone={() => setPhase("run1")} />}
        {phase === "run1" && (
          <motion.div key="r1" style={{ position: "absolute", inset: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <Run1 demo={demo} clockRef={clockRef} onComplete={() => { clockRef.current = 0; setPhase("run2"); }} />
          </motion.div>
        )}
        {phase === "run2" && (
          <motion.div key="r2" style={{ position: "absolute", inset: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <Run2 demo={demo} clockRef={clockRef} onChoices={setChoices} onComplete={() => setPhase("dossier")} />
          </motion.div>
        )}
        {phase === "dossier" && (
          <motion.div key="d" style={{ position: "absolute", inset: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <Dossier onRestart={restart} onDeepDive={onDeepDive} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function fmtClock(s: number) {
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `T+${m}:${sec.toString().padStart(2, "0")}`;
}

/* ── Title ── */
function Title({ onBegin, onDeepDive }: { onBegin: () => void; onDeepDive: () => void }) {
  return (
    <motion.div className="g-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
      <div className="g-grid" />
      <div className="g-vig-teal" />
      <div className="g-title-screen">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
          <h1><span className="door">The Door</span> <span className="t0">· T+0</span></h1>
        </motion.div>
        <motion.div className="tag" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.9 }}>
          By the time you hear the alarm, the urgent steps are <span className="accent">already taken care of.</span>
        </motion.div>
        <motion.div className="sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75, duration: 0.9 }}>
          An AI-native airport · a decision simulation
        </motion.div>
        <motion.div className="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95, duration: 0.8 }}>
          <button className="g-btn big gold" onClick={onBegin}>Begin the shift</button>
          <div style={{ marginTop: 14 }}>
            <button className="g-btn ghost" style={{ fontSize: 12, padding: "9px 16px" }} onClick={onDeepDive}>or read the argument</button>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: 1 }}
          style={{ marginTop: 40, fontFamily: "var(--g-body)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--g-faint)" }}>
          ~4 min · two runs · based on a real event · no imagery of it
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ── Cold-open: abstract, no violence. Two numbers, an altitude trace, a door. ── */
function ColdOpen({ onDone, demo = false }: { onDone: () => void; demo?: boolean }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const f = demo ? 0.55 : 1; // faster in demo mode
    const t = [setTimeout(() => setStep(1), 2600 * f), setTimeout(() => setStep(2), 6000 * f),
      setTimeout(() => setStep(3), 9500 * f), setTimeout(onDone, 13000 * f)];
    return () => t.forEach(clearTimeout);
  }, [onDone, demo]);

  return (
    <motion.div className="g-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
      <div className="g-vig-dark" />
      <div className="g-center">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="0" exit={{ opacity: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <AltitudeTrace mode="dive" progress={1} />
              </div>
              <div className="g-beat">A door that only opens from one side.</div>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="1" exit={{ opacity: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              <div className="g-beat">2015: it kept the wrong man<br />at the controls. <span className="coral">150 dead.</span></div>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="2" exit={{ opacity: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              <div className="g-beat">Last month: it kept help outside.<br /><span className="teal">174 lived — by inches.</span></div>
            </motion.div>
          )}
          {step >= 3 && (
            <motion.div key="3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              <div className="g-title" style={{ fontSize: "clamp(30px,4.4vw,50px)", color: "var(--g-gold)" }}>
                Luck is not a safety system.
              </div>
              <div style={{ marginTop: 16, fontSize: 10.5, letterSpacing: "0.26em", textTransform: "uppercase", color: "var(--g-faint)", fontWeight: 500 }}>
                Run it again — with a nervous system
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── Clip slots: use a generated video if Ashley provides one, else nothing. ──
   Drop files at /public/clips/<name>.mp4 to activate. The game never depends
   on them. §6 of GAME-PROPOSAL.md lists the four slots and their specs.        */
function ClipLayer({ phase }: { phase: Phase }) {
  const map: Partial<Record<Phase, string>> = {
    title: "title-loop", coldopen: "coldopen", run1: "dive-texture", run2: "run2-ambient",
  };
  const name = map[phase];
  if (!name) return null;
  return (
    <video
      key={name}
      className="clip-slot"
      autoPlay loop muted playsInline
      onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = "none"; }}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.28, zIndex: 0, pointerEvents: "none" }}
      src={`/clips/${name}.mp4`}
    />
  );
}
