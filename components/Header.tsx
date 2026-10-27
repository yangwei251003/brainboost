
import React from 'react';
import { Cpu, Volume2, VolumeX, Settings, BarChart3 } from 'lucide-react';
import { APP_NAME } from '../constants';

interface HeaderProps {
  onBack?: () => void;
  onViewDashboard?: () => void;
  title?: string;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  onOpenSettings: () => void;
  isDashboardActive?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onBack, 
  onViewDashboard, 
  title, 
  isMusicPlaying, 
  onToggleMusic, 
  onOpenSettings,
  isDashboardActive 
}) => {
  return (
    <header className="sticky top-0 z-50 bg-scifi-bg/90 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center justify-between shadow-lg shadow-scifi-primary/5 transition-colors">
      <div className="flex items-center gap-3">
        {onBack ? (
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-white/5 text-scifi-muted hover:text-scifi-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        ) : (
          <div className="p-2 bg-scifi-primary/10 rounded-lg transition-colors">
            <Cpu className="w-6 h-6 text-scifi-primary animate-pulse-slow" />
          </div>
        )}
        
        <h1 className="font-display text-xl tracking-wider text-white">
          {title || APP_NAME}<span className="block text-xs font-sans tracking-normal text-scifi-muted mt-1">本地小游戏 · 问答为示例题库 · 不调用 AI</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        {!onBack && onViewDashboard && (
          <button 
            onClick={onViewDashboard}
            className={`p-2 rounded-lg transition-all ${
              isDashboardActive 
                ? 'text-scifi-primary bg-scifi-primary/10' 
                : 'text-scifi-muted hover:text-white hover:bg-white/5'
            }`}
            title="查看性能指标"
          >
            <BarChart3 size={20} />
          </button>
        )}

        <button 
          onClick={onToggleMusic}
          className={`p-2 rounded-lg transition-all duration-300 flex items-center justify-center ${
            isMusicPlaying 
              ? 'text-scifi-primary bg-scifi-primary/10' 
              : 'text-scifi-muted hover:text-white hover:bg-white/5'
          }`}
          title={isMusicPlaying ? "关闭音频" : "开启音频"}
        >
          {isMusicPlaying ? (
            <div className="relative">
              <Volume2 size={20} />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-scifi-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-scifi-primary"></span>
              </span>
            </div>
          ) : (
            <VolumeX size={20} />
          )}
        </button>

        <button 
          onClick={onOpenSettings}
          className="p-2 rounded-lg text-scifi-muted hover:text-white hover:bg-white/5 transition-all"
          title="系统设置"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
