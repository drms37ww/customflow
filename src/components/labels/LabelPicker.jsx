import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLabels } from '../../hooks/useLabels';
import { Tag, Check } from 'lucide-react';
import LabelBadge from './LabelBadge';
import './Labels.css';

export default function LabelPicker({ selectedIds = [], onChange }) {
  const { t } = useTranslation();
  const labels = useLabels();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (labelId) => {
    const next = selectedIds.includes(labelId)
      ? selectedIds.filter((id) => id !== labelId)
      : [...selectedIds, labelId];
    onChange(next);
  };

  const selectedLabels = labels.filter((l) => selectedIds.includes(l.id));

  return (
    <div className="label-picker" ref={ref}>
      <button
        className="label-picker-trigger"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <Tag size={14} />
        {selectedLabels.length > 0 ? (
          selectedLabels.map((l) => (
            <LabelBadge key={l.id} label={l} />
          ))
        ) : (
          <span>{t('common.labels')}</span>
        )}
      </button>
      {open && (
        <div className="label-picker-dropdown">
          {labels.length === 0 ? (
            <div className="label-picker-empty">{t('common.noResults')}</div>
          ) : (
            labels.map((label) => {
              const selected = selectedIds.includes(label.id);
              return (
                <button
                  key={label.id}
                  className="label-picker-option"
                  onClick={() => toggle(label.id)}
                  type="button"
                >
                  <div className={`label-picker-check ${selected ? 'label-picker-check--selected' : ''}`}>
                    {selected && <Check size={10} />}
                  </div>
                  <span
                    className="label-badge-dot"
                    style={{ backgroundColor: label.color }}
                  />
                  {label.name}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
