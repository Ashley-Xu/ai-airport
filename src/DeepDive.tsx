import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   "The Nervous System" — an AI-native airport concept
   Option D: cinematic spine (snapped beats) + operations texture
   Palette discipline: coral = Today, teal = AI-native,
   gold = humans deciding (never data). Coral & teal never mix.
   COPY RULE: one line per card; the graphics carry the argument.
   ══════════════════════════════════════════════════════════════ */

/* ───────────────────────── timeline data ───────────────────────── */

type Ev = { tag: string; title: string; body: string; hero?: boolean } | null;
type Row = { clock: string; today: Ev; ai: Ev; ghostToday?: string; ghostAi?: string; jump?: boolean };

const AIR_ROWS: Row[] = [
  {
    clock: "T+0:00",
    today: {
      tag: "Locked",
      title: "The attack begins",
      body: "Door locked from inside. The only key: the dying captain's hand.",
    },
    ai: {
      tag: "Sense",
      title: "Scene understood in under 2 s",
      body: "Cameras flag violent contact and posture collapse. Every person tracked.",
      hero: true,
    },
  },
  {
    clock: "T+0:08",
    today: null,
    ghostToday: "— nobody on the ground knows —",
    ai: {
      tag: "Summarize",
      title: "One sentence + a 6-second clip",
      body: "Streamed to ATC, airline, airport. A human acknowledges — in seconds.",
      hero: true,
    },
  },
  {
    clock: "T+1:05",
    today: {
      tag: "Nothing",
      title: "No rule for this",
      body: "The binder says: the door does not open.",
    },
    ai: {
      tag: "Judge",
      title: "No playbook matches — so it sees",
      body: "Faces, crew state, aircraft state. Summarize. Recommend. Ask one human.",
      hero: true,
    },
    jump: true,
  },
  {
    clock: "T+1:09",
    today: null,
    ghostToday: "— minutes to tell, convince, authorize —",
    ai: {
      tag: "Confirmed",
      title: "A human says yes in 4.2 s",
      body: "Door opens ~40 s sooner. The machine saw; a human decided.",
      hero: true,
    },
    jump: true,
  },
  {
    clock: "T+2:30",
    today: {
      tag: "Falling",
      title: "The dive",
      body: "14,000 ft in 30 s. On the ground, a radar symbol falls.",
    },
    ai: {
      tag: "Guard",
      title: "The dive is arrested",
      body: "Intent-guard holds the envelope; a human flies it level.",
      hero: true,
    },
  },
  {
    clock: "T+3:00",
    today: {
      tag: "Luck",
      title: "Two off-duty pilots take over",
      body: "They happened to be sitting in the cabin.",
    },
    ai: {
      tag: "No luck",
      title: "Stabilized and guided — humans fly",
      body: "Off-duty crew or a ground pilot at the controls; the envelope held. Your airport is already choreographing.",
    },
  },
  {
    clock: "T+9:00",
    today: {
      tag: "Wheels down",
      title: "Severity learned by radio",
      body: "Mid-approach. Fire trucks still positioning.",
    },
    ai: {
      tag: "Wheels down",
      title: "Known for 8 min 52 s",
      body: "The response is already in motion.",
    },
  },
];

const GROUND_ROWS: Row[] = [
  {
    clock: "T+9:00",
    today: {
      tag: "Landing",
      title: "Fire still positioning",
      body: "Stairs unassigned. Squawk 7500 arrives by phone.",
    },
    ai: {
      tag: "Landing",
      title: "Fire arrives before chocks",
      body: "Runway–stand–apparatus computed at T+0:45.",
    },
  },
  {
    clock: "T+10:30",
    today: {
      tag: "Waiting",
      title: "On hold with the airline",
      body: "For a passenger manifest.",
    },
    ai: {
      tag: "Reconciled",
      title: "Manifest already built",
      body: "Your bag-drop + border data: medical, minors, connections.",
    },
  },
  {
    clock: "T+13:00",
    today: {
      tag: "Muster",
      title: "Stand not cleared",
      body: "Crews mustering. The injured captain waits for a bus.",
    },
    ai: {
      tag: "Act",
      title: "The apron moves itself",
      body: "Stand auto-cleared · 2,000 pax rerouted · medical robot at the door · counsellors briefed.",
      hero: true,
    },
  },
  {
    clock: "T+17:00",
    today: {
      tag: "On stand",
      title: "Buses, one at a time",
      body: "Media asks before the manifest is confirmed.",
    },
    ai: {
      tag: "On stand",
      title: "Everything in place",
      body: "Stairs, medical, police, cordon. Statement drafted.",
    },
  },
  {
    clock: "T+38:00",
    today: {
      tag: "Deplaning",
      title: "Report written from memory",
      body: "Weeks later.",
    },
    ai: {
      tag: "Last pax off",
      title: "Care already running",
      body: "Next-of-kin matched; rebooking in progress.",
    },
  },
  {
    clock: "T+2:00:00",
    today: {
      tag: "Manual",
      title: "Aftermath is manual",
      body: "Aircraft blocks two rotations.",
    },
    ai: {
      tag: "Re-planned",
      title: "The day is re-planned",
      body: "Rotations re-sequenced; court-ready report auto-assembled.",
    },
  },
];

