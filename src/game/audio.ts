import { useSyncExternalStore } from "react";
import { timeFrozen } from "./time";

/* ══════════════════════════════════════════════════════════════
   AUDIO — one procedural soundscape engine for the whole game.
   Everything is synthesized with the Web Audio API: no asset files,
   no licensing, seamless loops by construction, and — the reason it
   is procedural at all — the beds REACT to play: the captain's
   heartbeat speeds up as his strength drains, the wind screams with
   the dive and eases when it's arrested.

   TWO PALETTES, because the two runs ARE the argument:
   · Run 1 (the humans) — analog and imperfect. A GROWLING SAWTOOTH
     sub, dissonant Eb/Bb pads over D minor, cabin rumble, a heartbeat.
   · Run 2 (the nervous system) — the SAME event in the SAME key, but
     PURE SINES and a precision tick. Same crisis, a different mind
     doing the work; the drone waveform switch (saw → sine) is what
     makes that audible rather than leaving it to level alone.
   Both runs end in D major: the resolution the event never got.

   ENGINE LIVES ON globalThis, deliberately. A Vite HMR reload of this
   module otherwise builds a SECOND AudioContext with its own scheduler
   while the HUD button still controls the first one — sound keeps
   playing, the mute button appears dead, and scene changes stop
   reaching the engine that is actually audible. Keying the singleton on
   globalThis means a hot reload re-adopts the running engine.

   Module-store pattern like time.ts / nav.ts: scenes just call
   sound.setScene(...) / sound.setIntensity(...); the engine owns one
   AudioContext, one persistent voice set, and a 50 ms scheduler that
   applies presets, runs the heartbeat/tick/beep clocks, and handles
   the FREEZE duck.

   Browsers block audio before a user gesture, so the context is
   created lazily by sound.init() from the first click/keypress;
   until then setScene just remembers where we are.
   ══════════════════════════════════════════════════════════════ */

export type SceneKey =
  | "off" | "title" | "coldopen"
  | "r1_intro" | "r1_captain" | "r1_passengers" | "r1_controls" | "r1_reveal"
  | "r2_base" | "r2_deck" | "r2_dive" | "r2_ground" | "r2_after" | "r2_resolve";

type Preset = {
  drone: number;        // sub-drone frequency (Hz)
  droneGain: number;
  /** THE palette switch: Run 1 growls on sawtooth, Run 2 is pure sine. */
  droneType: OscillatorType;
  detune: number;       // cents of detune between the two drone oscillators — growl
  lowpass: number;      // drone lowpass cutoff — opens up with menace
  pad: number[];        // up to PAD_N chord frequencies
  padGain: number;
  /** Audible harmonic layer of the drone (drone × 4, so 147 or 294 Hz), the
   *  layer that actually reaches a laptop speaker. See the MIXING note. */
  bodyGain: number;
  bodyCut: number;      // lowpass on the body — wide open for Run 1's growl
  rumble: number;       // lowpassed noise — cabin / engines / airport
  wind: number;         // base wind level
  windBoost: number;    // extra wind at intensity.wind = 1
  windFreq: number;     // wind bandpass centre
  lfoRate: number;      // gust rate — chaotic in Run 1, near-steady in Run 2
  heart: boolean;       // heartbeat clock on
  tickBpm: number;      // precision tick clock (Run 2's pulse; 0 = off)
  tickGain: number;
  shimmer: number;      // high sine with slow tremolo — the "systems humming" top
};

const PAD_N = 4;

