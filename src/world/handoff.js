/* GENESIS MODULE — src/world/handoff.js — DM export: character handoff + full DM scene handoff + clipboard fallback
   Carved from genesis.html monolith on 2026-06-20 (Pass 8, app-core). AST-extracted (acorn).
   Classic <script>, shared global scope. Reads GS.* state + data consts (STAGES/WORLDBEATS/...) at call-time. */

function charHandoff(c){
  const pr=pronounSet(c.pronouns).label;
  if(!c.sheet)return `I am playing ${c.name} (${pr}) — ${c.headline||c.spark}${c.bornWhere?`, who entered at ${c.bornWhere}`:""}.`;
  const sh=c.sheet,sc=sh.scores,md=sh.mods;
  const scoreLine=ABIL.map(a=>`${ABIL_LABEL[a]} ${sc[a]} (${md[a]>=0?'+':''}${md[a]})`).join("  ");
  let out=`I am playing ${c.name} (${pr}) — ${c.headline}.
THE SHEET (L1): ${sh.species} ${sh.class}, ${sh.background} background. ${scoreLine}
HP ${sh.hp} · AC ${sh.ac} · Prof +${sh.profBonus} · Passive Perception ${sh.passivePerception} · Hit Die ${sh.hitDie} · Save proficiencies: ${sh.saveProfs.map(x=>ABIL_LABEL[x]).join("/")||"—"} · Skills: ${sh.skillProfs.join(", ")}${sh.tool?` · Tool: ${sh.tool}`:""} · Feat: ${sh.feat}
(Pull my class features, starting gear, and spells from the SRD as needed — they aren't duplicated here.)`;
  if(c.life){const L=c.life,O=L.origins;
    out+=`\nMY PAST (rolled): born ${O.birthplace.text.toLowerCase()}${O.parents.total>95?", parents unknown":""}; raised by ${O.family.text.replace(/^An? /,'').toLowerCase()}; ${O.lifestyle.text.toLowerCase()} upbringing. ${O.childhoodMemory.text}
Why this path: ${L.decisions.background.text} ${L.decisions.classTraining.text}
Life events: ${L.events.map(e=>e.summary+(e.detail?` (${e.detail})`:"")).join(" ")}`;}
  if(c.entry){const en=c.entry,B=en.bundle||{},sl=k=>(B[k]||[]).map(x=>x.text).join("; ")||"—";
    out+=`\nMY ARRIVAL: I came here ${en.why}; to ${en.standingFaction||"the local power"} I am ${en.standing}; I have ${en.foot}.`;
    if(en.tension)out+=`\nOPENING TENSION (${en.tension.kind}): ${en.tension.danger}.${en.tension.realDM?` [DM ONLY — the truth: ${en.tension.realDM}]`:""}${en.tension.doomDM?` [DM ONLY — if its clock fills: ${en.tension.doomDM}]`:""}`;
    out+=`\nTHE OPENING BUNDLE — weave these into the first scene:\n  ⚔ Enemies: ${sl("enemies")}\n  🤝 Friends: ${sl("friends")}\n  🪢 Complications: ${sl("complications")}\n  ◈ Things: ${sl("things")}\n  ⌖ Places: ${sl("places")}`;}
  return out;
}

function handToDM(){
  const w=activeWorld();if(!w)return;
  const s=w.seed;const cur=w.characters.filter(c=>c.status==="living").slice(-1)[0];
  const recent=w.gazetteer.slice(-6).map(g=>`  - [${g.type}] ${g.name}: ${g.desc}`).join("\n");
  const fallen=w.characters.filter(c=>c.status==="fallen");
  const transitions=ledgerOf(w).filter(e=>e.type==="transition"||e.type==="spatial").slice(-4).map(e=>`  - ${e.text}`).join("\n");
  const powers=(w.factions||[]).map(f=>`  - ${f.name} (${f.dominant?"dominant":"rival"+(f.rel?", "+f.rel:"")}): means to ${f.agenda}, through ${f.method}${f.tags&&f.tags.length?" ["+f.tags.join(", ")+"]":""} — clock ${f.clock.filled}/${f.clock.size}`).join("\n");
  const fronts=(w.pressures||[]).map(p=>`  - [${p.kind}] ${p.danger}${p.impersonal?" ("+p.impersonal+")":""} — clock ${p.clock.filled}/${p.clock.size}\n      DM ONLY — the truth: ${p.real?p.real.text:"(mundane; no hidden layer)"}; if its clock fills: ${p.doom}`).join("\n");
  const txt=
`I'm playing in my persistent GENESIS world "${w.name}" — please be my DM. This world persists between sessions; weave from what's already known, add new corners only when I travel there, and stop at my decision. I roll all my own dice — never roll for me. The in-world clock advances only when you declare a transition (travel / rest / montage); ordinary scenes don't move it.

TIME & PLACE
In-world: ${fmtClockFull(w)} (Session ${w.session||0}). I am at: ${nodeName(w,w.currentNodeId)}.
${transitions?`Recent transitions & routes:\n${transitions}`:"No transitions logged yet."}

THE WORLD — ${s.master.name}
${s.master.desc}
Sensory: smells of ${s.smell.name}; sounds of ${s.sound.name}; built of ${s.arch.name}.
Local taboo — ${s.taboo.name}: ${s.taboo.desc}
The standing trouble — ${s.pressure.name}: ${s.pressure.desc}
A power in the land — ${s.faction.name}: ${s.faction.desc}
What they whisper — ${s.myth.name}: ${s.myth.desc}
${w.factions&&w.factions.length?`
POWERS IN MOTION (factions with agendas + clocks):
${powers}

STANDING PRESSURES (fronts — the player sees the surface; the DM-only lines are for you):
${fronts}`:""}

KNOWN SO FAR (gazetteer, ${w.gazetteer.length} entries — most recent):
${recent}
${fallen.length?`\nThe fallen: ${fallen.map(c=>`${c.name} (${c.spark}) at ${c.fellWhere}`).join("; ")}.`:""}

${cur?charHandoff(cur):`No character is in play yet — help me arrive.`}

Open the scene where I currently am. Ground me in the senses, surface what I'd plausibly know, and hand me the moment.`;
  navigator.clipboard.writeText(txt).then(()=>toast("World copied — paste it to your DM ✦"),()=>fallbackCopy(txt));
}

function fallbackCopy(txt){const ta=document.createElement("textarea");ta.value=txt;document.body.appendChild(ta);ta.select();try{document.execCommand("copy");toast("World copied — paste it to your DM ✦");}catch(e){alert(txt);}ta.remove();}
