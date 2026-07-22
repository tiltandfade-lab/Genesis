---
type: design-study
status: OPEN
wave: 10
part: 6
legacy_sections: "11.76-current"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Wave 10 — Party and Scene Continuity

Continue the chronological Wave 10 record from
[Part 05](05-consequence-presentation.md). P10.9 and Wave 10 remain open; no build is authorized.

### 11.76 F10.9e.1 ruling and F10.9f expansion - cold separation accepted; same-scene autonomy precedes party splitting

**Adam's ruling (2026-07-22):** choose Option B. A forcibly and persistently separated pre-alpha companion becomes a
**cold canonical record with no self-directed advancement**. The record preserves actor identity, last/exact/known
location as legally available, holder/custody, condition, inventory, viewpoint knowledge, separation cause/time,
and legal remount/return handles. The companion owns no active child SceneLineage, takes no independent action,
discovers nothing, and cannot advance through Gemini prose. Ordinary site/world events owned elsewhere may still
affect them through canonical receipts. They remount only when the main-PC scene reaches them or another validated
transfer/reunion event returns them.

This is a **PLAYABLE PRE-ALPHA/MVP continuity obligation** and maps to C2G: one capture/separation receipt, one
externally owned consequence, save/load, and exact remount. It preserves capture, loss, collapse, and delayed rescue
without building split-party play. Option A's blanket content prohibition is rejected as too restrictive; Option C's
offscreen action menu is deferred because it would rebuild child-branch simulation under another name.

Adam also set a feature priority and new design requirement:

> "i do think that eventually I would like for the companions to be able to act on their own within the scene I think i would rather implement that before party splitting. That way if I am in a market scene the rogue could wander off and get into trouble if he wanted. This could be toggleable in settings, but it could make for interesting gameplay. Though we probably would need to define limits on the actions of the \"rogue\" PC"

This is accepted as a **same-scene autonomy feature goal that precedes split-party work**. It does not reopen the
single-main-PC premise: this record treats the quoted `rogue PC` as a companion/sidekick citizen rather than a second
human-controlled PC. If Adam meant a second directly controlled PC, that would reopen F10.9c's control law.

The distinction is architectural and experiential:

- **same-scene autonomy:** the rogue leaves formation but stays inside the currently mounted market SceneLineage;
  their movement, target, action, witnesses, custody changes, suspicion, and consequences use the ordinary scene
  clock and owners;
- **split-party play:** the rogue leaves for another independently advancing location with its own time, events,
  viewpoint, save state, and reconciliation. That remains later.

C4D now owns the feature ordering. It first proves one market companion wandering within the mounted scene and
committing one certified characterful action that can create trouble. It must reuse validated actions, identity,
knowledge, custody, relationships, attention, consequence receipts, and the player setting. Gemini may propose and
narrate intent but cannot commit mechanics. Exact companion tactics and personality remain coordinated with Waves
6-7; P10.9 owns continuity and cross-mode limits.

#### F10.9f - how much may an autonomous companion do inside the active scene without asking the player?

In plain English: the main PC is bargaining at a market stall. The rogue companion becomes interested in a merchant's
locked cashbox and drifts through the same visible market. The feature should create character and possible trouble,
not let an AI spend the player's treasured items, accept an oath for the party, murder a shopkeeper, or hijack the
campaign. What is the autonomy boundary?

**Option A - autonomous movement and intent, approval before every canonical action.** With autonomy enabled, a
companion may leave formation, choose a nearby focus, converse as color, and surface a proposed action. Any roll,
object interaction, custody change, resource spend, relationship change, secret search, lawbreaking, hostility risk,
or other committed consequence waits for player approval.

- **Dungeon/market example:** the rogue crosses to the cashbox and the DM says they are eyeing its lock. The player
  must approve `try to lift the purse` before an action receipt or roll exists.
- **Gemini-DM example:** Gemini can express temptation and personality, but its proposed intent stays a validated
  pending choice; silence or refusal returns the rogue to harmless behavior.
- **Cost:** **medium movement/focus/intent/UI work and low autonomy-policy risk**, but high interruption and novelty
  debt. The companion cannot truly get the party into trouble without the player choosing the trouble first.

