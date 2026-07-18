/* dev/door-workbench/kgr8-leaf-fit.page.js — window.kgr8FitLeafToAperture, THE single source.
   KGR-8 door workbench (Adam's order, card-04 read: "unfortunately the door is still wrong, give
   me the controls please so i can position that thing").

   HISTORY (the card 01→04 lesson chain lives verbatim in capture-kgr8-clay-room.mjs's
   installLeafHelper header and dev/battle-gate/kgr8-clay-room/README.md deviation 3 — this file
   is the v4 helper EXTRACTED so the rig and the door workbench run the IDENTICAL fit code, plus
   the v5 workbench parameters. With every parameter at its default this function is v4 exactly:
   aperture-covering width (0.15 side lap), full slot height, HALF the measured slab depth,
   z-CENTERED in the slab, sill+plug+two-reveal aperture-interior fill.)

   v5 PARAMETERS (all optional; defaults = v4; the door-mount-lock.json values feed these):
     zOffset      leaf-center depth offset from the slab's mid-depth plane, in world units.
                  0 = slab-centered (v4). + moves the leaf TOWARD the room interior (+z on the
                  north wall), − pushes it deeper into the wall.
     depthFrac    leaf thickness as a fraction of the measured slab depth (v4: 0.5 — Adam's
                  "half the wall depth" canon; 1.0 = the rejected card-03 full-depth leaf).
     overlapW     side lap per side beyond the measured aperture (v4: 0.15 — covers the jamb
                  butt-end seams).
     headDrop     how far the leaf TOP stops below the wall top (v4: 0 = full-height slot).
                  When > 0 a clay HEAD infill box fills the aperture above the leaf through the
                  full tunnel depth — the portal-shape principle's "wall above the door head"
                  (ART-DIRECTION-CANON.md, DOOR-TOOL CONTINGENCY + PORTAL SHAPE), clay draft.
     sillHeight   how far the sill TOP rises above the floor-tile top (v4: 0 = flush threshold).
                  The leaf's bottom rests ON the sill top, so a raised sill is a real step.
     revealLining the two jamb linings on/off (v4: on — the measured yaw-45 parallax-slit
                  closure; off shows Adam what the bare jamb reveal looks like).

   Every fill box is degenerate-guarded (skipped when the leaf position collapses it) and the
   whole fill group is removed + rebuilt per call — idempotent, safe to re-assert at shot time.
   Axes are the north wall's (normal +z, tangent x); production graduates this by feeding its
   own wall-normal/tangent frame. */
