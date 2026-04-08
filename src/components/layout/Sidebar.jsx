import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layers, CheckSquare, Calendar, Settings } from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/flashcards', icon: Layers, labelKey: 'nav.flashcards' },
  { to: '/todos', icon: CheckSquare, labelKey: 'nav.todos' },
  { to: '/calendar', icon: Calendar, labelKey: 'nav.calendar' },
  { to: '/settings', icon: Settings, labelKey: 'nav.settings' },
];

export default function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-text">customFlow</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'sidebar-nav-item--active' : ''}`
            }
          >
            <Icon size={20} />
            <span>{t(labelKey)}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
