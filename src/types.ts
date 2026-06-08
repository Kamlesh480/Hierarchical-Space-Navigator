export interface Site {
  id: string;
  name: string;
}

export interface Stream {
  id: number;
  name: string;
  spaceId: number;
}

export interface Space {
  id: number;
  name: string;
  streams: Stream[];
  parentSpaceId: number | null;
}

export interface SpaceNode extends Space {
  children: SpaceNode[];
}

export type CheckboxState = 'checked' | 'indeterminate' | 'unchecked';

export interface Toast {
  id: number;
  message: string;
  type: 'error' | 'success';
}
