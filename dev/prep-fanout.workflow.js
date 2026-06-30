export const meta = {
  name: 'prep-fanout',
  description: 'Deep Genesis session prep: Stage-1 harvest, then parallel Stage-2 reskin per environment (each also extracting full monster stat blocks), so live DM turns are lean reads instead of 100s+ lookups.',
  phases: [
    { title: 'Harvest', detail: 'one pass over the bundle summary → throughline + hook bindings + cast seeds + reskin brief' },
    { title: 'Reskin',  detail: 'one agent per environment, in parallel → roll-keyed overlay + extracted stat blocks' },
  ],
};

/* HOW THE DM SESSION USES THIS (docs/DM-BRIDGE.md → "Deep prep fan-out"):
   At session start, GET the prep bundle (prepHandoff / the digest's prep), then:
     Workflow({ scriptPath: "dev/prep-fanout.workflow.js" }, bundle)
   where `bundle` is { summary, environments:[...full walks...], ledgerEntities? } (the prepHandoff payload).
   Take the returned { harvest, overlays } and apply it back to the app with ONE event:
     POST /response → { ..., events:[{ type:"prep_applied", payload:{ harvest, overlays }, source:"declared" }] }
   The overlays carry pre-extracted statBlocks[] so live combat turns never re-read data/bestiary.js. */

const bundle = args || {};
const envs = bundle.environments || (bundle.bundle && bundle.bundle.environments) || [];
let result = { harvest: null, overlays: [] };

if (!envs.length) {
  log('prep-fanout: no environments in args — pass the prepHandoff bundle as args');
} else {

phase('Harvest');
const HARVEST_SCHEMA = {
  type: 'object', additionalProperties: true,
  properties: {
    dramaticQuestion: { type: 'string' }, throughline: { type: 'string' },
    spineByEnv: { type: 'object', additionalProperties: true },
    hookBindings: { type: 'array' }, castSeeds: { type: 'array' }, dripSeeded: { type: 'array' },
    reskinBrief: { type: 'string' },
  },
  required: ['throughline', 'reskinBrief'],
};
const harvest = await agent(
  `You are running STAGE 1 (HARVEST) of the Genesis session-prep synthesis.
Load and follow EXACTLY: docs/SYNTHESIS-CONTRACT.md and "Engine/00. _System/AI Prompts/synthesis-harvest.md".
Cardinal rule: HONOR THE ROLLS — find the throughline latent in them, annotate by ref, never rewrite or delete rolled content.
Bundle summary (Stage-1 input):
${JSON.stringify(bundle.summary || bundle, null, 1)}
Return synthesis-harvest/v1: the dramatic question, throughline, spine-by-env, hook bindings, cast seeds, drip seeds, and a reskin brief that Stage 2 will localize.`,
  { label: 'harvest', phase: 'Harvest', schema: HARVEST_SCHEMA }
);

phase('Reskin');
const OVERLAY_SCHEMA = {
  type: 'object', additionalProperties: true,
  properties: {
    env: { type: 'string' }, briefing: { type: 'string' },
    segments: { type: 'array' }, newCanon: { type: 'array' },
    statBlocks: { type: 'array', items: { type: 'object', additionalProperties: true } },
  },
  required: ['env', 'segments'],
};
// one reskin per environment, all in parallel — environments are independent, so this collapses the
// serial synthesis into a single fan. Each agent ALSO front-loads its monster stat blocks.
const overlays = (await parallel(envs.map((env, i) => () => agent(
  `You are running STAGE 2 (RESKIN) for ONE environment of the Genesis prep — env #${i + 1}: "${env.kind}".
Load and follow EXACTLY: docs/SYNTHESIS-CONTRACT.md and "Engine/00. _System/AI Prompts/synthesis-reskin.md".
Cardinal rule: OVERLAY, NOT REWRITE — key every change to its segment "ref"; the rolled DCs/creatures/loot are canon.
Stage-1 harvest (cross-environment coherence to honor):
${JSON.stringify(harvest, null, 1)}
This environment's FULL walk to reskin:
${JSON.stringify(env, null, 1)}
ALSO — front-load combat so live turns are fast: for EVERY creature named in this walk, extract its FULL stat block
from data/bestiary.js (fall back to Reference/SRD-Data) into statBlocks[]:
{ name, cr, ac, hp, speed, abilities:{str,dex,con,int,wis,cha}, attacks:[...], specials:[...], notes }.
Return synthesis-overlay/v1 (env, briefing, segments[{ref,role,reskin,ties[],revealPlan:{fragment,dmHeld}}], newCanon[]) PLUS statBlocks[].`,
  { label: `reskin:${env.kind || i}`, phase: 'Reskin', schema: OVERLAY_SCHEMA }
)))).filter(Boolean);

log(`prep-fanout: harvest + ${overlays.length}/${envs.length} env overlays + ${overlays.reduce((n, o) => n + ((o && o.statBlocks) ? o.statBlocks.length : 0), 0)} stat blocks pre-extracted`);
result = { harvest, overlays };

}

return result;
