/* HQ3-D3 harness self-check — proves the CLI-level lifecycle end to end, not just the in-process
   assertions in verify-roll-branches.mjs / playtest-bug-probes.mjs. Drives the REAL
   dev/playtest-bridgeless.mjs subcommands as separate processes (exactly like the orchestrator
   would), reading state.json between steps.

   Scripted flow (per docs/HQ3-D-STATE-CODEX-HARNESS.md HQ3-D3 verify plan):
     init → digest → apply(rollRequest with branches) → roll(seed a nat-20)
       → [assert state.json pendingRoll]
       → roll again [assert recovered:true]
       → digest [assert pendingRoll preserved + echoed]
       → apply(follow-up response) [assert pendingRoll cleared]

   Run:  node dev/verify-harness-d3.mjs
   (No jsdom import here — this file only shells out to the harness CLI + reads its state.json.) */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLI = join(ROOT, "dev", "playtest-bridgeless.mjs");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

function run(cmd, extraArgs) {
  const out = execFileSync("node", [CLI, cmd, ...extraArgs], { encoding: "utf-8" });
  return JSON.parse(out);
}
function readState(dir) {
  return JSON.parse(readFileSync(join(dir, "state.json"), "utf-8"));
}

const dir = mkdtempSync(join(tmpdir(), "genesis-hq3-d3-"));
try {
  // 1) init — roll a world + L1 PC.
  const initRes = run("init", ["--dir", dir, "--brief", "{}"]);
  check("init produced a world", !!(initRes && initRes.ok), JSON.stringify(initRes));

  // 2) digest — log the opening action, mint a turnId.
  const dg1 = run("digest", ["--dir", dir, "--action", "I climb the crumbling wall."]);
  check("digest returned a turnId", typeof dg1.turnId === "string", JSON.stringify(dg1));

  // 3) apply — the DM hands back a BRANCHED rollRequest (dc+branches: nat 1/20 always falls through
  // for this shape; a normal 2-19 would resolve locally instead — the nat-20 case is what D3 covers).
  const branchedResponse = () => ({
    turnId: dg1.turnId, narration: "The wall looms; you'll need to roll for it.", events: [],
    rollRequest: {
      skill: "Athletics", ability: "str", dc: 12,
      branches: {
        success: { narration: "You haul yourself over the lip.", events: [] },
        nearMiss: { narration: "Your fingers catch — barely.", events: [] },
        fail: { narration: "The wall sheds you.", events: [] },
      },
    },
  });
  let apRes = run("apply", ["--dir", dir, "--response", JSON.stringify(branchedResponse())]);
  check("apply set a pending rollRequest", !!apRes.rollRequest, JSON.stringify(apRes));

  // 4) roll — hunt a seed that lands a natural 20 (or 1) so the check falls through to the live
  // flow instead of resolving locally via resolveBranch (STATE-HYGIENE deterministic RNG — the
  // seeded mulberry32 makes this reproducible run-over-run, unlike bare Math.random()).
  let rollRes = null, foundSeed = null;
  for (let seed = 1; seed <= 500 && !foundSeed; seed++) {
    const r = run("roll", ["--dir", dir, "--seed", String(seed)]);
    if (r.liveResolutionNeeded && r.pending) { rollRes = r; foundSeed = seed; break; }
    // didn't land nat 1/20 — this rollRequest is now consumed (resolved locally); reissue it and
    // try the next seed.
    apRes = run("apply", ["--dir", dir, "--response", JSON.stringify(branchedResponse())]);
  }
  check("found a seed producing a nat-1/20 fall-through within 500 tries", !!foundSeed, `foundSeed=${foundSeed}`);
  check("that roll reports liveResolutionNeeded + pending + recovered:false (fresh fall-through)",
    !!(rollRes && rollRes.liveResolutionNeeded && rollRes.pending && rollRes.recovered === false),
    JSON.stringify(rollRes));

  // 5) assert state.json actually persisted {action,rolls,ts} into w.dm.pendingRoll (survives the
  // process boundary — this IS the "second process reads it" proof, since `run()` shells a fresh
  // node process per subcommand).
  let state = readState(dir);
  const worldId = state.U.activeWorldId;
  const world = state.U.worlds[worldId];
  const persisted = world.dm && world.dm.pendingRoll;
  check("state.json holds w.dm.pendingRoll={action,rolls,ts} after the fall-through",
    !!(persisted && typeof persisted.action === "string" && Array.isArray(persisted.rolls) && typeof persisted.ts === "number"),
    JSON.stringify(persisted));

  // 6) roll again — GS.dm.rollReq/w.dm.rollReq are both null now (consumed), so this must recover
  // off pendingRoll instead of silently reporting nothing pending.
  const rollAgain = run("roll", ["--dir", dir]);
  check("a second roll recovers the persisted pendingRoll (not \"no pending rollRequest\")",
    rollAgain.ok === true && rollAgain.liveResolutionNeeded === true && rollAgain.recovered === true && !!rollAgain.pending,
    JSON.stringify(rollAgain));

  // 7) digest between the fall-through and the follow-up turn — must NOT null pendingRoll (the
  // SET-05-NOTE-A footgun) and must echo it (+ the rollReq it clears) in its own output.
  const dg2 = run("digest", ["--dir", dir, "--action", "(the player waits on the DM's reply)"]);
  check("a mid-roll digest preserves pendingRoll in its output", !!dg2.pendingRoll, JSON.stringify(dg2));
  state = readState(dir);
  const worldAfterDigest = state.U.worlds[worldId];
  check("a mid-roll digest does not null w.dm.pendingRoll on disk",
    !!(worldAfterDigest.dm && worldAfterDigest.dm.pendingRoll), JSON.stringify(worldAfterDigest.dm));

  // 8) apply the follow-up turn's response — the natural clear point.
  const followUp = { turnId: dg2.turnId, narration: "You scrabble but the wall wins; you drop, winded.", events: [] };
  run("apply", ["--dir", dir, "--response", JSON.stringify(followUp)]);
  state = readState(dir);
  const worldAfterApply = state.U.worlds[worldId];
  check("applying the follow-up turn's response clears pendingRoll",
    worldAfterApply.dm && worldAfterApply.dm.pendingRoll === null,
    JSON.stringify(worldAfterApply.dm));
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