const PRESETS: Record<SceneKey, Preset> = {
  off:          { drone: 73.42, droneGain: 0, droneType: "sine", detune: 3, lowpass: 160, pad: [], padGain: 0, bodyGain: 0, bodyCut: 500, rumble: 0, wind: 0, windBoost: 0, windFreq: 600, lfoRate: 0.3, heart: false, tickBpm: 0, tickGain: 0, shimmer: 0 },
  title:        { drone: 73.42, droneGain: 0.07, droneType: "sine", detune: 4, lowpass: 150, pad: [146.83, 220, 293.66], padGain: 0.085, bodyGain: 0.055, bodyCut: 700, rumble: 0.03, wind: 0, windBoost: 0, windFreq: 600, lfoRate: 0.2, heart: false, tickBpm: 0, tickGain: 0, shimmer: 0.02 },
  coldopen:     { drone: 73.42, droneGain: 0.075, droneType: "sine", detune: 3, lowpass: 130, pad: [], padGain: 0, bodyGain: 0.05, bodyCut: 600, rumble: 0.045, wind: 0, windBoost: 0, windFreq: 600, lfoRate: 0.2, heart: false, tickBpm: 0, tickGain: 0, shimmer: 0 },

  /* ── RUN 1 — the humans. Sawtooth, dissonant, warm, imperfect. ──
     MIXING: the sub drone (36–73 Hz) is felt, not heard — a laptop speaker
     reproduces almost nothing under 150 Hz, and this score first shipped with
     nearly ALL its energy there, which is why both runs sounded like one quiet
     bed. Every scene now carries a BODY layer (saw at drone x4, ~147/294 Hz)
     with a wide-open lowpass, plus pads lifted ~2.5x, so the audible register
     dominates. Run 1's body is a SAW through 1.4–2.6 kHz: it buzzes. */
  r1_intro:     { drone: 73.42, droneGain: 0.07, droneType: "sawtooth", detune: 6, lowpass: 380, pad: [146.83, 174.61], padGain: 0.075, bodyGain: 0.085, bodyCut: 1400, rumble: 0.06, wind: 0, windBoost: 0, windFreq: 700, lfoRate: 0.25, heart: false, tickBpm: 0, tickGain: 0, shimmer: 0 },
  r1_captain:   { drone: 36.71, droneGain: 0.09, droneType: "sawtooth", detune: 10, lowpass: 430, pad: [155.56, 233.08], padGain: 0.08, bodyGain: 0.105, bodyCut: 1800, rumble: 0.17, wind: 0, windBoost: 0, windFreq: 700, lfoRate: 0.5, heart: true, tickBpm: 0, tickGain: 0, shimmer: 0 },
  r1_passengers:{ drone: 36.71, droneGain: 0.085, droneType: "sawtooth", detune: 10, lowpass: 470, pad: [155.56, 233.08], padGain: 0.09, bodyGain: 0.115, bodyCut: 2200, rumble: 0.21, wind: 0, windBoost: 0, windFreq: 700, lfoRate: 0.6, heart: true, tickBpm: 132, tickGain: 0.03, shimmer: 0 },
  r1_controls:  { drone: 36.71, droneGain: 0.095, droneType: "sawtooth", detune: 12, lowpass: 540, pad: [155.56, 233.08], padGain: 0.078, bodyGain: 0.125, bodyCut: 2600, rumble: 0.09, wind: 0.06, windBoost: 0.42, windFreq: 750, lfoRate: 0.9, heart: true, tickBpm: 0, tickGain: 0, shimmer: 0 },
  /* The reveal — D major, warm. The first consonance Run 1 gets. */
  r1_reveal:    { drone: 73.42, droneGain: 0.07, droneType: "triangle", detune: 4, lowpass: 180, pad: [146.83, 185.0, 220, 293.66], padGain: 0.15, bodyGain: 0.08, bodyCut: 900, rumble: 0.05, wind: 0, windBoost: 0, windFreq: 600, lfoRate: 0.2, heart: false, tickBpm: 0, tickGain: 0, shimmer: 0.016 },

  /* ── RUN 2 — the nervous system. Same octave, PURE SINE body, tight 500–900 Hz
     cut, precision tick. Where Run 1 buzzes, Run 2 is clean — that contrast IS
     the argument, and it now lives in the audible register instead of only in a
     droneType flag nobody could hear. Each step gets its own bed and its own
     consonance, so the run has an arc: cold boot (open fifth) -> the intrusion
     (Eb/Bb, the same dissonance as Run 1's cockpit, because the threat IS the
     same) -> the dive -> the ground opening up (F# enters) -> aftermath (adds
     the octave) -> resolve (D major). */
  r2_base:      { drone: 73.42, droneGain: 0.07, droneType: "sine", detune: 1, lowpass: 150, pad: [146.83, 220], padGain: 0.11, bodyGain: 0.08, bodyCut: 520, rumble: 0.05, wind: 0, windBoost: 0, windFreq: 500, lfoRate: 0.08, heart: false, tickBpm: 60, tickGain: 0.032, shimmer: 0.022 },
  r2_deck:      { drone: 36.71, droneGain: 0.085, droneType: "sine", detune: 1, lowpass: 190, pad: [155.56, 233.08], padGain: 0.115, bodyGain: 0.09, bodyCut: 600, rumble: 0.09, wind: 0, windBoost: 0, windFreq: 500, lfoRate: 0.08, heart: false, tickBpm: 84, tickGain: 0.036, shimmer: 0.022 },
  /* The dive under AI control: wind present but STEADY — the same storm as
     Run 1 scene 3, audibly not screaming. lfoRate near zero says "held by
     intent-guard" without a word of copy. */
  r2_dive:      { drone: 36.71, droneGain: 0.085, droneType: "sine", detune: 1, lowpass: 200, pad: [155.56, 233.08, 293.66], padGain: 0.1, bodyGain: 0.1, bodyCut: 700, rumble: 0.07, wind: 0.09, windBoost: 0.16, windFreq: 520, lfoRate: 0.08, heart: false, tickBpm: 100, tickGain: 0.034, shimmer: 0.018 },
  r2_ground:    { drone: 73.42, droneGain: 0.07, droneType: "sine", detune: 1, lowpass: 170, pad: [146.83, 220, 293.66, 369.99], padGain: 0.125, bodyGain: 0.085, bodyCut: 950, rumble: 0.07, wind: 0, windBoost: 0, windFreq: 500, lfoRate: 0.08, heart: false, tickBpm: 66, tickGain: 0.03, shimmer: 0.042 },
  /* Aftermath is the QUIET governance beat — settled, warm, no longer working
     the problem. Deliberately darker than d3 (bodyCut 480 vs 950, less shimmer,
     slower tick) so the run's last two beds are not the same tone; the ground
     response was busy and bright, this is what it sounds like once it's over. */
  r2_after:     { drone: 73.42, droneGain: 0.065, droneType: "sine", detune: 1, lowpass: 160, pad: [146.83, 220, 293.66, 440], padGain: 0.14, bodyGain: 0.075, bodyCut: 480, rumble: 0.05, wind: 0, windBoost: 0, windFreq: 500, lfoRate: 0.06, heart: false, tickBpm: 52, tickGain: 0.028, shimmer: 0.018 },
  r2_resolve:   { drone: 73.42, droneGain: 0.075, droneType: "sine", detune: 1, lowpass: 190, pad: [146.83, 185.0, 220, 293.66], padGain: 0.16, bodyGain: 0.09, bodyCut: 1150, rumble: 0.04, wind: 0, windBoost: 0, windFreq: 500, lfoRate: 0.06, heart: false, tickBpm: 0, tickGain: 0, shimmer: 0.03 },
};

