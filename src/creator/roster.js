/* GENESIS MODULE — src/creator/roster.js — Wandering Souls roster + name generators
   Carved from genesis.html monolith on 2026-06-20 (Pass 7, creator domain). AST-extracted (acorn).
   Classic <script>, shared global scope. Transient state lives in GS (GS.CGEN/GS.BARDO/GS.CG_DRAG); data consts
   (STAGES/WORLDBEATS/GUIDE/LIFE_STEP) live in data/creation-flow.js; read at call-time. */

function randomWorldName(){
  const cw=s=>s.charAt(0).toUpperCase()+s.slice(1);
  const A=["ash","mire","salt","grey","rust","bog","iron","cinder","thorn","fen","gloam","bram","dross","marrow","soot","wynd","glass","copper","slate","pale","dusk","harrow","quill","tide","mox","vael","wick","bran"];
  const B=["fen","fall","reach","hollow","mire","gate","mark","wend","hold","cross","barrow","mere","strand","ridge","vale","gloom","rest","watch","moor"];
  const N=["Bells","Crows","Salt","Ash","Tides","Lanterns","Thorns","Embers","Wells","Masks","Rust","Glass","Cinders","Veils","Hours","Smoke"];
  const r=Math.random();
  if(r<0.5)return cw(pick(A))+pick(B);
  if(r<0.8)return "The "+cw(pick(A))+" "+cw(pick(B));
  return "The "+cw(pick(B))+" of "+pick(N);}

function randomCharName(species){const pool=CHAR_NAMES[species]||CHAR_NAMES.Human;const f=pick(pool.first);return Math.random()<0.78?f+" "+pick(pool.last):f;}

function rosterSouls(){if(!U.souls)U.souls=[];return U.souls;}

function soulFromCGEN(name){const d=cgDerived();const bg=BACKGROUNDS[GS.CGEN.background]||{};const ex=cgSheetExtras();
  const c={id:uid(),name:name||"the Stranger",pronouns:GS.CGEN.pronouns||"they",bornAt:Date.now(),
    sheet:{species:GS.CGEN.species,class:GS.CGEN.class,background:GS.CGEN.background,feat:bg.feat||"",tool:ex.tool,languages:ex.languages,
      scores:GS.CGEN.scores,hp:d?d.hp:null,ac:d?d.ac:null,skillProfs:ex.skillProfs,classSkills:ex.classSkills,
      inventory:ex.inventory,gold:ex.gold,kit:ex.kit,cantrips:ex.cantrips,spells:ex.spells,spellAbility:ex.spellAbility,
      featSkills:ex.featSkills,featCantrips:ex.featCantrips,featSpells:ex.featSpells,featSpellAbility:ex.featSpellAbility},
    life:GS.CGEN.life||null};
  c.headline=cgHeadline(c);return c;}

function bankSoul(){if(!GS.CGEN)return;const cn=document.getElementById("charName");if(cn&&cn.value.trim())GS.CGEN.name=cn.value.trim();
  const name=(GS.CGEN.name||"").trim()||randomCharName(GS.CGEN.species);
  rosterSouls().push(soulFromCGEN(name));saveU(U);GS.CGEN=null;GS.BARDO=null;
  toast("✧ "+name+" wanders off into the world");showTab('start');}

function removeSoul(id){U.souls=(U.souls||[]).filter(s=>s.id!==id);saveU(U);renderShelf();}

function soulsHTML(){const souls=rosterSouls();if(!souls.length)return "";
  const card=s=>`<div style="position:relative;background:var(--vellum-2,#1a1714);border:1px solid var(--edge,#3a342c);border-radius:10px;padding:12px 14px;flex:1 1 220px;max-width:300px">
    <button title="release this soul" onclick="event.stopPropagation();removeSoul('${s.id}')" style="position:absolute;top:6px;right:8px;background:none;border:none;color:var(--ink-dim,#9a9488);cursor:pointer;font-size:21px;line-height:1">×</button>
    <div style="color:var(--bone,#cdbf9e);font-weight:600;font-size:20px">${escHtml(s.name)}</div>
    <div style="color:var(--ink-dim,#9a9488);font-size:16px;margin:2px 0 6px">${escHtml(s.sheet.species)} ${escHtml(s.sheet.class)} · ${escHtml(s.sheet.background)}</div>
    <div style="color:var(--ink,#bdb4a4);font-size:16px;font-style:italic;line-height:1.4">${escHtml(s.headline||"")}</div></div>`;
  return `<div style="grid-column:1/-1;margin-top:18px">
    <div style="color:var(--bone,#cdbf9e);font-size:17px;letter-spacing:.05em;margin-bottom:8px">✧ WANDERING SOULS — ${souls.length} abroad <span style="color:var(--ink-dim,#9a9488);letter-spacing:0">· heroes the world may surface as rivals or companions</span></div>
    <div style="display:flex;flex-wrap:wrap;gap:10px">`+souls.map(card).join("")+`</div></div>`;}
