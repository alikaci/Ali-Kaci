
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  revelationType: string;
  numberOfAyahs: number;
}

export interface Verse {
  number: number;
  text: string;
  numberInSurah: number;
  audio: string;
}

export enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

export interface Settings {
  difficulty: Difficulty;
  isVoiceEnabled: boolean;
  theme: 'light' | 'dark';
}

export interface TestResult {
  id?: number;
  surahName: string;
  score: number;
  difficulty: Difficulty;
  date: string;
}