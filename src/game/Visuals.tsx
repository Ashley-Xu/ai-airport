import { motion } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   Shared vector art. Level-2 stylized: silhouettes only — no
   faces, no blood, no weapon detail. Coral = threat/human,
   teal = the nervous system, gold = human decisions.
   ══════════════════════════════════════════════════════════════ */

/** A simple human silhouette (head + torso), no facial features. */
export function Figure({
  x, y, scale = 1, color = "rgba(148,163,184,0.45)", rotate = 0, className = "",
}: { x: number; y: number; scale?: number; color?: string; rotate?: number; className?: string }) {
  return (
    <g className={className} transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <circle cx="0" cy="-9" r="5" fill={color} />
      <path d="M-6 -3 Q0 -6 6 -3 L5 11 L-5 11 Z" fill={color} />
    </g>
  );
}

/**
 * Top-down flight deck + forward cabin schematic.
 * doorOpen: 0 (locked) → 1 (released). threat: whether the attacker marker shows.
 * captainDown / attackerDown drive figure states. scanning = AI perception sweep.
 */
export function FlightDeck({
  doorOpen = 0, threat = true, captainDown = false, attackerDown = false,
  paxAtDoor = 0, scanning = false, highlightDoor = false, aiEyes = false,
}: {
  doorOpen?: number; threat?: boolean; captainDown?: boolean; attackerDown?: boolean;
  paxAtDoor?: number; scanning?: boolean; highlightDoor?: boolean; aiEyes?: boolean;
}) {
  const doorX = 196;
  // door swings from closed (vertical at x=196) to open (angled back)
  const swing = doorOpen; // 0..1
  const doorEndX = doorX - 30 * swing;
  const doorEndY = 150;

  return (
    <svg className="g-deck" viewBox="0 0 520 300" role="img"
      aria-label="Schematic top-down view of a flight deck and forward cabin">
      {/* hull */}
      <path className="hull-soft" d="M60 150 Q60 60 150 46 L400 46 Q470 46 470 150 Q470 254 400 254 L150 254 Q60 240 60 150 Z" />
      <path className="hull" d="M60 150 Q60 60 150 46 L400 46 Q470 46 470 150 Q470 254 400 254 L150 254 Q60 240 60 150 Z" />

      {/* bulkhead + door */}
      <line className="bulkhead" x1={doorX} y1="52" x2={doorX} y2="248" />
      <line className={`door ${doorOpen > 0.5 ? "open" : ""}`} x1={doorX} y1="112"
        x2={doorEndX} y2={112 + 38 * swing}
        style={highlightDoor ? { filter: "drop-shadow(0 0 6px rgba(212,175,106,0.8))" } : undefined} />
      <text className="lbl" x="112" y="40">FLIGHT DECK</text>
      <text className="lbl" x="252" y="40">CABIN · FWD</text>
      {doorOpen > 0.5 && <text className="lbl lbl-gold" x="120" y="272">DOOR RELEASED</text>}
      {doorOpen <= 0.5 && !highlightDoor && <text className="lbl" x="120" y="272">DOOR · LOCKED FROM INSIDE</text>}
      {highlightDoor && doorOpen <= 0.5 && <text className="lbl lbl-gold" x="120" y="272">HOLD TO UNLOCK</text>}

      {/* crew stations */}
      <rect className="seat" x="104" y="98" width="34" height="26" rx="5" />
      <rect className="seat" x="104" y="176" width="34" height="26" rx="5" />
      <text className="lbl" x="104" y="92">CPT</text>
      <text className="lbl" x="104" y="172">F/O</text>

      {/* captain figure (at the door when trying to unlock) */}
      <Figure x={captainDown ? 121 : 168} y={captainDown ? 111 : 130} scale={1.05}
        color={captainDown ? "var(--g-coral)" : "rgba(232,237,246,0.62)"}
        rotate={captainDown ? 78 : 0} />

      {/* threat marker: the attacker at the controls — abstract, no weapon */}
      {threat && !attackerDown && (
        <g>
          <motion.circle className="threat-ring" cx="121" cy="189" r="15"
            animate={{ r: [13, 20, 13], opacity: [0.9, 0.3, 0.9] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} />
          <Figure x={121} y={189} scale={1.05} color="var(--g-coral)" />
        </g>
      )}
      {attackerDown && <Figure x={150} y={205} scale={1} rotate={84} color="rgba(249,115,98,0.5)" />}

      {/* forward cabin seat blocks */}
      {[0, 1, 2, 3].map((r) => (
        <rect key={`t${r}`} className="seatblock" x={232 + r * 52} y="72" width="38" height="52" rx="4" />
      ))}
      {[0, 1, 2, 3].map((r) => (
        <rect key={`b${r}`} className="seatblock" x={232 + r * 52} y="176" width="38" height="52" rx="4" />
      ))}

      {/* passengers converging at the door (Run 1 Scene 2 / Run 2) */}
      {Array.from({ length: paxAtDoor }).map((_, i) => (
        <motion.g key={i}
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.12, duration: 0.5 }}>
          <Figure x={214 + (i % 2) * 26} y={132 + Math.floor(i / 2) * 22} scale={0.92}
            color={i === 0 ? "var(--g-cyan)" : "rgba(148,163,184,0.5)"} />
        </motion.g>
      ))}

      {/* AI perception: scanning sweep + rings */}
      {scanning && (
        <>
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <path className="scan" d="M212 60 L300 60 M212 100 L340 100 M212 140 L300 140 M212 180 L340 180 M212 220 L300 220" />
          </motion.g>
          {[{ cx: 121, cy: 111 }, { cx: 121, cy: 189 }, { cx: doorX, cy: 150 }].map((p, i) => (
            <motion.circle key={i} className="node-ring ai" cx={p.cx} cy={p.cy} r="14"
              initial={{ r: 8, opacity: 0 }} animate={{ r: 14, opacity: 1 }}
              transition={{ delay: i * 0.3, duration: 0.5 }} />
          ))}
        </>
      )}

      {/* AI "eyes" indicator corners */}
      {aiEyes && (
        <g stroke="var(--g-cyan)" strokeWidth="1.4" fill="none" opacity="0.7">
          <path d="M70 66 L70 56 L84 56" />
          <path d="M450 66 L450 56 L436 56" />
          <path d="M70 234 L70 244 L84 244" />
          <path d="M450 234 L450 244 L436 244" />
        </g>
      )}

      {/* judgment marker at the door (Run 2 D1) */}
      {highlightDoor && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <motion.circle className="node-ring gold" cx={doorX} cy="150" r="22"
            animate={{ r: [20, 30, 20], opacity: [0.9, 0.35, 0.9] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
        </motion.g>
      )}
    </svg>
  );
}

