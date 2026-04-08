import { useDecks } from '../../hooks/useFlashcards';
import { useTranslation } from 'react-i18next';
import { updateDeck } from '../../services/flashcardService';
import { Star, BookOpen } from 'lucide-react';
import './Flashcards.css';

export default function DeckList({ folderId, activeDeckId, onSelectDeck, onStudyDeck }) {
  const { t } = useTranslation();
  const decks = useDecks(folderId);

  if (!folderId) {
    return <div className="placeholder-box">{t('flashcards.emptyFolder')}</div>;
  }

  if (decks.length === 0) {
    return <div className="placeholder-box">{t('flashcards.emptyFolder')}</div>;
  }

  const toggleStar = async (e, deck) => {
    e.stopPropagation();
    await updateDeck(deck.id, { starred: !deck.starred });
  };

  return (
    <div className="deck-list">
      {decks.map((deck) => (
        <div
          key={deck.id}
          className={`deck-card ${activeDeckId === deck.id ? 'deck-card--active' : ''}`}
          onClick={() => onSelectDeck(deck.id)}
        >
          <div className="deck-card-info">
            <div className="deck-card-name">{deck.name}</div>
            <div className="deck-card-meta">{deck.displayMode?.replace('_', ' ')}</div>
          </div>
          <div className="deck-card-actions">
            <button
              className={`deck-star ${deck.starred ? 'deck-star--active' : ''}`}
              onClick={(e) => toggleStar(e, deck)}
              aria-label={deck.starred ? t('common.unstar') : t('common.star')}
            >
              <Star size={18} fill={deck.starred ? '#eab308' : 'none'} />
            </button>
            <button
              className="flashcards-toolbar-btn"
              onClick={(e) => { e.stopPropagation(); onStudyDeck?.(deck.id); }}
              aria-label={t('flashcards.study')}
            >
              <BookOpen size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
