/* GENESIS MODULE — KGR-4B attachment-frame solver.
   Attachment is a six-degree frame operation. Socket positions and quaternions are resolved from
   their owning donor node into the identity piece-root frame, then mating is one matrix equation:

     host.matrixWorld * hostSocket.localMatrix * mateFlip * inverse(childSocket.localMatrix)

   Structural wall placement does not belong here; canonical cell + quarter-turn orientation stays
   in theater-boot.js. This module is intentionally pure apart from the explicit applyMate mutation.
*/
import * as THREE from "three";

const EPSILON = 1e-12;

function finiteElements(matrix) {
  return !!(matrix && matrix.isMatrix4 && matrix.elements.every(Number.isFinite));
}

function invertible(matrix) {
  if (!finiteElements(matrix)) return false;
  const determinant = matrix.determinant();
  return Number.isFinite(determinant) && Math.abs(determinant) > EPSILON;
}

function localMatrixOf(object) {
  if (!object) return null;
  if (object.matrixAutoUpdate === false) {
    return finiteElements(object.matrix) ? object.matrix.clone() : null;
  }
  const position = object.position;
  const quaternion = object.quaternion;
  const scale = object.scale;
  if (!position || !quaternion || !scale ||
      ![position.x, position.y, position.z, quaternion.x, quaternion.y, quaternion.z, quaternion.w,
        scale.x, scale.y, scale.z].every(Number.isFinite)) return null;
  return new THREE.Matrix4().compose(position, quaternion, scale);
}

// Computes current world transform without calling updateMatrix/updateMatrixWorld, so a rejected
// mate cannot mutate either input's cached matrices.
function worldMatrixOf(object) {
  const chain = [];
  const seen = new Set();
  let cursor = object;
  while (cursor) {
    if (seen.has(cursor)) return null;
    seen.add(cursor);
    chain.push(cursor);
    cursor = cursor.parent || null;
  }
  const world = new THREE.Matrix4();
  for (let i = chain.length - 1; i >= 0; i--) {
    const local = localMatrixOf(chain[i]);
    if (!local) return null;
    world.multiply(local);
  }
  return finiteElements(world) ? world : null;
}

function rawSocketMatrix(socket) {
  if (Array.isArray(socket && socket.localMatrix) && socket.localMatrix.length === 16 &&
      socket.localMatrix.every(Number.isFinite)) {
    return new THREE.Matrix4().fromArray(socket.localMatrix);
  }
  const position = socket && socket.position;
  const rotation = socket && socket.rotation;
  if (!Array.isArray(position) || position.length !== 3 || !position.every(Number.isFinite) ||
      !Array.isArray(rotation) || rotation.length !== 4 || !rotation.every(Number.isFinite)) return null;
  const quaternion = new THREE.Quaternion(rotation[0], rotation[1], rotation[2], rotation[3]);
  const lengthSq = quaternion.lengthSq();
  if (!Number.isFinite(lengthSq) || lengthSq <= EPSILON) return null;
  quaternion.normalize();
  return new THREE.Matrix4().compose(
    new THREE.Vector3(position[0], position[1], position[2]),
    quaternion,
    new THREE.Vector3(1, 1, 1),
  );
}

function socketCandidates(piece, socketId) {
  const owned = [];
  if (piece && typeof piece.traverse === "function") {
    piece.traverse((owner) => {
      const donor = owner.userData && owner.userData.genesisDonor;
      if (!donor || !Array.isArray(donor.sockets)) return;
      donor.sockets.forEach((socket) => {
        if (socket && socket.id === socketId) owned.push({ owner, socket, rootFrame: false });
      });
    });
  }
  // loadDonorPiece republishes converted sockets on the piece root for classic callers. Prefer the
  // owning-node records when they exist, otherwise accept that already-root-frame representation.
  if (!owned.length) {
    const flat = piece && piece.userData && piece.userData.sockets;
    if (Array.isArray(flat)) flat.forEach((socket) => {
      if (socket && socket.id === socketId) owned.push({ owner: piece, socket, rootFrame: true });
    });
  }
  return owned;
}

