import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Trophy, RotateCcw, Timer, AlertTriangle, 
  Apple, Pizza, Coffee, Car, Smartphone, Laptop, 
  Headphones, Hammer, Wrench, Pen, Ruler,
  Briefcase, Watch, Shirt, Glasses,
  Utensils, Monitor, Box, Tag, Tags, Zap
} from 'lucide-react';
import { saveRecord } from '../services/storageService';
// Import DifficultyType to fix type error
import { DifficultyType } from '../types';

interface CategorizationGameProps {
  onExit: () => void;
  isPaused?: boolean;
  // Added difficulty prop to fix type error
  difficulty: DifficultyType;
  // FIX: Added onGameFinish prop to track session performance
  onGameFinish?: (score: number, time?: number) => void;
}

type CategoryType = 'FOOD' | 'TECH' | 'TOOL';

interface GameItem {
  id: string;
  name: string;
  type: CategoryType;
  price: number;
  icon: React.ElementType;
}

const ITEMS: GameItem[] = [
  { id: '1', name: '合成苹果', type: 'FOOD', price: 2, icon: Apple },
  { id: '2', name: '等离子披萨', type: 'FOOD', price: 15, icon: Pizza },
  { id: '3', name: '营养液', type: 'FOOD', price: 5, icon: Coffee },
  { id: '4', name: '军用口粮', type: 'FOOD', price: 10, icon: Utensils },
  { id: '5', name: '悬浮手机', type: 'TECH', price: 900, icon: Smartphone },
  { id: '6', name: '量子核心', type: 'TECH', price: 2500, icon: Laptop },
  { id: '7', name: '神经连接器', type: 'TECH', price: 300, icon: Headphones },
  { id: '8', name: '数据板', type: 'TECH', price: 150, icon: Monitor },
  { id: '9', name: '万能扳手', type: 'TOOL', price: 45, icon: Wrench },
  { id: '10', name: '重力锤', type: 'TOOL', price: 30, icon: Hammer },
  { id: '11', name: '激光笔', type: 'TOOL', price: 12, icon: Pen },
  { id: '12', name: '纳米尺', type: 'TOOL', price: 8, icon: Ruler },
  { id: '13', name: '外骨骼', type: 'TOOL', price: 5000, icon: Shirt },
  { id: '14', name: '智能手表', type: 'TECH', price: 250, icon: Watch },
  { id: '15', name: 'AR眼镜', type: 'TECH', price: 400, icon: Glasses },
  { id: '16', name: '储物箱', type: 'TOOL', price: 3, icon: Box },
];

const ROUND_LENGTH = 10;
const TIME_LIMIT_MS = 2000;

