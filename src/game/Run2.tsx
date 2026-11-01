import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlightDeck, AltitudeTrace, AircraftIcon } from "./Visuals";
import { ArtCross, preloadArt } from "./SceneArt";
import type { ArtKey } from "./art";

preloadArt([
  "r2-detected", "r2-unlocked", "r2-alert",
  "r2-stabilized", "r2-airport-alarm", "r2-airport-ready",
]);

/* ══════════════════════════════════════════════════════════════
   RUN 2 — "The nervous system." Cinematic replay. The AI does the
   physical work and reports to YOU, the airport ops. Lean copy per
   COPY-MAP.md. Every emergency card carries a 4 s confirm clock —
   at zero the AI takes the recommended action (recorded "auto:…"
   so the dossier never credits a human for it). The authority dial
   has NO clock: that call is yours alone — "You decide; it never
   does." Softened claim: the AI stabilizes, guards the envelope
   and GUIDES — humans fly it; auto-land only where certified.
   ══════════════════════════════════════════════════════════════ */

type Step =
  | "intro"
  | "d1_door" | "d1_result"
  | "d2_dive" | "d2_result"
  | "d3_airport" | "d3_result"
  | "d4_dial" | "d4_result"
  | "ending" | "done";

export type Run2Choices = { door?: string; dive?: string; airport?: string; dial?: string };

/** Decisions a human actually made (AI auto-actions are prefixed "auto:"). */
export const humanDecisions = (c: Run2Choices) =>
  Object.values(c).filter((v) => v && !v.startsWith("auto:")).length;

