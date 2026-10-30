# Thinking — how I got here (Deliverable: "show us how you would think through it")

## 1. Reading the brief

Four constraints decide everything:

1. **"One moment, one audience, one idea."** A hard constraint, not a suggestion. The
   concept is graded on the sharpness of one idea, not the breadth of five scenes.
2. **The audience is one person — the CEO.** Not engineers, not an ops team. The unit
   of persuasion is not a feature list but a *felt experience of their own pain*,
   followed by a *felt experience of relief*.
3. **"Find out too late" is the stated pain** — that word, *late*, is the whole thesis.
   The concept must make latency visible and then make it disappear.
4. **"Why it matters to care about physical AI"** — the brief explicitly asks for
   physical AI to earn its place. A pure-software story would fail the brief even if it
   were prettier.

## 2. The reasoning chain

- Late → why late? → because signals are discovered by humans watching screens.
- Why do humans watch screens? → because the systems can't act; alerts are the only
  output. Data without hands can only warn.
- Why can't they act? → the problems are physical (doors, flight controls, stands,
  queues, apparatus, people), and the "integration layer" between systems is the
  telephone.
- Therefore the fix is not more dashboards (that's the CEO's own complaint restated).
  The fix is giving the airport **eyes, a brain, and hands** — a nervous system — and
  moving the human from the middle of the loop to the top of it.
- **The nervous system must not stop at the fence.** The v4 revision (directed by
  Ashley) pushed the eyes and hands into the aircraft: cabin and flight-deck smart
  cameras, movement tracking of passengers and crew, AI-summarized real-time
  situational reports to air control, and temporary machine authority over two
  physical systems — the cockpit-door lock and the autopilot. This strengthens the
  concept because the real event proves the point brutally: the two moments that
  decided 174 lives were *physical* (a lock, a control column), and both were covered
  by luck.
- The sharpest way to show this: **the same event, twice, on one clock.** The
  difference is purely *when understanding happened* and *whether hands existed to
  act*. That comparison is the whole concept.

## 3. Moment selection (and what I rejected — including my own first two choices)

Chosen (v4): **the flight-deck attack itself — T+0:00, the axe swings.** The story now
runs from inside the aircraft, through the four minutes in the air, to the eight
minutes on the ground after wheels-down, to the last passenger off at T+38.

Evolution of the choice, honestly logged:

- *First choice: a weather diversion.* Cut — it fails "one moment," and even alone it
  invites the fatal objection "a storm is forecastable; better analytics could do
  that."
- *Second choice (v3): squawk 7500, airport-side only.* The moment was right (zero
  warning) but the frame was too small: starting at the squawk skips the two minutes
  where the real event was actually decided — the door and the controls. The CEO's
  insight (v4) restored them.
- *Why T+0 wins:* it is the hardest possible test — **zero seconds** of warning, not
  zero minutes. Nothing is predictable, so the only winning capacities are perception
  speed and physical actuation. That is exactly what "physical AI" means, and it makes
  the brief's question ("why care about physical AI?") answer itself.

What this moment costs, honestly:

- *It is rare* — a CEO could say "once in a decade." Answer built into the closing:
  the first-90-days reflex is an ordinary transfer-queue problem; the emergency day is
  the same nervous system at full stretch. The emergency is the proof point; the
  everyday is the product.
- *It reaches past the airport's ownership boundary* — see §5.

Other rejected alternatives:

- *"The airport's morning self-briefing"* — clean but low tension; nothing is at stake.
- *"CEO walks the terminal, the building reports"* — visually charming, but a CEO walk
  is not a real decision moment; it risks reading as a gimmick.
- *Full "day in the life" montage* — broader coverage, dilutes the single idea.

## 4. Form selection

Chosen (working assumption; final form locked after script approval): **an
interactive, scroll-driven split-screen narrative.**

