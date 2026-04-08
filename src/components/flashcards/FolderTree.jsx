import { useFolders } from '../../hooks/useFlashcards';
import FolderNode from './FolderNode';
import './Flashcards.css';

export default function FolderTree({ activeFolderId, onSelectFolder }) {
  const rootFolders = useFolders(null);

  return (
    <div className="folder-tree">
      {rootFolders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          activeFolderId={activeFolderId}
          onSelectFolder={onSelectFolder}
        />
      ))}
    </div>
  );
}
