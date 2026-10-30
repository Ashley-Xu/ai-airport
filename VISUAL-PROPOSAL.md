# VISUAL-PROPOSAL — "The Door · T+0" (content approved; visual form pending)

> Content is locked (PLAN.md v5.1). This document proposes the **visual form and style**
> only. Nothing is built until Ashley picks. Each option is described in enough detail
> to judge without seeing a mock.

---

## 0 · What the visual has to do (requirements derived from the approved script)

Hard requirements — the form must support all of these:

1. **Carry the split timeline** (BEAT 3): two columns, one shared clock, in-air phase
   (T+0 → T+9) then ground phase (T+9 → T+2h). The core claim is *simultaneity* — the
   same second, two worlds.
2. **Hold the "two doors, one rule" beat** (BEAT 2) with real weight. This is the
   intellectual core; it must not look like a footnote. 2015 (150 dead) and last month
   (174 live) must land as two objects the viewer compares.
3. **Let the CEO press the authority card** (BEAT 5) — a genuine interactive decision
   with three outcomes, each with distinct feedback text. Agency is the point.
4. **Show the T+1:05 judgment moment legibly.** The system *sees* a scene and
   *recommends* — this is the newest, hardest idea in the piece and needs its own visual
   beat, not a single timeline row.
5. **Never show event imagery.** No photos, no reconstruction, no footage of either
   accident. Abstract/schematic representation only.
6. **Survive a 5-minute live walkthrough** driven by a presenter, on a laptop or
   projector, plus survive being read alone as a take-home artifact.

