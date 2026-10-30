# GAME-DESIGN v3 — "The Door · T+0" (build spec · APPROVED)

> Status: **approved — building now.** Content/story stays PLAN.md v5.1; this defines the
> *interactive form* per Ashley's redesign + the three v3 decisions below.
>
> **v3 decisions (LOCKED by Ashley):**
> - **Depiction: Level 2 — stylized/representational.** Silhouetted vector figures, shown
>   but not graphic; no faces, no blood, no weapon detail. Built in pure code (SVG
>   silhouettes); generated clips are an atmosphere upgrade layer, not a dependency.
> - **Run 1 outcome: canonical path always succeeds**, mirroring reality. No "you died /
>   150 lost" fail-screen on a real tragedy; the game narrates *how close it was*.
> - **The boldest claim, SOFTENED:** the AI does **not** autonomously land the airliner.
>   It **stabilizes the attitude, guards the envelope, and guides** — a ground pilot /
>   the off-duty crew fly it, with auto-landing only where certified. Framed as vision
>   with the honest boundary. Run 2 D2 and the risk dossier updated accordingly.
>
> **v2 change (Ashley-directed):** the game is no longer an abstract duty-manager sim.
> **Run 1 is a first-person replay of the real event, switching characters** — you are the
> dying captain trying to open the door, then a passenger fighting the attacker, then the
> untrained person at the controls during the dive; the ending reveals two off-duty pilots
> landed it. **Run 2 is a cinematic replay where the AI is in control and the player is the
> decision-maker the AI reports to** — you authorize the AI to open the door so the captain
> gets help, and to fly/land the aircraft at the nearest available airport while contacting
> that airport. **Phase 2 (ground) is cut from gameplay.**
>
> Tagline (canonical): **"By the time you hear the alarm, the urgent steps are already
> taken care of."**

---

## 0 · Locked decisions (Ashley)

1. **Assets: option C (hybrid).** I build the complete, fully playable game in pure code
   (SVG + CSS + framer-motion + canvas), and reserve 3–4 slots (§6) for clips Ashley
   generates. The game works with or without them; I show it before integrating any clip.
2. **Structure: two runs, character-switching replay** as detailed in §2.
3. **Risks: in-game "fine print" dossier (unlocked after the run) + written into docs.**
4. **Current page: keep both.** The game is the primary experience; the scroll-page becomes
   the "deep-dive / the argument in full," sharing story, palette, type, and SVGs.
5. **Ground phase: cut from gameplay.** The airport's ground response survives only as a
   brief, non-interactive animation when Run 2's AI contacts the nearest airport.

---

## 1 · The core design insight (why this works as a game)

The thesis is: *the machine handles almost everything; humans make a few judgment calls —
and today, when the machine doesn't exist, ordinary people had to do the impossible.*

So the two runs make the player **feel both sides of that**, in first person:

> **Run 1 — "The humans."** You are the dying captain fighting for the door. You are the
> passenger who goes in. You are the untrained hand on the yoke while the altimeter
> screams. You experience the impossibility — and that, somehow, 174 people lived anyway.
> The emotional payload: **it worked by inches, and by luck.**
>
> **Run 2 — "The nervous system."** The same scenes replay, cinematically. This time the
> AI does the physical work and reports to *you* — the decision-maker. You authorize the
> door to open so the captain gets help. You authorize the aircraft to fly itself to the
> nearest airport while it informs that airport. You stay calm. Nobody needs luck.

The felt swing — from *desperation you can barely survive* to *calm authority* — **is the
pitch.** Less wording, more animation: Run 1 is mechanic-driven (you struggle), Run 2 is
cinematic (you watch the machine work and decide at four moments).

**Tone is serious throughout.** This is grounded in a real, recent, violent event with an
ongoing investigation and a seriously injured real person. No bounce, no score-chasing, no
celebratory feedback. Restraint is the respect. (Deliberately *not* the playful style used
for learner apps.)

---

## 2 · Game structure (screens, scenes, mechanics)