- Split-screen because the core claim is *simultaneity* — same clock, two worlds
  (today's aircraft+airport vs the nervous-system one). Sequential video would lose the
  "while nobody on the ground knew anything…" punch.
- Interactive because the walkthrough's emotional peak is the CEO **pressing the
  button** themselves. A passive video can't hand agency to the audience.
- Restrained motion, dark palette, serif display type: "high-end operations center,"
  not "consumer app."

## 5. Explicit assumptions

- **Sensing largely exists — but not where it matters most.** Airports have CCTV, BHS
  tracking, A-CDM feeds, ATC data links. Aircraft have outward-facing cockpit-door
  surveillance (CDSS, certified and flying on A320-family aircraft under FAA/EASA STC)
  and flight-envelope protection. What does *not* exist today: inward-facing flight-
  deck scene understanding, machine authority over the door lock, and intent-guarding
  of the autopilot against a malicious but conscious input. The concept is explicit
  that these three are the new part — and that the third has real grounding (DARPA's
  ALIAS programme autonomously landed a 737-800 simulator in a pilot-incapacitation
  scenario in 2016; robotic co-pilot kits have flown light aircraft).
- **The ownership problem, faced directly.** The airport does not own the aircraft;
  cabin/flight-deck sensing is an airline/OEM/regulator capability. The concept's
  framing: the airport is the *federation point* — where the aircraft's nervous system
  meets the ground's, and where the CEO governs the doctrine. The brief asked to
  imagine an AI-native airport, not to prove feasibility; but the walkthrough script
  pre-answers this question because a CEO will ask it.
- **Bounded autonomy — as an authority dial, not a trigger table (v5).** The AI
  perceives, summarizes, and recommends; irreversible acts require a live human confirm
  (4.2 s median) or standing authority the CEO has granted, earned via a trust record
  and revocable in one tap; low-confidence scenes always escalate. An unbounded-AI
  story would get dismissed on governance grounds in the first minute of Q&A — and a
  pure rulebook story would be defeated by the two-door argument.
- **The regulatory debate is real and unsettled.** Post-Germanwings, international
  rules restrict cockpit voice/image recordings to accident investigation; IATA
  published a cabin-surveillance position paper in Jan 2026; crews resist live
  monitoring. The concept therefore frames inward-facing flight-deck sensing as a
  *doctrine to be earned* (event-triggered summaries, no continuous recording, human-
  in-the-loop, crew co-designed governance) — and says so on the page. Pretending the
  debate is settled would destroy credibility with exactly the audience this is for.
- **The Germanwings case is evidence, not a counter-case (v5, Ashley-directed).** A
  locked door kept a suicidal co-pilot *in* in 2015 (150 dead) and kept help *out* last
  month (174 saved by inches). The concept's answer is not a smarter rule — it is no
  rule lookup at all: the door sees the scene and a live human confirms in seconds, or
  the CEO has granted standing authority. The doctrine trap is stated plainly: the
  post-2015 rule ("never leave a pilot alone") was *satisfied* last month — the
  attacker was the second person. Every rule is an autopsy turned into policy;
  scenarios are unbounded; therefore judgment + human authority, not enumeration.
  This reframing also resolves the surveillance objection: flexible judgment with a
  revocable authority dial is the governance proposal, not a technical bypass.
- **Numbers are mixed-source and flagged.** From reporting: the crash-axe attack, the
  ~14,000-ft dive in under 30 s, 174 souls, the off-duty pilots, the captain unlocking
  the door, the barred-from-flying finding, the Tabuk diversion. Illustrative:
  detection-under-2 s, T+0:08 summary, ~40 s saved, all ground-phase T-clocks,
  2,000 pax rerouted.
- **The emergency plan exists but is paper-and-drill today.** True at most airports:
  full exercises are annual, manifests arrive by email, coordination is by phone and
  radio. This is the honest baseline the right-hand column is compared against.

## 6. Sensitivity handling (the real event)

The grounding event is real, recent (30 Sep 2026), violent; the captain was seriously
injured and investigations are ongoing (a terrorism angle is being investigated).
Rules I applied:

- Anonymised: "a Dubai–Tel Aviv flight, last month" — no airline, no names, no photos,
  no imagery of the event anywhere in the deliverable.
- Clinical register: the violence is stated in facts (axe, dive figures, the lock) and
  never dwelt on. The emotional weight is carried by the *structural* insight — "luck
  is not a safety system" — not by graphic detail.
- Used strictly as a *response-orchestration and doctrine* scenario — never as
  security prevention.
- The honest boundary is stated on the page and spoken in the walkthrough: the airport
  cannot stop the axe from swinging; it changes the minutes after.
- A fully-fictional fallback ("unlawful interference diversion," no real-event
  reference) remains available; the anonymised version was chosen because the
  recognisable hook carries credibility the fiction lacks.

## 7. What I deliberately left out

- **Technical architecture.** The brief says feasibility isn't required; an architecture
  diagram would shift the audience from "imagine" to "evaluate."
- **Passenger-side experience.** One audience, one moment — the CEO. Passenger stories
  are the subject of a different (also good) concept.
- **ROI modeling.** A full business case would overpromise precision I can't defend.
  The cost of latency is argued qualitatively ("those minutes are where outcomes are
  decided"), not in euros.
- **The investigation itself.** The story uses reported facts only and never
  speculates beyond them (motive, accomplices, regulatory outcomes are ongoing).

## 8. Known risks of this concept

- *It's a best case.* The story shows a success; a hostile viewer could ask about
  failures. Mitigation: pre-answered in the walkthrough ("what if the AI misreads the
  scene?" → human-in-the-loop acknowledgment + audit trail + prediction-vs-outcome
  diffing).
- *The contested-surveillance flank.* Flight-deck cameras could dominate the CEO's
  reaction ("unions will never allow it"). Mitigation: the concept owns this
  proactively — the authority card IS the interaction, making the governance question
  the CEO's to decide rather than an objection to defend against, and the two-door
  argument is itself the case for loosening the recording rules.
- *Judgment can read as "unbounded AI."* v5 gives the machine more flexibility, so
  governance must be more explicit, not less. Mitigation: authority levels, trust
  records, revocability, divergence reports, and instant crew countermand are stated
  in the copy itself — not only in the appendix.
- *"Digital twin" / "nervous system" are buzzwords* that can trigger eye-rolls.
  Mitigation: each organ is shown doing one concrete, checkable job (the T+0:08
  summary sentence; the intent-guard rejecting the dive; the T+0:45 choreography).
- *Grim tone.* A violent scenario can leave the room heavy. Mitigation: the piece ends
  on the ordinary — the first-90-days reflex is a transfer queue, not a crisis — and
  the last line is the relief line, not the siren.
- *Change-management reality* (unions, vendors, procurement, airworthiness
  certification of anything touching flight controls) is untouched beyond the doctrine
  framing. Acceptable for a vision exercise; noted here so it's a choice, not an
  oversight.

## 9. If I had two more days

1. A 60–90 second cinematic cut of the split timeline as the opener (the page stays
   the interactive artifact) — in-flight phase rendered as an abstract cabin schematic,
   never as footage.
2. Real-ish data textures: a live mini apron diagram during the T+13 "act" beat —
   stand clearing, apparatus routes, pier E rerouting, drawn as moving dots; and a
   flight-path strip showing the rejected dive vs the guarded envelope.
3. A recorded "second opinion" card: what the duty manager's and the ATC controller's
   screens looked like at T+0:08 in both worlds, to show the nervous system helps
   every level, not just the CEO.