Soft preferences (from the locked decisions and Ashley's taste):

- Dark, high-end technology register; restrained motion; no consumer-app playfulness.
- Clinical about violence; the emotional weight carried by structure, not imagery.
- All-English delivery; no bilingual requirement.
- A visual "wow" that an airport CEO reads as *operations*, not *gadgetry*.

---

## 1 · Four candidate forms

### Option A — Scroll-driven split-screen page (the working assumption)

One long dark page; sections reveal on scroll. The timeline is two columns flanking a
central clock spine; rows light as you scroll past (or via a "Run T+0" auto-play). The
authority card is a phone-shaped notification that expands into the detail card.

- **Pros:** proven (the existing draft demonstrates it builds cleanly and reads well);
  works both as a live-driven walkthrough and as a self-serve artifact; cheapest to
  iterate; all six hard requirements are satisfiable.
- **Cons:** least cinematic; "another long dark landing page" risk — the genre is
  crowded, and a reviewer may not feel transported.
- **Fit:** all six, but requirements 2 (two doors) and 4 (the judgment moment) need
  deliberate design work — they can easily become just-more-cards.

### Option B — Scroll-snap cinematic ("reel")

Full-viewport sections that snap one at a time. Each beat owns an entire screen: the
complaint, the event, door #1 (2015), door #2 (last month), the timeline as a sequence
of snapped moments, the judgment, the card, the close. Motion is more deliberate —
cross-fades, single-focus type, generous black.

- **Pros:** highest control of pacing and emphasis; the two-doors beat gets two full
  screens and cannot be skimmed; best matches "cinematic, high-end"; strong for a live
  walkthrough where the presenter controls the tempo.
- **Cons:** worse as a self-serve read (snap scrolling frustrates skimmers); more motion
  engineering; harder to fit the full 13-row timeline — it must split across several
  snaps, which weakens the simultaneity claim unless handled carefully.
- **Fit:** 1 needs care; 2 and 4 are the strongest of any option.

### Option C — Dashboard-textured ("operations center")

The page looks like an airport operations surface: apron/stand diagram motifs, flight-
strip typography, monospace data rails, status chips. The two doors become two "incident
strips." The timeline renders as a live-ops event log. The judgment moment is a
scene-understanding panel (abstract wireframe annotations over a schematic cabin plan —
no footage). The authority card looks like an ops decision dialog.

- **Pros:** most credible to an aviation audience — it speaks their visual language;
  makes "physical AI" concrete (you *see* the stand, the pier, the door); the schematic
  wireframe solves requirement 4 elegantly and satisfies requirement 5 (abstract, not
  imagery).
- **Cons:** risk of reading as a product UI mock rather than a vision concept — the brief
  asks to *imagine*, and too much chrome invites *evaluation*; most work of the four;
  can look cluttered if not disciplined.
- **Fit:** best on 4 and 5; 2 needs the strips designed as a deliberate diptych; 3 works
  but the card may feel like a system dialog rather than a CEO moment.

### Option D — Hybrid: cinematic spine + operations texture (recommended)

Take B's pacing for the argument beats and C's texture for the operational beats.
Concretely:

- Full-viewport snapped sections for: the complaint, the event, **door #1 (2015)**,
  **door #2 (last month)**, the judgment moment, the close. These are the beats where
  emphasis matters more than information density.
- The split timeline stays a **single continuous scroll region** (not snapped) so both
  columns remain visible and the simultaneity claim survives — but styled as an ops event
  log, with the clock spine as the dominant graphic element.
- The T+1:05 judgment beat gets its own full screen: a **schematic flight-deck plan**
  (top-down line drawing, no imagery) with abstract scene-understanding annotations —
  recognized faces at the door, crew posture inside, aircraft state — plus the
  recommendation and the 4.2-second confirm. This is the single most important visual in
  the piece, because it is the idea in the title.
- The authority card is phone-shaped but rendered in the ops visual language, so it
  feels like *the airport speaking to its CEO*, not a consumer notification.
- Motion: restrained. One signature move only — the clock spine's T-counter advancing —
  reused as the through-line so the piece feels like one system, not eight effects.

- **Pros:** emphasis where the argument needs it, credibility where the domain needs it,
  simultaneity preserved where the core claim needs it; the judgment moment gets the
  screen it deserves.
- **Cons:** the most design decisions to get right; two visual registers must cohere
  (mitigated by a single palette, single type system, single signature motion).
- **Fit:** satisfies all six with the least compromise.

**My recommendation: Option D.** Requirement 2 (two doors) and requirement 4 (the
judgment moment) are where this concept differs from every other AI pitch, and both need
full-screen emphasis — that argues for B. But requirement 1 (simultaneity) and the
audience's domain fluency argue for a continuous ops-styled timeline — that's C. D is
not a hedge; it assigns each beat the register that beat needs.

---

## 2 · Style system (proposed; applies to whichever form is chosen)

**Palette — one signal colour per world.**

| Role | Colour | Use |
|---|---|---|
| Canvas | near-black `#05070c` → `#0a0e17` | everything; the page should feel like an unlit operations floor |
| Today (finds out late) | coral `#f97362` | left column only, plus the 2015 door and "rule fails quietly" motifs |
| AI-native (nervous system) | teal `#4fd1c5` | right column only, plus the judgment scene and the authority card |
| Authority / the CEO | gold `#d4af6a` | the decision, the doctrine, the closing line — never used for data |
| Ink | `#e8edf6` / `#94a3b8` / `#5b6b83` | headline / body / meta — three levels, no more |

Discipline rules:

- **Coral and teal never appear in the same element.** The two worlds are separable at a
  glance — that is what makes the split readable without narration.
- **Gold is reserved.** It appears only where a human is deciding. That single rule makes
  the authority card feel like the CEO's object rather than the system's.

**Type — three faces, strict roles.**

- Display: **Instrument Serif** (italic for the one accent per screen). Headlines only.
  The serif is the "this is an argument, not a demo" signal.
- Body: **Inter** (400/500/600). All prose.
- Data: **JetBrains Mono**. Every timestamp, T-clock, count, tag, and label. The
  monospace is what makes the piece read as operations rather than marketing.

Scale: headline clamp 44–84px, section head clamp 32–52px, body 16–17.5px, event card
13.5–15px, mono labels 10.5–13px with 0.06–0.22em tracking. No intermediate sizes.

**Motion — restrained, one signature.**

- Scroll reveals: 0.7s, `y: 26 → 0`, `ease [0.22, 1, 0.36, 1]`, once only. No bouncing,
  no spring overshoot, nothing playful.
- Signature move: the central **T-counter** advancing (T+0:00 → T+0:08 → … → T+2:00:00)
  in monospace, with the row it belongs to lighting as it passes. Used in the timeline
  and echoed once in the judgment beat. This is the only animation the piece repeats — it
  is what makes the whole thing feel like one system watching one event.
- Timeline rows: unlit at 25% opacity → lit at 100%, 0.6s. The "Today" ghost rows (where
  nothing is happening) stay dashed and dim — which is itself an argument: the left
  column has long stretches where *nothing is recorded*.
- The judgment beat: annotations draw on in sequence (~0.4s apart), then the
  recommendation, then the 4.2s confirm counter runs **down**. Everything else in the
  piece counts up; this one counts down. That contrast is the intended emotional beat.
- Buttons: colour/filter change only; no scale bounce. The authority card's three buttons
  are equal weight — the piece must not steer the CEO.
- No parallax, no cursor effects, no autoplay video, no sound.

**Graphic elements — abstract only.**

- **Schematic flight-deck plan** (required): top-down line drawing, stroke only, no fill.
  Doors, seats, crew positions as geometry. No photographs, no human silhouettes, no
  depiction of the weapon or injury — the axe is referenced in text only.
- **Apron/stand diagram** (optional): simplified line plan for the ground phase (stand,
  pier E, apparatus positions) with moving dots for the autonomous vehicles. The most
  "physical AI" image available; worth including if the form allows.
- **Flight-path strip** (optional): for the intent-guard beat — a thin horizontal band
  showing assigned altitude held while the rejected dive appears as a diverging trace.
- **Grid + single radial glow**: keep at very low opacity as ambient texture only.

**Layout:** max-width 1160px, 32px gutters; timeline grid `1fr / 110px / 1fr`
(collapsing to `1fr / 84px / 1fr` under 960px). Section padding 120px vertical. One idea
per screen, never two.

---

## 3 · What happens to the existing draft

`src/App.tsx` currently implements the **v1 storm story** with Option A's form. It is
structurally reusable (split timeline, phone-shaped card, reveal system, palette, type)
but its content is wrong for v5.1 — no two-doors beat, no judgment beat, no authority
card, wrong timeline.

Plan if approved: keep the shell (styles, timeline component, card interaction pattern)
and replace all content with the v5.1 beats, adding the two new full-screen beats (two
doors; judgment scene). This is a substantial rewrite of App.tsx rather than a patch. The
v1 version stays in git history if the storm story is ever wanted back.

---

## 4 · Decisions requested

1. **Form:** A / B / C / **D (recommended)**.
2. **Palette & type:** approve the proposed system, or adjust (e.g. drop gold, or a
   different accent for the AI-native world).
3. **Optional graphics:** include the apron/stand diagram and the flight-path strip, or
   keep only the schematic flight-deck plan? (Recommendation: flight-deck plan yes —
   required by the judgment beat; apron diagram yes — strongest "physical AI" image;
   flight-path strip only if the timeline feels thin without it.)
4. **Motion density:** as proposed (restrained, one signature move), or more cinematic
   (full-screen cross-fades, slower reveals)?
5. **Existing draft:** rewrite in place (recommended) or start a fresh app and keep v1 as
   an archive?
