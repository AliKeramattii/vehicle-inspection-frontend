export type ScreenAnchor = { code: string; x: number; y: number };
// Keep full 44px hit targets distinct when several semantic regions share a small projection.
export function layoutInspectionPins(anchors: readonly ScreenAnchor[], width: number, height: number, selectedCode: string): ScreenAnchor[] {
  const ordered = [...anchors].sort((a, b) => Number(b.code === selectedCode) - Number(a.code === selectedCode));
  const placed: ScreenAnchor[] = [];
  const offsets = [[0, 0], [0, -46], [0, 46], [-46, 0], [46, 0], [-46, -46], [46, -46], [-46, 46], [46, 46], [0, -92], [0, 92]];
  for (const anchor of ordered) {
    const candidates = offsets.map(([dx, dy]) => ({ ...anchor, x: Math.max(22, Math.min(width - 22, anchor.x + dx)), y: Math.max(22, Math.min(height - 22, anchor.y + dy)) }));
    placed.push(candidates.find((candidate) => placed.every((other) => Math.abs(other.x - candidate.x) >= 44 || Math.abs(other.y - candidate.y) >= 44)) ?? candidates[0]);
  }
  return anchors.map((anchor) => placed.find((point) => point.code === anchor.code)!);
}
