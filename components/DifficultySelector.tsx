
import React from 'react';
import { DifficultyType } from '../types';
import { Shield, Zap, Flame, Check } from 'lucide-react';

interface DifficultySelectorProps {
  selected: DifficultyType;
  onSelect: (diff: DifficultyType) => void;
  onStart: () => void;
  gameTitle: string;
}

const DIFFICULTY_OPTIONS: { id: DifficultyType; label: string; desc: string; icon: any; color: string }[] = [
  { 
    id: 'beginner', 
    label: '初级 (Beginner)', 
    desc: '较简单的规则参数，适合先熟悉玩法。', 
    icon: Shield, 
    color: 'text-scifi-success' 
  },
  { 
    id: 'intermediate', 
    label: '中级 (Intermediate)', 
    desc: '标准作战参数。系统推荐的训练强度。', 
    icon: Zap, 
    color: 'text-scifi-primary' 
  },
  { 
    id: 'expert', 
    label: '专家 (Expert)', 
    desc: '较高难度参数，挑战更复杂的规则。', 
    icon: Flame, 
    color: 'text-scifi-accent' 
  },
];

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ selected, onSelect, onStart, gameTitle }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-in fade-in zoom-in duration-500">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-display font-bold text-white mb-2 uppercase tracking-tighter">参数校准</h2>
        <p className="text-scifi-muted font-mono text-xs uppercase tracking-widest">正在为 {gameTitle} 配置游戏参数</p>
      </div>

      <div className="w-full max-w-md space-y-4 mb-10">
        {DIFFICULTY_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`w-full group relative p-5 rounded-2xl border transition-all duration-300 text-left overflow-hidden ${
              selected === opt.id 
                ? `bg-scifi-card border-${opt.id === 'intermediate' ? 'scifi-primary' : opt.id === 'beginner' ? 'scifi-success' : 'scifi-accent'} shadow-[0_0_20px_rgba(var(--scifi-primary-rgb),0.1)]` 
                : 'bg-white/5 border-white/5 hover:border-white/20'
            }`}
          >
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-5 group-hover:opacity-10 transition-opacity rounded-full bg-current ${opt.color}`}></div>
            
            <div className="flex items-start gap-4 relative z-10">
              <div className={`p-3 rounded-xl bg-white/5 ${selected === opt.id ? opt.color : 'text-scifi-muted'}`}>
                <opt.icon size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-lg ${selected === opt.id ? 'text-white' : 'text-scifi-muted'}`}>{opt.label}</h3>
                  {selected === opt.id && <Check size={20} className={opt.color} />}
                </div>
                <p className="text-sm text-scifi-muted leading-tight mt-1">{opt.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onStart}
        className="w-full max-w-md bg-white hover:bg-scifi-primary text-black font-black py-4 px-8 rounded-full transition-all active:scale-95 flex items-center justify-center gap-3 group"
      >
        <span className="uppercase tracking-widest">初始化链路 (INITIALIZE)</span>
        <Zap size={20} className="group-hover:animate-bounce" />
      </button>

      <div className="mt-6 flex items-center gap-2 text-[10px] font-mono text-scifi-muted uppercase tracking-widest">
        <span className="w-2 h-2 rounded-full bg-scifi-primary animate-pulse"></span>
        系统状态: 待命
      </div>
    </div>
  );
};

export default DifficultySelector;
