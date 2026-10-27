import React from 'react';
import { Play, RotateCcw, LogOut, Pause } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

const PauseModal: React.FC<PauseModalProps> = ({ isOpen, onResume, onRestart, onQuit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      
      <div className="relative w-full max-w-sm bg-scifi-card border border-scifi-primary/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.2)] animate-in zoom-in fade-in duration-300">
        <div className="px-8 py-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-scifi-primary/10 border border-scifi-primary/30 flex items-center justify-center mb-6">
            <Pause size={40} className="text-scifi-primary" />
          </div>
          
          <h2 className="font-display text-2xl font-bold text-white mb-2 tracking-widest uppercase">神经传输已挂起</h2>
          <p className="text-scifi-muted text-sm mb-10 px-4">系统校准暂停中。请确认您的下一步指令。</p>

          <div className="w-full space-y-4">
            <button 
              onClick={onResume}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-scifi-primary text-black font-bold text-lg hover:bg-cyan-400 transition-all active:scale-95 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
            >
              <Play size={20} fill="currentColor" />
              <span>恢复传输 (Resume)</span>
            </button>
            
            <button 
              onClick={onRestart}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all active:scale-95"
            >
              <RotateCcw size={20} />
              <span>重启模块 (Restart)</span>
            </button>
            
            <button 
              onClick={onQuit}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl border border-scifi-accent/30 text-scifi-accent font-bold hover:bg-scifi-accent/10 transition-all active:scale-95"
            >
              <LogOut size={20} />
              <span>终止会话 (Quit)</span>
            </button>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-1 bg-scifi-primary/20 overflow-hidden">
          <div className="h-full bg-scifi-primary animate-[shimmer_2s_infinite] w-1/3"></div>
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default PauseModal;