### Screens
1. **Title** — "The Door · T+0". One line. `[ Begin ]`. *(clip slot #1: title loop.)*
2. **Cold-open (optional, ~15s, skippable)** — abstract: radar sweep, a door graphic, an
   altitude trace, two numbers (150 / 174). Ends: *"Luck is not a safety system. Run it
   again — with a nervous system."* No violence depicted. *(clip slot #2.)*
3. **Run 1 — four scenes** (§2.1).
4. **Run 2 — cinematic replay + four authorizations** (§2.2).
5. **Result / dossier** — the honest metrics, then the **Risks & mitigations "fine print"**
   (§4), then the close.

### 2.1 · Run 1 — "The humans" (first-person, character-switching)

The player is thrown into the event and must feel the difficulty. Emotion is delivered
through **mechanics** (decaying strength, narrowing vision, oversensitive controls, warning
tones, screen tilt/shake) — not through graphic imagery. (Depiction level is the §3 fork.)

**Scene 1 — "The Captain" (you are the captain).**
- Setting: schematic first-person flight deck. A coral threat-marker is at the controls,
  driving the aircraft down. You are injured: a **strength meter drains**, the screen
  vignettes and sways, audio muffles — you feel yourself failing.
- Objective: **unlock the flight-deck door from the inside** so help can reach you and
  stop the attacker. Mechanic: a **hold-to-unlock ring that keeps slipping** as your
  strength decays — genuinely hard; you must keep re-gripping it as it fades.
- The dive begins here (altitude trace falling; 14,000 ft / 30 s).
- Beat: on success, a quiet card — *"He reached the lock with his remaining strength. Ten
  seconds earlier into unconsciousness, this door is a wall."*

**Scene 2 — "The Passengers" (you are one of them).**
- The door is open (you opened it). Objective: **subdue the attacker.** Mechanic: an
  abstracted **struggle/timing bar** — press in rhythm as other passenger-markers converge;
  no gore, rendered as a contest of force, not violence imagery.
- Beat: attacker taken down. *"The only thing between 174 people and the ground is now
  whoever can fly this aircraft."*

**Scene 3 — "The Controls" (you have no experience).**
- Objective: **stop the dive.** Mechanic: keep a pitch/altitude indicator inside a shrinking
  safe band using oversensitive controls; heavy screen-shake, screaming altitude, warning
  tones. Deliberately hard — the player has "no idea what they're doing," which is the point.
- Beat: the aircraft stabilizes. *"Stabilized. Not landed — just not falling. Nobody alive
  up here can land it."*

**Scene 4 — "The Reveal" (ending of Run 1).**
- Calm. Reveal: **two off-duty pilots were sitting in the cabin.** They take the controls and
  land it safely in Saudi Arabia.
- Payload: *"174 people lived because of a dying man's arm, a handful of strangers, and two
  licences that happened to be aboard. **Luck is not a safety system.**"*
- Transition: *"Now run it again — with a nervous system."* → Run 2.

### 2.2 · Run 2 — "The nervous system" (cinematic, you decide)

Same four beats replay, movie-style. The **AI does the physical work**; the player is the
**decision-maker it reports to**. Fewer, weightier interactions; the animation carries the
rest. The AI's reports are one line + a small scene, never paragraphs.

- **D1 · T+1:05 — The door.** The AI shows the scene it sees (the schematic flight deck,
  now live): *"Violent intrusion. Captain unresponsive at the door. Aircraft deviating.
  No playbook matches. Recommend: release the lock so help and medical reach the captain."*
  You: `[ Authorize release ]  [ Hold ]  [ Show me more ]`. A **4.2s confirm ring counts
  down** (the only thing that counts down in the piece). → animation: the door swings open
  on its own; medical/passenger markers reach the captain immediately. Consequence: *"Help
  reaches him ~40 s sooner. He never had to reach the lock."*
- **D2 · The dive.** The AI's intent-guard rejects the dive automatically (you watch the
  altitude trace snap flat), then escalates: *"Envelope held. Attitude stabilized. No one
  aboard can land this — recommend I hold the aircraft stable and guide a ground pilot /
  the off-duty crew to the nearest suitable airport. (Auto-landing only where certified.)"*
  You: `[ Authorize stabilize-and-guide ]  [ Keep searching for a pilot ]`. → animation: the
  aircraft icon steadies, a guidance vector draws toward the airport, and the human pilot
  marker takes the controls with the AI holding the envelope around them.
- **D3 · Contact the airport.** *"Nearest suitable airport identified and contacted. They
  are pre-positioning fire and medical; stand cleared; counsellors briefed. Confirm the
  emergency message and services."* You: `[ Confirm ]  [ Redirect to a farther airport ]`.
  → brief animation of the airport's ground response lighting up (the cut Phase 2, as a
  5-second non-interactive nod).