const MASTER = 0.8;           // overall trim — beds sit under the story
/** Freeze ducks HARD. It first shipped at 0.5 (-6 dB), which is a hint, not an
 *  event — and because this score is bass-dominated (36–73 Hz drone, 110 Hz
 *  rumble, 58 Hz heartbeat), the lowpass alone removed almost nothing audible.
 *  -16 dB plus stopped clocks is unmistakable: freezing sounds like time stops. */
const FROZEN_DUCK = 0.15;
const FROZEN_HZ = 260;        // muffled lowpass while frozen
const RAMP = 0.45;            // setTargetAtTime constant → ~1.2 s crossfade
const STORE_KEY = "ai-airport-sound";

/* ── engine singleton on globalThis (survives HMR module reloads) ── */
type Engine = {
  ctx: AudioContext | null;
  master: GainNode; freezeFilter: BiquadFilterNode; sfxGain: GainNode; analyser: AnalyserNode;
  droneGain: GainNode; droneFilter: BiquadFilterNode; droneOscA: OscillatorNode; droneOscB: OscillatorNode;
  droneType: OscillatorType;
  padGain: GainNode; padVoices: { osc: OscillatorNode; gain: GainNode }[];
  /** The audible harmonic layer: drone x 4 through its own lowpass. This is the
   *  layer a laptop speaker can actually reproduce. */
  bodyGain: GainNode; bodyFilter: BiquadFilterNode; bodyOsc: OscillatorNode;
  rumbleGain: GainNode; windGain: GainNode; windFilter: BiquadFilterNode;
  windLfo: OscillatorNode; windLfoDepth: GainNode;
  shimmerGain: GainNode; shimmerLfo: OscillatorNode;
  heartGain: GainNode; tickGainNode: GainNode; beepGain: GainNode;
  scene: SceneKey;
  intensity: { heart: number; wind: number; tension: number };
  beepOn: boolean;
  enabled: boolean;
  nextBeat: number; nextTick: number; nextBeep: number;
};

