---
type: design-study
status: OPEN
wave: 10
part: 7
legacy_sections: "11.102-11.120"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Wave 10 — Performance, Device, Input, and Accessibility

Continue the chronological Wave 10 record from
[Part 06](06-party-and-scene-continuity.md). P10.9 is closed on its phased basis. P10.10 and Wave 10 remain open;
no build is authorized.

### 11.102 P10.10 deep-dive setup and F10.10a-F10.10e batch - supported surface, budgets, degradation, input, accessibility

The P10.10 baseline was accepted at section 11.1: measured semantic-invariant quality tiers; 60 fps preferred and
30 fps as the initial hard floor on named reference hardware; 1-2 shadow lights; bounded active citizens; assembly
hidden under a short controlled transition; lower tiers that reduce presentation cost but never canonical truth;
and keyboard/mouse plus touch/controller-compatible focus, text equivalents, scalable UI, non-color cues, reduced
motion, screen-reader/live-region behavior, and fallback representations. F10.6b later closed the viewport proof
matrix at `2560x1440` desktop beauty, `1920x1080` canonical desktop gameplay, and `1194x834` logical-point landscape
tablet, with no full-shell `1024x768` promise.

Those are accepted constraints, not yet a complete release promise. These five numbered questions distinguish a
narrow proof prototype, the playable MVP, and the richer feature goal while keeping exact numeric gates evidence-
driven.

#### 1. F10.10a - which device envelope is actually supported rather than merely captured?

**Option A - desktop release only; tablet remains a non-blocking layout experiment.** The MVP names one desktop
reference machine/browser class and the accepted desktop viewports. This minimizes device/input QA but leaves the
accepted landscape-tablet gate without a shipped interaction promise. Cost is medium desktop measurement and low
cross-device support, with high later responsive migration risk.

**Option B - one named desktop reference tier plus one named landscape-tablet degraded tier (recommended).** The
MVP must pass `1920x1080` gameplay and `2560x1440` beauty on the desktop tier and the `1194x834` logical-point shell
plus backing-scale checks on the tablet tier. The tablet may use lower presentation quality and collapsed secondary
surfaces, but retains the same cast, hazards, exact tactical truth, actions, DM-seat facts, and recovery. Phones,
portrait layouts, and the rejected `1024x768` full shell remain unsupported unless later promoted. Cost is high but
bounded reference-device, browser/GPU, safe-area, touch, DPR, thermal, and regression QA.

**Option C - broadly responsive desktop, tablet, portrait, and phone support from the first playable release.**
This maximizes reach but turns layout, camera, touch, text entry, heat, memory, and accessibility variants into a
large parallel product before the core tray is proven. Cost is very high and permanently multiplicative.

**Prototype/MVP/goal:** the prototype instruments Adam's development machine only; recommended MVP names one
desktop and one landscape-tablet reference tier before its acceptance gate; broader desktop/GPU classes, portrait,
phone, and additional browsers promote only after the core corpus is stable and a product audience justifies them.

#### 2. F10.10b - what frame, response, assembly, and degradation law defines acceptable play?

**Option A - target 30 fps everywhere and tolerate unbounded assembly behind loading.** Cheapest tuning target, but
camera/input response and dense EngagementLens/BattleMat beats can feel poor, while an unbounded “short transition”
is not an executable promise.

**Option B - 60 fps preferred, 30 fps sustained hard floor, with separately measured p50/p95 frame, input,
assembly, and memory gates (recommended).** Exact numbers beyond the accepted 60/30 law lock from telemetry on the
named tiers rather than guesses. If sustained play threatens 30 fps, presentation degrades before semantic content;
scene assembly has a measured transition budget and deterministic low-cost fallback rather than waiting forever.
Committed mechanics and board interaction do not wait for DM-provider prose; model latency is measured separately
and uses the accepted fictional fallback path. Cost is medium-high instrumentation, corpus, threshold, and ongoing
regression work.

**Option C - require locked 60 fps and near-instant assembly on every supported tier.** Excellent feel, but likely
forces premature content/renderer cuts or excludes the tablet before measured evidence shows which cost dominates.
Cost is very high optimization and support work.

**Prototype/MVP/goal:** the prototype records CPU/GPU frame time, frame pacing, assembly phases, memory, and input
latency without claiming release performance; MVP locks measured thresholds and deterministic fallback on both
named tiers; stable 60, wider hardware coverage, faster transitions, and higher refresh become later promotions.

#### 3. F10.10c - what may a lower quality tier remove or simplify?

**Option A - ship one visual configuration and declare unsupported hardware below it.** Simple and visually
consistent, but wastes easy degradations and makes one expensive effect capable of excluding an otherwise playable
device.

**Option B - use explicit semantic-invariant tiers with bounded adaptation (recommended).** Lower tiers may reduce
shadow count/resolution, post-processing, particles, atmospheric density, surface resolution, decorative
multiplicity, ambient crowd representatives, animation flourish, and legal camera candidates. They may not remove
or merge material actors, hazards, routes, connections, exact BattleMat occupancy, cover, custody, known evidence,
object state, or available actions. A low-tier burning doorway may lose embers and a second shadow light, but keeps
blocking/hazard geometry, non-color cue, text equivalent, and the same DM-seat facts. Tier changes use stable scene-
boundary selection or hysteresis rather than visible oscillation. Cost is high tier-contract, fallback, capture,
and combinatorial QA, but maintenance stays bounded by one semantic projection.

**Option C - adapt freely, including aggregating actors/objects or replacing exact relations when performance
falls.** This can save more work per frame, but hardware then changes tactical truth, knowledge, and provider
narration. It creates several games rather than quality tiers.

**Prototype/MVP/goal:** one retained scene proves high/low equivalence for a representative actor, hazard, route,
object, and battle beat; MVP applies the invariant to the core event corpus and named tiers; richer automatic
profiling, more tiers, and measured shader/batching promotions come later.

#### 4. F10.10d - which input modes must be genuinely playable in the MVP?

**Option A - keyboard and mouse only for MVP; controller and touch are accessibility notes or later ports.** This is
the lowest input cost but contradicts the accepted tablet/focus direction and invites mouse-hover assumptions into
cards, targets, cameras, and the DM composer.

**Option B - one action/focus contract with desktop keyboard/mouse and core controller/landscape-touch parity
(recommended).** Pointer, keyboard focus, controller traversal, and touch focus submit the same validated action or
intent ids. Core parity covers scene/citizen/object focus, exact movement and target selection, action submission,
cancel/back, camera controls, card/drawer scrolling, initiative navigation, consequence skip/recenter, and DM-seat
composer access. It does not require identical gestures or a phone UI. The DM model receives the same committed
intent regardless of input. Cost is high focus graph, target sizing, safe-area, text-entry, hint, remapping seam,
and cross-input QA.

**Option C - bespoke fully optimized interfaces for mouse, controller, touch, voice, and every accessibility
device in the first release.** This is the richest destination but too many interaction designs before the shared
action contract proves itself. Cost is very high design, implementation, documentation, and regression work.

**Prototype/MVP/goal:** early proofs may use mouse plus keyboard diagnostics; the playable MVP completes the named
core parity path on desktop and landscape tablet/controller; bespoke ergonomics, broad remapping, voice, portrait,
and specialized-device support remain promoted goals over the same action ids.

#### 5. F10.10e - what accessibility equivalence is a release gate rather than optional polish?

**Option A - preserve semantic data now but defer player-facing accessibility until after the visual MVP.** This
reduces immediate UI work, but focus order, cue semantics, animation dependency, text architecture, and layout may
then require expensive retrofits and some players cannot evaluate the MVP at all.

**Option B - make a bounded semantic-equivalence suite part of the playable MVP gate (recommended).** Core play
requires scalable UI/text within the supported layouts; keyboard/focus navigation; visible focus; color-plus-shape/
text cues; caption/non-audio equivalents; reduced motion that lands on the same terminal truth; screen-reader/
live-region summaries of committed material beats without streaming spam; and truthful top-down or range/
relationship alternatives where the oblique presentation is unusable. Example: after an attack, the accessible
event says who hit whom, damage/state, and resulting hazard/custody change; the DM's prose remains separately
navigable and cannot be the sole mechanics channel. Cost is high semantic adapter, focus, copy, test, localization-
ready, and assistive-technology QA.

**Option C - require comprehensive mature accessibility breadth before the first retained visual proof.** Full
remapping, multiple cognitive presets, exhaustive narration, every specialized controller, and every viewport are
worthy feature goals, but making them prerequisites for the first physical-event proof obscures the renderer's
primary uncertainty. Cost is extremely high and poorly bounded before core interaction stabilizes.

**Prototype/MVP/goal:** one representative room/battle trace first passes no-color, no-audio, reduced-motion,
keyboard/focus, scalable-text, and screen-reader checks; MVP extends semantic equivalence across the core event and
interaction corpus; richer remapping, cognitive presets, narration control, localization, specialized devices,
and broader layouts promote through measured player evidence.

**Codex recommends Option B for all five.** These choices preserve the accepted P10.10 baseline, make “supported”
and “accessible” executable, and avoid either promising every device or reducing the release to one unmeasured
development machine. Their answers may generate exact reference-tier, fallback, input-parity, and accessible-event
follow-ups. P10.10 and Wave 10 remain open.

### 11.103 F10.10a-F10.10e ruling - Mac prototype floor, measured budgets, semantic tiers, keyboard/mouse priority, accessibility gate

Adam used the standing shorthand **“recs are solid”** for Questions 1, 2, 3, and 5, accepting both the recommended
Option B and its prototype -> playable MVP -> ideal/dream pipeline. He amended the device and input details:

1. **F10.10a - the current MacBook Pro is the prototype target.** A read-only hardware census on 2026-07-22
   identifies `MacBookPro15,4`: quad-core 1.4 GHz Intel Core i5, 16 GB RAM, Intel Iris Plus Graphics 645 with 1536 MB
   dynamic VRAM, and a `2560x1600` internal Retina display. This is the named development/prototype machine; it is
   not silently declared the final release minimum or the high-beauty target. The accepted pipeline still names
   actual release tiers from measured evidence rather than marketing labels.
2. **F10.10b - measured 60-preferred/30-floor performance law accepted.** CPU/GPU frame time and pacing, input
   response, assembly, memory, and provider response are measured separately. Presentation degrades before
   semantics; committed mechanics do not wait for model prose; exact release thresholds beyond the accepted law
   remain telemetry outputs rather than questionnaire guesses.
3. **F10.10c - semantic-invariant quality tiers accepted.** Shadows, post, particles, atmosphere, surface
   resolution, decorative/ambient multiplicity, flourish, and camera breadth may scale. Material identity,
   occupancy, hazards, routes, cover, custody, evidence, object state, actions, knowledge, and provider-neutral DM-
   seat facts may not. Adam asked whether a VM/cloud service can test high-end 2026-level beauty that the Mac cannot
   run; section 11.104 records the service answer and its evidence limits.
4. **F10.10d - keyboard and mouse come first; voice is a close third.** This amends rather than accepts the proposed
   controller/landscape-touch MVP parity. The shared action/focus ids and non-pointer seams remain valuable, but the
   exact boundary between prototype order, playable MVP input support, tablet status, voice, controller, and touch
   requires the generated questions below. Voice may never gain direct mechanics authority merely by being early.
5. **F10.10e - bounded semantic accessibility equivalence accepted as an MVP gate.** The prototype proves one
   representative no-color/no-audio/reduced-motion/keyboard/scalable-text/screen-reader trace; MVP extends the
   equivalence to the core corpus; richer remapping, cognitive presets, narration controls, localization,
   specialized devices, and broader layouts remain promoted goals.

### 11.104 Current service answer - use cloud GPU as a beauty oracle, not a substitute release device

Yes: Genesis can test high-end browser graphics without buying a new workstation, but no single VM service proves
all of P10.10.

