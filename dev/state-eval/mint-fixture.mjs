/* dev/state-eval/mint-fixture.mjs — STATE-HYGIENE-EVAL §8.4 fixture minting tool.
   Lifts a real turn (a player line + the following dm line, with its state snapshot) out of a
   bridgeless-shape save file and stamps it into the fixture JSON shape (§4). Emits `expect:{}`
   stubbed — the executor fills the grammar (§3) per the fixture table by hand afterward.

   CLI (complete, §8.4):
     node dev/state-eval/mint-fixture.mjs --state <snapshot.json> --dmlog-index <n> --id <hx-NN-slug>
       --kind <kind> --seed <n> [--out dev/state-eval/fixtures/]

   Refuses (exit 2, "no living PC in snapshot") when the snapshot's last character isn't
   status:"living". Stamps source.telemetryTurnId by matching the dm-line's turnId against
   .dm/telemetry.jsonl when that file exists (read-only, safe during live play).
*/
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) { a[argv[i].slice(2)] = argv[i + 1]; i++; }
  }
  return a;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const statePath = args.state;
  const idx = parseInt(args["dmlog-index"], 10);
  const id = args.id;
  const kind = args.kind;
  const seed = args.seed != null ? parseInt(args.seed, 10) : 1;
  const outDir = args.out || join(ROOT, "dev/state-eval/fixtures");

  if (!statePath || !existsSync(statePath)) {
    process.stderr.write("--state <snapshot.json> required and must exist\n");
    process.exit(2);
  }
  const snap = JSON.parse(readFileSync(statePath, "utf-8"));
  const w = snap.U.worlds[snap.U.activeWorldId];
  const lastChar = (w.characters || []).slice(-1)[0];
  if (!lastChar || lastChar.status !== "living") {
    process.stderr.write("no living PC in snapshot\n");
    process.exit(2);
  }
  const dmlog = w.dmlog || [];
  const dmLine = dmlog[idx];
  if (!dmLine || dmLine.role !== "dm") {
    process.stderr.write(`dmlog[${idx}] is not a dm line (role=${dmLine ? dmLine.role : "undefined"})\n`);
    process.exit(2);
  }
  // the player line immediately preceding it, verbatim (verbatim-player-dialogue law)
  let playerLine = null;
  for (let i = idx - 1; i >= 0; i--) {
    if (dmlog[i].role === "player") { playerLine = dmlog[i]; break; }
  }

  // telemetry provenance (read-only; safe during live play)
  let telemetryTurnId = null;
  const telemetryPath = join(ROOT, ".dm/telemetry.jsonl");
  if (dmLine.turnId && existsSync(telemetryPath)) {
    const lines = readFileSync(telemetryPath, "utf-8").split("\n").filter(Boolean);
    for (const line of lines) {
      try {
        const row = JSON.parse(line);
        if (row.turnId === dmLine.turnId) { telemetryTurnId = row.turnId; break; }
      } catch (_) {}
    }
  }

  const fixture = {
    id, kind, seed,
    source: {
      session: statePath.split("/").slice(-2, -1)[0] || null,
      stateFile: statePath.replace(ROOT + "/", ""),
      dmlogIndex: idx,
      telemetryTurnId,
      kind: "real",
    },
    state: snap,
    turn: {
      action: playerLine ? playerLine.text : "(the player waits)",
      rolls: (playerLine && playerLine.rolls) || [],
    },
    response: {
      narration: dmLine.text || "",
      events: dmLine.events || [],
      rollRequest: dmLine.rollRequest || null,
      ask: dmLine.ask || null,
      gen: dmLine.gen || null,
    },
    resolvedBranch: dmLine.branchResolved ? (dmLine.resolvedBranch || null) : null,
    expect: {},
  };

  const outPath = join(outDir, id + ".json");
  writeFileSync(outPath, JSON.stringify(fixture, null, 2) + "\n");
  process.stdout.write(`wrote ${outPath}\n`);
}

main();
