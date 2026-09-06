#!/usr/bin/env node
/* Seven persistent four-turn arcs (28 turns), recorded responses, zero provider spend.
   Run: node dev/replay-corpus/run.mjs [--json] [--only custody] [--keep]
   This is a state/mechanics preflight. Dramatic evidence is a separate recorded-response axis; a
   provider study can later replace only the responses without changing the engine scenarios. */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scenarios, mutateHook } from "./scenarios.mjs";

const ROOT=join(dirname(fileURLToPath(import.meta.url)),"../..");
const CLI=join(ROOT,"dev/playtest-bridgeless.mjs");
const argv=process.argv.slice(2), has=x=>argv.includes(x), value=x=>{const i=argv.indexOf(x);return i>=0?argv[i+1]:null;};
const jsonMode=has("--json"), keep=has("--keep"), only=value("--only");

function readState(dir){return JSON.parse(readFileSync(join(dir,"state.json"),"utf8"));}
function writeState(dir,state){writeFileSync(join(dir,"state.json"),JSON.stringify(state));}
function cli(args){
  const raw=execFileSync("node",[CLI,...args],{encoding:"utf8",maxBuffer:64*1024*1024});
  return JSON.parse(raw);
}
function regexPass(text,required){return (required||[]).every(re=>new RegExp(re.source,re.flags).test(text||""));}

const report={schema:"zero-provider-replay/v1",generatedAt:new Date().toISOString(),provider:"recorded",costUsd:0,
  scenarios:[],summary:{scenarios:0,turns:0,greenPass:0,greenFail:0,knownGapsReproduced:0,knownGapsResolved:0,
    dramaticPass:0,dramaticFail:0,localTurns:0,modelTurns:0,aiRoles:{}}};

for(const scenario of scenarios.filter(s=>!only||s.id===only)){
  const dir=mkdtempSync(join(tmpdir(),"genesis-replay-")); writeState(dir,scenario.initial());
  const sr={id:scenario.id,title:scenario.title,turns:[],tempDir:keep?dir:undefined};
  try{
    for(let i=0;i<scenario.turns.length;i++){
      const spec=scenario.turns[i]; let state=readState(dir);
      mutateHook(spec.beforeDigest,state); writeState(dir,state);
      const digestArgs=["digest","--dir",dir,"--seed",String(scenario.seed+i),"--action",spec.action];
      if(spec.opts)digestArgs.push("--opts",JSON.stringify(spec.opts));
      const digest=cli(digestArgs); const afterDigestState=readState(dir);
      state=afterDigestState; mutateHook(spec.afterDigest,state); writeState(dir,state);
      const beforeApply=readState(dir); let apply=null;
      if(!digest.local){
        const r=JSON.parse(JSON.stringify(spec.response)); r.turnId=digest.turnId;
        const count=spec.applyCount||1;
        for(let n=0;n<count;n++)apply=cli(["apply","--dir",dir,"--seed",String(scenario.seed+i),"--response",JSON.stringify(r)]);
      }
      const after=readState(dir); const ctx={scenario:scenario.id,spec,digest,apply,beforeApply,after,afterDigest:afterDigestState};
      const assertions=(spec.assertions||[]).map(a=>{
        let pass=false,error=null; try{pass=!!a.test(ctx);}catch(e){error=e.message;}
        if(a.kind==="known-gap"){
          if(pass)report.summary.knownGapsReproduced++;else report.summary.knownGapsResolved++;
        }else if(pass)report.summary.greenPass++;else report.summary.greenFail++;
        return {name:a.name,kind:a.kind,issue:a.issue||null,pass,error};
      });
      const dramaticRequired=spec.dramatic?.required||[], dramaticPass=regexPass(spec.response.narration,dramaticRequired);
      if(spec.aiRole!=="none"){
        if(dramaticPass)report.summary.dramaticPass++;else report.summary.dramaticFail++;
        report.summary.modelTurns++;
      }else report.summary.localTurns++;
      report.summary.aiRoles[spec.aiRole]=(report.summary.aiRoles[spec.aiRole]||0)+1;
      sr.turns.push({id:spec.id,action:spec.action,aiRole:spec.aiRole,route:digest.route.mode,view:digest.digest?.view||null,
        digestBytes:digest.digestBytes,receipt:digest.receipt?{kind:digest.receipt.kind,accepted:digest.receipt.accepted,
          result:digest.receipt.result}:null,appliedResults:apply?.appliedResults||[],assertions,
        retrieval:digest.digest?.retrieval||null,codex:(digest.digest?.codex||[]).map(r=>({id:r.id,name:r.name,dm:r.dm||null})),
        dramatic:{status:spec.aiRole==="none"?"not-needed":(dramaticPass?"pass":"fail"),evidenceCount:dramaticRequired.length}});
      report.summary.turns++;
    }
    sr.pass=sr.turns.every(t=>t.assertions.filter(a=>a.kind==="green").every(a=>a.pass)); report.scenarios.push(sr);
  }finally{if(!keep)rmSync(dir,{recursive:true,force:true});}
}
report.summary.scenarios=report.scenarios.length;
report.summary.pass=report.summary.greenFail===0&&report.summary.dramaticFail===0&&report.summary.turns===report.summary.scenarios*4;

if(jsonMode)process.stdout.write(JSON.stringify(report)+"\n");
else{
  for(const s of report.scenarios){
    process.stdout.write(`${s.pass?"PASS":"FAIL"} ${s.id} — ${s.title}\n`);
    for(const t of s.turns){
      const gaps=t.assertions.filter(a=>a.kind==="known-gap").map(a=>`${a.issue}:${a.pass?"reproduced":"resolved"}`);
      process.stdout.write(`  ${t.id} ${t.route}${t.view?"/"+t.view:""} ${t.digestBytes}B${gaps.length?" · "+gaps.join(", "):""}\n`);
    }
  }
  const x=report.summary;
  process.stdout.write(`\n${x.pass?"PASS":"FAIL"} zero-provider corpus: ${x.scenarios} arcs · ${x.turns} turns · green ${x.greenPass}/${x.greenPass+x.greenFail} · known gaps ${x.knownGapsReproduced} reproduced/${x.knownGapsResolved} resolved · dramatic ${x.dramaticPass}/${x.dramaticPass+x.dramaticFail} · $0\n`);
}
if(!report.summary.pass)process.exitCode=1;
