/* Verify the DM CONTRACT ARTIFACT — the three-way drift guard (docs/DM-CONTRACT-ARTIFACT.md §6).
   dm-contract.json is the ONE machine-readable DM↔engine contract; this harness proves that the
   artifact, the live runtime registries, and the seat prompts all agree:

     A. artifact ↔ generator  — regenerating from source reproduces the committed artifact byte-for-byte.
     B. artifact ↔ runtime    — event set / sources / digest shape / per-event fields+aliases all match
                                the live DM_EVENT_TYPES / DM_EVENT_SOURCES / DM_EVENT_FIELDS / DM_DIGEST_KEYS.
     C. examples fold clean    — every worked example folds through the LIVE dmFoldPayload with zero drift
                                (+ the BUG-01 mutation assertion: a bogus key MOVES the ledger by exactly 1).
     D. artifact ↔ prompt      — the seat prompt's §events section teaches only real types + real fields.
     E. seat consumer          — seatEventVocabulary reads the registry (proven under an applyEvent mutation
                                that breaks the retired toString-regex) + seatValidate drops unknown types.

   Same "const-via-eval into one jsdom scope" pattern as dev/verify-dm-seam.mjs.

   Run:  node dev/verify-dm-contract.mjs
   (jsdom resolved per CLAUDE.md "headless test"; override JSDOM_HOME if not at ~/.genesis-jsdom.) */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
