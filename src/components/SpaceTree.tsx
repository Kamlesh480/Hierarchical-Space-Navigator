import SpaceNode from './SpaceNode';
import type { SpaceNode as SpaceNodeType, Stream } from '../types';

interface Props {
  tree: SpaceNodeType[];
  loading: boolean;
  error: string | null;
  selectedIds: Set<number>;
  expandedIds: Set<number>;
  onToggleStream: (id: number) => void;
  onToggleSpace: (node: SpaceNodeType) => void;
  onToggleExpand: (id: number) => void;
  onOpenAddModal: (spaceId: number) => void;
  onDeleteStream: (stream: Stream) => void;
}

export default function SpaceTree({
  tree,
  loading,
  error,
  selectedIds,
  expandedIds,
  onToggleStream,
  onToggleSpace,
  onToggleExpand,
  onOpenAddModal,
  onDeleteStream,
}: Props) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Spaces</h2>
      </div>

      <div className="panel-body">
        {loading && (
          <div className="status-message">
            <span className="spinner" />
            Loading spaces…
          </div>
        )}

        {!loading && error && (
          <div className="status-message status-error">
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5zm-.75 7a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {!loading && !error && tree.length === 0 && (
          <div className="status-message">Select a site to view spaces.</div>
        )}

        {!loading && !error && tree.length > 0 && (
          <div className="tree">
            {tree.map((node) => (
              <SpaceNode
                key={node.id ?? node.name}
                node={node}
                depth={0}
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
    </section>
  );
}
