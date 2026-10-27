import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Play, RotateCcw, Trophy, Delete, ArrowRight } from 'lucide-react';
import { saveRecord } from '../services/storageService';
// Import DifficultyType to fix type error
import { DifficultyType } from '../types';

interface AudioGameProps {
  onExit: () => void;
  isPaused?: boolean;
  // Added difficulty prop to fix type error
  difficulty: DifficultyType;
  // FIX: Added onGameFinish prop to track session performance
  onGameFinish?: (score: number, time?: number) => void;
}

type Phase = 'IDLE' | 'PLAYING' | 'INPUT' | 'RESULT';

const AudioGame: React.FC<AudioGameProps> = ({ onExit, difficulty, isPaused = false, onGameFinish }) => {
  const [phase, setPhase] = useState<Phase>('IDLE');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [sequence, setSequence] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  
  // Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stopNoise();
      window.speechSynthesis.cancel();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const startNoise = () => {
    if (!audioCtxRef.current) initAudio();
    if (!audioCtxRef.current) return;

    const bufferSize = audioCtxRef.current.sampleRate * 2; 
    const buffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const noise = audioCtxRef.current.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    const gain = audioCtxRef.current.createGain();
    gain.gain.value = 0.15;

    noise.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    
    noise.start();
    noiseNodeRef.current = noise;
    gainNodeRef.current = gain;
  };

  const stopNoise = () => {
    if (noiseNodeRef.current) {
      try {
        noiseNodeRef.current.stop();
        noiseNodeRef.current.disconnect();
      } catch (e) {}
      noiseNodeRef.current = null;
    }
  };

  const speakSequence = async (seq: string[]) => {
    setIsPlaying(true);
    await new Promise(r => setTimeout(r, 1000));

    for (let i = 0; i < seq.length; i++) {
      // Check if paused during sequence
      while (isPaused) {
        await new Promise(r => setTimeout(r, 100));
      }

      const num = seq[i];
      const utterance = new SpeechSynthesisUtterance(num);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'zh-CN';
      
      window.speechSynthesis.speak(utterance);

      await new Promise(r => setTimeout(r, 2000));
    }
    
    setIsPlaying(false);
    stopNoise();
    setPhase('INPUT');
  };

  const startLevel = () => {
    initAudio();
    setPhase('PLAYING');
    setUserInput('');
    setIsPlaying(true);
    setIsNewRecord(false);
    
    const length = 3 + Math.floor((level - 1) / 2);
    const newSeq = Array.from({ length }, () => Math.floor(Math.random() * 10).toString());
    setSequence(newSeq);

    startNoise();
    speakSequence(newSeq);
  };

  useEffect(() => {
    if (isPaused) {
      window.speechSynthesis.pause();
      if (gainNodeRef.current) gainNodeRef.current.gain.value = 0;
    } else {
      window.speechSynthesis.resume();
      if (gainNodeRef.current) gainNodeRef.current.gain.value = 0.15;
    }
  }, [isPaused]);

  const handleKeypad = (num: string) => {
    if (isPaused) return;
    if (userInput.length < sequence.length) {
      setUserInput(prev => prev + num);
    }
  };

  const handleDelete = () => {
    if (isPaused) return;
    setUserInput(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (isPaused) return;
    if (userInput === sequence.join('')) {
      setScore(s => s + (sequence.length * 10));
      if (level < 10) {
        setLevel(l => l + 1);
        setTimeout(startLevel, 500);
      } else {
        finishGame();
      }
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
      setPhase('RESULT');
      const { newHighScore } = saveRecord('sonic_cipher', score);
      setIsNewRecord(newHighScore);
      // FIX: Call onGameFinish when the game ends
      if (onGameFinish) onGameFinish(score);
  };

  const handleRetry = () => {
      setLevel(1);
      setScore(0);
      startLevel();
  };

  if (phase === 'IDLE') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-scifi-card border border-white/10 flex items-center justify-center mb-6">
          <Volume2 size={40} className="text-scifi-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-4">听觉校准</h2>
        <p className="text-scifi-muted mb-8 max-w-xs">
          在噪音干扰中聆听数字。准确输入你听到的序列。
        </p>
        <button 
          onClick={startLevel}
          className="bg-scifi-primary hover:bg-cyan-400 text-black font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-all hover:scale-105"
        >
          <Play size={18} fill="currentColor" />
          <span>开始序列</span>
        </button>
      </div>
    );
  }

  if (phase === 'RESULT') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in zoom-in duration-300">
        <div className="w-24 h-24 rounded-full bg-scifi-card border-2 border-scifi-accent flex items-center justify-center mb-6">
          <Trophy size={40} className="text-scifi-accent" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white mb-2">信号丢失</h2>
        <p className="text-scifi-muted mb-4">
            正确序列为 <span className="text-white font-mono tracking-widest">{sequence.join(' ')}</span>
        </p>

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

        <div className="flex gap-4 w-full max-w-sm">
            <button 
                onClick={handleRetry}
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
    <div className="flex flex-col h-full max-w-lg mx-auto w-full p-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <div className="flex flex-col">
               <span className="text-xs text-scifi-muted uppercase">等级</span>
               <span className="text-xl font-display font-bold text-white">{level}</span>
            </div>
        </div>
        <div className="flex flex-col items-end">
            <span className="text-xs text-scifi-muted uppercase tracking-wider">得分</span>
            <span className="text-2xl font-display font-bold text-scifi-success">{score}</span>
        </div>
      </div>

      <div className={`flex-1 flex flex-col justify-center transition-opacity duration-300 ${isPaused ? 'opacity-20 pointer-events-none grayscale' : 'opacity-100'}`}>
        {phase === 'PLAYING' ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 bg-scifi-primary/20 rounded-full animate-ping opacity-75"></div>
                <div className="absolute inset-0 bg-scifi-primary/10 rounded-full animate-pulse"></div>
                <Volume2 size={48} className="text-scifi-primary relative z-10" />
            </div>
            <p className="mt-8 text-scifi-primary font-mono text-sm tracking-widest uppercase animate-pulse">
                接收传输中...
            </p>
            <p className="mt-2 text-xs text-scifi-muted">请仔细聆听</p>
          </div>
        ) : (
          <div className="flex flex-col w-full max-w-xs mx-auto animate-in slide-in-from-bottom-4 duration-300">
             <div className="bg-scifi-card border border-white/10 rounded-xl p-6 mb-6 text-center min-h-[80px] flex items-center justify-center">
                <span className="font-mono text-4xl tracking-[0.5em] text-white">
                    {userInput || <span className="text-white/10">_ _ _</span>}
                </span>
             </div>

             <div className="grid grid-cols-3 gap-3 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleKeypad(num.toString())}
                        className="h-16 rounded-lg bg-scifi-card border border-white/5 hover:border-scifi-primary/50 text-2xl font-display font-bold transition-all active:scale-95"
                    >
                        {num}
                    </button>
                ))}
                <button
                     onClick={handleDelete}
                     className="h-16 rounded-lg bg-scifi-card border border-white/5 hover:bg-white/5 flex items-center justify-center text-scifi-accent active:scale-95"
                >
                    <Delete size={24} />
                </button>
                <button
                    onClick={() => handleKeypad('0')}
                    className="h-16 rounded-lg bg-scifi-card border border-white/5 hover:border-scifi-primary/50 text-2xl font-display font-bold transition-all active:scale-95"
                >
                    0
                </button>
                <button
                     onClick={handleSubmit}
                     disabled={userInput.length === 0}
                     className="h-16 rounded-lg bg-scifi-primary text-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:bg-cyan-400 transition-colors"
                >
                    <ArrowRight size={24} />
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioGame;