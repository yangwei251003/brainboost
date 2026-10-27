
import { LucideIcon } from 'lucide-react';

export type GameType = 'quiz' | 'schulte' | 'stroop' | 'memory' | 'audio' | 'mirror' | 'categorization';

export type ThemeType = 'cyberpunk' | 'darkmatter' | 'stardust';

export type DifficultyType = 'beginner' | 'intermediate' | 'expert';

export interface GameDefinition {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  promptTopic: string; // Used for Gemini prompt
  type?: GameType;
  scoringType: 'score' | 'time'; // Determines main metric for display
  memoryConfig?: {
    mode: 'sequential' | 'simultaneous';
  };
}

export type ViewState = 'HOME' | 'GAME_PLAYING' | 'GAME_RESULT' | 'DASHBOARD';

export interface QuestionData {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface SessionRecord {
  gameId: string;
  score: number;
  time?: number;
  timestamp: number;
  difficulty: DifficultyType;
}

export interface GameState {
  currentQuestionIndex: number;
  score: number;
  totalQuestions: number;
  isLoading: boolean;
  questions: QuestionData[];
  gameId: string | null;
  difficulty: DifficultyType;
}
