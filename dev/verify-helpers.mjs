/* dev/verify-helpers.mjs — HQ2-8f: the one shared home for byte-identical helpers duplicated across
   dev/verify-*.mjs harnesses. dev/verify-seat.mjs and dev/verify-dm-contract.mjs each defined their
   own `setEq` (mutual set-equality, no frozen count — the census-literal rule); this is that helper,
   imported instead of copy-pasted, establishing the shared-import precedent for future harnesses.
   No manifest entry — dev/ is not in loadOrder. */

export const setEq = (a, b) => {
  const A = new Set(a), B = new Set(b);
  if (A.size !== B.size) return false;
  for (const x of A) if (!B.has(x)) return false;
  return true;
};