function freshEngine(): Engine {
  let enabled = true;
  try { enabled = localStorage.getItem(STORE_KEY) !== "off"; } catch { /* private mode */ }
  return {
    ctx: null,
    master: null!, freezeFilter: null!, sfxGain: null!, analyser: null!,
    droneGain: null!, droneFilter: null!, droneOscA: null!, droneOscB: null!,
    droneType: "sine",
    padGain: null!, padVoices: [],
    bodyGain: null!, bodyFilter: null!, bodyOsc: null!,
    rumbleGain: null!, windGain: null!, windFilter: null!,
    windLfo: null!, windLfoDepth: null!,
    shimmerGain: null!, shimmerLfo: null!,
    heartGain: null!, tickGainNode: null!, beepGain: null!,
    scene: "title",
    intensity: { heart: 0, wind: 0, tension: 0 },
    beepOn: false,
    enabled,
    nextBeat: 0, nextTick: 0, nextBeep: 0,
  };
}

/* Adopt the running engine if one already exists (HMR), else create it. */
const G = globalThis as unknown as { __aiAirportAudio?: Engine; __aiAirportAudioCount?: number; __aiAirportAudioCtxCount?: number };
const E: Engine = G.__aiAirportAudio ?? (G.__aiAirportAudio = freshEngine());
/** How many times this module has been evaluated. >1 is normal under HMR; what
 *  matters is that __aiAirportAudioCtxCount stays 1 — i.e. re-evaluation ADOPTED
 *  the running engine instead of building a second AudioContext. */
G.__aiAirportAudioCount = (G.__aiAirportAudioCount ?? 0) + 1;
G.__aiAirportAudioCtxCount = G.__aiAirportAudioCtxCount ?? 0;
/** Stable identity for the adopted engine, so probes can prove it is the same one. */
if (!(E as unknown as { id?: string }).id) {
  (E as unknown as { id: string }).id = "eng-" + Math.random().toString(36).slice(2, 9);
}

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };

/** Reactive: is sound enabled? Drives the HUD/title mute button. */
export function useAudioOn(): boolean {
  return useSyncExternalStore(subscribe, () => E.enabled, () => true);
}

