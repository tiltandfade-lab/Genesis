/* Verify the in-app LEVEL-UP CHOICE PICKER (src/creator/levelup.js, docs/ADVANCEMENT.md) — full-app
   jsdom load. Asserts: per-level plan deltas from CLASS_PROGRESSION (cantrips / spells-known / ASI /
   subclass-note, incl. multi-level jumps); the spell-field split (Wizard spellbook vs prepared); the
   spellMaxLevel gate (incl. the warlock pact path); openLevelUp's no-op fallback for pure-feature
   levels; luSpellOpts excluding known magic; and applyLevelChoices — the single mutator — writing
   deduped spells, applying the ASI (+2 / +1+1, the 20-cap), and rippling HP(CON)/AC(DEX)/PP(WIS) +
   the casting-stat pool max (Bardic Inspiration). Plus the open→auto→confirm DOM flow.

   Run:  node dev/verify-levelup.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const dom = new JSDOM(
  `<!doctype html><html><body><div id="worldView"></div>
   <div class="modal-bg" id="levelModal"><div class="modal bardo-modal"><div id="levelBody"></div></div></div>
   </body></html>`,
  { runScripts: "dangerously", url: "http://localhost/" });
const win = dom.window;
win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src);
win.saveU = () => {};                 // don't touch localStorage in the harness
win.renderWorld = () => {};           // confirm/skip call this; no world view in the harness

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// ── globals present ──────────────────────────────────────────────────────────
for (const f of ["levelUpPlan","openLevelUp","applyLevelChoices","luComplete","confirmLevelUp",
  "skipLevelUp","levelSpellField","maxSpellLevel","luSpellOpts","luAsiHeadroom","luAutoMagic","luAutoAsi",
  "luSetSlotKind","luSetFeat","luSetFeatAbil","luSlotDone","luSwapValid","luToggleSwapDrop","applyFeat"])
  check(`global ${f}`, typeof win[f] === "function");
// (top-level consts don't attach to window in classic-script eval — assert the data loaded THROUGH
// the functions that read it: every class resolves a subclass at its grant level.)
check("SUBCLASS_PROGRESSION loaded for all 12 classes (via levelUpPlan)",
  ["Barbarian","Bard","Cleric","Druid","Fighter","Monk","Paladin","Ranger","Rogue","Sorcerer","Warlock","Wizard"]
    .every(cls => { const p=win.levelUpPlan({class:cls},2,3); return !!p.subclassName; }));

// ── the spell-field split ────────────────────────────────────────────────────
check("levelSpellField: Wizard grows a spellbook", win.levelSpellField("Wizard")==="spellbook");
check("levelSpellField: Bard grows a prepared list", win.levelSpellField("Bard")==="prepared");

// ── per-level plan deltas ────────────────────────────────────────────────────
{ const p=win.levelUpPlan({class:"Wizard"},1,2);
  check("Wizard 1→2: +0 cantrips, +2 spellbook, no ASI, interactive",
    p.cantrips===0 && p.spells===2 && p.asiCount===0 && p.interactive===true, JSON.stringify(p)); }
{ const p=win.levelUpPlan({class:"Bard"},3,4);
  check("Bard 3→4: +1 cantrip, +1 spell, +1 ASI",
    p.cantrips===1 && p.spells===1 && p.asiCount===1 && p.interactive===true, JSON.stringify(p)); }
{ const p=win.levelUpPlan({class:"Cleric"},4,5);
  check("Cleric 4→5: +0 cantrips, +2 prepared, spellMaxLevel 3, no ASI",
    p.cantrips===0 && p.spells===2 && p.spellMaxLevel===3 && p.asiCount===0, JSON.stringify(p)); }
{ const p=win.levelUpPlan({class:"Fighter"},4,5);
  check("Fighter 4→5 (Extra Attack): NON-interactive (DM-narrated)", p.interactive===false, JSON.stringify(p)); }
{ const p=win.levelUpPlan({class:"Fighter"},3,4);
  check("Fighter 3→4: ASI only, interactive", p.cantrips===0 && p.spells===0 && p.asiCount===1 && p.interactive===true); }
{ const p=win.levelUpPlan({class:"Bard"},3,9);
  check("Bard 3→9 multi-jump aggregates: 2 ASIs (L4+L8), +1 cantrip, +8 spells, spellMaxLevel 5",
    p.asiCount===2 && p.cantrips===1 && p.spells===8 && p.spellMaxLevel===5, JSON.stringify(p)); }
{ const p=win.levelUpPlan({class:"Bard"},2,3);
  check("Bard 2→3 reveals the subclass (College of Lore) + its L3 features",
    p.subclassName==="College of Lore" && p.subFeatures.some(f=>f.name==="Cutting Words") && p.interactive===true, JSON.stringify({n:p.subclassName,f:p.subFeatures.map(x=>x.name)})); }
{ const p=win.levelUpPlan({class:"Fighter"},6,7);
  check("Fighter 6→7 becomes interactive via the subclass feature (Champion)", p.interactive===true && p.subFeatures.length>0, JSON.stringify(p.subFeatures)); }

// ── spellMaxLevel: the warlock pact path (no slots[] array) ───────────────────
{ const p=win.levelUpPlan({class:"Warlock"},2,3);
  check("Warlock 3 reads the pact-slot level for spellMaxLevel", p.spellMaxLevel>=2, JSON.stringify(p)); }

// ── luSpellOpts excludes already-known magic ─────────────────────────────────
{ win.GS.LEVELUP={ worldId:"x", charId:"c", plan:win.levelUpPlan({class:"Wizard"},1,2),
    picks:{cantrips:[],spells:[],slots:[]} };
  win.U.worlds["x"]={ id:"x", characters:[{ id:"c", name:"Mab", sheet:{class:"Wizard", spells:[], cantrips:[]} }] };
  const all=win.luSpellOpts(1).length;
  win.U.worlds["x"].characters[0].sheet.spells=[win.luSpellOpts(1)[0].name];
  check("luSpellOpts drops a known spell from the options", win.luSpellOpts(1).length===all-1, `${all}`);
  win.GS.LEVELUP=null; }

// ── applyLevelChoices: spells added + deduped, ledger written ─────────────────
{ const w={ id:"w1", ledger:[],log:[], characters:[] };
  const c={ id:"c1", name:"Lyric", sheet:{ class:"Wizard", level:2, scores:{str:8,dex:14,con:12,int:15,wis:10,cha:11},
    mods:{str:-1,dex:2,con:1,int:2,wis:0,cha:0}, hp:14, hpCur:14, ac:12, passivePerception:10, spells:["Mage Hand?"], cantrips:[] } };
  // (use real spell names so dedupe is meaningful)
  c.sheet.spells=[];
  const plan=win.levelUpPlan({class:"Wizard"},1,2); plan.from=1; plan.to=2;
  const r=win.applyLevelChoices(w,c,{cantrips:[],spells:["Sleep","Sleep","Detect Magic"],slots:[]},plan);
  check("applyLevelChoices ok", r.ok===true);
  check("new spells appended + deduped", JSON.stringify(c.sheet.spells)===JSON.stringify(["Sleep","Detect Magic"]));
  check("an outcome ledger line is written", w.ledger.some(e=>e.type==="outcome"&&e.data&&e.data.kind==="level-choices")); }

// ── ASI +2: raises the score + mod ───────────────────────────────────────────
{ const w={id:"w2",ledger:[],log:[],characters:[]};
  const c={id:"c2",name:"Bron",sheet:{class:"Fighter",level:4,scores:{str:16,dex:13,con:14,int:10,wis:12,cha:8},
    mods:{str:3,dex:1,con:2,int:0,wis:1,cha:-1},hp:36,hpCur:36,ac:11,passivePerception:11,spells:[],cantrips:[]}};
  const plan=win.levelUpPlan({class:"Fighter"},3,4); plan.from=3; plan.to=4;
  win.applyLevelChoices(w,c,{cantrips:[],spells:[],slots:[{kind:"asi",mode:"+2",abils:["str"]}]},plan);
  check("ASI +2 raises the ability score", c.sheet.scores.str===18);
  check("ASI +2 recomputes the mod", c.sheet.mods.str===4); }

// ── ASI +1+1 across two abilities ────────────────────────────────────────────
{ const w={id:"w3",ledger:[],log:[],characters:[]};
  const c={id:"c3",name:"Vex",sheet:{class:"Rogue",level:4,scores:{str:8,dex:15,con:13,int:12,wis:10,cha:14},
    mods:{str:-1,dex:2,con:1,int:1,wis:0,cha:2},hp:27,hpCur:27,ac:12,passivePerception:10,spells:[],cantrips:[]}};
  const plan=win.levelUpPlan({class:"Rogue"},3,4); plan.from=3; plan.to=4;
  win.applyLevelChoices(w,c,{cantrips:[],spells:[],slots:[{kind:"asi",mode:"+1+1",abils:["dex","con"]}]},plan);
  check("ASI +1+1 raises both abilities", c.sheet.scores.dex===16 && c.sheet.scores.con===14);
  check("ASI +1+1 lifts AC when the DEX mod crosses (15→16: +1 AC, 10+DEX model)", c.sheet.ac===13); }

// ── CON ASI raises max + current HP by (Δmod × level) ────────────────────────
{ const w={id:"w4",ledger:[],log:[],characters:[]};
  const c={id:"c4",name:"Hale",sheet:{class:"Barbarian",level:4,scores:{str:16,dex:14,con:15,int:8,wis:12,cha:10},
    mods:{str:3,dex:2,con:2,int:-1,wis:1,cha:0},hp:44,hpCur:30,ac:12,passivePerception:11,spells:[],cantrips:[]}};
  const plan=win.levelUpPlan({class:"Barbarian"},3,4); plan.from=3; plan.to=4;
  win.applyLevelChoices(w,c,{cantrips:[],spells:[],slots:[{kind:"asi",mode:"+2",abils:["con"]}]},plan);
  check("CON 15→17 lifts the CON mod 2→3", c.sheet.mods.con===3);
  check("CON ASI adds (Δmod × level)=4 to max HP", c.sheet.hp===48);
  check("CON ASI carries the gain into current HP (not a full heal)", c.sheet.hpCur===34); }

// ── WIS ASI raises passive Perception ────────────────────────────────────────
{ const w={id:"w5",ledger:[],log:[],characters:[]};
  const c={id:"c5",name:"Sage",sheet:{class:"Cleric",level:4,scores:{str:10,dex:12,con:13,int:11,wis:15,cha:9},
    mods:{str:0,dex:1,con:1,int:0,wis:2,cha:-1},hp:27,hpCur:27,ac:11,passivePerception:12,spells:[],cantrips:[]}};
  const plan=win.levelUpPlan({class:"Cleric"},3,4); plan.from=3; plan.to=4;
  win.applyLevelChoices(w,c,{cantrips:[],spells:[],slots:[{kind:"asi",mode:"+2",abils:["wis"]}]},plan);
  check("WIS 15→17 lifts passive Perception 12→13", c.sheet.passivePerception===13); }

// ── the 20-cap: luAsiHeadroom refuses a bump past 20 ─────────────────────────
{ win.GS.LEVELUP={worldId:"hr",charId:"h",plan:{asiCount:1},picks:{cantrips:[],spells:[],slots:[{kind:"asi",mode:"+2",abils:[]}]}};
  win.U.worlds["hr"]={id:"hr",characters:[{id:"h",name:"Cap",sheet:{class:"Fighter",scores:{str:19,dex:20,con:14,int:10,wis:10,cha:10}}}]};
  check("luAsiHeadroom blocks +2 that would exceed 20 (STR 19)", win.luAsiHeadroom("str",2)===false);
  check("luAsiHeadroom allows +1 to STR 19→20", win.luAsiHeadroom("str",1)===true);
  check("luAsiHeadroom blocks any bump to a 20", win.luAsiHeadroom("dex",1)===false);
  win.GS.LEVELUP=null; }

// ── a casting-stat ASI grows the derived pool max (Bardic Inspiration = max(1,CHA)) ──
{ const w={id:"w6",ledger:[],log:[],characters:[]};
  const c={id:"c6",name:"Tune",sheet:{class:"Bard",level:4,scores:{str:8,dex:14,con:12,int:13,wis:10,cha:15},
    mods:{str:-1,dex:2,con:1,int:1,wis:0,cha:2},hp:27,hpCur:27,ac:12,passivePerception:10,spells:[],cantrips:[]}};
  win.ensureResources(c.sheet);
  const biBefore=c.sheet.pools.bardicInspiration.max;     // CHA 15 → mod 2
  const plan=win.levelUpPlan({class:"Bard"},3,4); plan.from=3; plan.to=4;
  win.applyLevelChoices(w,c,{cantrips:[],spells:[],slots:[{kind:"asi",mode:"+2",abils:["cha"]}]},plan);
  check("Bardic Inspiration max grows with the CHA bump (2→3)", c.sheet.pools.bardicInspiration.max===biBefore+1, `${biBefore}`); }

// ── ensureResources seeds the choicesLevel marker (no retroactive demand on legacy sheets) ───
{ const sh={class:"Fighter",level:6,xp:14000,mods:{con:2}};
  win.ensureResources(sh);
  check("ensureResources seeds choicesLevel at the current level", sh.choicesLevel===6);
  check("...so a legacy sheet owes no picks", win.pendingChoices(sh)===false); }

// ── persistence: choicesLevel drives pendingChoices; openLevelUp derives from→to from it ─────
{ const sh={class:"Bard",level:4,choicesLevel:3,scores:{str:8,dex:14,con:12,int:13,wis:10,cha:15},
    mods:{str:-1,dex:2,con:1,int:1,wis:0,cha:2},hp:27,hpCur:27,ac:12,passivePerception:10,spells:[],cantrips:[]};
  check("pendingChoices true when choicesLevel < level (interactive span)", win.pendingChoices(sh)===true);
  sh.choicesLevel=4;
  check("pendingChoices false once choicesLevel catches up", win.pendingChoices(sh)===false); }

// ── openLevelUp gating (signature is now (w,c) — derives the owed span from the marker) ───────
{ // pure-feature span (Fighter 4→5) → no modal AND it auto-finalizes the marker
  const w={id:"w7",ledger:[],log:[],characters:[{id:"f",name:"Grip",status:"living",
    sheet:{class:"Fighter",level:5,choicesLevel:4}}]};
  win.U.worlds["w7"]=w;
  check("openLevelUp returns false for a non-interactive span (Fighter 4→5)",
    win.openLevelUp(w,w.characters[0])===false);
  check("...auto-finalizes the marker (choicesLevel→5)", w.characters[0].sheet.choicesLevel===5);
  check("...and leaves GS.LEVELUP unset", win.GS.LEVELUP==null); }
{ const w={id:"w8",ledger:[],log:[],characters:[{id:"b",name:"Aria",status:"living",
    sheet:{class:"Bard",level:4,choicesLevel:3,scores:{str:8,dex:14,con:12,int:13,wis:10,cha:15},
      mods:{str:-1,dex:2,con:1,int:1,wis:0,cha:2},hp:27,hpCur:27,ac:12,passivePerception:10,spells:[],cantrips:[]}}]};
  win.U.worlds["w8"]=w; win.ensureResources(w.characters[0].sheet);
  check("the persistent banner renders while picks are owed", (win.levelUpBannerHTML(w,w.characters[0])||"").includes("level 4"));
  const opened=win.openLevelUp(w,w.characters[0]);
  check("openLevelUp opens for an interactive span (Bard 3→4)", opened===true && !!win.GS.LEVELUP);
  check("the modal is shown", win.document.getElementById("levelModal").classList.contains("show"));
  check("luComplete is false before picking", win.luComplete()===false);
  win.luAutoMagic(); win.luAutoAsi(0);
  check("luComplete is true after auto-picking magic + ASI", win.luComplete()===true);
  const spellsBefore=w.characters[0].sheet.spells.length, cantBefore=w.characters[0].sheet.cantrips.length;
  win.confirmLevelUp();
  check("confirm appended a cantrip and a spell", w.characters[0].sheet.cantrips.length===cantBefore+1
    && w.characters[0].sheet.spells.length===spellsBefore+1);
  check("confirm applied the ASI (CHA priority → 17)", w.characters[0].sheet.scores.cha===17);
  check("confirm FINALIZES the marker (choicesLevel→4)", w.characters[0].sheet.choicesLevel===4);
  check("confirm clears pendingChoices", win.pendingChoices(w.characters[0].sheet)===false);
  check("the banner disappears once finalized", win.levelUpBannerHTML(w,w.characters[0])==="");
  check("confirm closes the picker", win.GS.LEVELUP==null
    && !win.document.getElementById("levelModal").classList.contains("show")); }
{ // re-open after an accidental close: the marker persists, openLevelUpForActive reopens it
  const w={id:"w8b",ledger:[],log:[],characters:[{id:"r",name:"Reo",status:"living",
    sheet:{class:"Bard",level:4,choicesLevel:3,scores:{str:8,dex:14,con:12,int:13,wis:10,cha:15},
      mods:{str:-1,dex:2,con:1,int:1,wis:0,cha:2},hp:27,hpCur:27,ac:12,passivePerception:10,spells:[],cantrips:[]}}]};
  win.U.worlds["w8b"]=w; win.U.activeWorldId="w8b"; win.ensureResources(w.characters[0].sheet);
  win.openLevelUp(w,w.characters[0]);
  win.closeLevelUp();                                  // simulate an accidental close (reload)
  check("after a close the marker still says picks are owed", win.pendingChoices(w.characters[0].sheet)===true);
  const reopened=win.openLevelUpForActive();           // what the banner / renderWorld auto-open call
  check("openLevelUpForActive re-opens the picker from the persistent marker", reopened===true && !!win.GS.LEVELUP);
  win.closeLevelUp(); }
{ // skip ("Decide with my DM") is a deliberate finalize: clears the marker, applies no picks
  const w={id:"w9",ledger:[],log:[],characters:[{id:"s",name:"Skip",status:"living",
    sheet:{class:"Wizard",level:2,choicesLevel:1,scores:{str:8,dex:14,con:12,int:15,wis:10,cha:11},
      mods:{str:-1,dex:2,con:1,int:2,wis:0,cha:0},hp:14,hpCur:14,ac:12,passivePerception:10,spells:["A"],cantrips:["B"]}}]};
  win.U.worlds["w9"]=w;
  win.openLevelUp(w,w.characters[0]);
  win.skipLevelUp();
  check("skip closes without applying (spells unchanged)", win.GS.LEVELUP==null
    && w.characters[0].sheet.spells.length===1);
  check("skip finalizes the marker so the banner stops nagging", w.characters[0].sheet.choicesLevel===2
    && win.pendingChoices(w.characters[0].sheet)===false); }

// ── the level_applied event auto-finalizes a pure-feature span, leaves an interactive one pending ─
{ const w={id:"wL",ledger:[],log:[],characters:[{status:"living",name:"Mar",
    sheet:{class:"Fighter",level:4,xp:6500,choicesLevel:4,mods:{con:2,str:3}}}]};
  win.ensureResources(w.characters[0].sheet);
  win.applyEvent(w,{type:"level_applied",payload:{to:5},source:"detected"});
  check("level_applied auto-finalizes a pure-feature span (Fighter 4→5)", w.characters[0].sheet.choicesLevel===5); }
{ const w={id:"wL2",ledger:[],log:[],characters:[{status:"living",name:"Vey",
    sheet:{class:"Wizard",level:1,xp:300,choicesLevel:1,mods:{con:1,int:3}}}]};
  win.ensureResources(w.characters[0].sheet);
  win.applyEvent(w,{type:"level_applied",payload:{to:2},source:"detected"});
  check("level_applied leaves an interactive span pending (Wizard 1→2 owes a spellbook pick)",
    w.characters[0].sheet.choicesLevel===1 && win.pendingChoices(w.characters[0].sheet)===true); }

// ── subclass is recorded on the sheet when granted (deterministic, no choice) ─────────────────
{ const w={id:"ws",ledger:[],log:[],characters:[]};
  const c={id:"cs",name:"Lute",sheet:{class:"Bard",level:3,scores:{str:8,dex:14,con:12,int:13,wis:10,cha:15},
    mods:{str:-1,dex:2,con:1,int:1,wis:0,cha:2},hp:20,hpCur:20,ac:12,passivePerception:10,spells:[],cantrips:[]}};
  const plan=win.levelUpPlan({class:"Bard"},2,3); plan.from=2; plan.to=3;
  win.applyLevelChoices(w,c,{cantrips:[],spells:[],slots:[],swap:{drop:null,add:null}},plan);
  check("subclass name recorded on the sheet", c.sheet.subclass==="College of Lore");
  check("subclass features recorded on the sheet", (c.sheet.subclassFeatures||[]).some(f=>f.name==="Cutting Words"));
  check("ledger records the path", w.ledger.some(e=>e.data&&e.data.subclass==="College of Lore")); }

// ── feat instead of an ASI: half-feat (+1 ability + a grant) ──────────────────────────────────
{ const w={id:"wf",ledger:[],log:[],characters:[]};
  const c={id:"cf",name:"Bru",sheet:{class:"Fighter",level:4,scores:{str:16,dex:13,con:14,int:10,wis:12,cha:8},
    mods:{str:3,dex:1,con:2,int:0,wis:1,cha:-1},hp:36,hpCur:36,ac:11,passivePerception:11,spells:[],cantrips:[]}};
  const plan=win.levelUpPlan({class:"Fighter"},3,4); plan.from=3; plan.to=4;
  win.applyLevelChoices(w,c,{cantrips:[],spells:[],swap:{drop:null,add:null},
    slots:[{kind:"feat",featId:"iron_skin",featAbil:"con"}]},plan);
  check("half-feat raises its ability (Iron Skin: CON 14→15)", c.sheet.scores.con===15);
  check("half-feat applies its flat grant (Iron Skin: +1 AC)", c.sheet.ac===12);
  check("feat is recorded on the sheet", (c.sheet.feats||[]).some(f=>f.id==="iron_skin")); }
// ── full feat: flat HP grant (Deep Roots = +2 HP/level) ───────────────────────────────────────
{ const w={id:"wf2",ledger:[],log:[],characters:[]};
  const c={id:"cf2",name:"Oak",sheet:{class:"Fighter",level:8,scores:{str:16,dex:13,con:14,int:10,wis:12,cha:8},
    mods:{str:3,dex:1,con:2,int:0,wis:1,cha:-1},hp:60,hpCur:60,ac:11,passivePerception:11,spells:[],cantrips:[]}};
  const plan=win.levelUpPlan({class:"Fighter"},7,8); plan.from=7; plan.to=8;
  win.applyLevelChoices(w,c,{cantrips:[],spells:[],swap:{drop:null,add:null},
    slots:[{kind:"feat",featId:"deep_roots",featAbil:null}]},plan);
  check("full feat applies HP/level grant (Deep Roots: +2×8 = +16 HP)", c.sheet.hp===76);
  check("no stray ability change for a full feat", c.sheet.scores.con===14); }

// ── luSlotDone: asi vs feat completeness ──────────────────────────────────────────────────────
check("luSlotDone: undecided slot is not done", win.luSlotDone({kind:null})===false);
check("luSlotDone: +2 asi needs one ability", win.luSlotDone({kind:"asi",mode:"+2",abils:[]})===false
  && win.luSlotDone({kind:"asi",mode:"+2",abils:["str"]})===true);
check("luSlotDone: a half-feat needs its ability", win.luSlotDone({kind:"feat",featId:"iron_skin",featAbil:null})===false
  && win.luSlotDone({kind:"feat",featId:"iron_skin",featAbil:"con"})===true);
check("luSlotDone: a full feat is done once chosen", win.luSlotDone({kind:"feat",featId:"deep_roots",featAbil:null})===true);

// ── spell swap: drop one known, learn one new (2024) ──────────────────────────────────────────
{ const w={id:"wsw",ledger:[],log:[],characters:[]};
  const c={id:"csw",name:"Mira",sheet:{class:"Wizard",level:3,scores:{str:8,dex:14,con:12,int:16,wis:10,cha:11},
    mods:{str:-1,dex:2,con:1,int:3,wis:0,cha:0},hp:18,hpCur:18,ac:12,passivePerception:10,spells:["Sleep","Shield"],cantrips:[]}};
  const plan=win.levelUpPlan({class:"Wizard"},2,3); plan.from=2; plan.to=3;
  win.applyLevelChoices(w,c,{cantrips:[],spells:[],slots:[],swap:{drop:"Sleep",add:"Detect Magic"}},plan);
  check("swap drops the old spell", c.sheet.spells.indexOf("Sleep")<0);
  check("swap learns the new spell", c.sheet.spells.indexOf("Detect Magic")>=0);
  check("swap keeps the untouched spell", c.sheet.spells.indexOf("Shield")>=0); }
check("luSwapValid: both-or-neither", (()=>{ win.GS.LEVELUP={picks:{swap:{drop:"A",add:null}}};
  const bad=win.luSwapValid(); win.GS.LEVELUP={picks:{swap:{drop:"A",add:"B"}}}; const good=win.luSwapValid();
  win.GS.LEVELUP=null; return bad===false && good===true; })());

// ── "Decide with my DM" still records the deterministic subclass (it's not a choice) ─────────
{ const w={id:"wsk",ledger:[],log:[],characters:[{id:"k",name:"Dex",status:"living",
    sheet:{class:"Bard",level:3,choicesLevel:2,scores:{str:8,dex:14,con:12,int:13,wis:10,cha:15},
      mods:{str:-1,dex:2,con:1,int:1,wis:0,cha:2},hp:20,hpCur:20,ac:12,passivePerception:10,spells:[],cantrips:[]}}]};
  win.U.worlds["wsk"]=w; win.U.activeWorldId="wsk";
  win.openLevelUp(w,w.characters[0]);   // span 2→3 reveals College of Lore
  win.skipLevelUp();
  check("skip still records the deterministic subclass", w.characters[0].sheet.subclass==="College of Lore"
    && (w.characters[0].sheet.subclassFeatures||[]).some(f=>f.name==="Cutting Words")); }

// ── a downed PC taking an HP feat GAINS the HP, is NOT revived to full ─────────────────────────
{ const w={id:"wdn",ledger:[],log:[],characters:[]};
  const c={id:"cdn",name:"Fell",sheet:{class:"Fighter",level:8,scores:{str:16,dex:13,con:14,int:10,wis:12,cha:8},
    mods:{str:3,dex:1,con:2,int:0,wis:1,cha:-1},hp:60,hpCur:0,ac:11,passivePerception:11,spells:[],cantrips:[]}};
  const plan=win.levelUpPlan({class:"Fighter"},7,8); plan.from=7; plan.to=8;
  win.applyLevelChoices(w,c,{cantrips:[],spells:[],swap:{drop:null,add:null},
    slots:[{kind:"feat",featId:"deep_roots",featAbil:null}]},plan);
  check("downed PC + Deep Roots: max HP +16", c.sheet.hp===76);
  check("downed PC + Deep Roots: current gains the +16, NOT a full revive", c.sheet.hpCur===16); }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
