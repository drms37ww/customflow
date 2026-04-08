import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSync } from './hooks/useSync';
import AppShell from './components/layout/AppShell';
import AuthGuard from './components/auth/AuthGuard';
import AuthPage from './pages/AuthPage';
import FlashcardsPage from './pages/FlashcardsPage';
import StudyPage from './pages/StudyPage';
import TodosPage from './pages/TodosPage';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';

function SyncProvider({ children }) {
  useSync();
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <SyncProvider>
        <Routes>
          {/* Auth routes (no shell, no guard) */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/verify" element={<AuthPage />} />

          {/* Protected app routes */}
          <Route element={<AuthGuard />}>
            <Route element={<AppShell />}>
              <Route path="/flashcards" element={<FlashcardsPage />} />
              <Route path="/flashcards/folder/:folderId" element={<FlashcardsPage />} />
              <Route path="/flashcards/deck/:deckId" element={<FlashcardsPage />} />
              <Route path="/flashcards/starred" element={<FlashcardsPage />} />
              <Route path="/study/:deckId" element={<StudyPage />} />
              <Route path="/study/folder/:folderId" element={<StudyPage />} />
              <Route path="/todos" element={<TodosPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/calendar/:view" element={<CalendarPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/:section" element={<SettingsPage />} />
              <Route path="/" element={<Navigate to="/todos" replace />} />
              <Route path="*" element={<Navigate to="/todos" replace />} />
            </Route>
          </Route>
        </Routes>
      </SyncProvider>
    </BrowserRouter>
  );
}
