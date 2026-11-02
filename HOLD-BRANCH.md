# HOLD-BRANCH — making "Hold" a real choice in Run 2

Status: **PLAN, not implemented.** Waiting for explicit go.
Decisions already made by Ashley: real cost branch (ground pilot instead of off-duty
crew); held-door screen reuses `r2-detected`, no new image generation.

## The defect, precisely

`Run2.tsx:145` computes `held = choices.door === "hold"`, and it changes exactly TWO
strings — the d1_result brief and status readout. Then it is never read again.
Verified by grep: `d2_dive`, `d2_result`, `d3_*`, `d4_*`, `ending`, and Dossier
contain **zero** references to the door choice.

So after clicking Hold:
- the photo is still hardcoded `photo="r2-unlocked"` — the image with
  "DOOR LATCH: UNLOCKED" glowing green, under a caption saying the lock stays sealed
- d2_result still says `Controls: Off-duty crew` and "The off-duty pilots take the
  controls" — but those pilots are in the **cabin**, and in Run 1 the captain is locked
  OUT ("The door locks from the inside"). Through a sealed door they cannot reach the
  yoke. This is the causal break, not just a wording one.
- the ending still credits the machine with "saw, guarded, **opened**, guided, informed"

Why it matters for the pitch: a CEO evaluating a human-in-the-loop system will click
Hold specifically to test whether the human's "no" is real. Finding it decorative costs
more credibility than any risk slide would.

## Approach

Keep ONE canonical spine — no new steps, no new art, no new scenes. Hold changes WHO
FLIES THE PLANE and what medical timing was lost. Both branches end with the same
174 souls, so the locked sensitivity rules hold (canonical path succeeds; no fail
screen; no casualties).

