
import React, { useState, useEffect, useCallback } from 'react';
import { Brain, CheckCircle2, XCircle, AlertTriangle, Loader2, ArrowRight, Pause } from 'lucide-react';
import { GAMES } from '../constants';
import { generateGameQuestions } from '../services/questionService';
import { QuestionData, DifficultyType } from '../types';
import SchulteGame from '../components/SchulteGame';
import StroopGame from '../components/StroopGame';
import MemoryGame from '../components/MemoryGame';
import AudioGame from '../components/AudioGame';
import MirrorGame from '../components/MirrorGame';
import CategorizationGame from '../components/CategorizationGame';
import TutorialOverlay from '../components/TutorialOverlay';
import DifficultySelector from '../components/DifficultySelector';
import PauseModal from '../components/PauseModal';
import { 
  saveRecord, 
  saveSession,
  getRecord, 
  isTutorialCompleted, 
  setTutorialCompleted, 
  getPreferredDifficulty, 
  savePreferredDifficulty 
} from '../services/storageService';

interface GameContainerProps {
  gameId: string;
  onExit: () => void;
}

const TUTORIAL_STEPS: Record<string, string[]> = {
  'schulte_grid': [
    '欢迎进入专注力校准模块。',
    '屏幕上将出现一组乱序数字，你需要按 1 到 25 的顺序依次点击。',
    '高级关卡中，未点击的数字会逐渐变淡，请保持极致专注。'
  ],
  'stroop_challenge': [
    '本关需要忽略文字含义，识别实际显示颜色。',
    '你会看到颜色文字，但你的目标是：选择字体的“实际颜色”，而不是文字所表达的含义。',
    '连续正确将提升同步率，开启更高难度的色域。'
  ],
  'echo_stream': [
    '正在启动短期记忆序列训练。',
    '屏幕会依次展示一系列物品图标，请准确记住它们的出现顺序。',
    '随后在混淆矩阵中按正确的顺序将其找回。'
  ],
  'sonic_cipher': [
    '这是听觉注意力校准。',
    '系统会在背景噪音中播报一组数字。',
    '仔细聆听，并在传输结束后使用数字键盘完整复写。'
  ],
  'quantum_sync': [
    '检测到双侧脑协调训练需求。',
    '你需要使用双指，同时按住并引导两个能量核心。',
    '确保它们始终保持在同步轨道内，任何一侧脱离都会导致同步中断。'
  ],
  'category_nexus': [
    '数据流分类协议已启动。',
    '物品将快速从传送带流过。你需要根据当前规则（种类或价值）快速分类。',
    '错误分类会导致系统负载增加，请在时间耗尽前做出判断。'
  ],
  'hologram_recall': [
    '瞬间视觉记忆测试。',
    '屏幕会同时展示多个物品，你有几秒钟的时间将其全部记下。',
    '随后部分物品会消失，你需要在矩阵中点选出刚才出现的所有目标。'
  ],
  'knowledge_king': [
    '正在载入本地示例题库，不调用 AI。',
    '回答涉及科学、历史与技术的深度问题。',
    '选择不同难度可体验不同的固定示例题组。'
  ]
};

type ContainerPhase = 'LOADING' | 'TUTORIAL' | 'DIFFICULTY_PICKER' | 'PLAYING' | 'FINISHED';

