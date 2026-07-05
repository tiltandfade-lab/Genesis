---
type: system-spec
project: Genesis
status: SPECCED 2026-07-05 — Adam's ruling: no omniscient NPCs (unless rolled); threat knowledge
  unfolds signs → rumor → named through real witness channels. Script owns the CEILING of what
  any mouth may say; the DM voices below it. Sonnet-executable.
created: 2026-07-05
related:
  - "[[MONSTER-STORY-WIRING]]"
  - "[[SESSION-PREP]]"
  - "[[DM-CHARTER]]"
  - "[[CODEX]]"
---

# NPC-KNOWLEDGE-GRADES — the housecleaner does not hand out dragon quests

## §0 The ruling (Adam, 2026-07-05)

"Conversations only ever to the extent of the NPC's knowledge. No omniscient NPCs (unless that's
a character that gets rolled). An NPC talking about a young dragon isn't saying it's a young
black dragon deep in a 9-segment dungeon — that unfolds naturally. Maybe someone who escaped a
dungeon whose party was slaughtered would know, and maybe he spread a rumor."

Ground truth: the architecture is signs-first (threat tables carry a `signs` column; pressures
veiled; codex dm/fields split; charter slow-drip) — but the ceiling is charter-held, not
script-held, and MONSTER-STORY-WIRING's threatBinding pitch law ("SHOULD name the creature")
is a live leak: a questgiver names the resolved boss with no witness.

## §1 The grade ladder (script-owned ceiling per threat)

Per prepped-walk threat (and per significant creature codex record), a `knowledge` grade:

- **`signs`** (DEFAULT — every fresh threat): the world knows effects only — tracks, absences,
  sounds, wing-shadow at dusk. Vocabulary = the threat table's own `signs` column verbatim.
- **`rumor`**: a WITNESS CHANNEL exists on record — see §2. Speech at this grade is partial,
  distorted, second-hand (kind, rough size/danger, direction; NEVER the stat identity, count,
  or lair layout). Distant Word's distortion architecture is the register standard.
- **`named`**: PC contact (codex `known:true` — the party earned it), or a direct rolled
  witness speaking for themselves.

## §2 Witness channels (rolled + recorded, never assumed)

At prep time (prep-bundle / hook-roll), each threat rolls ONE witness check, d100:
1–70 none (stays signs) · 71–90 **indirect channel** (rumor grade: a Distant Word citation, a
faction scout report, livestock-ledger talk — recorded as `witness:{type:"channel", via}`) ·
91–100 **survivor** (rumor grade + a MINTED castable NPC: `witness:{type:"survivor", npcId}` —
rolled via the ambient-NPC pool, stamped with one true detail and one distortion; "the one who
crawled out" is a character, not a database row). Spice modifies: Strange+ walks +10 to the
roll (weird things get talked about). Recorded on the prepped frontier; immutable once rolled.

**Omniscient exceptions are ROLLED, never assumed:** seer/oracle-archetype NPCs (and Strange+
flavor rows that explicitly grant sight) may carry `knowledge:"named"` beyond their witness
basis — the exception enters through the dice like everything else.

## §3 Wiring

1. **threatBinding** (quest-hook.js): gains `knowledge` + `witness` from the frontier's roll.
   THE PITCH LAW INVERTS: pitch AT the grade — signs-grade hooks pitch effects ("something has
   been emptying the valley farms"), rumor-grade may relay the witness's distorted account,
   named only via the witness in person. (IMMEDIATE MITIGATION, first commit of the unit:
   demote the existing "SHOULD name the creature" contract lines in MONSTER-STORY-WIRING.md +
   SYNTHESIS-CONTRACT.md + DM-BRIDGE.md to signs-grade until the grade field flows.)
2. **Digest**: the activeWalk threat block + hook block carry `knowledge` (+ witness ref). One
   rule line: "Every NPC speaks AT OR BELOW the stamped grade; only the listed witness may
   exceed it; grades rise only through play (contact, or meeting the witness)."
3. **Grade promotion is event-driven**: PC contact (combat_start vs the threat / codex known)
   → named. A rumor the PARTY spreads (DM fires codex_add/canon note) can raise other NPCs'
   ceiling to rumor — knowledge propagates through play, exactly the dragon-survivor loop.
4. **Codex**: significant-creature records store `fields.knowledge` so recurring threats keep
   their public profile across sessions.

## §4 Build + verify

Branch `feat/npc-knowledge-grades` off master. Files: prep-bundle.js (witness roll), quest-hook.js
(grade+witness on threatBinding, pitch fields), dm.js (digest carry + rule line + promotion at
combat_start), the three doc demotions (§3.1), DM-CHARTER one-liner. Harness (extend
verify-monster-story.mjs §8 region or new file): default grade signs; witness roll distribution
(~70/20/10 over 1000); survivor mints a real castable NPC; threatBinding pitch fields match
grade; contact promotes to named; MUTATION red-first: remove the grade stamp → hooks carry the
creature name at signs grade → fail. Regression: verify-monster-story, verify-prep-bundle,
verify-realm-wiring, verify-dm-events; gauntlets. NOTE: Phase 2b's F4 unit is concurrently
editing dm.js's codexMintSignificantFoes region — keep your dm.js edits to combatDigest/
activeWalkDigest/the promotion hook and expect a coordinated merge by the orchestrator.

## §5 Decisions (flag to veto)

| # | Decision | Ground |
|---|---|---|
| 1 | signs is the universal default; grades only rise through rolled channels or play | no omniscient NPCs; the unfolding IS the fiction |
| 2 | Witness d100 70/20/10, +10 Strange+ | rare survivors; weird travels; tunable constant |
| 3 | Survivor = minted castable NPC w/ one truth + one distortion | witnesses are characters; distortion is the rumor register |
| 4 | Pitch law inverts to at-grade | fixes the MONSTER-STORY leak; dread before taxonomy |
| 5 | Rolled seers may exceed their basis | Adam's "unless that's a character that gets rolled" |
