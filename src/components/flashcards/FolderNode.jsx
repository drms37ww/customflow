import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronRight, Folder } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';
import db from '../../db/dexie';
import './Flashcards.css';

export default function FolderNode({ folder, activeFolderId, onSelectFolder, depth = 0 }) {
  const expanded = useUiStore((s) => s.flashcardExpandedFolders[folder.id]);
  const toggleExpanded = useUiStore((s) => s.toggleFolderExpanded);

  const children = useLiveQuery(
    () => db.flashcardFolders
      .where('parentId').equals(folder.id)
      .filter((f) => !f.deletedAt)
      .sortBy('sortOrder'),
    [folder.id],
    []
  );

  const deckCount = useLiveQuery(
    () => db.flashcardDecks
      .where('folderId').equals(folder.id)
      .filter((d) => !d.deletedAt)
      .count(),
    [folder.id],
    0
  );

  const hasChildren = children.length > 0;
  const isActive = activeFolderId === folder.id;

  return (
    <div className="folder-node">
      <div
        className={`folder-node-header ${isActive ? 'folder-node-header--active' : ''}`}
        onClick={() => onSelectFolder(folder.id)}
        style={{ paddingLeft: depth * 16 + 8 }}
      >
        {hasChildren ? (
          <ChevronRight
            size={14}
            className={`folder-node-chevron ${expanded ? 'folder-node-chevron--expanded' : ''}`}
            onClick={(e) => { e.stopPropagation(); toggleExpanded(folder.id); }}
          />
        ) : (
          <span style={{ width: 14 }} />
        )}
        <Folder size={16} />
        <span className="folder-node-name">{folder.name}</span>
        <span className="folder-node-count">{deckCount}</span>
      </div>
      {expanded && hasChildren && (
        <div className="folder-node-children">
          {children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              activeFolderId={activeFolderId}
              onSelectFolder={onSelectFolder}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
