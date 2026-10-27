import React from 'react';
import { LucideIcon, Play, Trophy, Timer } from 'lucide-react';
import { GameRecord } from '../services/storageService';

interface GameCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  onClick: (id: string) => void;
  record?: GameRecord;
  scoringType: 'score' | 'time';
}

const GameCard: React.FC<GameCardProps> = ({ id, title, description, icon: Icon, color, onClick, record, scoringType }) => {
  return (
    <button
      onClick={() => onClick(id)}
      className="group relative w-full text-left bg-scifi-card border border-white/5 rounded-2xl p-5 transition-all duration-300 hover:border-scifi-primary/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] overflow-hidden"
    >
      {/* Background Grid Decoration */}
      <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{backgroundImage: `url(${import.meta.env.BASE_URL}noise.svg)`}}></div>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon size={80} />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${color}`}>
            <Icon size={24} />
          </div>
          <h3 className="font-display text-lg font-bold text-white mb-1 group-hover:text-scifi-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-scifi-muted leading-tight line-clamp-2 mb-4">
            {description}
          </p>
          
          {/* Record Display */}
          {(record && (record.highScore > 0 || (record.bestTime ?? 0) > 0)) && (
            <div className="flex flex-wrap gap-2 text-xs font-mono text-scifi-muted/80">
                {scoringType === 'score' && record.highScore > 0 && (
                   <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                       <Trophy size={10} className="text-yellow-500" />
                       <span>最高分: {record.highScore}</span>
                   </div>
                )}
                {scoringType === 'time' && (record.bestTime ?? 0) > 0 && (
                   <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                       <Timer size={10} className="text-scifi-primary" />
                       <span>最佳: {record.bestTime.toFixed(2)}s</span>
                   </div>
                )}
            </div>
          )}
        </div>
        
        <div className="mt-4 flex items-center text-xs font-mono text-scifi-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
          <span>启动程序</span>
          <Play size={12} className="ml-1 fill-current" />
        </div>
      </div>
      
      {/* Decorative Corner */}
      <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-2xl"></div>
    </button>
  );
};

export default GameCard;