- **Fastest manual high-beauty lane - [airgpu](https://airgpu.com/).** It provides remotely streamed Cloud PCs on
  which arbitrary software can be installed. Its current posted starting prices are `$0.90/hour` for an NVIDIA L4
  described as roughly RTX 4060-class, `$1.05/hour` for A10G/roughly RTX 3080-class, and `$1.20/hour` for
  L40S/roughly RTX 4080-class, plus persistent storage. Start with L4 for ordinary high-tier profiling; use L40S
  only as a dream-beauty/headroom oracle. Record CPU/GPU/browser timing *inside the remote machine*. Parsec/Moonlight
  stream latency and compression may judge working feel and captured image quality, but they are not Genesis frame
  time.
- **Repeatable automation lane - [AWS EC2 G6](https://aws.amazon.com/ec2/instance-types/g6/).** G6 supplies NVIDIA
  L4 GPU instances, graphics/gaming drivers, and GPU pass-through that AWS describes as comparable to bare-metal.
  A fixed image/region/instance/browser/driver combination is a stronger later reference for scripted corpus runs
  than whichever consumer-like Cloud PC happens to be available, though setup and cost control are more involved.
- **Tablet/Safari/touch lane - [BrowserStack Real Device Cloud](https://www.browserstack.com/real-device-cloud).**
  BrowserStack offers real iOS/Android hardware and its
  [Local tunnel](https://www.browserstack.com/docs/live/local-testing) can reach a localhost or private Genesis
  build. Use it for Safari behavior, logical/backing size, safe areas, touch/focus, rotation, and functional
  accessibility. **Inference:** because Genesis does not control device thermal state, lab scheduling, remote
  streaming, or provider instrumentation, these sessions should not be the sole authoritative frame-time/thermal
  release gate; confirm any claimed tablet performance floor on a named physical device or a service that exposes
  trustworthy device-side telemetry.
- **Assistive-technology lane - [Assistiv Labs](https://assistivlabs.com/).** It exposes real NVDA, JAWS,
  VoiceOver, TalkBack, Windows High Contrast, and debugging tools remotely, including localhost/private staging
  through a tunnel. This is appropriate for manual screen-reader/focus verification from the Mac, not GPU beauty
  benchmarking.

The recommended test topology is therefore **local Mac low-tier truth + rented GPU high-tier oracle + later real
tablet functional proof + assistive-technology proof**. A cloud L4/L40S result may prove that a high tier is
possible; it never proves that the Mac or a consumer tablet can run that tier. Conversely, the Mac choking on the
beauty tier does not license removal of canonical state; it should select a truthful lower presentation tier.

### 11.105 F10.10a.1-F10.10e.1 generated follow-up batch - Mac floor, cloud authority, input cut, voice, accessible events

#### 1. F10.10a.1 - what must the current Intel MacBook Pro prove?

**Option A - require the Mac to prove the high-beauty target at 60 fps.** This gives one simple local gate but lets
an older integrated GPU cap Genesis's visual destination before the composition/material/effect stack is measured.
Cost is high visual compromise and optimization pressure on every experiment.

**Option B - make the Mac the prototype low-tier semantic and interaction floor, not the beauty ceiling
(recommended).** The retained room must keep canonical mechanics, exact BattleMat legality, readable figures,
hazards, routes, actions, DM-seat interaction/fallback, save/recovery, and the bounded accessibility trace usable
through a truthful low tier. It instruments frame/assembly/memory behavior and aims toward the accepted 30 fps
floor, but a cloud/reference high tier owns full 2026 beauty and 60-preferred evidence. Exact Mac numeric release
gates lock only after the real fixture exists. Cost is medium tier/fallback work and prevents either visual
abandonment or an impossible local beauty mandate.

**Option C - treat the Mac only as an editor/launcher with no runtime acceptance duty.** This maximizes beauty
freedom but allows the core loop to become unusable on the one machine that develops and tests it most often.

**Prototype/MVP/dream:** prototype runs the retained low-tier room end to end on the Mac; MVP later names its actual
supported desktop minimum separately and proves the same semantic corpus; dream/high tiers restore measured beauty
without branching world truth.

#### 2. F10.10c.1 - what authority should the cloud GPU lane have?

**Option A - make one cloud GPU VM the authoritative release target.** Reproducible and powerful, but a datacenter
L4/L40S is not the player's consumer Mac/PC/tablet and can hide weak degradation or CPU/device behavior.

**Option B - use the cloud as a fixed high-tier beauty/performance oracle beside local and real-device floors
(recommended).** Begin manually with an hourly airgpu L4; add an AWS G6 image only when repeatable automated corpus
runs justify its setup. The same canonical fixture and telemetry schema run locally and remotely. In-VM frame time,
assembly, memory, and deterministic captures are evidence; network streaming latency is separately labeled. Cost is
low-medium during experiments and medium later for image/driver/corpus maintenance.

**Option C - buy or maintain a broad physical hardware lab before the renderer proof.** Most representative, but
large capital and maintenance cost before the target or bottleneck is stable.

**Prototype/MVP/dream:** prototype rents a GPU only for short same-state profiling/captures; MVP has named local,
high-tier, and any supported real-device gates; dream expands the hardware matrix only from audience and telemetry
evidence.

#### 3. F10.10d.1 - how long does “keyboard and mouse first” last?

**Option A - only the earliest proof may be keyboard/mouse-first; controller and landscape touch must reach core
parity before the playable MVP.** This preserves the earlier P10.10 baseline and tablet support, but puts substantial
focus/touch work back on the first release path before voice.

**Option B - keyboard/mouse define the first playable MVP; voice is the next input promotion, while controller and
touch retain shared action/focus seams for a later gate (recommended from Adam's priority).** The accepted tablet
viewport remains a layout/semantic/functional proof but is not called a fully supported playable touch release
until touch lands. An external keyboard/trackpad may exercise it without laundering that into touch support. Cost
is low-medium first-input work and honest narrowing of the device promise; later input promotion remains high QA.

**Option C - keyboard/mouse and voice both gate the first playable MVP; controller/touch remain later.** This honors
voice priority most aggressively but puts microphone, transcription, privacy, correction, and fallback work on the
core path before ordinary typed play is proven.

**Prototype/MVP/dream:** prototype proves all actions with keyboard/mouse and complete focus ids; recommended MVP
ships that path; voice promotes next; controller/touch and specialized devices promote afterward without changing
action authority.

#### 4. F10.10d.2 - what is the first canonical form of voice input?

**Option A - rely on operating-system/browser dictation into the existing text field and add no Genesis voice
feature.** Very cheap and useful as a temporary accessibility/development path, but availability and correction UX
vary and Genesis cannot provide a consistent push-to-talk contract.

**Option B - push-to-talk speech-to-text creates an editable intent draft that uses the existing parser/validator
(recommended).** The player sees and may correct the transcript before submission; committed actions use the same
intent/action ids as typing. Recognition may use a locally available adapter or an explicitly consented remote
adapter, but audio/transcript privacy, timeout, failure, and typed fallback are visible. The browser
`SpeechRecognition` API may be a prototype adapter, not the sole product dependency: current MDN documentation
marks it limited across major browsers and notes that some implementations send audio to a remote service. Cost is
medium capture/permission/transcription/draft/recovery work and low mechanics risk.

**Option C - an always-listening voice DM interprets and directly commits actions in real time.** This is a strong
dream interaction but carries very high consent, false-positive, interruption, privacy, provider, accessibility,
and player-agency risk. Even the dream must validate canonical actions; voice never becomes mechanics authority.

**Prototype/MVP/dream:** OS dictation can exercise the seam immediately; the named voice promotion adds
push-to-talk editable drafts; later natural turn-taking, read-aloud response, interruption, and richer conversation
may grow over the same explicit commit boundary.

#### 5. F10.10e.1 - how should screen readers and text equivalents announce dense event sequences?

**Option A - announce every low-level receipt immediately.** Mechanically exhaustive, but attacks, reactions,
damage, conditions, movement, custody, and hazard receipts can become an unusable wall of interrupting speech.

**Option B - announce dependency-complete causal beats with a queryable exact log (recommended).** A grouped update
might say, “Goblin 2 opens the east door; Mara's readied arrow hits for 7; Goblin 2 falls in the doorway; the door
remains open.” The live region reports viewpoint-known terminal consequences in causal order; the player may
inspect exact component receipts, adjust verbosity, pause/replay presentation, or skip to terminal truth. DM prose
is separately navigable and never the only mechanics channel. Cost is medium-high grouping/copy/verbosity/focus/
assistive-technology QA and reuses the accepted consequence dependency graph.

**Option C - announce only the DM's narration.** Cleanest listening experience when prose succeeds, but provider
variation, latency, omission, or poetic ambiguity can hide mechanics and make accessibility provider-dependent.

**Prototype/MVP/dream:** one retained combat causal group proves live-region and exact-log equivalence; MVP covers
the representative core event families and interruption/recovery; dream adds user profiles, richer spatial audio/
narration, localization, and assistive-device breadth.

**Codex recommends Option B for all five.** Questions 1-2 make the Mac/cloud relationship honest; Questions 3-4
resolve Adam's input priority without silently preserving or deleting the tablet promise; Question 5 makes the
accepted accessibility floor usable during real combat rather than merely complete on paper. P10.10 and Wave 10
remain open, and answers may generate exact reference-tier or voice/privacy follow-ups.

### 11.106 F10.10a.1-F10.10e.1 ruling - Mac low-tier truth, later cloud oracle, keyboard/mouse MVP, confirmed voice drafts, configurable accessible beats

Adam accepted **Option B and its prototype -> playable MVP -> ideal/dream pipeline for all five questions**.

1. **F10.10a.1 - the current Intel MacBook Pro is the prototype low-tier semantic and interaction floor, not the
   beauty ceiling.** The retained room must remain a truthful game there: canonical mechanics, exact BattleMat
   legality, readable material actors/hazards/routes/actions, provider-neutral DM-seat interaction/fallback,
   persistence/recovery, and the bounded accessibility trace. High-tier beauty and 60-preferred evidence belong to
   later named reference hardware; exact Mac numeric gates wait for the real retained fixture.
2. **F10.10c.1 - the rented cloud GPU is a later high-tier oracle, not current setup or release authority.** Adam
   explicitly places this far down the development line. No subscription, VM image, or cloud matrix precedes the
   connected local room/BattleMat/EngagementLens proof and its instrumentation. When high-tier profiling becomes
   material, start with short manual L4-class sessions; build an automated fixed image only after repeated corpus
   work earns its maintenance cost.
3. **F10.10d.1 - keyboard/mouse defines the first playable MVP; voice promotes next.** Controller and touch retain
   action/focus-compatible seams but are later gates. The accepted landscape-tablet viewport remains a layout,
   semantic, and functional proof rather than a promised fully playable touch release until touch actually lands.
4. **F10.10d.2 - the first Genesis voice feature is push-to-talk speech-to-text into an editable intent draft.** The
   transcript uses the same parser, validator, and commit boundary as typing. OS dictation may scaffold it; a
   locally available or explicitly consented remote recognizer may later implement it. Voice never directly owns
   mechanics, and richer natural turn-taking remains a promoted goal.
5. **F10.10e.1 - accessible event delivery groups dependency-complete causal beats and preserves a queryable exact
   log.** Adam added that blind players need settings and options. Genesis therefore does not impose one universal
   announcement stream or monolithic “blind mode.” Player-owned verbosity, pacing, spatial detail, focus, replay,
   and related controls are part of the accessibility contract and are refined below.

This accessibility amendment agrees with the current W3C direction without treating minimum conformance as the
whole game design. [WCAG 2.2 status-message guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)
requires important changes to be programmatically available without unnecessarily stealing focus, warns that live
regions can become too chatty, and recommends user testing for the right feedback level. The
[WAI-Adapt overview](https://www.w3.org/WAI/adapt/) explicitly supports personalization to individual needs and
preferences. Genesis should therefore offer useful starter configurations plus independent controls, then test
them with blind and low-vision players and real assistive technology.

Adam also changed the discussion cadence: future batches contain **ten numbered questions at a time** unless fewer
than ten material questions remain in the active family.

### 11.107 F10.10a.2-F10.10e.4 generated ten-question batch - hardware gates, telemetry, loading, tier control, memory, remapping, voice privacy, blind-player options

#### 1. F10.10a.2 - when should Genesis name its actual release hardware tiers?

**Option A - name minimum and recommended machines now from market labels.** Easy to communicate, but “modern
MacBook” or “RTX-class PC” says little about the unbuilt scene's CPU, GPU, memory, browser, and thermal behavior.

**Option B - name tiers only after one retained representative corpus runs on the Mac and one materially different
candidate device (recommended).** The prototype first produces comparable frame/assembly/memory telemetry. The MVP
gate then names a minimum supported desktop, a preferred desktop/high tier, and any truly supported additional
device by reproducible hardware/OS/browser/driver facts. Cost is medium procurement/rental and corpus QA, but the
promise is evidence rather than aspiration.

**Option C - publish capability detection only and never name reference hardware.** Flexible, but support,
reproduction, and player expectations become difficult when the same nominal tier behaves differently.

**Prototype/MVP/dream:** prototype records the Mac fingerprint and fixture; MVP names measured minimum/preferred
tiers; dream expands the matrix from actual audience and failure data.

#### 2. F10.10b.1 - what statistic decides whether a frame-rate gate passes?

**Option A - average FPS over a whole session.** Cheap, but long quiet periods can hide combat spikes and bad input
feel.

**Option B - phase-specific frame-time distributions plus a sustained floor (recommended).** Record CPU and GPU
p50/p95, slow-frame count, frame-pacing runs, input-to-visible response, and sustained-under-floor intervals for
representative exploration, dense battle, EngagementLens, transition, and aftermath phases. One driver hiccup is
diagnostic rather than an automatic release failure; repeatable spikes fail their owning phase. Cost is medium
telemetry/schema/dashboard work and high honesty value.

**Option C - fail on the single worst frame.** Strict, but shader compilation, browser scheduling, capture tools,
and OS noise can dominate the result and reward gaming the harness rather than improving play.

**Prototype/MVP/dream:** prototype captures distributions without thresholds; MVP locks per-phase gates on named
hardware; dream adds longitudinal field telemetry only with explicit privacy and product justification.

#### 3. F10.10b.2 - how should scene assembly behave when it misses its transition budget?

**Option A - keep the player in a loading transition until full quality is ready.** Simple and visually complete,
but “short controlled transition” can become an unbounded stall.

**Option B - use a measured deadline and deterministic staged fallback (recommended).** Canonical scene truth
commits independently. If the preferred tray misses its evidence-set budget, Genesis mounts truthful low-cost
geometry/sprites/materials/cards first, restores interaction, and enriches only through presentation-safe swaps.
Failure, cancel, backgrounding, and reload converge on the same terminal scene. Cost is medium-high assembly-state,
fallback, cache, and recovery QA.

**Option C - stream arbitrary partial geometry into live play as it arrives.** Fast apparent startup, but collision,
occlusion, focus, and player interpretation can drift while the board changes underneath an action.

**Prototype/MVP/dream:** one retained scene deliberately exceeds its budget and falls back correctly; MVP covers
the core scene families; dream shortens or hides the transition without making complete beauty a mechanics gate.

#### 4. F10.10c.2 - who chooses the quality tier?

**Option A - opaque automatic selection.** Lowest user burden, but a transient slowdown can silently remove desired
effects or oscillate between grades.

**Option B - player-visible `Auto`, named lower tiers, and named higher tiers over one invariant contract
(recommended).** Auto benchmarks or observes measured pressure and changes presentation only at safe boundaries
with hysteresis; the player may pin or override it. Settings explain what visual categories change and never imply
that mechanics, cast, hazards, evidence, or actions change. Cost is medium settings, capability, hysteresis, and
support work.

**Option C - fully manual quality controls with no automatic help.** Maximum control, but players must diagnose
frame, memory, and thermal problems themselves.

**Prototype/MVP/dream:** prototype has a developer high/low switch; MVP exposes a small understandable tier menu;
dream adds measured per-feature advice and broader hardware profiles without a wall of obscure toggles.

#### 5. F10.10c.3 - what happens under memory or thermal pressure?

**Option A - wait for a crash, tab reload, or severe slowdown, then suggest lowering quality.** Cheap but loses
continuity and makes recovery device-dependent.

**Option B - enforce presentation budgets and evict/reduce only rebuildable visual resources at safe boundaries
(recommended).** Texture/model/effect caches, shadow resources, decorative representatives, and dormant adapter
presentation may unload deterministically. Canonical scene/site/cold state, ids, receipts, knowledge, custody, and
recovery never disappear. Thermal or memory pressure can recommend or enter a lower tier with a visible reason and
stable return policy. Cost is high resource accounting, disposal, remount, soak, and device QA.

**Option C - discard whole old scenes or aggregate world citizens when memory is tight.** This saves more memory
but converts hardware pressure into history, identity, and simulation loss.

**Prototype/MVP/dream:** prototype proves repeated mount/unmount without growth or state loss; MVP survives a
bounded long-session soak on named hardware; dream adds finer predictive budgeting and cache warming.

#### 6. F10.10d.3 - how configurable must keyboard and mouse controls be?

**Option A - one fixed binding scheme.** Lowest work, but conflicts with player hardware, motor needs, and future
input adapters.

**Option B - remappable semantic commands with a complete non-hover path (recommended).** Movement/camera, focus
navigation, confirm/cancel, object/action access, initiative, consequence controls, DM composer, drawers/log, and
accessibility commands bind to semantic actions rather than DOM handlers. Genesis detects conflicts, preserves
reset/recovery, and never makes hover, drag, rapid repeat, or a chord the only route to a core action. Cost is
medium-high command registry, settings, prompt, conflict, migration, and QA work.

**Option C - expose arbitrary macros that can chain several game actions.** Powerful, but can bypass timing,
validation, interruption, and player-agency boundaries unless reduced back to one validated intent.

**Prototype/MVP/dream:** prototype builds the command registry and default bindings; MVP permits core remapping and
keyboard-only completion; dream adds shareable profiles and specialized-device adapters without action macros
owning mechanics.

#### 7. F10.10d.4 - what voice privacy and recognition choice does the player receive?

**Option A - use one remote speech service whenever voice is enabled.** Consistent integration, but audio leaves
the device without a meaningful product choice and provider availability becomes input availability.

**Option B - explicit `Off`, locally available, and consented remote recognition policies (recommended).** Voice is
push-to-talk with a persistent recording indicator, editable transcript, typed fallback, timeout/cancel, and clear
disclosure of what audio/transcript leaves the device and whether anything is retained. Local recognition may be
preferred when available; remote use is opt-in and replaceable. Cost is high adapter/privacy/permission/failure/
documentation QA but low mechanics risk.

**Option C - always listen and infer when the player is addressing Genesis.** Smooth when perfect, but very high
privacy, false-activation, household-audio, interruption, performance, and trust cost.

**Prototype/MVP/dream:** OS dictation proves voice-shaped drafts; the first Genesis voice promotion adds explicit
push-to-talk policy and adapter fallback; dream adds natural turn-taking only with equally visible consent and
commit control.

#### 8. F10.10e.2 - how should blind and low-vision accessibility settings be organized?

**Option A - one `Blind Mode` toggle.** Easy to discover but assumes all blind players want the same verbosity,
focus, spatial detail, pacing, sound, and DM readback.

**Option B - starter presets plus independent persistent controls (recommended).** Optional presets such as
`Screen Reader`, `Low Vision`, `Reduced Motion`, or a player-named profile set useful initial values without locking
them together. Independent settings cover event verbosity, spatial detail, automatic focus announcements,
presentation pace, interruption, replay, exact-log retention, DM prose readback, caption/audio redundancy, UI/text
scale, contrast, motion, and sound cues. Cost is high settings/topology/test-matrix work, bounded by semantic groups
and retained profiles rather than arbitrary per-widget flags.

**Option C - expose every raw accessibility and renderer parameter with no presets.** Flexible but difficult to
discover, explain, test, or recover.

**Prototype/MVP/dream:** prototype proves one screen-reader preset and manual overrides; MVP persists a small set of
independent semantic controls per player profile; dream adds community-tested presets, migration, import/export,
and richer individual adaptation.

#### 9. F10.10e.3 - what nonvisual spatial interface lets a blind player act tactically?

**Option A - rely on DM narration and natural-language questions.** Immersive but slow, provider-variable, and
unable to guarantee exact reachable cells, hazards, cover, routes, and targets.

**Option B - provide a queryable semantic spatial navigator over BattleMat truth (recommended).** Keyboard/voice
commands can enumerate or filter the main PC, allies, enemies, objectives, adjacent cells/relations, portals,
hazards, cover, reachable destinations, legal targets, and route summaries using stable speakable labels and the
same validated movement/target ids as the visual board. Detail is user-controlled; hidden facts remain hidden. The
DM seat may explain results but is not the source. Cost is high spatial-query, ordering, language, focus, path-
summary, and blind-player testing work, but it makes exact tactics genuinely playable rather than merely narrated.

**Option C - use spatial audio cues as the sole alternative board.** Potentially elegant, but hearing differences,
speaker/headphone setups, crowded scenes, and exact-distance/route needs make audio alone unreliable.

**Prototype/MVP/dream:** one retained room exposes a keyboard-readable actor/hazard/route/target tree and commits
one legal move/attack; MVP covers the core combat/exploration corpus; dream adds optional spatial audio, richer
natural queries, and personalized summarization over the same truth.

#### 10. F10.10e.4 - how are accessibility settings discovered, saved, and changed safely?

**Option A - put them only in the ordinary settings menu and save them per browser.** Cheap but hard to discover
before the opening flow and fragile across devices/profiles.

**Option B - optional first-run accessibility setup plus an always-reachable settings path and per-player profile
persistence (recommended).** Never infer blindness or force a preset because a screen reader is detected. The
opening flow offers keyboard-accessible setup, test announcements, preview/revert, reset, and “change later.”
Settings survive save/load and migrate by semantic id; device-specific performance choices stay distinguishable
from player accessibility preferences. Cost is medium-high onboarding/profile/migration/recovery QA.

**Option C - automatically detect assistive technology and switch the interface.** Convenient for some, but
misclassification, shared machines, privacy, and unexpected layout/verbosity changes remove player control.

**Prototype/MVP/dream:** prototype exposes a direct dev/settings route and saved test profile; MVP includes optional
first-run setup, preview/revert, reset, and profile persistence; dream adds portable profiles and guided tuning
grounded in real player testing.

**Codex recommends Option B for all ten.** The batch turns the accepted performance and accessibility direction
into measurable, configurable, provider-neutral contracts without forcing cloud setup now or pretending one blind-
player configuration fits everyone. Answers may generate exact tier thresholds, spatial-query, or settings-
migration follow-ups. P10.10 and Wave 10 remain open.

### 11.108 F10.10a.2-F10.10e.4 ruling - measured tier evidence, anti-pop staged loading, player control, private voice, and nonvisual tactics

Adam accepted **Option B and its prototype -> playable MVP -> ideal/dream pipeline for Questions 1, 2, and 4-10**.
For Question 3, he accepted the ordinary industry need for LOD/mip streaming on slower hardware but rejected
conspicuous texture pop-in. That is recorded as **Option B with the anti-pop amendment below**, not as permission
for an incomplete-looking or mechanically changing room.

1. **F10.10a.2 - Genesis names release hardware tiers only after one retained representative corpus runs on the
   current Mac prototype and one materially different candidate device.** Labels and thresholds come from
   reproducible hardware/OS/browser facts and measured behavior, not aspirational market categories.
2. **F10.10b.1 - performance gates use phase-specific frame-time distributions plus a sustained floor.** CPU/GPU
   p50/p95, slow-frame runs, input response, and sustained-under-floor intervals remain distinct evidence for
   exploration, dense battle, EngagementLens, transition, and aftermath.
3. **F10.10b.2 - a missed assembly budget mounts one coherent lower-cost scene before restoring interaction.**
   Genesis may use ordinary mip and visual-only LOD streaming, but the anti-pop law is:
   - collision, tactical geometry, actors, hazards, routes, targets, and legal actions are exact before reveal;
   - visible surfaces have an acceptable base material/mip before reveal: no checkerboards, blank walls, false
     material identity, or half-mounted room;
   - background work may sharpen the same material or refine a visual-only LOD without changing canonical ids,
     collision, cover, occlusion obligations, navigable silhouette, or the player's tactical reading;
   - an imperceptible refinement may occur live; a noticeable swap waits for a safe transition, uses a governed
     fade/crossfade where appropriate, or does not occur at all during that mounted scene;
   - when higher detail is late, the coherent lower tier remains mounted instead of repeatedly popping or
     recomposing the room.

   This matches the purpose of common streaming systems without accepting their worst artifact as the goal.
   Unreal's current documentation describes texture streaming as selecting and raising/lowering precomputed mip
   resolution within a memory budget, prioritizing visible mips, and prestreaming before first visibility to avoid
   low-resolution appearance; [KTX 2](https://www.khronos.org/ktx/) likewise supports mipmapped, GPU-ready texture
   delivery. The later cache/container/compression implementation belongs to P10.11. P10.10 owns the perceptual
   deadline and the semantic-invariance law. See also Epic's [Texture Streaming Overview](https://dev.epicgames.com/documentation/unreal-engine/texture-streaming-overview-for-unreal-engine?lang=en-US)
   and [streaming metrics guidance](https://dev.epicgames.com/documentation/unreal-engine/reporting-texture-streaming-metrics?application_version=4.27).
4. **F10.10c.2 - quality selection exposes `Auto` plus named lower/higher tiers and a player override.** Auto changes
   presentation only, with hysteresis and safe boundaries; no tier changes mechanics, cast, hazards, evidence, or
   actions.
5. **F10.10c.3 - memory or thermal pressure evicts only rebuildable presentation resources.** Canonical site,
   scene, identity, receipt, custody, knowledge, and recovery state remain intact; any visible tier reduction has a
   reason and stable return policy.
6. **F10.10d.3 - keyboard/mouse controls bind remappable semantic commands and provide a complete non-hover path.**
   No core action requires hover, drag, rapid repeat, or a chord, and binding conflicts have recovery/reset.
7. **F10.10d.4 - voice offers explicit `Off`, locally available, and consented remote recognition policies.**
   Push-to-talk, recording state, editable transcript, typed fallback, and disclosure remain provider-neutral
   requirements.
8. **F10.10e.2 - accessibility uses optional starter presets plus independent persistent controls.** A preset may
   establish useful defaults but never becomes one locked universal blind-player configuration.
9. **F10.10e.3 - blind players receive a queryable semantic spatial navigator over BattleMat truth.** Stable
   keyboard/voice-accessible actor, hazard, route, destination, and target ids support exact legal action without
   making DM prose or spatial audio the mechanics source.
10. **F10.10e.4 - accessibility setup is optional on first run, always reachable later, previewable/revertible, and
    stored per player profile.** Genesis does not infer blindness or silently switch modes from assistive-technology
    detection.

These rulings preserve the current Intel MacBook Pro as the first prototype truth target while refusing to turn
its constraints into the high-beauty ceiling. They also keep provider-neutral DM-seat narration downstream of
canonical performance, input, privacy, and accessibility state. The following generated batch closes the material
behavioral seams exposed by these answers before a P10.10 closure audit.

### 11.109 F10.10a.3-F10.10e.7 generated ten-question batch - tier language, anti-pop boundaries, reveal readiness, quality recovery, citizen budgets, focus, voice correction, audio channels, spatial ordering, and human accessibility proof

#### 1. F10.10a.3 - how should Genesis describe hardware and quality tiers to players?

**Option A - name tiers only by hardware class, such as `Intel Mac` or `RTX PC`.** Easy marketing shorthand, but a
browser, resolution, driver, thermal state, and scene can make the same label behave very differently. In a dungeon,
the player cannot tell whether lowering the tier changes shadows, crowd density, or tactical truth. Cost is low.

**Option B - use outcome-based quality names backed by measured reference examples (recommended).** Settings name
the visual result, such as `Readable`, `Tabletop`, and `Showcase`, explain which presentation categories change, and
show `Auto`'s current choice. A support panel may list the measured Mac/reference fingerprint without turning a
brand into a guarantee. In the dungeon, `Readable` keeps every door, hazard, route, actor, and material identity but
reduces texture resolution, shadows, decorative representatives, and effects. The provider-neutral DM seat receives
the same canonical room either way. Cost is medium copy, capability reporting, localization, and support QA.

**Option C - expose raw renderer knobs only.** Expert players can tune texture size, shadow maps, draw distance, and
effects individually, but most players cannot infer which combinations are stable or accessibility-safe. Cost is
high settings/test-matrix work.

**Prototype/MVP/ideal:** prototype uses developer `low/high` labels; MVP exposes a small outcome-based tier menu
after retained-corpus measurement; ideal adds tailored advice and measured reference examples without promising
identical beauty on every nominally similar device.

#### 2. F10.10b.3 - when may streamed texture or visual LOD detail visibly refine after a scene is revealed?

**Option A - refine immediately whenever each asset arrives.** A dungeon wall, altar, and ogre sharpen at different
moments; this maximizes throughput but produces the pop Adam dislikes. DM-seat prose stays truthful, yet the visual
room looks unstable. Cost is low implementation and high aesthetic debt.

**Option B - allow only imperceptible live refinement; govern noticeable changes at safe visual boundaries
(recommended).** Same-material mip sharpening or silhouette-stable mesh refinement may happen live only when it
does not draw attention. A noticeable altar relief or large wall change waits for a door transition, camera reframe,
occlusion, or short crossfade; otherwise the coherent lower tier remains. Collision and tactics never change, and
the DM seat never describes detail solely because a high LOD loaded. Cost is medium transition classification,
prefetch, fade, and capture QA.

**Option C - prohibit every live visual refinement.** Each mounted room is perfectly stable, but quality can remain
unnecessarily low after a brief loading spike and cache reuse becomes less effective. Cost is medium remount/cache
policy and lost quality opportunity.

**Prototype/MVP/ideal:** prototype deliberately delays one wall and one large prop and proves stable low-tier
reveal; MVP classifies safe live versus boundary-only upgrades for representative assets; ideal makes most upgrades
invisible through prediction, prestreaming, and mature transitions.

#### 3. F10.10b.4 - what must be ready before Genesis reveals an interactive dungeon scene?

**Option A - require only collision and let presentation catch up.** The player can technically move, but may meet
blank floors, missing enemies, or an invisible hazard while the DM seat already narrates the room. Cost is low and
truth risk is severe.

**Option B - require a semantic reveal set plus coherent base presentation (recommended).** Before the door opens,
Genesis has exact collision/topology, material actors, hazards and known cues, routes/targets/actions, focus order,
base surfaces/material identities, readable lighting/value structure, input affordances, accessible spatial labels,
and a truthful DM-seat fallback. Decorative dressing, expensive effects, high mips, and ambient representatives may
arrive later under the anti-pop law. Cost is medium-high readiness manifests, timeout/fallback, and parity QA.

**Option C - wait for every preferred asset and effect.** The room always debuts at full beauty, but one optional
torch effect or high mip can create an unbounded loading door. Cost is high latency, cache, and failure sensitivity.

**Prototype/MVP/ideal:** prototype defines the reveal set for one retained room; MVP covers the core room/battle/
aftermath families and recovery; ideal prefetches likely next scenes so the semantic set and preferred beauty are
usually ready together.

#### 4. F10.10c.4 - how should `Auto` quality lower and later restore detail?

**Option A - react to every short frame-rate dip.** A spell burst may make the dungeon oscillate between tiers and
pop shadows or texture detail repeatedly. Cost is low logic and high instability.

**Option B - use sustained evidence, hysteresis, safe boundaries, and a visible recovery policy (recommended).**
Auto lowers only after repeatable pressure, records why, waits longer before restoring, and applies noticeable
changes at a transition or governed reframe. A player pin wins until explicitly returned to Auto. The DM seat may
acknowledge a technical pause only through a provider-neutral system message; it never fictionalizes performance
pressure. Cost is medium-high telemetry, state, UX, and soak QA.

**Option C - Auto may lower quality but never restore it during a session.** Stable after degradation, but one early
thermal or browser spike can hold the entire dungeon below the device's later capacity. Cost is low-medium and
quality loss is high.

**Prototype/MVP/ideal:** prototype logs recommendations without changing quality; MVP uses conservative tier-level
hysteresis and player override; ideal adds per-feature advice and prediction after field evidence, without opaque
continuous thrashing.

#### 5. F10.10c.5 - how should performance tiers reduce crowds and decorative citizens without erasing identity?

**Option A - remove the farthest NPCs until the frame budget passes.** In a crypt battle this might delete a named
prisoner or witness from view even though the DM seat still knows them. Cost is low and continuity risk is high.

**Option B - preserve every material citizen and reduce only certified ambient presentation (recommended).** Named,
noticed, interacted-with, evidence-bearing, hostile, obligated, or mechanically relevant citizens retain stable ids
and truthful projections. A low tier may reduce anonymous crowd representatives, distant decorative animation, or
effects while preserving aggregate population truth and promotion rules. The provider-neutral DM seat receives the
same material cast and may describe ambient scale without inventing missing individuals. Cost is medium
classification, promotion, representative pooling, and cross-tier QA.

**Option C - keep every citizen fully rendered and reduce only texture/effect quality.** Identity is safe, but dense
town or summoned-crowd cases can remain CPU/animation bound. Cost is low policy and potentially high performance.

**Prototype/MVP/ideal:** prototype tags material versus ambient representatives in one retained crowd; MVP proves
promotion and tier switches without identity loss; ideal supports richer aggregate crowds and animations within
measured budgets.

#### 6. F10.10d.5 - how should keyboard focus arbitrate among the BattleMat, DM composer, drawers, and modal choices?

**Option A - let ordinary browser tab order and last click decide.** Cheap, but opening an object card can strand
focus, a DM reply can steal the insertion point, and Escape may close the wrong layer. Cost is low and keyboard-only
risk is high.

**Option B - use an explicit focus stack and semantic return target (recommended).** Opening the locked sarcophagus
card moves focus to its heading and legal actions; closing it returns to the same BattleMat object/cell. The DM
composer retains its draft while consequences arrive, modals trap focus only while truly modal, and Escape/Back has
one announced result. Provider prose never steals focus merely by arriving. Cost is medium-high focus-state,
component, announcement, and browser/assistive-technology QA.

**Option C - reserve separate fixed keyboard modes for board, DM, and menus.** Predictable for experts, but mode
errors and hidden switching burden new, motor-impaired, and screen-reader users. Cost is medium command/help QA.

**Prototype/MVP/ideal:** prototype proves board -> object card -> board and composer preservation; MVP covers core
surfaces, recovery, and remapped commands; ideal adds personalized shortcuts and specialized-device adapters over
the same focus contract.

#### 7. F10.10d.6 - how should uncertain voice recognition be corrected before an action commits?

**Option A - submit the top transcript immediately.** “Attack the ghoul by the door” may become “attack the girl,”
creating an unintended validated action that the DM seat then narrates truthfully but wrongly for the player. Cost
is low and agency risk is unacceptable.

**Option B - present an editable draft, highlight uncertainty, and resolve material ambiguity before commit
(recommended).** The transcript may offer stable candidate labels such as `Ghoul 2 — east door`; low confidence or
multiple legal targets prompts a short choice. The player confirms the same canonical intent used by keyboard/mouse,
and cancel/typed correction always works. A provider-neutral DM model receives only the committed intent, not raw
audio or recognition guesses. Cost is medium-high recognition metadata, candidate matching, focus, and recovery QA.

**Option C - ask the DM-seat model to infer what the player probably meant.** Conversational, but provider behavior
becomes input authority and can silently choose a target or action. Cost is medium integration and very high agency/
determinism risk.

**Prototype/MVP/ideal:** OS dictation plus manual edit proves the seam; voice MVP adds uncertainty/candidate UI for
core intents; ideal adds natural corrections and interruption without removing explicit commit or privacy policy.

#### 8. F10.10e.5 - how should DM readback, mechanical announcements, captions, and sound cues share the audio channel?

**Option A - let every source speak or play immediately.** A trap receipt, initiative change, DM narration, and
menu hint can overlap into an unintelligible wall. Cost is low scheduling and high accessibility failure.

**Option B - give channels separate controls and a user-governed priority/queue policy (recommended).** Mechanical
terminal truth can interrupt or queue according to the player's settings; DM prose, UI hints, ambience, and sound
cues have distinct volume/readback/ducking controls. Pause, replay, skip, and exact-log access remain available.
The provider-neutral DM seat emits tagged prose, not direct ownership of screen-reader or audio scheduling. Cost is
high channel metadata, scheduler, settings, and assistive-technology/audio QA.

**Option C - merge mechanics into DM narration and read one stream.** Calm when perfect, but omissions, provider
latency, verbosity, and poetic phrasing can hide exact state. Cost is medium prompting and high truth risk.

**Prototype/MVP/ideal:** prototype proves one causal beat queued around one DM paragraph; MVP covers representative
interrupt/replay/ducking policies and captions; ideal adds richer voice, spatial sound, and personalization over the
same tagged channels.

#### 9. F10.10e.6 - how should the semantic spatial navigator order and summarize a dense room?

**Option A - list every cell and object in coordinate order.** Exact, but a blind player must traverse dozens of
empty cells before finding the ogre, lever, hazard, or legal destination. Cost is low and usability is poor.

**Option B - provide stable task-oriented groups, distance/direction summaries, filters, and exact drill-down
(recommended).** From Mara, the navigator can announce `Immediate threats (2)`, `Known hazards (1)`, `Objectives`,
`Reachable cover`, and `Exits`; selecting the east-door ghoul exposes exact relation, route, cover, and legal target
ids. Ordering is deterministic, viewpoint-limited, verbosity-adjustable, and identical regardless of DM provider.
The DM seat may explain a selected relation but cannot invent or hide it. Cost is high spatial-query, labeling,
ordering, localization, and blind-player testing.

**Option C - answer only free-form spatial questions through the DM seat.** Natural, but slow, provider-variable,
and unable to guarantee exhaustive legal choices or exact repeatable navigation. Cost is medium model integration
and high accessibility risk.

**Prototype/MVP/ideal:** prototype exposes actor/hazard/route/target groups in one room; MVP covers representative
exploration and combat with filters and exact drill-down; ideal adds personalized summaries and optional spatial
audio/natural queries over the same canonical index.

#### 10. F10.10e.7 - what evidence is required before Genesis claims its blind/low-vision play path works?

**Option A - automated accessibility checks and developer keyboard tests.** Necessary and cheap, but they cannot
show whether a causal beat is understandable, a spatial list is exhausting, or a dungeon decision feels playable.

**Option B - combine automation with retained tasks tested using real assistive technology and blind/low-vision
players at promotion gates (recommended).** Early prototypes use VoiceOver on the Mac plus keyboard traces and
expert review; before the playable accessibility claim, representative blind/low-vision participants complete
retained tasks such as finding the trapped route, choosing a target, committing an action, understanding the
consequence, and recovering after interruption. Findings amend contracts and fixtures rather than becoming one-off
prose. Cost is high recruitment, compensation, research ethics, iteration, and device/AT QA, but it is the only
credible usability evidence.

**Option C - wait until near release for an external accessibility audit.** Expert review may catch many issues,
but structural focus, spatial, and announcement problems arrive too late and too expensively. Cost is deferred, not
removed.

**Prototype/MVP/ideal:** prototype uses Mac VoiceOver, keyboard-only retained traces, and early paid consultation;
MVP adds representative task-based participant evidence before claiming the path; ideal maintains a compensated
accessibility cohort across devices, languages, updates, and richer input/audio features.

**Codex recommends Option B for all ten.** Questions 1 and 4 make tiers understandable and stable; Questions 2-3
turn Adam's anti-pop preference into an executable reveal/refinement law; Question 5 preserves citizen continuity;
Questions 6-7 protect keyboard/voice agency; and Questions 8-10 make blind-player access configurable, exact, and
human-tested. Answers may generate narrow threshold or acceptance-fixture follow-ups. P10.10 and Wave 10 remain
open.

### 11.110 F10.10a.3-F10.10e.7 ruling - outcome tiers, stable refinement, coherent reveal, governed Auto, identity-safe crowds, input focus, voice correction, audio policy, usable spatial order, and a funding-gated human proof

Adam accepted **Option B and its prototype -> playable MVP -> ideal/dream pipeline for all ten questions**. He
added a material resource constraint to Question 10: Genesis is currently a solo, effectively no-cash build beyond
roughly **$200/month already committed to Claude and Codex subscriptions**. Paid cloud services, device labs,
speech vendors, participant research, contractors, and employees cannot be presumed in current prototype or
near-term planning. Fundraising and hiring may become necessary later.

1. **F10.10a.3 - player-facing tiers use outcome names backed by measured reference examples.** A small `Readable`/
   `Tabletop`/`Showcase` vocabulary explains presentation changes without using a hardware brand as a performance
   guarantee. Every tier sends the provider-neutral DM seat the same canonical room.
2. **F10.10b.3 - only imperceptible same-truth visual refinement may occur freely during a mounted scene.** A
   noticeable texture or visual-LOD change waits for a safe transition, occlusion, governed reframe/crossfade, or
   remains deferred; tactics and DM-seat facts never depend on the richer representation.
3. **F10.10b.4 - scene reveal requires a semantic reveal set plus coherent base presentation.** Exact topology,
   material actors/hazards/routes/targets/actions, focus/accessibility data, base material identity, readable value,
   and truthful DM fallback precede interaction. Optional dressing and expensive quality may follow safely.
4. **F10.10c.4 - `Auto` quality uses sustained evidence, hysteresis, safe boundaries, a visible reason/recovery
   policy, and player override.** A system surface, not DM fiction, owns any technical explanation.
5. **F10.10c.5 - tiers preserve every material citizen and reduce only certified ambient presentation.** Named,
   noticed, evidence-bearing, hostile, obligated, or otherwise relevant people retain identity across tiers; pooled
   ambient representatives may reduce without changing population truth.
6. **F10.10d.5 - an explicit focus stack and semantic return target govern BattleMat, object cards, composer,
   drawers, and modal choices.** New DM prose does not steal focus or discard a draft.
7. **F10.10d.6 - voice produces an editable draft, exposes uncertainty, and resolves material ambiguity before the
   ordinary canonical commit.** The DM-seat provider receives the committed intent, never raw audio or recognition
   guesses as mechanics authority.
8. **F10.10e.5 - DM readback, exact mechanics, UI hints, captions, ambience, and sound cues remain tagged channels
   with player-owned priority, interruption, ducking, volume, replay, and skip controls.** Provider prose does not
   own the screen-reader/audio scheduler.
9. **F10.10e.6 - the semantic spatial navigator uses stable task-oriented groups, directional/distance summaries,
   filters, and exact drill-down.** It remains deterministic, viewpoint-limited, verbosity-adjustable, and
   independent of the selected DM provider.
10. **F10.10e.7 - a public playable blind/low-vision claim eventually requires retained tasks with real assistive
    technology and compensated blind/low-vision participants, but that paid proof is funding-gated.** The current
    prototype obligation is narrower: preserve semantic structure, exercise keyboard-only retained traces, use the
    Mac's built-in VoiceOver and cost-free automation, and avoid claiming externally validated usability. Early
    voluntary feedback may inform work, but it does not substitute for compensated representative research.

#### Current-resource law

The ideal remains a design target, not a bill due now. Until funding changes:

- **cash-default:** use the existing Mac, local browser tooling, built-in assistive technology, retained deterministic
  fixtures, and the already-funded agent subscriptions; do not silently add recurring services;
- **labor honesty:** `$0` cash does not mean low effort. High-complexity systems are still sequenced behind the
  connected playable spine rather than being generated merely because agent time is available;
- **claim honesty:** one Mac and developer-operated VoiceOver can prove structure and expose defects, but cannot
  establish broad hardware support or blind/low-vision usability;
- **promotion:** paid cloud/device sessions, participant research, specialist review, and hiring begin only from a
  named retained milestone, bounded question, spending cap, and decision the evidence can change;
- **funding posture:** the project first builds reusable evidence—a compelling connected vertical slice, repeatable
  captures, truthful telemetry, and visible provider-neutral contracts—so later money buys targeted risk reduction
  rather than undirected breadth.

This amendment reduces neither accessibility nor high-beauty intent. It moves expensive proof and breadth to honest
promotion gates while requiring the semantic seams that prevent a later rewrite.

### 11.111 F10.10a.4-F10.10e.10 generated ten-question batch - zero-cash boundary, support claims, paid-device trigger, local profiling, beauty breadth, voice spend, accessibility claims, voluntary feedback, low-vision/reduced-motion floor, and funding transition

#### 1. F10.10a.4 - what is the current zero-cash P10.10 boundary?

**Option A - attempt the complete performance/device/accessibility ideal now using only agent labor.** Genesis would
build broad quality automation, voice adapters, device matrices, and accessibility surfaces before the connected
dungeon exists. Cash stays low, but months of speculative complexity may be discarded. The DM-seat contract gains
breadth without a playable room proving it. Labor/opportunity cost is extreme.

**Option B - build only the semantic seams and one Mac-retained proof now; promote breadth from evidence
(recommended).** The dungeon fixture records frame/assembly/memory measures, reveals coherently at one developer
low/high setting, remains keyboard-completable, exposes structured labels/logs, and gives any DM provider the same
truth. Full tier UI, automatic adaptation, voice integration, broad accessibility presentation, and external
matrices remain named promotions. Cash cost is approximately zero beyond existing subscriptions; labor cost is
medium and directly reusable.

**Option C - defer all P10.10 work until funding.** Fastest feature progress initially, but renderer, input, and DM
surfaces may harden around inaccessible or unmeasurable assumptions that later require a rewrite. Cash cost is zero;
future technical cost is high.

**Prototype/MVP/ideal:** one instrumented Mac fixture and semantic seams now; a funded playable MVP adds the narrow
user-facing performance/accessibility gates justified by the slice; the ideal expands devices, automation, voice,
and human evidence after adoption/funding.

#### 2. F10.10a.5 - what support claim may Genesis make while it has been exercised only on Adam's Mac?

**Option A - call the Mac the minimum supported machine.** Concrete, but one developer machine cannot prove the
behavior of similar Macs, browsers, thermals, or future builds. Cost is low and promise risk is high.

**Option B - label it the current development/prototype reference and make no release support promise yet
(recommended).** Captures say exactly which machine/browser/build produced them. The retained dungeon and DM-seat
trace demonstrate development truth, not market coverage. Minimum/recommended claims wait for a second materially
different device and repeatable corpus. Cash cost is zero now; later comparison cost is bounded.

**Option C - claim generic browser support because Genesis uses web standards.** Provider-neutral mechanics help,
but browser APIs, WebGL, memory, input, and accessibility behavior still differ. Cost is low and credibility risk is
high.

**Prototype/MVP/ideal:** development-reference disclosure now; measured minimum/preferred targets before external
playable support claims; broader matrix only as the audience and funding justify it.

#### 3. F10.10a.6 - when is paid cloud GPU or device-lab spending justified?

**Option A - subscribe now so high-tier compatibility shapes every visual decision.** It supplies early beauty
captures, but recurring idle cost and remote-environment maintenance precede a stable scene. Cost is high relative
to the present budget.

**Option B - authorize a short capped session only after the local retained corpus and a specific decision exist
(recommended).** Example: once the same dungeon battle replays deterministically on the Mac, rent a high-tier GPU
for a few hours to answer whether shadows/materials—not mechanics or DM narration—meet `Showcase` targets. Record
the image and results, then shut it down. Cash cost is later and small/bounded; setup labor is medium.

**Option C - never use rented hardware; wait until a machine can be purchased.** Avoids rental complexity but may
delay evidence and make one eventual purchase a poorly informed bet. Cost is deferred and potentially larger.

**Prototype/MVP/ideal:** no paid hardware now; milestone-triggered manual comparison later; repeatable images or a
device matrix only after recurring tests justify their maintenance.

#### 4. F10.10b.5 - what performance evidence should the no-budget prototype collect?

**Option A - rely on visual feel and occasional FPS screenshots.** Cheap, but a smooth empty room can hide slow
battle, DM-response, assembly, memory-growth, and input problems. Labor cost is low and diagnostic value is weak.

**Option B - use local browser/platform instrumentation and retained phase markers in a small exportable trace
(recommended).** The same dungeon seed marks load, reveal, exploration, dense battle, EngagementLens, DM request/
fallback, consequence, and aftermath; local measurements capture frame distributions, long tasks, assembly time,
memory trend where available, and input-to-visible response. No vendor telemetry or hosted dashboard is required.
Cash cost is zero; implementation/interpretation cost is medium.

**Option C - build a production telemetry service before profiling locally.** Rich longitudinal data, but hosting,
privacy, schema, and dashboard work arrive before users and can bias the design toward whatever is easy to collect.
Cash and labor cost are high.

**Prototype/MVP/ideal:** local trace/file now; automated retained comparison when the corpus stabilizes; opt-in field
telemetry only if real users and a privacy-justified question later require it.

#### 5. F10.10c.6 - how much high-beauty breadth should be built before stronger hardware or funding exists?

**Option A - produce all target materials, props, effects, and site families now, judging them on the Mac.** This
may choke the prototype machine, hide systemic composition defects, and create large unused asset breadth. Cash may
stay low but generation, review, storage, and integration labor are very high.

**Option B - prove one scalable beauty path and retain low-tier truth; defer broad beauty multiplication
(recommended).** One dungeon room/battle validates composition, material roles, lighting, sprites, and the
`Readable`-to-`Showcase` seam. The Mac may display the coherent lower tier; later high-tier hardware judges the same
canonical scene's richer presentation. The DM seat describes material facts shared by both, never high-tier-only
decoration. Cash cost is zero now; focused visual labor is medium-high.

**Option C - target only what looks best on the current Mac and abandon a higher tier.** Practical now, but converts
temporary hardware limits into a permanent beauty ceiling. Labor cost is lower and long-term ambition loss is high.

**Prototype/MVP/ideal:** one representative scalable path; a funded MVP broadens only the proven asset grammar;
ideal beauty expands across the retained site portfolio with high-tier evidence.

#### 6. F10.10d.7 - may the first voice path depend on a paid speech service?

**Option A - choose a premium hosted recognizer now for the best transcription.** It accelerates voice polish, but
adds recurring cost, privacy terms, network failure, and provider lock-in before voice is the active milestone.

**Option B - no paid voice dependency in the prototype; retain the editable canonical draft seam
(recommended).** Typing and OS dictation can exercise `spoken text -> editable intent -> validated commit` for free.
When voice promotes, locally available/browser adapters or a capped consented provider may plug in without changing
the dungeon action or DM-seat contract. Cash cost is zero now; semantic/input labor is low-medium and reusable.

**Option C - drop voice from the design entirely until a vendor can be funded.** Saves current thought, but may let
the input pipeline harden around keyboard events instead of semantic intents. Cash cost is zero and later rewrite
risk is medium.

**Prototype/MVP/ideal:** typed/OS-dictation seam now; one replaceable push-to-talk adapter when promoted; richer
local/remote choice and natural conversation only when cost, privacy, and demand justify it.

#### 7. F10.10e.8 - what accessibility statement is honest before compensated user research?

**Option A - advertise Genesis as blind-accessible after automated checks and VoiceOver developer testing.** Those
checks are valuable but cannot prove comprehension, fatigue, spatial usability, or enjoyable play. Cash cost is
zero and trust risk is high.

**Option B - describe concrete implemented capabilities without claiming validated usability (recommended).** A
prototype note may say keyboard navigation, semantic BattleMat labels, exact logs, and VoiceOver checks exist. It
also says blind/low-vision participant validation is pending. The dungeon and provider-neutral DM seat expose
testable equivalent facts, while the product claim stays narrow. Cash cost is zero; documentation discipline cost
is low.

**Option C - say nothing about accessibility until the ideal is funded.** Avoids overclaiming, but hides useful
work and makes early feedback less likely. Cost is low and learning loss is material.

**Prototype/MVP/ideal:** capability inventory now; a bounded playable claim only after representative compensated
tasks; broader claims track actual device, feature, and cohort evidence.

#### 8. F10.10e.9 - how should Genesis use external accessibility feedback before it can fund research?

**Option A - recruit unpaid blind players to perform the full retained test plan.** It generates data cheaply but
shifts professional research labor onto people whose expertise the project plans to benefit from. Cash cost is low;
ethical and sampling risk is high.

**Option B - welcome lightweight voluntary feedback, keep claims modest, and reserve structured task research for
compensated participation (recommended).** Public builds may provide an accessible feedback path; a person may
report that the east-door hazard ordering is confusing, and Genesis can retain that defect and fixture. Do not set
quotas, demand long sessions, or treat voluntary comments as representative validation. The DM provider remains
irrelevant to the exact issue. Cash cost is zero now; moderation/triage cost is low-medium.

**Option C - accept no external feedback until compensation is available.** Ethically cautious but unnecessarily
blocks unsolicited useful reports and community contact. Cash cost is zero; learning cost is medium.

**Prototype/MVP/ideal:** accessible issue intake and respectful voluntary feedback now; capped paid consultations
when a retained slice exists; representative compensated studies before public usability claims.

#### 9. F10.10e.10 - which low-vision and reduced-motion provisions belong in the no-budget foundation?

**Option A - defer all of them because proper user validation is not yet affordable.** Saves immediate labor, but
hard-coded color, scale, motion, and timing choices can make later correction architectural. Cash cost is zero;
rewrite risk is high.

**Option B - build semantic tokens and motion-equivalent state now, while deferring theme breadth and polished
presets (recommended).** The dungeon uses role-based color/value tokens, scalable text/UI boundaries, non-color
hazard/target cues, and a deterministic skip/reduced-motion terminal state. DM prose and exact mechanics remain
readable without animation. One developer contrast/scale/motion check proves the seam; mature presets and human
validation promote later. Cash cost is zero; current labor is medium and foundational.

**Option C - implement a large catalog of contrast themes, filters, fonts, motion sliders, and audio equivalents
immediately.** Broad choice without research becomes a large unvalidated matrix. Cash cost may be low; design/test
labor is high.

**Prototype/MVP/ideal:** tokens, non-color redundancy, scaling boundary, and skip-equivalent now; a small validated
setting set for the playable MVP; richer personalized profiles after funded testing.

#### 10. F10.10a.7 - what event should change Genesis from zero-cash development to fundraising or hiring?

**Option A - raise and hire as soon as possible around the full vision.** More hands could accelerate work, but an
unproven architecture and diffuse scope make role selection, valuation, and spending difficult. Founder time and
coordination cost are high.

**Option B - use a retained connected vertical slice to identify a bounded capital question and first missing role
(recommended).** The evidence package shows the same dungeon from generation through exploration, battle,
provider-neutral DM narration/fallback, aftermath, save/reload, Mac telemetry, and honest accessibility seams. Its
measured bottleneck determines whether the next spend is a short GPU/device study, compensated accessibility
research, an art/graphics specialist, performance engineer, accessibility specialist, or broader production hire.
Cash remains zero now; later spending is decision-linked and the preparation labor directly improves the game.

**Option C - wait until the entire MVP is complete before discussing funding or help.** Preserves control, but the
solo developer may hit a specialist, hardware, research, or production wall that prevents the evidence needed to
finish. Cash cost is deferred; schedule and burnout risk are high.

**Prototype/MVP/ideal:** record a funding-ready evidence checklist now without fundraising activity; reassess when
the connected retained slice exists or a measured blocker cannot be solved locally; raise/hire against explicit
milestones, then grow the team only when coordination has a clear owner and payoff.

**Codex recommends Option B for all ten.** This batch treats the current cash ceiling as a real design constraint
without converting it into permanent product austerity. The immediate work remains local, retained, provider-
neutral, and reusable; unsupported claims and recurring expenses wait. Answers may generate a narrow resourcing or
claim-boundary follow-up before the P10.10 closure audit. P10.10 and Wave 10 remain open.

### 11.112 F10.10a.4-F10.10e.10 ruling - local retained proof now, evidence-linked spending later

Adam used the standing shorthand **“recs are solid,” accepting Option B and the prototype -> playable MVP ->
ideal/dream pipeline for all ten questions**.

1. **F10.10a.4 - current P10.10 work builds semantic seams and one retained Mac proof, not the complete ideal.**
   Full quality automation, broad devices, voice integration, mature accessibility presentation, and external
   matrices remain promoted breadth rather than speculative solo-build prerequisites.
2. **F10.10a.5 - the current Mac is disclosed as the development/prototype reference, not a release minimum.** No
   generic browser or hardware support promise precedes a repeatable corpus on a materially different device.
3. **F10.10a.6 - paid hardware testing requires a stable local fixture, one question the test can decide, a short
   capped session, and recorded evidence.** There is no present cloud subscription or device-lab obligation.
4. **F10.10b.5 - the no-budget prototype writes small exportable local traces from browser/platform instrumentation.**
   Retained phase markers separate load, reveal, exploration, dense battle, EngagementLens, provider request/
   fallback, consequence, and aftermath without requiring hosted telemetry.
5. **F10.10c.6 - Genesis proves one scalable `Readable` -> `Showcase` beauty path before multiplying assets and site
   families.** The Mac owns coherent low-tier truth; later measured hardware judges richer presentation over the
   same canonical dungeon and DM-seat facts.
6. **F10.10d.7 - no paid recognizer is a prototype dependency.** Typing and OS dictation exercise the editable
   semantic intent seam; any later local/browser/consented hosted recognizer remains replaceable.
7. **F10.10e.8 - before compensated research, Genesis describes implemented accessibility capabilities without
   claiming externally validated usability.** The evidence boundary is explicit rather than silent.
8. **F10.10e.9 - Genesis welcomes lightweight voluntary accessibility reports but reserves structured retained-task
   research and validation claims for compensated participation.** Unpaid community labor is not the hidden test
   program.
9. **F10.10e.10 - semantic color/value tokens, scalable boundaries, non-color redundancy, and deterministic reduced-
   motion/skip terminal states belong in the no-cash foundation.** Broad theme/preset matrices and human validation
   promote later.
10. **F10.10a.7 - the connected retained vertical slice is the default fundraising/hiring evidence gate.** An
    earlier measured blocker may also fire it. The slice or blocker identifies the bounded next expense and missing
    specialty; Genesis does not presume undirected headcount.

These rulings preserve the roughly $200/month agent-subscription ceiling while acknowledging real labor and
opportunity cost. They also distinguish three milestones that must not be collapsed:

- the **local proof prototype** can be truthful, instrumented, keyboard-completable, structurally accessible, and
  provider-neutral without paid services;
- the **playable desktop MVP** can implement the bounded semantic-equivalence suite without claiming broad device
  support or externally validated blind/low-vision usability;
- **release/support/accessibility claims and ideal breadth** require the named later hardware, human, financial, and
  product evidence appropriate to each claim.

### 11.113 P10.10 explicit closure audit and final confirmation

#### Original-question coverage

| Original family | Accepted phased answer | Prototype proof | Playable MVP / promoted goal |
|---|---|---|---|
| **F10.10a devices** | Current Mac is the disclosed development reference; release tiers wait for retained evidence on a second materially different device. Keyboard/mouse is the first playable surface; the landscape-tablet target remains a layout/semantic/functional capture, not a touch-support promise. | Exact Mac fingerprint and local retained fixture. | Name supported hardware only from later evidence; touch/controller, broader browsers/devices, and high-tier matrices promote. |
| **F10.10b budgets** | 60 fps preferred and 30 sustained floor remain the initial named-hardware law; phase-specific distributions, input response, assembly, memory, and provider time stay separate. A missed assembly budget reveals a coherent lower tier, not a half-mounted room. | Export local traces with deliberate slow-reveal/fallback cases; do not invent release thresholds. | Lock thresholds from the retained corpus; later automate only repeated valuable comparisons. |
| **F10.10c degradation** | Outcome-named semantic-invariant tiers may reduce rebuildable visual cost and certified ambient representation only. Player-visible Auto uses hysteresis, safe boundaries, reason/recovery, and override; conspicuous pop is rejected. | Developer low/high switch proves same actors, hazards, routes, actions, materials, DM facts, and recovery. | Small tier UI and bounded Auto promote with evidence; mature streaming, prediction, cache, and beauty breadth remain later. |
| **F10.10d input** | Keyboard/mouse defines the first playable MVP through remappable semantic commands, a complete non-hover route, and explicit focus return. Voice follows as push-to-talk editable intent with privacy, ambiguity, cancel, and typed fallback; no recognizer or DM provider owns mechanics. | Keyboard-complete retained trace; typing/OS dictation exercise the voice-shaped draft seam. | One replaceable voice adapter promotes next; controller, touch, natural conversation, and specialized devices remain later. |
| **F10.10e accessibility** | Bounded semantic equivalence includes scale boundaries, focus, non-color/non-audio cues, captions, reduced-motion terminal truth, causal-beat announcements plus exact log, channel settings, persistent profiles, and task-oriented canonical spatial navigation. | Cost-free automation, keyboard traces, Mac VoiceOver, and honest capability inventory; no validated-usability claim. | Extend across the core corpus; representative compensated research precedes public blind/low-vision usability claims; richer profiles/devices/languages/audio remain promoted. |

#### Generated-follow-up exhaustion

- **F10.10a.1-a.7 are answered:** Mac duty, release-tier timing, outcome language, zero-cash boundary, honest support
  claim, paid-hardware trigger, and fundraising/hiring transition.
- **F10.10b.1-b.5 are answered:** phase statistics, missed assembly, anti-pop visual refinement, coherent reveal set,
  and local trace evidence.
- **F10.10c.1-c.6 are answered:** cloud authority, tier selection, memory/thermal preservation, Auto recovery,
  identity-safe crowd reduction, and focused beauty breadth.
- **F10.10d.1-d.7 are answered:** input order, voice form, remapping, privacy, focus arbitration, recognition
  correction, and no paid recognition dependency.
- **F10.10e.1-e.10 are answered:** causal announcements, settings topology/persistence, nonvisual spatial interface
  and ordering, audio-channel governance, human evidence, claim language, voluntary feedback, and low-vision/
  reduced-motion foundations.

Exact hardware tiers, numeric phase thresholds beyond the accepted 60/30 law, cloud instance choice, paid-study
sample, and hire order are intentionally **evidence outputs**, not unresolved design questions.

#### Contradiction audit

1. The initial Option B language proposed playable tablet/touch parity. Adam's later ruling explicitly supersedes
   that breadth: keyboard/mouse is the first playable MVP, voice promotes next, and tablet remains a layout/
   semantic/functional proof until touch is separately promoted.
2. The Mac is both an important low-tier prototype target and not an asserted release minimum. Its local fixture
   aims toward the 30-floor law, but release support cannot be inferred from one machine.
3. Accessibility remains a functional MVP obligation; compensated participant evidence gates external validated-
   usability claims, not whether semantic foundations are built. The no-budget amendment therefore phases breadth
   and proof rather than deleting accessibility.
4. Cloud beauty evidence, paid recognition, and richer assets remain accepted possibilities but have no current
   recurring-spend entitlement. The connected retained slice and a bounded decision must trigger them.
5. Standard mip/visual LOD streaming remains allowed, while visible uncontrolled pop, false material identity,
   changed tactical silhouette, and room recomposition remain rejected.

No accepted ruling requires provider prose to supply mechanics, no performance tier changes canonical content, and
no hardware/accessibility claim outruns its evidence.

#### Owner and promotion audit

- **C1A** owns the first Mac-instrumented room, developer low/high seam, semantic reveal set, coherent fallback, and
  basic keyboard/semantic-label trace.
- **C1D** adds dense battle and EngagementLens phase evidence over the same truth; **C1F** exercises focus,
  interruption/recovery, reduced-motion terminal equivalence, and preserved composer/inspection state.
- **C1G** proves provider request time and prose/fallback behavior remain separate from mechanics and renderer time.
- **C1H/C1I** provide the one focused scalable composition/material beauty path without multiplying the portfolio;
  **C2M** later exercises material-citizen preservation versus ambient crowd reduction.
- **P10.11** owns reusable asset bindings, exact-art/cache/container/compression mechanics, fallbacks, migrations,
  storage, and reversibility; it must obey P10.10's reveal, anti-pop, memory, and no-runtime-network laws.
- **P10.12** owns the later same-state comprehension/beauty/performance/accessibility bakeoff and turns measured
  evidence into release/support claims. Paid external evidence remains milestone- and funding-gated.

There are **no unmapped original rows, no unanswered generated branches, and no ownerless accepted feature goals**.
The only remaining P10.10 decision is whether to accept this audit and phased closure.

#### 1. P10.10 closure confirmation

**Option A - keep P10.10 open for more speculative hardware, threshold, vendor, research, and hiring detail.** This
could create more apparent precision, but the real dungeon, measurements, users, and funding needed to choose that
detail do not yet exist. Cost is high planning churn and likely stale assumptions.

**Option B - close P10.10 on the audited phased basis and advance to P10.11 (recommended).** The local prototype
keeps the exact seams and zero-cash obligations above; the playable MVP and ideal retain their named promotions;
later evidence supplies numbers, services, human validation, and hiring decisions. For example, C1A can reveal the
same truthful dungeon on the Mac while any DM provider narrates the same facts, without first selecting a cloud
GPU, speech vendor, tablet, or accessibility research cohort. Cost is low decision debt and preserves all future
options.

**Option C - close P10.10 by reducing the feature goal to the solo/no-budget prototype.** This is cheaper on paper,
but would turn temporary finances into permanent device, voice, beauty, and accessibility limits.

**Prototype/MVP/ideal:** Option B locks the cost-free local seam now, the bounded playable desktop MVP later, and
the evidence/funding-triggered release and ideal breadth already recorded. P10.11 would begin next; P10.12,
G10.1-G10.2, and Wave 10 would remain open. **Codex recommends Option B.**

### 11.114 P10.10 closure ruling - accepted on the audited phased basis

Adam explicitly chose **Option B** and closed **P10.10** on the phased basis audited at section 11.113.

- The current roughly $200/month Claude/Codex commitment remains the cash ceiling. The first obligation is the
  local retained Mac proof and reusable semantic seams, not paid services or the complete ideal.
- The playable desktop MVP retains the bounded performance/input/accessibility obligations already mapped. It does
  not silently promise tablet/touch support, broad hardware coverage, or externally validated blind/low-vision
  usability.
- Release hardware names, exact thresholds beyond the accepted 60-preferred/30-floor law, cloud/device tests,
  voice services, compensated accessibility research, fundraising, and hiring remain evidence-triggered outputs.
- All accepted ideal goals and promotion triggers remain live. Temporary solo-build finances do not redefine the
  destination downward.

P10.10 is **CLOSED**. P10.11 is now active. P10.12, additive G10.1-G10.2, and Wave 10 remain open; no build is
authorized and Wave 10 cannot close without Adam's explicit agreement.

### 11.115 P10.11 deep-dive setup and F10.11a-F10.11j batch - bindings, resolution, generation timing, caches, offline fallback, admission, provenance, migration, renderer rollback, and distribution

The accepted P10.11 baseline uses semantic slot contracts and versioned visual bindings over approved libraries,
procedural recipes, and governed generated art. Generated images never establish geometry or mechanics; admission
validates scale, alpha, anchors/sockets, material channels, provenance, licensing, hashes, and fallback. Runtime play
has no network dependency. The existing full 3D theater and candidate trays remain reversible until the P10.12
bakeoff supplies replacement evidence.

Genesis already contains useful partial seams rather than a blank slate: root manifest validation, generated sprite
manifests/registry products, semantic model recipes with whole-object/cuboid fallback, foundry manifests, LFS-backed
large art, and a faceted migration contract whose candidate -> legacy -> existing fallback order requires an in-game
admission pass rather than mere file presence. P10.11 must unify those patterns without declaring their current
implementation complete or forcing LFS materialization during this design discussion.

#### 1. F10.11a - what identity should a visual binding have?

**Option A - let canonical entities store direct file paths.** The turtle communicator points to
`assets/items/turtle-v3.png`; renaming, repacking, realm variants, or rollback then changes save meaning. A DM provider
could accidentally repeat a stale path from context. Cost is low initial wiring and high migration fragility.

**Option B - give each semantic presentation slot a stable id and resolve a versioned payload separately
(recommended).** The item owns `turtle-communicator` mechanics and custody; a slot such as
`item:turtle-communicator:standee` binds to an admitted payload version with kind, scale, anchor, states, provenance,
and fallback. Dungeon geometry owns its footprint and collision. Any DM-seat model sees the item/state ids and
available mechanics, never a filename as truth. Cost is medium schema/resolver/migration work and high reuse value.

**Option C - embed the complete current art payload in every entity/save record.** Each world preserves its exact
look, but duplicates blobs and entangles mechanics, storage, sharing, migrations, and corruption recovery. Cost is
very high storage and lifecycle complexity.

**Prototype/MVP/ideal:** prototype binds one creature, one stateful door, and the turtle communicator through stable
slots; MVP covers the core citizen/prop/surface/decal/FX families; ideal adds realm/style/state variants without
changing semantic ids.

#### 2. F10.11b - how should the runtime choose among candidate, legacy, and fallback visuals?

**Option A - use whichever matching file is newest or easiest to find.** A copied dungeon asset can silently beat an
approved sprite, and two machines may render different communicators from the same save. Cost is low and
determinism/provenance risk is severe.

**Option B - use one deterministic admitted-resolution ladder with an explicit result receipt (recommended).** A
pinned valid binding resolves first; then an explicitly selected/admitted compatible variant, the admitted shipped
default, the retained legacy asset, the semantic construction recipe, and finally a truthful marker/card/prose
fallback. Each result records requested slot/version, chosen payload/hash, rejection/miss reason, and next fallback.
The DM provider may describe the canonical item but cannot reorder the ladder. Cost is medium-high resolver,
compatibility, receipt, and parity QA.

**Option C - ask the DM-seat model to choose the closest available asset by name.** Flexible for invented nouns,
but spelling, provider, prompt, and context would change visible identity and could substitute false geometry. Cost
is medium integration and unacceptable authority risk.

**Prototype/MVP/ideal:** prototype proves admitted -> legacy -> construction/marker fallback for three slots; MVP
applies the total ladder to the core corpus; ideal adds richer compatible variants and diagnostics without runtime
nondeterminism.

#### 3. F10.11c - when may exact generated art be created for a newly invented noun?

**Option A - block play while runtime generation produces exact art.** When the DM introduces twin turtle
communicators, the dungeon waits on a network model before the items appear. Provider outage, cost, moderation, or
an invalid image becomes gameplay failure. Cost and latency are unbounded.

**Option B - mount the deterministic fallback immediately and treat exact generation as optional offline/background
enrichment (recommended).** Both communicator ids, custody, range, damage, and callbacks exist immediately as linked
semantic standees/cards. A player-approved job may later produce a candidate outside the critical turn; admission
must pass before a safe-boundary visual rebind. The DM narrates the same canonical items before and after. No current
paid generation service is assumed. Cost is medium queue/admission/rebind work and zero required runtime spend.

**Option C - prohibit generated exact art and use only a fixed shipped library.** Predictable and offline, but the
world can never gain exact visual identity for emergent nouns beyond generic combinations. Cost is low ongoing and
high expressive limitation.

**Prototype/MVP/ideal:** prototype records an enrichment request but keeps the fallback forever; MVP may process
player-triggered offline candidates; ideal supports governed background enrichment, budgets, cancellation, and
portable provenance without making it necessary for play.

#### 4. F10.11d - who owns shipped assets, player-local generated art, and save references?

**Option A - store every required art blob inside each save.** Portability is superficially simple, but saves become
huge, duplicated, license-sensitive, and difficult to migrate or inspect. Cost is very high storage and sync work.

**Option B - separate immutable shipped packages, a content-addressed player-local cache, and compact save bindings
(recommended).** The install owns approved common assets; the local profile owns optional exact/generated payloads
by hash plus provenance; the world save stores semantic slot, selected compatible version/hash when material to
appearance, and a guaranteed fallback descriptor—not the mechanics inside art. On another machine, the same dungeon
loads immediately with its shipped/procedural fallback; optional art may be imported later. The DM seat sees no
storage-path difference. Cost is high layering, garbage collection, export/import, and migration design.

**Option C - keep all art in one global mutable cache shared by every world.** Simple lookup and deduplication, but
eviction or replacement in one campaign can alter another and make saves non-reproducible. Cost is medium and
cross-world risk is high.

**Prototype/MVP/ideal:** prototype separates a shipped payload from one local candidate and a compact save ref; MVP
adds content hashes, bounded cleanup, missing-cache recovery, and export metadata; ideal adds selective portable
packs or sync after licensing/privacy/cost gates.

#### 5. F10.11e - what happens when an asset is absent, corrupt, evicted, or offline?

**Option A - fetch or regenerate it from the network before rendering.** This may restore beauty, but violates the
accepted no-runtime-network law and makes the DM encounter dependent on another provider. Cost is recurring,
latency-sensitive, and fragile.

**Option B - fail closed to the next truthful local representation and report the reason (recommended).** A corrupt
ogre sprite yields the admitted legacy standee or size-correct semantic figure; a missing altar material yields its
canonical stone/base surface; the communicator becomes its linked-item marker/card. Collision, states, actions,
knowledge, and DM facts remain identical. The bad payload is quarantined from future resolution until repaired.
Cost is medium integrity checking, typed gaps, quarantine, and retained offline QA.

**Option C - omit the noun visually and rely on DM prose.** Sometimes tolerable for nonmaterial flavor, but a
material actor, hazard, route, or interactable can disappear from the board. Cost is low and semantic risk is high.

**Prototype/MVP/ideal:** prototype deletes/corrupts one representative payload and proves local fallback; MVP covers
core asset families and reload; ideal adds guided repair/import while offline play always remains truthful.

#### 6. F10.11f - what must an asset pass before runtime admission?

**Option A - file presence and successful decode are enough.** A PNG can load while having false scale, bad alpha,
cropped feet, wrong state, or unusable gameplay silhouette. Cost is low and visual/mechanical risk is high.

**Option B - run a typed technical fold followed by retained in-game visual admission (recommended).** Automated
checks validate schema/version, kind, dimensions, hash, alpha bounds/fringe, scale, foot/contact anchor, sockets,
state-family completeness, channels, provenance/license, and decode/memory limits. Retained dungeon captures then
test camera yaw, lighting, occlusion, crowding, readability, and semantic fit. Failure records reasons, quarantines
the candidate, and preserves legacy/fallback. The DM never sees “file exists” as item truth. Cost is high foundry,
fixture, review, and rejection-accounting work.

**Option C - use manual visual approval only.** Human taste matters, but subtle hashes, anchors, channels, state
coverage, size, and provenance errors become inconsistent and expensive to rediscover. Cost is high repetitive QA.

**Prototype/MVP/ideal:** prototype folds one standee and one prop then proves in-game admission/rejection; MVP covers
core construction families; ideal adds independent visual judging and broader automated matrices after volume
justifies them.

#### 7. F10.11g - what provenance and licensing record is required for an admitted payload?

**Option A - record only a filename and creation date.** Cheap, but Genesis cannot later determine whether an asset
may be shipped, modified, shared with a save, regenerated, or removed. Cost is low now and potentially existential
later.

**Option B - require machine-readable source, rights, tool/recipe, transformation, and hash lineage (recommended).**
Each payload states whether it is authored, generated, derived, or third-party; identifies its source/tool/model and
applicable terms at creation where known; records prompts/recipe version and transformations where relevant; names
allowed shipped/local/export uses; and hashes source plus admitted outputs. Unknown or incompatible rights mean
local quarantine/fallback, not silent distribution. DM-generated fiction does not grant art rights. Cost is
medium-high metadata, review, and migration work with very high release protection.

**Option C - allow anything for private prototypes and perform one licensing cleanup before release.** This feels
fast but loses lineage, mixes distributable and nondistributable assets, and makes cleanup a manual forensic project.
Cost is deferred and potentially enormous.

**Prototype/MVP/ideal:** prototype requires a small provenance envelope even for local candidates; MVP gates shipped
and exported art by explicit policy; ideal automates more capture/audit as asset volume and funding grow.

#### 8. F10.11h - how should visual-binding schema and payload versions migrate?

**Option A - always resolve old saves to the newest available art.** Players see improvements, but an update can
silently restyle a campaign, break anchors, or make a saved capture unreproducible. Cost is low code and high drift.

**Option B - version schemas and compatibility separately, migrate atomically, and keep rollback/fallback receipts
(recommended).** A save may pin an appearance-compatible binding while mechanics remain on the stable semantic id.
A migration previews old/new resolution, preserves the last known valid binding or fallback, records why it changed,
and can rebuild after interruption. The same turtle communicator remains the same item to every DM provider even if
its visual payload advances. Cost is high compatibility, migration, test-fixture, and storage-policy work.

**Option C - never migrate visual bindings.** Perfect historical stability, but obsolete formats, security/decoder
issues, broken assets, and improved state coverage accumulate forever. Cost is low early and high maintenance.

**Prototype/MVP/ideal:** prototype migrates one v1 binding to v2 with forced interruption/rollback; MVP maintains the
supported schema window and deterministic fallbacks; ideal offers appearance update/lock choices where they remain
compatible and supportable.

#### 9. F10.11i - when may the current full 3D theater stop being the rollback view?

**Option A - remove it as soon as the new BattleMat renders one complete room.** This reduces code immediately but
destroys comparison and recovery before battle, travel, town, fallback, accessibility, and performance parity exist.

**Option B - retain it behind an explicit laboratory/feature flag through the P10.12 same-state bakeoff and a
recorded retirement gate (recommended).** It need not remain a supported player release view forever. Retirement
requires the chosen tray to cover the locked corpus, load old saves through semantic projection, preserve truthful
fallback, and retain reproducible captures or an archival harness for diagnosed regressions. Rolling back selects a
visual adapter/binding set, never rewinds dungeon mechanics or DM-seat history. Cost is medium parallel maintenance
now and bounded retirement work later.

**Option C - promise both old and new renderers as permanent supported modes.** Maximum choice and insurance, but
every asset, state, camera, accessibility, and performance change gains a permanent dual-renderer matrix. Cost is
very high indefinitely.

**Prototype/MVP/ideal:** prototype keeps the flag and same-state capture; P10.12 decides the release adapter and
retirement evidence; ideal preserves only the diagnostic artifacts necessary to reproduce old behavior after the
old view leaves supported play.

#### 10. F10.11j - which exact art belongs in the shipped game versus a player-local world cache?

**Option A - ship every exact generated asset from every developed world.** Coverage grows rapidly, but download/
LFS size, quality, duplication, licensing, tone, and moderation burden expand without bound. Cost is very high.

**Option B - ship a curated high-frequency approved library and keep world-specific enrichment optional/local
(recommended).** Common creatures, states, materials, construction recipes, and critical fallbacks ship after
admission. A strange campaign-specific communicator or heraldic variation may live in the player's content-addressed
cache; saves retain portable semantic descriptors and fallback, so absence never changes play. Promotion into the
shipped library requires repeated demand plus art, rights, size, and regression gates. Every DM provider describes
the same canonical noun whether its local exact art exists or not. Cost is medium-high curation/cache/export work
and bounded distribution growth.

**Option C - ship only generic recipes and generate all exact art locally.** Small distribution and maximal
personalization, but inconsistent hardware, cost, quality, portability, privacy, and offline capability undermine
the accepted reliable fallback corpus. Cost shifts unpredictably to players.

**Prototype/MVP/ideal:** prototype ships/uses the existing approved fallback library and one local exact candidate;
MVP curates core high-frequency coverage while retaining local optional enrichment; ideal adds governed promotion,
portable packs, or sync only when rights, economics, and player demand justify them.

**Codex recommends Option B for all ten.** This batch turns P10.11's accepted reversibility principle into a
provider-neutral, offline-safe lifecycle without assuming paid generation, broad storage, or permanent dual-renderer
support. Answers may generate narrower questions about binding compatibility, cache eviction, export/import,
generation consent, licensing states, or renderer-retirement evidence. P10.11 and Wave 10 remain open.

### 11.116 P10.11 decision-authority triage - technical defaults now, taste and product rulings only when evidence exists

Adam asked to see the whole active questionnaire again with an honest judgment about which questions legitimately
need his taste or vision. P10.11 should not turn stable engineering hygiene into ten ceremonial founder approvals.
The current ten divide as follows:

| # | Question | Decision authority now | When Adam's input is genuinely material |
|---|---|---|---|
| 1 | Stable visual-binding identity | **Codex/engineering default B now.** Direct file paths or save-embedded blobs are avoidable coupling. | Only if a later product feature asks players to understand or edit slot identity. |
| 2 | Deterministic resolution ladder | **Codex/engineering default B now.** Total local fallback and explicit receipts follow existing Genesis authority law. | Later, if players may prefer/pin variants and the UX needs a taste ruling. |
| 3 | Exact-art generation timing | **Safe default B now; product-experience ruling later.** Never block play, require network, or let art establish mechanics. | When a real enrichment system exists: should candidates appear between sessions, at scene transitions, or only after explicit player approval? |
| 4 | Shipped/cache/save ownership | **Codex/engineering default B now.** Separating immutable packages, local content-addressed cache, and compact save refs is the reversible architecture. | If future cloud sync, sharing, or mod policy changes the product boundary. |
| 5 | Missing/corrupt/offline behavior | **Codex/engineering default B now.** Truthful local fallback is non-negotiable under the accepted offline law. | No taste decision unless fallback visuals themselves are aesthetically inadequate in real captures. |
| 6 | Asset admission | **Architecture default B now; Adam's taste is mandatory on actual retained captures.** Automation can reject technical failures but cannot certify beauty. | At gameplay-scale visual gates for representative standees, props, materials, states, and the final style—not while choosing the schema. |
| 7 | Provenance/licensing envelope | **Codex/engineering default B now, with professional legal review later where warranted.** Lineage should be captured before it is forgotten. | Only for product policy choices about what Genesis distributes or permits; legal interpretation is not a taste vote. |
| 8 | Binding/schema migration | **Codex/engineering default B now.** Versioned atomic migration plus rollback is standard preservation work. | If players later receive an appearance-lock/update choice and its UX needs a product ruling. |
| 9 | Old-renderer retirement | **Hold Option B as risk policy; decide at P10.12 evidence.** Keep the laboratory flag through the bakeoff without promising two permanent products. | When same-state captures show whether the new tray actually wins on truth, beauty, comprehension, accessibility, performance, and recovery. |
| 10 | Shipped versus player-local exact art | **Safe default B now; business/product ruling later.** Curated common coverage plus optional local enrichment avoids both infinite downloads and generation dependence. | When distribution size, licensing, sharing/mods, generation economics, and actual repeated demand are measurable. |

#### Practical disposition

- **Codex may carry Questions 1, 2, 4, 5, 7, and 8 as technical Option B defaults** unless implementation evidence
  exposes a conflict. They do not need Adam to manufacture a personal opinion.
- **Question 6 needs Adam's visual taste later**, but on real isolated and in-game captures, not on whether hashes,
  fallbacks, and quarantine should exist.
- **Questions 3, 9, and 10 retain provisional Option B safety policies** and reopen only at their explicit evidence
  gates: a real enrichment flow, the P10.12 renderer bakeoff, and real distribution/economics respectively.
- Any provider-neutral DM-seat example remains an authority check, not a separate art policy: the model describes
  canonical nouns and state; the binding resolver chooses their legal local presentation.

Therefore **none of the ten requires a bespoke Adam ruling today**. The useful current decision is whether to adopt
this authority split: let Codex carry the six technical defaults, preserve one future visual-taste gate, and defer
three product/evidence decisions without losing their ideal goals. P10.11 remains open until Adam chooses that
disposition and all genuinely material generated follow-ups are handled.

### 11.117 P10.11 decision-authority ruling - technical defaults delegated, visual taste evidence-gated, product questions deferred honestly

Adam used the standing shorthand **“recs are good”** and accepted the section 11.116 authority split.

- **F10.11a, b, d, e, g, and h accept Option B as current technical architecture:** stable semantic slots,
  deterministic admitted resolution, separated shipped/local/save ownership, total truthful offline fallback,
  machine-readable provenance/rights lineage, and versioned atomic migration with rollback.
- **F10.11f accepts the Option B admission architecture**, but Adam's actual taste is required later on retained
  gameplay-scale captures. Technical folds may reject broken candidates; they cannot certify that a standee, prop,
  material, or full scene is beautiful.
- **F10.11c, i, and j retain provisional Option B safety policies** rather than false finality: exact-art generation
  never blocks play and reopens when a real enrichment flow exists; the old renderer remains a laboratory until the
  P10.12 bakeoff; curated shipped coverage plus optional local enrichment reopens when distribution, rights,
  economics, sharing/mods, and player demand are measurable.

This is not permission to narrow the ideal silently. It changes who decides and when: Codex owns stable technical
hygiene; Adam owns real visual taste; product/business breadth waits for product/business evidence.

### 11.118 P10.11 generated follow-up disposition - Codex-carried compatibility, rebind, cache, import, consent, rights, pinning, retirement, and zero-cash rules

The section 11.115 batch named possible follow-ups around binding compatibility, cache eviction, export/import,
generation consent, licensing states, and renderer retirement. Under Adam's accepted authority split, none requires
a founder taste answer now. The following technical dispositions preserve the prototype -> MVP -> ideal pipeline
and name the gates that reopen genuine product choices.

1. **Binding compatibility is typed, not name-similar.** A candidate declares slot kind, semantic family/state,
   dimensions/scale class, anchor/socket contract, channel set, supported renderer/admission version, and any visual-
   only variant dimensions. It cannot satisfy a `closed-door` state with open-door art or a Huge creature with a
   Small silhouette because a filename sounds close. Collision, footprint, cover, and mechanics remain owned by
   canonical geometry/state. Prototype validates three slots; MVP covers core families; broader compatible variant
   taxonomies promote only when repeated assets need them. Cost is medium schema and validator work.
2. **Visual rebinds obey the P10.10 anti-pop boundary.** A newly admitted payload may replace a fallback only before
   mount, at a scene transition/occlusion/governed crossfade, or through an explicit player preview/apply action. It
   does not change during an unresolved attack, focus choice, or material cue. The DM seat does not announce an art
   load as fictional change. Prototype can defer every rebind to remount; richer safe-boundary refinement promotes
   after evidence. Cost is low initially and medium for mature transitions.
3. **Mounted and in-flight resources are pinned; optional local payloads are budget-evictable.** Shipped approved
   assets remain immutable for their package version. Active-scene payloads, pending admission work, and the last
   valid rollback needed by an atomic migration cannot be evicted mid-use. Unmounted optional local exact art may
   evict under a visible size/age policy; a save reference alone does not turn the cache into permanent unlimited
   storage because its semantic fallback guarantees truthful load. Player locks/portable packs are later product
   options. Cost is medium accounting and remount QA.
4. **Cache cleanup operates on content hashes and never on canonical nouns.** Identical payloads deduplicate;
   derived thumbnails/transcodes may rebuild; quarantine has a bounded retention/report policy; cleanup records
   which optional visual payload disappeared and leaves semantic save refs/fallback intact. Prototype may use manual
   developer cleanup; MVP needs a bounded automatic budget and recovery; ideal adds player controls and predictive
   warming. Cost is medium-high storage tooling.
5. **Import/export packages are visual overlays, never world-state packages.** A pack declares schema, payload
   hashes, semantic slots/compatibility, provenance/rights/export permission, recipe/tool lineage where relevant,
   and required fallbacks. Import validates and quarantines before admission; it cannot add mechanics, citizens,
   items, discoveries, or DM facts. The current prototype needs only the envelope seam, not a polished pack UI.
   Sharing/mod workflows promote after rights and demand exist. Cost is medium now only if implemented, high at
   product breadth.
6. **Exact-art generation is `Off` by default and explicitly player-authorized.** Any future job or governed batch
   previews the subject, provider/tool, data leaving the device, estimated monetary/storage cost where known,
   destination/rights class, cancellation, and fallback. No DM model, renderer, cache miss, or save load silently
   spends money or sends world content to a generation provider. The current zero-cash prototype records requests
   only; richer consent presets reopen with an actual enrichment feature. Cost is low seam work, high mature UX/
   privacy/provider QA.
7. **Rights use conservative machine-readable states.** At minimum a payload is `UNKNOWN_QUARANTINE`,
   `LOCAL_ONLY`, `PRIVATE_EXPORT_ALLOWED`, `REDISTRIBUTABLE_PACK`, or `SHIPPABLE`, with source terms and review
   evidence. Transformation or admission cannot promote rights automatically. Unknown/incompatible assets retain
   local quarantine and never enter shipped/portable products. Professional review may later refine policy; the
   engineering default is not to guess. Cost is medium metadata/review work.
8. **Appearance pins remain presentation preferences, not mechanics or permanent decoder promises.** A world/profile
   may prefer an admitted compatible hash/style version. If unavailable or unsupported, resolution records the miss
   and uses the truthful ladder; it never refuses to load the dungeon. A later product choice may offer “preserve my
   look” versus “use current approved art,” but both remain downstream of canonical state. Cost is medium UI/
   compatibility work when promoted.
9. **Old-renderer retirement evidence belongs to P10.12.** The gate requires the locked same-state corpus in the new
   adapter; old-save projection; missing/corrupt-asset fallback; relevant performance/accessibility evidence; no
   canonical field accessible only through the old view; reproducible comparison captures; an archival diagnostic
   harness or evidence pack; and a rollback/repair path that does not rewind mechanics. Adam judges the real visual
   result then. No date or percentage is guessed now. Cost is medium temporary flag maintenance and later bakeoff.
10. **The zero-cash prototype does not build a generation service, sync system, mod marketplace, or broad cache UI.**
    It proves slot identity, one total offline fallback ladder, one candidate admission/rejection, one compact save
    reference, one interrupted migration/rollback, and one same-state old/new adapter capture using existing approved
    assets and constructed fallbacks. MVP adds only the lifecycle breadth the connected corpus uses. Ideal services
    require their named demand, rights, privacy, economics, and funding triggers. Cost is focused medium labor and
    approximately zero new cash.

These dispositions exhaust the technical branches generated by sections 11.115-11.117 without pretending their
later product gates have fired.

### 11.119 P10.11 explicit closure audit and final confirmation

#### Coverage and authority audit

| P10.11 concern | Audited disposition | Current proof | Later trigger/owner |
|---|---|---|---|
| Semantic visual identity | Stable semantic slot separated from versioned payload and canonical entity/state | Creature, stateful door, linked invented item | Core family breadth promotes from retained demand; P10.11 implementation owner |
| Resolution/fallback | Deterministic local admitted -> legacy -> construction -> marker/card ladder with receipts | Force candidate miss/rejection/corruption offline | Rich variants/player preference only after real need |
| Exact generation | Optional, explicit-consent, nonblocking candidate enrichment; never mechanics or runtime dependency | Record request while fallback remains | Real enrichment flow reopens timing/consent; funding/privacy/economics gate |
| Cache/save/storage | Immutable shipped package + content-addressed optional local cache + compact semantic save ref | Missing local candidate still loads truthful dungeon | Portable packs/sync/mods require rights and demand |
| Admission/taste | Typed technical fold plus retained in-game visual gate; rejection preserves fallback | One accepted and one rejected representative payload | Adam judges actual captures; volume may later justify independent automation |
| Provenance/rights | Source/tool/recipe/transformation/hash/use lineage with conservative distribution states | Envelope and quarantine path | Professional/product review before shipping/sharing |
| Migration/rollback | Versioned compatibility, atomic migration, interruption recovery, appearance-only pins | One forced v1 -> v2 interruption | Supported window and appearance UX grow only as needed |
| Old renderer | Feature-flagged laboratory through P10.12, not permanent dual-product promise | Same-state capture and semantic adapter switch | P10.12 evidence plus Adam's visual ruling owns retirement |
| Shipped/local boundary | Curated admitted high-frequency library plus optional local exact enrichment | Existing approved fallback plus one local candidate | Repeated demand, size, rights, economics, sharing/mod policy |
| Resource scope | Existing Mac/assets/tools and no new recurring service; seams before breadth | Small retained lifecycle fixture | Connected slice/funding fires bounded services or specialist work |

#### Contradiction audit

1. **No runtime network versus generated exact art:** the canonical noun and local fallback mount immediately;
   optional generation is an explicitly consented enrichment job outside the critical play dependency.
2. **Stable saves versus cache eviction:** saves preserve semantic descriptors and guaranteed fallback rather than
   requiring an unlimited optional-art cache. A missing preferred hash changes appearance only and is receipted.
3. **Visual migration versus world continuity:** migrations affect admitted presentation bindings only; entity ids,
   geometry, state, custody, evidence, actions, and DM history never migrate through art.
4. **Improved art versus anti-pop:** rebinds occur before mount or at a governed safe boundary, never during a
   material action merely because a payload arrived.
5. **Old-renderer safety versus permanent duplication:** the old theater is retained as a bounded laboratory through
   P10.12; retirement evidence is explicit, while indefinite supported dual-renderer maintenance is rejected.
6. **Licensing uncertainty versus prototype speed:** minimal provenance is captured immediately and uncertainty
   quarantines distribution rather than requiring a future forensic cleanup.
7. **Solo/no-budget work versus the exact-art dream:** current proof uses existing assets and deterministic
   fallbacks; services, sync, broad caches, and generation economics remain promoted goals rather than hidden bills.

#### Follow-up and ownership audit

- F10.11a-j all have a current technical policy, prototype/MVP/ideal mapping, cost, and promotion trigger.
- Compatibility, safe rebind, pin/evict, cleanup, import/export, consent, rights states, appearance pins, retirement
  evidence, and zero-cash scope are all explicitly dispositioned at section 11.118.
- **C1A** can carry the first slot/fallback/save-ref fixture; **C1H/C1I** exercise composition/material binding and
  geometry/plain fallback; the faceted sprite/model foundry supplies candidate admission examples without becoming
  canonical state; **P10.12** owns release-adapter comparison and old-renderer retirement evidence.
- Adam's future visual-taste gate and product/economics gates remain named and cannot be closed by technical test
  success alone.

There are **no unanswered current technical branches, no unmapped lifecycle concerns, and no ownerless accepted
feature goals**. Deferred product/taste decisions have explicit triggers rather than being treated as silently
closed. The only current P10.11 decision left is phased closure.

#### 1. P10.11 closure confirmation

**Option A - keep P10.11 open and ask Adam to decide its deferred technical/product details now.** This would create
more apparent specificity but would ignore the accepted authority split and make assumptions without a generator,
P10.12 captures, distribution data, rights review, or funding. Cost is high discussion churn and stale policy risk.

**Option B - close P10.11 on the audited phased basis and advance to P10.12 (recommended).** Technical B defaults are
locked as architecture; the prototype proves the small offline/reversible lifecycle; Adam's actual art taste returns
at retained capture gates; generation timing, renderer retirement, and shipped/local breadth reopen only from their
named evidence. A newly invented dungeon communicator therefore remains playable, portable, and provider-neutral
today without forcing a service, final art, or business model. Cost is low decision debt and preserves the ideal.

**Option C - close P10.11 by removing generated/local art and retaining only the current shipped renderer/assets.**
This reduces future systems but converts temporary budget and missing evidence into a permanent loss of world-
specific visual enrichment and reversible renderer evolution.

**Prototype/MVP/ideal:** Option B locks one small existing-asset lifecycle proof now, bounded core-family lifecycle
coverage in the playable MVP, and evidence/funding-triggered enrichment/distribution/renderer maturity later.
P10.12 would begin next; additive G10.1-G10.2 and Wave 10 would remain open. **Codex recommends Option B.**

### 11.120 P10.11 closure ruling - accepted technical defaults, retained taste gate, and evidence-triggered product breadth

Adam answered **yes**, accepting the recommended Option B phased closure at section 11.119.

- Stable semantic binding, deterministic offline fallback, shipped/local/save separation, provenance/rights
  lineage, and atomic versioned migration are accepted architecture.
- The retained lifecycle proof remains small and compatible with the current zero-cash posture: one creature, one
  stateful door, and one invented linked item across fallback, rejection, save ref, migration, and adapter capture.
- Adam's visual taste remains mandatory on real retained in-game admission captures. A technical fold cannot close
  that future gate.
- Exact-art timing, old-renderer retirement, and shipped-versus-local product breadth retain their provisional safe
  policies and reopen only from a real enrichment flow, P10.12 evidence, or distribution/rights/economics/demand.

P10.11 is **CLOSED** on this phased basis. P10.12 is now active. Additive G10.1-G10.2 and Wave 10 remain open; no
build is authorized and Wave 10 cannot close without Adam's explicit agreement.
