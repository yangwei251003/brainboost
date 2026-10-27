import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Anchor, Atom, Award, Bell, Bird, Bomb, Bone, Book, Bot, Briefcase, 
  Bug, Camera, Car, Cat, Cherry, Clock, Cloud, Code, Coins, Compass, 
  Computer, Crown, Database, Diamond, Dna, Droplet, Egg, Eye, Feather, 
  Film, Flag, Flame, Flower, Gamepad, Gem, Ghost, Gift, Globe, Grape, 
  Hammer, Heart, Hourglass, Key, Leaf, Lightbulb, Lock, Magnet, Map, 
  Medal, Mic, Moon, Music, Package, Palette, Plane, Plug, Puzzle, 
  Rocket, Scale, Scissors, Shield, Skull, Snowflake, Star, Sun, Sword, 
  Target, Terminal, Trophy, Truck, Umbrella, User, Wallet, Wand, Watch, 
  Wifi, Zap, Loader2, RotateCcw
} from 'lucide-react';
import { saveRecord } from '../services/storageService';
// Import DifficultyType to fix type error
import { DifficultyType } from '../types';

const ICON_POOL = [
  Anchor, Atom, Award, Bell, Bird, Bomb, Bone, Book, Bot, Briefcase, 
  Bug, Camera, Car, Cat, Cherry, Clock, Cloud, Code, Coins, Compass, 
  Computer, Crown, Database, Diamond, Dna, Droplet, Egg, Eye, Feather, 
  Film, Flag, Flame, Flower, Gamepad, Gem, Ghost, Gift, Globe, Grape, 
  Hammer, Heart, Hourglass, Key, Leaf, Lightbulb, Lock, Magnet, Map, 
  Medal, Mic, Moon, Music, Package, Palette, Plane, Plug, Puzzle, 
  Rocket, Scale, Scissors, Shield, Skull, Snowflake, Star, Sun, Sword, 
  Target, Terminal, Trophy, Truck, Umbrella, User, Wallet, Wand, Watch, 
  Wifi, Zap
];

interface MemoryGameProps {
  mode: 'sequential' | 'simultaneous';
  onExit: () => void;
  isPaused?: boolean;
  // Added difficulty prop to fix type error
  difficulty: DifficultyType;
  // FIX: Added onGameFinish prop to track session performance
  onGameFinish?: (score: number, time?: number) => void;
}

type Phase = 'IDLE' | 'MEMORIZE' | 'RECALL' | 'RESULT';

