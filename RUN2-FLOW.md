# RUN 2 — THE AI NERVOUS SYSTEM · complete flow

Source of truth: `src/game/Run2.tsx`. Art manifest: `src/game/art.ts`.
Current as of commits `0b7797f`, `feb68c9`, `0fb5915`.

---

## 1 · THE SPINE

Ten steps, strictly linear. **No option ever routes you to a different step.**
Options only change copy and images on later steps — and only two of the four
choices actually do.

```
                        ┌─────────┐
                        │  INTRO  │   no image · teal vignette
                        └────┬────┘
                             │ "Run it again →"
                             ▼
        ╔═══════════════════════════════════════════╗
        ║  D1 · THE DOOR          T+1:05   ⏱ 10 s   ║
        ║  "Release the smart lock?"                ║
        ║  IMG  r2-detected.jpg   ← plate 2.2 s     ║
        ║       (art shows co-pilot at controls,    ║
        ║        captain down, + baked AI threat-ID ║
        ║        overlay top-right → no Attacker    ║
        ║        row here, the image names him)     ║
        ║  rows: Door lock · Sealed                 ║
        ║        Crew · Briefed · 3 at door         ║
        ║        Souls · 174 · Playbook match · None║
        ╠═══════════════════════════════════════════╣
        ║  ▸ RELEASE        → door:"release"  ●gold ║
        ║  ▸ HOLD           → door:"hold"           ║
        ║  ▸ Show me more   → telemetry in place    ║
        ║  ▸ clock expires  → door:"auto:release"   ║
        ╚═══════════════════╤═══════════════════════╝
                            │   BOTH go to the same step.
                            │   Only copy + image differ ↓
                            ▼
   ┌────────────────────────────────────────────────────────────┐
   │  D1 RESULT                       T+1:09  (+4 s)  no choice │
   │                                                            │
   │   RELEASED lane              │      HELD lane              │
   │   ─────────────              │      ─────────              │
   │   IMG r2-unlocked.jpg        │   IMG r2-detected.jpg       │
   │       ⏵ plate 2.2 s          │       ⏸ PLATE SKIPPED       │
   │                              │   (d1_door just showed it)  │
   │   Door lock · Released       │   Door lock · Held sealed   │
   │   Attacker · Subdued by crew │   Captain · Unaided         │
   │              on entry        │   Souls · 174               │
   │   Medical · ~40 s sooner     │   (no Attacker row — image  │
   │   Confirm · Human · 4.2 s    │    names him, top-right)    │
   │                              │                             │
   │   "The latch releases on     │   "You held. The lock       │
   │    your word."               │    stays sealed."           │
   │                              │                             │
   │   "In Run 1 they went in     │   (no contrast line —       │
   │    blind. Here they were     │    crew never get the       │
   │    briefed."                 │    briefing)                │
   └───────────────────────────┬────────────────────────────────┘
                               │ "Continue →"
                               ▼
        ╔═══════════════════════════════════════════╗
        ║  D2 · THE DIVE          T+2:30   ⏱ 10 s   ║
        ║  "Falling. Uncommanded."                  ║
        ║  IMG  s3-dive.jpg  ← the plane falling,   ║
        ║       exterior. SAME image both paths.    ║
        ║       The decision screen shows the       ║
        ║       PROBLEM, not the solution.          ║
        ╠═══════════════════════════════════════════╣
        ║  ▸ AUTHORIZE       → dive:"guide"   ●teal ║
        ║  ▸ clock expires   → dive:"auto:guide"    ║
        ║  ✕ "Keep searching" REMOVED — wrote a     ║
        ║    value nothing ever read                ║
        ╚═══════════════════╤═══════════════════════╝
                            ▼
   ┌────────────────────────────────────────────────────────────┐
   │  D2 RESULT                       T+3:00          no choice │
   │  "The nose comes up."  ← the payoff for authorizing        │
   │                                                            │
   │   RELEASED lane              │      HELD lane (2 images)   │
   │   IMG r2-stabilized.jpg      │   1. r2-stabilized.jpg      │
   │       exterior, nose-up,     │      "The nose comes up."   │
   │       banked, "AI STAB-      │   2. r2-flying.jpg  ★NEW    │
   │       ILIZATION: ACTIVE"     │      empty flight deck,     │
   │   ⏵ plate 2.2 s              │      "Nobody is in those    │
   │                              │       seats. A ground pilot │
   │                              │       is flying it."        │
   │                              │   ⏵ plate + beat EACH image │
   │                              │                             │
   │   Controls · Off-duty crew   │   Controls · Ground pilot   │
   │   "The off-duty pilots take  │   "A ground pilot flies it  │
   │    the controls; I hold the  │    home over my link; I     │
   │    envelope."                │    hold the envelope."      │
   └───────────────────────────┬────────────────────────────────┘
                               │ "Continue →"
                               ▼
        ╔═══════════════════════════════════════════╗
        ║  D3 · THE GROUND        T+9:00   ⏱ 10 s   ║
        ║  "Nearest suitable airport contacted."    ║
        ║  IMG  r2-airport-alarm.jpg  ← plate       ║
        ║       (ops control room, red alert)       ║
        ╠═══════════════════════════════════════════╣
        ║  ▸ CONFIRM         → airport:"confirm"    ║
        ║  ▸ clock expires   → airport:"auto:conf"  ║
        ║  ✕ "Redirect farther" REMOVED — wrote a   ║
        ║    value nothing ever read                ║
        ╚═══════════════════╤═══════════════════════╝
                            ▼
   ┌────────────────────────────────────────────────────────────┐
   │  D3 RESULT                      T+13:00          no choice │
   │  IMG r2-airport-alarm.jpg  (⏸ plate skipped — d3_airport   │
   │      just showed it; the caption+rows are what change)     │
   │  "Everything is in place before the chocks."               │
   │  Fire · On stand   Medical · On stand                      │
   │  Counsellors · Briefed   Log · Court-ready                 │
   │  NO held variant — correct: ground response does not       │
   │  depend on the cockpit door.                               │
   └───────────────────────────┬────────────────────────────────┘
                               │ "Continue →"
                               ▼
        ╔═══════════════════════════════════════════╗
        ║  D4 · AUTHORITY         T+38:00           ║
        ║  ★ NO CLOCK — waits for a human forever ★ ║
        ║  IMG  r2-airport-ready.jpg   ⏵ plate      ║
        ║  LABEL "Aftermath · on stand"             ║
        ║  (plate FIRES — d3_result switched to the ║
        ║   control room, so this is a new picture) ║
        ╠═══════════════════════════════════════════╣
        ║  ▸ Standing authority → dial:"standing"   ║
        ║  ▸ Live confirms      → dial:"confirms"   ║
        ║  ▸ Fixed doctrine     → dial:"doctrine"   ║
        ╚═══════════════════╤═══════════════════════╝
                            ▼
   ┌────────────────────────────────────────────────────────────┐
   │  D4 RESULT                      T+38:04          no choice │
   │  IMG s4-reunion.jpg (Run 1's art)   ⏵ plate                │
   │      families reunited, safe — the payoff for the dial     │
   │  Authority · Recorded   Trust record · Building            │
   │  Revocable · One tap   Next divergence · Logged            │
   │  Outcome text = DialResult(choices.dial) ← the ONLY place  │
   │  the dial choice is read anywhere                          │
   └───────────────────────────┬────────────────────────────────┘
                               │ "See the outcome →"
                               ▼
                        ┌─────────────┐
                        │   ENDING    │  T+2:00:00 · no image
                        │ auto-adv. 8s│  (Freeze holds it)
                        └──────┬──────┘
                               │ "See the outcome & the risks"
                               ▼
                        ┌─────────────┐
                        │   DOSSIER   │  leaves Run 2
                        └─────────────┘
```

