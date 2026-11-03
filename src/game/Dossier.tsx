import { motion } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   DOSSIER — the result screen, then the risks & mitigations
   "fine print," then the close. Shown after the win.
   Lean per COPY-MAP.md: the metrics strip, the fineprint subline,
   and the Cost/Drift/Taste risks were cut — seven risks remain,
   each trimmed to the edited copy.
   ══════════════════════════════════════════════════════════════ */

const RISKS: { tag: string; risk: string; mit: React.ReactNode }[] = [
  { tag: "Perception", risk: "It misreads — opens a door it shouldn't, or won't.", mit: <>Never acts on its own read: summary + 6-s clip to a human. Conjunctive triggers. Any conscious crew member countermands. Low confidence always escalates. Every divergence logged.</> },
  { tag: "Flight control", risk: "The boldest claim here: an AI touching flight controls. It is not certified to land an airliner.", mit: <><b>Scoped down:</b> it stabilizes, guards the envelope, guides. Humans fly. Auto-land only where certified. Grounded in DARPA ALIAS (737-sim landing, 2016) and standard envelope protection.</> },
  { tag: "Cyber", risk: "Hands on locks and controls means the door lock is now addressable.", mit: <>Isolated, signed channels. Authenticated commands. Hardware fail-safe reverts to manual. Aviation-grade security, not IT-grade.</> },
  { tag: "Spoofing", risk: "Fooling the cameras with a 'safe-looking' scene.", mit: <>Sensor fusion: cameras + LiDAR + ATC link + aircraft state. Disagreement is itself an alarm. No single sensor authorizes an irreversible act.</> },
  { tag: "Privacy", risk: "Crews and regulators restrict flight-deck recording (post-2015 rules; IATA Jan-2026).", mit: <>Event-triggered summaries, never continuous recording. Human authority on every irreversible act. Crews co-design the governance. A doctrine earned, not a bypass.</> },
  { tag: "Complacency", risk: "Humans stop watching because the machine is good.", mit: <>Humans keep real, weighted decisions. The trust record is earned and revocable. Manual drills stay on the calendar.</> },
  { tag: "Ownership", risk: "The airport doesn't own the aircraft. Cabin sensing is an airline/OEM capability.", mit: <>Federation: the airport is where the aircraft's nervous system meets the ground's. Data-sharing agreements. You govern the authority dial, not the airframe.</> },
];

export default function Dossier({ onRestart, onDeepDive }: {
  onRestart: () => void; onDeepDive: () => void;
}) {
  return (
    <div className="g-dossier">
      <div className="inner">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="g-kicker gold">Outcome · Run 2</div>
          <h2 className="g-title" style={{ fontSize: "clamp(26px,3.6vw,44px)" }}>
            By the time you hear the alarm,<br />the urgent steps are <span style={{ color: "var(--g-gold)" }}>already taken care of.</span>
          </h2>
          <p className="g-prose" style={{ marginTop: 22, maxWidth: 760 }}>
            Run 1: 174 lived on luck — a dying man's arm, two off-duty pilots. Run 2: the
            same 174, because a nervous system <b>saw, judged, acted</b> — and stopped only for what's
            yours. That's the whole pitch.
          </p>
        </motion.div>

        <motion.div className="g-risks" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h3>The fine print · risks &amp; mitigations</h3>
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
          <p style={{ marginTop: 20, fontSize: 15, color: "var(--g-dim)", maxWidth: 620, margin: "20px auto 0", lineHeight: 1.7 }}>
            Ninety days, one closed loop on an ordinary problem — transfer queues. One number moves:
            cause → understanding. The emergency day isn't a special project. It's the same
            system at full stretch.
          </p>
          <div className="g-actions" style={{ marginTop: 34 }}>
            <button className="g-btn gold" onClick={onRestart}>↺ Run it again</button>
            <button className="g-btn ghost" onClick={onDeepDive}>Read the argument →</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