/* ───────────────────────── primitives ───────────────────────── */

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function EventCard({ ev, side }: { ev: Ev; side: "today" | "ai" }) {
  if (!ev) return <div />;
  return (
    <div className={`ev ${side}${ev.hero ? " hero-row" : ""}`}>
      <span className="tag">{ev.tag}</span>
      <h4>{ev.title}</h4>
      <p>{ev.body}</p>
    </div>
  );
}

/* Signature move: the T-counter advancing down the spine. */
function TimelineRows({
  rows,
  lit,
  onJump,
  idPrefix,
}: {
  rows: Row[];
  lit: number;
  onJump?: () => void;
  idPrefix: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [local, setLocal] = useState(0);
  const inView = useInView(ref, { margin: "-90px" });

  useEffect(() => {
    if (!inView) return;
    const nodes = ref.current?.querySelectorAll<HTMLElement>(".tl-row");
    if (!nodes) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            setLocal((c) => Math.max(c, idx + 1));
          }
        });
      },
      { threshold: 0.5 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [inView]);

  const shown = Math.max(lit, local);

  return (
    <div ref={ref} id={idPrefix}>
      {rows.map((row, i) => (
        <div key={row.clock + i} className={`tl-row ${i < shown ? "lit" : ""}`} data-idx={i}>
          <div className="cell">
            {row.today ? (
              <EventCard ev={row.today} side="today" />
            ) : (
              <div className="ev ghost today">
                <span>{row.ghostToday}</span>
              </div>
            )}
          </div>
          <div className="clock">
            <div className="t">{row.clock}</div>
          </div>
          <div className="cell">
            {row.ai ? <EventCard ev={row.ai} side="ai" /> : <div className="ev ghost ai"><span>{row.ghostAi}</span></div>}
            {row.jump && shown > i && onJump && (
              <button className="jump" onClick={onJump}>
                ↳ see the judgment moment
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────── schematic flight-deck plan (abstract, no imagery) ─────────── */

function FlightDeckSchematic({ doorOpen }: { doorOpen: boolean }) {
  // Annotation sequence: each appears as the system "sees" it.
  const [step, setStep] = useState(0);
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { margin: "-80px" });

  useEffect(() => {
    if (!inView || step >= 5) return;
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 260 : 620);
    return () => clearTimeout(t);
  }, [inView, step]);
  const A = (n: number) => ({
    initial: { opacity: 0 },
    animate: step >= n ? { opacity: 1 } : { opacity: 0 },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <svg ref={ref} className="schematic" viewBox="0 0 520 300" role="img"
         aria-label="Schematic top-down plan of a flight deck and forward cabin">
      {/* forward fuselage + cabin outline */}
      <path className="hull-soft" d="M60 150 Q60 60 150 46 L400 46 Q470 46 470 150 Q470 254 400 254 L150 254 Q60 240 60 150 Z" />
      <path className="hull" d="M60 150 Q60 60 150 46 L400 46 Q470 46 470 150 Q470 254 400 254 L150 254 Q60 240 60 150 Z" />

      {/* flight deck bulkhead + door */}
      <line className="bulkhead" x1="196" y1="52" x2="196" y2="248" />
      <line className="door-geo" x1="196" y1="112" x2={doorOpen ? 168 : 196} y2={doorOpen ? 150 : 188}
            style={{ transition: "all 0.9s cubic-bezier(0.22,1,0.36,1)" }} />
      <text className="lbl" x="120" y="40">FLIGHT DECK</text>
      <text className="lbl" x="250" y="40">CABIN · FWD</text>
      <text className="lbl lbl-gold" x="150" y="205">{doorOpen ? "DOOR · RELEASED" : "DOOR · LOCKED FROM INSIDE"}</text>

      {/* crew stations inside */}
      <rect className="seat" x="104" y="98" width="34" height="26" rx="5" />
      <rect className="seat" x="104" y="176" width="34" height="26" rx="5" />
      <text className="lbl" x="104" y="92">CPT</text>
      <text className="lbl" x="104" y="172">F/O</text>

      {/* forward cabin seat blocks */}
      {[0, 1, 2, 3].map((r) => (
        <rect key={r} className="seat-block" x={232 + r * 52} y="72" width="38" height="52" rx="4" />
      ))}
      {[0, 1, 2, 3].map((r) => (
        <rect key={`b${r}`} className="seat-block" x={232 + r * 52} y="176" width="38" height="52" rx="4" />
      ))}

      {/* scan sweep — the system perceiving */}
      <motion.g {...A(1)}>
        <path className="scan" d="M212 60 L300 60 M212 100 L340 100 M212 140 L300 140 M212 180 L340 180 M212 220 L300 220" />
      </motion.g>

      {/* perception: crew posture collapse inside */}
      <motion.g {...A(2)}>
        <circle className="ring ai" cx="121" cy="111" r="13" />
        <circle className="core ai" cx="121" cy="111" r="3.4" />
        <circle className="ring ai" cx="121" cy="189" r="13" />
        <circle className="core ai" cx="121" cy="189" r="3.4" />
        <path className="leader ai" d="M121 98 L121 74 L188 74" />
        <text className="lbl lbl-ai" x="188" y="70" textAnchor="end" style={{ display: "none" }}>·</text>
      </motion.g>

      {/* perception: movement at the door */}
      <motion.g {...A(3)}>
        <circle className="ring ai" cx="214" cy="150" r="11" />
        <circle className="core ai" cx="214" cy="150" r="3.2" />
        <circle className="ring ai" cx="238" cy="132" r="9" />
        <circle className="core ai" cx="238" cy="132" r="2.6" />
        <circle className="ring ai" cx="238" cy="170" r="9" />
        <circle className="core ai" cx="238" cy="170" r="2.6" />
        <path className="leader ai" d="M214 161 L214 246 L262 246" />
      </motion.g>

      {/* judgment marker at the door */}
      <motion.g {...A(4)}>
        <circle className="ring gold" cx="196" cy="150" r="20" />
        <circle className="ring gold" cx="196" cy="150" r="29" style={{ opacity: 0.4 }} />
        <text className="lbl lbl-gold" x="196" y="150" textAnchor="middle" dy="4">?</text>
      </motion.g>

      {/* release */}
      <motion.g {...A(5)}>
        <circle className="core gold" cx="196" cy="150" r="5" />
      </motion.g>
    </svg>
  );
}

/* ─────────── apron / stand diagram (physical AI on the ground) ─────────── */

function ApronDiagram() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { margin: "-60px" });
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setOn(true), 350);
      return () => clearTimeout(t);
    }
  }, [inView]);

  const dash = {
    initial: { strokeDashoffset: 320 },
    animate: on ? { strokeDashoffset: 0 } : { strokeDashoffset: 320 },
    transition: { duration: 2.2, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <svg ref={ref} className="apron" viewBox="0 0 900 260" role="img"
         aria-label="Schematic apron plan: remote stand cleared, pier E rerouted, apparatus routed">
      {/* terminal + pier E */}
      <rect className="term" x="40" y="30" width="500" height="58" rx="6" />
      <rect className="term" x="40" y="30" width="150" height="200" rx="6" />
      <text className="lbl" x="210" y="64">TERMINAL</text>
      <text className="lbl lbl-coral" x="60" y="150" transform="rotate(-90 60 150)">PIER E · 2,000 PAX REROUTED</text>

      {/* stands */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect className={`stand${i === 3 ? " busy" : ""}`} x={250 + i * 92} y={120} width="74" height="56" rx="5" />
          <text className="lbl" x={250 + i * 92 + 8} y={115}>{["B5", "B6", "B7", "B9"][i]}</text>
        </g>
      ))}
      <text className="lbl lbl-ai" x="534" y="200">B9 CLEARED · REMOTE STAND ASSIGNED</text>

      {/* taxiways */}
      <path className="taxi" d="M40 232 L860 232" />
      <path className="taxi" d="M620 90 L620 232" />

      {/* inbound aircraft */}
      <motion.g {...(on ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.6 } } : {})}>
        <path className="ac" d="M820 232 L780 220 L770 232 L780 244 Z" />
        <text className="lbl lbl-ai" x="770" y="252">INBOUND</text>
      </motion.g>

      {/* apparatus route (gold = the choreography that was computed) */}
      <motion.path className="route gold" d="M140 232 L300 232 L420 200 L560 178" {...dash} />
      <text className="lbl lbl-gold" x="150" y="222">FIRE · ARRIVES BEFORE CHOCKS</text>

      {/* autonomous apron vehicles */}
      <motion.path className="route ai" d="M300 176 L420 176 L520 176" {...dash} />
      <motion.path className="route ai" d="M190 200 L250 200 L300 176" {...dash} />
      <text className="lbl lbl-ai" x="300" y="196">AUTONOMOUS APRON VEHICLES</text>

      {/* medical + police */}
      <circle className="lbl-ai" cx="562" cy="178" r="4" fill="var(--ai)" />
      <text className="lbl lbl-ai" x="576" y="172">MEDICAL ROBOT · PRE-POSITIONED</text>
      <text className="lbl" x="640" y="120">POLICE · GREEN-WAVE ACCESS</text>
    </svg>
  );
}

