import { useState } from 'react';
import { useSpaceNavigator } from './hooks/useSpaceNavigator';
import SpaceTree from './components/SpaceTree';
import SelectedStreams from './components/SelectedStreams';
import AddStreamModal from './components/AddStreamModal';
import Notification from './components/Notification';
import './App.css';

export default function App() {
  const {
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
  } = useSpaceNavigator();

  const [addModalSpaceId, setAddModalSpaceId] = useState<number | null>(null);

  async function onAddStream(name: string) {
    if (addModalSpaceId === null) return;
    setAddModalSpaceId(null);
    await handleAddStream(addModalSpaceId, name);
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <h1 className="header-title">Space Navigator</h1>
          <span className="header-badge">FULLSTACK</span>
        </div>

        <div className="header-site-selector">
          <span className="site-selector-label">Select Site</span>
          {sitesError ? (
            <span className="site-selector-error">Failed to load sites</span>
          ) : (
            <select
              className="site-selector"
              value={selectedSiteId ?? ''}
              onChange={(e) => setSelectedSiteId(e.target.value || null)}
              disabled={sitesLoading}
            >
              <option value="" disabled>
                {sitesLoading ? 'Loading…' : 'Choose a site'}
              </option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="app-main">
        <SpaceTree
          tree={tree}
          loading={spacesLoading}
          error={spacesError}
          selectedIds={selectedStreamIds}
          expandedIds={expandedSpaceIds}
          onToggleStream={toggleStream}
          onToggleSpace={toggleSpaceSelection}
          onToggleExpand={toggleExpand}
          onOpenAddModal={setAddModalSpaceId}
          onDeleteStream={handleDeleteStream}
        />

        <SelectedStreams
          streams={selectedStreams}
          onRemove={handleDeleteStream}
        />
      </main>

      {/* Add stream modal */}
      {addModalSpaceId !== null && (
        <AddStreamModal
          onAdd={onAddStream}
          onCancel={() => setAddModalSpaceId(null)}
        />
      )}

      {/* Toast notifications */}
      <Notification toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