const GameContainer: React.FC<GameContainerProps> = ({ gameId, onExit }) => {
  const gameDef = GAMES.find(g => g.id === gameId);
  const [phase, setPhase] = useState<ContainerPhase>('LOADING');
  const [difficulty, setDifficulty] = useState<DifficultyType>(getPreferredDifficulty(gameId));
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    if (gameId) {
      const completed = isTutorialCompleted(gameId);
      if (!completed) {
        setPhase('TUTORIAL');
      } else {
        setPhase('DIFFICULTY_PICKER');
      }
    }
  }, [gameId]);

  const handleTutorialComplete = () => {
    setTutorialCompleted(gameId);
    setPhase('DIFFICULTY_PICKER');
  };

  const loadGameData = useCallback(async (diff: DifficultyType) => {
    if (!gameDef) return;
    
    const specialTypes = ['schulte', 'stroop', 'memory', 'audio', 'mirror', 'categorization'];
    if (specialTypes.includes(gameDef.type || '')) {
      setPhase('PLAYING');
      return;
    }

    setPhase('LOADING');
    try {
      const generatedQuestions = await generateGameQuestions(gameDef.promptTopic, diff, 5);
      setQuestions(generatedQuestions);
      setPhase('PLAYING');
    } catch (e) {
      console.error(e);
      setPhase('PLAYING'); // Fallback questions will be used
    }
  }, [gameDef]);

  const startTraining = () => {
    savePreferredDifficulty(gameId, difficulty);
    loadGameData(difficulty);
  };

  useEffect(() => {
      if (phase === 'FINISHED' && gameDef) {
          const { newHighScore } = saveRecord(gameDef.id, score);
          setIsNewRecord(newHighScore);
          
          // Save full session history
          saveSession({
            gameId: gameDef.id,
            score,
            timestamp: Date.now(),
            difficulty
          });
      }
  }, [phase, gameDef, score, difficulty]);

  const handleRestart = () => {
    setRestartKey(prev => prev + 1);
    setIsPaused(false);
    setScore(0);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setPhase('DIFFICULTY_PICKER');
  };

  // Special game completion callback to track performance
  const onSpecialGameFinish = useCallback((finalScore: number, finalTime?: number) => {
    if (!gameDef) return;
    saveSession({
      gameId: gameDef.id,
      score: finalScore,
      time: finalTime,
      timestamp: Date.now(),
      difficulty
    });
  }, [gameDef, difficulty]);

  if (!gameDef) return <div>Invalid Game</div>;

  if (phase === 'LOADING') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-scifi-primary">
        <Loader2 size={48} className="animate-spin mb-4" />
        <p className="font-mono text-sm tracking-widest uppercase animate-pulse">正在初始化 {gameDef.title} 协议...</p>
        <p className="text-xs text-scifi-muted mt-2">载入本地示例题库</p>
      </div>
    );
  }

  if (phase === 'TUTORIAL') {
    return (
      <TutorialOverlay 
        gameTitle={gameDef.title} 
        steps={TUTORIAL_STEPS[gameId] || ['系统初始化中...', '准备开始小游戏。']} 
        onComplete={handleTutorialComplete} 
      />
    );
  }

  if (phase === 'DIFFICULTY_PICKER') {
    return (
      <DifficultySelector 
        selected={difficulty}
        onSelect={setDifficulty}
        onStart={startTraining}
        gameTitle={gameDef.title}
      />
    );
  }

  const PauseButton = () => (
    <button 
      onClick={() => setIsPaused(true)}
      className="p-2 rounded-lg bg-scifi-card border border-white/10 text-scifi-muted hover:text-white transition-colors"
    >
      <Pause size={18} />
    </button>
  );

  const renderSpecialGame = () => {
    switch(gameDef.type) {
      case 'schulte': return <SchulteGame key={restartKey} difficulty={difficulty} onExit={onExit} isPaused={isPaused} onGameFinish={onSpecialGameFinish} />;
      case 'stroop': return <StroopGame key={restartKey} difficulty={difficulty} onExit={onExit} isPaused={isPaused} onGameFinish={onSpecialGameFinish} />;
      case 'memory': return <MemoryGame key={restartKey} difficulty={difficulty} mode={gameDef.memoryConfig!.mode} onExit={onExit} isPaused={isPaused} onGameFinish={onSpecialGameFinish} />;
      case 'audio': return <AudioGame key={restartKey} difficulty={difficulty} onExit={onExit} isPaused={isPaused} onGameFinish={onSpecialGameFinish} />;
      case 'mirror': return <MirrorGame key={restartKey} difficulty={difficulty} onExit={onExit} isPaused={isPaused} onGameFinish={onSpecialGameFinish} />;
      case 'categorization': return <CategorizationGame key={restartKey} difficulty={difficulty} onExit={onExit} isPaused={isPaused} onGameFinish={onSpecialGameFinish} />;
      default: return null;
    }
  };

  const specialGame = renderSpecialGame();
  if (specialGame) {
    return (
      <div className="h-full relative">
        <div className="absolute top-4 right-4 z-40">
           <PauseButton />
        </div>
        {specialGame}
        <PauseModal 
          isOpen={isPaused} 
          onResume={() => setIsPaused(false)} 
          onRestart={handleRestart} 
          onQuit={onExit} 
        />
      </div>
    );
  }

  const handleOptionSelect = (option: string) => {
    if (isAnswered || isPaused) return;
    setSelectedOption(option);
    setIsAnswered(true);
    if (option === questions[currentIndex].correctAnswer) {
      setScore(s => s + 100);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setPhase('FINISHED');
    }
  };

  if (phase === 'FINISHED') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 rounded-full bg-scifi-card border-2 border-scifi-success flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,148,0.3)]">
          <Brain size={40} className="text-scifi-success" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white mb-2">训练完成</h2>
        {isNewRecord && (
            <div className="mb-4 px-3 py-1 bg-yellow-500/20 border border-yellow-500 rounded text-yellow-500 font-bold text-sm animate-pulse">
                新纪录: 最高得分!
            </div>
        )}
        <div className="bg-scifi-card w-full max-sm rounded-xl p-6 mb-8 border border-white/5">
          <div className="text-sm text-scifi-muted uppercase tracking-wider mb-2">最终得分</div>
          <div className="text-5xl font-mono font-bold text-scifi-primary">{score}</div>
        </div>
        <button onClick={onExit} className="bg-scifi-primary hover:bg-cyan-400 text-black font-bold py-3 px-8 rounded-full transition-all active:scale-95">
          返回主菜单
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return <div className="p-10 text-center">加载模块错误。</div>;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full p-4 md:p-6 relative">
      <div className="flex items-center justify-between mb-8 font-mono text-sm">
        <div className="flex items-center gap-2 text-scifi-muted">
          <div className={`w-2 h-2 rounded-full ${gameDef.color.replace('text-', 'bg-')}`}></div>
          {gameDef.title}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-scifi-primary">得分: {score}</div>
          <PauseButton />
        </div>
      </div>
      <div className="w-full h-1 bg-scifi-card rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-scifi-secondary to-scifi-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-8">
           <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-xs text-scifi-muted border border-white/10 mb-4">
            问题 0{currentIndex + 1} / 0{questions.length}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">{currentQuestion.question}</h2>
        </div>
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let stateClass = "border-white/10 bg-scifi-card hover:border-white/30 text-scifi-text";
            if (isAnswered) {
              if (option === currentQuestion.correctAnswer) stateClass = "border-scifi-success/50 bg-scifi-success/10 text-scifi-success shadow-[0_0_15px_rgba(0,255,148,0.2)]";
              else if (option === selectedOption) stateClass = "border-scifi-accent/50 bg-scifi-accent/10 text-scifi-accent";
              else stateClass = "opacity-50 border-transparent bg-black/20";
            }
            return (
              <button key={idx} disabled={isAnswered || isPaused} onClick={() => handleOptionSelect(option)} className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between ${stateClass}`}>
                <span className="font-medium text-lg">{option}</span>
                {isAnswered && option === currentQuestion.correctAnswer && <CheckCircle2 size={20} />}
                {isAnswered && option === selectedOption && option !== currentQuestion.correctAnswer && <XCircle size={20} />}
              </button>
            );
          })}
        </div>
        {isAnswered && (
          <div className="mt-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className={`p-4 rounded-xl border ${selectedOption === currentQuestion.correctAnswer ? 'border-scifi-success/20 bg-scifi-success/5' : 'border-scifi-accent/20 bg-scifi-accent/5'}`}>
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className={selectedOption === currentQuestion.correctAnswer ? 'text-scifi-success' : 'text-scifi-accent'} />
                <div>
                  <h4 className={`font-bold mb-1 ${selectedOption === currentQuestion.correctAnswer ? 'text-scifi-success' : 'text-scifi-accent'}`}>
                    {selectedOption === currentQuestion.correctAnswer ? '分析正确' : '分析错误'}
                  </h4>
                  <p className="text-sm text-scifi-muted">{currentQuestion.explanation}</p>
                </div>
              </div>
            </div>
            <button onClick={nextQuestion} className="mt-4 w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-scifi-primary transition-colors flex items-center justify-center gap-2">
              <span>{currentIndex < questions.length - 1 ? '下一个模块' : '完成训练'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>

      <PauseModal 
        isOpen={isPaused} 
        onResume={() => setIsPaused(false)} 
        onRestart={handleRestart} 
        onQuit={onExit} 
      />
    </div>
  );
};

export default GameContainer;
