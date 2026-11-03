# T+0:00 — The Door
## An AI-native airport concept · Core idea (Deliverable 1)

**Headline:**

> # "By the time you hear the alarm, the urgent steps are already taken care of."

**The idea, in one paragraph:**

The AI-native airport does not give the CEO more screens. It gives the airport a
nervous system: sensors as eyes, a digital twin plus agents as the brain, and
actuated infrastructure as hands — and that nervous system does not stop at the
fence, because the crises do not. The airport senses its physical environment
continuously, understands scenes instead of looking up procedures, and acts on
its own, escalating to humans only the decisions that carry judgment, money or
care. The CEO stops being the person who finds out last, and becomes the person
who decides what matters.

**Why this reframes the CEO's complaint:**

*"We have screens and data everywhere, but I still feel like we find out about
problems too late."* That is not a data problem, and more screens cannot fix it.
Two structural reasons the airport is always last to know:

1. **Today's systems report the past.** A dashboard turns red forty minutes after
   the queue already formed. A playbook is worse — it is a report about the *last*
   crisis, written after it.
2. **The airport's picture of an aircraft is a list of timestamps, not a scene.**
   Through A-CDM and the AODB the airport learns that a door closed, that wheels
   went down, that a stand was reached. It does not learn what is happening behind
   that door: aircraft health and cabin data flows over ACARS to the *airline's*
   operations centre, not to the airport. The airport is told that a door closed.
   It is never told what is happening behind it.

And most airport problems are *physical* — a lock, a control column, a stand, a
queue, a spill. Data without hands can only warn; it cannot resolve. Physical AI
closes the loop: sense → understand → act → inform. The human moves from the
middle of the loop (making phone calls) to the top of it (making value judgments).

**The story we tell — one moment, run twice, on a single clock:**

Last month, on a Dubai–Tel Aviv flight, a co-pilot attacked the captain with the
cockpit's crash axe and dived the aircraft nearly fourteen thousand feet in under
thirty seconds. Passengers forced their way into the flight deck and subdued him.
174 people landed safely. We follow that one event through two airports.

- **Run 1 — the humans.** They lived because of two pieces of luck. A stabbed
  captain spent his remaining strength unlocking a door that, since 9/11, cannot
  be opened from outside; and two off-duty pilots *happened* to be sitting in the
  cabin. Ten seconds earlier into unconsciousness and the door is a wall. Without
  those two licences, nobody left alive could fly the aircraft.
  **A dying man's arm and two off-duty pilots. Luck is not a safety system.**
- **Run 2 — the nervous system.** Same event, same clock. Cabin and flight-deck
  sensing flags violent contact and crew-posture collapse in under two seconds.
  The scene is compressed into plain language plus a six-second clip and streamed
  to ATC, airline ops and the CEO. No playbook fits, so the system does not look
  one up — it *sees*: faces at the door, senior crew among them, no weapon
  visible, the captain down at the lock. It summarizes, recommends release, and
  asks a live human once. **A human says yes ** and the door opens
  minutes sooner than a dying man's arm managed. Envelope protection
  escalates to an intent-guard and the dive is arrested. On the ground the
  choreography was computed at T+0:45: fire arrives before the aircraft stops
  rolling, the stand is cleared by autonomous apron vehicles, two thousand
  passengers are rerouted around the arrival pier, the manifest is reconciled
  against the airport's own bag-drop and border data, counsellors are briefed
  **before the first family calls**, and the incident report is auto-assembled
  from the full sensor and action log — second by second, court-ready.

**The door has failed before — which is why a rule cannot be the answer:**

Same door, same rule, eleven years apart. In 2015, in the French Alps, it kept a
suicidal co-pilot at the controls: **150 dead — and the rule worked exactly as
written.** Last month it kept help outside: **174 lived by inches — and the rule
nearly worked exactly as written.** And the doctrine written *after* 2015, never
leave a pilot alone, was satisfied last month, because the attacker **was** the
second person. Write the next rule and you have written the autopsy report of the
disaster after that one. Every rule is a scar from a scenario that already
happened. **You cannot enumerate the future. The door needs to see — not to
obey.**

**What the CEO is asked to imagine — and to decide, live, in the demo:**

Not thirty dashboards. One card: the CEO's new inbox, carrying the ~3 decisions a
day that genuinely need a human. And the decision in the demo is pressed by the
CEO themselves:

> **How much judgment do we give a system that can see?**

Three buttons: grant standing adaptive authority, keep live human confirms, or
keep fixed doctrine — and if the rulebook stays, the system logs every scene that
diverges from it and reports the divergences after each event. Every act is
logged, revocable in one tap, streamed to ATC, countermandable by any conscious
crew member; low-confidence scenes always escalate.

**The honest boundary — stated, not buried:**

This airport **cannot** stop the axe from swinging. It did not happen in your sky,
and anyone who sells you prevention is selling something else. What changes is the
four minutes in the air and the eight minutes to the chocks. Today those minutes
are filled with luck, and with a rule that fails quietly. Then they are filled
with a nervous system that sees, and hands that act.

**Who owns what — because the CEO will ask, and it is the right question:**

The aircraft belongs to the airline. The airspace belongs to the ANSP. The airport
can buy neither, and this concept does not pretend otherwise. What the airport
*does* own is the apron — the non-movement area, outside ATC control, where the
airport operator carries overall responsibility for vehicle and stand operations —
and the APOC, the standing room where airport, ATC, airlines, ground handlers,
fire and police already coordinate. So the nervous system is not a claim of
ownership over the aircraft. It is the **federation point**: where the aircraft's
nervous system meets the ground's, and where the CEO governs the authority dial.
The full argument, today's data flows, and who buys this are in `OWNERSHIP.md`.

**The path is one reflex, not a revolution:**

Ninety days, one closed loop on an ordinary problem — transfer queues — one number
that moves: the delay between cause and understanding. Authority starts at live
confirms and earns its way up. Then federate outward: airline feeds, ATC data
link, crew-risk sharing. The emergency day is not a special project; it is the
same nervous system at full stretch.

---

*Deliverable 2 (visual experience): the interactive experience in this repo —
`npm install && npm run dev`, or the live build at https://ai-airport.vercel.app.
Run 1 plays the humans; Run 2 plays the nervous system; the freeze control holds
the clock for live narration; the dossier is the risk appendix.*
*Deliverable 3 (5-minute walkthrough): see `WALKTHROUGH.md`.*
*Thinking process, assumptions and trade-offs: see `THINKING.md`.*
*Ownership, data flows and buyer: see `OWNERSHIP.md`.*
