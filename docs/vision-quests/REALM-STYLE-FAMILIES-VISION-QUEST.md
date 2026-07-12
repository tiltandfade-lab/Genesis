# Vision Quest — Realm Style Families

## Decision

The three mature faceted styles are compatible enough to exist in one Genesis world. They should be treated as **realm rendering families**, not competing global art directions:

| Realm family | Visual language | Narrative explanation |
|---|---|---|
| Fantasy / Frontier | Mature grounded faceted low-poly: weathered teal, brass, leather, stone, restrained natural color | Ordinary material reality: the world as lived, repaired, and inherited |
| Gloom | Austere gothic faceted low-poly: charcoal, iron, bone, desaturated violet, severe silhouettes | A realm where light, identity, and memory are compressed into harsher forms |
| Lost World | Archaeological dark-myth faceted low-poly: mineral teal, oxidized bronze, sand, carved stone, cyan relic accents | An older material grammar surfacing through ruins, fossils, and impossible age |

The breach is the explanation for why these visual grammars can meet without feeling like unrelated games. A breach does not merely change color grading; it changes the apparent material history of bodies, objects, architecture, and light.

## Existing architecture fit

This should build on existing seams, not add a separate renderer per realm:

- `data/realms.js` already owns realm vocabulary and `realmRenderProfile`.
- `data/realm-surfaces.js` already selects per-realm floor/material vocabulary.
- `data/realm-props.js` already selects realm-specific dressing and cross-realm props.
- `data/skin-motifs.js` already supplies reskin verbs such as smoldered, root-bound, bleached, edge-blurred, doubled, or time-slipped.
- `src/engine/breach.js` already resolves fray shift, breach/nightmare tails, active realms, physics lenses, and sealed/unstable/stable persistence.
- `src/ui/theater-boot.js` already owns realm grade, fog, lighting, sprite readability, dressing, and material assembly.
- `data/sprite-registry.js` can carry realm/style family metadata without changing the billboard mechanism.

## Style-family contract

The renderer should resolve one style profile from the active realm/breach context:

```js
{
  family: "frontier" | "gloom" | "lost-world",
  paletteKey,
  surfaceKey,
  silhouetteBias,
  materialAge,
  lightingKey,
  spriteGrade,
  geometryKit,
  breachIntensity
}
```

This is a visual projection. It must not alter creature identity, CR, statistics, or mechanics. Mechanical changes remain in the existing breach physics lenses and walk/encounter systems.

## The three families

### Fantasy / Frontier

Use for the grounded home world and ordinary travel:

- adult proportions;
- practical armor and worn textiles;
- weathered teal/green, brass, iron, leather, and earth;
- readable but restrained faceting;
- warm/cool lighting split;
- modest silhouette exaggeration only for size and role.

ImageGen prompt cues:

```text
mature grounded fantasy, weathered adult proportions, discreet faceted low-poly figurine, practical worn equipment, muted teal and oxidized brass, restrained natural palette, no toy plastic, no chibi proportions, no bright cartoon saturation
```

### Gloom

Use for a Gloom realm, a high-fray intrusion, or a Gloom-tagged breach:

- stronger vertical and severe silhouettes;
- charcoal, iron, bone, and muted violet;
- less visible warmth;
- edge ambiguity, doubled contours, and hard shadow planes;
- pale or absent eyes rather than large expressive eyes;
- sparse emissive violet or cold-blue accents.

ImageGen prompt cues:

```text
austere gothic dark fantasy, adult severe proportions, charcoal iron bone and desaturated violet, faceted low-poly figurine, solemn silhouette, compressed light, no cute expression, no colorful cartoon styling, no glossy toy finish
```

### Lost World

Use for a Lost World realm, ancient ruin, fossilized civilization, or archaeology-inflected breach:

- mineral and carved forms;
- sand, slate, oxidized bronze, teal relic color, and restrained cyan;
- ceremonial geometry and worn inscriptions as shape language, not readable text;
- heavier bodies and relic armor;
- aged surfaces with simple planar chips and erosion;
- light that suggests buried or recovered material.

ImageGen prompt cues:

```text
archaeological dark myth, adult field-worn proportions, carved mineral surfaces, oxidized bronze, slate, sand, restrained cyan relic accents, faceted low-poly figurine, ancient and dangerous, no toy plastic, no colorful cartoon styling
```

## Breach transition behavior

Do not swap the entire style abruptly unless the breach is a full realm crossing. Use intensity bands:

| Breach state | Visual effect |
|---|---|
| Rumored/nearby | ordinary style with one foreign accent or surface motif |
| Announced threshold | local lighting, fog, or palette begins to disagree |
| Active breach | active realm family controls sprite grade, surfaces, props, and lighting |
| Unstable return | doubled/ghosted style, inconsistent edges, route instability |
| Stable door | foreign family becomes persistent map/theater canon at that node |
| Sealed | style traces remain as memory, dressing, or ledger evidence but do not become stable geography |

The existing `breachPersistenceRoll` remains authoritative. Visual family must never imply that a breach is stable when the engine says it is not.

## Cross-realm continuity

The same creature can appear in all three families without becoming a new creature:

```text
frontier skeleton → gloom skeleton → lost-world skeleton
```

The registry should ideally preserve one mechanical identity with multiple visual entries:

```js
{
  creatureKey: "skeleton",
  variants: {
    frontier: "skeleton-frontier",
    gloom: "skeleton-gloom",
    lostWorld: "skeleton-lost-world"
  }
}
```

Fallback remains essential: if a realm variant is missing, use the base sprite with realm material grading rather than breaking the theater.

## Lighting and materials

Realm style should be expressed through the existing theater stack:

- `realmRenderProfile` handles broad color grade;
- realm surfaces select floor/wall material families;
- realm props provide dressing kits;
- walk/breach light rolls select the scene lighting preset;
- `theater-materials.js` supplies deterministic surface variation;
- `theater-boot.js` owns fog, emissive accents, sprite readability, and light caps.

Keep lighting cheap: one soft key, one fill/hemisphere contribution, fog, and a few emissive accents. The visual difference should come primarily from palette, silhouette, surface family, and dressing—not from expensive shaders.

## Mechanical separation

Visual family and mechanical breach physics are related but distinct:

- Gloom styling can accompany `magicDim`, `huntRules`, `stageRules`, or `timeSlip`, but none is automatic from color alone.
- Lost World styling can accompany `techWorks`, `lowGrav`, `stageRules`, or an archaeological realm table, but the roll owns the actual rule.
- Realm styling can alter narration, props, atmosphere, and sprite variants without changing combat numbers.
- Existing `breachApplyPhysicsToCombat` remains the only combat-adjacent physics delta seam.

## Production rule

Generate sprite families from one shared character/creature description and three realm-specific style suffixes. Preserve:

- silhouette;
- size category;
- pose and facing;
- equipment identity;
- anchor/baseline;
- CR and creature identity.

Change only:

- material history;
- palette;
- surface wear;
- lighting response;
- realm-specific silhouette accents;
- controlled breach distortion.

## Vision target

The player should be able to recognize:

1. “That is the same world creature,” and
2. “That creature has crossed into a different reality.”

The three style families provide that distinction without making the game visually incoherent. The breach becomes the diegetic reason for the art variation and the mechanical gate that determines whether the variation is temporary, unstable, or persistent.