const MemoryGame: React.FC<MemoryGameProps> = ({ mode, onExit, difficulty, isPaused = false, onGameFinish }) => {
  const [phase, setPhase] = useState<Phase>('IDLE');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState<any[]>([]);
  const [gridItems, setGridItems] = useState<any[]>([]);
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState(-1);
  const [showItem, setShowItem] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [foundCount, setFoundCount] = useState(0);
  const [lives, setLives] = useState(3);
  const [isLevelSuccess, setIsLevelSuccess] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const memorizeTimerRef = useRef<number | null>(null);
  const remainingTimeRef = useRef<number>(0);
  const timerStartRef = useRef<number>(0);
  const pausedPhaseRef = useRef<Phase>('IDLE');

  const clearTimers = () => {
    if (memorizeTimerRef.current) clearTimeout(memorizeTimerRef.current);
    memorizeTimerRef.current = null;
  };

  const startLevel = useCallback(() => {
    clearTimers();
    setPhase('MEMORIZE');
    setSelectedIndices([]);
    setFoundCount(0);
    setIsLevelSuccess(false);
    setCurrentDisplayIndex(-1);
    setShowItem(false);

    const targetCount = Math.min(2 + Math.floor(level / 2), 6);
    const distractorCount = Math.min(4 + level, 12);

    const shuffledPool = [...ICON_POOL].sort(() => 0.5 - Math.random());
    const newTargets = shuffledPool.slice(0, targetCount);
    const usedIcons = new Set(newTargets);
    
    const distractors = [];
    let i = targetCount;
    while (distractors.length < distractorCount && i < shuffledPool.length) {
      if (!usedIcons.has(shuffledPool[i])) {
        distractors.push(shuffledPool[i]);
      }
      i++;
    }

    setTargets(newTargets);
    const combined = [...newTargets, ...distractors].sort(() => 0.5 - Math.random());
    setGridItems(combined);

    if (mode === 'sequential') {
      runSequentialDisplay(newTargets.length);
    } else {
      runSimultaneousDisplay(newTargets.length);
    }
  }, [level, mode]);

  const runSimultaneousDisplay = (count: number, delay?: number) => {
    const duration = delay !== undefined ? delay : (2000 + (count * 400));
    timerStartRef.current = Date.now();
    remainingTimeRef.current = duration;
    
    memorizeTimerRef.current = window.setTimeout(() => {
      setPhase('RECALL');
    }, duration);
  };

  const runSequentialDisplay = (count: number, startIdx: number = 0) => {
    let index = startIdx;
    const showNext = () => {
      if (index >= count) {
        setPhase('RECALL');
        return;
      }
      setCurrentDisplayIndex(index);
      setShowItem(true);
      
      timerStartRef.current = Date.now();
      remainingTimeRef.current = 1000;

      memorizeTimerRef.current = window.setTimeout(() => {
        setShowItem(false);
        memorizeTimerRef.current = window.setTimeout(() => {
          index++;
          showNext();
        }, 300);
      }, 1000);
    };
    memorizeTimerRef.current = window.setTimeout(showNext, 500);
  };

  useEffect(() => {
    startLevel();
    return () => clearTimers();
  }, [startLevel]);

  useEffect(() => {
    if (isPaused) {
      if (memorizeTimerRef.current) {
        const elapsed = Date.now() - timerStartRef.current;
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
        clearTimers();
      }
    } else if (phase === 'MEMORIZE') {
      // Logic to resume timer if it was paused
      if (mode === 'simultaneous') {
        runSimultaneousDisplay(targets.length, remainingTimeRef.current);
      } else {
        runSequentialDisplay(targets.length, currentDisplayIndex);
      }
    }
  }, [isPaused]);

  const handleItemClick = (item: any, index: number) => {
    if (phase !== 'RECALL' || selectedIndices.includes(index) || isLevelSuccess || isPaused) return;

    setSelectedIndices(prev => [...prev, index]);
    const isTarget = targets.includes(item);

    if (isTarget) {
      const newFound = foundCount + 1;
      setFoundCount(newFound);
      setScore(s => s + (level * 50));

      if (newFound === targets.length) {
        setIsLevelSuccess(true);
        setTimeout(() => {
          setLevel(l => l + 1);
        }, 1000);
      }
    } else {
      setLives(l => {
        const nextLives = l - 1;
        if (nextLives <= 0) {
          endGame();
        }
        return nextLives;
      });
      setScore(s => Math.max(0, s - 25));
    }
  };

  const endGame = () => {
    setPhase('RESULT');
    const gameId = mode === 'sequential' ? 'echo_stream' : 'hologram_recall';
    const { newHighScore } = saveRecord(gameId, score);
    setIsNewRecord(newHighScore);
    // FIX: Call onGameFinish when the game ends
    if (onGameFinish) onGameFinish(score);
  };

  useEffect(() => {
    if (isLevelSuccess && phase !== 'RESULT' && !isPaused) {
      const t = setTimeout(startLevel, 1500);
      return () => clearTimeout(t);
    }
  }, [isLevelSuccess, startLevel, phase, isPaused]);

  if (phase === 'RESULT') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 rounded-full bg-scifi-card border-2 border-scifi-primary flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,240,255,0.3)]">
          <Trophy size={40} className="text-scifi-primary" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white mb-2">训练完成</h2>
        <p className="text-scifi-muted mb-4">数据已同步至核心。</p>
        
        {isNewRecord && (
          <div className="mb-4 px-3 py-1 bg-yellow-500/20 border border-yellow-500 rounded text-yellow-500 font-bold text-sm animate-pulse">
            新纪录: 最高得分!
          </div>
        )}

        <div className="bg-scifi-card w-full max-w-sm rounded-xl p-6 mb-8 border border-white/5">
          <div className="text-sm text-scifi-muted uppercase tracking-wider mb-2">最终得分</div>
          <div className="text-5xl font-mono font-bold text-scifi-primary">{score}</div>
          <div className="text-xs text-scifi-muted mt-2">达成等级: {level}</div>
        </div>

        <button 
          onClick={onExit}
          className="bg-scifi-primary hover:bg-cyan-400 text-black font-bold py-3 px-8 rounded-full transition-all hover:scale-105 active:scale-95"
        >
          返回主菜单
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full p-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-scifi-muted uppercase">等级</span>
            <span className="text-xl font-display font-bold text-white">{level}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-scifi-muted uppercase">核心生命</span>
            <div className="flex gap-1 mt-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < lives ? 'bg-scifi-accent shadow-[0_0_5px_#FF003C]' : 'bg-white/10'}`}></div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-scifi-muted uppercase tracking-wider">分数</span>
          <span className="text-2xl font-display font-bold text-scifi-success">
            {score}
          </span>
        </div>
      </div>

      <div className={`flex-1 flex flex-col justify-center relative transition-opacity duration-300 ${isPaused ? 'opacity-20 pointer-events-none grayscale' : 'opacity-100'}`}>
        {phase === 'MEMORIZE' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-scifi-primary font-mono text-sm uppercase tracking-widest mb-8 animate-pulse">
              {mode === 'sequential' ? '按顺序记住图案' : '记住出现的所有图案'}
            </p>

            {mode === 'sequential' ? (
              <div className="relative w-48 h-48 flex items-center justify-center glass-panel rounded-3xl border border-scifi-primary/20">
                {showItem && currentDisplayIndex >= 0 && (
                  <div className="animate-in zoom-in fade-in duration-300">
                    {React.createElement(targets[currentDisplayIndex], { 
                      size: 100, 
                      className: "text-white drop-shadow-[0_0_15px_rgba(0,240,255,0.8)]" 
                    })}
                  </div>
                )}
                 <div className="absolute -bottom-12 flex gap-2">
                  {targets.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        idx === currentDisplayIndex && showItem ? 'bg-scifi-primary scale-150' : 
                        idx < currentDisplayIndex ? 'bg-scifi-primary/40' : 'bg-white/5'
                      }`}
                    ></div>
                  ))}
                 </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6 animate-in fade-in zoom-in duration-500">
                {targets.map((Icon, idx) => (
                  <div key={idx} className="w-20 h-20 glass-panel border border-scifi-primary/20 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                    <Icon size={40} className="text-white" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(phase === 'RECALL' || isLevelSuccess) && (
          <div className="flex-1 flex flex-col items-center">
            <p className="text-scifi-muted font-mono text-sm uppercase tracking-widest mb-6">
              在矩阵中找出 {targets.length} 个目标
            </p>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full">
              {gridItems.map((Icon, idx) => {
                const isSelected = selectedIndices.includes(idx);
                const isTarget = targets.includes(Icon);
                
                let btnClass = "aspect-square rounded-2xl border flex items-center justify-center transition-all duration-200 active:scale-95 glass-panel ";
                
                if (isSelected) {
                  if (isTarget) {
                    btnClass += "border-scifi-success bg-scifi-success/20 text-scifi-success shadow-[0_0_15px_rgba(0,255,148,0.3)]";
                  } else {
                    btnClass += "border-scifi-accent bg-scifi-accent/20 text-scifi-accent opacity-50";
                  }
                } else {
                  btnClass += "border-white/10 text-white hover:border-scifi-primary/50 hover:bg-scifi-primary/5";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleItemClick(Icon, idx)}
                    disabled={isSelected || isLevelSuccess || isPaused}
                    className={btnClass}
                  >
                    <Icon size={32} />
                  </button>
                );
              })}
            </div>
            
            <div className="mt-8 flex gap-2">
               {Array.from({length: targets.length}).map((_, i) => (
                 <div key={i} className={`w-3 h-3 rounded-full border border-white/20 transition-all duration-500 ${i < foundCount ? 'bg-scifi-success border-transparent shadow-[0_0_10px_#00FF94]' : 'bg-transparent'}`}></div>
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryGame;