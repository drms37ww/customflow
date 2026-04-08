import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../../db/dexie';
import { updateCard } from '../../services/flashcardService';
import { rateCard } from '../../lib/fsrs';
import { useSettingsStore } from '../../stores/settingsStore';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft } from 'lucide-react';
import './Flashcards.css';

export default function StudySession({ deckId, folderId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionCards, setSessionCards] = useState([]);
  const fsrsParams = {
    requestRetention: useSettingsStore((s) => s.fsrsRequestRetention),
    maximumInterval: useSettingsStore((s) => s.fsrsMaximumInterval),
    enableFuzz: useSettingsStore((s) => s.fsrsEnableFuzz),
  };

  const now = new Date().toISOString();

  // Get due cards for deck or folder
  const dueCards = useLiveQuery(async () => {
    if (deckId) {
      return db.flashcardCards
        .where('deckId').equals(deckId)
        .filter((c) => !c.deletedAt && (!c.fsrsDue || c.fsrsDue <= now))
        .toArray();
    }
    return [];
  }, [deckId, now], []);

  useEffect(() => {
    if (dueCards.length > 0 && sessionCards.length === 0) {
      setSessionCards([...dueCards]);
    }
  }, [dueCards]);

  const card = sessionCards[current];

  const handleRate = useCallback(async (rating) => {
    if (!card) return;
    const updated = rateCard(card, rating, fsrsParams);
    await updateCard(card.id, updated);

    setFlipped(false);
    if (current + 1 < sessionCards.length) {
      setCurrent((c) => c + 1);
    } else {
      // Session complete - go back
      navigate(-1);
    }
  }, [card, current, sessionCards.length, fsrsParams, navigate]);

  if (sessionCards.length === 0) {
    return (
      <div className="study-session">
        <div className="placeholder-box">{t('flashcards.noCardsToStudy')}</div>
        <button className="flashcards-toolbar-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> {t('common.back')}
        </button>
      </div>
    );
  }

  return (
    <div className="study-session">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', width: '100%' }}>
        <button className="flashcards-toolbar-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </button>
        <div className="study-progress">
          {current + 1} / {sessionCards.length}
        </div>
      </div>

      <div className="study-card" onClick={() => setFlipped(!flipped)}>
        {!flipped ? (
          <>
            <div className="study-card-side-label">{t('flashcards.front')}</div>
            <div className="study-card-content">
              <ReactMarkdown>{card?.frontText || ''}</ReactMarkdown>
            </div>
            <div className="study-card-tap">{t('flashcards.back')} &rarr;</div>
          </>
        ) : (
          <>
            <div className="study-card-side-label">{t('flashcards.back')}</div>
            <div className="study-card-content">
              <ReactMarkdown>{card?.backText || ''}</ReactMarkdown>
            </div>
          </>
        )}
      </div>

      {flipped && (
        <div className="rating-buttons">
          {['again', 'hard', 'good', 'easy'].map((r) => (
            <button
              key={r}
              className={`rating-btn rating-btn--${r}`}
              onClick={() => handleRate(r)}
            >
              <span className="rating-btn-label">{t(`flashcards.rating.${r}`)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
