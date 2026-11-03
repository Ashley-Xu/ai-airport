# Who owns the nervous system?
## The ownership boundary, today's data flows, and who actually buys this

*Companion to `CONCEPT.md` and `THINKING.md` §5. Written because "the airport
doesn't own the aircraft" is the sharpest structural objection available to a
knowledgeable interviewer — and because the honest answer turns out to be
stronger than the evasion.*

---

## 1. The short version

**The airport does not need to own the aircraft's nervous system. It needs to own
the room where the two nervous systems meet — and it already does.**

Three claims, in ascending order of how defensible they are:

1. **Aircraft-side sensing is not the airport's to buy.** Cabin and flight-deck
   cameras, cockpit-door surveillance, envelope protection, aircraft health
   telemetry — all of that is airline/OEM territory, certified to the airframe.
   The airport cannot procure it and should not pretend to.
2. **Ground-side actuation is unambiguously the airport's.** The apron is the
   *non-movement area*: outside ATC control, where the airport operator carries
   overall responsibility for vehicle and stand operations. Autonomous tugs,
   medical robots, reconfigurable signage, green-wave vehicle routing — all of it
   sits on the airport's own legal ground, needing no one's permission.
3. **The federation point already exists, is already staffed 24/7, and is called
   the APOC.** The Airport Operations Centre is where the airport operator, ATC,
   airlines, ground handlers, fire, police and security already sit together.
   The nervous system is not a new institution. It is software installed in a room
   the CEO already runs.

So the concept does not overreach past the airport's authority. It overreaches
past the airport's *data* — and that is a governance question, not an ownership
question, which is exactly what the authority dial is for.

---

## 2. How the airport gets information from an aircraft today

This matters because the CEO's complaint ("we find out too late") has a precise
mechanical cause, and naming it is more credible than lamenting it.

**What the airport actually receives** — a list of timestamps, assembled in the
AODB (Airport Operational Data Base):

| Data point | Typical source |
|---|---|
| Flight plan, registration, type, destination | ATC / IFPS flight plan |
| Schedule, slot, EOBT | Airport slot data |
| Stand / gate allocated | Airport's own RMS |
| ELDT / ALDT (estimated / actual landing) | ANSP tower |
| Runway in use | ANSP tower |
| Out / off / on / in times (OOOI) | ACARS messages via SITA/ARINC — **sent to the airline**, forwarded or shared on |
| EIBT / AIBT (on-stand times) | VDGS, A-SMGCS, or the ground handler |
| TOBT / TSAT / TTOT | Airline or ground handler (TOBT); ANSP/ATFM (TSAT, TTOT) |
| Estimated arrival predictions | Network DPI/FUM messages; sometimes commercial ADS-B feeds |

**What the airport does not receive:** anything that constitutes a *scene*.

- **Aircraft health and fault data goes to the airline's operations centre.** ACARS
  streams engine trends, avionics faults and system parameters — but the ground
  endpoints are the ANSP (for clearances) and the airline OCC (for maintenance,
  gate assignment, passenger needs). The airport is not an ACARS recipient.
- **Cockpit-door surveillance stays inside the aircraft.** CDSS is certified and
  flying today on A320-family and other aircraft, but it feeds *cockpit displays* —
  it is sold to airlines and lessors, not to airports.
- **Cabin events have no channel at all.** There is no system today by which "a
  passenger surge is forming at the flight-deck door" reaches the airport.

**The gap, stated precisely:** the airport knows that a door closed. It is never
told what is happening behind it. Every milestone in A-CDM's sixteen-step
milestone set is a *timestamp about a state transition*, not an *understanding of
a scene*. That is why the airport is structurally last to know — not because
anyone is slow, but because the instrument only measures arrivals of states.

---

## 3. Where ATC fits, and why it is not the airport

**In most of the world, air traffic control is a separate authority from the
airport.** An ANSP (Air Navigation Service Provider) runs en-route, approach and
aerodrome control; the airport operator runs terminals, apron and landside. In the
EU these are functionally separated by regulation. The ANSP owns the airspace; the
airport owns the ground. Neither can command the other.

**But the specific event in this concept makes that boundary collapse — in the
airport's favour.** The grounding event is a Dubai–Tel Aviv flight. In Israel, the
**Israel Airports Authority is simultaneously the airport operator and the ANSP**:
a single public corporation, established by the Airports Authority Law 1977,
operating all Israeli airports *and* providing air traffic services for the entire
Tel Aviv FIR. Ben Gurion's tower, approach and area control are IAA. The AFTN/AMHS
message-handling system for the whole country is operated by IAA at Ben Gurion.

Practical consequence for the narrative, and it is a strong one: **in the very
event this concept is built from, there is no airport-versus-ATC ownership problem
to solve.** The organisation that would operate the ground nervous system and the
organisation that receives the aircraft's data link and controls the approach are
the same legal entity. The CEO in the room is, in the Israel case, on both sides
of the fence.

