import React from 'react';
import { X, Volume2, VolumeX, Palette, Check, Settings2 } from 'lucide-react';
import { ThemeType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  currentTheme: ThemeType;
  onThemeSelect: (theme: ThemeType) => void;
}

const THEMES: { id: ThemeType; name: string; colors: string[] }[] = [
  { id: 'cyberpunk', name: '赛博朋克', colors: ['#00F0FF', '#7000FF', '#FF003C'] },
  { id: 'darkmatter', name: '暗物质', colors: ['#F59E0B', '#44403C', '#F43F5E'] },
  { id: 'stardust', name: '星尘', colors: ['#818CF8', '#1E3A8A', '#F472B6'] },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, isMusicPlaying, onToggleMusic, currentTheme, onThemeSelect 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-sm bg-scifi-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in fade-in duration-300">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-scifi-primary" />
            <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider">系统设置</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-scifi-muted transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Music Control */}
          <section>
            <h3 className="text-xs font-mono text-scifi-muted uppercase tracking-widest mb-4">音频控制</h3>
            <button 
              onClick={onToggleMusic}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-scifi-primary/30 transition-all"
            >
              <div className="flex items-center gap-3">
                {isMusicPlaying ? <Volume2 className="text-scifi-primary" /> : <VolumeX className="text-scifi-muted" />}
                <span className="font-medium text-white">{isMusicPlaying ? '音乐已开启' : '音乐已暂停'}</span>
              </div>
              <div className={`w-10 h-5 rounded-full p-1 transition-colors ${isMusicPlaying ? 'bg-scifi-primary' : 'bg-white/10'}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${isMusicPlaying ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </button>
          </section>

          {/* Theme Control */}
          <section>
            <h3 className="text-xs font-mono text-scifi-muted uppercase tracking-widest mb-4">界面主题</h3>
            <div className="space-y-3">
              {THEMES.map((theme) => (
                <button 
                  key={theme.id}
                  onClick={() => onThemeSelect(theme.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                    currentTheme === theme.id 
                      ? 'bg-scifi-primary/10 border-scifi-primary shadow-[0_0_15px_rgba(var(--scifi-primary-rgb),0.1)]' 
                      : 'bg-white/5 border-transparent hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1">
                      {theme.colors.map((c, i) => (
                        <div key={i} className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: c }}></div>
                      ))}
                    </div>
                    <span className={`font-medium ${currentTheme === theme.id ? 'text-white' : 'text-scifi-muted'}`}>{theme.name}</span>
                  </div>
                  {currentTheme === theme.id && <Check size={18} className="text-scifi-primary" />}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="px-6 py-4 bg-white/5 text-center">
            <p className="text-[10px] text-scifi-muted font-mono uppercase tracking-widest">BrainBoost OS v2.4.0</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;