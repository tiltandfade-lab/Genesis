/* THEATER GROUND FIELD — one optional compiled world-sized surface shared by the flat tabletop and
   production interior/Clayroom realizers. It owns no board semantics and no fixture: callers hand it
   a board.groundField descriptor, the already-resolved board bounds/origin, and the group/lifecycle
   callback belonging to their channel. That keeps texture loading, filtering, PBR material setup,
   reporting, and async replay singular while the two scene realizers retain their geometry and
   camera ownership.

   A compiled field is deliberately one plane over the complete visible footprint. The image itself
   already contains the compiler's world-scale cell field; its 0..1 UVs do NOT stretch one source
   tile over the room. Repeating its source independently per cell would reintroduce the exact
   single-tile cadence Assetforge's ground-field compiler exists to remove. */

import * as THREE from "three";

function groundFieldTextureFor(opts, channel, source){
  const { S, data, textureLoader, rebuild } = opts;
  if(!source || !textureLoader) return null;
  let resolved = source;
  try{ resolved = new URL(source, document.baseURI).href; }catch(e){ resolved = source; }
  const key = "ground-field:" + channel + ":" + resolved;
  const hit = S.textures && S.textures[key];
  if(hit && hit !== "pending") return hit;
  if(hit === "pending") return null;
  if(!S.textures) S.textures = {};
  S.textures[key] = "pending";
  textureLoader.load(
    resolved,
    function(tex){
      const isColor = channel === "albedo";
      tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
      // This surface is usually seen at steep, wide-angle minification. Nearest/no-mipmap sampling
      // made the correctly-sized 2.8K field alias into crust. Preserve crisp magnification on the
      // albedo, but use the material lane's filtered data-channel rule plus trilinear minification.
      tex.magFilter = isColor ? THREE.NearestFilter : THREE.LinearFilter;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.generateMipmaps = true;
      if(S.renderer && S.renderer.capabilities && S.renderer.capabilities.getMaxAnisotropy){
        tex.anisotropy = Math.min(8, S.renderer.capabilities.getMaxAnisotropy());
      }
      tex.needsUpdate = true;
      S.textures[key] = tex;
      if(S.mounted && S.lastBoard === data && typeof rebuild === "function"){
        S.boardKey = null;
        rebuild(data);
      }
    },
    undefined,
    function(){
      delete S.textures[key];
      if(S.groundFieldReport) S.groundFieldReport.loadErrors++;
    }
  );
  return null;
}

export function mountCompiledGroundField(opts){
  const {
    S, data, group, bounds, centerX, centerZ, y, textureLoader,
    applyPsxShaderTweaks, rebuild, renderChannel,
  } = opts;
  const spec = data && data.groundField;
  S.groundFieldReport = null;
  if(window.Theater && window.Theater.stats) window.Theater.stats.groundField = null;
  if(!spec || !spec.albedo || !group || !bounds) return null;

  const albedo = groundFieldTextureFor(opts, "albedo", spec.albedo);
  const normal = groundFieldTextureFor(opts, "normal", spec.normal);
  const orm = groundFieldTextureFor(opts, "orm", spec.orm);
  const roughness = orm || groundFieldTextureFor(opts, "roughness", spec.roughness);
  const width = Math.max(1, bounds.maxX - bounds.minX + 1);
  const depth = Math.max(1, bounds.maxZ - bounds.minZ + 1);
  const material = applyPsxShaderTweaks(new THREE.MeshStandardMaterial({
    color: spec.tint != null ? spec.tint : 0xffffff,
    map: albedo || null,
    normalMap: normal || null,
    aoMap: orm || null,
    roughnessMap: roughness || null,
    metalnessMap: orm || null,
    roughness: spec.roughnessValue != null ? spec.roughnessValue : 0.86,
    metalness: 0,
  }), { worldSurface: true });
  if(normal){
    const normalScale = spec.normalScale != null ? spec.normalScale : 1;
    material.normalMapType = THREE.TangentSpaceNormalMap;
    material.normalScale.set(normalScale, normalScale);
  }
  if(orm) material.aoMapIntensity = spec.aoMapIntensity != null ? spec.aoMapIntensity : 0.72;
  material.name = "ground-field-material";
  const geometry = new THREE.PlaneGeometry(width, depth, width, depth);
  geometry.setAttribute("uv1", geometry.attributes.uv.clone());
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "ground-field";
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(centerX, y, centerZ);
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  mesh.renderOrder = 1;
  mesh.userData.groundField = true;
  mesh.userData.interiorKind = "ground-field-proof";
  mesh.userData.albedoSource = spec.albedo;
  mesh.userData.roughnessSource = spec.roughness || null;
  group.add(mesh);

  S.groundFieldReport = {
    mounted: true,
    renderChannel: renderChannel || null,
    fixtureId: spec.fixtureId || null,
    comparisonMode: spec.comparisonMode || "compiled",
    width,
    depth,
    center: [mesh.position.x, mesh.position.z],
    surfaceY: mesh.position.y,
    albedoReady: !!albedo,
    normalReady: !!normal,
    ormReady: !!orm,
    roughnessReady: !!roughness,
    loadErrors: 0,
    receivesShadow: mesh.receiveShadow,
    materialType: material.type,
    minFilter: albedo ? albedo.minFilter : null,
    magFilter: albedo ? albedo.magFilter : null,
    generatedMipmaps: albedo ? albedo.generateMipmaps : null,
    anisotropy: albedo ? albedo.anisotropy : null,
    materialChannels: {
      albedo: !!material.map,
      normal: !!material.normalMap,
      ao: !!material.aoMap,
      roughness: !!material.roughnessMap,
      metalness: !!material.metalnessMap,
    },
    source: {
      albedo: spec.albedo,
      normal: spec.normal || null,
      orm: spec.orm || null,
      roughness: spec.roughness || null,
      compilerReceipt: spec.compilerReceipt || null,
    },
  };
  if(window.Theater && window.Theater.stats) window.Theater.stats.groundField = S.groundFieldReport;
  return mesh;
}
