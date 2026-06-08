import { useEffect, useRef } from 'react';
import type { CheckboxState } from '../types';

interface Props {
  state: CheckboxState;
  onChange: () => void;
  label?: string;
}

export default function Checkbox({ state, onChange, label }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.indeterminate = state === 'indeterminate';
    ref.current.checked       = state === 'checked';
  }, [state]);

  return (
    <input
      ref={ref}
      type="checkbox"
      className="tree-checkbox"
      aria-label={label}
      onChange={onChange}
    />
  );
}
