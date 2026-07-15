# PACKET-F14 — The kid roster: 20 wants (NPC register)

**Authority:** laws identical to PACKET-F1 — the **§0 ART-DIRECTION RULINGS** and chroma rule
apply verbatim; reread them before firing. Compile every sheet from
`FACETED-ART-REGENERATION-PRODUCTION-PLAN.md` §6.8 (NPC insertion: social attitude + situation +
practical carried objects + restrained noncombat pose).

**What this packet is:** the 20 `kid-wants-*` NPCs — story-engine children whose slug IS their
want. Each is defined by a WANT, not a look; the render shows a kid mid-want: posture, carried
object, and where their eyes go. **The slug sentence is the identity seed.** Vary ancestry,
build, and dress across the roster (this is a town's worth of children, not one child twenty
times) — assign each a distinct read.

**Register ruling (extends §0):** the adult-register law governs STYLE, not subject — children
exist in the world and get the same serious, grounded, low-poly treatment. Real kids: scuffed
knees, hand-me-downs, wariness, nerve. NEVER cute-mascot, NEVER Pixar-round, and never
creepy-horror unless the want itself carries dread (the thing in the woods, the thing that comes
at night — let those two hold unease, not gore).

## DISCIPLINE (identical across all F-packets; F1 audit lessons baked in)
1. **Filenames:** full slug incl. `spr-fantasy-` prefix; multi-cell sheets join cell keywords (slugs are sentences — e.g. `spr-fantasy-kid-wants-errand-dog-candidate-001.png`) and record FULL cell slugs in provenance. Candidates numbered **per-slug from 001** (never a lane-global counter — F1 lanes 3–5 collided).
2. **Provenance:** per-lane JSON at `fantasy-pilot/provenance/<packet>-<lane>-generation-calls.json` (packet prefix mandatory, e.g. `f8-lane-u-…` — bare lane names collide across packets) (file / callId / cells with FULL slugs). Never append to the shared AUDIT.md.
3. **Chroma:** flat uniform magenta **#FF00FF**; the chroma color must never appear IN a figure (F1 shipped a magenta-tinted shoe). No gradient, floor, shadow, or horizon.
4. **Crop:** generous padding — feet, fingertips, carried objects WELL inside the frame. Near-edge extremities were F1's most common defect.
5. **Cells:** exactly N figures in N equal vertical 4:8 cells, hard boundaries, no overlap, no shared props, varied poses — no two share a stance. Odd-remainder cells stay pure chroma.
6. **Props:** exactly ONE of each carried item (F1 produced a doubled kite shield).
7. **Faces/finish:** grounded, weathered, real — no BG3-glamour, no MMO gloss, no candy saturation, no doll-face.
8. **§0 laws:** child-lanky by nature; compact support; realistic dark-fantasy register with the stylized triangulated low-poly twist.
9. **No VFX in sources.**
10. Every output is a candidate — `runtimeAdmitted:false`; save to `fantasy-pilot/raw-figures/`; record every generation call id.
**Sheet economy (§0):** children render as SMALL cells — **4 per sheet (2×2)**. 20 kids = 5 sheets, one lane, one Codex window.

## LANE K — the twenty wants (5 sheets × 4 cells)

**Sheet plan:** S1 rows 1–4 · S2 rows 5–8 · S3 rows 9–12 · S4 rows 13–16 · S5 rows 17–20.

