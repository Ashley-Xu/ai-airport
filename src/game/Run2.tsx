import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlightDeck, AltitudeTrace, AircraftIcon } from "./Visuals";

/* ══════════════════════════════════════════════════════════════
   RUN 2 — "The nervous system." Cinematic replay. The AI does the
   physical work and reports to YOU, the decision-maker. Calm,
   few-and-weighty interactions. Softened claim: the AI stabilizes,
   guards the envelope and GUIDES — humans fly it; auto-land only
   where certified.
   ══════════════════════════════════════════════════════════════ */

type Step =
  | "intro"
  | "d1_door" | "d1_result"
  | "d2_dive" | "d2_result"
  | "d3_airport" | "d3_result"
  | "d4_dial" | "d4_result"
  | "ending" | "done";

export type Run2Choices = { door?: string; dive?: string; airport?: string; dial?: string };

export default function Run2({ onComplete, onChoices, clockRef, demo = false }: {
  onComplete: () => void;
  onChoices: (c: Run2Choices) => void;
  clockRef: React.MutableRefObject<number>;
  demo?: boolean;
}) {
  const [step, setStep] = useState<Step>("intro");
  const [choices, setChoices] = useState<Run2Choices>({});
  const [t, setT] = useState("T+0:00");
  const [doorOpen, setDoorOpen] = useState(0);
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
      d1_door: { to: "d1_result", patch: { door: "release" }, act: () => setDoorOpen(1) },
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

  return (
    <div className="g-stage">
      <div id="r2probe" data-step={step} style={{ display: "none" }} />
      <AnimatePresence mode={demo ? "sync" : "wait"}>
        {step === "intro" && <Run2Intro key="i" onNext={() => go("d1_door")} />}

        {/* D1 — the door */}
        {step === "d1_door" && (
          <Run2Scene key="d1" label="Scene 1 · In the air" sub="You are the decision-maker" subClass="teal" clock={t}
            art={<FlightDeck doorOpen={0} threat captainDown highlightDoor aiEyes paxAtDoor={2} />}
            vignette="teal">
            <ReportCard
              t={t}
              said={<>Violent intrusion in the flight deck. <span className="em">Captain unresponsive</span> at the door. Aircraft deviating. 174 souls.</>}
              rec={<>Searched 412 playbook branches — <b>none fit this scene</b>. I am not looking up a rule. I am looking at the door.</>}
              question="Authorize the smart lock to release?"
              actions={[
                { label: "Authorize release", kind: "gold", onClick: () => { setDoorOpen(1); go("d1_result", { door: "release" }); } },
                { label: "Hold", kind: "ghost", onClick: () => go("d1_result", { door: "hold" }) },
                { label: "Show me more", kind: "ghost", onClick: () => {} },
              ]}
              countdown
            />
          </Run2Scene>
        )}
        {step === "d1_result" && (
          <Run2Scene key="d1r" label="Scene 1 · In the air" sub="You are the decision-maker" subClass="teal" clock={t}
            art={<FlightDeck doorOpen={1} threat captainDown aiEyes paxAtDoor={4} scanning />} vignette="teal">
            <Consequence
              good={choices.door === "release"}
              goodText={<>Door released on your authority. Help and medical reach the captain <b>~40 s sooner</b>. He never had to reach the lock. <span className="dim">A human said yes in 4.2 seconds — the machine saw, you decided.</span></>}
              badText={<>You held. The lock stays sealed; the captain is on his own. In the real event, a dying man's arm was the only thing that opened it. <span className="dim">Re-run to see the other choice.</span></>}
              onNext={() => go("d2_dive")} nextLabel="Continue →" />
          </Run2Scene>
        )}

        {/* D2 — the dive (softened: stabilize + guide) */}
        {step === "d2_dive" && (
          <Run2Scene key="d2" label="Scene 2 · The dive" sub="You are the decision-maker" subClass="teal" clock={t}
            art={<AltitudeTrace mode={diveMode} progress={guardProgress} showSafeBand />} vignette="teal">
            <ReportCard
              t={t}
              said={<>Uncommanded dive detected — <span className="em">14,000 ft in under 30 s</span>. Intent-guard is rejecting it now; envelope held.</>}
              rec={<>No one aboard can land this. Recommend I <b>stabilize the attitude and guide</b> a pilot — the off-duty crew or a ground pilot — to the nearest suitable airport. Auto-landing only where certified; a human keeps the controls.</>}
              question="Authorize stabilize-and-guide?"
              actions={[
                { label: "Authorize", kind: "teal", onClick: () => { setDiveMode("guarded"); go("d2_result", { dive: "guide" }); } },
                { label: "Keep searching for a pilot", kind: "ghost", onClick: () => { setDiveMode("guarded"); go("d2_result", { dive: "search" }); } },
              ]}
            />
          </Run2Scene>
        )}
        {step === "d2_result" && (
          <Run2Scene key="d2r" label="Scene 2 · The dive" sub="You are the decision-maker" subClass="teal" clock={t}
            art={<DiveResolve />} vignette="teal">
            <Consequence
              good
              goodText={<>Attitude stabilized, dive arrested. The off-duty pilots take the controls with the AI holding the envelope around them. <span className="dim">Same two licences as Run 1 — this time not left to luck alone.</span></>}
              onNext={() => go("d3_airport")} nextLabel="Continue →" />
          </Run2Scene>
        )}

        {/* D3 — contact the airport */}
        {step === "d3_airport" && (
          <Run2Scene key="d3" label="Scene 3 · The ground" sub="You are the decision-maker" subClass="teal" clock={t}
            art={<AirportContact contacted={contacted} />} vignette="teal">
            <ReportCard
              t={t}
              said={<>Nearest suitable airport identified and <span className="em">already contacted</span>. They are pre-positioning fire and medical, clearing the stand, opening family assistance.</>}
              rec={<>They have the situation before the aircraft is on approach — <b>no phone tree</b>. Confirm the emergency message and services.</>}
              question="Confirm and hand off to the airport?"
              actions={[
                { label: "Confirm", kind: "teal", onClick: () => { setContacted(true); go("d3_result", { airport: "confirm" }); } },
                { label: "Redirect farther", kind: "ghost", onClick: () => { setContacted(true); go("d3_result", { airport: "redirect" }); } },
              ]}
            />
          </Run2Scene>
        )}
        {step === "d3_result" && (
          <Run2Scene key="d3r" label="Scene 3 · The ground" sub="You are the decision-maker" subClass="teal" clock={t}
            art={<AirportContact contacted />} vignette="teal">
            <Consequence good
              goodText={<>Fire arrives before the aircraft stops rolling. Counsellors briefed <b>before the first family calls</b>. The report is auto-assembled from the full log — second by second, court-ready. <span className="dim">This is the cut ground phase, in five seconds.</span></>}
              onNext={() => go("d4_dial")} nextLabel="Continue →" />
          </Run2Scene>
        )}

        {/* D4 — the authority dial */}
        {step === "d4_dial" && (
          <Run2Scene key="d4" label="Scene 4 · After" sub="You are the decision-maker" subClass="teal" clock={t}
            art={<FlightDeck doorOpen={1} threat={false} aiEyes paxAtDoor={0} />} vignette="teal">
            <ReportCard
              t={t}
              said={<>Event resolved. <span className="em">174 souls</span>. Captain in surgery, stable. Zero further injuries. Full audit trail attached.</>}
              rec={<>At T+1:05 I met a scene no playbook covered. I saw, summarized, recommended — and waited <b>4.2 s</b> for a human. The alternative was 2015: a rule that could not be broken.</>}
              question="How much standing authority do you grant the nervous system going forward?"
              actions={[
                { label: "Standing adaptive authority", kind: "gold", onClick: () => go("d4_result", { dial: "standing" }) },
                { label: "Live human confirms", kind: "ghost", onClick: () => go("d4_result", { dial: "confirms" }) },
                { label: "Keep fixed doctrine", kind: "ghost", onClick: () => go("d4_result", { dial: "doctrine" }) },
              ]}
            />
          </Run2Scene>
        )}
        {step === "d4_result" && (
          <Run2Scene key="d4r" label="Scene 4 · After" sub="You are the decision-maker" subClass="teal" clock={t}
            art={<FlightDeck doorOpen={1} threat={false} aiEyes />} vignette="teal">
            <Consequence good
              goodText={<DialResult dial={choices.dial} />}
              onNext={() => go("ending")} nextLabel="See the outcome →" />
          </Run2Scene>
        )}

        {step === "ending" && <Run2Ending key="e" onNext={onComplete} />}
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
        You are no longer the person in the seat. You are the <b style={{ color: "var(--g-cyan)" }}>decision-maker</b> the
        system reports to. It does the physical work; it stops only for the calls that are
        genuinely yours — money, care, risk. Watch how calm this is.
      </p>
      <div className="g-actions" style={{ marginTop: 36 }}>
        <button className="g-btn big teal" onClick={onNext}>Run it again →</button>
      </div>
    </motion.div>
  );
}

function Run2Scene({ label, sub, subClass, clock, art, children, vignette }: {
  label: string; sub: string; subClass?: string; clock: string;
  art: React.ReactNode; children: React.ReactNode; vignette?: "teal" | "coral";
}) {
  return (
    <motion.div className="g-stage" {...fade} style={{ justifyContent: "flex-start", paddingTop: 72 }}>
      {vignette === "teal" && <div className="g-vig-teal" />}
      {vignette === "coral" && <div className="g-vig-coral" />}
      <div className="g-scene-label">{label}<span className={`role ${subClass}`}>{sub}</span></div>
      <div style={{ flex: 1, display: "grid", placeItems: "center", width: "100%", minHeight: 0 }}>
        <div style={{ opacity: 0.85 }}>{art}</div>
      </div>
      <div style={{ position: "relative", zIndex: 6, width: "100%", display: "flex", justifyContent: "center", paddingBottom: 20 }}>
        {children}
      </div>
    </motion.div>
  );
}

type Action = { label: string; kind: "gold" | "teal" | "ghost"; onClick: () => void };

function ReportCard({ t, said, rec, question, actions, countdown }: {
  t: string; said: React.ReactNode; rec: React.ReactNode; question: string;
  actions: Action[]; countdown?: boolean;
}) {
  const [ms, setMs] = useState(4200);
  useEffect(() => {
    if (!countdown) return;
    const start = performance.now(); let raf = 0;
    const tick = (now: number) => { const left = Math.max(0, 4200 - (now - start)); setMs(left); if (left > 0) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [countdown]);

  return (
    <motion.div className="g-report" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
      {countdown && (
        <div className="g-confirm-ring" style={{ position: "absolute", top: -14, right: 20 }}>
          <div className="num">{(ms / 1000).toFixed(1)}s</div>
          <div className="lab">human confirm</div>
        </div>
      )}
      <div className="src"><span className="dot" /><span className="nm">Nerve Center · to you</span><span className="t">{t}</span></div>
      <div className="said">{said}</div>
      <div className="rec">{rec}</div>
      <div className="q">{question}</div>
      <div className="acts">
        {actions.map((a, i) => (
          <button key={i} className={`g-btn ${a.kind}`} onClick={a.onClick}>{a.label}</button>
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

function DialResult({ dial }: { dial?: string }) {
  if (dial === "standing") return <>Standing adaptive authority granted. Irreversible acts proceed on scene judgment — logged, streamed to ATC, countermandable by any conscious crew member, low-confidence scenes still escalate. <span className="dim">Every action builds a trust record. Revocable in one tap.</span></>;
  if (dial === "confirms") return <>Live human confirms retained. Median confirm time: 4.2 s. <span className="dim">Every confirm builds the trust record; the system will propose standing authority once it has earned it. You decide — it never does.</span></>;
  if (dial === "doctrine") return <>Fixed doctrine retained. The system will log every scene that diverges from the playbook and show you a divergence report. <span className="dim">For reference: last month's T+1:05 scene had no matching rule — and would have waited for one.</span></>;
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

/* airport contact animation (the cut ground phase, as a 5s nod) */
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

function Run2Ending({ onNext }: { onNext: () => void }) {
  useEffect(() => { const t = setTimeout(onNext, 8000); return () => clearTimeout(t); }, [onNext]);
  return (
    <motion.div className="g-stage" {...fade}>
      <div className="g-vig-teal" />
      <motion.div className="g-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <div className="g-kicker teal">Resolved</div>
        <div className="g-title" style={{ fontSize: "clamp(28px,4.4vw,50px)" }}>
          Same 174. Nobody needed luck —<br />and nobody needed a rule that happened to fit.
        </div>
        <p className="g-prose" style={{ margin: "24px auto 0", textAlign: "center" }}>
          You made <b style={{ color: "var(--g-gold)" }}>four decisions</b>. The machine did the rest — saw the scene,
          guarded the envelope, opened the door, guided the aircraft, informed the airport.
        </p>
        <div className="g-actions" style={{ marginTop: 34 }}>
          <button className="g-btn big gold" onClick={onNext}>See the outcome & the risks</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