/* ── graph construction (once, on first gesture) ── */
function buildGraph() {
  const c = E.ctx!;
  E.master = c.createGain(); E.master.gain.value = 0;
  E.freezeFilter = c.createBiquadFilter(); E.freezeFilter.type = "lowpass"; E.freezeFilter.frequency.value = 18000;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -18; comp.knee.value = 12; comp.ratio.value = 4;
  // analyser taps the FINAL signal so probes measure what is actually audible
  E.analyser = c.createAnalyser(); E.analyser.fftSize = 2048;
  E.master.connect(E.freezeFilter).connect(comp).connect(E.analyser).connect(c.destination);

  E.sfxGain = c.createGain(); E.sfxGain.gain.value = 0.9; E.sfxGain.connect(E.master);

  // sub-drone: two detuned oscillators through a lowpass — the growl lives here
  E.droneGain = c.createGain(); E.droneGain.gain.value = 0;
  E.droneFilter = c.createBiquadFilter(); E.droneFilter.type = "lowpass"; E.droneFilter.frequency.value = 160;
  E.droneOscA = c.createOscillator(); E.droneOscA.type = "sine"; E.droneOscA.frequency.value = 73.42;
  E.droneOscB = c.createOscillator(); E.droneOscB.type = "sine"; E.droneOscB.frequency.value = 73.42;
  E.droneOscA.detune.value = -3; E.droneOscB.detune.value = 3;
  E.droneOscA.connect(E.droneFilter); E.droneOscB.connect(E.droneFilter);
  E.droneFilter.connect(E.droneGain).connect(E.master);
  E.droneOscA.start(); E.droneOscB.start();

  // pad: PAD_N pure sines, per-voice gains so chords can change shape
  E.padGain = c.createGain(); E.padGain.gain.value = 1; E.padGain.connect(E.master);
  E.padVoices = Array.from({ length: PAD_N }, () => {
    const osc = c.createOscillator(); osc.type = "sine"; osc.frequency.value = 220;
    const gain = c.createGain(); gain.gain.value = 0;
    osc.connect(gain).connect(E.padGain); osc.start();
    return { osc, gain };
  });

  /* BODY: the audible harmonic layer. The sub drone sits at 36–73 Hz, which a
     laptop speaker cannot reproduce — this score first shipped with nearly all
     its energy down there, so it measured loud and sounded like nothing, and
     both runs read as "one audio". This oscillator tracks drone x 4 (~147 Hz
     on D1, ~294 Hz on the deeper D) through its own lowpass, and it carries
     the palette: saw for Run 1's buzz, sine for Run 2's clean hum. */
  E.bodyGain = c.createGain(); E.bodyGain.gain.value = 0;
  E.bodyFilter = c.createBiquadFilter(); E.bodyFilter.type = "lowpass"; E.bodyFilter.frequency.value = 800;
  E.bodyOsc = c.createOscillator(); E.bodyOsc.type = "sine"; E.bodyOsc.frequency.value = 293.66;
  E.bodyOsc.connect(E.bodyFilter).connect(E.bodyGain).connect(E.master);
  E.bodyOsc.start();

  // one noise buffer feeds both rumble (lowpass) and wind (bandpass)
  const noiseBuf = c.createBuffer(1, c.sampleRate * 3, c.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const mkNoise = () => { const s = c.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.start(); return s; };

  E.rumbleGain = c.createGain(); E.rumbleGain.gain.value = 0;
  const rumbleFilter = c.createBiquadFilter(); rumbleFilter.type = "lowpass"; rumbleFilter.frequency.value = 110;
  mkNoise().connect(rumbleFilter).connect(E.rumbleGain).connect(E.master);

  E.windGain = c.createGain(); E.windGain.gain.value = 0;
  E.windFilter = c.createBiquadFilter(); E.windFilter.type = "bandpass"; E.windFilter.frequency.value = 600; E.windFilter.Q.value = 0.6;
  mkNoise().connect(E.windFilter).connect(E.windGain).connect(E.master);
  E.windLfo = c.createOscillator(); E.windLfo.type = "sine"; E.windLfo.frequency.value = 0.3;
  E.windLfoDepth = c.createGain(); E.windLfoDepth.gain.value = 200;
  E.windLfo.connect(E.windLfoDepth).connect(E.windFilter.frequency); E.windLfo.start();

  // shimmer: a high D with slow tremolo — "systems humming"
  E.shimmerGain = c.createGain(); E.shimmerGain.gain.value = 0;
  const shim = c.createOscillator(); shim.type = "sine"; shim.frequency.value = 1174.66; // D6
  E.shimmerLfo = c.createOscillator(); E.shimmerLfo.type = "sine"; E.shimmerLfo.frequency.value = 0.12;
  const shimDepth = c.createGain(); shimDepth.gain.value = 0.5;
  const shimTrim = c.createGain(); shimTrim.gain.value = 0.5;
  shim.connect(shimTrim).connect(E.shimmerGain).connect(E.master);
  E.shimmerLfo.connect(shimDepth).connect(shimTrim.gain);
  shim.start(); E.shimmerLfo.start();

  E.heartGain = c.createGain(); E.heartGain.gain.value = 0.5; E.heartGain.connect(E.master);
  E.tickGainNode = c.createGain(); E.tickGainNode.gain.value = 1; E.tickGainNode.connect(E.master);
  E.beepGain = c.createGain(); E.beepGain.gain.value = 1; E.beepGain.connect(E.master);
}

function applyPreset(p: Preset) {
  if (!E.ctx) return;
  const t = E.ctx.currentTime;
  const ramp = (param: AudioParam, v: number) => param.setTargetAtTime(v, t, RAMP);
  // oscillator TYPE is not an AudioParam — assign directly, only on change
  if (E.droneType !== p.droneType) {
    E.droneType = p.droneType;
    E.droneOscA.type = p.droneType;
    E.droneOscB.type = p.droneType;
    // the body carries the palette too: Run 1's saw buzzes, Run 2's sine is clean
    E.bodyOsc.type = p.droneType === "sawtooth" ? "sawtooth" : p.droneType === "triangle" ? "triangle" : "sine";
  }
  ramp(E.droneOscA.frequency, p.drone); ramp(E.droneOscB.frequency, p.drone);
  ramp(E.droneOscA.detune, -p.detune); ramp(E.droneOscB.detune, p.detune);
  ramp(E.droneFilter.frequency, p.lowpass);
  ramp(E.droneGain.gain, p.droneGain);
  // body tracks the drone two octaves up — the layer laptop speakers can play
  ramp(E.bodyOsc.frequency, p.drone * 4);
  ramp(E.bodyFilter.frequency, p.bodyCut);
  ramp(E.bodyGain.gain, p.bodyGain);
  E.padVoices.forEach((v, i) => {
    const f = p.pad[i];
    if (f !== undefined) { ramp(v.osc.frequency, f); ramp(v.gain.gain, p.padGain / Math.max(1, p.pad.length) * 2); }
    else ramp(v.gain.gain, 0);
  });
  ramp(E.rumbleGain.gain, p.rumble);
  ramp(E.windFilter.frequency, p.windFreq);
  ramp(E.windLfo.frequency, p.lfoRate);
  ramp(E.windLfoDepth.gain, p.lfoRate > 0.3 ? 260 : 60);
  ramp(E.windGain.gain, p.wind + E.intensity.wind * p.windBoost);
  ramp(E.shimmerGain.gain, p.shimmer);
}

/* ── one-shots ── */
function env(node: AudioNode, t0: number, peak: number, attack: number, decay: number): GainNode {
  const g = E.ctx!.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
  node.connect(g);
  return g;
}

function tone(freq: number, endFreq: number, t0: number, peak: number, decay: number, type: OscillatorType = "sine", dest?: AudioNode) {
  const c = E.ctx!;
  const o = c.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (endFreq !== freq) o.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), t0 + decay);
  const g = env(o, t0, peak, 0.012, decay);
  g.connect(dest ?? E.sfxGain);
  o.start(t0); o.stop(t0 + decay + 0.1);
}

