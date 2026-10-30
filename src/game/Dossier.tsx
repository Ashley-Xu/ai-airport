import { motion } from "framer-motion";
import type { Run2Choices } from "./Run2";

/* ══════════════════════════════════════════════════════════════
   DOSSIER — the result screen, then the risks & mitigations
   "fine print," then the close. Shown after the win.
   ══════════════════════════════════════════════════════════════ */

const RISKS: { tag: string; risk: string; mit: React.ReactNode }[] = [
  { tag: "Perception", risk: "Wrong scene judgment — the AI misreads and opens a door it shouldn't, or fails to.", mit: <>Never acts on its own read: summary + 6-second clip to a live human; conjunctive triggers; any conscious crew member countermands instantly; low-confidence scenes always escalate; every divergence logged and reviewed.</> },
  { tag: "Flight control", risk: "AI touching flight controls is the boldest claim here — not certified to land an airliner.", mit: <><b>Scoped down deliberately:</b> the AI stabilizes attitude, guards the envelope, and guides — a ground pilot / the off-duty crew fly it; auto-landing only where certified. Grounded in DARPA ALIAS (autonomous 737-sim landing, 2016) and standard envelope protection.</> },
  { tag: "Cyber", risk: "A networked system with hands on locks and flight controls is hackable — the door lock is now addressable.", mit: <>Safety-critical actuation on isolated, signed channels; commands cryptographically authenticated; hardware fail-safe that reverts to manual; aviation-grade, not IT-grade, security.</> },
  { tag: "Spoofing", risk: "Adversarial spoofing — fooling the cameras with a 'safe-looking' scene that isn't.", mit: <>Multi-sensor fusion (cameras + LiDAR + ATC data link + aircraft state); disagreement between sensors is itself an alarm; no single sensor authorizes an irreversible act.</> },
  { tag: "Privacy", risk: "Cockpit/cabin surveillance — crews and regulators restrict flight-deck recording (post-2015 rules; IATA Jan-2026 position).", mit: <>Event-triggered summaries, no continuous recording; human authority on every irreversible act; crews co-design the governance; framed as a doctrine to be earned, not a technical bypass.</> },
  { tag: "Complacency", risk: "Automation complacency — humans stop watching because the machine is good.", mit: <>The human stays at the top of the loop with real, weighted decisions; the trust record is earned and revocable; periodic manual drills keep humans sharp.</> },
  { tag: "Ownership", risk: "The airport doesn't own the aircraft — cabin sensing is an airline/OEM capability.", mit: <>Federation model: the airport is where the aircraft's nervous system meets the ground's; data-sharing agreements; the CEO governs the authority dial, not the airframe.</> },
  { tag: "Cost", risk: "Cost, ROI, change management — unions, vendors, procurement, certification are real and slow.", mit: <>Starts with one 90-day ground reflex on an ordinary problem (transfer queues) with a measurable latency delta, before touching anything safety-critical.</> },
  { tag: "Drift", risk: "Model drift and vendor lock-in — accuracy decays; one supplier owns the reflexes.", mit: <>Prediction-vs-outcome diffing after every event; open interfaces; the accumulated physical memory is yours and portable.</> },
  { tag: "Taste", risk: "Gamifying a real, recent tragedy with an ongoing investigation.", mit: <>Abstract/stylized depiction, no faces or blood; clinical tone; no celebratory feedback; framed as a decision simulation and a safety argument, never entertainment.</> },
];

export default function Dossier({ choices, onRestart, onDeepDive }: {
  choices: Run2Choices; onRestart: () => void; onDeepDive: () => void;
}) {
  const souls = 174;
  const decisions = Object.values(choices).filter(Boolean).length;

  return (
    <div className="g-dossier">
      <div className="inner">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="g-kicker gold">Outcome · Run 2</div>
          <h2 className="g-title" style={{ fontSize: "clamp(22px,3.2vw,38px)" }}>
            By the time you hear the alarm,<br />the urgent steps are <span style={{ color: "var(--gold)" }}>already taken care of.</span>
          </h2>

          <div className="g-metrics">
            <div className="g-metric"><div className="v">{souls}</div><div className="k">Souls · all lived</div></div>
            <div className="g-metric"><div className="v">4.2s</div><div className="k">Human confirm · the door</div></div>
            <div className="g-metric"><div className="v gold">{decisions}</div><div className="k">Decisions you made · the machine did the rest</div></div>
            <div className="g-metric"><div className="v">~40s</div><div className="k">Sooner the door opened than a dying man's arm</div></div>
          </div>
          <p style={{ marginTop: 18, fontSize: 14, color: "var(--ink-dim)", lineHeight: 1.7, maxWidth: 760 }}>
            In Run 1, 174 people lived on luck — a dying man's arm and two strangers' licences. In Run 2, the
            same 174 lived because a nervous system <em style={{ color: "var(--ink)" }}>saw, judged, and acted</em>, and
            stopped only for the calls that are genuinely yours. That difference is the entire pitch.
          </p>
        </motion.div>

        <motion.div className="g-risks" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h3>The fine print · risks &amp; how we mitigate them</h3>
          <div className="sub">An honest concept names what could go wrong. Every risk below has a mitigation designed in — not bolted on.</div>
          {RISKS.map((r, i) => (
            <motion.div className="g-risk" key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.3) }}>
              <div className="rh"><span className="tag">{r.tag}</span><span>{r.risk}</span></div>
              <div className="rm">{r.mit}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="g-close" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <div className="g-kicker gold" style={{ justifyContent: "center" }}>Where this starts</div>
          <div className="line">
            You don't build the AI-native airport.<br />You teach it <span className="accent">one reflex</span> — then you add the next.
          </div>
          <p style={{ marginTop: 20, fontSize: 15, color: "var(--ink-dim)", maxWidth: 620, margin: "20px auto 0", lineHeight: 1.7 }}>
            Ninety days, one closed loop on an ordinary problem — transfer queues. One number that moves: the
            delay between cause and understanding. The emergency day isn't a special project; it's the same
            nervous system at full stretch.
          </p>
          <div className="g-actions" style={{ marginTop: 34 }}>
            <button className="g-btn gold" onClick={onRestart}>↺ Run it again</button>
            <button className="g-btn ghost" onClick={onDeepDive}>Read the full argument →</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
