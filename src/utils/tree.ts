import type { Space, SpaceNode, CheckboxState } from '../types';

export function buildTree(spaces: Space[]): SpaceNode[] {
  const map = new Map<number, SpaceNode>();
  const roots: SpaceNode[] = [];

  for (const s of spaces) {
    map.set(s.id, { ...s, children: [] });
  }

  for (const s of spaces) {
    const node = map.get(s.id)!;
    if (s.parentSpaceId === null) {
      roots.push(node);
    } else {
      const parent = map.get(s.parentSpaceId);
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
  }

  return roots;
}

export function getAllStreamIds(node: SpaceNode): number[] {
  const ids = node.streams.map((s) => s.id);
  for (const child of node.children) ids.push(...getAllStreamIds(child));
  return ids;
}

export function getSpaceCheckboxState(
  node: SpaceNode,
  selectedIds: Set<number>
): CheckboxState {
  const all = getAllStreamIds(node);
  if (all.length === 0) return 'unchecked';
  const selected = all.filter((id) => selectedIds.has(id)).length;
  if (selected === 0) return 'unchecked';
  if (selected === all.length) return 'checked';
  return 'indeterminate';
}
