import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

/* ================= timeline data ================= */

type Ev = {
  tag: string;
  title: string;
  body: string;
} | null;

type Row = {
  clock: string;
  today: Ev;
  ai: Ev;
  ghostToday?: string;
  ghostAi?: string;
};

const ROWS: Row[] = [
  {
    clock: "12:37",
    today: {
      tag: "Invisible",
      title: "A storm cell forms 300 km west",
      body: "It exists only in METAR feeds nobody is watching. Two flights are still 90 minutes from your airspace.",
    },
    ai: {
      tag: "Sense",
      title: "Weather agent flags the cell",
      body: "The digital twin ingests METAR + ADS-B, sees two inbound aircraft whose alternates are closing, and opens a scenario thread. No human involved.",
    },
  },
  {
    clock: "12:52",
    today: null,
    ghostToday: "— nothing to see yet —",
    ai: {
      tag: "Simulate",
      title: "10,000 futures rehearsed",
      body: "The twin replays the day under diversion: stand occupancy, bag flows, transfer walks, security load. 214 transferring passengers appear as a problem 90 minutes before they exist.",
    },
  },
  {
    clock: "13:20",
    today: null,
    ghostToday: "— still quiet —",
    ai: {
      tag: "Act",
      title: "The airport moves its hands",
      body: "Stands re-sequenced autonomously. Self-driving baggage tractors rerouted from Belt 3. Two cleaning robots pre-positioned at the arrival pier. 400 dynamic signs load new guidance. Gate agents get one-line briefs on their tablets.",
    },
  },
  {
    clock: "14:07",
    today: {
      tag: "Land",
      title: "Both aircraft land",
      body: "214 passengers step into an airport that does not know they are coming.",
    },
    ai: {
      tag: "Land",
      title: "Both aircraft land",
      body: "214 passengers step into an airport that rehearsed this arrival 10,000 times. Stands fit. Bags move. Signs point the right way.",
    },
  },
  {
    clock: "14:23",
    today: {
      tag: "Discovered",
      title: "A supervisor notices the queue",
      body: "Transit desk backs up. A radio call goes out: 'Where did these people come from?' The 40-minute clock starts now.",
    },
    ai: {
      tag: "Monitor",
      title: "Queue sensors confirm: nominal",
      body: "Wait times at transfer security peak at 11 minutes, then fall. The system logs the variance against its 13:20 prediction — it was right, and it knows it.",
    },
  },
  {
    clock: "15:10",
    today: {
      tag: "Escalate",
      title: "17 phone calls, 3 group chats",
      body: "Ground handler, cleaning, security, retail, ops duty manager — each learns a fragment. Belt 3 jams at 15:34 because nobody rerouted the bags.",
    },
    ai: {
      tag: "Inform",
      title: "One card reaches the CEO",
      body: "'Diversion event 14:07 — resolved autonomously. 214 pax transferred, 0 missed connections, €4,100 in costs avoided. One decision needs you.'",
    },
  },
  {
    clock: "15:58",
    today: {
      tag: "Red",
      title: "The KPI wall turns red",
      body: "On-time performance, baggage SLA, and passenger satisfaction all breach thresholds — 2 hours after the cause landed.",
    },
    ai: {
      tag: "Learn",
      title: "The twin updates itself",
      body: "Predictions vs outcomes are diffed. Next storm, the airport is 6% faster. The system compounds.",
    },
  },
  {
    clock: "16:21",
    today: {
      tag: "Too late",
      title: "The CEO finds out",
      body: "A duty manager walks in with a printed summary. The decision that was needed at 14:10 now arrives with a crowd of angry passengers behind it.",
    },
    ai: {
      tag: "Decide",
      title: "The CEO decides — one thing",
      body: "Approve lounge access for the 38 passengers still waiting? €2,900. This is the only part of the day that needed a human judgment about care and money.",
    },
  },
];

/* ================= small components ================= */

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function EventCard({ ev, side, lit }: { ev: Ev; side: "today" | "ai"; lit: boolean }) {
  if (!ev) return <div />;
  return (
    <div className={`ev ${side} ${lit ? "" : ""}`}>
      <span className="tag">{ev.tag}</span>
      <h4>{ev.title}</h4>
      <p>{ev.body}</p>
    </div>
  );
}

/* ================= split timeline ================= */