Legend — `⏱` timed card; at zero the AI acts and records `auto:` (excluded from
your decision count) · `⏵` clean plate fires · `⏸` plate skipped because the
previous step already showed that image · `★NEW` integrated this round.

---

## 2 · IMAGE INVENTORY — 8 files, 11 slots

```
r2-detected.jpg        d1_door  ·  held d1_result      co-pilot UPRIGHT at controls,
                                                       captain slumped+bleeding, sealed door;
                                                       baked-in AI overlay "CO-PILOT ·
                                                       UNAUTHORIZED CONTROL / ACTIVE INTRUSION"
                                                       (top-right). ★REGENERATED — old art
                                                       never showed the attacker
r2-unlocked.jpg        d1_result (released)            latch released, green LED
s3-dive.jpg            d2_dive (BOTH paths)            plane diving, exterior
r2-stabilized.jpg      d2_result (BOTH paths)          exterior, nose-up, banked
r2-flying.jpg          d2_result (held) — 2nd image    empty flight deck, level
r2-airport-alarm.jpg   d3_airport  ·  d3_result        ops control room, red alert
r2-airport-ready.jpg   d4_dial                         parked on stand, door open
s4-reunion.jpg         d4_result                       families reunited, safe
   (Run 1's art, reused deliberately)
```

