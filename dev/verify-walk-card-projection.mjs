/* Verify docs/WALK-CARD-DEALING.md visual projection seam. Pure Node/vm; no DOM or WebGL. */
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { shotPlanFrom } from "../src/ui/theater-shot.js";

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.error("FAIL", name, detail || ""); }
}

const source = readFileSync(new URL("../src/engine/place-projection.js", import.meta.url), "utf8");
const sandbox = { console };
vm.createContext(sandbox);
vm.runInContext(source + "\n;this.project=walkSceneProjectionFrom;", sandbox, { filename:"place-projection.js" });
const project = sandbox.project;

const plan = { rooms:[{segNum:2,w:4,d:4},{segNum:3,w:4,d:4},{segNum:5,w:6,d:6}] };
const segment = { num:3, encounter:{type:"Enemy"} };
const walk = {
  deck:{
    cards:[
      {id:"hazard",sourceRef:"S3.hazard",homeSegNum:3,role:"hazard",mechanical:true,visual:{weight:2}},
      {id:"shrine",sourceRef:"S3.feature",homeSegNum:3,role:"centerpiece",centerpiece:true,visual:{weight:3,slug:"fantasy-shrine",position:{x:2,y:2}}},
      {id:"watchers",sourceRef:"roll:dungeon-contact:117",homeSegNum:5,role:"cast",mechanical:true,count:6,
        secretId:"watch-chamber",payloadText:"Four watchers wait behind the wall.",
        tell:{sourceRef:"card:muffled-counting",visual:{presentation:"sound"}},
        visual:{weight:3,maxRepresentatives:3,groupFootprint:"2x2",slug:"fantasy-watchers",position:{x:8,y:7}}},
      {id:"rubble",sourceRef:"S3.dressing",homeSegNum:3,role:"dressing",visual:{weight:2}},
    ],
    assignments:[
      {cardId:"hazard",homeSegNum:3,lane:"stageNow"},
      {cardId:"shrine",homeSegNum:3,lane:"stageNow"},
      {cardId:"watchers",homeSegNum:5,lane:"stageNow"},
      {cardId:"rubble",homeSegNum:3}
    ]
  },
  secretNetwork:[{
    id:"watch-chamber",kind:"connection",fromSegNum:3,toSegNum:5,state:"hidden",
    sourceRef:"S3.secret",payloadText:"Observation chamber behind the shrine.",
    visual:{position:{x:4,y:2}}
  }]
};

const hidden = project(walk, {num:5,encounter:{type:"Empty"}}, plan, {viewer:"player"});
const hiddenJson = JSON.stringify(hidden);
check("hidden payload emits no staged card", hidden.stageNow.length === 0);
check("hidden payload prose never reaches player projection", !hiddenJson.includes("Four watchers") && !hiddenJson.includes("Observation chamber"));
check("hidden connection emits no aperture record", hidden.visibleConnections.length === 0);
check("player projection has no concealed lane", !("concealed" in hidden));

const noticed = project(walk, {num:5,encounter:{type:"Empty"}}, plan, {viewer:"player",overlay:{noticedSecrets:["watch-chamber"]}});
check("noticed secret emits only its tell", noticed.narrateNow.length === 1 && noticed.narrateNow[0].sourceRef === "card:muffled-counting" && noticed.stageNow.length === 0);
check("noticed secret still emits no connection", noticed.visibleConnections.length === 0);

const revealed = project(walk, {num:5,encounter:{type:"Empty"}}, plan, {viewer:"player",overlay:{revealedSecrets:["watch-chamber"]}});
check("revealed hidden group stages", revealed.stageNow.some((c)=>c.id === "watchers"));
const group = revealed.stageNow.find((c)=>c.id === "watchers");
check("group compression preserves canonical count", group && group.count === 6 && group.representativeCount === 3 && group.groupFootprint === "2x2");

const revealedFrom = project(walk, segment, plan, {viewer:"player",overlay:{revealedSecrets:["watch-chamber"]}});
check("revealed connection appears at either endpoint", revealedFrom.visibleConnections.length === 1 && revealedFrom.visibleConnections[0].toSegNum === 5);

const overloaded = project(walk, segment, plan, {viewer:"player"});
check("mandatory cards may honestly exceed capacity", overloaded.stageNow.some((c)=>c.id === "hazard") && overloaded.stageNow.some((c)=>c.id === "shrine") && overloaded.density === "overloaded");
check("lower-priority visible card enters reserve", overloaded.reserve.some((c)=>c.id === "rubble" && c.reason === "visual-density"));

const emptyCapacity = project({deck:{cards:[],assignments:[]}}, {num:3,encounter:{type:"Empty"}}, plan, {});
const occupiedCapacity = project({deck:{cards:[],assignments:[]}}, segment, plan, {});
check("empty rooms receive additional dealing capacity", emptyCapacity.capacity > occupiedCapacity.capacity);

const again = project(walk, segment, plan, {viewer:"player"});
check("same snapshot is byte-deterministic", JSON.stringify(overloaded) === JSON.stringify(again));

const legacy = project(null, {num:2,encounter:{type:"Empty"},feature:{name:"Dry fountain"},atmo:{text:"cold air"}}, plan, {});
check("legacy walk derives additive fallback projection", legacy.explicitDeal === false && legacy.stageNow.some((c)=>c.sourceRef === "S2.feature") && legacy.narrateNow.some((c)=>c.sourceRef === "S2.atmo"));

