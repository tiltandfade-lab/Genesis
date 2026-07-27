import fs from 'fs';
const P=new URL('./walk-census-mapping.json', import.meta.url).pathname;
const d=JSON.parse(fs.readFileSync(P,'utf8'));
const un=d.goldenSiteMapping.wildMapped.rows.filter(r=>r.site===null);
// explicit head-noun -> cluster (one cluster per row, no double counting)
const M={
"Iron Pillar":"W1","Obsidian Pillar":"W1","Leaning Megalith":"W1","Fallen Megalith":"W1","Tilted Obelisk":"W1","Eroded Obelisk":"W1","Twin Pillars":"W1","Crescent Stones":"W1","Chalk Pillar":"W1","Brimstone Pillar":"W1","Sandstone Pillar":"W1","Spiked Column":"W1","Hollowed Column":"W1","Overgrown Column":"W1","Whispering Stone":"W1","Crumbling Needle":"W1","Petroglyph Stone":"W1","Stone Compass":"W1","Basalt Slab":"W1","Circular Dais":"W1","Giant Tuning Fork":"W1","Basalt Columns":"W1","Trail Cairn":"W1","Cairn Marker":"W1","Low Stone Fence":"W1",
"Heroic Statue":"W2","Kneeling Statue":"W2","Chained Statue":"W2","Weeping Statue":"W2","Eroded Sphinx":"W2","Multi-Armed Idol":"W2","Hollow Idol":"W2","Gargoyle Plinth":"W2","Marble Bust":"W2","Fallen Colossus":"W2","Stone Eye":"W2","Stone Serpents":"W2","Abstract Sculpture":"W2","Totem Pole":"W2","Petrified Monstrosity":"W2","Stone Cradle":"W2",
"Giant Anchor":"W3","Giant Bear Trap":"W3","Giant Axe":"W3","Giant Drum":"W3","Giant Shield":"W3","Giant Spear":"W3","Giant Arrow":"W3","Giant Cauldron":"W3","Giant Pitcher":"W3","Giant Chain Anchor":"W3","Gargantuan Helmet":"W3","Giant Shell":"W3","Giant Chessboard":"W3","Iron Bell":"W3","Fallen Bell":"W3","Iron Sphere":"W3","Iron Chains":"W3","Iron Grate":"W3","Grandfather Clock":"W3","Crystal Lens":"W3","Brass Telescope":"W3","Dressing Mirror":"W3","Obsidian Mirror":"W3","Tower of Books":"W3","Crystal Chandelier":"W3","Giant Chandelier (Crystal)":"W3","Perfectly Set Dinner Table":"W3","Plush Carpet":"W3","Velvet Chaise Lounge":"W3","Rocking Horse":"W3","Taxidermy Bear":"W3","Palanquin":"W3","Hanging Tapestry":"W3","Offering Table":"W3",
"Bone Pile":"W4","Skull Pyramid":"W4","Giant Skeleton (Humanoid)":"W4","Giant Skeleton (Beast)":"W4","Impaled Skeleton":"W4","Grave Mound":"W4","Stone Coffin (Hanging)":"W4","Funeral Pyre (Unlit)":"W4","Executioner's Block":"W4","Wooden Stocks":"W4","Gargantuan Eggshells":"W4",
"Lone Boulder":"W5","Balanced Rock":"W5","Split Boulder":"W5","Towering Mesa":"W5","Terraced Slopes":"W5","Natural Arch":"W5","Natural Amphitheater":"W5","Overhanging Cliff":"W5","Bottomless Crevasse":"W5","Narrow Fissure":"W5","Chasm with Landbridge":"W5","Stepped Sinkhole":"W5","Crystal Outcropping":"W5","Crystal Geode":"W5","Coral Brain":"W5","Meteoric Crater":"W5","Meteorite Crater (Glowing)":"W5","Meteorite Fragment":"W5","Fallen Star":"W5","Petrified Waterfall":"W5","Petrified Geyser":"W5","Lava Tube":"W5","Petrified Root System":"W5",
"Oasis / Hot Spring":"W6","Whirlpool / Siphon":"W6","Crystal Pool":"W6","Stone Font":"W6","Stone Well":"W6","Mirror of the Sky":"W6",
"Bramble Wall":"W7","Tangled Briar Patch":"W7","Web-Choked Trees":"W7","Mushroom Ring":"W7","Fungal Bloom":"W7","Thorny Arch":"W7","Great Fallen Log":"W7","Hollow Log":"W7","Glass Tree":"W7","Weeping Willow (Petrified)":"W7","Maze Segment":"W7",
"Crumbling Corner":"W8","Bisected Tower":"W8","Overhanging Wall":"W8","Aqueduct Span":"W8","Stone Bridge":"W8","Stepping Stones":"W8","Earthwork Trench":"W8","Stone Archery Blind":"W8","Ford Mooring Post":"W8","Floating Rock Steps":"W8","Floating Steps":"W8",
"Crashed Skiff":"W9","Overturned Caravel":"W9","Siege Engine":"W9","Clockwork Wreckage":"W9","Eldritch Machinery":"W9","Giant Hourglass":"W9","Stone Sundial":"W9",
// NON-MESH REMAINDERS
"Floating Weapon":"X1","Floating Crystal":"X1","Floating Earth Mote":"X1","Anti-Gravity Zone":"X1","Wild Magic Zone":"X1","Shadow-Weave Patch":"X1","Silent Zone":"X1","Spectral Flames":"X1","Time-Locked Debris":"X1","Singing Crystals":"X1","Eldritch Crystal":"X1","Bleeding Stone":"X1","Ghost Ship":"X1","Floating Water Globe":"X1",
"Lava Flow":"X2","Acidic Seep":"X2","Cursed Soil":"X2","Spore Cloud":"X2","Mud Flat":"X2","Glass Desert":"X2","Geothermal Vent":"X2",
"Carnivorous Plant":"X3"
};
const NAMES={W1:"Megalith / pillar / marker stone",W2:"Carved figure (statue, idol, relief)",W3:"Giant discarded object (oversized mundane)",W4:"Remains, bones, and funerary furniture",W5:"Natural rock + impact formation",W6:"Water feature (contained)",W7:"Vegetation / fungal barrier + petrified tree",W8:"Ruined built fragment + minor infrastructure",W9:"Wreck, vehicle, and mechanism",X1:"NON-MESH — illusion / levitation / field anomaly",X2:"NON-MESH — ground-material + field state",X3:"NON-MESH — living / animate"};
const tot={},rows={},miss=[];
for(const r of un){
  const head=r.key.split(':')[0].trim();
  const c=M[head];
  if(!c){miss.push(head);continue;}
  tot[c]=(tot[c]||0)+r.count; (rows[c]=rows[c]||[]).push([r.count,head]);
}
if(miss.length){console.log('UNASSIGNED:',miss);}
const order=Object.keys(tot).sort((a,b)=>tot[b]-tot[a]);
let gi=0,gd=0;
for(const c of order){gi+=tot[c];gd+=rows[c].length;}
console.log('assigned instances',gi,'assigned distinct',gd);
for(const c of order){
  console.log(`\n== ${c} ${NAMES[c]} — ${tot[c]} instances / ${rows[c].length} distinct`);
  console.log(rows[c].sort((a,b)=>b[0]-a[0]||a[1].localeCompare(b[1])).map(x=>`${x[0]} ${x[1]}`).join(' | '));
}