`s3-dive` and `s4-reunion` are shared with Run 1. `r2-detected` and
`r2-airport-alarm` are each used twice, which is why two plates skip.
`r2-alert` (r2-alarmed-door.jpg) is no longer used in Run 2 — it was the
mid-crisis cabin (door open, blood) that used to sit on d4_result.

**r2-detected carries baked-in artwork text** (the AI's own threat-ID overlay,
top-right), so the two screens that use it (d1_door, held d1_result) deliberately
drop their "Attacker" status row — the image already names and locates him there,
and the panel sits in that same corner. Measured: 0 same-pixel glyph collisions,
cosmetic adjacency only; Ashley chose to accept the baked text under the panel
rather than regenerate it textless. The released d1_result keeps its Attacker row
because it uses r2-unlocked (no baked text).

**Held d2_result is the one two-image step.** It shows `r2-stabilized` first
("The nose comes up."), then cuts to `r2-flying` ("Nobody is in those seats. A
ground pilot is flying it — over my link.") — the empty flight deck is what
actually proves `Controls · Ground pilot`. Each picture gets its own clean
plate AND its own look beat; only the second carries the outcome card.
Released d2_result stays a single image. Timing per image: plate 2.2 s + beat
2.4 s, so the held screen runs ~9.5 s versus ~4.6 s released.

Plate rule (`SceneArt.tsx`): a full-brightness 2.2 s plate fires whenever the
image **differs from the previous one**. Deep-linking always shows a plate,
because a cold load resets the repeat tracker.

---

## 3 · WHAT EACH OPTION RECORDS

| Step | Option | Records | Read later? |
|---|---|---|---|
| d1_door | Release ●gold | `door:"release"` | **YES — 5 screens** |
| d1_door | Hold | `door:"hold"` | **YES — 5 screens** |
| d1_door | Show me more | nothing (expands telemetry in place) | — |
| d1_door | *expires* | `door:"auto:release"` | yes, uncounted |
| d2_dive | Authorize ●teal | `dive:"guide"` | **NO — never read** |
| d2_dive | Keep searching | `dive:"search"` | **NO — never read** |
| d2_dive | *expires* | `dive:"auto:guide"` | — |
| d3_airport | Confirm ●teal | `airport:"confirm"` | **NO — never read** |
| d3_airport | *expires* | `airport:"auto:confirm"` | — |
| d4_dial | Standing authority ●gold | `dial:"standing"` | **YES — d4_result text** |
| d4_dial | Live confirms | `dial:"confirms"` | **YES — d4_result text** |
| d4_dial | Fixed doctrine | `dial:"doctrine"` | **YES — d4_result text** |

`humanDecisions()` counts every recorded value **not** prefixed `auto:`, so a
timed-out card earns no credit and the ending says so.

### The `door` branch, screen by screen

| Screen | Released | Held |
|---|---|---|
| d1_result image | r2-unlocked.jpg | r2-detected.jpg |
| d1_result brief | "The latch releases on your word." | "You held. The lock stays sealed." |
| d1_result rows | Door lock · Released / **Attacker · Subdued by crew on entry** / Medical · Reached ~40 s sooner / Confirm · Human · 4.2 s | Door lock · Held sealed / Captain · Unaided / Souls · 174 *(no Attacker row — r2-detected's baked overlay names him)* |
| d1_result contrast line | **"In Run 1 they went in blind. Here they were briefed."** | *(none)* |
| d2_dive image | s3-dive.jpg | s3-dive.jpg (same) |
| d2_dive rows | Envelope · Held by intent-guard / Pilots aboard · None able | Cockpit door · Sealed by your hold / Pilots able · None — ground only |
| d2_dive rec | "…the off-duty crew or a ground pilot flies." | "No one can reach the flight deck… a ground pilot flies it home over my link." |
| d2_result image | r2-stabilized.jpg | r2-stabilized.jpg **then** r2-flying.jpg |
| d2_result rows | Controls · Off-duty crew | Controls · Ground pilot |
| d2_result outcome | "The off-duty pilots take the controls" | "A ground pilot flies it home over my link" |
| d4_dial rows | Captain · Stable in surgery | Captain · In surgery — reached 40 s later |
| d4_dial said | "Captain stable in surgery." | "Captain reached 40 s later — stable in surgery." |
| ending | "saw, guarded, **opened**, guided, informed" | "saw, guarded, guided, informed" |

`Souls · 174 · all lived` is identical on both paths. Both end at the same dossier.

### The attacker thread

Run 1 answers what happens to the attacker — Scene 2's objective is "subdue the
attacker", ending "Taken down. Still falling." Run 2 used to never mention him,
so releasing a cockpit lock read as reckless with nothing establishing he was
contained. Both runs now resolve it — and, critically, **the same way**.

**The agreed canon (Ashley, locked):** the co-pilot is **not** down before the
release, in *either* run. He is inside the flight deck, **at the controls**. The
AI's contribution is that it **reports his location and status to the cabin crew
BEFORE the lock opens**, so they enter briefed rather than blind — and then the
**crew** handle him **after** the release. The AI never touches him; `PLAN.md:121`
holds ("cannot stop the axe from swinging… everything after the swing"). This is
why both runs are genuinely the same event: in each, people get into the flight
deck and subdue him. The only difference is **how the door opened** — a dying
man's arm versus a tracked scene plus a human yes — and that the crew here are no
longer going in blind. That contrast is the whole argument, so it lives in the
`said` line the player actually reads, not only in ambient rows.

**The art now carries this.** `r2-detected` was regenerated to show the
before-state: co-pilot upright at the controls, captain slumped and bleeding,
sealed door, plus a baked-in AI overlay naming him ("CO-PILOT · UNAUTHORIZED
CONTROL / ACTIVE INTRUSION", top-right). The old art showed one pilot at the yoke
and **never showed the attacker at all**, so no amount of row-copy made him
present. That baked overlay sits in the same corner as the status panel, so the
two screens that use this image (`d1_door`, held `d1_result`) **drop their
"Attacker" row** — the image already names and locates him, and a row here would
label him twice in one corner. Collision was measured, not assumed: 0 same-pixel
glyph overlap on both screens.

The released `d1_result` keeps `Attacker · Subdued by crew on entry` because it
uses `r2-unlocked` (latch + green LED, no baked text), so that row is not a
duplicate — it carries the outcome. The held `d1_result` drops it and lets
`Captain · Unaided` carry the cost: a sealed door means crew never get in, so
nobody reaches him — which is exactly what the 40 s medical line already says.
That is why the held path gets no contrast line: it never gets the briefing.

Two canon decisions worth recording:

- **The contrast line is about *briefed vs blind*, not "luck vs tracked."** The
  earlier wording ("In Run 1 this was luck. Here it was tracked.") wrongly
  credited the AI with stopping him — which it can't, and mustn't, or the piece
  implies a machine directing violence. In both runs people physically subdue him.
  The real difference is that here they entered *knowing where he was and what he
  was doing*. So the line is now "In Run 1 they went in blind. Here they were
  briefed."
- **No weapon noun in text, axe dropped-not-held in art.** Canon is the cockpit's
  own crash axe (nine places: `PLAN.md:83,173,341`, `DeepDive.tsx:705,827,833,886`,
  `THINKING.md:129,146,152`); "knife" appears nowhere and would contradict the
  argument page on the central fact of a real event. But the depiction rules keep
  weapons out of *imagery* (`GAME-PROPOSAL.md:8,176,245`, `Visuals.tsx:5,68`), and
  the generated art shows the axe on the floor, not in anyone's hand. Remaining
  text says "at the controls", not "armed with a knife", so nothing pins a weapon
  the art can't show. Every number on these cards either has a source or is
  canonical.

---

## 4 · THE AUTHORITY DIAL — what the three actually mean

The dial is the governance payoff, and the only decision with **no countdown**.
Three timed emergency cards, then one patient human choice — that contrast *is*
the argument (`THINKING.md:106-111`).

It is a spectrum of **how much the machine may act alone**, and who eats the latency:

```
   FIXED DOCTRINE          LIVE CONFIRMS           STANDING AUTHORITY
   ◄────────────────────────────────────────────────────────────────►
   today's rulebook        the current design      the earned future
   machine may not act     machine recommends,     machine acts on scene
   outside the rule        human confirms each     judgment, human can
                           irreversible act        revoke in one tap
   latency: unbounded      latency: 4.2 s median   latency: ~0
   (a rule that cannot     (fast enough to have    (still logs, streams to
    be broken)              saved 174)              ATC, escalates on low
                                                    confidence)
```

**Fixed doctrine** is the status quo, and what the piece argues against.
`THINKING.md:119-126` makes the case: the post-2015 rule "never leave a pilot
alone" was **satisfied** during this event — the attacker was the second person
in the cockpit. Every rule is an autopsy turned into policy, and scenarios are
unbounded. That is the doctrine trap.

**Live confirms** is the shipped design and the safe default. Irreversible acts
require a live human confirm, median 4.2 s. Every confirm builds a trust record.

**Standing authority** is what the trust record earns. Irreversible acts proceed
on scene judgment — but still logged, still streamed to ATC, still countermandable
by any conscious crew member, and **low confidence always escalates**. Revocable
in one tap. Bounded autonomy, not unbounded AI.

Outcome copy each returns:

| Choice | d4_result outcome text |
|---|---|
| Standing authority | "Granted. Irreversible acts proceed on scene judgment — logged, streamed to ATC, countermandable by any conscious crew member. Low confidence still escalates. *Revocable in one tap.*" |
| Live confirms | "Retained. Median confirm: 4.2 s. *Every confirm builds the trust record; it proposes standing authority once it has earned it. You decide — it never does.*" |
| Fixed doctrine | "Authority recorded." |

⚠️ **The third is a shrug.** "Fixed doctrine" gets four words while the other two
get a full governance position. It is the option the whole piece argues *against*,
so it is exactly where a CEO's pick deserves a real answer — ideally the doctrine
trap from `THINKING.md:123-126`. Nothing else in the run changes either way, so
the choice currently reads as flavour rather than a decision. Flagging, not changing.

---

## 5 · REMAINING PROBLEMS

| # | Where | Problem | Fix | Severity |
|---|---|---|---|---|
| 1 | d2_dive clock | Event clock **rewinds** T+1:09 → T+0:30. Visible in your screenshot. | Set `STEP_SECONDS.d2_dive = 95` (T+1:35) so the spine ascends; check d2_result's +150 s still reads well. | **High** |
| 5 | d3_result image | Aircraft shown **parked on stand, door open, airstair attached** at T+13:00 — but it lands at T+38:00. Spoils the ending. | Reuse r2-airport-alarm, or generate a "services rolling, stand clearing, nothing landed yet" shot. | **High** |
| 6 | d4_result image | Post-landing governance screen shows the **mid-crisis cabin**: door open, blood, distressed passengers. Rows and copy are about resolution. | Reuse r2-airport-ready or r2-flying — one-line key swap. | **High** |
| 2 | d2 options | `dive` is written but **never read**. "Keep searching" and "Authorize" give a byte-identical next screen, and both count toward "four decisions". | Make it real (like Hold), or reduce to one action + the clock, as d3 now is. | Medium |
| 4 | d3 copy | Card promises "Trucks, lights, a cleared stand"; image is an interior **control room** with no vehicles in frame. | Rewrite copy to the room — "They have it before you're on approach" already fits. One line. | Medium |
| 7 | d4_dial | "Fixed doctrine" returns only "Authority recorded." while the other two get a full position. | Give it the doctrine-trap line from `THINKING.md`. | Medium |
| 3 | d2_result | Released image shows a **banked climb**; row asserts "Attitude · Stabilized". | Row → "Recovering", or leave it — the brief "The nose comes up" makes it defensible. | Low |

**Fixed this round:** held d1_result showed the glowing UNLOCKED image under a
"lock stays sealed" caption · held d2_dive showed the cockpit door **swung open**,
contradicting "Sealed by your hold" · the decision screen showed a level flight
deck instead of the falling plane · "Redirect farther" was a decorative fork.

**Verified correct, no action:** `174 · all lived` identical on both paths · d3 has
no held variant, correctly · the dial is the only card without a countdown · demo
mode gates `onExpire` so it always records four human choices.

---

## 6 · PACING & TEST HOOKS

| Beat | Duration |
|---|---|
| Clean plate — image alone, no text | 2.2 s + 0.65 s fade |
| Look beat, decision step (has a brief) | 2.4 s |
| Look beat, result step (no brief) | 1.1 s |
| Confirm window, d1 / d2 / d3 | 10 s |
| d4_dial | waits indefinitely |
| Ending auto-advance | 8 s (Freeze holds it) |
| Minimum click-through, no waiting | ~20 s |

Order on every decision screen: **image alone → fade → look beat → decision card**.
Verified in-browser: image at ~0.3 s, card at ~4.8 s.

QA hooks, inert in normal play:
- `?r2=<step>` — jump to any of the ten steps
- `?r2=<step>&hold=1` — pre-seed the held branch
- `?demo=1` — auto-play the whole piece on canonical choices

HUD controls during either run: `❚❚ Freeze` (pauses game time; a banner above every
layer resumes it) · `← Back` (one step; rolls choices back with it) · `⏭ End` (skip to
the **conclusion of that run only** — Run 1 → the final reveal beat, Run 2 → the outcome
screen) · `⌂ Home` (title screen, clears choices). `⏭ End` appears only inside a run, not
during the prologue, where `Skip →` already means "skip the prologue", and it disables
itself once you are already at that run's ending.

`End` deliberately does NOT jump to the dossier. Each run registers its own endpoint via
`nav.ts`, the same pattern `Back` uses — so from Run 1 the AI replay still plays, and from
Run 2 the outcome screen still shows before the risk appendix. A HUD that jumped straight
to the dossier would have swallowed an entire run in one click. It also unfreezes first,
since both endings are pausable screens and landing on one frozen would strand you on a
timer that never runs.

Run 1's reveal is a **four-step sequence**, so "the end of Run 1" is its LAST beat, not its
first: step 3, `s4-reunion.jpg`, "Luck is not a safety system." Skipping to step 0 dumped
the player mid-run with three more images to sit through. `next()` therefore takes an
explicit reveal start step — every transition into the reveal states its own, so it can
never go stale. Normal playthrough is unchanged: all four beats still play from step 0.

### Decision-count outcomes

| You did | Ending says |
|---|---|
| Answered all 4 cards | "four decisions" |
| Answered 3, one expired | "three decisions" |
| Everything expired | "no decisions" — all `auto:` |
