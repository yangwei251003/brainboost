
import React, { useState, useEffect, useRef } from 'react';
import { Timer, Trophy, RotateCcw, Zap } from 'lucide-react';
import { saveRecord } from '../services/storageService';
import { DifficultyType } from '../types';

interface StroopGameProps {
  onExit: () => void;
  isPaused?: boolean;
  difficulty: DifficultyType;
  onGameFinish?: (score: number, time?: number) => void;
}

const ALL_COLORS = [
  { name: 'RED', value: '#ef4444', label: '红色' },
  { name: 'BLUE', value: '#3b82f6', label: '蓝色' },
  { name: 'GREEN', value: '#22c55e', label: '绿色' },
  { name: 'YELLOW', value: '#eab308', label: '黄色' },
  { name: 'PURPLE', value: '#a855f7', label: '紫色' },
  { name: 'PINK', value: '#ec4899', label: '粉色' },
];

const StroopGame: React.FC<StroopGameProps> = ({ onExit, difficulty, isPaused = false, onGameFinish }) => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const gameDuration = difficulty === 'beginner' ? 45 : difficulty === 'expert' ? 20 : 30;
  const [timeLeft, setTimeLeft] = useState(gameDuration);
  const [isFinished, setIsFinished] = useState(false);
  const [currentWord, setCurrentWord] = useState(ALL_COLORS[0]);
  const [currentColor, setCurrentColor] = useState(ALL_COLORS[1]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [combo, setCombo] = useState(0);

  const timerRef = useRef<number | null>(null);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const startTimer = () => {
    stopTimer();
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startGame = () => {
    setScore(0);
    setLevel(1);
    setCombo(0);
    setTimeLeft(gameDuration);
    setIsFinished(false);
    setIsNewRecord(false);
    nextRound(1);
    startTimer();
  };

  useEffect(() => {
    startGame();
    return () => stopTimer();
  }, []);

  useEffect(() => {
    if (isPaused) {
      stopTimer();
    } else if (!isFinished) {
      startTimer();
    }
  }, [isPaused]);

  useEffect(() => {
    if (isFinished) {
      const { newHighScore } = saveRecord('stroop_challenge', score);
      setIsNewRecord(newHighScore);
      stopTimer();
      if (onGameFinish) onGameFinish(score);
    }
  }, [isFinished]);

  const nextRound = (currentLevel: number) => {
    const initialPoolSize = difficulty === 'beginner' ? 3 : difficulty === 'expert' ? 5 : 4;
    const availableCount = Math.min(initialPoolSize + Math.floor(currentLevel / 2), ALL_COLORS.length);
    const pool = ALL_COLORS.slice(0, availableCount);

    const randomWordIndex = Math.floor(Math.random() * pool.length);
    let randomColorIndex = Math.floor(Math.random() * pool.length);
    
    if (Math.random() < 0.8 && randomColorIndex === randomWordIndex) {
        randomColorIndex = (randomColorIndex + 1) % pool.length;
    }

    setCurrentWord(pool[randomWordIndex]);
    setCurrentColor(pool[randomColorIndex]);
  };

  const handleInput = (selectedColorName: string) => {
    if (isFinished || isPaused) return;

    if (selectedColorName === currentColor.name) {
      const newScore = score + 1;
      const newCombo = combo + 1;
      setScore(newScore);
      setCombo(newCombo);
      setFeedback('correct');

      const newLevel = 1 + Math.floor(newScore / 8);
      if (newLevel > level) {
          setLevel(newLevel);
      }
    } else {
      setScore(s => Math.max(0, s - 1));
      setCombo(0);
      setFeedback('wrong');
    }

    setTimeout(() => setFeedback(null), 150);
    nextRound(level);
  };

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto w-full p-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
            <span className="text-xs text-scifi-muted uppercase tracking-tighter">Sync Level</span>
            <div className="flex items-center gap-2">
                <span className="text-2xl font-display font-bold text-scifi-primary">{level}</span>
                {combo >= 5 && <Zap size={16} className="text-yellow-400 animate-pulse" />}
            </div>
        </div>
        <div className="flex items-center gap-2 bg-scifi-card px-4 py-2 rounded-full border border-white/10 shadow-lg">
            <Timer className={`w-5 h-5 ${timeLeft < 5 ? 'text-scifi-accent animate-ping' : 'text-scifi-primary'}`} />
            <span className={`font-mono text-2xl font-bold min-w-[40px] ${timeLeft < 5 ? 'text-scifi-accent' : 'text-white'}`}>
                {timeLeft}s
            </span>
        </div>
        <div className="flex flex-col items-end">
            <span className="text-xs text-scifi-muted uppercase">Score</span>
            <span className="text-2xl font-display font-bold text-scifi-success">{score}</span>
        </div>
      </div>

      <div className={`flex-1 flex flex-col items-center justify-center mb-8 relative transition-opacity duration-300 ${isPaused ? 'opacity-20 pointer-events-none grayscale' : 'opacity-100'}`}>
        {!isFinished ? (
          <>
            <div className="flex-1 flex flex-col items-center justify-center w-full relative">
                <div className={`text-7xl md:text-9xl font-black tracking-widest transition-transform duration-150 ${feedback === 'correct' ? 'scale-110' : ''}`}
                    style={{ 
                        color: currentColor.value,
                        textShadow: `0 0 ${20 + level * 5}px ${currentColor.value}60` 
                    }}
                >
                    {currentWord.label}
                </div>
                
                <div className="mt-12 text-scifi-muted text-xs uppercase tracking-[0.4em] animate-pulse">
                    选择字体显示的颜色
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mt-auto">
                {ALL_COLORS.slice(0, Math.min(difficulty === 'beginner' ? 3 + Math.floor(level / 3) : 4 + Math.floor(level / 2), ALL_COLORS.length)).map((col) => (
                    <button
                        key={col.name}
                        onClick={() => handleInput(col.name)}
                        className="h-16 md:h-20 rounded-2xl bg-scifi-card border border-white/5 hover:border-scifi-primary/40 active:scale-95 transition-all overflow-hidden relative group"
                    >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: col.value }}></div>
                        <span className="font-display font-bold text-lg relative z-10" style={{ color: col.value }}>
                            {col.label}
                        </span>
                    </button>
                ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center animate-in zoom-in duration-300 w-full">
            <div className="w-24 h-24 rounded-full bg-scifi-card border-2 border-scifi-primary flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                <Trophy size={40} className="text-scifi-primary" />
            </div>
            <h2 className="text-3xl font-display font-bold text-white mb-2">训练结束</h2>
            {isNewRecord && (
                <div className="mb-4 px-3 py-1 bg-yellow-500/20 border border-yellow-500 rounded text-yellow-500 font-bold text-sm animate-pulse">
                    新纪录: 最高得分!
                </div>
            )}
            
            <div className="bg-scifi-card w-full max-w-sm rounded-xl p-6 mb-8 border border-white/5 text-center">
                <div className="text-sm text-scifi-muted uppercase tracking-wider mb-2">最终吞吐量</div>
                <div className="text-6xl font-mono font-bold text-scifi-primary">{score}</div>
                <div className="text-xs text-scifi-muted mt-2">达成等级: {level} | 难度: {difficulty}</div>
            </div>

            <div className="flex gap-4 w-full max-w-sm">
                <button onClick={startGame} className="flex-1 py-3 px-4 rounded-xl bg-scifi-card border border-white/10 text-white font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                    <RotateCcw size={18} />
                    <span>重试</span>
                </button>
                <button onClick={onExit} className="flex-1 py-3 px-4 rounded-xl bg-scifi-primary text-black font-bold hover:bg-cyan-400 transition-all">
                    主菜单
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StroopGame;