*Caveat to keep honest, because an interviewer may know this:* the IAA's dual role
is unusual internationally, not typical. Most airports cannot assume ATC is a
sibling. So the concept should say "in your case the boundary may or may not exist;
here is what changes either way" rather than generalising the Israeli structure.
Where the ANSP is separate, the nervous system federates with it through the APOC
and the existing DPI/FUM and data-link channels — the same instrument A-CDM
already uses to share data between parties who do not command each other.

**And one boundary that exists everywhere, in every country:** the apron is not
ATC's. Runways and taxiways are the *movement area* under positive tower control;
aprons and stands are the *non-movement area*, where the airport operator (and at
busy airports an apron management service or the ground handler) allocates stands,
authorises vehicle movements and reports apron conditions. That is the airport's
sovereign territory — and it is where nearly all of this concept's physical AI
lives.

---

## 4. So who do we sell it to?

Not one buyer. A layered one, with a clear first customer.

**First customer — the airport operator.** They already buy exactly this category:

- Digital twins: DFW awarded a five-year contract to Willow and Parsons for a
  runway-and-terminal twin (reported ~$2.9M, first twin of an active runway);
  Vienna Airport with Nemetschek/dRofus; Denver with Autodesk Tandem; Milan
  Bergamo (SACBO) with TXT and SORINT.tek. **The airport operator is the signatory
  in every case.**
- APOC / A-CDM platforms, AODB, resource management: airport-owned by definition,
  since the airport operator is responsible for stand and gate allocation and for
  coordinating the A-CDM process.
- Airside vehicles and safety equipment: airports buy rescue vehicles, apron buses
  and safety vehicles.
- Autonomous apron operations: TLD Robotics (ALVEST/EasyMile) counts **Munich and
  Narita airports** among its customers; Schiphol trialled self-driving apron
  buses; Changi has tested autonomous vehicles airside.

The nervous system is sold as **the federation and orchestration layer** — the twin
plus the scene-understanding plus the authority dial — installed in the APOC.
That is an airport-shaped purchase because *governance is airport-shaped*: the
authority dial is a decision about risk appetite, and risk appetite is a CEO's to
set. An airline CTO cannot grant a system authority over a door that protects 174
of someone else's passengers on someone else's stand.

**Second customer — the ground handler.** dnata is also a TLD Robotics customer,
and handlers buy tugs, loaders and catering trucks. Where a handler owns the apron
fleet, the actuation is sold to them and orchestrated by the airport. This is a
channel, not a competitor — and it is the faster sale, because handlers are
labour-constrained and buy autonomy for cost reasons.

**Not the airline — but the airline is the data partner, and the airport has
leverage.** Cabin and flight-deck sensing is sold to airlines and lessors (CDSS
kits go to carriers and to GECAS/ILFC-type lessors for their airframes). You will
never sell the airport's nervous system to an airline. What you do is extend the
instrument the airport already uses to get airline data:

> **The airport owns the scarce resources.** Stands, slots, apron access, ground
> handling contracts, turnaround targets. A-CDM already proves the mechanism:
> airlines supply TOBT and share ACARS-derived times because the network requires
> it and because faster turnaround benefits them. The same data-sharing agreement,
> widened by one clause — event-triggered scene summaries in addition to
> timestamps — is how the aircraft's nervous system reaches the ground's.

That clause is the whole commercial insight. It costs the airline almost nothing
to grant, and it is worth a great deal to them: a scene summary at T+0:08 gets
their aircraft back in service sooner than any alternative, and it protects their
crew.

**The ANSP — a federation partner, not a buyer.** Where ATC is separate, they
supply ELDT/ALDT, runway in use, TSAT/TTOT and the data-link picture, and they
receive the streamed situational summary and the intent-guard's state. In the
Israel case they *are* the buyer.

**One honest note on what is genuinely new.** Almost every sensor in this concept
already exists and is already certified: CDSS, envelope protection, A-SMGCS,
VDGS, ACARS, ADS-B, airport CCTV and LiDAR. The new parts are three — inward-facing
flight-deck *scene understanding*, machine authority over the door lock, and
intent-guarding an autopilot against a malicious but conscious input — plus the
thing nobody sells today: the **connective tissue and the authority dial**. That is
the product. Selling orchestration rather than hardware is also what keeps this
out of the airworthiness-certification death spiral, because the orchestration
layer recommends and a human confirms; it never becomes the flight-control system
of record.

---

## 5. How to narrate the aircraft as part of the airport

The temptation is to hand-wave the boundary ("the nervous system spans both").
Don't. Name it, own it, and invert it — in four moves.

**Move 1 — concede first, precisely.** *"You're going to ask whose aircraft this
is. It isn't yours. Cabin sensing is an airline and OEM capability, certified to
the airframe. I'm not proposing you buy it, and anyone who tells you an airport
can procure flight-deck cameras is selling you a lawsuit."*
Conceding accurately is what buys the next three moves.

