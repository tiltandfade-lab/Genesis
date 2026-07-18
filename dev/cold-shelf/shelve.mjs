#!/usr/bin/env node
// One-shot cold-shelf mover: copy repo/external heavy files to the Google Drive
// "Genesis Cold Shelf", verify by sha256, then remove the source. Re-runnable /
// idempotent: an item whose Drive copy already verifies is skipped and its source
// removed. Emits dev/cold-shelf/manifest.json. Tracked files are copied+verified
// here but their working/index removal is left to a `git rm` step (reported).
//
// Usage: node dev/cold-shelf/shelve.mjs
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

const REPO = '/Volumes/Genesis/Genesis';
const DRIVE_MOUNT = '/Users/adamstephenson/Library/CloudStorage/GoogleDrive-adamstephenson17@gmail.com';
const SHELF_REL = 'My Drive/Genesis Cold Shelf';
const SHELF_ABS = path.join(DRIVE_MOUNT, SHELF_REL);

function sha256(file) {
  return new Promise((resolve, reject) => {
    const h = createHash('sha256');
    createReadStream(file).on('error', reject).on('data', d => h.update(d)).on('end', () => resolve(h.digest('hex')));
  });
}
async function exists(p) { try { await fs.access(p); return true; } catch { return false; } }
async function walk(dir, base = dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(abs, base));
    else if (e.isFile()) out.push(path.relative(base, abs));
  }
  return out;
}
async function copyVerify(src, dest) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const srcHash = await sha256(src);
  // Skip re-copy if a good copy already exists.
  if (await exists(dest) && (await sha256(dest)) === srcHash) return { sha256: srcHash, size: (await fs.stat(src)).size, skipped: true };
  await fs.copyFile(src, dest);
  const destHash = await sha256(dest);
  if (destHash !== srcHash) throw new Error(`HASH MISMATCH ${src} src=${srcHash} dest=${destHash}`);
  return { sha256: srcHash, size: (await fs.stat(src)).size, skipped: false };
}

// --- item list -------------------------------------------------------------
async function fileItems() {
  const items = [];
  // Reference/*.pdf (top-level only; keep SRD-Data/ and _Index/)
  for (const f of await fs.readdir(path.join(REPO, 'Reference'))) {
    if (f.toLowerCase().endsWith('.pdf')) items.push({ repoPath: `Reference/${f}`, shelfPath: `Reference/${f}`, tracked: false });
  }
  // quarantine-pack zips (tracked)
  const qz = [
    'quarantine-pack/pre-unification/originals-r2.zip',
    'quarantine-pack/pre-unification/originals.zip',
    'quarantine-pack/pre-mc2/originals.zip',
    'quarantine-pack/pre-magenta-crud/originals.zip',
  ];
  for (const z of qz) items.push({ repoPath: z, shelfPath: z, tracked: true });
  return items;
}
// external trees (outside the repo or untracked-in-worktree)
const treeItems = [
  { srcAbs: '/Volumes/Genesis/faceted-harvest-2026-07-14', shelfPath: '_external/faceted-harvest-2026-07-14', origin: '/Volumes/Genesis/faceted-harvest-2026-07-14', repoPath: '_external/faceted-harvest-2026-07-14' },
  { srcAbs: '/Volumes/Genesis/Genesis-sprite-r4/.discarded-round4-restart', shelfPath: '_discarded/sprite-r4-round4-restart', origin: '/Volumes/Genesis/Genesis-sprite-r4/.discarded-round4-restart', repoPath: '_discarded/sprite-r4-round4-restart' },
];

const manifest = {
  shelfName: 'Genesis Cold Shelf',
  driveMount: DRIVE_MOUNT,
  shelfRootRelToMount: SHELF_REL,
  created: '2026-07-18',
  note: 'Cold archive of heavy Genesis files. Restore with dev/cold-shelf/fetch-cold.mjs.',
  entries: [],
};
const gitRmList = [];

const files = await fileItems();
for (const it of files) {
  const src = path.join(REPO, it.repoPath);
  if (!await exists(src)) { console.log(`MISSING SOURCE (skip): ${it.repoPath}`); continue; }
  const r = await copyVerify(src, path.join(SHELF_ABS, it.shelfPath));
  manifest.entries.push({ type: 'file', repoPath: it.repoPath, shelfPath: it.shelfPath, sha256: r.sha256, size: r.size, backend: 'drive', tracked: it.tracked });
  console.log(`${r.skipped ? 'VERIFIED' : 'COPIED  '} ${(r.size/1048576).toFixed(1)}M  ${it.repoPath}`);
  if (it.tracked) gitRmList.push(it.repoPath);
  else { await fs.rm(src); console.log(`  removed source (untracked)`); }
}
for (const t of treeItems) {
  if (!await exists(t.srcAbs)) { console.log(`MISSING TREE (skip): ${t.srcAbs}`); continue; }
  const rels = await walk(t.srcAbs);
  const fileList = [];
  for (const rel of rels) {
    const r = await copyVerify(path.join(t.srcAbs, rel), path.join(SHELF_ABS, t.shelfPath, rel));
    fileList.push({ path: rel, sha256: r.sha256, size: r.size });
  }
  manifest.entries.push({ type: 'tree', repoPath: t.repoPath, shelfPath: t.shelfPath, origin: t.origin, backend: 'drive', tracked: false, files: fileList });
  const total = fileList.reduce((a, f) => a + f.size, 0);
  console.log(`TREE ${(total/1048576).toFixed(1)}M (${fileList.length} files)  ${t.shelfPath}`);
  await fs.rm(t.srcAbs, { recursive: true });
  console.log(`  removed source tree`);
}

await fs.writeFile(path.join(REPO, 'dev/cold-shelf/manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`\nmanifest: ${manifest.entries.length} entries written`);
console.log(`git rm needed for ${gitRmList.length} tracked files:`);
for (const g of gitRmList) console.log(`  ${g}`);
