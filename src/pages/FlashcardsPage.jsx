import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { createFolder, createDeck } from '../services/flashcardService';
import FolderTree from '../components/flashcards/FolderTree';
import DeckList from '../components/flashcards/DeckList';
import CardList from '../components/flashcards/CardList';
import { FolderPlus, Plus, Star } from 'lucide-react';
import './PageStyles.css';
import '../components/flashcards/Flashcards.css';

export default function FlashcardsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { folderId, deckId } = useParams();
  const userId = useAuthStore((s) => s.user?.id) || 'local';
  const [activeFolderId, setActiveFolderId] = useState(folderId || null);
  const [activeDeckId, setActiveDeckId] = useState(deckId || null);

  const handleSelectFolder = (id) => {
    setActiveFolderId(id);
    setActiveDeckId(null);
    navigate(`/flashcards/folder/${id}`, { replace: true });
  };

  const handleSelectDeck = (id) => {
    setActiveDeckId(id);
    navigate(`/flashcards/deck/${id}`, { replace: true });
  };

  const handleNewFolder = async () => {
    const folder = await createFolder(userId, {
      name: t('flashcards.newFolder'),
      parentId: activeFolderId || null,
    });
    setActiveFolderId(folder.id);
  };

  const handleNewDeck = async () => {
    if (!activeFolderId) return;
    const deck = await createDeck(userId, {
      name: t('flashcards.newDeck'),
      folderId: activeFolderId,
    });
    setActiveDeckId(deck.id);
  };

  const handleStudyDeck = (id) => {
    navigate(`/study/${id}`);
  };

  return (
    <div className="page">
      <h1 className="page-title">{t('flashcards.title')}</h1>
      <div className="flashcards-layout">
        <div className="flashcards-sidebar">
          <div className="flashcards-toolbar">
            <button className="flashcards-toolbar-btn" onClick={handleNewFolder}>
              <FolderPlus size={16} />
              {t('flashcards.newFolder')}
            </button>
            <button
              className="flashcards-toolbar-btn"
              onClick={() => navigate('/flashcards/starred')}
            >
              <Star size={16} />
              {t('flashcards.starred')}
            </button>
          </div>
          <FolderTree
            activeFolderId={activeFolderId}
            onSelectFolder={handleSelectFolder}
          />
        </div>
        <div className="flashcards-main">
          {activeDeckId ? (
            <CardList deckId={activeDeckId} />
          ) : (
            <>
              {activeFolderId && (
                <div className="flashcards-toolbar">
                  <button className="flashcards-toolbar-btn--accent flashcards-toolbar-btn" onClick={handleNewDeck}>
                    <Plus size={16} />
                    {t('flashcards.newDeck')}
                  </button>
                </div>
              )}
              <DeckList
                folderId={activeFolderId}
                activeDeckId={activeDeckId}
                onSelectDeck={handleSelectDeck}
                onStudyDeck={handleStudyDeck}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