function noiseHit(t0: number, peak: number, decay: number, freq: number, type: BiquadFilterType = "lowpass") {
  const c = E.ctx!;
  const s = c.createBufferSource();
  const buf = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * (decay + 0.05))), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  s.buffer = buf;
  const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq;
  s.connect(f);
  const g = env(f, t0, peak, 0.008, decay);
  g.connect(E.sfxGain);
  s.start(t0); s.stop(t0 + decay + 0.05);
}

/** Heartbeat. The 58 Hz thump is felt more than heard — and a laptop speaker
 *  reproduces almost nothing that low, so on its own the heartbeat was silent
 *  for most listeners. Every beat therefore also gets a short filtered click
 *  (a "lub" transient in the audible register) so the pulse is heard as well. */
function thump(t0: number, peak: number, click = true) {
  tone(58, 34, t0, peak, 0.24, "sine", E.heartGain);
  if (click) noiseHit(t0, peak * 0.22, 0.055, 340, "lowpass");
}

export type SfxName = "hit" | "miss" | "thunk" | "data" | "ack" | "tick" | "chime" | "resolve" | "hollow" | "warm";

function playSfx(name: SfxName) {
  if (!E.ctx) return;
  const t = E.ctx.currentTime;
  switch (name) {
    case "hit":   tone(200, 90, t, 0.12, 0.08); noiseHit(t, 0.05, 0.04, 1800, "highpass"); break;
    case "miss":  tone(120, 70, t, 0.07, 0.15); break;
    case "thunk": tone(90, 45, t, 0.16, 0.28); noiseHit(t, 0.10, 0.16, 220); break;
    /* cold-open beats: a minor third for "150 dead", an open fifth for "174 lived" */
    /* "hollow" is currently UNCALLED: its beat (the 2015 cold-open card) is
       commented out for interview time. Kept because restoring that beat needs
       exactly this tone — see the CUT FOR TIME block in Game.tsx's ColdOpen. */
    case "hollow": tone(146.83, 146.83, t, 0.05, 1.8, "sine"); tone(174.61, 174.61, t + 0.05, 0.032, 1.6, "sine"); break;
    case "warm":   tone(293.66, 293.66, t, 0.05, 1.6, "triangle"); tone(440, 440, t + 0.12, 0.038, 1.8, "triangle"); break;
    case "data":  tone(1567.98, 1567.98, t, 0.035, 0.045); tone(2093, 2093, t + 0.065, 0.03, 0.05); break;
    case "ack":   tone(1046.5, 1046.5, t, 0.04, 0.07); break;
    case "tick":  tone(2400, 2400, t, 0.018, 0.015); break;
    case "chime": [293.66, 369.99, 440, 587.33].forEach((f, i) => tone(f, f, t + i * 0.09, 0.05, 1.7, "triangle")); break;
    case "resolve":
      [293.66, 369.99, 440, 587.33].forEach((f, i) => tone(f, f, t + i * 0.09, 0.05, 1.7, "triangle"));
      { const o = E.ctx.createOscillator(); o.type = "sine"; o.frequency.value = 73.42;
        const g = env(o, t, 0.05, 1.2, 1.8); g.connect(E.sfxGain); o.start(t); o.stop(t + 3.2); }
      break;
  }
}

