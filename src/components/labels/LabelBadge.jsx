import './Labels.css';

export default function LabelBadge({ label, onRemove }) {
  return (
    <span
      className="label-badge"
      style={{ backgroundColor: label.color + '18', color: label.color, borderColor: label.color + '30' }}
    >
      <span className="label-badge-dot" style={{ backgroundColor: label.color }} />
      {label.name}
      {onRemove && (
        <button
          className="label-badge-remove"
          onClick={(e) => { e.stopPropagation(); onRemove(label.id); }}
          aria-label={`Remove ${label.name}`}
        >
          &times;
        </button>
      )}
    </span>
  );
}