export function socketFrameOf(piece, socketId) {
  if (!piece || typeof socketId !== "string" || !socketId) return null;
  const candidates = socketCandidates(piece, socketId);
  if (candidates.length !== 1) return null;
  const candidate = candidates[0];
  const socketMatrix = rawSocketMatrix(candidate.socket);
  if (!invertible(socketMatrix)) return null;

  let localMatrix = socketMatrix;
  if (!candidate.rootFrame) {
    const pieceWorld = worldMatrixOf(piece);
    const ownerWorld = worldMatrixOf(candidate.owner);
    if (!invertible(pieceWorld) || !invertible(ownerWorld)) return null;
    localMatrix = pieceWorld.clone().invert().multiply(ownerWorld).multiply(socketMatrix);
  }
  if (!invertible(localMatrix)) return null;
  return { socket: candidate.socket, localMatrix };
}

function pieceCategory(piece) {
  const data = piece && piece.userData;
  return data && ((data.genesisDonorPiece && data.genesisDonorPiece.category) || data.category) || null;
}

function compatible(host, hostSocket, child, childSocket) {
  if (!hostSocket || !childSocket || hostSocket.type !== childSocket.type) return false;
  const hostRule = hostSocket.mateRule || "coincident";
  const childRule = childSocket.mateRule || "coincident";
  if ((hostRule !== "coincident" && hostRule !== "opposed-z") || hostRule !== childRule) return false;
  const hostCategory = pieceCategory(host);
  const childCategory = pieceCategory(child);
  if (hostSocket.mateFamily && childCategory && hostSocket.mateFamily !== childCategory) return false;
  if (childSocket.mateFamily && hostCategory && childSocket.mateFamily !== hostCategory) return false;
  return true;
}

function frameErrors(target, actual) {
  const targetPosition = new THREE.Vector3().setFromMatrixPosition(target);
  const actualPosition = new THREE.Vector3().setFromMatrixPosition(actual);
  const positionError = targetPosition.distanceTo(actualPosition);
  const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().extractRotation(target),
  );
  const actualQuaternion = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().extractRotation(actual),
  );
  const dot = Math.min(1, Math.max(-1, Math.abs(targetQuaternion.dot(actualQuaternion))));
  const angleError = 2 * Math.acos(dot);
  return { positionError, angleError };
}

export function mateMatrix(host, hostSocketId, child, childSocketId, options = {}) {
  const hostFrame = socketFrameOf(host, hostSocketId);
  const childFrame = socketFrameOf(child, childSocketId);
  if (!hostFrame || !childFrame || !compatible(host, hostFrame.socket, child, childFrame.socket)) return null;
  const hostWorld = worldMatrixOf(host);
  if (!invertible(hostWorld) || !invertible(childFrame.localMatrix)) return null;

  const rule = options.mateRule || hostFrame.socket.mateRule || "coincident";
  if (rule !== "coincident" && rule !== "opposed-z") return null;
  if (options.mateRule && options.mateRule !== hostFrame.socket.mateRule) return null;
  const mateFlip = rule === "opposed-z"
    ? new THREE.Matrix4().makeRotationY(Math.PI)
    : new THREE.Matrix4();
  const targetSocketWorld = hostWorld.clone().multiply(hostFrame.localMatrix).multiply(mateFlip);
  const matrixWorld = targetSocketWorld.clone().multiply(childFrame.localMatrix.clone().invert());
  if (!invertible(matrixWorld)) return null;
  const actualSocketWorld = matrixWorld.clone().multiply(childFrame.localMatrix);
  const errors = frameErrors(targetSocketWorld, actualSocketWorld);
  if (![errors.positionError, errors.angleError].every(Number.isFinite)) return null;
  return { matrixWorld, positionError: errors.positionError, angleError: errors.angleError };
}

export function applyMate(child, result, parent) {
  if (!child || !result || !invertible(result.matrixWorld)) return false;
  const parentWorld = parent ? worldMatrixOf(parent) : new THREE.Matrix4();
  if (!invertible(parentWorld)) return false;
  const local = parentWorld.clone().invert().multiply(result.matrixWorld);
  if (!invertible(local)) return false;
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  local.decompose(position, quaternion, scale);
  if (![position.x, position.y, position.z, quaternion.x, quaternion.y, quaternion.z, quaternion.w,
        scale.x, scale.y, scale.z].every(Number.isFinite) || quaternion.lengthSq() <= EPSILON ||
      Math.abs(scale.x * scale.y * scale.z) <= EPSILON) return false;

  // No mutation occurs before every validation above has passed.
  if (parent) {
    if (child.parent !== parent) parent.add(child);
  } else if (child.parent) {
    child.parent.remove(child);
  }
  child.position.copy(position);
  child.quaternion.copy(quaternion).normalize();
  child.scale.copy(scale);
  return true;
}
