/* GENESIS MODULE — src/creator/scores.js — ability scores: 4d6-drop, roll/assign, swap/drag, derive (abilMod here)
   Carved from genesis.html monolith on 2026-06-20 (Pass 7, creator domain). AST-extracted (acorn).
   Classic <script>, shared global scope. Transient state lives in GS (GS.CGEN/GS.BARDO/GS.CG_DRAG); data consts
   (STAGES/WORLDBEATS/GUIDE/LIFE_STEP) stay app-owned in genesis.html; referenced at call-time. */

function abilMod(score){return Math.floor((score-10)/2);}

/* 4d6-drop-lowest with the per-die breakdown kept (multi-die display).
   Returns {dice:[4 in roll order], dropIdx, total}. dropIdx = the lowest die dropped
   (first occurrence on a tie). roll4d6drop() stays a number for any legacy caller. */
function roll4d6breakdown(){const dice=[rollDie(6),rollDie(6),rollDie(6),rollDie(6)];
  let di=0;for(let i=1;i<4;i++)if(dice[i]<dice[di])di=i;
  return {dice,dropIdx:di,total:dice.reduce((a,b)=>a+b,0)-dice[di]};}
function roll4d6drop(){return roll4d6breakdown().total;}

/* mini-dice strip for a breakdown — the four d6, the dropped one struck through. */
function miniDice(b){if(!b||!b.dice)return"";
  return `<div class="score-dice">`+b.dice.map((d,i)=>`<span class="md${i===b.dropIdx?' drop':''}">${d}</span>`).join("")+`</div>`;}

function cgRollScores(){const bs=[0,0,0,0,0,0].map(roll4d6breakdown);
  GS.CGEN.rolledScores=bs.map(b=>b.total);GS.CGEN.scoreBreak=bs;GS.CGEN.swapSel=null;cgAssign();renderCharge();}

function cgAssign(){
  if(!GS.CGEN.rolledScores)return;
  const cls=CLASSES[GS.CGEN.class],arr=cls?cls.arr:{str:15,dex:14,con:13,int:12,wis:10,cha:8};
  const order=ABIL.slice().sort((a,b)=>arr[b]-arr[a]);
  const vals=GS.CGEN.rolledScores.slice().sort((a,b)=>b-a);
  const base={};order.forEach((ab,i)=>base[ab]=vals[i]);
  GS.CGEN.base=base;GS.CGEN.scoreMode="best";cgFinalScores();
}

/* "As rolled" — drop the six rolls straight into ability order (no class sorting). */
function cgAssignRolled(){
  if(!GS.CGEN.rolledScores)return;
  const base={};ABIL.forEach((a,i)=>base[a]=GS.CGEN.rolledScores[i]);
  GS.CGEN.base=base;GS.CGEN.scoreMode="rolled";cgFinalScores();
}

/* Toggle between the two allocation modes (the Sheet's Best-for / As-rolled buttons). */
function cgScoreMode(mode){if(mode==="rolled")cgAssignRolled();else cgAssign();GS.CGEN.swapSel=null;renderCharge();}

function cgFinalScores(){
  if(!GS.CGEN.base)return;
  const s={};ABIL.forEach(a=>s[a]=GS.CGEN.base[a]);
  const bg=BACKGROUNDS[GS.CGEN.background];
  if(bg){s[bg.abils[0]]=Math.min(20,s[bg.abils[0]]+2);s[bg.abils[1]]=Math.min(20,s[bg.abils[1]]+1);}
  GS.CGEN.scores=s;
}

function cgSwap(a,b){if(!GS.CGEN.base||a===b)return;const t=GS.CGEN.base[a];GS.CGEN.base[a]=GS.CGEN.base[b];GS.CGEN.base[b]=t;GS.CGEN.scoreMode="custom";cgFinalScores();GS.CGEN.swapSel=null;renderCharge();}

function cgSlotClick(ab){if(!GS.CGEN.base)return;if(GS.CGEN.swapSel==null){GS.CGEN.swapSel=ab;renderCharge();}else if(GS.CGEN.swapSel===ab){GS.CGEN.swapSel=null;renderCharge();}else{cgSwap(GS.CGEN.swapSel,ab);}}

function cgResetScores(){cgAssign();GS.CGEN.swapSel=null;renderCharge();}

function cgDragStart(ab){GS.CG_DRAG=ab;}

function cgDrop(ab){if(GS.CG_DRAG&&GS.CG_DRAG!==ab)cgSwap(GS.CG_DRAG,ab);GS.CG_DRAG=null;}

function cgDerived(){const s=GS.CGEN.scores;if(!s)return null;const cls=CLASSES[GS.CGEN.class];
  const mods={};ABIL.forEach(a=>mods[a]=abilMod(s[a]));
  return {mods,hp:(cls?cls.hp:8)+mods.con,ac:10+mods.dex,pb:2,pp:10+mods.wis,hd:cls?cls.hd:8,saves:cls?cls.saves:[]};}
