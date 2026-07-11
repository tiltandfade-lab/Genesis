# BEAUTY-WAVE-4 — MOTION & FEEL (stills become footage)

type: system-spec
status: SPECCED (Fable, 2026-07-11 — Adam: "motion and feel should be specced now and queued
after [BW3]." Builds after BW3 closes; every unit judged on the finished lit/textured frames.)

## The thesis

Every BW1-3 unit composed a better STILL. The remaining tell is the space between verbs —
pops, snaps, and hard cuts where a physical tabletop would have continuity. Motion here means
SMALL: this is a diorama of miniatures, not an action game — the feel target is "a hand moved
a piece," never "a character animated." All time-based work runs through the existing tween
channels (theater-verbs tickTweens / standee-verbs) and is FAKE-CLOCK TESTABLE like the verbs;
determinism law binds seeds, not clocks.

## THE FEEL LAWS

1. **NOTHING TELEPORTS.** Everything that changes on screen arrives or leaves through a
   transition ≤ 400ms. (Board rebuilds may swap content behind a transition, never mid-view.)
2. **SMALL IS CORRECT.** Every amplitude in this wave errs tiny — hit-stop 60-80ms, shakes
   ≤ 3px-equivalent, fades 150-300ms. If a motion is noticed AS a motion, it's too big.
3. **INPUT IS NEVER BLOCKED** by cosmetic motion — tweens are interruptible; a new action
   cancels the tail of the last one (the verbs' existing persist/cancel grammar).

## MF-1 — CAMERA TWEENS (the snap killer)

Beat/room camera refits (BW2-1's fitMode changes) tween position+target over 280-350ms with
ease-out, instead of snapping. Move-step refits ride the same channel. Interruptible: a new
fit retargets the live tween from its current pose. Zoom/rotation player inputs stay direct
(no added lag on player intent — law 3).
*Verify:* fake-clock tween math (start/mid/end poses asserted); retarget mid-flight; frustum
check green at EVERY tween frame (the action cluster never leaves frame mid-tween — sample
t=0/0.25/0.5/0.75/1); fps ≥30; loop-gate capture gains a mid-tween shot, READ.

## MF-2 — SPAWN/DESPAWN GRACE (the pop killer)

1. Standee mount: 150ms fade-in + a 4% scale settle (a piece being set down); base lands
   first (base at full opacity from t=0 — the hand places the base, the art settles).
2. Despawn (defeat removal where corpses don't persist, guise swaps, board changes): 200ms
   fade-down INTO the base, base lifts last.
3. Dressing/furniture on first room reveal: staggered 40ms-per-piece cascade (seeded order) —
   the room "sets itself" like a DM laying out terrain. Cap total stagger at 400ms (law 1).
4. Room transition: walk/travel board swaps get a 200ms to-black (or to-fog) crossfade; the
   rebuild happens under it.
*Verify:* fake-clock opacity/scale curves; base-first ordering asserted; stagger seeded/
deterministic + capped; no input blocked during cascades; loop gate re-shot (the gate's
static captures must be UNAFFECTED — captures wait for settle; add a settle-await helper).

## MF-3 — IMPACT FEEL (hit-stop + response)

1. **HIT-STOP:** on hit-damage/hit-crit, the ATTACKER and TARGET tweens freeze 60ms (crit
   90ms) at the contact frame — everything else keeps ticking (motes, flicker — the world
   doesn't stop, the ACTION does; sells weight without slow-mo).
2. **Directional recoil:** the target's existing shake gains a directional bias away from the
   attacker (reuse the verb's own translate channel).
3. **Crit response:** hit-crit adds ONE frame of white flash on the target (existing tint
   channel) + a 2px-equivalent single-bounce camera nudge (NOT a shake — one nudge, settled
   in 120ms). Children carve-out unaffected (impact effects only, per the standing law).
4. **Kill weight:** fall-death gains 80ms hit-stop before the tip begins — the beat lands,
   THEN the mini falls.
*Verify:* fake-clock freeze windows (attacker/target frozen, motes ticking — assert both);
directional math; nudge amplitude bound + single-occurrence; verb suite (standee-verbs 71+)
stays green; a hurt/down capture pair READ for the felt difference.

## MF-4 — TURN & ROUND PRESENTATION (the rhythm layer)

1. Acting-unit handoff: the gold base glow + ring TWEEN between units (300ms slide of the
   ring to the next actor) instead of blinking — the eye follows whose turn it is.
2. Round boundary: the ROUND header does a 250ms dip-and-return; the chip strip pulses once.
3. Damage floaters (VP5) gain a 60ms pop-in scale (1.15 → 1.0) — they land, not appear.
*Verify:* ring tween path (fake clock); header/chip choreography fires once per round
(harness on the round event); floater curve; no DOM reflow storms (measure).

## MF-5 — THE FEEL GATE (Adam's hands, not eyes)

The wave gate is INTERACTIVE, not a still: a live bridge session (or the preview page) where
Adam plays 3 combat rounds and answers one question — "does it feel like moving miniatures?"
Instrumented capture: a 10-second GIF/frame-burst of one full turn (attack → hit-stop →
floater → ring handoff) committed as the wave's evidence alongside the stills.

## Order + vehicles

MF-1 first (everything is judged through the camera). MF-2/3/4 parallel after (all Sonnet —
this wave is mechanism, not taste; amplitudes are SPECCED above, not discovered). MF-5 = the
orchestrator shoots the burst + Adam plays. Every unit: fake-clock harnesses (the verb-suite
pattern), loop gate must stay 5/5 with a settle-await, fps ≥30 throughout. Standing scars
apply (kill stale servers, commit before finishing, pinned red-first refs).
