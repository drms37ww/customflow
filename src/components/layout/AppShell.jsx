import { Outlet } from 'react-router-dom';
import { useResponsive } from '../../hooks/useResponsive';
import Sidebar from './Sidebar';
import BottomBar from './BottomBar';
import Header from './Header';
import './AppShell.css';

export default function AppShell() {
  const { isMobile } = useResponsive();

  return (
    <div className={`app-shell ${isMobile ? 'app-shell--mobile' : 'app-shell--desktop'}`}>
      {!isMobile && <Sidebar />}
      <div className="app-shell-main">
        <Header />
        <main className="app-shell-content">
          <Outlet />
        </main>
      </div>
      {isMobile && <BottomBar />}
    </div>
  );
}
