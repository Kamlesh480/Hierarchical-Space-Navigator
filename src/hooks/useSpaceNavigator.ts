import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchSites, fetchSpaces, addStream, deleteStream } from '../api';
import { buildTree, getAllStreamIds } from '../utils/tree';
import type { Site, Space, Stream, SpaceNode, Toast } from '../types';

export function useSpaceNavigator() {
  const [sites, setSites]                 = useState<Site[]>([]);
  const [sitesLoading, setSitesLoading]   = useState(true);
  const [sitesError, setSitesError]       = useState<string | null>(null);

  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [spaces, setSpaces]               = useState<Space[]>([]);
  const [spacesLoading, setSpacesLoading] = useState(false);
  const [spacesError, setSpacesError]     = useState<string | null>(null);

  const [selectedStreamIds, setSelectedStreamIds] = useState<Set<number>>(new Set());
  const [expandedSpaceIds, setExpandedSpaceIds]   = useState<Set<number>>(new Set());

  const [toasts, setToasts]   = useState<Toast[]>([]);
  const tempIdRef             = useRef(-1);

  // ── Sites ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchSites()
      .then(setSites)
      .catch((e: Error) => setSitesError(e.message))
      .finally(() => setSitesLoading(false));
  }, []);

  // ── Spaces ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedSiteId) return;
    setSpacesLoading(true);
    setSpacesError(null);
    setSpaces([]);
    setSelectedStreamIds(new Set());
    setExpandedSpaceIds(new Set());

    fetchSpaces(selectedSiteId)
      .then(setSpaces)
      .catch((e: Error) => setSpacesError(e.message))
      .finally(() => setSpacesLoading(false));
  }, [selectedSiteId]);

  // ── Toasts ───────────────────────────────────────────────────────────
  function pushToast(message: string, type: Toast['type']) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }

  function dismissToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // ── Stream selection ─────────────────────────────────────────────────
  function toggleStream(streamId: number) {
    setSelectedStreamIds((prev) => {
      const next = new Set(prev);
      next.has(streamId) ? next.delete(streamId) : next.add(streamId);
      return next;
    });
  }

  function toggleSpaceSelection(node: SpaceNode) {
    const allIds = getAllStreamIds(node);
    setSelectedStreamIds((prev) => {
      const next      = new Set(prev);
      const allChecked = allIds.length > 0 && allIds.every((id) => next.has(id));
      allChecked
        ? allIds.forEach((id) => next.delete(id))
        : allIds.forEach((id) => next.add(id));
      return next;
    });
  }

  // ── Expand/collapse ──────────────────────────────────────────────────
  function toggleExpand(spaceId: number) {
    setExpandedSpaceIds((prev) => {
      const next = new Set(prev);
      next.has(spaceId) ? next.delete(spaceId) : next.add(spaceId);
      return next;
    });
  }

  // ── Optimistic add stream ────────────────────────────────────────────
  async function handleAddStream(spaceId: number, name: string) {
    const tempId = tempIdRef.current--;
    const optimistic: Stream = { id: tempId, name, spaceId };

    setSpaces((prev) =>
      prev.map((sp) =>
        sp.id === spaceId ? { ...sp, streams: [...sp.streams, optimistic] } : sp
      )
    );

    try {
      const created = await addStream(spaceId, name);
      setSpaces((prev) =>
        prev.map((sp) =>
          sp.id === spaceId
            ? { ...sp, streams: sp.streams.map((s) => (s.id === tempId ? created : s)) }
            : sp
        )
      );
      setSelectedStreamIds((prev) => {
        if (!prev.has(tempId)) return prev;
        const next = new Set(prev);
        next.delete(tempId);
        next.add(created.id);
        return next;
      });
    } catch {
      setSpaces((prev) =>
        prev.map((sp) =>
          sp.id === spaceId
            ? { ...sp, streams: sp.streams.filter((s) => s.id !== tempId) }
            : sp
        )
      );
      setSelectedStreamIds((prev) => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });
      pushToast('Failed to add stream. Please try again.', 'error');
    }
  }

  // ── Optimistic delete stream ─────────────────────────────────────────
  async function handleDeleteStream(stream: Stream) {
    const { id: streamId, spaceId } = stream;

    setSpaces((prev) =>
      prev.map((sp) =>
        sp.id === spaceId
          ? { ...sp, streams: sp.streams.filter((s) => s.id !== streamId) }
          : sp
      )
    );
    setSelectedStreamIds((prev) => {
      const next = new Set(prev);
      next.delete(streamId);
      return next;
    });

    try {
      await deleteStream(streamId);
    } catch {
      setSpaces((prev) =>
        prev.map((sp) =>
          sp.id === spaceId ? { ...sp, streams: [...sp.streams, stream] } : sp
        )
      );
      pushToast('Failed to delete stream. Please try again.', 'error');
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────
  const tree = useMemo(() => buildTree(spaces), [spaces]);

  const selectedStreams = useMemo(
    () => spaces
      .flatMap((sp) => sp.streams ?? [])
      .filter((s) => s != null && selectedStreamIds.has(s.id)),
    [spaces, selectedStreamIds]
  );

  return {
    sites,
    sitesLoading,
    sitesError,
    selectedSiteId,
    setSelectedSiteId,
    tree,
    spacesLoading,
    spacesError,
    selectedStreamIds,
    expandedSpaceIds,
    selectedStreams,
    toasts,
    dismissToast,
    toggleStream,
    toggleSpaceSelection,
    toggleExpand,
    handleAddStream,
    handleDeleteStream,
  };
}
