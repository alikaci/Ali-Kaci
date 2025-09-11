import React, { useState, useEffect, Suspense } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { Settings, Difficulty } from './types';
import Header from './components/Header';
import HomePage from './components/HomePage';
import TestPage from './components/TestPage';
import SettingsPage from './components/SettingsPage';
import AdhkarPage from './components/AdhkarPage';
import CompetitionPage from './components/CompetitionPage';
import ConnectVersesPage from './components/ConnectVersesPage';
import Spinner from './components/Spinner';


export type Page = 'home' | 'test' | 'settings' | 'adhkar' | 'virtues' | 'competition' | 'connect_verses' | 'progress' | 'quran_reader';

const VirtuesPage = React.lazy(() => import('./components/VirtuesPage'));
const ProgressPage = React.lazy(() => import('./components/ProgressPage'));
const QuranReaderPage = React.lazy(() => import('./components/QuranReaderPage'));


const App: React.FC = () => {
  const [page, setPage] = useState<Page>('home');
  const [settings, setSettings] = useLocalStorage<Settings>('quranAppSettings', {
    difficulty: Difficulty.Easy,
    isVoiceEnabled: true,
    theme: 'light',
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const renderPage = () => {
    switch (page) {
      case 'test':
        return <TestPage settings={settings} />;
      case 'settings':
        return <SettingsPage settings={settings} setSettings={setSettings} />;
      case 'progress':
        return <ProgressPage />;
      case 'adhkar':
        return <AdhkarPage />;
      case 'virtues':
        return <VirtuesPage />;
      case 'competition':
        return <CompetitionPage settings={settings} />;
      case 'connect_verses':
        return <ConnectVersesPage settings={settings} />;
      case 'quran_reader':
        return <QuranReaderPage />;
      case 'home':
      default:
        return <HomePage setPage={setPage} />;
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <Header page={page} setPage={setPage} />
      <main>
        <Suspense fallback={<Spinner />}>
          {renderPage()}
        </Suspense>
      </main>
    </div>
  );
};

export default App;