- **D4 · The dial (meta).** *"Event resolved. 174 souls. How much standing authority do you
  grant the nervous system going forward?"* `[ Standing adaptive authority ]  [ Live human
  confirms ]  [ Fixed doctrine ]` (the approved authority card; each outcome honored/logged).
- **Ending:** *"Same 174. This time nobody needed luck — and nobody needed a rule that
  happened to fit. You made four decisions. The machine did the rest."*

### Scoring (honest, not points-for-fun)
A dossier, not a leaderboard: souls (174), time-to-understanding (Run 2 seconds vs Run 1's
"too late"), decisions made, trust earned. No grade-chasing; it summarizes what happened.

---

## 3 · THE sensitivity fork (needs Ashley's decision)

Run 1 asks the player to **be the dying captain of a real, recent, under-investigation
violent attack**, then a passenger fighting the attacker. This is far more visceral and
participatory than anything in the approved PLAN, which we locked as **clinical, anonymised,
no event imagery, response-orchestration framing only.** First-person re-enactment sits in
direct tension with that lock, and a reviewer could read "play as the stabbing victim" as
sensationalizing a real man's ordeal in a job application.

I'm not refusing — the purpose is legitimate (arguing *for* safety systems, honoring how
close it was), and it's your call for your take-home. But I want you to choose the
**depiction level** with eyes open, because it determines both the taste-risk and the art
plan:

- **Level 1 — Abstract / schematic (my recommendation, and pure-code buildable).**
  Everything in the vector language already in the page: the flight deck as a top-down
  schematic, the attacker as a coral threat-marker (no rendered figure, no weapon, no
  blood), the dive as an altitude trace, the injury as a **decaying strength meter +
  narrowing vision + screen sway**. You still *feel* the desperation and difficulty —
  through mechanics, not imagery. Defensible for a job application; consistent with our
  locked clinical rule; fully buildable by me with zero external assets.
- **Level 2 — Stylized / representational.** A stylized cockpit, silhouetted figures, the
  struggle shown but not graphic. More immersive, more taste risk, and it would want your
  generated art (I can't produce it). Achievable as an upgrade to Level 1's slots.
- **Level 3 — Realistic / literal first-person.** Highest immersion, highest risk. For a
  real stabbing with an ongoing terrorism investigation, I'd advise against it in a job
  take-home: the downside (a reviewer finds it exploitative) outweighs the upside.

I recommend **Level 1**, with the option to elevate specific beats to Level 2 later if you
generate clips. Level 1 still delivers exactly what you asked — *"the player must
experience the emotion and difficulty"* — because difficulty is a mechanic, not a picture.

---

## 4 · Risks & mitigations (in-game dossier + docs)

### 4a · Risks of the solution (shown in-game as the "fine print" after the run)

| Risk | Why it's real | Mitigation built in |
|---|---|---|
| **Wrong scene judgment** — AI misreads and opens a door it shouldn't, or fails to | Perception is probabilistic | Never acts on its own read: summary + 6s clip to a live human; conjunctive triggers; any conscious crew member countermands instantly; low-confidence scenes escalate; every divergence logged |
| **Remote flight-control** — AI touching flight controls is the boldest claim here | Not certified to land an airliner | **Scoped down deliberately:** the AI stabilizes attitude, guards the envelope, and *guides* — a ground pilot / the off-duty crew fly it, auto-landing only where certified. Grounded in DARPA ALIAS (autonomous 737-sim landing, 2016) + standard envelope protection; honest boundary stated |
| **Cyber-attack surface** — a networked system with hands on locks & flight controls is hackable | Newly true; the lock is now addressable | Safety-critical actuation on isolated, signed channels; commands cryptographically authenticated; hardware fail-safe reverts to manual; aviation-grade (not IT-grade) security |
| **Adversarial spoofing** — fooling the cameras | Vision can be deceived | Multi-sensor fusion (cameras + LiDAR + ATC data link + aircraft state); sensor disagreement is itself an alarm; no single sensor authorizes an irreversible act |
| **Cockpit/cabin surveillance** — crews & regulators restrict flight-deck recording (post-2015 rules; IATA Jan-2026 position) | The most contested part; could sink adoption | Event-triggered summaries, no continuous recording; human authority on every irreversible act; crews co-design governance; a doctrine to be *earned* |
| **Automation complacency** — humans stop watching | Classic autopilot failure mode | Human stays at the top of the loop with real, weighted decisions; trust record earned & revocable; periodic manual drills |
| **Ownership / jurisdiction** — the airport doesn't own the aircraft | Cabin sensing is airline/OEM | Federation model: the airport is where the aircraft's nervous system meets the ground's; the CEO governs the authority dial, not the airframe |
| **Cost, ROI, change management** — unions, vendors, procurement, certification | Real and slow | Starts with one 90-day ground reflex on an ordinary problem, measurable latency delta, before touching anything safety-critical |
| **Model drift / lock-in** — accuracy decays; one supplier owns the reflexes | Long-term | Prediction-vs-outcome diffing after every event; open interfaces; the accumulated physical memory is yours, portable |
| **Taste / trivialization** — gamifying a real tragedy | Deliverable risk | Level-1 abstract depiction; clinical tone; no gore, no celebratory feedback; the event framed as a decision simulation and a safety argument, never entertainment |

### 4b · Risks of the game form (honest self-assessment — docs only)
- **Gimmick risk** — "game" may read unserious to an airport CEO. → Framed as a *decision
  simulation* / "run the event twice," sober art direction, real risk dossier.
- **Taste risk** — interactive re-enactment of a real attack. → Level-1 abstraction (§3);
  no violence imagery; the near-miss handled with weight.
- **5-minute drivability** — must be demonstrable live. → Run 1 ~75–90s, Run 2 ~90s,
  single-click decisions; presenter can auto-play Run 1.
- **Build risk** — more moving parts than the page. → Pure-code, self-contained, testable;
  the page stays in git as a fallback.

---

## 5 · Motion & art direction (vector-first, Level 1)

- **Everything is the schematic, animated.** Run 1 Scene 1 = the top-down flight deck from
  the page, now first-person-adjacent: a coral threat-marker at the yoke, a gold
  hold-to-unlock ring, a draining strength meter, a vignette that closes in. The dive = a
  falling altitude trace + screen tilt. Run 2 = the same schematic, teal-lit and calm:
  perception rings pulse, the door swings, the trace snaps flat.
- **Two lighting states.** Run 1 is coral-lit, jittery (shake, overlapping timers, a rising
  "unresolved" meter). Run 2 is teal-lit, steady (things resolve and leave the screen; the
  meter stays low). The player feels the difference before reading anything.
- **Signature motion = the T-counter** heartbeat from the page; the 4.2s confirm is the only
  thing that counts *down*.
- **Palette/type discipline unchanged:** coral = Today, teal = AI-native (never share an
  element), gold = human decisions only. Instrument Serif (display) / JetBrains Mono
  (clocks, data) / Inter (prompts).
- **Audio (optional, off by default):** a heartbeat in Run 1, a calm tone in Run 2, warning
  chimes on the dive. No music that trivializes.

---

## 6 · Clip slots (option C — the game is complete without these)

All abstract/atmospheric — **no faces, no blood, no weapon, no recognizable airline or
livery, no real-event imagery.** Specs if you choose to generate:

1. **Title loop** — 6–8s seamless, 1920×1080, dark; slow radar sweep / particle field, teal
   accent. Mood: a quiet control room before a storm.
2. **Cold-open sting** — 8–12s, 1920×1080; abstract door silhouette, an altitude trace, a
   heartbeat line. Coral→teal shift. No people, no cockpit interior.
3. **"The dive" texture** — 3–5s loop for Run 1 Scene 3 background (storm-light through a
   window, violent motion-blur) at low opacity. (I can also do this fully in code.)
4. **Run-2 ambient** — 8–10s calm loop (rain-on-apron / runway-light bokeh) for the
   cinematic replay background.

Deliver as MP4 (H.264) or WebM + a poster frame each; I handle compression, looping, and
graceful fallback if a file is missing.

---

## 7 · Decisions requested (before I build)

1. **Depiction level for Run 1 (§3):** Level 1 abstract/schematic (recommended, pure-code)
   / Level 2 stylized (wants your art) / Level 3 realistic-literal (advised against).
2. **Run 1 outcome model:** (a) the canonical path always succeeds, mirroring reality, with
   the game narrating "how close it was" (recommended — the story completes, no "you died,
   150 lost" fail-screen on a real tragedy); or (b) genuine branching fail-states with a
   "what if he hadn't reached the lock" branch.
3. **The boldest claim:** present "the AI flies and lands the airliner" as the vision with
   the honest-boundary + risk framing (recommended), or soften it to "the AI stabilizes and
   guides a ground pilot / auto-lands only if certified"?

Then I build the pure-code game (option A/C core), verify it the way I verified the page
(headless geometry + DOM + color assertions, since vision_analyze is timing out), show you,
and only then integrate any clips you generate.