let JSDOM;
try {
  ({ JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom"));
} catch (e) {
  console.error("jsdom not found — install per CLAUDE.md: `npm i jsdom` in ~/.genesis-jsdom (or set JSDOM_HOME).");
  process.exit(2);
}

const man = JSON.parse(read("manifest.json"));
const srcText = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;
// surface the few registry/runtime symbols the harness inspects onto window (const/function decls
// share the eval lexical scope but aren't window.* under indirect eval — the documented gotcha).
const expose = ";" + [
  "DM_EVENT_TYPES", "DM_EVENT_SOURCES", "DM_EVENT_FIELDS", "DM_DIGEST_KEYS",
  "dmFoldPayload", "dmDigest", "seatEventVocabulary", "seatValidate", "ledgerOf",
].map((n) => `try{window.${n}=${n};}catch(e){}`).join("");

function freshDom() {
  const dom = new JSDOM(
    `<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" }
  );
  const win = dom.window;
  win.eval(harness + "\n" + srcText + "\n" + expose);
  win.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  return win;
}

// ONE founded world for the digest/ledger checks (mirrors verify-dm-seam's scaffold).
function seedWorld(win) {
  const world = {
    id: "w-contract", name: "The Contract Test",
    seed: { master: { name: "Test Hold", desc: "d" }, smell: { name: "s" }, sound: { name: "s" }, arch: { name: "a" },
            taboo: { name: "t", desc: "d" }, myth: { name: "m", desc: "d" } },
    characters: [{ status: "living", name: "Tester", headline: "a climber", pronouns: "they",
      sheet: { species: "Human", class: "Fighter", background: "Folk Hero", level: 3, hp: "20/20", ac: 15,
               profBonus: 2, scores: {}, mods: { str: 2, dex: 1 }, saveProfs: [], skillProfs: ["Athletics"], inventory: [] } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [], pressures: [], revealed: {}, dmlog: [],
  };
  const originId = win.addNode(world, "Test Hold", "Setting");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  return world;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

const setEq = (a, b) => {
  const A = new Set(a), B = new Set(b);
  if (A.size !== B.size) return false;
  for (const x of A) if (!B.has(x)) return false;
  return true;
};
const deepEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ============================================================
// A. artifact ↔ generator (2 checks)
// ============================================================
{
  let genOk = false, genOut = "";
  try {
    genOut = execFileSync("python3", ["build/gen-dm-contract.py"], { cwd: ROOT, encoding: "utf-8" });
    genOk = true;
  } catch (e) {
    genOut = (e.stdout || "") + (e.stderr || "");
  }
  check("A1 generator check-mode exits 0 (source regenerates the committed artifact byte-identically)",
    genOk, genOut.trim());

  let contract = null, parsed = false;
  try { contract = JSON.parse(read("dm-contract.json")); parsed = true; } catch (e) { /* missing/bad */ }
  check("A2 dm-contract.json parses and contractVersion === 1",
    parsed && contract && contract.contractVersion === 1, parsed ? "version=" + (contract && contract.contractVersion) : "unparseable/missing");
}

// Load the artifact once for the runtime/example/prompt checks below (guarded — B/C/D degrade to
// red rather than throwing if the artifact is missing, so stage-1 RED shows as failed checks).
let CONTRACT = null;
try { CONTRACT = JSON.parse(read("dm-contract.json")); } catch (e) { CONTRACT = null; }

// ============================================================
// B. artifact ↔ runtime (4 checks)
// ============================================================
{
  const win = freshDom();
  const events = CONTRACT ? Object.keys(CONTRACT.events) : [];
  check("B1 contract.events set-equals DM_EVENT_TYPES (both length 87)",
    CONTRACT && setEq(events, win.DM_EVENT_TYPES) && events.length === win.DM_EVENT_TYPES.length && events.length === 87,
    `contract=${events.length} runtime=${win.DM_EVENT_TYPES.length}`);

  check("B2 contract.eventSources deep-equals DM_EVENT_SOURCES",
    CONTRACT && deepEq(CONTRACT.eventSources, win.DM_EVENT_SOURCES),
    JSON.stringify({ c: CONTRACT && CONTRACT.eventSources, r: win.DM_EVENT_SOURCES }));

  // B3 needs a staged world so dmDigest() returns its full literal.
  const world = seedWorld(win);
  const digestKeys = Object.keys(win.dmDigest());
  const dmDigestKeys = win.DM_DIGEST_KEYS;
  check("B3 dmDigest() keys set-equal contract.digest.topLevelKeys AND DM_DIGEST_KEYS (21)",
    CONTRACT && Array.isArray(dmDigestKeys) &&
      setEq(digestKeys, CONTRACT.digest.topLevelKeys) && setEq(digestKeys, dmDigestKeys) &&
      digestKeys.length === 21,
    `digest=${digestKeys.length} contract=${CONTRACT && CONTRACT.digest.topLevelKeys.length} DM_DIGEST_KEYS=${dmDigestKeys && dmDigestKeys.length}`);

  // B4 — per-event fields+aliases match; the 6 pass-through carry fields:null.
  let b4ok = !!CONTRACT, b4detail = "";
  if (CONTRACT) {
    for (const t of win.DM_EVENT_TYPES) {
      const spec = win.DM_EVENT_FIELDS[t];
      const ce = CONTRACT.events[t];
      if (!ce) { b4ok = false; b4detail = `no contract entry for ${t}`; break; }
      if (spec === undefined) {
        if (ce.fields !== null) { b4ok = false; b4detail = `${t} should be pass-through (fields:null), got ${JSON.stringify(ce.fields)}`; break; }
      } else {
        if (!deepEq(ce.fields, spec.accept || [])) { b4ok = false; b4detail = `${t} fields mismatch: ${JSON.stringify(ce.fields)} vs ${JSON.stringify(spec.accept)}`; break; }
        if (!deepEq(ce.aliases, spec.alias || {})) { b4ok = false; b4detail = `${t} aliases mismatch: ${JSON.stringify(ce.aliases)} vs ${JSON.stringify(spec.alias || {})}`; break; }
      }
    }
  }
  check("B4 every mapped event's fields+aliases match DM_EVENT_FIELDS; 6 pass-through carry fields:null",
    b4ok, b4detail);
}

// ============================================================
// C. examples fold clean (88 checks)
// ============================================================
{
  const win = freshDom();
  const world = seedWorld(win);
  const PASSTHROUGH = new Set(win.DM_EVENT_TYPES.filter((t) => win.DM_EVENT_FIELDS[t] === undefined));
  if (!CONTRACT) {
    // stage-1 RED: no artifact — register all 88 as failed so the count is visible.
    for (let i = 0; i < 88; i++) check(`C${i + 1} example fold (artifact missing)`, false, "dm-contract.json missing");
  } else {
    for (const t of win.DM_EVENT_TYPES) {
      const ex = CONTRACT.events[t].example;
      const before = win.ledgerOf(world).length;
      const folded = win.dmFoldPayload(world, { type: t, payload: ex.payload });
      const after = win.ledgerOf(world).length;
      let ok = (after === before);
      let detail = `ledger grew by ${after - before}`;
      if (ok && PASSTHROUGH.has(t)) {
        ok = deepEq(folded, ex.payload);
        detail = ok ? "" : `pass-through fold mutated payload: ${JSON.stringify(folded)} vs ${JSON.stringify(ex.payload)}`;
      }
      check(`C example folds clean: ${t}`, ok, detail);
    }
    // C88 — the BUG-01 mutation assertion: a bogus key MOVES the ledger by exactly 1.
    const before = win.ledgerOf(world).length;
    win.dmFoldPayload(world, { type: "hp_changed", payload: { delta: -1, zzz_bogus: 1 } });
    const led = win.ledgerOf(world);
    const grew = led.length - before;
    const line = led[led.length - 1];
    check("C88 mutation: a bogus key adds EXACTLY 1 payload-drift ledger line with keys=['zzz_bogus']",
      grew === 1 && line && line.data && line.data.kind === "payload-drift" && deepEq(line.data.keys, ["zzz_bogus"]),
      `grew=${grew} line=${JSON.stringify(line && line.data)}`);
  }
}

// ============================================================
// D. artifact ↔ prompt (3 checks per existing PROMPT_TARGET; sella prompt only today = 3)
// ============================================================
{
  const PROMPT_TARGETS = ["dev/playtest-saves/sella-shimmering-maw/DM-SEAT-PROMPT.md", "docs/SEAT-PROMPT.md"];
  const REQUIRED_TAUGHT = ["cast", "slot_spent", "attitude_shift", "hp_changed", "codex_update",
    "clock_advanced", "fact_canonized", "discovery", "condition_add"];

  // scan the §events region (between splice markers when present; else the pre-splice fallback from
  // `^### Common event types` to the next `^###` or EOF — the RED phase).
  function extractSection(text) {
    const beginRe = /^<!-- DM-CONTRACT:EVENTS:BEGIN.*?-->\r?$/m;
    const endRe = /^<!-- DM-CONTRACT:EVENTS:END -->\r?$/m;
    const b = beginRe.exec(text), e = endRe.exec(text);
    if (b && e && e.index > b.index) return text.slice(b.index + b[0].length, e.index);
    const h = /^### Common event types/m.exec(text);
    if (!h) return "";
    const rest = text.slice(h.index);
    const nextH = /\n### /.exec(rest.slice(1));
    return nextH ? rest.slice(0, nextH.index + 1) : rest;
  }

  // parse taught types + fields from a section (§6 D scanner rules).
  function parseTaught(section) {
    const taught = [];     // {type, fields:[...]}
    for (const raw of section.split("\n")) {
      if (!/^- /.test(raw)) continue;
      // first backtick token (plus the second when joined by "` / `") matching /^[a-z][a-z0-9_]*$/
      const btokens = [...raw.matchAll(/`([^`]*)`/g)].map((m) => m[1]);
      const typeToks = [];
      const idRe = /^[a-z][a-z0-9_]*$/;
      if (btokens[0] && idRe.test(btokens[0])) typeToks.push(btokens[0]);
      // the "` / `" join: `condition_add` / `condition_remove`
      if (/`[a-z][a-z0-9_]*`\s*\/\s*`[a-z][a-z0-9_]*`/.test(raw) && btokens[1] && idRe.test(btokens[1])) typeToks.push(btokens[1]);
      if (!typeToks.length) continue;
      // fields: from the first `{` to the last `}`, strip quoted strings, then collect identifiers-
      // before-colon at brace depth 1 RELATIVE TO the payload object only.
      const first = raw.indexOf("{"), last = raw.lastIndexOf("}");
      let fields = [];
      if (first >= 0 && last > first) {
        let span = raw.slice(first, last + 1).replace(/"[^"]*"/g, '""');
        // find the payload object: `payload:{ ... }`, then collect identifier-before-colon names at
        // brace depth 1 relative to that payload object only (nested dm:{…}/fields:{…} are open
        // key-value by contract and NOT validated).
        const pm = /payload\s*:\s*\{/.exec(span);
        if (pm) {
          const openAt = pm.index + pm[0].length - 1;   // index of payload's `{`
          let d = 0;
          for (let k = openAt; k < span.length; k++) {
            const ch = span[k];
            if (ch === "{") { d++; }
            else if (ch === "}") { d--; if (d === 0) break; }
            else if (d === 1) {
              // collect an identifier immediately before a colon at depth 1
              const m = /^([A-Za-z_$][A-Za-z0-9_$]*)\s*:/.exec(span.slice(k));
              if (m) { fields.push(m[1]); k += m[0].length - 1; }
            }
          }
        }
      }
      for (const t of typeToks) taught.push({ type: t, fields });
    }
    return taught;
  }

  let targetsChecked = 0;
  for (const rel of PROMPT_TARGETS) {
    if (!existsSync(join(ROOT, rel))) continue;
    targetsChecked++;
    const text = read(rel);
    const section = extractSection(text);
    const taughtList = parseTaught(section);
    const taughtTypes = taughtList.map((t) => t.type);

    // D1 every taught type ∈ contract.events
    const unknownTaught = CONTRACT ? taughtTypes.filter((t) => !(t in CONTRACT.events)) : taughtTypes;
    check(`D1 [${rel}] every taught type is a real contract event`,
      CONTRACT && unknownTaught.length === 0, `unknown=${JSON.stringify(unknownTaught)}`);

    // D2 every collected field ∈ fields ∪ aliasKeys of its taught type (pass-through skipped)
    const badFields = [];
    if (CONTRACT) {
      for (const { type, fields } of taughtList) {
        const ce = CONTRACT.events[type];
        if (!ce || ce.fields === null) continue;   // unknown or pass-through
        const legal = new Set([...(ce.fields || []), ...Object.keys(ce.aliases || {})]);
        for (const f of fields) if (!legal.has(f)) badFields.push(`${type}.${f}`);
      }
    }
    check(`D2 [${rel}] every taught field is a real accept field or alias`,
      CONTRACT && badFields.length === 0, `bad=${JSON.stringify(badFields)}`);

    // D3 REQUIRED_TAUGHT ⊆ taught set
    const missingReq = REQUIRED_TAUGHT.filter((t) => taughtTypes.indexOf(t) < 0);
    check(`D3 [${rel}] the required teachable set is present (cast/slot_spent/etc.)`,
      missingReq.length === 0, `missing=${JSON.stringify(missingReq)}`);
  }
  if (targetsChecked === 0) {
    check("D [no prompt targets present] — cannot verify prompt agreement", false, "no PROMPT_TARGET files exist");
  }
}

// ============================================================
// E. seat consumer (2 checks)
// ============================================================
{
  const win = freshDom();
  // the R2 mutation: a bound applyEvent's toString() is `function () { [native code] }` — zero `case`
  // lines. The RETIRED regex derivation would return []; the registry-backed one still returns 87.
  win.eval('applyEvent = applyEvent.bind(null);');
  const vocab = win.seatEventVocabulary(true);
  check("E1 seatEventVocabulary set-equals DM_EVENT_TYPES (87) even after applyEvent.bind(null)",
    Array.isArray(vocab) && setEq(vocab, win.DM_EVENT_TYPES) && vocab.length === 87,
    `len=${vocab && vocab.length}`);

  const gate = win.seatValidate({
    narration: "t",
    events: [{ type: "hp_changed", payload: { delta: -3 } }, { type: "totally_made_up", payload: {} }],
  });
  check("E2 seatValidate keeps the known event and drops the made-up one (values moved)",
    gate.response && gate.response.events.length === 1 && gate.dropped.length === 1,
    JSON.stringify({ kept: gate.response && gate.response.events.length, dropped: gate.dropped }));
}

console.log(`\nverify-dm-contract: ${pass}/${pass + fail} green`);
process.exit(fail === 0 ? 0 : 1);