/* ─────────── the judgment beat (4.2s counts DOWN) ─────────── */

function JudgmentBeat() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-100px" });
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0); // 0 idle, 1 readout, 2 recommend, 3 confirming
  const [ms, setMs] = useState(4200);

  useEffect(() => {
    if (!inView || phase !== 0) return;
    const t = setTimeout(() => setPhase(1), 500);
    return () => clearTimeout(t);
  }, [inView, phase]);
  useEffect(() => {
    if (phase !== 1) return;
    const t = setTimeout(() => setPhase(2), 2600);
    return () => clearTimeout(t);
  }, [phase]);
  useEffect(() => {
    if (phase !== 2) return;
    const t = setTimeout(() => setPhase(3), 900);
    return () => clearTimeout(t);
  }, [phase]);

  // the one countdown in the piece
  useEffect(() => {
    if (phase !== 3) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const left = Math.max(0, 4200 - (now - start));
      setMs(left);
      if (left > 0) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const confirmed = phase === 3 && ms === 0;
  const lines = [
    { st: "SEES", txt: <>Door: <b>3 recognized cabin crew</b>. No weapon.</> },
    { st: "SEES", txt: <>Inside: <b>captain down</b> at the lock. <b>Co-pilot at the controls.</b></> },
    { st: "SEES", txt: <>Aboard: <b>174 souls</b>. Crew briefed — his location and status.</> },
    { st: "NO MATCH", txt: <><b>412 playbook branches</b> searched. None fit.</> },
  ];

  return (
    <div ref={ref} className="judgment-stage">
      <FlightDeckSchematic doorOpen={confirmed} />
      <div className="judgment-readout">
        {lines.map((l, i) => (
          <motion.div
            key={i}
            className="readout-line"
            initial={{ opacity: 0, x: -10 }}
            animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0.14, x: -10 }}
            transition={{ duration: 0.5, delay: phase >= 1 ? i * 0.42 : 0, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="st" style={l.st === "NO MATCH" ? { color: "var(--gold)" } : undefined}>{l.st}</span>
            <span>{l.txt}</span>
          </motion.div>
        ))}

        <motion.div
          className="recommend"
          initial={{ opacity: 0, y: 12 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0.18, y: 12 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="lab">Recommendation · T+1:05</div>
          <p>Release the flight-deck lock. Recognized crew at the door · captain needs medical · crew briefed on the co-pilot's position and status. Confidence: high.</p>
        </motion.div>

        <motion.div
          className="confirm"
          initial={{ opacity: 0, y: 12 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0.18, y: 12 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="lab">{confirmed ? "Confirmed · door released" : "Awaiting human · counting down"}</div>
          <div className="counter">{(ms / 1000).toFixed(1)}s</div>
          <div className="who-said">
            {confirmed ? (
              <><b>A human at ATC ops said yes.</b> Door open ~40 s sooner. Nobody consulted a rule.</>
            ) : (
              <>One live human, asked once. The only part that waits.</>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─────────── the CEO authority card ─────────── */

type Choice = "standing" | "confirms" | "doctrine" | null;

function AuthorityInbox() {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<Choice>(null);

  const OUT: Record<string, React.ReactNode> = {
    standing: (
      <>
        ✓ GRANTED · T+38:04<br />
        <span className="dim">Irreversible acts proceed on scene judgment — logged, streamed, countermandable by any conscious crew. Low-confidence scenes still escalate.</span><br />
        Reviewable quarterly. Revocable in one tap.
      </>
    ),
    confirms: (
      <>
        ✓ RECORDED · T+38:04<br />
        <span className="dim">Median confirm: 4.2 s. Every confirm builds the trust record; standing authority is proposed once earned.</span><br />
        You decide. It never does.
      </>
    ),
    doctrine: (
      <>
        ✓ RECORDED · T+38:04<br />
        <span className="dim">Policy retained. Every divergent scene logged; a divergence report after each event.</span><br />
        Last month's T+1:05 scene had no matching rule — and would have waited for one.
      </>
    ),
  };

  return (
    <div className="inbox-stage">
      <div>
        <div className="phone">
          <div className="notch" />
          <motion.div
            className="notif"
            onClick={() => setOpen(true)}
            whileHover={{ scale: 1.015 }}
            animate={open ? { opacity: 0.32 } : { opacity: 1 }}
          >
            <div className="app">
              <div className="ic">✈</div>
              <div className="nm">Airport · Nerve Center</div>
              <div className="tm">T+38</div>
            </div>
            <h4>Flight-deck event · resolved</h4>
            <p>174 souls. Captain stable. 0 further injuries. Audit trail attached. One decision needs you.</p>
            <div className="cta">{open ? "Opened" : "Tap to open →"}</div>
          </motion.div>
          <div className="hint">Your new inbox · ~3 cards a day</div>
        </div>
      </div>

      <div>
        {!open ? (
          <div className="detail-card placeholder-card">
            <p>← Tap the notification to see what the CEO actually sees</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <div className="detail-card">
              <div className="dh">
                <span className="pill resolved">Resolved</span>
                <span className="pill clock">T+0:00 → T+38:00</span>
                <span className="pill action">1 decision</span>
              </div>
              <h3>Handled before you were called</h3>
              <p className="sub">Detected T+0:00 · escalated to a human T+0:08 · court-ready log attached.</p>
              <ul className="audit">
                <li><span className="st">T+0:02 ✓</span><span><b>Scene understood</b> — violent contact flagged in &lt;2 s</span></li>
                <li><span className="st">T+0:08 ✓</span><span><b>Summary streamed</b> — sentence + clip; human acknowledged</span></li>
                <li><span className="st">T+0:45 ✓</span><span><b>Choreography computed</b> — runway, stand, apparatus</span></li>
                <li><span className="st">T+1:05 ✓</span><span><b>No playbook matched</b> — scene judgment invoked</span></li>
                <li><span className="st">T+1:09 ✓</span><span><b>Door released</b> — human confirm, 4.2 s</span></li>
                <li><span className="st">T+2:30 ✓</span><span><b>Dive arrested</b> — envelope held, humans fly</span></li>
                <li><span className="st">T+9:00 ✓</span><span><b>Fire at the door</b> — before the aircraft stopped</span></li>
                <li><span className="st">T+13:00 ✓</span><span><b>Counsellors briefed</b> — before the first family called</span></li>
                <li><span className="st">T+17:00 ✓</span><span><b>Statement drafted</b> — against your crisis policy</span></li>
                <li><span className="st">T+38:00 ✓</span><span><b>Last pax off</b> — kin matched, rebooking running</span></li>
              </ul>

              <div className="decision">
                <span className="pill action">Needs you</span>
                <div className="dq">How much judgment do we give the nervous system?</div>
                <p className="dc">At T+1:05 it met a scene no playbook covered. It saw, recommended — and waited <strong>4.2 s</strong> for a human yes. The alternative was 2015: a rule that could not be broken. <strong>Rules fail quietly in scenes nobody enumerated.</strong> Judgment must be granted, logged, revocable.</p>
                <div className="btns">
                  <button className="btn gold" onClick={() => setChoice("standing")}>Grant standing authority</button>
                  <button className="btn" onClick={() => setChoice("confirms")}>Keep live confirms (4.2 s)</button>
                  <button className="btn" onClick={() => setChoice("doctrine")}>Keep fixed doctrine</button>
                </div>
                {choice && (
                  <motion.div className="decision-out" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                    {OUT[choice]}
                  </motion.div>
                )}
              </div>
            </div>

            <p className="inbox-caption">
              <b>The whole idea:</b> not more dashboards — an inbox of decisions. It never asks <i>"what
              happened?"</i> — the airport handled that. It asks <i>"how much judgment do we grant a system
              that can see?"</i> ~3 cards a day, not 300.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ─────────── split timeline (continuous scroll region) ─────────── */

function SplitTimeline({ onJump }: { onJump: () => void }) {
  const [airLit, setAirLit] = useState(0);
  const [gndLit, setGndLit] = useState(0);
  const [playing, setPlaying] = useState<"air" | "gnd" | null>(null);

  const run = (which: "air" | "gnd") => {
    if (playing) return;
    setPlaying(which);
    const rows = which === "air" ? AIR_ROWS : GROUND_ROWS;
    const set = which === "air" ? setAirLit : setGndLit;
    set(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      set(i);
      if (i >= rows.length) {
        clearInterval(id);
        setPlaying(null);
      }
    }, 1500);
  };

  return (
    <div>
      <div className="tl-col-heads">
        <div className="h today">Today · rulebook + telephone</div>
        <div />
        <div className="h ai">AI-native · nervous system</div>
      </div>

      <div className="phase-label">Phase 1 · in the air — T+0:00 → T+9:00</div>
      <TimelineRows rows={AIR_ROWS} lit={airLit} onJump={onJump} idPrefix="tl-air" />
      <div className="demo-controls">
        <button className="btn" onClick={() => run("air")} disabled={playing !== null}>
          {playing === "air" ? "▶ Running T+0…" : "▶ Run the four minutes in the air"}
        </button>
        <button className="btn" onClick={() => setAirLit(AIR_ROWS.length)}>Skip</button>
      </div>

      <div className="phase-label">Phase 2 · on the ground — T+9:00 → T+2:00:00</div>
      <TimelineRows rows={GROUND_ROWS} lit={gndLit} onJump={onJump} idPrefix="tl-ground" />
      <div className="demo-controls">
        <button className="btn" onClick={() => run("gnd")} disabled={playing !== null}>
          {playing === "gnd" ? "▶ Running ground phase…" : "▶ Run the ground response"}
        </button>
        <button className="btn" onClick={() => setGndLit(GROUND_ROWS.length)}>Skip</button>
      </div>

      <div className="boundary">
        <div className="lab">The honest boundary</div>
        <p>
          The airport could not stop the axe from swinging. What changed is the four minutes in the air
          and the eight minutes to the chocks: a nervous system that <span className="accent">sees</span>,
          and hands that act.
        </p>
      </div>
    </div>
  );
}

/* ───────────────────────── app ───────────────────────── */

export default function DeepDive() {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      <div className="topnav">
        <div className="inner">
          <div className="brand">THE NERVOUS SYSTEM</div>
          <nav>
            <a href="#complaint">The complaint</a>
            <a href="#event">T+0:00</a>
            <a href="#doors">Two doors</a>
            <a href="#timeline">Same event twice</a>
            <a href="#judgment">The judgment</a>
            <a href="#physical">Physical AI</a>
            <a href="#inbox">Your inbox</a>
            <a href="#thinking">Thinking</a>
          </nav>
        </div>
      </div>

      {/* ── HERO ── */}
      <header className="reel hero" id="top">
        <div className="grid-bg" />
        <div className="glow teal" style={{ top: "-32%", right: "-18%" }} />
        <div className="wrap">
          <motion.div className="hero-kicker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}>
            A concept for the AI-native airport
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            By the time you hear the alarm,<br />
            the urgent steps are <span className="accent">already taken care of.</span>
          </motion.h1>
          <motion.p className="hero-sub" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.54, duration: 0.9 }}>
            One event. One clock. Two airports. It turns on a door that only opens from one side.
          </motion.p>
          <motion.div className="hero-clock" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.78, duration: 0.9 }}>
            <span className="t">T+0:00</span>
            <span>→ T+1:09 door released</span>
            <span>→ T+9:00 wheels down</span>
            <span>→ T+38:00 last passenger off</span>
          </motion.div>
        </div>
        <div className="scroll-cue"><div className="bar" />Scroll</div>
      </header>

      {/* ── BEAT 0 · THE COMPLAINT ── */}
      <section className="reel" id="complaint">
        <div className="wrap">
          <Reveal>
            <div className="kicker coral">01 · The complaint, decoded</div>
            <h2 className="head">"Screens everywhere — and we still find out too late."</h2>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="pullquote">
              The dashboard is a report about the airport, written forty minutes ago. The playbook is a
              report about the <em>last</em> crisis. Neither can see the next one.
              <span className="who">— the core insight of this concept</span>
            </div>
          </Reveal>
          <div className="tri">
            <Reveal delay={0.05}>
              <div className="card coral">
                <div className="n">Symptom 01</div>
                <h3>Data reports the past</h3>
                <p>By the time a KPI turns red, the queue has already formed.</p>
              </div>
            </Reveal>
            <Reveal delay={0.13}>
              <div className="card coral">
                <div className="n">Symptom 02</div>
                <h3>Rules rehearse the last disaster</h3>
                <p>Every doctrine is an autopsy turned into policy.</p>
              </div>
            </Reveal>
            <Reveal delay={0.21}>
              <div className="card coral">
                <div className="n">Symptom 03</div>
                <h3>Problems are physical</h3>
                <p>A door. A dive. A stand. Warning is not fixing — the human with the radio is the latency.</p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div className="pivot">
              Not a data problem. Not a rulebook problem. An <span className="accent">eyes-and-hands</span>{" "}
              problem — and the hardest proof gives you zero seconds.
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── BEAT 1 · THE EVENT ── */}
      <section className="reel" id="event">
        <div className="glow coral" style={{ top: "-24%", left: "-16%" }} />
        <div className="wrap">
          <Reveal>
            <div className="kicker coral">02 · T+0:00, zero warning</div>
            <h2 className="head">The axe swings in the flight deck.</h2>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="ground-card">
              <p>
                Last month, Dubai–Tel Aviv: a co-pilot attacked the captain with the cockpit's own crash axe
                and drove the aircraft into a dive — <strong>14,000 ft in 30 seconds</strong>. Passengers broke
                into the flight deck and subdued him; <strong>two off-duty pilots who happened to be
                aboard</strong> flew it down. 174 lived.
              </p>
              <p>Two details decide everything:</p>
              <div className="hinges">
                <div className="branch">
                  <h4>Hinge 1 · The door</h4>
                  <p>Opened only because the stabbed captain unlocked it from inside, with his last
                  strength. Ten seconds later: a wall, and everyone doomed.</p>
                </div>
                <div className="branch">
                  <h4>Hinge 2 · The controls</h4>
                  <p>Flyable only by two strangers' licences, aboard by chance. Without them, nobody left
                  alive could fly.</p>
                </div>
              </div>
              <p style={{ marginTop: 20 }}>
                Before the flight: the attacker had been <strong>barred from flying over extremism
                concerns</strong>. The airline that rostered him did not know. The signal existed — and
                reached no one.
              </p>
              <div className="punch">
                174 lived on a dying man's arm and two strangers' licences.{" "}
                <span className="accent">Luck is not a safety system.</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="stat-strip">
              <div className="s"><div className="v">174</div><div className="k">Souls aboard</div></div>
              <div className="s"><div className="v">14,000 ft</div><div className="k">Lost in under 30 s</div></div>
              <div className="s"><div className="v">T+0</div><div className="k">Warning time</div></div>
              <div className="s"><div className="v">8 min</div><div className="k">Squawk to chocks</div></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── BEAT 2 · TWO DOORS, ONE RULE ── */}
      <section className="reel" id="doors">
        <div className="wrap">
          <Reveal>
            <div className="kicker coral">03 · Two doors, one rule</div>
            <h2 className="head">The same rule failed both times. <span className="accent-coral">That is the argument.</span></h2>
          </Reveal>
          <div className="doors">
            <Reveal delay={0.05}>
              <div className="door one">
                <div className="when">March 2015 · the French Alps</div>
                <h3>Kept the wrong man at the controls</h3>
                <p>A suicidal co-pilot locks the captain out. The captain knocks, pleads, axes the door. The rule holds.</p>
                <div className="toll"><span className="big">150</span><span className="lab">Dead</span></div>
                <div className="verdict">The rule worked exactly as written.</div>
              </div>
            </Reveal>
            <Reveal delay={0.14}>
              <div className="door two">
                <div className="when">Last month · diverted to your nearest suitable</div>
                <h3>Kept help outside</h3>
                <p>The same rule holds — until a stabbed captain reaches the lock from inside.</p>
                <div className="toll"><span className="big">174</span><span className="lab">Live, by inches</span></div>
                <div className="verdict">The rule nearly worked exactly as written.</div>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.06}>
            <div className="same-rule">Same door · same rule · eleven years apart</div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="trap">
              <p>The trap: <strong>doctrine is written from the last disaster.</strong> The 2015 rule — <em>never
              leave a pilot alone</em> — was satisfied last month. The attacker <strong>was</strong> the second
              person. Write the next rule and you have written the autopsy of the disaster after that one.</p>
              <div className="concl">
                You cannot enumerate the future. The door needs to <span className="accent">see</span> — not to obey.
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── BEAT 3 · THE SPLIT TIMELINE ── */}
      <section className="free" id="timeline">
        <div className="wrap">
          <Reveal>
            <div className="tl-head">
              <div>
                <div className="kicker teal">04 · The same event, twice</div>
                <h2 className="head">Watch the same clock, two airports</h2>
              </div>
              <div className="legend">
                <span><i className="dot today" /> Today</span>
                <span><i className="dot ai" /> AI-native</span>
              </div>
            </div>
            <p className="lede">
              No model predicts this; no rulebook covers it. The question: <em>who is watching, how fast do
              they understand — and what has hands?</em>
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <div style={{ marginTop: 40 }}>
              <SplitTimeline onJump={() => go("judgment")} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── BEAT 4 · THE JUDGMENT MOMENT ── */}
      <section className="reel" id="judgment">
        <div className="glow gold" style={{ top: "-20%", right: "-14%" }} />
        <div className="wrap">
          <Reveal>
            <div className="kicker">05 · T+1:05 — the moment the idea turns on</div>
            <h2 className="head">The scene matches no playbook. <span className="accent-gold">So it doesn't look one up.</span></h2>
            <p className="lede">
              The whole concept in one screen: it sees a scene with no rule, says so, recommends — and waits
              for a human. Everything else counts up. Only this counts down.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <JudgmentBeat />
          </Reveal>
          <Reveal delay={0.06}>
            <div className="judgment-foot">
              Nobody consulted a rule. The machine <span className="accent">saw</span>; a human{" "}
              <span className="accent">decided</span>.
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── BEAT 5 · PHYSICAL AI ── */}
      <section className="free" id="physical">
        <div className="wrap">
          <Reveal>
            <div className="kicker teal">06 · Why physical, not just AI</div>
            <h2 className="head">Software alone can only warn. A nervous system can act.</h2>
            <p className="lede">
              Analytics can't run this event — there was nothing to predict. A better rulebook can't either —
              the rule held and nearly killed everyone. What's missing is <em>eyes on this door, this
              second — and hands</em>.
            </p>
          </Reveal>
          <div className="organs">
            <Reveal delay={0.05}>
              <div className="organ">
                <span className="glyph">👁</span>
                <div className="role">Eyes · Sensing</div>
                <h3>One world-model, seat 14A to stand B7</h3>
                <p>Cabin and flight-deck cameras fused with airport cameras, LiDAR, IoT, ATC data link — not thirty dashboards.</p>
                <ul>
                  <li>Pose, movement, identity — crew and passengers</li>
                  <li>The squawk reaches you the same second as ATC</li>
                  <li>Queues, spills, stands — measured, not estimated</li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.13}>
              <div className="organ">
                <span className="glyph">🧠</span>
                <div className="role">Brain · Twin + Agents</div>
                <h3>Judges scenes no playbook enumerated</h3>
                <p>Video becomes a sentence and a 6-second clip. Rehearses the response while the aircraft is inbound. Says so when uncertain.</p>
                <ul>
                  <li>One summary, not a wall of feeds</li>
                  <li>Crew-risk signals fused across jurisdictions</li>
                  <li>Prediction diffed against outcome — every event trains the next</li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.21}>
              <div className="organ">
                <span className="glyph">🦾</span>
                <div className="role">Hands · Actuation</div>
                <h3>The plan moves things</h3>
                <p>Smart door lock, guarded autopilot, autonomous apron vehicles, medical robots, dynamic signage, green-wave access.</p>
                <ul>
                  <li>Air: lock releases · dive arrested · humans fly, envelope held</li>
                  <li>Ground: stand cleared before the aircraft parks</li>
                  <li>No phone call per action</li>
                </ul>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.06}>
            <div className="loop">
              <b>sense → summarize → judge → act → inform</b><br />
              irreversible actions pass a live human confirm — a 10-second window; if it
              expires, the recommended action proceeds, logged as the machine's own, never
              credited to a human — or standing authority the CEO has granted.
              <span className="gold"> Judgment is how the system decides; authority is what you grant.</span>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="apron-wrap">
              <div className="cap">
                <span>T+13:00 · computed at T+0:45</span>
                <i>autonomous apron vehicles</i>
                <b>apparatus arrives before chocks</b>
              </div>
              <ApronDiagram />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── BEAT 6 · CEO INBOX ── */}
      <section className="free" id="inbox">
        <div className="wrap">
          <Reveal>
            <div className="kicker">07 · Your new interface</div>
            <h2 className="head">From a wall of dashboards to <span className="accent-gold">an inbox of decisions.</span></h2>
            <p className="lede">
              You are not the one who finds out last — or the one who coordinates. ~3× a day the airport
              surfaces what deserves a human: what we spend, what we say, how much judgment the machine gets.
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <AuthorityInbox />
          </Reveal>
        </div>
      </section>

      {/* ── BEAT 7 · THINKING ── */}
      <section className="free" id="thinking">
        <div className="wrap">
          <Reveal>
            <div className="kicker">08 · How this was thought through</div>
            <h2 className="head">The thinking behind the story</h2>
            <p className="lede">The choices, the rejected alternatives, and the contested assumptions.</p>
          </Reveal>
          <div className="think">
            <Reveal delay={0.05}>
              <div className="card teal">
                <h3><span className="idx">A</span>Why this moment, and only this moment</h3>
                <ul>
                  <li><b>Rejected: a weather diversion</b> — predictable events invite "analytics could do that."</li>
                  <li><b>Rejected: starting at the squawk</b> — skips the two minutes that decided it.</li>
                  <li><b>Chosen: T+0:00, zero warning</b> — the hardest case makes the shortest argument.</li>
                  <li><b>Cost: it's rare</b> — so the 90-day roadmap starts on an ordinary transfer queue.</li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.11}>
              <div className="card teal">
                <h3><span className="idx">B</span>Why Germanwings is evidence, not a counter-case</h3>
                <ul>
                  <li><b>One door, two opposite failures:</b> kept a suicidal co-pilot in (2015); kept help out (last month).</li>
                  <li><b>The post-2015 rule was satisfied</b> — the attacker was the second person. Doctrine lags one disaster.</li>
                  <li><b>So: no rule lookup at all.</b> See the scene, recommend, human confirms.</li>
                  <li><b>Conceded out loud, not buried</b> — the boundary buys the rest of the story.</li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.17}>
              <div className="card teal">
                <h3><span className="idx">C</span>Assumptions, made explicit</h3>
                <ul>
                  <li><b>Sensing largely exists</b> — outward door cameras already fly; inward is the contested part.</li>
                  <li><b>Flight-deck cameras are the hardest sell</b> — the pitch is governance, not a technical bypass.</li>
                  <li><b>Judgment ≠ autonomy</b> — authority is a dial: live confirms by default, standing authority granted and revocable, low confidence always escalates.</li>
                  <li><b>The airport doesn't own the aircraft</b> — it's the federation point where two nervous systems meet.</li>
                  <li><b>Numbers are mixed-source</b> — event facts from reporting; detection times and clocks illustrative.</li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.23}>
              <div className="card teal">
                <h3><span className="idx">D</span>Why physical AI is the hero, not "AI"</h3>
                <ul>
                  <li><b>An airport is a physical machine</b> — prediction-only AI just moves the latency to coordination.</li>
                  <li><b>Closing the loop</b> — a judgment that opens a lock, rejects a dive, clears a stand — makes "resolved before you knew" literally true.</li>
                  <li><b>Grounded, not hand-waved:</b> DARPA's ALIAS landed a 737 sim in 2016; envelope protection is standard. Intent-guard is a stated extrapolation.</li>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── BEAT 8 · PATH + CLOSE ── */}
      <section className="reel" id="close">
        <div className="grid-bg" />
        <div className="wrap" style={{ textAlign: "center" }}>
          <Reveal>
            <div className="kicker" style={{ justifyContent: "center" }}>09 · Where this starts</div>
            <div className="closing-line">
              You don't build the AI-native airport.<br />
              You teach it <span className="accent">one reflex</span> — then you add the next.
            </div>
            <p className="closing-sub">
              The emergency day isn't a special project — it's the same nervous system at full stretch,
              reaching past your fence into the aircraft on approach.
            </p>
          </Reveal>
          <div className="path" style={{ textAlign: "left" }}>
            <Reveal delay={0.05}>
              <div className="p">
                <div className="ph">First 90 days</div>
                <h4>One closed loop, on the ground</h4>
                <p>Transfer queues in irregular ops. Fuse existing feeds; one actuation (signage + tractor
                rerouting) closes the loop. Measure one number: cause → understanding. Authority starts at
                live confirms.</p>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="p">
                <div className="ph">Year one</div>
                <h4>The nervous system federates</h4>
                <p>One terminal end-to-end, then airline ops, ATC data link, crew-risk sharing — and the
                governance talks. The decision inbox goes live; every confirm builds the trust record.</p>
              </div>
            </Reveal>
            <Reveal delay={0.19}>
              <div className="p">
                <div className="ph">Steady state</div>
                <h4>An airport that compounds</h4>
                <p>Eyes from seat 14A to stand B7. Hands from the door lock to the apron. The moat: the
                accumulated physical memory of how <em>your</em> airport behaves.</p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div style={{ marginTop: 74 }}>
              <div className="closing-line" style={{ fontSize: "clamp(24px, 3.4vw, 42px)" }}>
                By the time you hear the alarm, the urgent steps are <span className="accent">already taken care of.</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer>
        <div className="inner">
          <span>The Nervous System</span>
          <span className="sp">Concept exercise · "Imagine the AI-native airport"</span>
        </div>
      </footer>
    </>
  );
}
