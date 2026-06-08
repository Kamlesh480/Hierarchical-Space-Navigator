import Checkbox from './Checkbox';
import { getSpaceCheckboxState } from '../utils/tree';
import type { SpaceNode as SpaceNodeType, Stream } from '../types';

interface Props {
  node: SpaceNodeType;
  depth: number;
  selectedIds: Set<number>;
  expandedIds: Set<number>;
  onToggleStream: (id: number) => void;
  onToggleSpace: (node: SpaceNodeType) => void;
  onToggleExpand: (id: number) => void;
  onOpenAddModal: (spaceId: number) => void;
  onDeleteStream: (stream: Stream) => void;
}

export default function SpaceNode({
  node,
  depth,
  selectedIds,
  expandedIds,
  onToggleStream,
  onToggleSpace,
  onToggleExpand,
  onOpenAddModal,
  onDeleteStream,
}: Props) {
  const isExpanded    = expandedIds.has(node.id);
  const spaceState    = getSpaceCheckboxState(node, selectedIds);
  const hasContent    = node.streams.length > 0 || node.children.length > 0;
  const isEmpty       = node.streams.length === 0 && node.children.length === 0;
  const indent        = depth * 20;

  return (
    <div className="tree-node">
      {/* Space row */}
      <div className="tree-row space-row" style={{ paddingLeft: indent }}>
        {/* Expand toggle */}
        <button
          className={`expand-btn ${!hasContent ? 'expand-btn--hidden' : ''}`}
          onClick={() => hasContent && onToggleExpand(node.id)}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
          tabIndex={hasContent ? 0 : -1}
        >
          <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>›</span>
        </button>

        <Checkbox
          state={spaceState}
          onChange={() => onToggleSpace(node)}
          label={node.name}
        />

        <span className="tree-label space-label">
          {node.name}
          {isEmpty && <span className="empty-badge">(Empty)</span>}
        </span>

        <button
          className="action-btn add-btn"
          onClick={() => onOpenAddModal(node.id)}
          aria-label={`Add stream to ${node.name}`}
        >
          +
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="tree-children">
          {/* Streams first */}
          {node.streams.map((stream) => (
            <div
              key={stream.id}
              className="tree-row stream-row"
              style={{ paddingLeft: indent + 20 }}
            >
              <span className="expand-btn expand-btn--hidden" aria-hidden />
              <Checkbox
                state={selectedIds.has(stream.id) ? 'checked' : 'unchecked'}
                onChange={() => onToggleStream(stream.id)}
                label={stream.name}
              />
              <span className="tree-label stream-label">{stream.name}</span>
              <button
                className="action-btn delete-btn"
                onClick={() => onDeleteStream(stream)}
                aria-label={`Delete ${stream.name}`}
              >
                ✕
              </button>
            </div>
          ))}

          {/* Child spaces */}
          {node.children.map((child) => (
            <SpaceNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedIds={selectedIds}
              expandedIds={expandedIds}
              onToggleStream={onToggleStream}
              onToggleSpace={onToggleSpace}
              onToggleExpand={onToggleExpand}
              onOpenAddModal={onOpenAddModal}
              onDeleteStream={onDeleteStream}
            />
          ))}
        </div>
      )}
    </div>
  );
}