function SplitTimeline() {
  const [lit, setLit] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-100px" });

  // auto-light rows as user scrolls through
  useEffect(() => {
    if (!inView) return;
    const rows = ref.current?.querySelectorAll<HTMLElement>(".tl-row");
    if (!rows) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            setLit((cur) => Math.max(cur, idx + 1));
          }
        });
      },
      { threshold: 0.55 }
    );
    rows.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, [inView]);

  const play = () => {
    if (playing) return;
    setPlaying(true);
    setLit(0);
    let i = 0;
    timer.current = setInterval(() => {
      i += 1;
      setLit(i);
      if (i >= ROWS.length) {
        if (timer.current) clearInterval(timer.current);
        setPlaying(false);
      }
    }, 1600);
    // scroll the first row into view
    ref.current?.querySelector(".tl-row")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div ref={ref}>
      <div className="tl-col-heads">
        <div className="h today">Today · reactive</div>
        <div className="mid" />
        <div className="h ai">AI-native · anticipatory</div>
      </div>
      <div className="timeline">
        {ROWS.map((row, i) => (
          <div key={row.clock} className={`tl-row ${i < lit ? "lit" : ""}`} data-idx={i}>
            <div className="cell">
              {row.today ? (
                <EventCard ev={row.today} side="today" lit={i < lit} />
              ) : (
                <div className="ev ghost today">
                  <span>{row.ghostToday}</span>
                </div>
              )}
            </div>
            <div className="clock">
              <div className="t">{row.clock}</div>
            </div>
            <div className="cell">
              {row.ai ? (
                <EventCard ev={row.ai} side="ai" lit={i < lit} />
              ) : (
                <div className="ev ghost ai">
                  <span>{row.ghostAi}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="demo-controls">
        <button className="btn" onClick={play} disabled={playing}>
          {playing ? "▶ Running the day…" : "▶ Run Tuesday, both airports"}
        </button>
        <button className="btn" onClick={() => setLit(ROWS.length)}>
          Jump to end
        </button>
        <button className="btn" onClick={() => setLit(0)}>
          Reset
        </button>
      </div>
    </div>
  );
}

/* ================= CEO inbox ================= */

function Inbox() {
  const [open, setOpen] = useState(false);
  const [decision, setDecision] = useState<null | "approve" | "decline" | "delegate">(null);

  return (
    <div className="inbox-stage">
      <div>
        <div className="phone-frame">
          <div className="phone-notch" />
          <motion.div
            className="notif"
            onClick={() => setOpen(true)}
            whileHover={{ scale: 1.015 }}
            animate={open ? { opacity: 0.35 } : { opacity: 1 }}
          >
            <div className="app">
              <div className="ic">✈</div>
              <div className="nm">AIRPORT · NERVE CENTER</div>
              <div className="tm">15:10</div>
            </div>
            <h4>Diversion event 14:07 — resolved autonomously</h4>
            <p>
              214 pax transferred · 0 missed connections · €4,100 avoided.
              One decision needs your approval.
            </p>
            <div className="cta">{open ? "OPENED" : "TAP TO OPEN →"}</div>
          </motion.div>
          <div className="phone-hint">THIS IS THE CEO'S NEW INBOX · ~3 CARDS A DAY</div>
        </div>
      </div>

      <div className="inbox-detail">
        {!open ? (
          <div className="detail-card" style={{ opacity: 0.4 }}>
            <p className="dim mono" style={{ fontSize: 13, letterSpacing: "0.08em" }}>
              ← TAP THE NOTIFICATION TO SEE WHAT THE CEO ACTUALLY SEES
            </p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="detail-card">
              <div className="dh">
                <span className="pill resolved">Resolved autonomously</span>
                <span className="pill clock">14:07 · Tue</span>
              </div>
              <h3>Diversion event · handled before it happened</h3>
              <p className="sub">
                Detected at 12:37 from weather + flight data. Executed 13:20–14:07 without human
                coordination. Full audit trail available.
              </p>
              <ul className="action-list">
                <li><span className="st">13:20 ✓</span> Stands B7/B9 re-sequenced — both aircraft fit without delay propagation</li>
                <li><span className="st">13:24 ✓</span> 3 autonomous baggage tractors rerouted to Belt 3 — jam predicted and avoided</li>
                <li><span className="st">13:31 ✓</span> 2 cleaning robots pre-positioned at arrival pier E</li>
                <li><span className="st">13:45 ✓</span> 400 dynamic signs + gate-agent tablets loaded with transfer guidance</li>
                <li><span className="st">14:07 ✓</span> Landings absorbed. Peak transfer wait: 11 min (threshold: 20)</li>
                <li><span className="st">15:05 ✓</span> Outcome vs prediction logged; twin accuracy +0.4%</li>
              </ul>

              <div className="decision-box">
                <span className="pill action">Needs you</span>
                <div className="dq" style={{ marginTop: 12 }}>
                  Open the lounge to 38 passengers still awaiting rebooking?
                </div>
                <div className="dc">
                  Cost €2,900. The system can rebook them (done) but spending care money is a
                  judgment about your brand — it escalates that class of decision, always.
                </div>
                <div className="btns">
                  <button className="btn primary" onClick={() => setDecision("approve")}>Approve · €2,900</button>
                  <button className="btn" onClick={() => setDecision("decline")}>Decline</button>
                  <button className="btn" onClick={() => setDecision("delegate")}>Delegate to Duty Manager</button>
                </div>
                {decision && (
                  <motion.div className="decision-out" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {decision === "approve" && (
                      <>✓ APPROVED 15:12 · Lounge notified · 38 pax messaged with access codes<br />→ Your policy is learned: "care spend under €5k during irregular ops — auto-approve next time?"</>
                    )}
                    {decision === "decline" && (
                      <>✓ DECLINED 15:12 · Standard waiting area guidance pushed to the 38 pax<br />→ Logged as a policy signal for future escalations</>
                    )}
                    {decision === "delegate" && (
                      <>✓ DELEGATED 15:12 · Duty Manager decides within SLA · You stay informed<br />→ Delegation pattern noted for similar events</>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
            <p className="inbox-caption">
              <b>This is the whole product idea.</b> Not more dashboards — a decision inbox. The
              airport handles the routine and reports; humans keep the judgment calls. Notice what
              the card is really asking: not <i>"what happened?"</i> but <i>"what should we be
              willing to spend on care?"</i> That is a CEO-shaped question.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ================= app ================= */

export default function App() {
  return (
    <>
      <div className="topnav">
        <div className="inner">
          <div className="brand">14:07 <b>·</b> THE DIVERSION</div>
          <nav>
            <a href="#problem">Problem</a>
            <a href="#moment">The Moment</a>
            <a href="#story">Two Airports</a>
            <a href="#anatomy">Physical AI</a>
            <a href="#inbox">CEO Inbox</a>
            <a href="#thinking">Thinking</a>
          </nav>
        </div>
      </div>

      {/* HERO */}
      <header className="hero">
        <div className="hero-grid-bg" />
        <div className="hero-glow" />
        <div className="wrap">
          <motion.div className="hero-kicker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}>
            A CONCEPT FOR THE AI-NATIVE AIRPORT
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            By the time you hear about it,<br />
            it's <span className="accent">already handled.</span>
          </motion.h1>
          <motion.p className="hero-sub" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.9 }}>
            One Tuesday. One diverted storm. Two airports living the same four hours —
            one discovers the problem at 14:23, the other prevented it at 13:20.
            Scroll to live the difference.
          </motion.p>
          <motion.div className="hero-meta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }}>
            <div className="m">AUDIENCE<b>The CEO, personally</b></div>
            <div className="m">MOMENT<b>Tue 14:07 · weather diversion</b></div>
            <div className="m">IDEA<b>From dashboards to a decision inbox</b></div>
            <div className="m">MECHANISM<b>Physical AI: sense → simulate → act</b></div>
          </motion.div>
        </div>
        <div className="scroll-cue"><div className="bar" />SCROLL</div>
      </header>

      {/* PROBLEM */}
      <section className="section" id="problem">
        <div className="wrap">
          <Reveal>
            <div className="section-kicker">01 · The complaint, decoded</div>
            <h2>"Screens and data everywhere — and we still find out too late."</h2>
            <div className="quote">
              The dashboard is not the airport. It is a report about the airport,
              written 40 minutes ago.
              <div className="who">— THE CORE INSIGHT OF THIS CONCEPT</div>
            </div>
          </Reveal>
          <div className="problem-grid">
            <Reveal delay={0.05}>
              <div className="problem-card">
                <div className="n">SYMPTOM 01</div>
                <h3>Data reports the past</h3>
                <p>Every KPI on the wall is a lagging indicator. By the time it turns red,
                the queue has already formed, the bag has already jammed, the passenger has
                already tweeted.</p>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="problem-card">
                <div className="n">SYMPTOM 02</div>
                <h3>Systems don't talk; people do</h3>
                <p>The real integration layer of an airport is the phone. One event means
                17 calls, 3 group chats, and everyone operating on a different fragment of
                the truth.</p>
              </div>
            </Reveal>
            <Reveal delay={0.25}>
              <div className="problem-card">
                <div className="n">SYMPTOM 03</div>
                <h3>Problems are physical</h3>
                <p>Queues, spills, stand conflicts, bag jams — they live in the physical
                world. Software that can only <em>warn</em> still needs a human with a radio
                to <em>fix</em>. That human is the latency.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* THE MOMENT */}
      <section className="section scenario" id="moment">
        <div className="wrap">
          <Reveal>
            <div className="section-kicker">02 · One moment, not a product</div>
            <h2>Tuesday, 14:07. A thunderstorm sends two flights your way.</h2>
            <p className="lede">
              We don't need to imagine a whole AI airport. We need one ordinary crisis —
              the kind that happens every week — and ask: how would the two airports live
              through it? Everything downstream follows from the answer.
            </p>
          </Reveal>
          <div className="scenario-stats">
            <Reveal delay={0.05}><div className="s"><div className="v">2</div><div className="k">Diverted aircraft</div></div></Reveal>
            <Reveal delay={0.12}><div className="s"><div className="v">214</div><div className="k">Transfer passengers</div></div></Reveal>
            <Reveal delay={0.19}><div className="s"><div className="v">1</div><div className="k">Stand conflict</div></div></Reveal>
            <Reveal delay={0.26}><div className="s"><div className="v">38</div><div className="k">Needing rebooking</div></div></Reveal>
          </div>
        </div>
      </section>

      {/* SPLIT TIMELINE */}
      <section className="section" id="story">
        <div className="wrap">
          <Reveal>
            <div className="split-head">
              <div>
                <div className="section-kicker">03 · The same four hours, twice</div>
                <h2>Follow one event through two airports</h2>
              </div>
              <div className="legend">
                <span><i className="dot today" /> TODAY</span>
                <span><i className="dot ai" /> AI-NATIVE</span>
              </div>
            </div>
            <p className="lede">
              Same clock. Same weather. Same passengers. The only difference is when the
              airport first <em>understood</em> — and whether it had hands to act on that
              understanding before anyone needed to be told.
            </p>
          </Reveal>
          <SplitTimeline />
        </div>
      </section>

      {/* PHYSICAL AI ANATOMY */}
      <section className="section" id="anatomy">
        <div className="wrap">
          <Reveal>
            <div className="section-kicker">04 · Why this needs physical AI</div>
            <h2>Software alone can only warn. A nervous system can act.</h2>
            <p className="lede">
              The left column of the timeline isn't a failure of software — it's the
              ceiling of software without senses and hands. Physical AI supplies both.
            </p>
          </Reveal>
          <div className="anatomy">
            <Reveal delay={0.05}>
              <div className="anat-card">
                <span className="glyph">👁</span>
                <div className="role">Eyes · Sensing</div>
                <h3>The airport sees itself</h3>
                <p>Cameras, LiDAR, IoT and existing operational feeds fused into one live
                world-model — not 30 siloed dashboards.</p>
                <ul>
                  <li>Queue lengths measured, not estimated</li>
                  <li>Spills and hazards detected in seconds</li>
                  <li>Every bag, cart and stand a tracked object</li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="anat-card">
                <span className="glyph">🧠</span>
                <div className="role">Brain · Twin + Agents</div>
                <h3>The airport rehearses the future</h3>
                <p>A digital twin that simulates thousands of outcomes, and agents that
                turn the best one into a plan — before the event exists.</p>
                <ul>
                  <li>Storm detected at 12:37, rehearsed by 12:52</li>
                  <li>Plans evaluated against cost, SLA, passenger care</li>
                  <li>Predictions diffed against outcomes; accuracy compounds</li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.25}>
              <div className="anat-card">
                <span className="glyph">🦾</span>
                <div className="role">Hands · Actuation</div>
                <h3>The airport moves things</h3>
                <p>Robots, automated infrastructure and reconfigurable signage: the plan
                executes in the physical world without 17 phone calls.</p>
                <ul>
                  <li>Autonomous baggage tractors reroute themselves</li>
                  <li>Cleaning & patrol robots pre-position</li>
                  <li>400 signs become one coordinated guidance system</li>
                </ul>
              </div>
            </Reveal>
          </div>
          <Reveal>
            <div className="loop-line">
              <b>sense → simulate → act → inform</b> — the human leaves the middle of the loop
              (phone calls) and moves to the top of it (judgment).
            </div>
          </Reveal>
        </div>
      </section>

      {/* CEO INBOX */}
      <section className="section inbox" id="inbox">
        <div className="wrap">
          <Reveal>
            <div className="section-kicker">05 · The CEO's new interface</div>
            <h2>From a wall of dashboards to an inbox of decisions.</h2>
            <p className="lede">
              In the AI-native airport, the CEO is not the person who finds out last —
              and not the person who coordinates either. Roughly three times a day, the
              airport surfaces the only things that deserve a human: money, care, and risk.
            </p>
          </Reveal>
          <Inbox />
        </div>
      </section>

      {/* THINKING */}
      <section className="section" id="thinking">
        <div className="wrap">
          <Reveal>
            <div className="section-kicker">06 · How I thought through it</div>
            <h2>The thinking behind the story</h2>
            <p className="lede">
              A concept for a CEO should show its reasoning, not just its render.
              Here are the choices, assumptions and trade-offs behind this piece.
            </p>
          </Reveal>
          <div className="think-grid">
            <Reveal delay={0.05}>
              <div className="think-card">
                <h3><span className="idx">A</span> Why a diversion storm, not a full product tour</h3>
                <ul>
                  <li><b>One moment beats a platform.</b> CEOs trust stories they've lived; irregular ops is the one day every airport exec remembers.</li>
                  <li><b>It's the hardest case.</b> If the AI-native airport handles a sudden diversion, everything quieter follows.</li>
                  <li><b>Trade-off rejected:</b> a "day in the life" montage — broader, but it dilutes the single idea of latency.</li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="think-card">
                <h3><span className="idx">B</span> Why split-screen, not a video</h3>
                <ul>
                  <li><b>The idea is simultaneity:</b> same clock, different airport. Only a side-by-side can show that the difference is <em>when</em>, not <em>what</em>.</li>
                  <li><b>Interactive beats passive</b> for a 5-minute walkthrough — the CEO's hand on the "approve" button is the whole argument.</li>
                  <li><b>Trade-off:</b> less cinematic than film; compensated with restrained motion and typography.</li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.19}>
              <div className="think-card">
                <h3><span className="idx">C</span> Assumptions I'm making explicit</h3>
                <ul>
                  <li>Sensor coverage (CCTV, bag tracking, stand data) already largely exists — the gap is <b>fusion + actuation</b>, not cameras.</li>
                  <li>Autonomy is bounded: the system acts on <b>pre-agreed playbooks</b> and escalates spend/care/risk. No CEO should be asked to trust unbounded AI.</li>
                  <li>Numbers (€4,100, 11 min, 38 pax) are illustrative, sized to be plausible for a mid-large hub.</li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.26}>
              <div className="think-card">
                <h3><span className="idx">D</span> Why "physical AI" is the hero, not "AI"</h3>
                <ul>
                  <li>An airport is a <b>physical machine</b>. An AI that only predicts leaves the 17 phone calls intact — the latency just moves.</li>
                  <li>The unlock is closing the loop: a plan that <b>moves bags, robots and signs by itself</b> makes "resolved before you knew" literally true.</li>
                  <li>The twin is the bridge: it's where digital understanding becomes physical choreography.</li>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <section className="closing">
        <div className="wrap">
          <Reveal>
            <div className="section-kicker">07 · Where this starts</div>
            <div className="big">
              You don't build the AI-native airport.<br />
              You teach your airport <span className="accent">one reflex</span> —<br />
              then you add the next.
            </div>
          </Reveal>
          <div className="path">
            <Reveal delay={0.05}>
              <div className="p">
                <div className="ph">First 90 days</div>
                <h4>One closed loop</h4>
                <p>Pick the most expensive recurring physical problem — e.g. transfer queues
                during irregular ops. Fuse existing feeds, predict, and let one actuation
                (dynamic signage + tractor rerouting) close the loop. Measure the latency
                delta: hours today → minutes.</p>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="p">
                <div className="ph">Year one</div>
                <h4>The decision inbox</h4>
                <p>Expand the twin across one terminal. Every autonomous resolution becomes a
                card; every escalated decision teaches the escalation policy. The CEO's
                relationship with the airport changes from interrogation to review.</p>
              </div>
            </Reveal>
            <Reveal delay={0.19}>
              <div className="p">
                <div className="ph">Steady state</div>
                <h4>An airport that compounds</h4>
                <p>Predictions diffed against outcomes daily. Each storm makes the next
                response faster. The moat is not the robots or the models — it's the
                accumulated, physical memory of how <em>your</em> airport behaves.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap inner">
          <span>14:07 — THE DIVERSION</span>
          <span className="sp">CONCEPT EXERCISE · "IMAGINE THE AI-NATIVE AIRPORT"</span>
        </div>
      </footer>
    </>
  );
}
