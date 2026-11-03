import { motion } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   DOSSIER — the result screen, then the close. Shown after the win.

   The risks & mitigations "fine print" USED to live here and moved to the
   Argument page (src/DeepDive.tsx, section #risks) at Ashley's direction: the
   concessions belong to the written argument, not to the end of a playthrough.
   The copy is unchanged in transit — all seven risks, including the "boldest
   claim" flight-control concession, which is the piece's honest boundary.
   The .g-risks / .g-risk rules in game.css are now unused; left in place rather
   than deleted because Ashley gates cuts she may restore (see the "doors" and
   Germanwings-card precedent in DeepDive.tsx).

   Lean per COPY-MAP.md: the metrics strip and the fineprint subline were
   already cut.
   ══════════════════════════════════════════════════════════════ */

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

        {/* The risks & mitigations moved to the Argument page (section #risks) at
            Ashley's direction — deliberately NOT re-pointed from here. The ending
            button that brought the player here no longer promises them, so nothing
            dangles, and the "Read the argument →" button below already leads to
            the page that now carries them. */}

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
