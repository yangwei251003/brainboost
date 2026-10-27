import React, { useRef, useEffect, useState } from 'react';
import { Trophy, RotateCcw, AlertTriangle, Fingerprint } from 'lucide-react';
import { saveRecord } from '../services/storageService';
// Import DifficultyType to fix type error
import { DifficultyType } from '../types';

interface MirrorGameProps {
  onExit: () => void;
  isPaused?: boolean;
  // Added difficulty prop to fix type error
  difficulty: DifficultyType;
  // FIX: Added onGameFinish prop to track session performance
  onGameFinish?: (score: number, time?: number) => void;
}

const MirrorGame: React.FC<MirrorGameProps> = ({ onExit, difficulty, isPaused = false, onGameFinish }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'COMPLETE'>('IDLE');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [message, setMessage] = useState("双指同时按住核心");
  const [isSynced, setIsSynced] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const stateRef = useRef({
    progress: 0,
    speed: 0.002,
    targets: {
      left: { x: 0, y: 0, active: false },
      right: { x: 0, y: 0, active: false }
    },
    touches: {} as Record<number, { x: number, y: number }>
  });

  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [level, gameState]);

  useEffect(() => {
      if (gameState === 'COMPLETE') {
          const { newHighScore } = saveRecord('quantum_sync', score);
          setIsNewRecord(newHighScore);
          // FIX: Call onGameFinish when the game ends
          if (onGameFinish) onGameFinish(score);
      }
  }, [gameState]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isPaused) updateTouches(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isPaused) updateTouches(e);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isPaused) updateTouches(e);
  };

  const updateTouches = (e: React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const newTouches: Record<number, { x: number, y: number }> = {};
    
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      newTouches[t.identifier] = {
        x: t.clientX - rect.left,
        y: t.clientY - rect.top
      };
    }
    stateRef.current.touches = newTouches;
  };

  const loop = () => {
    if (isPaused) {
      requestRef.current = requestAnimationFrame(loop);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const centerX = w / 2;
    const centerY = h / 2;
    const state = stateRef.current;

    const radius = Math.min(w, h) * 0.25;
    const targetSize = 40;

    let targetL = { x: 0, y: 0 };
    let targetR = { x: 0, y: 0 };

    if (level === 1) {
      const yPos = (h * 0.2) + (state.progress * (h * 0.6));
      targetL = { x: centerX - w * 0.25, y: yPos };
      targetR = { x: centerX + w * 0.25, y: yPos };
    } else {
      const angleL = -Math.PI / 2 - (state.progress * Math.PI * 2);
      const angleR = -Math.PI / 2 + (state.progress * Math.PI * 2);

      targetL = { 
        x: (centerX - w * 0.25) + Math.cos(angleL) * radius * 0.6, 
        y: centerY + Math.sin(angleL) * radius * 0.6 
      };
      targetR = { 
        x: (centerX + w * 0.25) + Math.cos(angleR) * radius * 0.6, 
        y: centerY + Math.sin(angleR) * radius * 0.6 
      };
    }

    state.targets.left = { ...targetL, active: false };
    state.targets.right = { ...targetR, active: false };

    let activeLeft = false;
    let activeRight = false;

    Object.values(state.touches).forEach((t: any) => {
      const distL = Math.hypot(t.x - targetL.x, t.y - targetL.y);
      if (distL < targetSize * 1.5) activeLeft = true;

      const distR = Math.hypot(t.x - targetR.x, t.y - targetR.y);
      if (distR < targetSize * 1.5) activeRight = true;
    });

    state.targets.left.active = activeLeft;
    state.targets.right.active = activeRight;

    if (gameState !== 'COMPLETE') {
      if (activeLeft && activeRight) {
        state.progress += state.speed;
        setScore(s => s + 1);
        setIsSynced(true);
        setMessage("同步稳定... 保持...");
        
        if (state.progress >= 1) {
           if (level < 2) {
             setLevel(2);
             state.progress = 0;
             setMessage("Level 2: 镜像矩阵");
           } else {
             setGameState('COMPLETE');
           }
        }
      } else {
        setIsSynced(false);
        if (Object.keys(state.touches).length < 2) {
            setMessage("需要双指操作");
        } else {
            setMessage("对齐核心");
        }
      }
    }

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, h);
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#00F0FF30';
    ctx.beginPath();
    if (level === 1) {
        ctx.moveTo(centerX - w * 0.25, h * 0.2);
        ctx.lineTo(centerX - w * 0.25, h * 0.8);
    } else {
        ctx.arc(centerX - w * 0.25, centerY, radius * 0.6, 0, Math.PI * 2);
    }
    ctx.stroke();

    ctx.strokeStyle = '#F000FF30';
    ctx.beginPath();
    if (level === 1) {
        ctx.moveTo(centerX + w * 0.25, h * 0.2);
        ctx.lineTo(centerX + w * 0.25, h * 0.8);
    } else {
        ctx.arc(centerX + w * 0.25, centerY, radius * 0.6, 0, Math.PI * 2);
    }
    ctx.stroke();

    const drawTarget = (x: number, y: number, color: string, active: boolean) => {
        ctx.beginPath();
        ctx.arc(x, y, targetSize, 0, Math.PI * 2);
        ctx.fillStyle = active ? color : 'transparent';
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.fill();
        ctx.stroke();

        if (active) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFF';
        ctx.fill();
    };

    drawTarget(targetL.x, targetL.y, '#00F0FF', state.targets.left.active);
    drawTarget(targetR.x, targetR.y, '#F000FF', state.targets.right.active);

    Object.values(state.touches).forEach((t: any) => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF80';
        ctx.fill();
    });

    requestRef.current = requestAnimationFrame(loop);
  };

  const resetGame = () => {
    stateRef.current.progress = 0;
    setScore(0);
    setLevel(1);
    setGameState('PLAYING');
    setIsNewRecord(false);
  };

  if (gameState === 'COMPLETE') {
    return (
       <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in zoom-in duration-300">
        <div className="w-24 h-24 rounded-full bg-scifi-card border-2 border-scifi-primary flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,240,255,0.3)]">
            <Trophy size={40} className="text-scifi-primary" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white mb-2">神经同步完成</h2>
        <p className="text-scifi-muted mb-4">双侧脑半球校准完毕。</p>
        
        {isNewRecord && (
                <div className="mb-4 px-3 py-1 bg-yellow-500/20 border border-yellow-500 rounded text-yellow-500 font-bold text-sm animate-pulse">
                    新纪录: 最高同步分!
                </div>
        )}

        <div className="bg-scifi-card w-full max-sm rounded-xl p-6 mb-8 border border-white/5">
            <div className="text-sm text-scifi-muted uppercase tracking-wider mb-2">同步得分</div>
            <div className="text-5xl font-mono font-bold text-scifi-primary">{score}</div>
        </div>

        <div className="flex gap-4 w-full max-w-sm">
            <button 
                onClick={resetGame}
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

  return (
    <div className="relative w-full h-full flex flex-col">
       <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none z-10">
          <div className="flex flex-col">
             <span className="text-xs text-scifi-muted uppercase">等级</span>
             <span className="text-2xl font-display font-bold text-white">{level}</span>
          </div>
          <div className={`px-4 py-2 rounded-full border backdrop-blur-sm transition-colors duration-300 ${isSynced ? 'bg-scifi-success/20 border-scifi-success text-scifi-success' : 'bg-red-500/20 border-red-500 text-red-400'}`}>
             <span className="text-sm font-bold uppercase tracking-widest">{message}</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-xs text-scifi-muted uppercase">得分</span>
             <span className="text-2xl font-mono font-bold text-scifi-primary">{score}</span>
          </div>
       </div>

       {gameState === 'IDLE' && (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
             <div className="text-center max-w-sm">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-scifi-card border border-white/10 flex items-center justify-center animate-pulse">
                    <Fingerprint size={40} className="text-teal-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">需要多点触控</h2>
                <p className="text-scifi-muted mb-6">请使用<span className="text-white font-bold">两根手指</span>。分别按住青色和品红色的核心以开始同步。</p>
                <button 
                    onClick={() => setGameState('PLAYING')}
                    className="bg-teal-400 hover:bg-teal-300 text-black font-bold py-3 px-8 rounded-full"
                >
                    初始化系统
                </button>
             </div>
          </div>
       )}

       <div ref={containerRef} className={`flex-1 w-full h-full touch-none select-none overflow-hidden bg-scifi-bg transition-opacity duration-300 ${isPaused ? 'opacity-20 grayscale' : 'opacity-100'}`}>
          <canvas 
             ref={canvasRef} 
             className="w-full h-full block"
             onTouchStart={handleTouchStart}
             onTouchMove={handleTouchMove}
             onTouchEnd={handleTouchEnd}
          />
       </div>
    </div>
  );
};

export default MirrorGame;