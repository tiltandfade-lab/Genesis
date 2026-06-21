# DM Bridge fixtures

Example `TurnRequest` / `TurnResponse` pairs for the DM Bridge (spec: `docs/DM-BRIDGE.md`).
They are the contract made concrete and they double as the integration-test corpus
(`dev/verify-bridge.py` replays them through the bridge; the jsdom event-runtime test feeds the
responses' `events[]` to the in-browser `applyEvent`).

Each scenario is a `*.turn.json` (what the app POSTs to `/turn`) + a `*.response.json` (what the
DM writes back, served by `/response`). All four share one coherent world — the Saltmarsh Shrine.

| scenario | exercises |
|---|---|
| `social`  | a check-result narrated FROM the player's roll → `fact_canonized` + `clock_advanced` + an `ask` (three options + "or something else") |
| `travel`  | a DM-declared move → `discovery` (mints a map node) + `clock_advanced` on a front |
| `combat`  | the **roll handshake** — the DM returns a `rollRequest` and NO events (it never resolves the roll itself) |
| `combat-resolve` | the next turn carries the player's open roll → `encounter_resolved` + `kill` + an `adjudication` precedent |

Conventions checked by these fixtures:
- `events[]` use the **exact `EVENT-CONTRACT.md` envelope** (`type` / `payload` / `source`).
- `rolls` always travel **into** the turn; the DM narrates from them and never fabricates them.
- `clockId` is a slug the app fuzzy-matches to a faction (`tide-wardens`) or a front by its danger.