Ground-pilot guidance is already inside the approved softened claim
("stabilizes attitude, guards envelope, guides ground pilot / off-duty crew;
auto-land only where certified"), so this invents no new capability.

## Every string that changes

### 1. `d1_result` — fix the image (1 line)

| | value |
|---|---|
| current | `photo="r2-unlocked"` (both branches) |
| proposed | `photo={held ? "r2-detected" : "r2-unlocked"}` |

`r2-detected` = "captain down at a sealed door". Accurate for held, already wired.
Note: because d1_door also uses `r2-detected`, the plate will correctly SKIP on this
transition (unchanged image → no full-screen replay). That is intended behaviour of the
existing repeat-detection, not a bug.

Brief and status here are **already correct** and stay untouched:
- held brief: "You held. The lock stays sealed."
- held status: `Door lock · Held sealed` / `Captain · Unaided` / `Souls · 174`
- released status keeps `Medical · Reached ~40 s sooner` — this is the line the held
  branch loses, per your "same ending minus the medical-sooner line".

### 2. `d2_dive` — the AI states who can actually fly it

status, held variant (released keeps today's four rows):
```
Cockpit door · Sealed by your hold
Pilots able · None — ground only
```

`rec` — current (both branches):
> No one aboard can land this. I **stabilize and guide** — the off-duty crew or a
> ground pilot flies. Auto-land only where certified.

held variant:
> No one can reach the flight deck. I **stabilize and guard the envelope** — a ground
> pilot flies it home over my link. Auto-land only where certified.

### 3. `d2_result` — the causal break (2 strings)

status: `Controls` row
- released: `Off-duty crew` (unchanged)
- held: `Ground pilot`

`goodText` — current:
> Dive arrested. The off-duty pilots take the controls; I hold the envelope.

held variant:
> Dive arrested. A ground pilot flies it home over my link; I hold the envelope.

### 4. `d4_dial` — the medical cost surfaces

status, `Captain` row:
- released: `Stable in surgery` (unchanged)
- held: `In surgery — reached 40 s later`

`said` — current:
> Resolved. **174 souls**. Captain stable in surgery. Audit trail attached.

held variant:
> Resolved. **174 souls**. Captain reached 40 s later — stable in surgery. Audit trail
> attached.

`Souls · 174 · all lived` stays identical in both branches. Same survivors either way.

### 5. `Run2Ending` — stop crediting "opened"

current:
> The machine did the rest: saw, guarded, opened, guided, informed.

held variant:
> The machine did the rest: saw, guarded, guided, informed.

Title stays: "Same 174. No luck needed. No rule that happened to fit." True on both paths.

`humanDecisions` needs **no change** — it filters only `auto:` prefixes, so Hold already
counts as a human decision in "You made N decisions". Correct as-is.

### Not touched

- `Dossier.tsx` — takes no `choices` prop; its closing claim ("saw, judged, acted") is
  path-neutral. Verified.
- `d3_airport` / `d3_result` — ground response is identical either way.
- Demo mode — auto-picks `release`, so the 5-minute walkthrough always shows canonical.
- Back navigation — `back()` restores `prev.choices`, so stepping back from a held state
  correctly un-holds. Will verify, not change.

## Decisions — LOCKED (Ashley, via clarify)

- **Cost scale:** `~40 s later`. He still reaches the lock himself; the held branch
  mirrors the canonical `PLAN.md` / `DeepDive` claim exactly. `Captain · Stable in
  surgery` stays TRUE on both paths.
- **Colour:** no colour-coding for the held outcome. All colour stays consistent —
  remove the coral branch from `Consequence` entirely.
- **Ending:** text stays identical apart from dropping "opened" when held. No added line.
- **QA hook:** yes — `?r2=<step>&hold=1` pre-seeds `door:"hold"`.

## Coral removal — it is a deletion, not a visual change

Verified: `Consequence`'s coral branch is **dead code**. Both call sites
(`Run2.tsx:214` and `273`) pass `good` truthy, and `badText` is never passed anywhere.
So coral never renders in Run 2 today; removing it cannot change what anyone sees.

Changes to `Consequence`:
- drop the `good` and `badText` props → the component renders one fixed cyan style
- `borderColor` → the game palette's `var(--g-lav)` (see the separate finding below)
- `dot` / `nm` colour → `var(--g-cyan)` unconditionally
- label stays `"Outcome"`; the `"Alternate outcome"` string goes
- `g-consequence` renders `children` instead of `good ? goodText : badText`

**Scope limit:** this removes coral from Run 2's outcome card only. Coral elsewhere is
still load-bearing and stays — Run 1's `Remaining strength` meter, the "Run 1 · The
humans" kicker, the `150 dead.` beat in the cold open, and the dive trace in
`Visuals.tsx`. Say the word if you want a wider coral purge.

## Separate finding — stale palette vars (unrelated to Hold)

`Consequence` at `Run2.tsx:472` styles its border with `--ai-line` / `--today-line`.
Those belong to the **deep-dive** palette in `src/index.css`, not the game's `--g-*`
system from the Slidesgo reskin. Every other game component was migrated to `--g-*`;
this one was missed. It currently resolves to a cyan-ish line, so nothing looks broken —
but it means the game view is reaching into the argument page's variables.
Proposal: fix it in the same pass as part of the coral removal (it is one line, and the
coral branch already touches it). Flagging rather than bundling silently.

## Verification plan (before I call it done)

1. `npx tsc -p tsconfig.json` + `npm run build` clean.
2. CDP run: click **Hold** → assert d1_result photo is `r2-detected` (not
   `r2-unlocked`), and that no element's text contains "off-duty" or "opened" anywhere
   downstream.
3. Full held playthrough → dossier, asserting per step: `Controls · Ground pilot`,
   `Captain · In surgery — reached 40 s later`, ending line has no "opened", and the
   decision count still includes the Hold.
4. Full released playthrough → dossier, asserting every string above is UNCHANGED from
   today (regression: the canonical path must not drift).
5. `?demo=1` end-to-end → still all four human choices, no `auto:` prefixes.
6. Back from a held d2_result → returns to d1_door with the door choice cleared.

## Scale

~18 changed lines across `Run2.tsx` only (+6 if C is approved). No new files, no new
assets, no CSS changes.
