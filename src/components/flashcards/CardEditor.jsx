import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import './Flashcards.css';

export default function CardEditor({ card, onSave, onClose }) {
  const { t } = useTranslation();
  const [frontText, setFrontText] = useState(card?.frontText || '');
  const [backText, setBackText] = useState(card?.backText || '');

  const handleSave = () => {
    onSave({ frontText, backText });
  };

  return (
    <div className="card-editor-overlay" onClick={onClose}>
      <div className="card-editor" onClick={(e) => e.stopPropagation()}>
        <div className="card-editor-header">
          <h3>{card ? t('common.edit') : t('flashcards.newCard')}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="card-editor-body">
          <div className="card-editor-side">
            <label className="card-editor-side-label">{t('flashcards.front')}</label>
            <textarea
              className="card-editor-textarea"
              value={frontText}
              onChange={(e) => setFrontText(e.target.value)}
              placeholder={`${t('flashcards.front')} (Markdown)`}
              autoFocus
            />
          </div>
          <div className="card-editor-side">
            <label className="card-editor-side-label">{t('flashcards.back')}</label>
            <textarea
              className="card-editor-textarea"
              value={backText}
              onChange={(e) => setBackText(e.target.value)}
              placeholder={`${t('flashcards.back')} (Markdown)`}
            />
          </div>
        </div>
        <div className="card-editor-footer">
          <button className="card-editor-cancel" onClick={onClose}>{t('common.cancel')}</button>
          <button className="card-editor-save" onClick={handleSave}>{t('common.save')}</button>
        </div>
      </div>
    </div>
  );
}
