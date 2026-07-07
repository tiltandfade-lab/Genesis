# Round 2 Advice: Claude's Table-Row Contract Translation

This note responds to Adam's follow-up question: did Claude implement the GPT table-row advice correctly, and what should future agents keep in mind?

## Verdict

Claude translated the original GPT advice well.

The important advice was not "write prettier rows." It was: make table rows functionally playable. A row should put something on screen, give the player a handle, create pressure, imply payoff or cost, and point at the state bucket that remembers the consequence.

Claude's implementation preserved that core idea by turning it into a structural contract:

- `table_family`
- `row_contract: draft | enforced`
- `remembers: ...`
- required family roles
- lint checks for missing columns and empty cells

That is the right move. It makes the contract inspectable without pretending the linter can judge prose quality.

## What Claude Got Right

### 1. Structural lint, not vibe lint

The original GPT advice warned against banning vague words or trying to lint "good writing." Claude respected that.

Good:

- check whether a row has the required anatomy
- check whether required cells are non-empty
- check whether the table says what state bucket remembers it

Bad:

- ban words like "someone" or "mysterious"
- score prose by keyword frequency
- pretend the linter can tell whether a row is beautiful

The issue is missing function, not specific vocabulary.

### 2. Draft/enforced ratchet

Claude made the contract survivable by adding a ratchet:

- `draft` means "show me the worklist"
- `enforced` means "this table has earned the gate"

That is much better than trying to migrate the whole corpus in one heroic pass. The corpus can improve table by table.

### 3. Five schemas instead of taxonomy sprawl

The original GPT note named more families loosely: item, situation, place, journey, hazard, social, omen, breach.

Claude collapsed those into five underlying runtime schemas:

- `situation`
- `item`
- `place`
- `journey`
- `rumor`

That was a good engineering choice. `hazard` and `breach` can alias to `journey`; `social` can alias to `situation`; `omen` can alias to `rumor`.

This keeps the authoring surface teachable and avoids a dozen near-duplicate schemas.

### 4. Opt-in scope

Claude made the checks opt-in with `table_family`. That matters.

Genesis has many tables that are not directly playable runtime content rows. Forcing every table through the five schemas would create fake failures and encourage dishonest column names.

Opt-in lets the project tag only the tables whose rows are meant to become play.

### 5. Adam's craft remains Adam's craft

Claude correctly separated the measuring instrument from the rewrite itself.

The linter can say:

- this situation table has no pressure column
- this item table has no use/ranks column
- this table forgot `remembers`

It cannot write the actual row with the right tone, specificity, and bite. That is the craft pass.

## The Main Caution

The five families are not "all Genesis table kinds."

They are the five families for runtime content rows the DM or player experiences directly.

Future agents should not read the contract as:

> every table must become situation/item/place/journey/rumor

They should read it as:

> if this table creates direct play content, one of these five should probably fit; if it feeds another system, exempt it or define a small special family later.

## Tables That Should Not Be Forced Into The Five

### Lens or motif tables

Examples:

- Walk Skin
- Walk Breach
- Walk Nightmare
- atmosphere lens tables
- tone/color/texture/motif overlays

These modify another result. They are not themselves journey beats.

Advice:

- keep them exempt for now
- later add `lens` only if there are enough of them to justify it

Possible anatomy:

`Band | Motif/Lens | Sensory Tell | Rule Of Use | Compatible Context | Escalation`

### Pointer or key tables

Examples:

- Plot Item
- Plot Lock
- clue pointers
- keys, seals, wards, unlock conditions

These are not ordinary `item` rows. Their job is to point, open, block, prove, or connect.

Advice:

- do not force them into `item` just because there is an object
- later add `pointer` if the craft pass reaches these tables

Possible anatomy:

`Band | Pointer | Opens/Blocks | Evidence | Holder/Location | If Misused`

### Mechanic or result tables

Examples:

- crit outcomes
- morale outcomes
- rest results
- check consequences
- consequence ladders

These resolve a trigger. They are closer to rules output than scene content.

Advice:

- do not make them pretend to be situations
- use a result-shaped contract if they need one

Possible anatomy:

`Band | Trigger | Immediate Result | Cost/Benefit | State Event | Follow-On`

### Generator grammar tables

Examples:

- names
- fragments
- species traits
- visual parts
- model recipes

These are ingredients. They become playable only after composition.

Advice:

- leave them outside the row-family linter
- validate them with grammar/composition tests instead

Possible anatomy:

`Slot | Token | Constraint | Register | Combines With`

### Contract or vocabulary tables

Examples:

- event contract tables
- schema notes
- state-shape vocabulary
- provider/model recipes

These are system truth, not authored play content.

Advice:

- validate with contract tests, not row-anatomy tests

Possible anatomy:

`Key | Meaning | Accepted Shape | Owner | Test`

## The Best Next Adjustment

Add one explicit doctrine line wherever future agents read the table contract:

> The five families cover runtime content rows, not every table in Genesis. Lens, pointer, result, grammar, and contract tables are exempt unless and until they receive their own mini-family.

That one sentence prevents the main misuse.

## Suggested Authoring Workflow

1. Ask: does this table create direct play content?
2. If yes, choose one of the five runtime families.
3. If no, classify it as lens, pointer, result, grammar, contract, generated, or other infrastructure.
4. For runtime rows, make the row answer at least two of the six questions.
5. For exempt rows, validate the system they feed instead of forcing fake row anatomy.
6. Keep `draft` until Adam has done the craft pass.
7. Flip to `enforced` only when the table's shape is honest and useful.

## Practical Review Checklist

When reviewing a future Claude/Sonnet table-row change, ask:

- Did it preserve the original row's job?
- Did it pick a family because the table fits, not because a linter needed appeasing?
- Does `remembers` name a real state bucket?
- Does Grounded still produce play, or did it become filler?
- Do high-band rows create real consequence, not just louder adjectives?
- Are lens/pointer/result/grammar/contract tables exempted or handled by a more honest mini-family?
- Did the change avoid word-ban lint and prose-vibe scoring?

## Final Read

Claude did the right thing with the GPT advice: it turned a design principle into a usable ratchet.

The next responsibility is restraint. Keep the five families strong by not making them cover tables they were not designed for.

The contract should make playable rows more playable. It should not make infrastructure tables pretend to be scenes.
