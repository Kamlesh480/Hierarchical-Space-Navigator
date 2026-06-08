import { useEffect, useRef, useState } from 'react';

interface Props {
  onAdd: (name: string) => void;
  onCancel: () => void;
}

export default function AddStreamModal({ onAdd, onCancel }: Props) {
  const [name, setName] = useState('');
  const inputRef        = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onAdd(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onCancel();
  }

  return (
    <div className="modal-backdrop" onClick={onCancel} onKeyDown={handleKeyDown}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <h3 className="modal-title">Add New Stream</h3>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="modal-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Stream name"
          />
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              Add Stream
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
