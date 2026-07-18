#!/usr/bin/env node
// Restore cold-shelved files from the Google Drive "Genesis Cold Shelf" back into
// the repo, verifying sha256. Reads dev/cold-shelf/manifest.json.
//
//   node dev/cold-shelf/fetch-cold.mjs           # restore any missing shelved files
//   node dev/cold-shelf/fetch-cold.mjs --check   # report presence (local + Drive), no writes
//
// The Drive mount is a macOS FileProvider virtual FS; if a file reads slow the
// first time it is materializing from the cloud — that is expected.
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const CHECK = process.argv.includes('--check');

const manifest = JSON.parse(await fs.readFile(path.join(HERE, 'manifest.json'), 'utf8'));
const SHELF_ABS = path.join(manifest.driveMount, manifest.shelfRootRelToMount);

function sha256(file) {
  return new Promise((resolve, reject) => {
    const h = createHash('sha256');
    createReadStream(file).on('error', reject).on('data', d => h.update(d)).on('end', () => resolve(h.digest('hex')));
  });
}
async function exists(p) { try { await fs.access(p); return true; } catch { return false; } }
async function restore(shelfAbs, destAbs, sha) {
  await fs.mkdir(path.dirname(destAbs), { recursive: true });
  await fs.copyFile(shelfAbs, destAbs);
  const got = await sha256(destAbs);
  if (got !== sha) throw new Error(`HASH MISMATCH after restore ${destAbs}\n  want ${sha}\n  got  ${got}`);
}

let localPresent = 0, localAbsent = 0, drivePresent = 0, driveMissing = 0, restored = 0, failed = 0;
const flat = [];
for (const e of manifest.entries) {
  if (e.type === 'file') flat.push({ shelfPath: e.shelfPath, repoPath: e.repoPath, sha256: e.sha256, size: e.size });
  else for (const f of e.files) flat.push({ shelfPath: path.join(e.shelfPath, f.path), repoPath: path.join(e.repoPath, f.path), sha256: f.sha256, size: f.size });
}

for (const it of flat) {
  const destAbs = path.join(REPO, it.repoPath);
  const shelfAbs = path.join(SHELF_ABS, it.shelfPath);
  const hasLocal = await exists(destAbs);
  const hasDrive = await exists(shelfAbs);
  hasLocal ? localPresent++ : localAbsent++;
  hasDrive ? drivePresent++ : driveMissing++;
  if (CHECK) {
    console.log(`${hasLocal ? 'local:present ' : 'local:ABSENT  '} ${hasDrive ? 'drive:present' : 'drive:MISSING'}  ${it.repoPath}`);
    continue;
  }
  if (hasLocal) { console.log(`skip (present)  ${it.repoPath}`); continue; }
  if (!hasDrive) { console.error(`CANNOT RESTORE (not in Drive): ${it.shelfPath}`); failed++; continue; }
  try { await restore(shelfAbs, destAbs, it.sha256); restored++; console.log(`restored ${(it.size/1048576).toFixed(1)}M  ${it.repoPath}`); }
  catch (err) { failed++; console.error(String(err)); }
}

console.log(`\n${flat.length} shelved files | local present ${localPresent} / absent ${localAbsent} | drive present ${drivePresent} / missing ${driveMissing}`);
if (!CHECK) console.log(`restored ${restored}, failed ${failed}`);
if (driveMissing || failed) process.exitCode = 1;