/**
 * Altitude trace. mode: "dive" = coral trace falling; "guarded" = teal trace that
 * falls then snaps flat (envelope held). progress 0..1 animates the draw.
 */
export function AltitudeTrace({
  mode = "dive", progress = 1, showSafeBand = false,
}: { mode?: "dive" | "guarded"; progress?: number; showSafeBand?: boolean }) {
  const W = 420, H = 150;
  // dive path: holds, then plunges
  const divePath = "M10 40 L120 40 C160 40 170 46 200 96 C225 138 250 150 300 152 L410 153";
  // guarded path: starts to fall then snaps back to level
  const guardPath = "M10 40 L120 40 C150 40 158 50 176 72 C186 84 196 86 210 72 C230 52 250 44 300 42 L410 41";
  const d = mode === "dive" ? divePath : guardPath;
  const len = 900;
  return (
    <svg className="g-alt" viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label="Altitude trace">
      {showSafeBand && <rect className="safeband" x="0" y="24" width={W} height="34" />}
      <line className="axis" x1="0" y1={H - 1} x2={W} y2={H - 1} />
      <line className="axis" x1="1" y1="0" x2="1" y2={H} />
      <text className="lbl" x="6" y="16">ALT</text>
      <text className="lbl" x={W - 40} y={H - 6}>TIME</text>
      <motion.path className={`trace ${mode === "dive" ? "coral" : "teal"}`} d={d}
        strokeDasharray={len} initial={{ strokeDashoffset: len }}
        animate={{ strokeDashoffset: len * (1 - progress) }}
        transition={{ duration: 0.1, ease: "linear" }} />
    </svg>
  );
}

/** A stylized aircraft icon (top-down) for the guidance/divert animation. */
export function AircraftIcon({ color = "var(--g-cyan)", size = 40 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="Aircraft">
      <path d="M20 3 L23 17 L36 24 L36 27 L23 24 L22 33 L26 37 L26 39 L20 37 L14 39 L14 37 L18 33 L17 24 L4 27 L4 24 L17 17 Z"
        fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}
