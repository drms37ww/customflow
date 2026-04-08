import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layers, CheckSquare, Calendar, Settings } from 'lucide-react';
import './BottomBar.css';

const navItems = [
  { to: '/flashcards', icon: Layers, labelKey: 'nav.flashcards' },
  { to: '/todos', icon: CheckSquare, labelKey: 'nav.todos' },
  { to: '/calendar', icon: Calendar, labelKey: 'nav.calendar' },
  { to: '/settings', icon: Settings, labelKey: 'nav.settings' },
];

export default function BottomBar() {
  const { t } = useTranslation();

  return (
    <nav className="bottom-bar">
      {navItems.map(({ to, icon: Icon, labelKey }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `bottom-bar-item ${isActive ? 'bottom-bar-item--active' : ''}`
          }
        >
          <Icon size={22} />
          <span>{t(labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