| # | slug (verbatim; sentence = seed) | staging cue — verb |
|---|---|---|
| 1 | spr-fantasy-kid-wants-be-believed-by-one-grown-up-just-one-about-the-thing-they-saw | mid-plea, arms wide, pointing back over a shoulder — verb: INSISTS. |
| 2 | spr-fantasy-kid-wants-be-chosen-for-the-errand-the-team-the-trust-for-once | stood too straight, chin up, trying to look taller — verb: VOLUNTEERS. |
| 3 | spr-fantasy-kid-wants-feed-the-thing-in-the-woods-that-s-been-kind-to-them | bundle of scraps held close, glancing behind — quiet dread allowed — verb: SNEAKS-FOOD. |
| 4 | spr-fantasy-kid-wants-find-out-what-the-grown-ups-whisper-about-behind-the-shut-door | ear-to-air listening lean, one hand cupped — verb: EAVESDROPS. |
| 5 | spr-fantasy-kid-wants-find-the-dog-that-didn-t-come-home | rope leash coiled in fist, worn-out hope — verb: KEEPS-LOOKING. |
| 6 | spr-fantasy-kid-wants-get-back-what-was-taken-from-them-and-it-s-the-object-the-whole-plot-turns-on | empty-handed clench, eyes locked on the viewer — verb: DEMANDS-BACK. |
| 7 | spr-fantasy-kid-wants-get-their-small-hoard-back-from-whoever-confiscated-it | small empty tin held open as evidence — verb: PLEADS-THE-CASE. |
| 8 | spr-fantasy-kid-wants-keep-the-little-one-from-finding-out-the-bad-thing-that-happened | protective arm out, forced brave face — verb: SHIELDS. |
| 9 | spr-fantasy-kid-wants-keep-the-pretty-thing-they-found-which-someone-dangerous-is-tearing-the-town-apart-to-recover | fist closed tight behind the back — verb: HIDES-IT. |
| 10 | spr-fantasy-kid-wants-keep-the-secret-they-swore-to-keep-even-now-that-it-s-gone-wrong | lips pressed, arms crossed, eyes sliding away — verb: KEEPS-IT. |
| 11 | spr-fantasy-kid-wants-make-their-parent-laugh-the-old-way-the-way-from-before | mid-bit: a juggled stone, a pulled face — grief under it — verb: TRIES-THE-OLD-JOKE. |
| 12 | spr-fantasy-kid-wants-not-have-to-go-home-tonight | sat on a step-shaped posture (no scenery), knees hugged — verb: STALLS. |
| 13 | spr-fantasy-kid-wants-prove-they-re-not-a-baby-by-going-where-they-re-forbidden-to-go | mid-stride past an invisible line, jaw set — verb: CROSSES-ANYWAY. |
| 14 | spr-fantasy-kid-wants-put-it-back-before-anyone-notices-it-was-gone | object wrapped in a jacket, tip-toe hurry — verb: PUTS-IT-BACK. |
| 15 | spr-fantasy-kid-wants-see-the-locked-place-opened-just-once-just-to-know | bent to an invisible keyhole height, hands on knees — verb: JUST-WANTS-TO-KNOW. |
| 16 | spr-fantasy-kid-wants-slip-a-message-to-the-one-person-the-family-has-forbidden-them-to-see | folded note palmed low, casual face failing — verb: PASSES-THE-NOTE. |
| 17 | spr-fantasy-kid-wants-stay-up-late-enough-to-catch-the-thing-that-comes-at-night | blanket-caped, wooden spoon as weapon, fighting sleep — unease allowed — verb: KEEPS-WATCH. |
| 18 | spr-fantasy-kid-wants-trade-the-strange-coin-they-found-for-something-they-actually-want | coin held up between two fingers, appraising the viewer — verb: HAGGLES. |
| 19 | spr-fantasy-kid-wants-warn-someone-and-not-one-adult-will-slow-down-long-enough-to-hear-it | mid-shout, tugging at an absent sleeve — verb: WARNS-UNHEARD. |
| 20 | spr-fantasy-kid-wants-win-back-the-friend-who-stopped-coming-around | peace-offering held out (a carved toy, a frog) — verb: OFFERS-BACK. |

---

## After the returns

Chroma removal → despill/dilation → bounds/anchor/scale → canonical isolated renders → blind
visual judge → integrated theater matrix → admission record or typed rejection (§9 Steps E–L).
Generation is never completion; nothing ships without `in-game-pass`; the legacy sprite stays the
fallback until admission.
