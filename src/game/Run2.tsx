import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArtCross, preloadArt, PlateOverlay, resetPlates } from "./SceneArt";
import { useFrozen, timeFrozen, startPausableTimeout, unfreezeForAdvance } from "./time";
import { setBackHandler, setSkipHandler } from "./nav";
import { sound } from "./audio";
import type { ArtKey } from "./art";

preloadArt([
  "r2-detected", "r2-unlocked", "r2-alert",
  "r2-stabilized", "r2-flying", "r2-airport-alarm", "r2-airport-ready",
  // d4_result closes on Run 1's reunion art — the same 174 people, now safe.
  // Preloaded here too so the plate never flash-loads it on first arrival.
  "s4-reunion",
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

/** Confirm window before the AI takes its recommended action (Run 2). */
const CONFIRM_MS = 10000;

/** Event clock per step, in seconds. Drives BOTH the report-card label and
 *  the HUD clock, so they can never disagree. */
const STEP_SECONDS: Record<Step, number> = {
  intro: 0,
  d1_door: 65,       // T+1:05
  d1_result: 69,     // T+1:09
  d2_dive: 150,      // T+2:30 — the dive BEGINS here. 14,000 ft at 500 ft/s
                     // ≈ 28 s, and PLAN.md resolves it at T+3:00, so this is
                     // the only value consistent with both. It used to be 30
                     // ("30 s into the dive"), which made the HUD clock run
                     // BACKWARDS from T+1:09.
  d2_result: 180,    // T+3:00
  d3_airport: 540,   // T+9:00
  d3_result: 780,    // T+13:00
  d4_dial: 2280,     // T+38:00
  d4_result: 2284,   // T+38:04
  ending: 7200,      // shown specially as T+2:00:00
  done: 7200,
};

/** Matches the HUD formatter in Game.tsx, plus the 2h special case. */
const fmtClock = (s: number) =>
  s >= 7200
    ? "T+2:00:00"
    : `T+${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

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
  const [choices, setChoices] = useState<Run2Choices>(() => {
    // test hook: ?r2=<step>&hold=1 pre-seeds the HELD branch, so downstream
    // held-only copy can be deep-linked. &auto=1 pre-seeds the AUTO-RELEASE
    // branch (confirm window expired, AI acted on its own recommendation).
    // Both inert in normal play.
    const q = new URLSearchParams(window.location.search);
    if (q.get("hold") === "1") return { door: "hold" };
    if (q.get("auto") === "1") return { door: "auto:release" };
    return {};
  });
  const [t, setT] = useState("T+0:00");

  // One clock, two places: the report card label AND the HUD (via clockRef,
  // which Game.tsx formats with the same fmtClock). Previously Run2 never
  // wrote clockRef, so the HUD stayed frozen at T+0:00 for the whole run
  // while the cards read T+9:00.
  useEffect(() => {
    const s = STEP_SECONDS[step];
    if (s === undefined) return;
    clockRef.current = s;
    setT(fmtClock(s));
  }, [step, clockRef]);

  // A (re)started run plates every image again — see Run1 for why this is
  // render-time and not an effect.
  const platesReset = useRef(false);
  if (!platesReset.current) { platesReset.current = true; resetPlates(); }

  // Back navigation: remember each step we advance FROM, together with the
  // choices that were live then, so returning is an honest rewind rather than
  // a jump that leaves stale decisions behind.
  const history = useRef<{ step: Step; choices: Run2Choices }[]>([]);

  const go = (s: Step, patch?: Partial<Run2Choices>) => {
    // Advancing means the presenter is done with this screen: arrive live, not
    // frozen. See unfreezeForAdvance in time.ts for why this is one helper.
    unfreezeForAdvance();
    history.current.push({ step, choices });
    if (patch) { const nc = { ...choices, ...patch }; setChoices(nc); onChoices(nc); }
    setStep(s);
  };

  const back = () => {
    const prev = history.current.pop();
    if (!prev) return;
    // never rewind past the point where the run handed off
    if (step === "done") return;
    setChoices(prev.choices);
    onChoices(prev.choices);
    setStep(prev.step);
  };

  // expose Back to the HUD while this run owns the screen
  useEffect(() => {
    const register = () => setBackHandler(history.current.length > 0 && step !== "done" ? back : null);
    register();
    return () => setBackHandler(null);
    // re-register whenever the stack depth or step changes so canBack stays honest
  }, [step, choices]);

  // expose Skip-to-end: this run's ending is the OUTCOME screen, which then
  // hands off to the dossier. Skipping here is the intended shortcut.
  useEffect(() => {
    const skip = () => go("ending");
    setSkipHandler(step !== "ending" && step !== "done" ? skip : null);
    return () => setSkipHandler(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, choices]);

  // demo mode: auto-advance intro/ending and auto-pick recommended actions
  useEffect(() => {
    if (!demo) return;
    if (step === "intro") { const t = setTimeout(() => go("d1_door"), 900); return () => clearTimeout(t); }
    if (step === "ending") { const t = setTimeout(onComplete, 2500); return () => clearTimeout(t); }
    const auto: Partial<Record<Step, { to: Step; patch?: Partial<Run2Choices>; act?: () => void }>> = {
      d1_door: { to: "d1_result", patch: { door: "release" } },
      d1_result: { to: "d2_dive" },
      d2_dive: { to: "d2_result", patch: { dive: "guide" } },
      d2_result: { to: "d3_airport" },
      d3_airport: { to: "d3_result", patch: { airport: "confirm" } },
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
  /* The confirm window expired and the AI released on its own recommendation
     (recorded "auto:release"). Downstream copy must never credit a human for
     it — same invariant as humanDecisions() and the ending's decision count. */
  const autoDoor = choices.door === "auto:release";

  /* Run 2's beds, owned entirely here (Game.tsx only scores the phases where
     no run is mounted — see the ownership note there). Palette notes are in
     audio.ts — the same D-minor event as Run 1, rendered in pure sines and
     precision ticks because the difference between the runs is who is doing
     the work, and that should be audible. */
  useEffect(() => {
    const bed: Record<Step, Parameters<typeof sound.setScene>[0]> = {
      intro: "r2_base",
      d1_door: "r2_deck", d1_result: "r2_deck",
      d2_dive: "r2_dive", d2_result: "r2_dive",
      d3_airport: "r2_ground", d3_result: "r2_ground",
      d4_dial: "r2_after", d4_result: "r2_after",
      ending: "r2_resolve", done: "r2_resolve",
    };
    sound.setScene(bed[step]);
    /* The dive step is the one place Run 2 lets the wind blow — the same
       storm as Run 1 scene 3, but at machine-steady level (see r2_dive's
       near-zero gust LFO). It eases the moment the nose comes up. */
    sound.setIntensity({ wind: step === "d2_dive" ? 0.8 : 0, heart: 0, tension: 0 });
  }, [step]);

  return (
    <div className="g-stage">
      <div id="r2probe" data-step={step} data-choices={JSON.stringify(choices)} style={{ display: "none" }} />
      <AnimatePresence mode={demo ? "sync" : "wait"}>
        {step === "intro" && <Run2Intro key="i" onNext={() => go("d1_door")} />}

        {/* D1 — the door */}
        {step === "d1_door" && (
          <Run2Scene key="d1" demo={demo} brief={<>T+1:05, flight deck. The captain is down at a sealed door.</>}
            statusLabel="Flight deck · live" label="Scene 1 · In the air" photo="r2-detected"
            sub="You are the decision-maker" subClass="teal" clock={t}
            /* The attacker thread — canonical sequence (Ashley, locked):
               the co-pilot is NOT down before the release, in EITHER run. He is
               inside the flight deck, at the controls. The AI's contribution is
               that it reports his location and status to the cabin crew BEFORE
               the door opens, so they enter knowing what they are walking into —
               and then the CREW handle him AFTER the release. The AI never
               touches him; PLAN.md:121 holds ("cannot stop the axe from
               swinging... everything after the swing").
               This makes both runs the same event: in each, people get into the
               flight deck and subdue him. The only difference is HOW the door
               opened — a dying man's arm versus a tracked scene plus a human yes
               — and that the crew are no longer going in blind. That contrast IS
               the argument, so it belongs in the `said` line the player actually
               reads, not only in these ambient rows.
               NOTE: the r2-detected art now carries the AI's own threat-ID overlay
               ("CO-PILOT · UNAUTHORIZED CONTROL / ACTIVE INTRUSION") in the TOP-RIGHT
               corner, where this status panel also sits — so the panel deliberately
               OMITS an "Attacker" row. The image already names and locates him; a row
               here would label him twice in the same corner. The `said` prose still
               states it (bottom-center, no collision). "Crew · Briefed", not
               "vectored": informing is what was agreed; "vectored" would imply the
               AI directing a grab. */
            status={[["Door lock", "Sealed"], ["Crew", "Briefed · 3 at door"], ["Souls", "174"], ["Playbook match", "None"]]}
            vignette="teal">
            <ReportCard
              t={t}
              said={<>Intrusion in the flight deck. <span className="em">Captain unresponsive</span>. Co-pilot at the controls. Crew briefed — location and status.</>}
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
            /* The auto variant (window expired) must not credit the player:
               "on your word" is a lie when the AI acted on its own logged
               recommendation. Ashley's exact sentence, minus the period inside
               the quote. */
            brief={held
              ? <>You held. The lock stays sealed.</>
              : autoDoor
                ? <>The latch released by the Nervous System due to no response from you.</>
                : <>The latch releases on your word.</>}
            statusLabel="Flight deck · live" label="Scene 1 · In the air"
            photo={held ? "r2-detected" : "r2-unlocked"}
            sub="You are the decision-maker" subClass="teal" clock={t}
            status={held
              // held reuses r2-detected, whose baked-in AI overlay already labels
              // the co-pilot ("ACTIVE INTRUSION") in this same top-right corner —
              // so no "Attacker" row here (same de-dup as d1_door). The held cost
              // is carried by "Captain · Unaided": the door stayed sealed, crew
              // never got in, nobody reached him.
              ? [["Door lock", "Held sealed"], ["Captain", "Unaided"], ["Souls", "174"]]
              // released shows r2-unlocked (latch + green LED), which has NO baked
              // threat text, so this row is not a duplicate — it carries the outcome.
              // The Confirm row names WHO released: a human, or the machine on its
              // own logged recommendation when the window expired. Never both.
              : autoDoor
              ? [["Door lock", "Released"], ["Attacker", "Subdued by crew on entry"], ["Medical", "Reached minutes sooner"], ["Confirm", "Auto · window expired"]]
              : [["Door lock", "Released"], ["Attacker", "Subdued by crew on entry"], ["Medical", "Reached minutes sooner"], ["Confirm", "Human · 4.2 s"]]}
            vignette="teal">
            {/* One contrast line, released path only. The true difference between
                the two runs is NOT that the AI stopped him (it can't) — in both
                runs crew physically subdue him. It's that here they entered
                BRIEFED on his location and status, instead of going in blind on
                a dying man's arm and luck. Held path: crew never get in, so the
                contrast doesn't apply and the row above carries the cost. */}
            {!held && (
              <div style={{ fontFamily: "var(--g-body)", fontSize: 11, letterSpacing: "0.04em",
                color: "var(--g-dim)", textAlign: "center", marginTop: -4, marginBottom: 2 }}>
                In Run 1 they went in blind. Here they were briefed.
              </div>
            )}
            <ResultBar onNext={() => go("d2_dive")} />
          </Run2Scene>
        )}

        {/* D2 — the dive (softened: stabilize + guide) */}
        {step === "d2_dive" && (
          <Run2Scene key="d2" demo={demo} brief={<>Falling. Uncommanded. 14,000 ft in 30 s.</>}
            statusLabel="Aircraft state · live" label="Scene 2 · The dive"
            /* The DECISION screen shows the PROBLEM: the aircraft falling. The
               brief says "Falling. Uncommanded." so the picture must agree —
               a level flight deck here reads as already-solved and robs the
               choice of its stakes. The empty flight deck (r2-flying) now
               lands on d2_result, as the payoff for authorizing.
               Same image on both paths: the plane is falling either way; only
               who can fly it differs (see the status rows below). */
            photo="s3-dive"
            sub="You are the decision-maker" subClass="teal" clock={t}
            status={held
              ? [["Altitude", "−14,000 ft"], ["Rate", "500 ft / s"], ["Cockpit door", "Sealed by your hold"], ["Pilots able", "None — ground only"]]
              : [["Altitude", "−14,000 ft"], ["Rate", "500 ft / s"], ["Envelope", "Held by intent-guard"], ["Pilots aboard", "None able"]]}
            vignette="teal">
            <ReportCard
              t={t}
              rec={held
                ? <>No one can reach the flight deck. I <b>stabilize and guard the envelope</b> — a ground pilot flies it home over my link. Auto-land only where certified.</>
                : <>No one aboard can land this. I <b>stabilize and guide</b> — the off-duty crew or a ground pilot flies. Auto-land only where certified.</>}
              actions={[
                /* One action + the clock. "Keep searching" was removed because
                   it wrote dive:"search", which nothing ever read — a fork that
                   changed nothing downstream yet still counted toward "you made
                   four decisions". Authorize-or-expire IS the thesis: the
                   machine acts, the human confirms. */
                { label: "Authorize", kind: "teal", onClick: () => go("d2_result", { dive: "guide" }) },
              ]}
              countdown
              onExpire={demo ? undefined : () => go("d2_result", { dive: "auto:guide" })}
            />
          </Run2Scene>
        )}
        {step === "d2_result" && (
          <Run2Scene key="d2r" demo={demo} brief={<>The nose comes up.</>}
            statusLabel="Aircraft state · live" label="Scene 2 · The dive"
            /* Ashley: the stabilized plane on BOTH paths, and on the held path
               BOTH images in sequence. So held shows the recovery shot first
               ("the dive is arrested"), then cuts to the empty flight deck —
               which is what actually proves "Controls · Ground pilot": nobody
               aboard is flying it. Each picture gets its own clean plate and
               its own look beat; only the last one carries the card.
               Released keeps the single exterior recovery shot, where the
               off-duty crew are physically at the yoke. */
            photo={held ? undefined : "r2-stabilized"}
            photoSeq={held ? [
              { art: "r2-stabilized", brief: <>The nose comes up.</> },
              { art: "r2-flying", brief: <>Nobody is in those seats. A ground pilot is flying it — over my link.</> },
            ] : undefined}
            sub="You are the decision-maker" subClass="teal" clock={t}
            status={held
              ? [["Attitude", "Stabilized"], ["Dive", "Arrested"], ["Controls", "Ground pilot"], ["Envelope", "Guarded"]]
              : [["Attitude", "Stabilized"], ["Dive", "Arrested"], ["Controls", "Off-duty crew"], ["Envelope", "Guarded"]]}
            vignette="teal">
            <Consequence
              goodText={held
                ? <>Dive arrested. A ground pilot flies it home over my link; I hold the envelope.</>
                : <>Dive arrested. The off-duty pilots take the controls; I hold the envelope.</>}
              onNext={() => go("d3_airport")} nextLabel="Continue →" />
          </Run2Scene>
        )}

        {/* D3 — contact the airport */}
        {step === "d3_airport" && (
          <Run2Scene key="d3" demo={demo} brief={<>The nearest suitable airport — already contacted. Nobody phoned.</>}
            statusLabel="Ground response · live" label="Scene 3 · The ground" photo="r2-airport-alarm"
            sub="You are the decision-maker" subClass="teal" clock={t}
            status={[["Nearest suitable", "Contacted"], ["Fire · medical", "Rolling"], ["Stand", "Clearing"], ["Phone tree", "None"]]}
            vignette="teal">
            <ReportCard
              t={t}
              said={<>Nearest suitable airport <span className="em">contacted</span>. Fire and medical rolling, stand clearing, family assistance opening.</>}
              rec={<>They have it before the chocks. <b>No phone tree.</b> Confirm services.</>}
              actions={[
                { label: "Confirm", kind: "teal", onClick: () => go("d3_result", { airport: "confirm" }) },
              ]}
              countdown
              onExpire={demo ? undefined : () => go("d3_result", { airport: "auto:confirm" })}
            />
          </Run2Scene>
        )}
        {step === "d3_result" && (
          <Run2Scene key="d3r" demo={demo} holdBrief
            brief={<>Everything is in place before the chocks.</>}
            statusLabel="Ground response · live" label="Scene 3 · The ground"
            /* T+13:00 — landed at T+9:00, but doors and stairs are T+17:00:
               the on-stand shot (door open, airstair attached) showed a moment
               the player has not reached. The ops control room is accurate for
               this one. Plate skips, since d3_airport just showed this image:
               the rows and caption are what change. */
            photo="r2-airport-alarm" sub="You are the decision-maker" subClass="teal" clock={t}
            status={[["Fire", "On stand"], ["Medical", "On stand"], ["Counsellors", "Briefed"], ["Log", "Court-ready"]]}
            vignette="teal">
            <ResultBar onNext={() => go("d4_dial")} />
          </Run2Scene>
        )}

        {/* D4 — the authority dial. No clock: this decision waits for a human. */}
        {step === "d4_dial" && (
          <Run2Scene key="d4" demo={demo} statusLabel="Aftermath · on stand" label="Scene 4 · After"
            photo="r2-airport-ready" sub="You are the decision-maker" subClass="teal" clock={t}
            status={held
              ? [["Souls", "174 · all lived"], ["Captain", "In surgery — reached minutes later"], ["Further injuries", "Zero"], ["Audit trail", "Attached"]]
              : [["Souls", "174 · all lived"], ["Captain", "Stable in surgery"], ["Further injuries", "Zero"], ["Audit trail", "Attached"]]}
            vignette="teal">
            <ReportCard
              t={t}
              said={held
                ? <>Resolved. <span className="em">174 souls</span>. Captain reached minutes later — stable in surgery. Audit trail attached.</>
                : <>Resolved. <span className="em">174 souls</span>. Captain stable in surgery. Audit trail attached.</>}
              /* CUT FOR TIME: both branches ended with "2015 was the alternative: a
                 rule that couldn't be broken." — the Germanwings reference. Removed
                 from the card the CEO actually reads; the argument survives as the
                 reserve ANSWER to "why not just write a better rule?" and still
                 fires if they press Fixed doctrine (see DialResult below).
                 ORIGINAL:
                   ? <>At T+1:05 no playbook fit. I saw, summarized, recommended — and got <b>no response</b>, so I acted on my own logged recommendation. 2015 was the alternative: a rule that couldn't be broken.</>
                   : <>At T+1:05 no playbook fit. I saw, summarized, recommended — and waited <b>4.2 s</b> for a human. 2015 was the alternative: a rule that couldn't be broken.</> */
              rec={autoDoor
                ? <>At T+1:05 no playbook fit. I saw, summarized, recommended — and got <b>no response</b>, so I acted on my own logged recommendation.</>
                : <>At T+1:05 no playbook fit. I saw, summarized, recommended — and waited <b>4.2 s</b> for a human.</>}
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
          <Run2Scene key="d4r" demo={demo} statusLabel="Governance · recorded" label="Scene 4 · After"
            /* Families on the ground, safe. This screen is the payoff for the
               authority decision, so it shows what the governance bought —
               not the mid-crisis cabin (door open, blood) it used to, which
               contradicted both the T+38:04 clock and rows like "Authority ·
               Recorded" and "Revocable · One tap". Run 1's art, deliberately:
               the same 174 people, now on the other side of it. */
            photo="s4-reunion" sub="You are the decision-maker" subClass="teal" clock={t}
            status={[["Authority", "Recorded"], ["Trust record", "Building"], ["Revocable", "One tap"], ["Next divergence", "Logged"]]}
            vignette="teal">
            <Consequence
              goodText={<DialResult dial={choices.dial} />}
              onNext={() => go("ending")} nextLabel="See the outcome →" />
          </Run2Scene>
        )}

        {step === "ending" && <Run2Ending key="e" decisions={humanDecisions(choices)} held={held} onNext={onComplete} />}
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

function Run2Scene({ label, sub, subClass, clock, status, children, vignette, photo, photoSeq, statusLabel, brief, settleMs, demo, holdBrief }: {
  label: string; sub: string; subClass?: string; clock: string;
  /** plain-text situation readout, replacing the old schematic box */
  status?: [string, string][];
  children: React.ReactNode; vignette?: "teal" | "coral";
  photo?: ArtKey; statusLabel?: string;
  /** several pictures for ONE step: each gets its own clean plate and its own
   *  look beat, and only the LAST one carries the card. Used where a single
   *  image cannot carry the claim — held d2 needs the recovery shot AND the
   *  empty flight deck that proves who is actually flying it. */
  photoSeq?: { art: ArtKey; brief?: React.ReactNode }[];
  /** orienting line shown during the "look" beat, before any decision is asked */
  brief?: React.ReactNode;
  /** keep the brief on screen after the beat (result steps with no card text) */
  holdBrief?: boolean;
  /** ms to hold the photo before the decision card appears (0 = immediate) */
  settleMs?: number; demo?: boolean;
}) {
  // clean plate first: the picture alone, full brightness, nothing on it.
  // The look beat only starts once the plate lifts.
  const seq = photoSeq && photoSeq.length > 0 ? photoSeq : null;
  const [idx, setIdx] = useState(0);
  const art: ArtKey | undefined = seq ? seq[idx].art : photo;
  // per-image caption: a sequence can annotate each picture separately
  const activeBrief = seq ? (seq[idx].brief ?? brief) : brief;
  const isLast = !seq || idx >= seq.length - 1;

  // decision steps breathe longer; result steps just get a short beat
  const base = settleMs ?? (activeBrief ? (demo ? 750 : 2400) : (demo ? 450 : 1100));
  const [revealed, setRevealed] = useState(!art);
  const [settled, setSettled] = useState(base <= 0);
  // Reset during RENDER, not in an effect, when the picture actually changes
  // (never on mount: a skipped plate calls onReveal from the child, whose
  // effects run first, and an effect here would wipe that and hide the card
  // forever). An effect would also leave one render where `revealed` is still
  // true for the NEW art — enough for the beat timer below to start before
  // the new plate, flashing the card over a picture that hasn't been shown.
  const prevPhoto = useRef(art);
  if (prevPhoto.current !== art) {
    prevPhoto.current = art;
    setRevealed(false);
    setSettled(false);   // the new picture earns its own beat before any card
  }

  useEffect(() => {
    if (!revealed) return;          // don't burn the beat while the plate is up
    if (base <= 0) {
      // mid-sequence still advances even with no beat to wait out
      if (!isLast) { setIdx((i) => i + 1); return; }
      setSettled(true); return;
    }
    // pausable: a frozen clock must not silently swallow the look beat
    return startPausableTimeout(() => {
      // mid-sequence: advance to the next picture instead of showing the card.
      // The art change above re-runs the plate and this beat for that image,
      // so every picture still gets the screen to itself first.
      if (!isLast) { setIdx((i) => i + 1); return; }
      setSettled(true);
    }, base);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, revealed, isLast, art]);

  return (
    <motion.div className="g-stage" {...fade} style={{ justifyContent: "flex-start", paddingTop: 72 }}>
      {art
        ? <ArtCross art={art} dim={settled ? 0.46 : 0.3} fallback={<div className="g-vig-teal" />} />
        : vignette === "teal" && <div className="g-vig-teal" />}
      {!art && vignette === "coral" && <div className="g-vig-coral" />}
      {revealed && <div className="g-scene-label">{label}<span className={`role ${subClass}`}>{sub}</span></div>}

      {/* the readout arrives WITH the decision — during the look beat it's just the photo.
          Plain text, no box: the picture is the visual, the words are the data. */}
      {status && status.length > 0 && (
        <motion.div className="g-status"
          initial={false}
          animate={{ opacity: settled ? 1 : 0, y: settled ? 0 : -8 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <div className="g-status-h">{statusLabel ?? "Live model"}</div>
          <dl>
            {status.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </motion.div>
      )}

      <PlateOverlay art={art} demo={demo} onReveal={() => setRevealed(true)} />

      {/* spacer: the readout is absolutely positioned, so this is what pushes
          the caption / decision card to the bottom of the stage */}
      <div style={{ flex: 1, minHeight: 0 }} />

      {/* bottom: orienting caption during the look-beat, decision/outcome card once settled */}
      <div style={{ position: "relative", zIndex: 6, width: "100%", minHeight: 170 }}>
        <AnimatePresence>
          {revealed && !settled && activeBrief && (
            <motion.div key={`brief-${idx}`} className="g-brief"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.22 } }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              <span className="g-brief-k">Reading the scene</span>
              <div className="g-brief-t">{activeBrief}</div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* children mount only after the beat, so the confirm clock starts
            when the player is actually asked to decide */}
        {revealed && settled && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, paddingBottom: 20 }}>
            {holdBrief && activeBrief && (
              <div className="g-brief static">
                <div className="g-brief-t">{activeBrief}</div>
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
  /** confirm clock; at zero the AI takes the recommended action */
  countdown?: boolean; onExpire?: () => void;
}) {
  const [ms, setMs] = useState(CONFIRM_MS);
  const [more, setMore] = useState(false);
  const expRef = useRef(onExpire); expRef.current = onExpire;
  const fired = useRef(false);
  const frozen = useFrozen();

  /* The card arriving IS the machine speaking: one quiet data-blip when it
     mounts. Decision buttons get a single ack tone on click (wired in the
     acts map below), so every confirm is audible — which is the thesis:
     the machine acts, the human confirms. */
  useEffect(() => { sound.sfx("data"); }, []);

  useEffect(() => {
    // setInterval (not RAF) so the clock also advances under headless virtual-time
    if (!countdown) return;
    let start = Date.now();
    const id = setInterval(() => {
      // While frozen the window does not burn: slide the start forward by the
      // tick so the remaining time holds exactly where the player left it.
      if (timeFrozen()) { start += 100; return; }
      const left = Math.max(0, CONFIRM_MS - (Date.now() - start)); setMs(left);
      if (left <= 0 && !fired.current) { fired.current = true; clearInterval(id); expRef.current?.(); }
    }, 100);
    return () => clearInterval(id);
  }, [countdown]);

  /* Last 4 seconds of the confirm window: a soft metronome, 2 ticks/s. The
     player should HEAR that the AI is about to act without reading the ring.
     Fires on the second boundary so a freeze between ticks just extends the
     silence — same pausable discipline as the countdown itself. */
  const lastTick = useRef(-1);
  useEffect(() => {
    if (!countdown || ms > 4000) return;
    const slot = Math.ceil(ms / 500);          // 8 slots over 4 s
    if (slot !== lastTick.current) { lastTick.current = slot; sound.sfx("tick"); }
  }, [ms, countdown]);

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
          <button key={i} className={`g-btn ${a.kind}`}
            onClick={a.more ? () => setMore((v) => !v) : () => { sound.sfx("ack"); a.onClick?.(); }}>{a.label}</button>
        ))}
      </div>
    </motion.div>
  );
}

function Consequence({ goodText, onNext, nextLabel }: {
  goodText: React.ReactNode;
  onNext: () => void; nextLabel: string;
}) {
  /* One fixed cyan style. The coral/"Alternate outcome" branch was dead code
     (every call site passed good truthy and nothing ever passed badText), and
     Ashley asked for consistent colour rather than colour-coded outcomes.
     Border now uses the game palette's --g-lav: this was the one component
     still reaching into the deep-dive page's --ai-line/--today-line vars,
     left behind during the Slidesgo reskin. */
  return (
    <motion.div className="g-report" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }} style={{ borderColor: "var(--g-lav)" }}>
      <div className="src"><span className="dot" style={{ background: "var(--g-cyan)" }} />
        <span className="nm" style={{ color: "var(--g-cyan)" }}>Outcome</span></div>
      <div className="g-consequence" style={{ marginTop: 0 }}>{goodText}</div>
      <div className="acts" style={{ marginTop: 20 }}>
        <button className="g-btn teal" onClick={() => { sound.sfx("ack"); onNext(); }}>{nextLabel}</button>
      </div>
    </motion.div>
  );
}

/** result step with no card copy left — the photo/animation is the content */
function ResultBar({ onNext, label = "Continue →" }: { onNext: () => void; label?: string }) {
  return (
    <motion.div className="g-resultbar" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
      <button className="g-btn teal" onClick={() => { sound.sfx("ack"); onNext(); }}>{label}</button>
    </motion.div>
  );
}

function DialResult({ dial }: { dial?: string }) {
  if (dial === "standing") return <>Granted. Irreversible acts proceed on scene judgment — logged, streamed to ATC, countermandable by any conscious crew member. Low confidence still escalates. <span className="dim">Revocable in one tap.</span></>;
  if (dial === "confirms") return <>Retained. Median confirm: 4.2 s. <span className="dim">Every confirm builds the trust record; it proposes standing authority once it has earned it. You decide — it never does.</span></>;
  /* Fixed doctrine deserves a real answer, not a shrug. It is the option this
     whole piece argues against, so it is exactly where the CEO's pick should
     get the counter-argument — the doctrine trap from THINKING.md: the
     post-2015 rule was SATISFIED during this event, because the attacker was
     the second person in the cockpit. */
  return <>Recorded — and already out of date. <span className="dim">Post-2015 rule: never leave a pilot alone. It was satisfied tonight. The attacker was the second person. Every rule is an autopsy turned into policy; the next scene won't be in it.</span></>;
}

function Run2Ending({ decisions, held, onNext }: { decisions: number; held?: boolean; onNext: () => void }) {
  // pausable: freezing must hold here too, so the presenter can talk over the
  // outcome screen without it walking itself into the dossier
  useEffect(() => startPausableTimeout(onNext, 8000), [onNext]);
  /* "Same 174. No luck needed." — the resolve swell lands as the screen
     does. This is the last sound the game makes; it should feel like one. */
  useEffect(() => { sound.sfx("resolve"); }, []);
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
          {/* {" "} is load-bearing: splitting this sentence into a conditional
              makes the JSX whitespace adjacent to an expression container, and
              JSX drops that space (".The machine"). A literal space inside the
              fragment would be trimmed as line-leading whitespace. */}
          {" "}
          {/* The held branch never opened the door, so it must not be credited
              with "opened" — the run has to remember what you actually chose. */}
          {held
            ? <>The machine did the rest: saw, guarded, guided, informed.</>
            : <>The machine did the rest: saw, guarded, opened, guided, informed.</>}
        </p>
        <div className="g-actions" style={{ marginTop: 34 }}>
          <button className="g-btn big gold" onClick={onNext}>See the outcome & the risks</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
