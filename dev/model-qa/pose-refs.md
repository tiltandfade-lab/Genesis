# Pose & Form References — model-qa fix/pose waves

Reference notes gathered by web search (vision-read / authoritative-text-read; images NOT downloaded).
Started by the **F2 (Fix wave B)** executor 2026-07-04; the **F3 pose wave** extends this file.

---

## F2 — Fix wave B references

### 1. Strung English longbow (ranger bow rebuild)

**What the model must take from this:** a strung longbow reads as a SINGLE continuous smooth
**C-arc bending toward the string** — NOT an angular `>` chevron. Deepest belly of the curve is at
the center grip/riser; the two limbs sweep away from the grip in one gentle concave-toward-the-string
sweep, tapering from a thick center handle to thin nocked tips. The string is a **straight chord**
running tip-to-tip (nock to nock) — a straight line, never bent. The classic English/Welsh warbow is
a "straight-limb" bow: strung, the whole stave forms one shallow arc; the string goes directly to the
nocks as a straight line. Cross-section is a "D" (flat back toward target, rounded belly toward
archer), but at this poly budget the read that matters is: **one arc, chord string, no kink at the grip.**

- Source: [Bow shape — Wikipedia](https://en.wikipedia.org/wiki/Bow_shape) — "upper limb has a narrow,
  concave curve towards the bowstring… straight-limb bows… string goes directly to the nock."
- Source: [ILAA — Definition of the Longbow](http://longbow-archers-association.org/Definition/)
- Source: [Longbow — Legend Archery](https://legendarchery.com/pages/longbow) — "length, narrow width,
  and gentle curves."

**Model translation:** rebuild the stave as a 3–4 segment arc (bottom→lower-limb→grip→upper-limb→top)
where the mid/grip point bows toward the archer and the tips curve back toward the string, so at the
game dimetric angle the silhouette is a smooth C, not a chevron. String = one straight tube tip-to-tip
(or two collinear segments through the nock at half-draw). No sharp elbow at the grip.

### 2. Baldur's Gate 3 owlbear (owlbear body rebuild — keep the head)

**What the model must take from this:** a **bulky BEAR mass** with a **high shoulder hump**, a
**feather ruff transitioning at the shoulders/neck** (feathers concentrate up toward the head/neck;
fur predominates over the trunk and hindquarters), and **forelimbs heavier than the hind** (big
grasping bear forearms — an owlbear can rotate its forearms like a human, so the forelimbs read as
thick, powerful, forward). Coat is a thick SHAGGY mix of bristly fur + feathers. Adults ~8 ft upright,
up to 1,500 lb — heavy, top-heavy build.

- Source: [Owlbear — Forgotten Realms Wiki](https://forgottenrealms.fandom.com/wiki/Owlbear) (via
  D&D-monster search synthesis) — "bodies of bears covered in thick shaggy coats of both bristly fur
  and feathers… Fur is predominant on their bodies, while feathers become more common at their heads…
  can rotate its forearms as a human could, granting greater strength."
- Source: [BG3 owlbear rework — Bert Vanhengel, ArtStation](https://www.artstation.com/artwork/5voKVE)
  — full mesh rework: feather + fur cards, high shoulder mass, feathered ruff at the neck/shoulders.
- Source: [Owlbear — bg3.wiki](https://bg3.wiki/wiki/Owlbear) — "large feathered bears with the head
  of an owl," 5e-derived physical appearance.

**Model translation:** keep the existing owl head. Rebuild the torso as a heavier low-slung bear mass
with a pronounced shoulder hump (raise + widen the shoulder band, push it up above the neck line),
concentrate the feather-ruff quads at the shoulder/neck seam (fur below), and make the forelimbs
noticeably thicker/heavier than the hind legs. Current model rears too tall and thin with delicate
limbs — bring the mass down and forward, hump up. The head keeps its owl read; only torso/limbs change.

### 3. Sneaky rogue crouch pose (rogue re-pose)

**What the model must take from this:** a **low crouch** (bent knees, lowered center of mass), a
**forward lean** of the torso over the lead leg, and the **dagger held CLOSE to the body** in a
reverse/ice-pick grip — tucked in near the forearm, NOT held out where it reads as sprouting from the
hip. Weight forward, coiled, head lowered. Reverse-grip daggers in rogue/assassin art are held blade-
down close along the forearm.

- Source: [Stealth Pose Reference — Pinterest board](https://www.pinterest.com/ideas/stealth-pose-reference/900280646374/)
  (crouched forward-lean stealth stances).
- Source: [Crouch and Prone — TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/Main/CrouchAndProne)
  (crouch = lowered profile for stealth).
- Source: [Reverse grip for rogues — WoW forums](https://us.forums.blizzard.com/en/wow/t/reverse-grip-for-rougues-and-demon-hunters/1680922)
  — rogues/assassins dual-wield reverse-grip blades held close.

**Model translation:** deepen the crouch (drop hips, bend knees more), pitch the torso forward over
the lead foot, and move the reverse-grip dagger grip UP and IN toward the torso/forearm so the blade
tucks close to the body instead of the current hip-height splay that reads as "dagger sprouting from
the hip" at the hero angle. Keep the twin-dagger modular parts.

---

## F3 — Pose-expressiveness wave references (2026-07-04, `feat/pose-wave`)

**Doctrine (POLISH-WAVE-1 §F3, Adam):** poses that EXPRESS the class beat weapon-swap flexibility.
A re-pose is joint/transform edits on the already-authored part assembly (cheap) — not new geometry.
Every re-posed figure Adam rated good/pretty-good keeps its OG as `<name>-alt1` (alt policy).

**RED-FIRST assessment of the 12 shipped class poses** (captures in `dev/model-qa/captures-pose/`):
clearly STIFF at the dimetric board angle (upright, at-rest, weapon held dead-vertical, no weight
shift or lean) → **paladin, druid, wizard, ranger** (the four re-posed this wave). Already
EXPRESSIVE, left as-is → **barbarian** (wide stance, axe overhead), **rogue** (F2 sneaky crouch),
**monk** (horse-stance, staff diagonal), **sorcerer** (forward lunge, wisp off palm), **warlock**
(raised invoking claw + cradled grimoire, hunched), **bard** (bent-knee performer, lute), **fighter**
(braced guard, sword angled down-forward — reads as a low-point ready), **cleric** (mace up beside
the head, shield across — acceptable ready).

### 1. Paladin — sword/shield "oath-guard" ready stance (re-pose)

**What the model must take from this:** a knight ready-guard reads as a **braced, weight-settled
stance** — feet apart (open, not parallel at-attention), **shield brought UP and FORWARD across the
body** to a guard (not hanging flat at the side), the weapon **cocked/raised ready** rather than a
vertical parade-rest post. FFT-lineage tactical knights present exactly this "planted, shield-forward,
weapon-ready" silhouette — the read is *sworn and set*, not standing at ease. The current paladin is
at-attention: hammer dead-vertical, shield flat at the side, feet together.

- Source: [Knight (Tactics) — Final Fantasy Wiki](https://finalfantasy.fandom.com/wiki/Knight_(Tactics))
  (tactical knight sword-and-shield battle stance) · [FFT minis — Heroine Images](https://heroineimages.tumblr.com/post/637328052889714688/final-fantasy-tactics-minis)
  (per-job silhouette read for the FFT knight/paladin).
- Source: [Final Fantasy Tactics armor — FF Wiki](https://finalfantasy.fandom.com/wiki/Final_Fantasy_Tactics_armor)
  (shields carried by knights/paladins — a raised-guard prop, not a side ornament).

**Model translation:** widen + stagger the leg stance (lead foot forward), raise the shield arm so the
tower/kite shield sits UP and ANGLED FORWARD across the chest as a guard, cant the warhammer OFF
vertical (cocked back/up at the shoulder, ready) instead of the current straight-up post, and add a
slight forward torso set over the lead foot. No new geometry — the shield, hammer, plate, tabard are
authored; this is grip/limb/leg transforms.

### 2. Druid — leaned-on-staff, weathered-elder communing stance (re-pose)

**What the model must take from this:** the canonical druid mini pose is **leaning on the staff** —
weight shifted onto the planted staff, a **slight forward hunch** of a weathered elder, the staff
raked off-vertical to a natural lean (a walking-staff cant, not a flagpole), the free hand loose. The
knotty weathered walking-staff IS the druid read; a druid *rests on* it. The current druid is a
totem: dead-vertical staff, upright robe column, no weight, feet hidden.

- Source: [D&D Druid Leaning on Staff Miniature — Borishotch Industries](https://borishotch-industries.co.uk/products/dungeons-dragons-dragonborn-druid-leaning-on-staff-miniature)
  (the "leaning on staff" pose is a stock druid-mini archetype).
- Source: [A Druid's Staff — esotericmoment](https://esotericmoment.com/2016/06/02/a-druids-staff/)
  ("knotty, weathered walking staff" — the staff is leaned-on, not held ceremonially).
- Source: [Druid concept art / staffs — Pinterest board](https://www.pinterest.com/ideas/druid-concept-art/955808536492/).

**Model translation:** rake the staff off-vertical (top toward the body, foot planted wide of the
disc center) so the grip hand rests HIGH on a leaned shaft; tip the torso into a slight forward hunch
over the staff; shift weight onto the staff-side leg (subtle stagger). The antler headdress + hide
mantle + robe are authored; this is a staff-cant + torso-lean + leg-shift transform.

### 3. Wizard — incantation lean, staff canted + free casting hand raised (re-pose)

**What the model must take from this:** a caster mid-spell reads as **asymmetric and dynamic** —
staff canted/thrust rather than a vertical post, the **free hand raised in a casting gesture** (open
palm / fingers spread toward the fore), and a **slight forward incantation lean**. Reference
spell-casting poses consistently show one hand on the staff and the other hand up and forward,
weaving. The current wizard is a chess-piece: orb-staff dead-vertical, both arms hanging, upright.

- Source: [Male Wizard Casting Spell with Staff pose — theposearchives, DeviantArt](https://www.deviantart.com/theposearchives/art/Male-Wizard-Casting-Spell-with-Staff-Pose-897675316)
  (staff in one hand, other hand casting).
- Source: [Magic Casting Dramatic Hand Up — AdorkaStock, DeviantArt](https://www.deviantart.com/adorkastock/art/Pose-Reference-Magic-Casting-Dramatic-Hand-Up-899895688)
  (raised open casting hand, forward lean).
- Source: [Wizard spell-casting poses — PoseMy.Art](https://posemy.art/wizard-poses/).

**Model translation:** cant the orb-staff off-vertical (top forward, orb leading) and raise the FREE
hand up and forward in an open casting gesture (fingers a spread claw toward the camera-fore); add a
modest forward lean of the robe column over the lead foot. Hat + beard + robe + orb are authored; this
is staff-cant + free-arm-raise + torso-lean. Keep the orb within the staff (no new floating element —
that's the sorcerer's one legal floater; the wizard stays staff-only per mage.js differentiation).

### 4. Ranger — full-draw aiming stance (re-pose; F2 bow kept, F2 state → ranger-alt1)

**What the model must take from this:** an archer at **full draw** reads as a strong **T-silhouette
from the side** — the **bow arm extended straight toward the target**, the **draw hand pulled back to
an anchor at the jaw/cheek**, the **draw elbow raised roughly horizontal**, feet in an open stance
(shoulder-width, staggered), spine upright with the shoulders pulled back through the draw. The string
is drawn to a deep V. This is the ranger's defining action — the current ranger merely *holds* the
(F2-rebuilt, correct C-arc) bow vertical at rest in front of the body, no draw, both hands low.

- Source: [Archery stance & posture, form guide — improveyourarchery](https://improveyourarchery.com/archery-stance-and-posture-form-guide-with-pictures/)
  ("square/open stance, feet shoulder width," "bow arm straight toward target," "T-shape silhouette
  from aside," "draw forearm horizontal or slightly elevated," "shoulders pulled back").
- Source: [Archery draw technique & full draw — Online Archery Academy](https://www.onlinearcheryacademy.com/archery-draw-technique/)
  (anchor at the face; force felt through the bone structure at full draw).
- Source: [Drawing & anchoring the bow — Hunter-Ed](https://www.hunter-ed.com/pennsylvania/studyGuide/Drawing-and-Anchoring-the-Bow/20103901_88578/)
  (anchor point at the corner of the mouth/cheek/jaw).

**Model translation:** rotate the whole figure toward a **bladed side-on stance**, extend the bow
arm out toward the fore holding the (kept F2) C-arc bow VERTICAL-canted out front, and draw the
string hand back to an anchor beside the jaw with the draw elbow up and horizontal — the string pulls
to a deep V, the nocked arrow riding it toward the bow hand. Stagger the feet. The F2 bow geometry
(C-arc stave + straight string chord + nocked arrow) is reused verbatim; only its two grip points and
the arms/legs/torso re-pose. The F2 upright-hold ranger is kept as `ranger-alt1`.
