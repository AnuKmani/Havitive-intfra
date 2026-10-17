/** Page numbers to show: the first, the last, and the ones around the current page, with gaps marked as null. */
export function pageWindow(current: number, total: number) {
  const keep = new Set([1, total, current - 1, current, current + 1]);
  const out: (number | null)[] = [];
  for (let n = 1; n <= total; n++) {
    if (keep.has(n)) out.push(n);
    else if (out[out.length - 1] !== null) out.push(null);
  }
  return out;
}
