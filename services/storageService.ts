
import { ThemeType, DifficultyType, SessionRecord } from '../types';

export interface GameRecord {
  highScore: number;
  bestTime?: number; // In seconds
}

export const getRecord = (gameId: string): GameRecord => {
  try {
    const stored = localStorage.getItem(`brainboost_record_${gameId}`);
    return stored ? JSON.parse(stored) : { highScore: 0, bestTime: 0 };
  } catch (e) {
    return { highScore: 0, bestTime: 0 };
  }
};

export const saveRecord = (gameId: string, score: number, time?: number): { newHighScore: boolean, newBestTime: boolean } => {
  const current = getRecord(gameId);
  let newHighScore = false;
  let newBestTime = false;

  if (score > current.highScore) {
    current.highScore = score;
    newHighScore = true;
  }

  if (time !== undefined && time > 0) {
    if (!current.bestTime || current.bestTime === 0 || time < current.bestTime) {
      current.bestTime = time;
      newBestTime = true;
    }
  }

  localStorage.setItem(`brainboost_record_${gameId}`, JSON.stringify(current));
  return { newHighScore, newBestTime };
};

export const saveSession = (session: SessionRecord): void => {
  try {
    const history: SessionRecord[] = JSON.parse(localStorage.getItem('brainboost_history') || '[]');
    history.push(session);
    // Keep last 100 sessions to prevent localStorage bloat
    if (history.length > 100) history.shift();
    localStorage.setItem('brainboost_history', JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save session history", e);
  }
};

export const getSessionHistory = (): SessionRecord[] => {
  try {
    return JSON.parse(localStorage.getItem('brainboost_history') || '[]');
  } catch (e) {
    return [];
  }
};

export const isTutorialCompleted = (gameId: string): boolean => {
  return localStorage.getItem(`brainboost_tut_${gameId}`) === 'true';
};

export const setTutorialCompleted = (gameId: string): void => {
  localStorage.setItem(`brainboost_tut_${gameId}`, 'true');
};

export const getTheme = (): ThemeType => {
  return (localStorage.getItem('brainboost_theme') as ThemeType) || 'cyberpunk';
};

export const saveTheme = (theme: ThemeType): void => {
  localStorage.setItem('brainboost_theme', theme);
};

export const getPreferredDifficulty = (gameId: string): DifficultyType => {
  return (localStorage.getItem(`brainboost_diff_${gameId}`) as DifficultyType) || 'intermediate';
};

export const savePreferredDifficulty = (gameId: string, difficulty: DifficultyType): void => {
  localStorage.setItem(`brainboost_diff_${gameId}`, difficulty);
};