**Option B - bounded autonomy with a player-set risk ceiling and hard red lines (recommended).** Each companion has
an engine-owned behavior profile, active-scene roaming envelope, small action budget/cooldown, and per-companion
setting such as `Off`, `Cautious`, or `Characterful`. The engine offers certified legal actions tagged by impact and
foreseeable risk. Within the selected ceiling, the companion may commit without advance approval; consequences may
still exceed expectations when an honestly low/moderate-risk act goes badly. Gemini may choose or phrase a semantic
intent only from those certified candidates; the validator commits the exact action and roll.

The initial hard red lines are:

1. cannot leave the active scene or create a child branch;
2. cannot move, speak for, spend the action, or make a binding personal choice for the main PC;
3. cannot spend, transfer, destroy, wager, or expose shared, unique, quest, or protected player resources;
4. cannot accept/reject a binding quest, oath, contract, faction allegiance, romance, recruitment, dismissal, or
   permanent party commitment;
5. cannot intentionally reveal protected PC secrets or consume knowledge the companion does not have;
6. cannot deliberately initiate lethal force or attack a nonhostile, although an honestly licensed lower-risk act
   may still be discovered and cause hostility or combat as a consequence;
7. cannot select an action certified above the player's risk ceiling, even though a legal lower-risk action may
   produce an unexpectedly severe consequence;
8. cannot invent a mechanic, target, object, relationship, secret, or permission merely because Gemini's prose wants
   it.

- **Dungeon/market example:** `Off` keeps the rogue in formation. `Cautious` permits browsing, conversation, public
  inspection, and reversible repositioning. `Characterful` may permit a certified low/moderate-risk pickpocket
  attempt against an ordinary purse inside the market. If caught, suspicion, pursuit, loss of trust, or even a fight
  may truthfully reconfigure the same scene. The rogue still cannot steal the PC's quest key, attack the merchant as
  an opening choice, or disappear into another district.
- **Gemini-DM example:** Gemini selects or voices `tempted by ordinary purse` only when the engine supplies that
  candidate from the rogue's traits, knowledge, risk setting, target, and scene law. The roll, custody transfer,
  witnesses, and consequences come from canonical resolution. Gemini cannot upgrade the purse into a crown jewel or
  conceal the committed trouble from the player-facing scene.
- **Cost:** **high but bounded behavior-policy, certified-action, risk-tag, setting, cooldown, attention, save/replay,
  secrecy, and adversarial QA work**. It reuses one active simulation and avoids branch time/reconciliation. Ongoing
  maintenance is concentrated in explicit action certification rather than arbitrary prompt behavior.

**Option C - broad goal-driven autonomy over any legal same-scene action.** With autonomy enabled, the companion may
choose from most actions available to an NPC or PC according to personality, goals, and current opportunity. The
engine validates legality but applies few player-specific red lines beyond not directly controlling the main PC and
not leaving the scene.

- **Dungeon/market example:** the rogue may attempt the cashbox, threaten a witness, spend personal or shared money,
  start a fight, promise a favor, or use a powerful carried item if those are legal actions and fit its current goal.
- **Gemini-DM example:** Gemini and the behavior system can create surprising character drama, but prompt/policy
  variation may repeatedly make irreversible party decisions the player experiences as sabotage rather than agency.
- **Cost:** **very high consent, balance, content certification, prompt, correction, save/replay, support, and player-
  trust cost**. A toggle does not repair campaigns already altered by an action whose authority was too broad.

**Codex recommendation: Option B.** It allows the rogue to cause genuine unscripted trouble inside the market while
keeping player ownership of the main PC, protected resources, binding commitments, lethal intent, secrets, and
scene boundaries. `Off` preserves the formation-only game; `Cautious` supplies visible personality with little risk;
`Characterful` licenses bounded risk. C4D must land and be playtested before any split-party feature begins.

If B is accepted, the next generated follow-up is **F10.9f.1: when does the player see an autonomous intention and
receive a chance to intervene—before commitment, during a readable attempt, or only through its consequences?** That
notice law must preserve surprise and character agency without making the companion feel like an invisible random
event or restoring approval prompts for every act.

Does Adam choose **A, B, or C**, or want to amend the settings, risk ceiling, or hard red lines? P10.9 and Wave 10
remain **OPEN**; no build is authorized.