const dm = project(walk, {num:5,encounter:{type:"Empty"}}, plan, {viewer:"dm"});
check("DM projection can retain concealed source reference", Array.isArray(dm.concealed) && dm.concealed[0].sourceRef === "roll:dungeon-contact:117");
check("DM concealed index still does not copy payload prose", !JSON.stringify(dm.concealed).includes("Four watchers"));

const mimicWalk = {
  deck:{cards:[{
    id:"mimic-card-7",entityRef:"codex:mimic-7",presentationId:"room-object-7",
    sourceRef:"roll:mimic",publicSourceRef:"S2.object",homeSegNum:2,
    role:"cast",mechanical:true,payloadText:"A mimic waits as a chest.",visual:{position:{x:2,y:2}}
  }],assignments:[{cardId:"mimic-card-7",homeSegNum:2,lane:"stageNow"}]}
};
const mimicGuise = {active:"chest",forms:[
  {formId:"chest",spriteSlug:"fantasy-chest-closed",kind:"object",sizeBand:"medium",scaleVsHuman:0.8,statFrame:null},
  {formId:"true",spriteSlug:"mimic",kind:"monstrosity",sizeBand:"medium",scaleVsHuman:1,statFrame:"mimic"}
],revealState:"hidden",driver:"innate"};
const mimicHidden = project(mimicWalk, {num:2,encounter:{type:"Empty"}}, plan, {viewer:"player",guiseByEntityId:{"codex:mimic-7":mimicGuise}});
check("concealed mimic emits its active object form", mimicHidden.stageNow.length === 1 && mimicHidden.stageNow[0].id === "room-object-7" && mimicHidden.stageNow[0].role === "guise" && mimicHidden.stageNow[0].slug === "fantasy-chest-closed");
check("concealed guise leaks no creature identity", !JSON.stringify(mimicHidden).includes("mimic") && !JSON.stringify(mimicHidden).includes("roll:mimic"));
const mimicRevealedGuise = Object.assign({}, mimicGuise, {active:"true",revealState:"revealed"});
const mimicRevealed = project(mimicWalk, {num:2,encounter:{type:"Empty"}}, plan, {viewer:"player",guiseByEntityId:{"codex:mimic-7":mimicRevealedGuise}});
check("revealed mimic returns to cast presentation", mimicRevealed.stageNow.length === 1 && mimicRevealed.stageNow[0].role === "cast" && mimicRevealed.stageNow[0].id === "room-object-7");

const shot = shotPlanFrom({
  kind:"interior3d", env:"dungeon", cellSize:1, activeRoomId:3,
  bounds:{minX:0,maxX:3,minZ:0,maxZ:3}, instances:{wall:[],doorframe:[],pillar:[]},
  projection:overloaded, furniture:[], lights:[], skirt:[]
}, null, {});
check("explicit overload requests room framing", shot.camera.mode === "room");
check("projected centerpiece becomes a ShotPlan objective", shot.anchors.objective && shot.anchors.objective.sourceRef === "S3.feature");
check("projected positioned cards carry walk provenance", shot.provenance.some((p)=>p.source === "walk-card" && p.detail === "S3.feature"));
check("ShotPlan carries the sanitized projection", shot.walkProjection === overloaded && !JSON.stringify(shot).includes("Observation chamber"));

const legacyShot = shotPlanFrom({
  kind:"interior3d", env:"dungeon", cellSize:1, activeRoomId:2,
  bounds:{minX:0,maxX:3,minZ:0,maxZ:3}, instances:{wall:[],doorframe:[],pillar:[]},
  projection:legacy, furniture:[], lights:[], skirt:[]
}, null, {});
check("legacy fallback projection preserves beat framing", legacyShot.camera.mode === "beat");

const html = readFileSync(new URL("../genesis.html", import.meta.url), "utf8");
check("projection module loads between semantics and dressing", html.indexOf("place-semantics.js") < html.indexOf("place-projection.js") && html.indexOf("place-projection.js") < html.indexOf("place-dressing.js"));

const revealedShot = shotPlanFrom({
  kind:"interior3d", env:"dungeon", cellSize:1, activeRoomId:5,
  bounds:{minX:0,maxX:5,minZ:0,maxZ:5}, instances:{wall:[],doorframe:[],pillar:[]},
  projection:revealed, furniture:[], lights:[], skirt:[]
}, null, {});
const watcherPiece = revealedShot.pieces.find((p)=>p.id === "card:watchers");
check("revealed NPC card enters ShotPlan as cast, not a prop", !!watcherPiece && !revealedShot.props.some((p)=>p.id === "card:watchers"));
check("projected cast preserves count and representative contract", watcherPiece && watcherPiece.count === 6 && watcherPiece.representativeCount === 3);

const renderSource = readFileSync(new URL("../src/world/render.js", import.meta.url), "utf8");
const theaterDataSource = readFileSync(new URL("../src/engine/theater-data.js", import.meta.url), "utf8");
check("render snapshots canonical codex guise records", renderSource.includes("function theaterGuiseSnapshotFor") && renderSource.includes("rec&&rec.guise"));
check("tray projection receives guise snapshot without owning it", theaterDataSource.includes("guiseByEntityId:source.guiseByEntityId||null"));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
