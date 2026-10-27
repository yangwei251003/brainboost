
import React, { useState, useEffect, useRef } from 'react';
import { Timer, RotateCcw, Trophy, ArrowRight } from 'lucide-react';
import { saveRecord } from '../services/storageService';
import { DifficultyType } from '../types';

interface SchulteGameProps {
  onExit: () => void;
  isPaused?: boolean;
  difficulty: DifficultyType;
  onGameFinish?: (score: number, time?: number) => void;
}

const SchulteGame: React.FC<SchulteGameProps> = ({ onExit, difficulty, isPaused = false, onGameFinish }) => {
  const [level, setLevel] = useState(1);
  const [grid, setGrid] = useState<number[]>([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [shakingCell, setShakingCell] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const timerRef = useRef<number | null>(null);
  const startTimestampRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

  const getGridSize = (lvl: number) => {
    // Offset by difficulty
    const base = difficulty === 'beginner' ? 2 : difficulty === 'expert' ? 4 : 3;
    const finalSize = base + (lvl - 1);
    return Math.min(finalSize, 7);
  };

  const startLevel = (lvl: number) => {
    const size = getGridSize(lvl);
    const count = size * size;
    const numbers = Array.from({ length: count }, (_, i) => i + 1);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    setGrid(numbers);
    setNextNumber(1);
    setIsLevelCleared(false);
    setIsFinished(false);
    
    if (lvl === 1) {
        setElapsedTime(0);
        accumulatedTimeRef.current = 0;
        startTimestampRef.current = Date.now();
        restartTimer();
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const restartTimer = () => {
    stopTimer();
    startTimestampRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
        setElapsedTime(accumulatedTimeRef.current + (Date.now() - startTimestampRef.current) / 1000);
    }, 50);
  };

  useEffect(() => {
    startLevel(1);
    return () => stopTimer();
  }, []);

  useEffect(() => {
    if (isPaused) {
      stopTimer();
      accumulatedTimeRef.current = elapsedTime;
    } else if (!isFinished && !isLevelCleared && grid.length > 0) {
      restartTimer();
    }
  }, [isPaused]);

  const handleCellClick = (number: number, index: number) => {
    if (isLevelCleared || isFinished || isPaused) return;

    if (number === nextNumber) {
      const size = getGridSize(level);
      if (number === size * size) {
        if (level < 3) {
            setIsLevelCleared(true);
            stopTimer();
            accumulatedTimeRef.current = elapsedTime;
        } else {
            finishGame();
        }
      } else {
        setNextNumber(prev => prev + 1);
      }
    } else {
      setShakingCell(index);
      setTimeout(() => setShakingCell(null), 400);
    }
  };

  const finishGame = () => {
      setIsFinished(true);
      stopTimer();
      const { newBestTime } = saveRecord('schulte_grid', 0, elapsedTime);
      setIsNewRecord(newBestTime);
      
      // Calculate a relative score for dashboard based on time
      const calculatedScore = Math.max(100, Math.floor(2000 / (elapsedTime || 1)));
      if (onGameFinish) onGameFinish(calculatedScore, elapsedTime);
  };

  const nextLevel = () => {
      const nextLvl = level + 1;
      setLevel(nextLvl);
      startLevel(nextLvl);
      restartTimer();
  };

  const gridSize = getGridSize(level);

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto w-full p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
            <span className="text-xs text-scifi-muted uppercase">Level</span>
            <span className="text-xl font-display font-bold text-scifi-primary">{level}/3</span>
        </div>
        <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-scifi-primary" />
            <span className="font-mono text-2xl font-bold text-white min-w-[80px]">
                {elapsedTime.toFixed(2)}s
            </span>
        </div>
        <div className="flex flex-col items-end">
            <span className="text-xs text-scifi-muted uppercase">目标</span>
            <span className="text-2xl font-display font-bold text-scifi-success">
                {isLevelCleared || isFinished ? '√' : nextNumber}
            </span>
        </div>
      </div>

      <div className={`flex-1 flex flex-col justify-center mb-8 transition-opacity duration-300 ${isPaused ? 'opacity-20 pointer-events-none grayscale' : 'opacity-100'}`}>
        {!isFinished && !isLevelCleared ? (
          <div 
            className="grid gap-2 md:gap-3 aspect-square"
            style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
          >
            {grid.map((num, idx) => {
              const isFound = num < nextNumber;
              const isWrong = shakingCell === idx;
              
              // Hard difficulty has fading effect
              const shouldFade = (level >= 3 || difficulty === 'expert') && !isFound;

              let baseClass = "relative w-full h-full flex items-center justify-center rounded-xl text-lg md:text-2xl font-bold font-display transition-all duration-300 select-none cursor-pointer border shadow-lg ";
              
              if (isFound) {
                 baseClass += "bg-scifi-success/10 border-scifi-success/30 text-scifi-success/30 ";
              } else if (isWrong) {
                 baseClass += "bg-scifi-accent/20 border-scifi-accent text-scifi-accent animate-shake z-10 ";
              } else {
                 baseClass += "bg-scifi-card border-white/10 text-white hover:border-scifi-primary/50 ";
              }

              return (
                <div 
                  key={`${level}-${idx}`} 
                  onClick={() => handleCellClick(num, idx)}
                  className={baseClass}
                  style={shouldFade ? { opacity: Math.max(0.1, 1 - (elapsedTime / (difficulty === 'expert' ? 45 : 60))) } : {}}
                >
                  {num}
                </div>
              );
            })}
          </div>
        ) : isLevelCleared ? (
            <div className="flex flex-col items-center justify-center animate-in zoom-in duration-300">
                <h2 className="text-3xl font-display font-bold text-scifi-primary mb-4">Level {level} 成功</h2>
                <p className="text-scifi-muted mb-8 text-center">本关完成。准备好挑战更大的方格了吗？</p>
                <button 
                    onClick={nextLevel}
                    className="group bg-scifi-primary hover:bg-cyan-400 text-black font-bold py-4 px-12 rounded-full flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                >
                    <span>进入下一阶段</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        ) : (
          <div className="flex flex-col items-center justify-center animate-in zoom-in duration-300">
            <div className="w-24 h-24 rounded-full bg-scifi-card border-2 border-scifi-success flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,148,0.3)]">
                <Trophy size={40} className="text-scifi-success" />
            </div>
            <h2 className="text-3xl font-display font-bold text-white mb-2">训练完成</h2>
            {isNewRecord && (
                <div className="mb-4 px-3 py-1 bg-yellow-500/20 border border-yellow-500 rounded text-yellow-500 font-bold text-sm animate-pulse">
                    新纪录: 最佳时间!
                </div>
            )}
            
            <div className="bg-scifi-card w-full max-sm rounded-xl p-6 mb-8 border border-white/5 text-center">
                <div className="text-sm text-scifi-muted uppercase tracking-wider mb-2">总执行时间</div>
                <div className="text-5xl font-mono font-bold text-scifi-primary">{elapsedTime.toFixed(2)}s</div>
            </div>

            <div className="flex gap-4 w-full max-w-sm">
                <button 
                    onClick={() => { setLevel(1); startLevel(1); }}
                    className="flex-1 py-3 px-4 rounded-xl bg-scifi-card border border-white/10 text-white font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                >
                    <RotateCcw size={18} />
                    <span>重试</span>
                </button>
                <button 
                    onClick={onExit}
                    className="flex-1 py-3 px-4 rounded-xl bg-scifi-primary text-black font-bold hover:bg-cyan-400 transition-all"
                >
                    返回主菜单
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchulteGame;
