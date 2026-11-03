import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Run1 from "./Run1";
import Run2, { type Run2Choices } from "./Run2";
import Dossier from "./Dossier";
import { usePlateActive } from "./SceneArt";
import { useFrozen, toggleFrozen, setFrozen, unfreezeForAdvance } from "./time";
import { goBack, useCanBack, skipToRunEnd, useCanSkip } from "./nav";
import { sound, useAudioOn } from "./audio";
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
  const plateActiveFlag = usePlateActive(); // hide HUD while a clean plate is up
  const frozen = useFrozen();               // global time freeze
  const canBack = useCanBack();             // is there a previous step to return to
  const canSkip = useCanSkip();             // does the active run still have an ending to skip to
  const audioOn = useAudioOn();             // HUD mute toggle state

  /* Soundscape ownership: Game drives only the phases where NO run is mounted
     (title, cold open, dossier). Run1 and Run2 own their own per-scene/per-step
     beds — and because React runs child effects AFTER parent effects, a phase
     map here would clobber the bed the run set on mount (this bug showed up as
     ?r1=controls playing r1_intro). So run1/run2 are deliberately absent: on
     the phase change into a run, the run's own mount effect sets the bed. */
  useEffect(() => {
    if (phase === "title") { sound.setScene("title"); sound.setIntensity({ heart: 0, wind: 0, tension: 0 }); }
    else if (phase === "coldopen") sound.setScene("coldopen");
    else if (phase === "dossier") { sound.setScene("off"); sound.setIntensity({ heart: 0, wind: 0, tension: 0 }); }
  }, [phase]);

  useEffect(() => {
    const id = setInterval(() => setClock(clockRef.current), 100);
    return () => clearInterval(id);
  }, []);

  // `frozen` lives in module scope so any scene can read it cheaply, but that
  // means it outlives this component: switching to ARGUMENT unmounts the game
  // and switching back remounted it still frozen — every screen then sat
  // motionless with no visible cause and no way out. Always start live.
  useEffect(() => { setFrozen(false); }, []);

  // A fresh playthrough starts live — don't carry a freeze from the last run.
  const restart = () => { clockRef.current = 0; setChoices({}); setFrozen(false); setPhase("title"); };

  /* Phase changes are progression too, and they bypass both runs' transition
     functions (the cold open's Skip, Run 1 → Run 2, Run 2 → dossier). Route
     them through the same rule so a presenter who freezes, talks, then clicks
     "See the outcome & the risks" arrives at the dossier live. Without this the
     module-level flag would stay true across the handoff — invisible there,
     because the banner is deliberately suppressed on title and dossier, so the
     next run would open paused with no obvious cause. */
  const goPhase = (p: Phase) => { unfreezeForAdvance(); setPhase(p); };

  /* Skip to the END OF THE CURRENT RUN — not to the dossier. The active run
     registers its own endpoint (Run 1 → the reveal, Run 2 → the outcome
     screen) via nav.ts, same pattern as Back. The HUD stays dumb and cannot
     skip the wrong thing: jumping straight to the dossier from Run 1 would
     have silently swallowed the entire AI replay.
     Still unfreezes, because both endings are pausable screens — landing on
     one while frozen would strand the player on a timer that never runs. */
  const skipToEnd = () => { setFrozen(false); skipToRunEnd(); };

  // phase-aware tooltip: says which ending it actually goes to
  const skipTitle = phase === "run1"
    ? "Skip to the end of Run 1 — the reveal"
    : phase === "run2"
      ? "Skip to the end of Run 2 — the outcome"
      : "Skip to the end of this run";

  return (
    <div className={`g-root${frozen ? " frozen" : ""}`}>
      <ClipLayer phase={phase} />
      {/* Frozen banner sits ABOVE every layer (z 60), including clean plates,
          so there is never a screen where the game is paused with no visible
          cause and no way out. Deadlock insurance for a live demo. */}
      {frozen && phase !== "title" && phase !== "dossier" && (
        <button className="g-frozen-banner" onClick={toggleFrozen} title="Resume — let time run again">
          ▶ Time frozen · click to resume
        </button>
      )}
      {phase !== "title" && phase !== "dossier" && (
        <div className={`g-hud${plateActiveFlag ? " plated" : ""}`}>
          <span className={`run ${phase === "run1" ? "today" : "ai"}`}>
            {phase === "run1" ? <>Run 1 · <b>The humans</b></> : phase === "run2" ? <>Run 2 · <b>The AI Nervous System</b></> : <b>&nbsp;</b>}
          </span>
          {phase === "coldopen" && <span className="run">Prologue</span>}
          <div className="hud-right">
            {(phase === "run1" || phase === "run2") && (
              <span className={`clock${frozen ? " frozen" : ""}`}>{fmtClock(clock)}</span>
            )}
            {phase === "coldopen" && (
              <button className="skip" onClick={() => goPhase("run1")}>Skip →</button>
            )}
            {/* Standard media convention: the icon shows what CLICKING will do.
                Frozen → ▶ (click to play/resume); running → ❚❚ (click to freeze).
                It first shipped ❚❚ in both states, which read as "still frozen,
                click to freeze again" — a button that never tells you it will
                resume is a button nobody dares press mid-demo. */}
            <button
              className={`skip ctl${frozen ? " on" : ""}`}
              onClick={toggleFrozen}
              title={frozen ? "Resume — let time run again" : "Freeze time — nothing advances, the AI will not act"}
              aria-pressed={frozen}>
              {frozen ? "▶" : "❚❚"} <span className="ctl-word">{frozen ? "Resume" : "Freeze"}</span>
            </button>
            <button
              className="skip ctl"
              onClick={goBack}
              disabled={!canBack}
              title={canBack ? "Back one step" : "Nothing to go back to"}>
              ← <span className="ctl-word">Back</span>
            </button>
            {(phase === "run1" || phase === "run2") && (
              <button
                className="skip ctl end"
                onClick={skipToEnd}
                disabled={!canSkip}
                title={canSkip ? skipTitle : "Already at the end of this run"}>
                ⏭ <span className="ctl-word">End</span>
              </button>
            )}
            <button className="skip home" onClick={restart} title="Back to the title screen">⌂ <span className="ctl-word">Home</span></button>
            <button
              className={`skip ctl${audioOn ? "" : " muted"}`}
              onClick={sound.toggle}
              title={audioOn ? "Mute sound" : "Unmute sound"}
              aria-pressed={!audioOn}>
              {audioOn ? "🔊" : "🔇"} <span className="ctl-word">{audioOn ? "Sound" : "Muted"}</span>
            </button>
          </div>
        </div>
      )}

      <AnimatePresence mode={demo ? "sync" : "wait"}>
        {phase === "title" && <Title key="t" onBegin={() => goPhase("coldopen")} onDeepDive={onDeepDive} />}
        {phase === "coldopen" && <ColdOpen key="c" demo={demo} onDone={() => goPhase("run1")} />}
        {phase === "run1" && (
          <motion.div key="r1" style={{ position: "absolute", inset: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <Run1 demo={demo} clockRef={clockRef} onComplete={() => { clockRef.current = 0; goPhase("run2"); }} />
          </motion.div>
        )}
        {phase === "run2" && (
          <motion.div key="r2" style={{ position: "absolute", inset: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <Run2 demo={demo} clockRef={clockRef} onChoices={setChoices} onComplete={() => goPhase("dossier")} />
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
          <h1><span className="ttl">The Nervous</span><span className="ttl">System</span></h1>
        </motion.div>
        <motion.div className="tag" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.9 }}>
          By the time you hear the alarm, the urgent steps are <span className="accent">already taken care of.</span>
        </motion.div>
        <motion.div className="sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75, duration: 0.9 }}>
          
        </motion.div>
        <motion.div className="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95, duration: 0.8 }}>
          {/* Begin is the first user gesture — the moment a browser allows an
              AudioContext, so the soundscape is born here, not on load. */}
          <button className="g-btn-hud" onClick={() => { sound.init(); onBegin(); }}><span>Begin</span></button>
          <div style={{ marginTop: 14 }}>
            <button className="g-btn ghost" style={{ fontSize: 12, padding: "9px 16px" }} onClick={onDeepDive}>or read the argument</button>
          </div>
          <TitleSoundHint />
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: 1 }}
          style={{ marginTop: 40, fontFamily: "var(--g-body)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--g-faint)" }}>
          based on a real event: Israel flight hijacking 
        </motion.div>
      </div>
    </motion.div>
  );
}

/* Small sound-state hint under the title actions: the piece has a score, so
   say so before Begin — and surface a muted state (persisted from a previous
   visit) where the player can fix it without hunting through the HUD. */
function TitleSoundHint() {
  const audioOn = useAudioOn();
  return (
    <button className="g-sound-hint" onClick={sound.toggle}
      title={audioOn ? "Mute sound" : "Unmute sound"}>
      {audioOn ? "🔊" : "🔇"} <span>{audioOn ? "with sound" : "muted — click to unmute"}</span>
    </button>
  );
}

/* ── Cold-open: abstract, no violence. One number, a door, a thesis. ── */
function ColdOpen({ onDone, demo = false }: { onDone: () => void; demo?: boolean }) {
  const [step, setStep] = useState(0);
  /* THREE beats now, not four. The 2015 beat was cut for interview time — see the
     commented block below for what it said and where its timing used to sit.
     Re-timed so the remaining beats keep their original dwell (2.6 s / 3.5 s /
     3.5 s) instead of leaving a 3.4 s hole where the cut beat was.
     ORIGINAL (4 beats): setStep(1)@2600 · setStep(2)@6000 · setStep(3)@9500 · onDone@13000 */
  useEffect(() => {
    const f = demo ? 0.55 : 1; // faster in demo mode
    const t = [setTimeout(() => setStep(1), 2600 * f), setTimeout(() => setStep(2), 6100 * f),
      setTimeout(onDone, 9600 * f)];
    return () => t.forEach(clearTimeout);
  }, [onDone, demo]);

  /* One sound per beat, on the beat it lands: an open fifth under "174 lived",
     the resolve chime under "Luck is not a safety system." The cold open is
     silence and typography; these are the only two notes it gets.
     NOTE the re-keying: these used to sit on steps 2 and 3, because step 1 was
     the 2015 beat that carried the hollow minor third. Cutting a beat shifts
     every index below it — without this change the "174 lived" tone would have
     landed on the closing title and the chime would never have fired. */
  useEffect(() => {
    if (step === 1) sound.sfx("warm");
    if (step === 2) sound.sfx("chime");
  }, [step]);

  return (
    <motion.div className="g-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
      <div className="g-vig-dark" />
      <div className="g-center">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="0" exit={{ opacity: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              {/* Text only, like every other cold-open beat. The altitude graph
                  that used to sit here was decoration the line doesn't need —
                  and a schematic of a dive under a sentence about a DOOR mixed
                  two unrelated ideas in one beat. */}
              <div className="g-beat">A door that only opens from one side.</div>
            </motion.div>
          )}
          {/* CUT FOR TIME — the 2015 / Germanwings beat. Restore by re-adding this
              block as `step === 1` and shifting the two beats below back to 2 and 3,
              then restoring the 4-beat timing and the `hollow` tone in the two
              effects above. It reads:
                <div className="g-beat">2015: it kept the wrong man<br />at the
                controls. <span className="coral">150 dead.</span></div>
              It is still Ashley's reserve ANSWER to "why not write a better rule?"
              — see WALKTHROUGH.md's Q&A — it is simply no longer narrated. */}
          {step === 1 && (
            <motion.div key="1" exit={{ opacity: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              <div className="g-beat">Last month: it kept help outside.<br /><span className="teal">174 lived — by inches.</span></div>
            </motion.div>
          )}
          {step >= 2 && (
            <motion.div key="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
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
