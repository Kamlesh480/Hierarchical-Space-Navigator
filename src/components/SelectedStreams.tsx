import type { Stream } from '../types';

interface Props {
  streams: Stream[];
  onRemove: (stream: Stream) => void;
}

export default function SelectedStreams({ streams, onRemove }: Props) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Selected Streams</h2>
        <span className="badge">{streams.length}</span>
      </div>

      <div className="panel-body">
        {streams.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="9" y="2" width="6" height="4" rx="1" strokeWidth="1.5" />
              <path
                d="M4 6h16l-1.5 14H5.5L4 6z"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <p className="empty-title">No Streams Selected</p>
            <p className="empty-subtitle">Select streams from the tree view to see them here</p>
          </div>
        ) : (
          <ul className="stream-list">
            {streams.map((s) => (
              <li key={s.id} className="stream-list-item">
                <span className="stream-list-name">{s.name}</span>
                <button
                  className="stream-list-remove"
                  onClick={() => onRemove(s)}
                  aria-label={`Remove ${s.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
