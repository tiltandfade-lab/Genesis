/* THEATER DISPOSE — the three pure scene-graph disposal helpers, extracted VERBATIM from
   src/ui/theater-boot.js in split step B4 (2026-07-25; docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md).

   OWNERSHIP: the P1' §3-D7 shared-resource disposal RULE and nothing else. disposeMeshMaybeShared
   skips dispose() for a geometry/material tagged `userData.shared` (a cached whole-object
   BufferGeometry is reused by every instance of the same registry key — disposing it when ONE
   wrapper group is swept would corrupt every other still-live figure); disposeGroupChild applies
   that rule to one child, attached or already DETACHED (BEAUTY-WAVE-4 MF-2's despawn-grace
   onLifted path); clearGroup pops and disposes a whole group's children. Pure by census: no THREE
   import, no theater state S, no root symbol of any kind — which is why this module has NO
   init/ctx function and NO SyncState. It cannot go stale and it cannot be wired wrong.

   THIS IS NOT THE END-OF-LIFE AUTHORITY. disposeAuxCaches and retire STAY in theater-boot.js —
   they are the root's one true end-of-life point (and dev/verify-theater-verbs.mjs text-extracts
   both from the root's own source). Every root caller of clearGroup (setBoard, setInteriorBoard,
   setUnits, retire, the FX sweeps) and of disposeGroupChild (setUnits' despawn-grace onLifted, the
   dead-state marker sweep) now reaches them through the root's plain `import` of this file.
   disposeMeshMaybeShared is exported for completeness but has no reader outside this module — its
   only two call sites (disposeGroupChild's two branches) moved here with it.

   NON-VERBATIM EDITS (the complete list): this header and the trailing `export {...}` block. Not
   one byte inside a moved declaration changed. */

// P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §3-D7): dispose one mesh's geometry+material, UNLESS its
// geometry is tagged shared (userData.shared, set once by wholeObjectGeometryFor at cache-insert time)
// — a cached whole-object BufferGeometry is reused across EVERY unit/prop instance of the same
// registry key, so disposing it when ONE figure's wrapper group gets swept would corrupt every other
// still-live figure sharing that same cached geometry. The mesh still fully DETACHES either way
// (clearGroup's own child-removal loop below handles that uniformly) — only the dispose() call is
// skipped for a shared geometry. Materials are NEVER shared-tagged (wholeObjectMaterialsFor's own
// cache is keyed by opacity only, reused the same way — dispose is skipped for those too, since a
// disposed shared material would break every other figure using that opacity bucket); non-whole-
// object meshes carry no `shared` tag on either geometry or material, so their dispose is unaffected —
// byte-identical to before this unit for every cuboid-path figure/prop.
function disposeMeshMaybeShared(mesh){
  const sharedGeo = !!(mesh.geometry && mesh.geometry.userData && mesh.geometry.userData.shared);
  if(mesh.geometry && !sharedGeo) mesh.geometry.dispose();
  if(mesh.material){
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const sharedMat = mats.some(m => m && m.userData && m.userData.shared);
    if(!sharedMat) mats.forEach(m => m && m.dispose());
  }
}
// P1' WHOLE-OBJECT WIRING (§3-D7): a whole-object figure/prop is a THREE.Group wrapper (matching
// the pre-existing cuboid-figure convention — every archetype builder ALSO returns a Group, not a
// bare Mesh) holding ONE mesh with a cached/shared geometry+material triple. Traverse into it (one
// level is sufficient — the wrapper's only child is that one mesh) so the shared-geometry/material
// skip actually reaches the mesh that carries the tag; a plain cuboid figure's own nested boxes
// (never tagged shared) still dispose exactly as before via the same traversal. Factored out of
// clearGroup (BEAUTY-WAVE-4.md MF-2) so a single DETACHED figure — a despawn-grace tween's onLifted,
// which pulls one child OUT of its group before clearGroup ever sees it (see setUnits' despawn diff) —
// can dispose itself via the exact same logic, byte-identical to what clearGroup already did per child.
function disposeGroupChild(child){
  if(child.geometry || child.material){
    disposeMeshMaybeShared(child);
  } else if(child.children && child.children.length){
    child.traverse(function(n){ if(n.geometry || n.material) disposeMeshMaybeShared(n); });
  }
}
function clearGroup(group){
  if(!group) return;
  while(group.children.length){
    const child = group.children.pop();
    disposeGroupChild(child);
  }
}

export { clearGroup, disposeGroupChild, disposeMeshMaybeShared };
