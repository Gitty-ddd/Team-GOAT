export interface Transcript {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  duration: number;
  wordCount: number;
  label: TranscriptLabel;
  bookmarks: Bookmark[];
  summary?: string;
}

export interface Bookmark {
  id: string;
  timestamp: number;
  label: string;
  content: string;
}

export type TranscriptLabel = 'meeting' | 'lecture' | 'note' | 'interview' | 'custom';

export interface STTSettings {
  model: 'whisper-tiny' | 'whisper-base' | 'vosk';
  language: string;
  noiseReduction: boolean;
  autoStop: boolean;
  autoSummarization: boolean;
  actionDetection: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultSaveLocation: string;
  sttSettings: STTSettings;
}