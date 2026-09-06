#!/usr/bin/env node
/* CI shape + execution proof for the 28-turn zero-provider replay corpus. */
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scenarios } from "./replay-corpus/scenarios.mjs";

const ROOT=join(dirname(fileURLToPath(import.meta.url)),"..");
let pass=0,fail=0;
function check(ok,msg){if(ok)pass++;else{fail++;console.error("FAIL:",msg);}}

check(scenarios.length===7,"exactly seven persistent arcs");
check(scenarios.every(s=>s.turns.length===4),"every arc has exactly four turns");
check(scenarios.reduce((n,s)=>n+s.turns.length,0)===28,"corpus has exactly 28 turns");
const ids=scenarios.flatMap(s=>s.turns.map(t=>t.id));
check(new Set(ids).size===28,"turn ids are unique");
check(scenarios.flatMap(s=>s.turns).every(t=>t.aiRole&&t.dramatic),"every turn declares AI role and dramatic axis");
const issues=new Set(scenarios.flatMap(s=>s.turns).flatMap(t=>(t.assertions||[]).filter(a=>a.kind==="known-gap").map(a=>a.issue)));
check(issues.size===0,"fixed corpus carries no accepted known-gap sentinels");

try{
  const raw=execFileSync("node",[join(ROOT,"dev/replay-corpus/run.mjs"),"--json"],{encoding:"utf8",maxBuffer:64*1024*1024});
  const report=JSON.parse(raw);
  check(report.summary.pass,"recorded corpus passes green and dramatic gates");
  check(report.summary.turns===28,"runner executes all 28 turns");
  check(report.summary.costUsd===undefined?report.costUsd===0:report.summary.costUsd===0,"runner spends $0");
  check(report.summary.knownGapsReproduced+report.summary.knownGapsResolved===0,"no known-gap check remains");
}catch(e){check(false,"runner executes: "+(e.stderr?.toString()||e.message));}

if(fail){console.error(`FAIL replay-corpus: ${pass} passed, ${fail} failed`);process.exit(1);}
console.log(`PASS replay-corpus: ${pass} checks · 7 arcs · 28 turns · recorded/$0`);