/* ── the 50 ms scheduler: freeze duck, heart/tick/beep clocks, live intensity ── */
function schedulerTick() {
  if (!E.ctx) return;
  const t = E.ctx.currentTime;
  const frozen = timeFrozen();
  const p = PRESETS[E.scene];

  // freeze: the world muffles AND ducks hard — time itself holding
  E.master.gain.setTargetAtTime(E.enabled ? (frozen ? MASTER * FROZEN_DUCK : MASTER) : 0, t, frozen || !E.enabled ? 0.10 : 0.35);
  E.freezeFilter.frequency.setTargetAtTime(frozen ? FROZEN_HZ : 18000, t, 0.14);

  // live intensity: heartbeat rate, wind level, drone growl
  const bpm = 52 + 96 * E.intensity.heart;
  E.windGain.gain.setTargetAtTime(p.wind + E.intensity.wind * p.windBoost, t, 0.25);
  E.droneFilter.frequency.setTargetAtTime(p.lowpass + E.intensity.tension * 320, t, 0.4);
  E.droneOscA.detune.setTargetAtTime(-(p.detune + E.intensity.tension * 10), t, 0.4);
  E.droneOscB.detune.setTargetAtTime(p.detune + E.intensity.tension * 10, t, 0.4);

  if (!frozen) {
    if (p.heart && t >= E.nextBeat) {
      thump(t, 0.28 + 0.3 * E.intensity.heart);
      thump(t + 0.22, (0.28 + 0.3 * E.intensity.heart) * 0.5);   // lub-dub
      E.nextBeat = t + 60 / bpm;
    }
    if (p.tickBpm > 0 && t >= E.nextTick) {
      tone(2100, 2100, t, p.tickGain, 0.02, "sine", E.tickGainNode);
      E.nextTick = t + 60 / p.tickBpm;
    }
    if (E.beepOn && t >= E.nextBeep) {
      // abstract sink-rate warning — two chirps, not the trademarked voice
      tone(988, 988, t, 0.045, 0.07, "square", E.beepGain);
      tone(988, 988, t + 0.2, 0.045, 0.07, "square", E.beepGain);
      E.nextBeep = t + 0.95;
    }
  }
  // re-arm clocks so an unfreeze never dumps a burst of overdue beats
  if (frozen || !p.heart) E.nextBeat = Math.max(E.nextBeat, t + 0.1);
  if (frozen || p.tickBpm === 0) E.nextTick = Math.max(E.nextTick, t + 0.1);
  if (frozen || !E.beepOn) E.nextBeep = Math.max(E.nextBeep, t + 0.1);
}

/* ── public API ── */
function init() {
  if (E.ctx) { if (E.ctx.state === "suspended") E.ctx.resume().catch(() => {}); return; }
  if (typeof window === "undefined") return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  try { E.ctx = new AC(); } catch { E.ctx = null; return; }
  G.__aiAirportAudioCtxCount = (G.__aiAirportAudioCtxCount ?? 0) + 1;
  buildGraph();
  applyPreset(PRESETS[E.scene]);
  E.master.gain.setValueAtTime(0, E.ctx.currentTime);   // scheduler ramps it in
  setInterval(schedulerTick, 50);
  E.ctx.resume().catch(() => {});

  /* A context created outside a trusted gesture starts (or falls back to)
     "suspended", and browsers only let resume() succeed from inside one.
     Begin is normally that gesture, but to be safe — e.g. autoplay blocked,
     or the tab was backgrounded then returned to — latch onto the next real
     pointer/key event anywhere and resume. Removed once it sticks so it
     can't fire forever. */
  const nudge = () => {
    if (!E.ctx) return;
    if (E.ctx.state === "running") { window.removeEventListener("pointerdown", nudge); window.removeEventListener("keydown", nudge); return; }
    E.ctx.resume().catch(() => {});
  };
  window.addEventListener("pointerdown", nudge);
  window.addEventListener("keydown", nudge);
}

