/* VERIFY: ITEM TRANSFER / CUSTODY — docs/ITEMS.md + docs/EVENT-CONTRACT.md.
   Proves atomic stack movement, stable identity, durable destinations, compact digest projection,
   legacy linkage, and the resolve-before-narrate receipt. No provider call is made.

   Run: node dev/verify-item-transfer.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT=join(dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(join(ROOT,p),"utf8");
const JSDOM_HOME=process.env.JSDOM_HOME||join(process.env.HOME,".genesis-jsdom");
const {JSDOM}=createRequire(join(JSDOM_HOME,"package.json"))("jsdom");
const man=JSON.parse(read("manifest.json"));
const src=man.loadOrder.filter(p=>p.endsWith(".js")).map(read).join("\n;\n");
const dom=new JSDOM("<!doctype html><html><body><div id='worldView'></div><div id='toast'></div></body></html>",
  {runScripts:"dangerously",url:"http://localhost/"});
const win=dom.window;
win.eval("var U={worlds:{},activeWorldId:null,revealed:{},souls:[]};var SEED=null;\n"+src+
  ";window.ITEM_TRANSFER_DESTINATION_KINDS=ITEM_TRANSFER_DESTINATION_KINDS;");
win.eval("renderWorld=function(){};wakeReveal=function(){};saveU=function(){};postState=function(){};"+
  "genReserveTopUp=function(){};turnRevealDrift=function(){};");
win.fetch=()=>Promise.resolve({ok:true,status:204,json:()=>Promise.resolve({})});

let passed=0,failed=0;
function check(name,ok,detail=""){
  if(ok){passed++;console.log("  ✓",name);}
  else{failed++;console.log("  ✗",name,"—",detail);}
}

function mkSheet(inventory){
  return {species:"Human",class:"Fighter",background:"Soldier",level:3,xp:0,hp:24,hpCur:24,tempHp:0,
    ac:14,gold:0,profBonus:2,scores:{str:14,dex:12,con:12,int:10,wis:10,cha:10},
    mods:{str:2,dex:1,con:1,int:0,wis:0,cha:0},saveProfs:[],skillProfs:[],resources:{},
    inventory:inventory||[],equipped:{mainHand:null,offHand:null,armor:null}};
}
function mkWorld(inventory,extraCharacters){
  const w={id:"w-transfer",name:"Transfer Hold",seed:{master:{name:"Transfer Hold",desc:"d"},
    smell:{name:"rain"},sound:{name:"bells"},arch:{name:"stone"},taboo:{name:"t",desc:"d"},
    myth:{name:"m",desc:"d"},faction:{name:"The Testers"}},
    characters:(extraCharacters||[]).concat([{id:"pc-source",status:"living",name:"Sella",headline:"a bearer",
      pronouns:"she",conditions:[],sheet:mkSheet(inventory)}]),gazetteer:[],log:[],ledger:[],dmlog:[],
    clock:{day:2,min:615},session:1,map:{nodes:{crypt:{id:"crypt",name:"The Crypt",type:"Place",seen:true},
      road:{id:"road",name:"Old Road",type:"Place",seen:true}},edges:[]},currentNodeId:"crypt",
    factions:[],pressures:[],revealed:{},dm:{lastNarratedNodeId:"crypt"}};
  win.U={worlds:{[w.id]:w},activeWorldId:w.id,revealed:{},souls:[]};
  win.GS.dm={turnId:null,pending:false,poll:null,rollReq:null,ask:null,animate:false,telemetry:[]};
  return w;
}
const source=w=>w.characters.find(c=>c.id==="pc-source");
function occurrences(w,id){
  let n=0;
  (w.characters||[]).forEach(c=>{
    n+=(c.sheet&&Array.isArray(c.sheet.inventory)?c.sheet.inventory:[]).filter(it=>it&&it.id===id).length;
    n+=(c.corpse&&Array.isArray(c.corpse.items)?c.corpse.items:[]).filter(it=>it&&it.id===id).length;
  });
  if(w.itemCustody&&w.itemCustody.items&&w.itemCustody.items[id])n++;
  return n;
}

console.log("\n  VERIFY: ITEM TRANSFER / CUSTODY\n");

check("destination vocabulary is explicit and includes story holders",
  ["pc","npc","creature","faction","container","corpse","place","object"].every(k=>win.ITEM_TRANSFER_DESTINATION_KINDS.includes(k)),
  JSON.stringify(win.ITEM_TRANSFER_DESTINATION_KINDS));

// Partial stack: source id stays on the remainder; all instance state follows the moved quantity.
{
  const w=mkWorld([{id:"arrows",name:"Arrow",qty:20,conditions:["poisoned-coated"],ench:{note:"black fletching"}}]);
  const r=win.applyEvent(w,{type:"item_transfer",source:"player",payload:{itemId:"arrows",qty:5,
    to:{kind:"object",ref:"S3.object",name:"the stone coffin"},note:"laid across the lid"}});
  const carried=source(w).sheet.inventory[0], rec=w.itemCustody&&w.itemCustody.items&&w.itemCustody.items[r.movedId];
  check("partial transfer succeeds and returns moved/remainder ids",r.ok&&r.movedId!=="arrows"&&r.remainingId==="arrows"&&r.remainingQty===15,JSON.stringify(r));
  check("partial transfer preserves remainder identity and exact quantities",carried.id==="arrows"&&carried.qty===15&&rec.item.qty===5,JSON.stringify({carried,rec}));
  check("full moved instance state is preserved (not a name-only remint)",rec.item.conditions[0]==="poisoned-coated"&&rec.item.ench.note==="black fletching",JSON.stringify(rec.item));
  check("moved identity has exactly one physical owner",occurrences(w,r.movedId)===1,`count=${occurrences(w,r.movedId)}`);
  const d=win.dmDigest();
  check("current-scene digest exposes the placed item and exact holder",d.itemCustody&&d.itemCustody[0].item.id===r.movedId&&d.itemCustody[0].holder.ref==="S3.object",JSON.stringify(d.itemCustody));
  const saved=JSON.stringify(w), reloaded=JSON.parse(saved);
  check("save/reload round-trip preserves instance and custody byte-for-byte",JSON.stringify(reloaded.itemCustody)===JSON.stringify(w.itemCustody),JSON.stringify(reloaded.itemCustody));
  reloaded.currentNodeId="road";
  check("remote custody is omitted from the ordinary scene digest",win.itemCustodyDigest(reloaded,{nodeId:"road"})===null,JSON.stringify(win.itemCustodyDigest(reloaded,{nodeId:"road"})));
}

// Walk placement is scoped to the exact segment, and the same stable instance can be picked back up.
{
  const w=mkWorld([{id:"walk-jav",name:"Ashwood Javelin",conditions:["notched"]}]);
  w.prep={version:1,activeWalkId:"crypt",nodes:{crypt:{cursor:{current:2,touched:[2],done:false}}}};
  const placed=win.applyEvent(w,{type:"item_transfer",payload:{itemId:"walk-jav",
    to:{kind:"object",ref:"S2.altar",name:"the wayside altar"}}});
  const rec=w.itemCustody&&w.itemCustody.items&&w.itemCustody.items["walk-jav"];
  check("walk placement stamps the active walk and exact segment",
    placed.ok&&rec&&rec.at.walkId==="crypt"&&rec.at.seg===2,JSON.stringify({placed,at:rec&&rec.at}));
  w.prep.nodes.crypt.cursor.current=3;
  check("leaving the walk segment removes its placed item from the ordinary digest",
    win.itemCustodyDigest(w)===null,JSON.stringify(win.itemCustodyDigest(w)));
  w.prep.activeWalkId=null;
  check("closing the walk exposes its physical residue node-wide instead of making it disappear",
    win.itemCustodyDigest(w)?.[0]?.item?.id==="walk-jav",JSON.stringify(win.itemCustodyDigest(w)));
  w.prep.activeWalkId="crypt";
  w.prep.nodes.crypt.cursor.current=2;
  check("returning to the exact segment restores the placed item to the digest",
    win.itemCustodyDigest(w)?.[0]?.item?.id==="walk-jav",JSON.stringify(win.itemCustodyDigest(w)));
  const picked=win.applyEvent(w,{type:"item_transfer",payload:{itemId:"walk-jav",
    to:{kind:"pc",ref:"pc-source",name:"Sella"}}});
  check("custody-to-PC pickup succeeds through the same transfer event",
    picked.ok&&picked.sourceStorage==="custody"&&picked.destinationStorage==="inventory",JSON.stringify(picked));
  check("pickup preserves identity, removes custody, and leaves exactly one physical owner",
    source(w).sheet.inventory.some(it=>it.id==="walk-jav"&&it.conditions[0]==="notched")&&
      !win.itemCustodyFind(w,"walk-jav")&&occurrences(w,"walk-jav")===1,
    JSON.stringify({inventory:source(w).sheet.inventory,custody:w.itemCustody}));
}

// Newly revealed scene loot can originate at an explicit world holder without ever pretending the
// active PC picked it up. It uses the same instance builder as inventory loot, so magic overlays and
// charges remain congruent, and walk scope/save persistence are identical to an ordinary transfer.
{
  const w=mkWorld([]);
  w.prep={version:1,activeWalkId:"crypt",nodes:{crypt:{cursor:{current:4,touched:[4],done:false}}}};
  win.codexAdd(w,{id:"item:fish-command",kind:"item",name:"Trident of Fish Command",provenance:"rolled",status:{known:true}});
  const r=win.applyEvent(w,{type:"item_placed",source:"declared",payload:{
    item:{name:"Trident of Fish Command",codexId:"item:fish-command"},
    to:{kind:"container",ref:"S4.public-strongbox",name:"the witnessed public strongbox"},
    intent:"place",note:"The workers inventory the trident into public custody."
  }});
  const rec=r.ok&&w.itemCustody.items[r.itemId];
  check("scene loot originates directly in custody, never via active-PC inventory",
    r.ok&&source(w).sheet.inventory.length===0&&rec&&rec.holder.ref==="S4.public-strongbox"&&occurrences(w,r.itemId)===1,
    JSON.stringify({r,inventory:source(w).sheet.inventory,custody:w.itemCustody}));
  check("directly placed magic loot receives the congruent catalog overlay and full charges",
    rec&&rec.item.ench&&rec.item.ench.charges&&rec.item.ench.charges.cur===3&&rec.item.ench.charges.max===3,
    JSON.stringify(rec&&rec.item));
  check("direct scene placement carries current walk/segment scope into the digest",
    rec&&rec.at.walkId==="crypt"&&rec.at.seg===4&&win.itemCustodyDigest(w)?.[0]?.item?.id===r.itemId,
    JSON.stringify({at:rec&&rec.at,digest:win.itemCustodyDigest(w)}));
  const reloaded=JSON.parse(JSON.stringify(w));
  check("directly placed scene loot survives save/reload byte-for-byte",
    JSON.stringify(reloaded.itemCustody)===JSON.stringify(w.itemCustody),JSON.stringify(reloaded.itemCustody));
  const duplicate=win.applyEvent(w,{type:"item_placed",payload:{item:{name:"Trident of Fish Command",codexId:"item:fish-command"},
    to:{kind:"container",ref:"S4.second-chest"}}});
  check("scene placement refuses a second physical instance of one codex identity",
    duplicate.ok===false&&duplicate.reason==="duplicate-codex-instance",JSON.stringify(duplicate));
}
{
  const w=mkWorld([]),before=JSON.stringify(w);
  const r=win.applyEvent(w,{type:"item_placed",payload:{item:{name:"Dagger"},to:{kind:"pc",ref:"pc-source"}}});
  check("item_placed cannot bypass native PC ownership and rejects atomically",
    r.ok===false&&r.reason==="native-owner-requires-transfer"&&JSON.stringify(w)===before,JSON.stringify(r));
}

// Full move: identity follows the object and equipment cannot point at something no longer carried.
{
  const w=mkWorld([{id:"jav-1",name:"Javelin",conditions:[]}]);
  source(w).sheet.equipped.mainHand="jav-1";
  const r=win.applyEvent(w,{type:"item_transfer",payload:{itemId:"jav-1",to:{kind:"container",ref:"urn-7",name:"the blue urn"}}});
  check("whole transfer preserves the original instance id",r.ok&&r.movedId==="jav-1"&&r.remainingId===null&&w.itemCustody.items["jav-1"].item.id==="jav-1",JSON.stringify(r));
  check("whole transfer removes inventory ownership and clears equipped slot",source(w).sheet.inventory.length===0&&source(w).sheet.equipped.mainHand===null&&r.clearedSlots.includes("mainHand"),JSON.stringify(source(w).sheet));
  check("whole transfer still has exactly one physical owner",occurrences(w,"jav-1")===1,`count=${occurrences(w,"jav-1")}`);
}

// Native physical owners: corpses and another living PC use their existing arrays, not registry twins.
{
  const dead={id:"dead-1",status:"fallen",name:"Rennick",corpse:{items:[],gold:0,looted:false},sheet:mkSheet([])};
  const w=mkWorld([{id:"coin-knife",name:"Dagger",conditions:[]}],[dead]);
  const r=win.applyEvent(w,{type:"item_transfer",payload:{itemId:"coin-knife",to:{kind:"corpse",ref:"dead-1"}}});
  check("corpse destination uses corpse.items without creating a custody twin",r.ok&&dead.corpse.items[0].id==="coin-knife"&&!w.itemCustody,JSON.stringify({r,corpse:dead.corpse,custody:w.itemCustody}));
}
{
  const recipient={id:"pc-ally",status:"living",name:"Orra",conditions:[],sheet:mkSheet([])};
  const w=mkWorld([{id:"torch-1",name:"Torch",conditions:[]}],[recipient]);
  const r=win.applyEvent(w,{type:"item_transfer",payload:{itemId:"torch-1",to:{kind:"pc",ref:"pc-ally"}}});
  check("PC destination uses the recipient inventory without a custody twin",r.ok&&recipient.sheet.inventory[0].id==="torch-1"&&source(w).sheet.inventory.length===0&&!w.itemCustody,JSON.stringify({r,recipient:recipient.sheet.inventory}));
}

// Rejections are genuinely atomic for clean typed payloads: no lazy store, ledger, or qty drift.
for(const probe of [
  {name:"missing destination ref",payload:{itemId:"arrows",qty:2,to:{kind:"object"}},reason:"destination-ref-required"},
  {name:"over-quantity",payload:{itemId:"arrows",qty:21,to:{kind:"object",ref:"coffin"}},reason:"insufficient"},
  {name:"ambiguous stack quantity",payload:{itemId:"arrows",to:{kind:"object",ref:"coffin"}},reason:"qty-required"},
]){
  const w=mkWorld([{id:"arrows",name:"Arrow",qty:20,conditions:[]}]);
  const before=JSON.stringify(w),r=win.applyEvent(w,{type:"item_transfer",payload:probe.payload}),after=JSON.stringify(w);
  check("atomic rejection: "+probe.name,r.ok===false&&r.reason===probe.reason&&before===after,JSON.stringify({r,beforeEqualsAfter:before===after}));
}
{
  const w=mkWorld([{id:"relic-stack",name:"Saint's Nail",qty:2,conditions:[],codexId:"item:saints-nail"}]);
  const before=JSON.stringify(w),r=win.applyEvent(w,{type:"item_transfer",payload:{itemId:"relic-stack",qty:1,to:{kind:"npc",ref:"npc:abbess"}}});
  check("storied stack cannot fork one codex identity and remains byte-identical",r.reason==="storied-stack-unsplittable"&&JSON.stringify(w)===before,JSON.stringify(r));
}
{
  const recipient={id:"pc-small",status:"living",name:"Pip",conditions:[],sheet:mkSheet([])};
  recipient.sheet.scores.str=1;
  const w=mkWorld([{id:"plate-1",name:"Plate Armor",conditions:[]}],[recipient]);
  const before=JSON.stringify(w),r=win.applyEvent(w,{type:"item_transfer",payload:{itemId:"plate-1",to:{kind:"pc",ref:"pc-small"}}});
  check("over-capacity PC destination is refused atomically",r.reason==="destination-over-capacity"&&JSON.stringify(w)===before,JSON.stringify(r));
}

// A whole storied item moves through the existing legacy lifecycle in the same top-level operation.
{
  const item={id:"sabre-1",name:"The Pale Sabre",conditions:[],codexId:"item:pale-sabre",ench:{bonus:1}};
  const w=mkWorld([item]);
  win.codexAdd(w,{id:"item:pale-sabre",kind:"item",name:"The Pale Sabre",provenance:"rolled",fields:{object:"The Pale Sabre"},status:{known:true}});
  const r=win.applyEvent(w,{type:"item_transfer",payload:{itemId:"sabre-1",to:{kind:"npc",ref:"npc:vesh",name:"Vesh"}}});
  const rec=win.codexGet(w,"item:pale-sabre");
  check("voluntary storied transfer records neutral custody without inventing a recovery quest",
    r.ok&&r.intent==="transfer"&&w.itemCustody.items["sabre-1"].intent==="transfer"&&
      rec.legacy.lossState==="transferred"&&rec.legacy.claimant.ref==="npc:vesh"&&!rec.legacy.recoveryHookId,
    JSON.stringify({r,legacy:rec.legacy}));
}
{
  const item={id:"sabre-stolen",name:"The Taken Sabre",conditions:[],codexId:"item:taken-sabre",ench:{bonus:1}};
  const w=mkWorld([item]);
  win.codexAdd(w,{id:"item:taken-sabre",kind:"item",name:"The Taken Sabre",provenance:"rolled",fields:{object:"The Taken Sabre"},status:{known:true}});
  const r=win.applyEvent(w,{type:"item_transfer",payload:{itemId:"sabre-stolen",intent:"stolen",
    to:{kind:"npc",ref:"npc:thief",name:"the thief"}}});
  const rec=win.codexGet(w,"item:taken-sabre");
  check("explicit involuntary transfer still creates claimed custody and a recovery hook",
    r.ok&&r.intent==="stolen"&&rec.legacy.lossState==="claimed-npc"&&!!rec.legacy.recoveryHookId,
    JSON.stringify({r,legacy:rec.legacy}));
}
{
  const w=mkWorld([]);
  win.codexAdd(w,{id:"item:old-order",kind:"item",name:"The Old Order",provenance:"declared",status:{known:true,soft:false}});
  win.applyEvent(w,{type:"item_claimed",payload:{codexId:"item:old-order",lossState:"claimed-npc",
    by:{kind:"npc",ref:"npc:tessa",name:"Tessa"},at:"crypt"}});
  const old=win.codexGet(w,"item:old-order"), oldHook=old.legacy.recoveryHookId;
  w.itemCustody={version:1,items:{order:{item:{id:"order",name:"The Old Order",codexId:"item:old-order"},
    holder:{kind:"npc",ref:"npc:tessa",name:"Tessa"},from:{kind:"pc",ref:"pc-source",name:"Sella"},
    at:{nodeId:"crypt",day:2,min:615},note:"Sella entrusts the order to Tessa for safekeeping."}}};
  win.itemCustodyMigrate(w);
  check("v1 voluntary custody migrates forward without mutating ambiguous old claims",
    w.itemCustody.version===2&&w.itemCustody.items.order.intent==="entrust"&&old.legacy.lossState==="transferred"&&
      old.legacy.recoveryHookId===null&&win.codexGet(w,oldHook).status.condition==="resolved",
    JSON.stringify({custody:w.itemCustody,legacy:old.legacy,hook:win.codexGet(w,oldHook)}));
}

// Interpretation stays open; only a trusted structured declaration pre-resolves and receipts it.
{
  const w=mkWorld([{id:"jav-r",name:"Javelin",conditions:[]}]);
  const free=win.dmRoute(w,"I balance the javelin across the coffin and listen for an answer.");
  check("novel natural-language placement remains a freeform ruling",free.mode==="freeform-ruling",JSON.stringify(free));
  const opts={mechanic:{type:"item-transfer",payload:{itemId:"jav-r",to:{kind:"object",ref:"coffin-1",name:"the coffin"}}}};
  const resolved=win.dmResolveTurnRoute(w,"I lay down the javelin.",opts,Date.now());
  check("trusted item transfer resolves before narration with an immutable receipt",resolved.route.mode==="declared-mechanic"&&resolved.receipt.accepted===true&&resolved.receipt.kind==="item-transfer"&&resolved.receipt.settledEventTypes[0]==="item_transfer"&&Object.isFrozen(resolved.receipt),JSON.stringify(resolved));
  check("receipt before/after proves custody moved before digest assembly",resolved.receipt.before.itemCustody===null&&resolved.receipt.after.itemCustody&&resolved.receipt.after.itemCustody[0].item.id==="jav-r",JSON.stringify(resolved.receipt));
  check("mechanical receipt is delta-only and does not repeat unchanged companions",
    resolved.receipt.deltaOnly===true&&resolved.receipt.before.companions===undefined&&resolved.receipt.after.companions===undefined,
    JSON.stringify(resolved.receipt));
  const settledLedger=w.ledger.length;
  w.dm.pendingReceipt=resolved.receipt;
  win.GS.dm.lastTurnMeta={turnId:"t-transfer",receipt:resolved.receipt,startedAt:Date.now(),routeMode:"declared-mechanic"};
  win.applyResponse({turnId:"t-transfer",narration:"The wood answers with a hollow knock.",events:[{type:"item_transfer",payload:opts.mechanic.payload}]});
  const dmLine=(w.dmlog||[]).filter(x=>x.role==="dm").slice(-1)[0];
  check("narrator replay is blocked by the settled receipt",w.ledger.length===settledLedger&&dmLine.applied[0].res.ignored==="settled-by-receipt",JSON.stringify(dmLine&&dmLine.applied));
}

console.log(`\n${failed?"✗":"✓"} item-transfer: ${passed} passed, ${failed} failed\n`);
if(failed)process.exit(1);
