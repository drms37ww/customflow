import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLabels } from '../../hooks/useLabels';
import { useAuthStore } from '../../stores/authStore';
import { createLabel, updateLabel, deleteLabel, reorderLabels } from '../../services/labelService';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import './Labels.css';

const PRESET_COLORS = [
  '#185fa5', '#2563eb', '#7c3aed', '#db2777',
  '#dc2626', '#ea580c', '#ca8a04', '#16a34a',
  '#0d9488', '#6b7280',
];

export default function LabelManager({ open, onClose }) {
  const { t } = useTranslation();
  const labels = useLabels();
  const userId = useAuthStore((s) => s.user?.id) || 'local';
  const [editingId, setEditingId] = useState(null);

  if (!open) return null;

  const handleAdd = async () => {
    const label = await createLabel(userId, {
      name: t('common.labels'),
      color: PRESET_COLORS[labels.length % PRESET_COLORS.length],
    });
    setEditingId(label.id);
  };

  const handleRename = async (id, name) => {
    await updateLabel(id, { name });
    setEditingId(null);
  };

  const handleColorChange = async (id, color) => {
    await updateLabel(id, { color });
  };

  const handleDelete = async (id) => {
    await deleteLabel(id);
  };

  return (
    <div className="label-manager-overlay" onClick={onClose}>
      <div className="label-manager" onClick={(e) => e.stopPropagation()}>
        <div className="label-manager-header">
          <h2>{t('common.labels')}</h2>
          <button onClick={onClose} aria-label={t('common.close')}>
            <X size={20} />
          </button>
        </div>
        <div className="label-manager-body">
          <div className="label-manager-list">
            {labels.map((label) => (
              <div key={label.id} className="label-manager-item">
                <GripVertical size={16} color="var(--color-text-tertiary)" />
                <input
                  type="color"
                  className="label-manager-item-color"
                  value={label.color}
                  onChange={(e) => handleColorChange(label.id, e.target.value)}
                  title="Color"
                />
                <input
                  className="label-manager-item-name"
                  value={editingId === label.id ? undefined : label.name}
                  defaultValue={label.name}
                  onFocus={() => setEditingId(label.id)}
                  onBlur={(e) => handleRename(label.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRename(label.id, e.target.value);
                      e.target.blur();
                    }
                  }}
                />
                <button
                  className="label-manager-item-delete"
                  onClick={() => handleDelete(label.id)}
                  aria-label={t('common.delete')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button className="label-manager-add" onClick={handleAdd}>
            <Plus size={16} />
            {t('common.add')} {t('common.labels')}
          </button>
        </div>
      </div>
    </div>
  );
}
