# 5-Minute Walkthrough — Script, v5.2 "The Nervous System" (content APPROVED · Deliverable 3)

**Audience:** the airport CEO, in person.
**Props:** the interactive experience, driven live. Form is locked — the playable
prototype (`npm run dev`, or https://ai-airport.vercel.app). The CEO presses the
button; you narrate.
**Tone:** peer-to-peer. You are not selling software; you are showing them their T+0.
**Locked decisions:** anonymised real events · one moment · aircraft-side physical AI in
scope · judgment over doctrine · one decision card (the authority card).

---

## 0:00 – 0:30 · Open with their words, not yours

> "You told me something I can't stop thinking about: *'screens and data everywhere,
> but we still find out too late.'*
>
> I'm going to argue that sentence is exactly right — and that it isn't a data problem.
> Your dashboards aren't broken. **A dashboard is a report about the airport, written
> forty minutes ago.** And your playbook is worse — it's a report about the *last*
> crisis, written after it. Neither has eyes where your next crisis actually starts:
> inside the aircraft on approach. So the human stays in the middle of every loop, and
> the human — and the rulebook — is the latency.
>
> I could show you easy wins — a storm we see coming ninety minutes out. But you'd be
> right to say 'better analytics could do that.' So let me go straight to the event
> that breaks every dashboard you own — and every rule you wrote after the last one."

## 0:30 – 1:20 · The hardest test, with its two doomed branches

> "Last month, on a Dubai–Tel Aviv flight, a co-pilot attacked the captain with the
> cockpit's crash axe and dove the aircraft nearly fourteen thousand feet in under
> thirty seconds. Passengers forced their way into the flight deck and subdued him.
> 174 people landed safely.
>
> I want you to notice *why* they landed safely. One: the stabbed captain spent his
> remaining strength unlocking a door that, since 9/11, cannot be opened from outside.
> Ten seconds earlier into unconsciousness — the door is a wall, and everyone aboard is
> doomed. Two: the aircraft was flown down by two off-duty pilots who *happened* to be
> sitting in the cabin. Had they not been aboard, nobody left alive could fly the
> aircraft, and everyone aboard is doomed.
>
> **A dying man's arm and two off-duty pilots. Luck is not a safety system.**
>
> And one detail from before the flight: investigators found the attacker had been
> barred from flying in his home country over extremism concerns. The airline that
> rostered him that morning never knew. The signal existed — and reached no one."

<!-- CUT FOR TIME (Ashley: not enough room in the 5 minutes to tell the 2015 story).
     This was the narrated "intellectual core" segment. It is preserved intact here
     because it remains the RESERVE ANSWER — see the Q&A entry "2015 proves locked
     doors save lives" below, which stays live. If the interview runs long, or the
     CEO asks "why not just write a better rule?", deliver this verbatim.
     Restoring it: uncomment, and put back ~45 s — see the retimed schedule note
     under "Timing safety notes".

## 1:20 – 2:05 · Two doors, one rule (the intellectual core)

*(This is the move that separates the concept from a vendor pitch. Deliver slowly.)*

> "Now — before I show you the future, notice that this door has failed before.
>
> March 2015, the French Alps. A suicidal co-pilot locks the captain out and flies into
> a mountain. The captain knocks, pleads, attacks the door with an axe. The rule holds.
> **150 dead.** The rule worked exactly as written.
>
> Last month: the same rule holds — until a stabbed captain reaches the lock from the
> inside. **174 live, by inches.** The rule nearly worked exactly as written.
>
> Same door, same rule. In 2015 it kept the wrong man at the controls. Last month it
> kept help outside. And here's the trap: the doctrine written *after* 2015 — never
> leave a pilot alone in the cockpit — was satisfied last month. The attacker **was**
> the second person. So you write the next doctrine — release the lock when the crew is
> unresponsive — and you've written the autopsy report of the disaster after that one.
>
> Every rule is a scar from a scenario that already happened. What's left are the
> scenarios nobody has enumerated yet. **You cannot enumerate the future. The door
> needs to see — not to obey.**"
-->

## 1:20 – 3:15 · The split timeline (the core scene)

*(Run the split timeline — in the air, then on the ground. Narrate five beats, ~15s each:)*

- **T+0:00** — "Left: the door is locked from inside; the only key is the captain's
  hand, and the captain is dying. Right: smart cameras in the cabin and the flight deck
  flag violent contact and crew posture collapse in under two seconds. Every person's
  movement — passengers surging forward, the captain at the lock — is a tracked,
  understood scene."
- **T+0:08** — "Left: nobody on the ground knows anything. Right: the AI compresses the
  video into plain language plus a six-second clip, streamed live to ATC, airline ops
  and you: *'violent intrusion in flight deck; captain unresponsive; aircraft
  deviating.'* A human acknowledges. That's your human-in-the-loop — seconds, not
  hours."
- **T+1:05 → T+1:09** — "Here is the moment the whole idea turns on. Left: the rulebook
  has nothing for this — the binder says the door does not open. Right: the scene
  matches no playbook, so the system doesn't look one up. It *sees* — recognized faces
  at the door, senior cabin crew among them, no weapon visible, the captain down at the
  lock inside and the co-pilot at the controls. It summarizes, recommends release, and
  asks a live human once. **A human at ATC ops says yes.** The door opens
  minutes sooner than a dying man's arm managed. Nobody consulted a rule. The
  machine saw; a human decided."
- **T+2:30 → T+3:00** — "Left: the aircraft is falling — 14,000 feet in 30 seconds; on
  the ground a radar symbol falls. Right: envelope protection escalates to an
  intent-guard — the uncommanded dive is arrested. The AI stabilizes and guides; a
  human keeps the controls."
- **T+3:00 → T+38:00** — "Left: two off-duty pilots take the controls — luck; fire
  trucks still positioning on landing; the manifest on hold with the airline; the report
  written from memory weeks later. Right: stabilized and guided with the envelope held —
  the off-duty crew or a ground pilot flies it; fire arrives before the aircraft stops
  rolling, because the choreography was computed at T+0:45; the manifest reconciled
  against your own bag-drop and border data; the stand cleared by autonomous apron
  vehicles; two thousand passengers rerouted around the arrival pier; counsellors briefed
  **before the first family calls**; and the incident report auto-assembled from the full
  sensor and action log — second by second, court-ready."

*(Pause. Deliver the honest boundary slowly — this line buys your credibility:)*

> "Let me say plainly what this airport **cannot** do: stop the axe from swinging. It
> did not happen in your sky — and anyone who sells you prevention is selling something
> else. What changes is the four minutes in the air and the eight minutes to the chocks.
> Today those minutes are filled with luck, and with a rule that fails quietly. Then
> they're filled with a nervous system that sees, and hands that act."

## 3:15 – 3:50 · Name the mechanism: why *physical* AI

> "Notice what better analytics could NOT do here. There was nothing to predict. And
> notice what a better rulebook could not do either: the rule existed, it held, and it
> nearly killed everyone aboard. What's missing is not data and not doctrine.
>
> Three organs, spanning aircraft and airport. **Eyes** — smart cameras in the cabin and
> flight deck, fused with your cameras, LiDAR, IoT and the ATC data link: one live
> world-model from seat 14A to stand B7. **Brain** — turning video into plain-language
> situational reports in seconds, judging scenes no playbook enumerated and telling you
> when it is uncertain, rehearsing ground choreographies while the aircraft is still
> inbound, and — one level up — fusing crew-risk signals across jurisdictions so the
> barred-from-flying file never lets the roster be built. **Hands** — the smart lock,
> the guarded autopilot, apron vehicles, robots, signage that reconfigures itself. The
> plan executes without a phone call per action.
>
> Sense, summarize, judge, act, inform. The human leaves the middle of the loop and
> moves to the top of it — holding the authority dial."

## 3:50 – 4:35 · Hand them the button: the decision inbox

*(Show the notification card. Let the CEO interact.)*

> "This is your new interface. Not a wall of red — an inbox of decisions. At T+38 you
> get one card: resolved, 174 souls, captain in surgery and stable, full second-by-
> second audit trail — and one decision. Not 'what happened'; the airport handled that
> and reported. This:
>
> **How much judgment do we give the nervous system?** At T+1:05 the system met a scene
> no playbook covered. It saw, summarized, recommended — and waited 4.2 seconds for a
> human yes. The door opened. <!-- CUT FOR TIME: the next two sentences named 2015
> ("The alternative was not safer. The alternative was 2015: a rule that could not be
> broken, a captain knocking on a door that would not open."). Replaced by the shorter
> line below, which keeps the point — a rule that cannot break — without the case. -->
> The alternative was not safer: a rule that cannot break, and nobody able to see
> through the door.
>
> Three buttons: grant standing adaptive authority; keep live human confirms; or keep
> fixed doctrine — and if you keep the rulebook, the system will log every scene that
> diverges from it and show you the divergence report after each event.
>
> Go ahead — press it." *(Let them. Any choice is honored and logged.)*
>
> "Whatever you pressed, that's the question: **how much judgment are we willing to give
> a system that can see?** Risk, trust, governance. CEO-shaped questions like this
> arrive about three times a day, not three hundred. Your job changes from finding out
> last to deciding what matters — and how much of the machine's judgment you're willing
> to underwrite."

## 4:35 – 5:00 · Close: one reflex, not a revolution

> "Two honest caveats. The numbers are illustrative where flagged — sized to be
> plausible, not measured at your airport. And the hardest part isn't technical:
> flight-deck cameras are the most contested surveillance question in aviation.
> <!-- CUT FOR TIME: "After 2015," prefaced this — it assumed the listener knows the
> Germanwings case. The restriction is current law and needs no date to be true. -->
> Cockpit recordings are restricted to accident investigation, and crews resist
> live monitoring. I'm not pretending that debate is settled — I'm proposing what could
> win it: no continuous recording, event-triggered summaries, human authority on every
> irreversible act, crews co-designing the governance. <!-- CUT FOR TIME: this close
> used to land on the 2015 captain — "Your 2015 captain knocked on a door that could
> not open. That is the argument." That beat is retired with the segment above; the
> replacement keeps the same conclusion on this month's event alone. -->
> Last month, a dying captain had to reach a lock from the inside because nothing
> outside could see him. That is the argument.
>
> The path isn't 'build the AI-native airport.' It's: teach it **one reflex**. Ninety
> days, one closed loop on an ordinary problem — transfer queues — one number that
> moves: the delay between cause and understanding. Authority starts at live confirms
> and earns its way up. Then federate outward: airline feeds, ATC data link, crew-risk
> sharing. The emergency day isn't a special project; it's the same nervous system at
> full stretch.
>
> **By the time you hear the alarm, the urgent steps are already taken care of.** And when the
> next aircraft comes in sick, your airport won't need luck — and won't need a rule that
> happens to fit."

---

## Timing safety notes

- **SCHEDULE CHANGE (2015 cut).** The "Two doors, one rule" segment is commented out
  for time, freeing ~45 s. The split timeline above now starts at 1:20 instead of 2:05
  and is labelled `1:20 – 3:15`, which gives the core scene **115 s instead of 70 s**.
  That is deliberate: the timeline is the core scene, and it now absorbs the freed time
  as room to breathe rather than the whole talk ending 45 s early. The segments after it
  (3:15 onwards) keep their original marks, so nothing downstream shifts.
  *If you would rather finish early:* label the timeline `1:20 – 2:30` and shift every
  following segment back by 45 s (2:30–3:05, 3:05–3:50, 3:50–4:15) for a 4:15 close.
- If running short: compress the timeline to three beats (T+0:00, T+1:05/1:09, T+9:00)
  and shorten Move 3 to one sentence per organ. **Never cut the honest boundary** — it is
  the credibility move. The "two doors" argument is no longer narrated, but it is still
  the reserve answer below; if the CEO asks "why not just write a better rule?", deliver
  the commented-out segment verbatim.
- If the CEO engages at the authority card, let it run; that interaction IS the
  deliverable.
- Q&A — "so the AI opens cockpit doors whenever it wants?" → "No. The default is a live
  human confirm — 4.2 seconds. Standing authority is something you grant, it builds on
  a trust record, it is revocable in one tap, every act is logged and streamed to ATC,
  any conscious crew member countermands instantly, and low-confidence scenes always
  escalate. The machine decides *what to recommend*; a human — or authority you granted
  — decides *what happens*."
- Q&A — "what if the AI misreads the scene?" → "It doesn't act on its own reading: the
  summary and the 6-second clip go to a human at ATC ops simultaneously. And misreading
  is exactly why we log divergences — every scene that matched no playbook becomes a
  training and governance case, not a silent failure."
- Q&A — "cockpit cameras will never be approved" → "That's why the governance is the
  product: no continuous recording, event-triggered summaries, human authority on
  irreversible acts, crew co-design. Outward-facing cockpit-door cameras are already
  certified and flying today; the debate is inward-facing — and two doors, eleven years
  apart, are the argument that wins it."
- Q&A — "2015 proves locked doors save lives" → "It proves a rule can fail in both
  directions. In 2015 the rule kept the wrong man at the controls; last month it kept
  help outside. Neither failure was visible in advance — which is precisely why
  enumerated rules are the wrong instrument, and scene judgment with human authority is
  the right one."
- Q&A — "the airport doesn't own the aircraft" → **Concede precisely, then invert.**
  "Correct, and I'm not proposing you buy it. Cabin sensing is airline and OEM
  territory, certified to the airframe — anyone who tells you an airport can procure
  flight-deck cameras is selling you a lawsuit. But notice where that leaves you: your
  picture of an inbound aircraft is a list of timestamps. ACARS health data goes to the
  airline's operations centre, not yours. Your AODB knows a door closed; nothing tells
  you what's happening behind it. **The fence is the latency.** And here's what you do
  own — the apron is the non-movement area, outside ATC control, with overall
  responsibility for vehicles and stands resting with you as airport operator. Every
  hand in this concept that acts on the ground acts on your sovereign ground. You also
  already own the room: the APOC, where your team, ATC, the airlines, your handlers,
  fire and police already sit around one picture. So the aircraft's nervous system
  doesn't become your property — it becomes a party to a federation you govern, and
  governing it is the product. That's why the last thing I show you is a dial in your
  hand, not a dashboard: an airline CTO can't set risk appetite for 174 people on your
  stand. Full treatment in `OWNERSHIP.md`."
- Q&A — "who actually signs the cheque?" → "The airport operator, first. They already
  buy this category — DFW's runway twin with Willow and Parsons, Vienna with Nemetschek,
  Denver with Autodesk Tandem, Munich and Narita buying autonomous apron operations.
  Ground handlers are the faster channel: dnata and Swissport buy the tugs and are
  labour-constrained. The airline is the **data** partner, not the buyer — and you have
  leverage: you own stands, slots and apron access, and A-CDM already proves airlines
  share data because the network requires it and faster turnaround helps them. Widening
  that existing clause by one line — event summaries alongside timestamps — is the whole
  commercial insight."
- Q&A — "but ATC isn't the airport" → "Usually true, and it doesn't block this: the
  ANSP owns the airspace, you own the ground, and A-CDM already federates between parties
  who can't command each other. But in *your* case the fence is thinner — the Airports
  Authority is both the airport operator and the air navigation service provider, so the
  tower, the approach and the apron answer to one organisation. The data-link picture and
  the ground nervous system are already under one roof. What's missing isn't authority;
  it's the layer that turns both into understanding." *(Only if the audience is Israeli /
  Ben Gurion — do NOT generalise the IAA's dual role to other airports.)*
- Q&A — "who owns this? IT or ops?" → "Neither — a new function. The nervous system sits
  above your systems, governed by playbooks ops and crews sign off on."
- Q&A — "why is this not just A-CDM / an APOC upgrade?" → "A-CDM shares data between
  partners; it still assumes humans act and procedures suffice. This closes the loop
  with actuation — locks, autopilot guards, vehicles, signage — and judges scenes
  instead of looking up procedures."
- Q&A — "why no everyday examples?" → "There are — the first-90-days reflex is an
  ordinary transfer-queue problem. The emergency is the proof point because it's the
  hardest case: if the nervous system survives zero seconds and a scene no rule covers,
  ordinary days follow."
