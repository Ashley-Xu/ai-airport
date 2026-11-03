/* ══════════════════════════════════════════════════════════════
   KEYS — one place that decides "was that the SPACE bar?".

   The problem this exists for: with a Chinese IME active, Space is
   consumed by the input method instead of reaching the page as a
   normal key. Chrome then delivers `keydown` with keyCode 229,
   key "Process" and an EMPTY `code` — so a handler testing
   `e.code === "Space"` never fires. Mouse clicks are unaffected,
   which is exactly the asymmetry that made the game look broken:
   clicking the bar worked, SPACE did nothing.

   Detection is split in two on purpose, because the two cases have
   different costs:

   · isSpaceDown — the reliable path. `code` survives on keyup and on
     any press the IME did not swallow, so we also accept `key === " "`
     and `keyCode === 32` for the composed/legacy variants.

   · isImeSwallowed — keyCode 229 means "the IME ate this keydown",
     but it does NOT say which key. Treating it as Space is therefore
     a guess: typing pinyin would also match. That is acceptable for a
     HOLD (keyup releases unconditionally, so a wrong guess lasts only
     as long as the key is down) and unacceptable for a TAP (a wrong
     guess permanently scores a move). Tap scenes must pair the 229
     keydown with a keyup whose code IS Space — see PassengerScene.
   ══════════════════════════════════════════════════════════════ */

/** True when this event is the SPACE bar arriving normally. */
export function isSpaceDown(e: KeyboardEvent): boolean {
  return e.code === "Space" || e.key === " " || e.keyCode === 32;
}

/** True when this keydown was swallowed by an input method (any key). */
export function isImeSwallowed(e: KeyboardEvent): boolean {
  return e.keyCode === 229 || e.key === "Process";
}

/**
 * True for SPACE held down long enough that the OS started auto-repeating.
 * A hold wants the first press only; a tap wants exactly one move per press.
 */
export function isAutoRepeat(e: KeyboardEvent): boolean {
  return e.repeat;
}

/* ── IME composition tracking ──
   keyCode 229 says "an input method swallowed this keydown" but NOT which key,
   so scoring a TAP on 229 alone would let pinyin typing rack up game moves.
   Composition events resolve it:

   · IME selected but IDLE + SPACE — no composition opens, the IME merely
     intercepted a raw key. THIS is the case that made the game unplayable.
   · IME MID-COMPOSITION + SPACE confirms a candidate — a composition is open,
     so the keystroke belongs to the text, not the game. Ignore it.

   The trap: `compositionstart` fires AFTER the first keydown of a composition,
   so "is a composition open right now?" is still false for that first pinyin
   character. Scoring synchronously on 229 would therefore register a hit for
   every first keystroke of every composed word. `isImeSpace` defers the decision
   to the end of the task (setTimeout 0) and re-checks: if compositionstart
   arrived in the meantime, the key was text and we stand down. ~4 ms of delay is
   nothing against a marker that crosses the whole bar in ~1.3 s. */

let composing = false;
let attached = false;

function attach() {
  if (attached || typeof window === "undefined") return;
  attached = true;
  window.addEventListener("compositionstart", () => { composing = true; });
  window.addEventListener("compositionend", () => { composing = false; });
}

/** Is an IME composition currently open? */
export function imeComposing(): boolean {
  attach();
  return composing;
}

/**
 * Decide, asynchronously, whether an opaque (229) keydown was really SPACE
 * rather than the first character of an IME composition. `cb(true)` only when
 * it was. Call ONLY from a 229 keydown; normal Space needs no help from this.
 */
export function isImeSpace(cb: (wasSpace: boolean) => void): void {
  attach();
  if (composing) { cb(false); return; }
  setTimeout(() => cb(!composing), 0);
}
