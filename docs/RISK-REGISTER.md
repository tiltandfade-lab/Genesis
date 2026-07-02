---
type: risk-register
status: STANDING — filed 2026-07-02 (the honest assessment, Adam-requested). Re-score after the playtest fortnight; re-read at every clean close.
created: 2026-07-02
---

# Genesis Risk Register

**Context (mitigating, on the record):** the 2026-07-01→02 design blitz was DELIBERATE — a
closing window of frontier-model availability ("Fable week"), spent on the highest-judgment
work (forks, doctrine, architecture) while it was cheap. The register's risks are the BILL for
that trade. **THE FREEZE (Adam, 2026-07-02): no new game systems after batch 3.** The queue is
now build → verify → PLAY → tune → craft. Specs that arrive as ideas get written to a parking
doc, not designed.

| # | Risk | Sev | State | Mitigation |
|---|---|---|---|---|
| R1 | **Unplayed hypothesis mass** — ~25 systems designed since the last real play data; design velocity outran validation ~20:1. The next playtest may invalidate assumptions other systems depend on. | HIGH | open | THE FORTNIGHT: ~10 instrumented sessions after batch 3 lands, before ANY new design. Instruments exist (session-cost-report, xpReport, provenance ratios, walk consumption). Expect casualties; cut them without mourning. |
| R2 | **DM attention overdraft** — 10+ soft digest fields + a runbook approaching sample-not-follow length. The walk-forgetting failure mode, multiplied. | HIGH | open | Provenance/consumption reports MEASURE which fields are read. After the fortnight: kill or consolidate dead fields; consider a per-turn "attention budget" (the digest leads with the 3 fields that matter THIS turn). Runbook length is itself a metric now. |
| R3 | **Review debt compounding** — ~1,500+ Sonnet-authored rows vs 50 approved samples; Adam's craft bar is every-row-up-to-par; spot-checks won't reach it. | HIGH | open | Honest accounting: the PROVISIONAL pile = WEEKS of craft time. Schedule it as real sessions (the re-authoring sweep absorbs it). Until then PROVISIONAL flags stay on and the corpus map tracks the unreviewed share. |
| R4 | **Breadth drift vs the depth doctrine** — the blitz added realms/kits/cultures/fabric in one sitting; individually defensible, the sum is breadth; forks resolved fast by a committee of two. | MED | accepted (window trade) | The FREEZE is the mitigation. Batch-3 units that playtests don't vindicate get parked, not polished. Re-read [[feedback-genesis-mvp-depth-over-breadth]] before any unfreeze. |
| R5 | **No DM behavior regression suite** — gates catch code; nothing catches "the model updated and narrates worse / ignores morale / coaches." The experience layer sits on unpinned model behavior. | HIGH | open → unit 12 | BATCH3 unit 12 (allowed under the freeze: protection, not expansion): fixture turns + a charter-scored eval (agency rules, narrate-from-rolls, budget, register). Run on every model change + weekly. |
| R6 | **Sterility risk** — mechanizing invention may kill the spark (the vanished-lover thread was an INVENTION Adam loved). The balance is felt, not proven; two days moved weight one way. | MED | open | The fortnight watches for it explicitly: seamHarvest gains nothing new — Adam's own felt sense is the instrument. §8.5 (invention licensed-but-captured) is the dial; turn it UP if sessions feel narrated-at. |
| R7 | **Product realism** — niche audience, metered-cost mental model, circling competitors; moat = corpus+architecture, not distribution. Months of unglamorous polish between here and a stranger's hands. | MED | accepted | Passion project honesty: the landmark path runs through the fortnight, the a11y gate, and finish-discipline — not more systems. Revisit at T3/T4 decision time. |
| R8 | **Generated-code debt at velocity** — 70+ modules, globals, overnight code merged at pace; the flaky size-test is the small warning. | MED | managed | The gate suite is the counterweight (41+ harnesses, honest-counts contract, personal re-runs). Keep the mutation-check discipline; fix flakes same-week; the ES-module migration stays deferred until the graphics engine forces it. |

| R9 | **The forever promise vs browser storage** — localStorage caps ~5–10MB; the universe grows unbounded by design (append-only ledger, codex, full dmlog prose). A years-long world WILL hit the wall, ugly, mid-session. Found in the final gap pass. | HIGH | open → unit 13 | BATCH3 unit 13 forever-guards: IndexedDB migration + history lifecycle (prose archives out past a threshold, the mechanical ledger stays whole) + the save-vintage fixtures harness (every historical format loads forever) + ATTRIBUTION.md (CC-BY compliance before anything ships). |

**Standing rules from the register:** 1) The freeze holds until the fortnight's data is read.
2) New ideas → `docs/PARKING.md`, one line each, undesigned. 3) Every clean close re-reads this
file. 4) Frontier time (when next available) goes to judgment work: fork resolution, craft
review, prose, eval design — never to what Sonnet can build from a locked spec.
