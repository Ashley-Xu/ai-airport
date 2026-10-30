/* ══════════════════════════════════════════════════════════════
   Scene art manifest. Ashley generates the images; each beat maps
   to a file in /public/assets/. If a file is missing (not yet
   generated), the game falls back to the vector schematic — so the
   piece is always complete and playable.

   To add a missing image later: save it into public/assets/ with the
   exact filename below. No code change needed.
   ══════════════════════════════════════════════════════════════ */

export type ArtKey =
  // Scene 1 — the captain
  | "s1-captain"   // you're the stabbed captain, strength draining
  | "s1-hand"      // POV: a bloody hand reaching for the door
  | "s1-door-open" // the door opens; people outside in terror
  // Scene 2 — the passengers
  | "s2-passenger" // you're a passenger outside the door, in terror
  | "s2-fight"     // going in to subdue the attacker (abstracted)
  | "s2-subdued"   // you succeeded, injured — blood on your head
  // Scene 3 — the controls
  | "s3-dive"      // the plane diving straight down (exterior)
  | "s3-interior"  // the cabin completely shaken by the dive
  | "s3-controls"  // you at the controls, no experience, fighting the dive
  // Scene 4 — the reveal
  | "s4-pilots"    // two off-duty pilots rush to the cockpit door
  | "s4-landing"   // the two pilots land the plane
  | "s4-reunion"   // families reunited at the airport
  // Run 2 — the nervous system (AI in control)
  | "r2-alert"     // cabin alert broadcast: human intervention needed
  | "r2-detected"  // AI detects the captain stabbed (scene summary)
  | "r2-unlocked"  // AI terminal releases the door latch
  | "r2-stabilized"// AI stabilizes the aircraft
  | "r2-airport-alarm" // the nearest airport gets the alarm
  | "r2-airport-ready"; // the airport fully pre-positioned

export const ART: Record<ArtKey, string> = {
  "s1-captain": "/assets/s1-captain.jpg",
  "s1-hand": "/assets/s1-hand.jpg",
  "s1-door-open": "/assets/s1-door-open.jpg",
  "s2-passenger": "/assets/s2-passenger.jpg",
  "s2-fight": "/assets/s2-fight.jpg",
  "s2-subdued": "/assets/s2-subdued.jpg",
  "s3-dive": "/assets/s3-dive.jpg",
  "s3-interior": "/assets/s3-interior.jpg",
  "s3-controls": "/assets/s3-controls.jpg",
  "s4-pilots": "/assets/s4-pilots.jpg",
  "s4-landing": "/assets/s4-landing.jpg",
  "s4-reunion": "/assets/s4-reunion.jpg",
  "r2-alert": "/assets/r2-alarmed-door.jpg",
  "r2-detected": "/assets/r2-detected.jpg",
  "r2-unlocked": "/assets/r2-unlocked.jpg",
  "r2-stabilized": "/assets/r2-stabilized.jpg",
  "r2-airport-alarm": "/assets/r2-airport-alarm.jpg",
  "r2-airport-ready": "/assets/r2-airport-ready.jpg",
};

// Which slots currently have a file on disk (so we can skip the load-error
// flash for known-missing ones). Update this list as images are added.
export const HAVE: Record<ArtKey, boolean> = {
  "s1-captain": true,
  "s1-hand": true,
  "s1-door-open": true,
  "s2-passenger": true,
  "s2-fight": true,
  "s2-subdued": true,
  "s3-dive": true,
  "s3-interior": true,
  "s3-controls": true,
  "s4-pilots": true,
  "s4-landing": true,
  "s4-reunion": true,
  "r2-alert": true,
  "r2-detected": true,
  "r2-unlocked": true,
  "r2-stabilized": true,
  "r2-airport-alarm": true,
  "r2-airport-ready": true,
};
