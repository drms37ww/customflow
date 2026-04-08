import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCards } from '../../hooks/useFlashcards';
import { useAuthStore } from '../../stores/authStore';
import { createCard, updateCard, deleteCard } from '../../services/flashcardService';
import CardEditor from './CardEditor';
import { Plus, Trash2 } from 'lucide-react';
import './Flashcards.css';

export default function CardList({ deckId }) {
  const { t } = useTranslation();
  const cards = useCards(deckId);
  const userId = useAuthStore((s) => s.user?.id) || 'local';
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  if (!deckId) return null;

  const handleNew = () => {
    setEditingCard(null);
    setEditorOpen(true);
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setEditorOpen(true);
  };

  const handleSave = async ({ frontText, backText }) => {
    if (editingCard) {
      await updateCard(editingCard.id, { frontText, backText });
    } else {
      await createCard(userId, { deckId, frontText, backText });
    }
    setEditorOpen(false);
    setEditingCard(null);
  };

  const handleDelete = async (e, cardId) => {
    e.stopPropagation();
    await deleteCard(cardId);
  };

  return (
    <div>
      <div className="flashcards-toolbar">
        <button className="flashcards-toolbar-btn--accent flashcards-toolbar-btn" onClick={handleNew}>
          <Plus size={16} />
          {t('flashcards.newCard')}
        </button>
        <span style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
          {cards.length} {t('flashcards.cards').toLowerCase()}
        </span>
      </div>

      {cards.length === 0 ? (
        <div className="placeholder-box">{t('flashcards.emptyDeck')}</div>
      ) : (
        <div className="card-list">
          {cards.map((card) => (
            <div key={card.id} className="card-item" onClick={() => handleEdit(card)}>
              <div className="card-item-side">
                <div className="card-item-label">{t('flashcards.front')}</div>
                <div className="card-item-text">{card.frontText || '...'}</div>
              </div>
              <div className="card-item-divider" />
              <div className="card-item-side">
                <div className="card-item-label">{t('flashcards.back')}</div>
                <div className="card-item-text">{card.backText || '...'}</div>
              </div>
              <button
                style={{ color: 'var(--color-text-tertiary)', padding: 'var(--space-xs)' }}
                onClick={(e) => handleDelete(e, card.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {editorOpen && (
        <CardEditor
          card={editingCard}
          onSave={handleSave}
          onClose={() => { setEditorOpen(false); setEditingCard(null); }}
        />
      )}
    </div>
  );
}