export default function Run2({ onComplete, onChoices, clockRef, demo = false }: {
  onComplete: () => void;
  onChoices: (c: Run2Choices) => void;
  clockRef: React.MutableRefObject<number>;
  demo?: boolean;
}) {
  const [step, setStep] = useState<Step>(() => {
    // test hook: ?r2=d3_airport deep-links to a step (deterministic screenshots)
    const s = new URLSearchParams(window.location.search).get("r2");
    const valid: Step[] = ["intro","d1_door","d1_result","d2_dive","d2_result","d3_airport","d3_result","d4_dial","d4_result","ending"];
    return (s && valid.includes(s as Step)) ? (s as Step) : "intro";
  });
  const [choices, setChoices] = useState<Run2Choices>({});
  const [t, setT] = useState("T+0:00");
  const [diveMode, setDiveMode] = useState<"dive" | "guarded">("dive");
  const [guardProgress, setGuardProgress] = useState(0);
  const [contacted, setContacted] = useState(false);

  // clock display driven by step
  useEffect(() => {
    const map: Partial<Record<Step, string>> = {
      intro: "T+0:00", d1_door: "T+1:05", d1_result: "T+1:09",
      d2_dive: "T+0:30", d2_result: "T+3:00", d3_airport: "T+9:00", d3_result: "T+13:00",
      d4_dial: "T+38:00", d4_result: "T+38:04", ending: "T+2:00:00",
    };
    if (map[step]) setT(map[step]!);
  }, [step]);

  // dive guard animation
  useEffect(() => {
    if (step === "d2_dive" || step === "d2_result") {
      let raf = 0; let p = 0;
      const loop = () => { p = Math.min(1, p + 0.012); setGuardProgress(p); if (p < 1) raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf);
    }
  }, [step]);

  const go = (s: Step, patch?: Partial<Run2Choices>) => {
    if (patch) { const nc = { ...choices, ...patch }; setChoices(nc); onChoices(nc); }
    setStep(s);
  };

  // demo mode: auto-advance intro/ending and auto-pick recommended actions
  useEffect(() => {
    if (!demo) return;
    if (step === "intro") { const t = setTimeout(() => go("d1_door"), 900); return () => clearTimeout(t); }
    if (step === "ending") { const t = setTimeout(onComplete, 2500); return () => clearTimeout(t); }
    const auto: Partial<Record<Step, { to: Step; patch?: Partial<Run2Choices>; act?: () => void }>> = {
      d1_door: { to: "d1_result", patch: { door: "release" } },
      d1_result: { to: "d2_dive" },
      d2_dive: { to: "d2_result", patch: { dive: "guide" }, act: () => setDiveMode("guarded") },
      d2_result: { to: "d3_airport" },
      d3_airport: { to: "d3_result", patch: { airport: "confirm" }, act: () => setContacted(true) },
      d3_result: { to: "d4_dial" },
      d4_dial: { to: "d4_result", patch: { dial: "confirms" } },
      d4_result: { to: "ending" },
    };
    const a = auto[step];
    if (!a) return;
    const t = setTimeout(() => { a.act?.(); go(a.to, a.patch); }, 1800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, step]);

  const held = choices.door === "hold";

  return (
    <div className="g-stage">
      <div id="r2probe" data-step={step} data-choices={JSON.stringify(choices)} style={{ display: "none" }} />
      <AnimatePresence mode={demo ? "sync" : "wait"}>
        {step === "intro" && <Run2Intro key="i" onNext={() => go("d1_door")} />}

        {/* D1 — the door */}
        {step === "d1_door" && (
          <Run2Scene key="d1" demo={demo} brief={<>T+1:05, flight deck. The captain is down at a sealed door.</>}
            photoLabel="Live model · flight deck" label="Scene 1 · In the air" photo="r2-detected"
            sub="You are the decision-maker" subClass="teal" clock={t}
            art={<FlightDeck doorOpen={0} threat captainDown highlightDoor aiEyes paxAtDoor={2} />}
            vignette="teal">
            <ReportCard
              t={t}
              said={<>Intrusion in the flight deck. <span className="em">Captain unresponsive</span>. Aircraft deviating. 174 souls.</>}
              rec={<>412 playbook branches — <b>none fit</b>. I'm not looking up a rule. I'm looking at the door.</>}
              question="Release the smart lock?"
              tele={["CAM · LIDAR · ATC — FUSED", "CONFIDENCE 0.94", "6-s CLIP ATTACHED"]}
              actions={[
                { label: "Release", kind: "gold", onClick: () => go("d1_result", { door: "release" }) },
                { label: "Hold", kind: "ghost", onClick: () => go("d1_result", { door: "hold" }) },
                { label: "Show me more", kind: "ghost", more: true },
              ]}
              countdown
              onExpire={demo ? undefined : () => go("d1_result", { door: "auto:release" })}
            />
          </Run2Scene>
        )}
        {step === "d1_result" && (
          <Run2Scene key="d1r" demo={demo} holdBrief
            brief={held ? <>You held. The lock stays sealed.</> : <>The latch releases on your word.</>}
            photoLabel="Live model · flight deck" label="Scene 1 · In the air" photo="r2-unlocked"
            sub="You are the decision-maker" subClass="teal" clock={t}
            art={<FlightDeck doorOpen={held ? 0 : 1} threat captainDown aiEyes paxAtDoor={4} scanning />} vignette="teal">
            <ResultBar onNext={() => go("d2_dive")} />
          </Run2Scene>
        )}

        {/* D2 — the dive (softened: stabilize + guide) */}
        {step === "d2_dive" && (
          <Run2Scene key="d2" demo={demo} brief={<>Falling. Uncommanded. 14,000 ft in 30 s.</>}
            photoLabel="Live model · altitude trace" label="Scene 2 · The dive" photo="r2-alert"
            sub="You are the decision-maker" subClass="teal" clock={t}
            art={<AltitudeTrace mode={diveMode} progress={guardProgress} showSafeBand />} vignette="teal">
            <ReportCard
              t={t}
              rec={<>No one aboard can land this. I <b>stabilize and guide</b> — the off-duty crew or a ground pilot flies. Auto-land only where certified.</>}
              actions={[
                { label: "Authorize", kind: "teal", onClick: () => { setDiveMode("guarded"); go("d2_result", { dive: "guide" }); } },
                { label: "Keep searching", kind: "ghost", onClick: () => { setDiveMode("guarded"); go("d2_result", { dive: "search" }); } },
              ]}
              countdown
              onExpire={demo ? undefined : () => { setDiveMode("guarded"); go("d2_result", { dive: "auto:guide" }); }}
            />
          </Run2Scene>
        )}
        {step === "d2_result" && (
          <Run2Scene key="d2r" demo={demo} brief={<>The nose comes up.</>}
            photoLabel="Live model · altitude trace" label="Scene 2 · The dive" photo="r2-stabilized"
            sub="You are the decision-maker" subClass="teal" clock={t}
            art={<DiveResolve />} vignette="teal">
            <Consequence good
              goodText={<>Dive arrested. The off-duty pilots take the controls; I hold the envelope.</>}
              onNext={() => go("d3_airport")} nextLabel="Continue →" />
          </Run2Scene>
        )}

        {/* D3 — contact the airport */}
        {step === "d3_airport" && (
          <Run2Scene key="d3" demo={demo} brief={<>Below: the nearest suitable airport. Trucks, lights, a cleared stand. Nobody phoned.</>}
            photoLabel="Live model · airport response" label="Scene 3 · The ground" photo="r2-airport-alarm"
            sub="You are the decision-maker" subClass="teal" clock={t}
            art={<AirportContact contacted={contacted} />} vignette="teal">
            <ReportCard
              t={t}
              said={<>Nearest suitable airport <span className="em">contacted</span>. Trucks, lights, a cleared stand. Fire and medical rolling, family assistance opening.</>}
              rec={<>They have it before you're on approach. <b>No phone tree.</b> Confirm services.</>}
              actions={[
                { label: "Confirm", kind: "teal", onClick: () => { setContacted(true); go("d3_result", { airport: "confirm" }); } },
                { label: "Redirect farther", kind: "ghost", onClick: () => { setContacted(true); go("d3_result", { airport: "redirect" }); } },
              ]}
              countdown
              onExpire={demo ? undefined : () => { setContacted(true); go("d3_result", { airport: "auto:confirm" }); }}
            />
          </Run2Scene>
        )}
        {step === "d3_result" && (
          <Run2Scene key="d3r" demo={demo} photoLabel="Live model · airport response" label="Scene 3 · The ground"
            photo="r2-airport-ready" sub="You are the decision-maker" subClass="teal" clock={t}
            art={<AirportContact contacted />} vignette="teal">
            <ResultBar onNext={() => go("d4_dial")} />
          </Run2Scene>
        )}

        {/* D4 — the authority dial. No clock: this decision waits for a human. */}
        {step === "d4_dial" && (
          <Run2Scene key="d4" demo={demo} photoLabel="Live model · flight deck" label="Scene 4 · After"
            photo="r2-airport-ready" sub="You are the decision-maker" subClass="teal" clock={t}
            art={<FlightDeck doorOpen={1} threat={false} aiEyes paxAtDoor={0} />} vignette="teal">
            <ReportCard
              t={t}
              said={<>Resolved. <span className="em">174 souls</span>. Captain stable in surgery. Audit trail attached.</>}
              rec={<>At T+1:05 no playbook fit. I saw, summarized, recommended — and waited <b>4.2 s</b> for a human. 2015 was the alternative: a rule that couldn't be broken.</>}
              actsLabel="Authority"
              actions={[
                { label: "Standing authority", kind: "gold", onClick: () => go("d4_result", { dial: "standing" }) },
                { label: "Live confirms", kind: "ghost", onClick: () => go("d4_result", { dial: "confirms" }) },
                { label: "Fixed doctrine", kind: "ghost", onClick: () => go("d4_result", { dial: "doctrine" }) },
              ]}
            />
          </Run2Scene>
        )}
        {step === "d4_result" && (
          <Run2Scene key="d4r" demo={demo} photoLabel="Live model · flight deck" label="Scene 4 · After"
            photo="r2-alert" sub="You are the decision-maker" subClass="teal" clock={t}
            art={<FlightDeck doorOpen={1} threat={false} aiEyes />} vignette="teal">
            <Consequence good
              goodText={<DialResult dial={choices.dial} />}
              onNext={() => go("ending")} nextLabel="See the outcome →" />
          </Run2Scene>
        )}

        {step === "ending" && <Run2Ending key="e" decisions={humanDecisions(choices)} onNext={onComplete} />}
        {step === "done" && <motion.div key="done" exit={{ opacity: 0 }} />}
      </AnimatePresence>
    </div>
  );
}

/* ── pieces ── */

const fade = {
  initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

function Run2Intro({ onNext }: { onNext: () => void }) {
  return (
    <motion.div className="g-center" {...fade}>
      <div className="g-vig-teal" />
      <div className="g-kicker teal">Run 2 · The nervous system</div>
      <div className="g-title" style={{ fontSize: "clamp(24px,3.6vw,42px)" }}>
        Same event. Same clock.<br />This time, the airport has hands.
      </div>
      <p className="g-prose" style={{ margin: "22px auto 0" }}>
        You're now the <b style={{ color: "var(--g-cyan)" }}>airport ops</b> that the Nervous System reports to.
      </p>
      <div className="g-actions" style={{ marginTop: 36 }}>
        <button className="g-btn big teal" onClick={onNext}>Run it again →</button>
      </div>
    </motion.div>
  );
}

function Run2Scene({ label, sub, subClass, clock, art, children, vignette, photo, photoLabel, brief, settleMs, demo, holdBrief }: {
  label: string; sub: string; subClass?: string; clock: string;
  art: React.ReactNode; children: React.ReactNode; vignette?: "teal" | "coral";
  photo?: ArtKey; photoLabel?: string;
  /** orienting line shown during the "look" beat, before any decision is asked */
  brief?: React.ReactNode;
  /** keep the brief on screen after the beat (result steps with no card text) */
  holdBrief?: boolean;
  /** ms to hold the photo before the decision card appears (0 = immediate) */
  settleMs?: number; demo?: boolean;
}) {
  // decision steps breathe longer; result steps just get a short beat
  const base = settleMs ?? (brief ? (demo ? 750 : 2400) : (demo ? 450 : 1100));
  const [settled, setSettled] = useState(base <= 0);
  useEffect(() => {
    if (base <= 0) { setSettled(true); return; }
    const id = setTimeout(() => setSettled(true), base);
    return () => clearTimeout(id);
  }, [base]);

  return (
    <motion.div className="g-stage" {...fade} style={{ justifyContent: "flex-start", paddingTop: 72 }}>
      {photo
        ? <ArtCross art={photo} dim={settled ? 0.46 : 0.3} fallback={<div className="g-vig-teal" />} />
        : vignette === "teal" && <div className="g-vig-teal" />}
      {!photo && vignette === "coral" && <div className="g-vig-coral" />}
      <div className="g-scene-label">{label}<span className={`role ${subClass}`}>{sub}</span></div>

      {/* the data-model overlay arrives WITH the decision — during the look-beat it's just the photo */}
      <div style={{ flex: 1, display: "grid", placeItems: photo ? "start end" : "center", width: "100%", minHeight: 0, padding: photo ? "0 24px" : 0 }}>
        <motion.div className={photo ? "g-datacard" : undefined}
          initial={false}
          animate={{ opacity: photo ? (settled ? 1 : 0) : 0.85, y: settled ? 0 : -10 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          {photo && <div className="g-datacard-h">{photoLabel ?? "Live model"}</div>}
          {art}
        </motion.div>
      </div>

      {/* bottom: orienting caption during the look-beat, decision/outcome card once settled */}
      <div style={{ position: "relative", zIndex: 6, width: "100%", minHeight: 170 }}>
        <AnimatePresence>
          {!settled && brief && (
            <motion.div key="brief" className="g-brief"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.22 } }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              <span className="g-brief-k">Reading the scene</span>
              <div className="g-brief-t">{brief}</div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* children mount only after the beat, so the confirm clock starts
            when the player is actually asked to decide */}
        {settled && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, paddingBottom: 20 }}>
            {holdBrief && brief && (
              <div className="g-brief static">
                <div className="g-brief-t">{brief}</div>
              </div>
            )}
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
}

type Action = { label: string; kind: "gold" | "teal" | "ghost"; onClick?: () => void; more?: boolean };

function ReportCard({ t, said, rec, question, actions, actsLabel, tele, countdown, onExpire }: {
  t: string;
  /** machine report line — optional; when absent, rec leads the card */
  said?: React.ReactNode;
  rec: React.ReactNode;
  /** the ask — optional; lean cards let the buttons carry it */
  question?: string;
  actions: Action[];
  /** small gold group label above the buttons (e.g. the authority dial) */
  actsLabel?: string;
  /** telemetry lines revealed by a "Show me more" action */
  tele?: string[];
  /** 4 s confirm clock; at zero the AI takes the recommended action */
  countdown?: boolean; onExpire?: () => void;
}) {
  const [ms, setMs] = useState(4000);
  const [more, setMore] = useState(false);
  const expRef = useRef(onExpire); expRef.current = onExpire;
  const fired = useRef(false);
  useEffect(() => {
    // setInterval (not RAF) so the clock also advances under headless virtual-time
    if (!countdown) return;
    const start = Date.now();
    const id = setInterval(() => {
      const left = Math.max(0, 4000 - (Date.now() - start)); setMs(left);
      if (left <= 0 && !fired.current) { fired.current = true; clearInterval(id); expRef.current?.(); }
    }, 100);
    return () => clearInterval(id);
  }, [countdown]);

  return (
    <motion.div className="g-report" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
      {countdown && (
        <div className="g-confirm-ring" style={{ position: "absolute", top: -14, right: 20 }}>
          <div className="num">{(ms / 1000).toFixed(1)}s</div>
          <div className="lab">then AI acts</div>
        </div>
      )}
      <div className="src"><span className="dot" /><span className="nm">Nerve Center · to you</span><span className="t">{t}</span></div>
      {said && <div className="said">{said}</div>}
      <div className={`rec${said ? "" : " lead"}`}>{rec}</div>
      {more && tele && <div className="g-tele">{tele.map((l) => <span key={l}>{l}</span>)}</div>}
      {question && <div className="q">{question}</div>}
      {actsLabel && <div className="acts-label">{actsLabel}</div>}
      <div className="acts">
        {actions.map((a, i) => (
          <button key={i} className={`g-btn ${a.kind}`} onClick={a.more ? () => setMore((v) => !v) : a.onClick}>{a.label}</button>
        ))}
      </div>
    </motion.div>
  );
}

function Consequence({ good, goodText, badText, onNext, nextLabel }: {
  good: boolean; goodText: React.ReactNode; badText?: React.ReactNode;
  onNext: () => void; nextLabel: string;
}) {
  return (
    <motion.div className="g-report" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }} style={{ borderColor: good ? "var(--ai-line)" : "var(--today-line)" }}>
      <div className="src"><span className="dot" style={{ background: good ? "var(--g-cyan)" : "var(--g-coral)" }} />
        <span className="nm" style={{ color: good ? "var(--g-cyan)" : "var(--g-coral)" }}>{good ? "Outcome" : "Alternate outcome"}</span></div>
      <div className="g-consequence" style={{ marginTop: 0 }}>{good ? goodText : badText}</div>
      <div className="acts" style={{ marginTop: 20 }}>
        <button className="g-btn teal" onClick={onNext}>{nextLabel}</button>
      </div>
    </motion.div>
  );
}

/** result step with no card copy left — the photo/animation is the content */
function ResultBar({ onNext, label = "Continue →" }: { onNext: () => void; label?: string }) {
  return (
    <motion.div className="g-resultbar" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
      <button className="g-btn teal" onClick={onNext}>{label}</button>
    </motion.div>
  );
}

function DialResult({ dial }: { dial?: string }) {
  if (dial === "standing") return <>Granted. Irreversible acts proceed on scene judgment — logged, streamed to ATC, countermandable by any conscious crew member. Low confidence still escalates. <span className="dim">Revocable in one tap.</span></>;
  if (dial === "confirms") return <>Retained. Median confirm: 4.2 s. <span className="dim">Every confirm builds the trust record; it proposes standing authority once it has earned it. You decide — it never does.</span></>;
  return <>Authority recorded.</>;
}

/* dive resolve: coral trace → teal guarded, with an aircraft icon steadying */
function DiveResolve() {
  return (
    <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
      <AltitudeTrace mode="guarded" progress={1} showSafeBand />
      <motion.div style={{ position: "absolute", right: 30, top: 34 }}
        initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}>
        <AircraftIcon color="var(--g-cyan)" size={44} />
      </motion.div>
      <div style={{ position: "absolute", bottom: 6, fontFamily: "var(--g-body)", fontSize: 10, letterSpacing: "0.1em", color: "var(--g-cyan)", textTransform: "uppercase" }}>
        envelope held · guidance vector to nearest suitable
      </div>
    </div>
  );
}

/* airport contact animation — with the S3 card copy cut, this IS the result beat */
function AirportContact({ contacted }: { contacted: boolean }) {
  return (
    <svg width="min(520px,86vw)" height="200" viewBox="0 0 520 200" style={{ display: "block" }} role="img" aria-label="Airport contact">
      {/* aircraft inbound */}
      <motion.g initial={{ x: 0 }} animate={{ x: contacted ? 150 : 0 }} transition={{ duration: 2, ease: "easeInOut" }}>
        <g transform="translate(60 60)"><AircraftIcon color="var(--g-cyan)" size={36} /></g>
      </motion.g>
      {/* airport */}
      <rect x="360" y="120" width="120" height="40" rx="6" fill="rgba(148,163,184,0.06)" stroke="rgba(148,163,184,0.3)" />
      <text x="368" y="145" style={{ fontFamily: "var(--g-body)", fontSize: 10, fill: "var(--g-faint)" }}>NEAREST SUITABLE</text>
      {/* data link */}
      <motion.line x1="110" y1="78" x2="360" y2="130" stroke="var(--g-cyan)" strokeWidth="1.4" strokeDasharray="4 4"
        initial={{ opacity: 0.2 }} animate={{ opacity: contacted ? 1 : 0.4 }} transition={{ duration: 0.6 }} />
      {/* services light up */}
      {["FIRE", "MEDICAL", "STAND CLEAR", "COUNSELLORS"].map((s, i) => (
        <motion.g key={s} initial={{ opacity: 0 }} animate={{ opacity: contacted ? 1 : 0.15 }} transition={{ delay: contacted ? i * 0.25 : 0, duration: 0.4 }}>
          <circle cx={372 + i * 28} cy="180" r="5" fill="var(--g-cyan)" />
          <text x={372 + i * 28} y="196" textAnchor="middle" style={{ fontFamily: "var(--g-body)", fontSize: 7.5, fill: "var(--g-cyan)" }}>{s}</text>
        </motion.g>
      ))}
      <text x="60" y="180" style={{ fontFamily: "var(--g-body)", fontSize: 9, fill: contacted ? "var(--g-cyan)" : "var(--g-faint)" }}>
        {contacted ? "INFORMED · SERVICES PRE-POSITIONED" : "AWAITING CONFIRMATION"}
      </text>
    </svg>
  );
}

function Run2Ending({ decisions, onNext }: { decisions: number; onNext: () => void }) {
  useEffect(() => { const t = setTimeout(onNext, 8000); return () => clearTimeout(t); }, [onNext]);
  const w = ["no", "one", "two", "three", "four"][Math.max(0, Math.min(4, decisions))];
  return (
    <motion.div className="g-stage" {...fade}>
      <div className="g-vig-teal" />
      <motion.div className="g-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <div className="g-kicker teal">Resolved</div>
        <div className="g-title" style={{ fontSize: "clamp(28px,4.4vw,50px)" }}>
          Same 174. No luck needed.<br />No rule that happened to fit.
        </div>
        <p className="g-prose" style={{ margin: "24px auto 0", textAlign: "center" }}>
          You made <b style={{ color: "var(--g-gold)" }}>{w} decision{decisions === 1 ? "" : "s"}</b>.
          The machine did the rest: saw, guarded, opened, guided, informed.
        </p>
        <div className="g-actions" style={{ marginTop: 34 }}>
          <button className="g-btn big gold" onClick={onNext}>See the outcome & the risks</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
