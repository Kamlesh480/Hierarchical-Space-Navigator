import type { Toast } from '../types';

interface Props {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

export default function Notification({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.message}</span>
          <button
            className="toast-close"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