**Move 2 — then show the boundary is the disease, not an obstacle.** *"But notice
where that leaves you. Your picture of an inbound aircraft is a list of
timestamps. ACARS health data goes to the airline's operations centre, not to
yours. Your AODB knows a door closed; nothing tells you what's happening behind
it. That is not a complaint about your systems — it's the structural reason
'we find out too late' survives every dashboard you've bought. The fence is the
latency."*

**Move 3 — claim what is genuinely yours, with the legal ground.** *"Now here's
what you do own. The apron is the non-movement area — outside ATC control, with
overall responsibility for vehicles and stands resting with you as the airport
operator. Every hand in this concept that acts on the ground — autonomous tugs
clearing the stand, the medical robot at the door, signage reconfiguring,
green-wave access for fire — acts on your sovereign ground, with your authority,
needing nobody's permission. And you already own the room: the APOC, where your
team, ATC, the airlines, your handlers, fire and police already sit together
around one picture. The federation point isn't something I'm inventing. It's
staffed and on duty right now."*

**Move 4 — turn the concession into the governance argument.** *"So the aircraft's
nervous system doesn't become the airport's property. It becomes a party to a
federation the airport governs — and governing it is the actual product. That's
why the last thing I'll show you isn't a dashboard. It's a dial, and it's your
hand on it: how much judgment do we give a system that can see? An airline CTO
can't answer that for 174 people on your stand. Only you can, which is why this
is an airport decision even when the sensor belongs to somebody else."*

**One sentence, if you only get one:**

> *"The airport doesn't own the aircraft — it owns the moment the aircraft becomes
> the airport's problem, and today nothing is watching at that moment."*

**If the interviewer is Israeli / Ben Gurion specifically, add:** *"And in your
case the fence is thinner than most — the Airports Authority is both the airport
operator and the air navigation service provider, so the tower, the approach and
the apron answer to one organisation. The data-link picture and the ground
nervous system are already under one roof. What's missing isn't authority. It's
the layer that turns both into understanding."*

---

## 6. Questions this now answers, and two it should not overclaim

**Answered:**
- *"The airport doesn't own the aircraft."* → §5, four moves. Correct, and
  irrelevant to the ground half, and a governance question on the air half.
- *"Who signs the cheque?"* → §4. Airport operator first, ground handler as
  channel, airline as data partner under leverage the airport already holds.
- *"Is this an APOC upgrade?"* → It installs *in* the APOC and adds two things an
  APOC does not have: scene understanding rather than milestone timestamps, and
  actuation rather than coordination by phone. A-CDM shares data between partners
  and still assumes humans act; this closes the loop.
- *"Why would an airline share cabin data?"* → Because the same agreement already
  exists for TOBT and OOOI times, because a faster summary returns their aircraft
  to service sooner, and because it protects their crew.

**Do not overclaim these:**
- *That the IAA's dual role generalises.* It is unusual. Present it as "in your
  case," never as "at airports."
- *That an airport can mandate aircraft-side equipment.* It cannot. The realistic
  instrument is a data-sharing clause plus, eventually, OEM line-fit — both slow,
  both real. The 90-day reflex (§7 of CONCEPT.md) deliberately needs neither,
  which is why it is the right first sale.

---

## Sources

Air navigation and the Israel structure: Israeli Inter-Ministerial Tender
Committee for PPP — Ben Gurion project documents (primary government source:
"All civil airports in Israel..., as well as the Air Navigation Services Provider
('ANSP'), in both control towers and the air control in the Israeli Flight
Information Region ('FIR'), are developed and operated by the Israel Airport
Authority"); EUROCONTROL LSSIP 2025 — Israel; Civil Aviation Authority of Israel
Handbook; Israel AIP GEN 3.3 / GEN 3.4 and AD-2.LLBG (current AIRAC).
A-CDM roles and AODB data sources: IATA A-CDM Recommendations and A-CDM Toolkit;
EUROCONTROL "What is A-CDM"; Abu Dhabi Airports A-CDM Manual.
Apron authority and non-movement areas: FAA AC 150/5210-20 *Ground Vehicle
Operations on Airports*; FAA SMGCS planning guidance.
APOC composition and staffing: ACI Europe *Airport Operations Centres: A
Guidebook*; EUROCONTROL PRC APOC Factsheets (2026) and APOC Performance Study;
Brussels Airport APOC.
ACARS recipients and message flows: ACARS (Wikipedia, system description);
ITU-T Focus Group on Aviation Applications of Cloud Computing.
Cockpit-door surveillance procurement: Securaplane/Airbus; AD Aerospace FlightVu;
Global Airworks CDSS orders (GECAS, ILFC).
Autonomous apron vehicles: TLD Robotics launch and customer list (ALVEST/EasyMile);
Royal Schiphol Group apron trials; airport apron-automation market reporting.
Airport digital twins: DFW/Willow/Parsons; Nemetschek–Vienna Airport; Autodesk
Tandem–Denver; SACBO/TXT AVIO–Milan Bergamo.

*Retrieved 2026-11-03. Where a figure comes from a vendor or consultancy page
rather than a primary document it is marked as reported. Regulatory specifics
should be re-checked against current AIP and ANSP material before use in a live
procurement conversation.*