window.kgr8FitLeafToAperture = function (K, opts) {
  opts = opts || {};
  const THREE = K.THREE;
  const wallRole = opts.wallRole || "wall-n";
  const overlapW = opts.overlapW != null ? opts.overlapW : 0.15; // per-side jamb OVERLAP (card 03: cover the seams — kept)
  const depthFrac = opts.depthFrac != null ? opts.depthFrac : 0.5; // leaf depth as a fraction of the slab depth (Adam's canon: half)
  const zOffset = opts.zOffset != null ? opts.zOffset : 0;          // v5: depth position within the wall (0 = slab-centered)
  const headDrop = opts.headDrop != null ? opts.headDrop : 0;       // v5: head/top treatment (0 = full-height slot)
  const sillHeight = opts.sillHeight != null ? opts.sillHeight : 0; // v5: sill height above the floor top
  const revealLining = opts.revealLining != null ? !!opts.revealLining : true; // v5: jamb linings on/off
  const lapS = 0.06;   // fill lap into the jamb slab bodies (hidden solid-on-solid)
  const epsY = 0.0008; // sub-mm top drop (the floor-overlap anti-z-fight convention)
  const flank = K.kitGroup.children.filter((h) => h.userData.role === wallRole);
  if (flank.length < 2) return { ok: false, error: "flanking wall pieces not found for " + wallRole };
  let hinge = null;
  K.interiorGroup.children.forEach((c) => { if (c.userData && c.userData.bySourceRef && c.children.length) hinge = c.children[0]; });
  if (!hinge) return { ok: false, error: "leaf hinge not found" };
  // 1. the wall plane: the flanking holders' OWN mount frames — the calibrated template-wall
  //    face sits at local z=0, so a north-wall holder's world z IS the interior face plane.
  const planes = flank.map((h) => h.position.z);
  const facePlane = Math.max(...planes);
  const planeSpread = Math.max(...planes) - Math.min(...planes);
  if (planeSpread > 1e-3) return { ok: false, error: "flanking walls disagree on the face plane: " + planeSpread };
  // 1b. the VISIBLE face plane (card 03): the wall's face details protrude interior of the
  //     slab plane — vertex-sample the flanking pieces in the slab band (y 0.2–1.2) for the
  //     max interior z. Clamped so a rogue chip can never drive the leaf into the room.
  let visibleFace = facePlane;
  {
    const v = new THREE.Vector3();
    const bandLo = 0.2, bandHi = 1.2;
    flank.forEach((h) => {
      h.updateWorldMatrix(true, true);
      h.traverse((o) => {
        if (!o.isMesh || !o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return;
        const pos = o.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
          if (v.y < bandLo || v.y > bandHi) continue;
          if (v.z > visibleFace) visibleFace = v.z;
        }
      });
    });
    if (visibleFace - facePlane > 0.35) visibleFace = facePlane + 0.35;
  }
  const detailProtrusion = +(visibleFace - facePlane).toFixed(4);
  // 2-3. aperture span + wall top + outward extent off the holders' world boxes (the
  //    calibrated piece bounds end exactly at the ±1 tangent half-extent — clean jamb ends).
  let wallTop = -Infinity, outwardMin = Infinity;
  const flankBoxes = flank.map((h) => {
    h.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(h);
    wallTop = Math.max(wallTop, box.max.y);
    outwardMin = Math.min(outwardMin, box.min.z);
    return { cx: (box.min.x + box.max.x) / 2, minX: box.min.x, maxX: box.max.x };
  });
  flankBoxes.sort((a, b) => a.cx - b.cx);
  const apertureLeft = flankBoxes[0].maxX;
  const apertureRight = flankBoxes[flankBoxes.length - 1].minX;
  const apertureW = apertureRight - apertureLeft;
  if (!(apertureW > 0.2)) return { ok: false, error: "degenerate aperture " + apertureW };
  const wallThickness = +(facePlane - outwardMin).toFixed(4); // reported: slab + plinth depth
  let floorTop = -Infinity;
  K.kitGroup.children.forEach((h) => {
    if (h.userData.role !== "floor") return;
    const b = new THREE.Box3().setFromObject(h);
    floorTop = Math.max(floorTop, b.max.y);
  });
  // measure the leaf, scale to the parameterized box, re-measure, align absolutely.
  hinge.updateWorldMatrix(true, true);
  let leafBox = new THREE.Box3().setFromObject(hinge);
  const leafW = leafBox.max.x - leafBox.min.x;
  const leafH = leafBox.max.y - leafBox.min.y;
  const leafD = leafBox.max.z - leafBox.min.z;
  const slabDepth = facePlane - outwardMin;          // the wall slab's own depth (measured, never a constant)
  const slabCenterZ = (facePlane + outwardMin) / 2;  // the slab's mid-depth plane
  const sillTop = floorTop + sillHeight;             // v5: the leaf stands ON the sill top
  const leafTopTarget = wallTop - headDrop;          // v5: head treatment lowers the leaf top
  if (!(leafTopTarget - sillTop > 0.1)) return { ok: false, error: "degenerate leaf height: sill " + sillHeight + " + headDrop " + headDrop + " leave " + (leafTopTarget - sillTop).toFixed(3) };
  const targetW = apertureW + 2 * overlapW;      // laps the jamb butt ends — no seam can show
  const targetH = leafTopTarget - sillTop;       // v4 default: floor top → wall top (full slot)
  const targetD = slabDepth * depthFrac;         // Adam's depth spec default: half the wall slab
  if (leafW > 1e-6) hinge.scale.x *= targetW / leafW;
  if (leafH > 1e-6) hinge.scale.y *= targetH / leafH;
  if (leafD > 1e-6) hinge.scale.z *= targetD / leafD;
  hinge.updateWorldMatrix(true, true);
  leafBox = new THREE.Box3().setFromObject(hinge);
  const dx = ((apertureLeft + apertureRight) / 2) - ((leafBox.min.x + leafBox.max.x) / 2);
  const dy = sillTop - leafBox.min.y;
  const dz = (slabCenterZ + zOffset) - ((leafBox.min.z + leafBox.max.z) / 2); // v5: z-centered in the slab + Adam's offset
  hinge.position.x += dx; hinge.position.y += dy; hinge.position.z += dz;
  hinge.updateWorldMatrix(true, true);
  const finalBox = new THREE.Box3().setFromObject(hinge);
  // APERTURE-INTERIOR FILL: sill + plug (+ head when the leaf stops short of the wall top)
  // (+ two reveal linings when on), rebuilt idempotently from the live measurements. Clay-toned
  // here AND re-clayed by every clayPass (the group lives inside K.kitGroup).
  if (K.apertureFill && K.apertureFill.parent) K.apertureFill.parent.remove(K.apertureFill);
  const fillMat = K.clayMat || (K.clayMat = new THREE.MeshStandardMaterial({ color: 0xa8a29a, roughness: 0.93, metalness: 0.0 }));
  const fill = new THREE.Group();
  fill.userData = { kgr8Module: "kgr8/aperture-fill", role: "aperture-fill", planX: (apertureLeft + apertureRight) / 2, planZ: facePlane };
  const fills = [];
  const addBox = (name, x0, x1, y0, y1, z0, z1) => {
    if (!(x1 - x0 > 1e-4 && y1 - y0 > 1e-4 && z1 - z0 > 1e-4)) return null; // degenerate under this placement — skipped, recorded as absent
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), fillMat);
    mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    mesh.userData = { kgr8ApertureFill: name };
    fill.add(mesh);
    const rec = { name, box: [x0, y0, z0, x1, y1, z1].map((n) => +n.toFixed(4)) };
    fills.push(rec);
    return rec;
  };
  const revealIn = 0.03; // lining straddle into the opening (visible aperture narrows by this per side)
  addBox("sill",
    apertureLeft - lapS, apertureRight + lapS,
    floorTop - 0.2, sillTop - epsY,
    outwardMin, facePlane + 0.05);
  addBox("plug",
    apertureLeft - lapS, apertureRight + lapS,
    floorTop - 0.05, wallTop - 0.001,
    outwardMin, finalBox.min.z + 0.02);
  if (headDrop > 0.0005) {
    // v5 HEAD INFILL — the wall above the door head (portal-shape principle, clay draft): full
    // aperture width + jamb lap, leaf top (lapped 0.02 into the leaf) → wall top, full tunnel
    // depth like the reveals, so the opening above the leaf reads as wall, not void.
    addBox("head",
      apertureLeft - lapS, apertureRight + lapS,
      finalBox.max.y - 0.02, wallTop - 0.001,
      outwardMin, visibleFace - 0.003);
  }
  if (revealLining) {
    addBox("revealL",
      apertureLeft - lapS, apertureLeft + revealIn,
      floorTop - 0.05, wallTop - 0.001,
      outwardMin, visibleFace - 0.003);
    addBox("revealR",
      apertureRight - revealIn, apertureRight + lapS,
      floorTop - 0.05, wallTop - 0.001,
      outwardMin, visibleFace - 0.003);
  }
  K.kitGroup.add(fill);
  K.apertureFill = fill;
  const result = {
    ok: true, facePlane: +facePlane.toFixed(4), visibleFace: +visibleFace.toFixed(4),
    detailProtrusion, wallTop: +wallTop.toFixed(4), wallThickness,
    slabDepth: +slabDepth.toFixed(4), slabCenterZ: +slabCenterZ.toFixed(4),
    leafDepth: +targetD.toFixed(4), depthFrac,
    revealDepth: +(visibleFace - finalBox.max.z).toFixed(4), // visible face → leaf face: the inset Adam reads
    floorTop: +floorTop.toFixed(4), aperture: [+apertureLeft.toFixed(4), +apertureRight.toFixed(4)],
    overlapW,
    params: { zOffset, depthFrac, overlapW, headDrop, sillHeight, revealLining }, // v5: the workbench/lock knobs as applied
    sillTop: +sillTop.toFixed(4), leafTop: +finalBox.max.y.toFixed(4),
    applied: { dx: +dx.toFixed(4), dy: +dy.toFixed(4), dz: +dz.toFixed(4), scaleX: +hinge.scale.x.toFixed(4), scaleY: +hinge.scale.y.toFixed(4), scaleZ: +hinge.scale.z.toFixed(4) },
    leafBox: { min: finalBox.min.toArray().map((n) => +n.toFixed(3)), max: finalBox.max.toArray().map((n) => +n.toFixed(3)) },
    apertureFill: fills,
  };
  K.lastLeafFit = result; // the audit-quad projection reads the same measurements
  return result;
};
