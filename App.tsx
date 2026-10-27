
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import HomeScreen from './screens/HomeScreen';
import GameContainer from './screens/GameContainer';
import PerformanceDashboard from './screens/PerformanceDashboard';
import SettingsModal from './components/SettingsModal';
import { ViewState, ThemeType } from './types';
import { GAMES } from './constants';
import { getTheme, saveTheme } from './services/storageService';

// Original synthesized ambient loop; no third-party media request.
const BG_MUSIC_URL = `${import.meta.env.BASE_URL}sounds/ambient.wav`;

const THEME_CONFIG: Record<ThemeType, any> = {
  cyberpunk: {
    '--scifi-bg': '#050505',
    '--scifi-card': '#0F111A',
    '--scifi-primary': '#00F0FF',
    '--scifi-secondary': '#7000FF',
    '--scifi-accent': '#FF003C',
    '--scifi-success': '#00FF94',
    '--scifi-text': '#E0E6ED',
    '--scifi-muted': '#64748B',
  },
  darkmatter: {
    '--scifi-bg': '#0C0A09',
    '--scifi-card': '#1C1917',
    '--scifi-primary': '#F59E0B',
    '--scifi-secondary': '#44403C',
    '--scifi-accent': '#F43F5E',
    '--scifi-success': '#10B981',
    '--scifi-text': '#F5F5F4',
    '--scifi-muted': '#A8A29E',
  },
  stardust: {
    '--scifi-bg': '#0F172A',
    '--scifi-card': '#1E293B',
    '--scifi-primary': '#818CF8',
    '--scifi-secondary': '#1E3A8A',
    '--scifi-accent': '#F472B6',
    '--scifi-success': '#34D399',
    '--scifi-text': '#F8FAFC',
    '--scifi-muted': '#94A3B8',
  }
};

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('HOME');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(getTheme());
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio instance
    const audio = new Audio(BG_MUSIC_URL);
    audio.preload = "none";
    audio.loop = true;
    audio.volume = 0.25; // Set a pleasant background volume
    audioRef.current = audio;

    // Apply initial theme from storage
    applyTheme(currentTheme);

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const applyTheme = (theme: ThemeType) => {
    const config = THEME_CONFIG[theme];
    const root = document.documentElement;
    Object.entries(config).forEach(([prop, value]) => {
      root.style.setProperty(prop, value as string);
    });
  };

  const handleThemeSelect = (theme: ThemeType) => {
    setCurrentTheme(theme);
    saveTheme(theme);
    applyTheme(theme);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsMusicPlaying(true))
        .catch(err => console.warn("Audio playback blocked by browser policy.", err));
    }
  };

  const handleGameSelect = (gameId: string) => {
    setActiveGameId(gameId);
    setViewState('GAME_PLAYING');
    
    if (!isMusicPlaying && audioRef.current) {
      audioRef.current.play()
        .then(() => setIsMusicPlaying(true))
        .catch(() => {});
    }
  };

  const handleBackToHome = () => {
    setActiveGameId(null);
    setViewState('HOME');
  };

  const handleToggleDashboard = () => {
    if (viewState === 'DASHBOARD') {
      setViewState('HOME');
    } else {
      setViewState('DASHBOARD');
    }
  };

  const activeGame = GAMES.find(g => g.id === activeGameId);

  return (
    <div className="flex flex-col h-full bg-scifi-bg text-scifi-text font-sans selection:bg-scifi-primary selection:text-black transition-colors duration-500">
      {/* Background Ambience Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-scifi-secondary/10 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-scifi-primary/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col h-full">
        <Header 
          onBack={viewState !== 'HOME' && viewState !== 'DASHBOARD' ? handleBackToHome : (viewState === 'DASHBOARD' ? handleBackToHome : undefined)} 
          onViewDashboard={handleToggleDashboard}
          title={viewState === 'GAME_PLAYING' ? activeGame?.title : (viewState === 'DASHBOARD' ? '性能报告' : undefined)}
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={toggleMusic}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isDashboardActive={viewState === 'DASHBOARD'}
        />
        
        <main className="flex-1 overflow-hidden relative">
          {viewState === 'HOME' && (
            <HomeScreen onGameSelect={handleGameSelect} />
          )}
          
          {viewState === 'GAME_PLAYING' && activeGameId && (
            <GameContainer 
              gameId={activeGameId} 
              onExit={handleBackToHome}
            />
          )}

          {viewState === 'DASHBOARD' && (
            <PerformanceDashboard />
          )}
        </main>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={toggleMusic}
        currentTheme={currentTheme}
        onThemeSelect={handleThemeSelect}
      />
    </div>
  );
};

export default App;