function setScene(key: SceneKey) {
  E.scene = key;
  applyPreset(PRESETS[key]);
}

/** Live play state (0..1 each): heart rate, wind level, drone menace. */
function setIntensity(v: Partial<{ heart: number; wind: number; tension: number }>) {
  E.intensity = { ...E.intensity, ...v };
}

/** Sink-rate beeping (Run 1 scene 3, while out of the level band). */
function setBeep(on: boolean) { E.beepOn = on; }

function sfx(name: SfxName) { playSfx(name); }

function setEnabled(v: boolean) {
  if (E.enabled === v) return;
  E.enabled = v;
  try { localStorage.setItem(STORE_KEY, v ? "on" : "off"); } catch { /* private mode */ }
  if (v) init();   // called from a gesture (the toggle click), so resume is legal
  emit();
}

/** The HUD/title mute toggle. init() first: enabling from silence must make sound NOW. */
function toggle() { init(); setEnabled(!E.enabled); }

export const sound = { init, setScene, setIntensity, setBeep, sfx, toggle, setEnabled };

// test hook (same culture as ?r1= and #r1probe): lets headless probes read engine state
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__sound = {
    get scene() { return E.scene; },
    get enabled() { return E.enabled; },
    get intensity() { return E.intensity; },
    get beep() { return E.beepOn; },
    get ctxState() { return E.ctx ? E.ctx.state : "none"; },
    // live graph readings for verifying the freeze duck numerically
    get masterGain() { return E.ctx ? E.master.gain.value : null; },
    get freezeHz() { return E.ctx ? E.freezeFilter.frequency.value : null; },
    get droneType() { return E.droneType; },
    // module evaluations vs AudioContexts built — ctxCount must stay 1 under HMR
    get engines() { return G.__aiAirportAudioCount ?? 1; },
    get ctxCount() { return G.__aiAirportAudioCtxCount ?? 0; },
    get id() { return (E as unknown as { id?: string }).id ?? null; },
    // spectral centroid (Hz) — timbre fingerprint, so probes can prove two beds
    // SOUND different rather than merely measuring different levels
    get centroid() {
      if (!E.ctx || !E.analyser) return null;
      const n = E.analyser.frequencyBinCount;
      const mag = new Float32Array(n);
      E.analyser.getFloatFrequencyData(mag);
      let num = 0, den = 0;
      for (let i = 1; i < n; i++) {
        const p = Math.pow(10, mag[i] / 20);          // dB → linear
        num += p * i; den += p;
      }
      if (den <= 0) return null;
      return (num / den) * (E.ctx.sampleRate / 2) / n;
    },
    /** RMS measured only within [lo, hi] Hz. Laptop speakers reproduce almost
     *  nothing below ~150 Hz, so a mix whose energy sits in a 36 Hz sub-drone
     *  can measure loud while sounding silent — this is how probes check what a
     *  real listener on real hardware would actually hear. */
    band(lo: number, hi: number): number | null {
      if (!E.ctx || !E.analyser) return null;
      const n = E.analyser.frequencyBinCount;
      const nyq = E.ctx.sampleRate / 2;
      const mag = new Float32Array(n);
      E.analyser.getFloatFrequencyData(mag);
      let sum = 0, cnt = 0;
      const i0 = Math.max(1, Math.floor(lo / nyq * n));
      const i1 = Math.min(n - 1, Math.ceil(hi / nyq * n));
      for (let i = i0; i <= i1; i++) {
        const p = Math.pow(10, mag[i] / 20);
        sum += p * p; cnt++;
      }
      return cnt ? Math.sqrt(sum / cnt) : null;
    },
    // RMS of the FINAL signal — what is actually audible, not just param values
    get rms() {
      if (!E.ctx || !E.analyser) return null;
      const buf = new Float32Array(E.analyser.fftSize);
      E.analyser.getFloatTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
      return Math.sqrt(sum / buf.length);
    },
  };
}