const CategorizationGame: React.FC<CategorizationGameProps> = ({ onExit, difficulty, isPaused = false, onGameFinish }) => {
  const [phase, setPhase] = useState<'INTRO' | 'PLAYING' | 'TRANSITION' | 'RESULT'>('INTRO');
  const [round, setRound] = useState<1 | 2>(1);
  const [queue, setQueue] = useState<GameItem[]>([]);
  const [currentItem, setCurrentItem] = useState<GameItem | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_MS);
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase === 'PLAYING' && !isPaused) {
      lastTimeRef.current = Date.now();
      timerRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [phase, currentItem, isPaused]);

  const gameLoop = () => {
    if (isPaused) return;
    const now = Date.now();
    const delta = now - (lastTimeRef.current || now);
    lastTimeRef.current = now;

    setTimeLeft(prev => {
      const newTime = prev - delta;
      if (newTime <= 0) {
        handleTimeout();
        return TIME_LIMIT_MS;
      }
      return newTime;
    });

    timerRef.current = requestAnimationFrame(gameLoop);
  };

  const handleTimeout = () => {
    setLives(l => {
        const newLives = l - 1;
        if (newLives <= 0) {
            finishGame();
        }
        return newLives;
    });
    setFeedback('WRONG');
    setTimeout(() => {
        setFeedback(null);
        nextItem();
    }, 200);
  };

  const nextItem = () => {
    setTimeLeft(TIME_LIMIT_MS);
    if (queue.length > 0) {
      const next = queue[0];
      setQueue(q => q.slice(1));
      setCurrentItem(next);
    } else {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      if (round === 1) {
        setPhase('TRANSITION');
      } else {
        finishGame();
      }
    }
  };

  const startRound = (r: 1 | 2) => {
    const shuffled = [...ITEMS].sort(() => 0.5 - Math.random()).slice(0, ROUND_LENGTH);
    setQueue(shuffled.slice(1));
    setCurrentItem(shuffled[0]);
    setRound(r);
    setPhase('PLAYING');
    setTimeLeft(TIME_LIMIT_MS);
  };

  const finishGame = () => {
      setPhase('RESULT');
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      const { newHighScore } = saveRecord('category_nexus', score);
      setIsNewRecord(newHighScore);
      // FIX: Call onGameFinish when the game ends
      if (onGameFinish) onGameFinish(score);
  };

  const handleInput = (category: string) => {
    if (!currentItem || phase !== 'PLAYING' || isPaused) return;

    let correct = false;

    if (round === 1) {
      correct = currentItem.type === category;
    } else {
      if (category === 'LOW') correct = currentItem.price <= 50;
      if (category === 'HIGH') correct = currentItem.price > 50;
    }

    if (correct) {
      setScore(s => s + 100 + Math.floor(timeLeft / 10));
      setFeedback('CORRECT');
    } else {
      setLives(l => l - 1);
      setFeedback('WRONG');
      if (lives <= 1) {
         finishGame();
         return;
      }
    }

    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    
    setTimeout(() => {
        setFeedback(null);
        nextItem();
    }, 150);
  };

  if (phase === 'INTRO' || phase === 'TRANSITION') {
    const isTransition = phase === 'TRANSITION';
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 rounded-full bg-scifi-card border border-white/10 flex items-center justify-center mb-6 animate-pulse-slow">
           <Tags size={40} className="text-orange-400" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">
            {isTransition ? '协议更新' : '分类协议'}
        </h2>
        <div className="bg-scifi-card border border-white/10 p-6 rounded-xl max-w-sm w-full mb-8">
            <h3 className="text-orange-400 font-mono text-sm uppercase tracking-widest mb-4">
                {isTransition 
                    ? "第二阶段: 价值分析" : '第一阶段: 物质分析'}
            </h3>
            <p className="text-scifi-muted text-sm leading-relaxed">
                {isTransition 
                    ? "新规则: 按货币价值分类。阈值: $50 信用点。" 
                    : "将传入的数据流分类为: 食品 (FOOD), 科技 (TECH), 或 工具 (TOOL)。"}
            </p>
            {!isTransition && (
                <p className="text-xs text-scifi-muted mt-4 border-t border-white/5 pt-4">
                    <Timer size={12} className="inline mr-1"/> 反应时间限制: 2.0s
                </p>
            )}
        </div>
        
        <button 
          onClick={() => startRound(isTransition ? 2 : 1)}
          className="bg-orange-500 hover:bg-orange-400 text-black font-bold py-3 px-12 rounded-full transition-all hover:scale-105 active:scale-95"
        >
          {isTransition ? '启动第二阶段' : '开始模拟'}
        </button>
      </div>
    );
  }

  if (phase === 'RESULT') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in zoom-in duration-300">
        <div className="w-24 h-24 rounded-full bg-scifi-card border-2 border-orange-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,165,0,0.3)]">
            <Trophy size={40} className="text-orange-500" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white mb-2">分类完成</h2>
        <p className="text-scifi-muted mb-4">数据库优化完毕。</p>
        
        {isNewRecord && (
            <div className="mb-4 px-3 py-1 bg-yellow-500/20 border border-yellow-500 rounded text-yellow-500 font-bold text-sm animate-pulse">
                新纪录: 最高效率分!
            </div>
        )}

        <div className="bg-scifi-card w-full max-w-sm rounded-xl p-6 mb-8 border border-white/5">
            <div className="text-sm text-scifi-muted uppercase tracking-wider mb-2">效率得分</div>
            <div className="text-5xl font-mono font-bold text-orange-400">{score}</div>
            <div className="text-xs text-scifi-muted mt-2">完成轮次: {round}</div>
        </div>

        <div className="flex gap-4 w-full max-w-sm">
            <button 
                onClick={() => {
                    setScore(0);
                    setLives(3);
                    setPhase('INTRO');
                    setIsNewRecord(false);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-scifi-card border border-white/10 text-white font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
                <RotateCcw size={18} />
                <span>重试</span>
            </button>
            <button 
                onClick={onExit}
                className="flex-1 py-3 px-4 rounded-xl bg-scifi-primary text-black font-bold hover:bg-cyan-400 transition-all"
            >
                主菜单
            </button>
        </div>
      </div>
    );
  }

  const Icon = currentItem?.icon || Box;
  const progress = (timeLeft / TIME_LIMIT_MS) * 100;
  
  return (
    <div className="flex flex-col h-full max-w-lg mx-auto w-full p-4 relative overflow-hidden">
        {feedback === 'CORRECT' && (
            <div className="absolute inset-0 bg-green-500/10 pointer-events-none z-0 animate-pulse"></div>
        )}
        {feedback === 'WRONG' && (
            <div className="absolute inset-0 bg-red-500/10 pointer-events-none z-0 animate-pulse"></div>
        )}

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
            <div className="text-orange-400 font-mono text-sm border border-orange-500/30 px-2 py-1 rounded">
                阶段 {round}: {round === 1 ? '物质' : '价值'}
            </div>
             <div className="flex gap-1 ml-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i < lives ? 'bg-scifi-accent' : 'bg-white/10'}`}></div>
                ))}
            </div>
        </div>
        <div className="text-2xl font-display font-bold text-scifi-success">{score}</div>
      </div>

      <div className={`flex-1 flex flex-col items-center justify-center relative z-10 transition-opacity duration-300 ${isPaused ? 'opacity-20 pointer-events-none grayscale' : 'opacity-100'}`}>
         <div className="w-64 h-2 bg-gray-800 rounded-full mb-8 overflow-hidden">
             <div 
                className={`h-full transition-all duration-100 ease-linear ${progress < 30 ? 'bg-red-500' : 'bg-orange-400'}`}
                style={{ width: `${progress}%` }}
             ></div>
         </div>

         {currentItem && (
             <div className={`
                relative w-64 h-80 bg-scifi-card border-2 border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center
                shadow-[0_0_30px_rgba(0,0,0,0.5)]
                ${feedback === 'WRONG' ? 'animate-shake border-red-500' : ''}
                ${feedback === 'CORRECT' ? 'border-green-500 scale-105 transition-transform' : ''}
             `}>
                 <div className="absolute top-4 right-4 text-xs font-mono text-scifi-muted">ID: {currentItem.id.padStart(4, '0')}</div>
                 
                 <div className="flex-1 flex items-center justify-center">
                    <Icon size={80} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                 </div>
                 
                 <div className="w-full mt-4 text-center">
                    <h3 className="text-2xl font-bold text-white mb-1">{currentItem.name}</h3>
                    {round === 2 && (
                        <div className="text-xl font-mono text-green-400">${currentItem.price}</div>
                    )}
                 </div>
             </div>
         )}
      </div>

      <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 mt-auto relative z-10 transition-opacity duration-300 ${isPaused ? 'opacity-20 pointer-events-none grayscale' : 'opacity-100'}`}>
        {round === 1 ? (
            <>
                <button onClick={() => handleInput('FOOD')} className="h-20 bg-blue-500/10 border border-blue-500/50 hover:bg-blue-500/20 text-blue-400 font-bold rounded-xl active:scale-95 transition-all">
                    食品
                </button>
                <button onClick={() => handleInput('TECH')} className="h-20 bg-purple-500/10 border border-purple-500/50 hover:bg-purple-500/20 text-purple-400 font-bold rounded-xl active:scale-95 transition-all">
                    科技
                </button>
                <button onClick={() => handleInput('TOOL')} className="h-20 bg-gray-500/10 border border-gray-500/50 hover:bg-gray-500/20 text-gray-400 font-bold rounded-xl active:scale-95 transition-all col-span-2 md:col-span-1">
                    工具
                </button>
            </>
        ) : (
            <>
                <button onClick={() => handleInput('LOW')} className="h-20 bg-green-500/10 border border-green-500/50 hover:bg-green-500/20 text-green-400 font-bold rounded-xl active:scale-95 transition-all flex flex-col items-center justify-center">
                    <span>低价值</span>
                    <span className="text-xs opacity-70">{'< $50'}</span>
                </button>
                <button onClick={() => handleInput('HIGH')} className="h-20 bg-yellow-500/10 border border-yellow-500/50 hover:bg-yellow-500/20 text-yellow-400 font-bold rounded-xl active:scale-95 transition-all flex flex-col items-center justify-center">
                    <span>高价值</span>
                    <span className="text-xs opacity-70">{'> $50'}</span>
                </button>
            </>
        )}
      </div>
    </div>
  );
};

export default CategorizationGame;