import { Transcript, AppSettings, TranscriptLabel } from '@/types/transcript';

const TRANSCRIPTS_KEY = 'voicova_transcripts';
const SETTINGS_KEY = 'voicova_settings';

export const storage = {
  // Transcripts
  getTranscripts(): Transcript[] {
    const data = localStorage.getItem(TRANSCRIPTS_KEY);
    if (!data) return [];
    return JSON.parse(data).map((t: any) => ({
      ...t,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
    }));
  },

  saveTranscript(transcript: Transcript): void {
    const transcripts = this.getTranscripts();
    const existingIndex = transcripts.findIndex(t => t.id === transcript.id);
    
    if (existingIndex >= 0) {
      transcripts[existingIndex] = transcript;
    } else {
      transcripts.push(transcript);
    }
    
    localStorage.setItem(TRANSCRIPTS_KEY, JSON.stringify(transcripts));
  },

  deleteTranscript(id: string): void {
    const transcripts = this.getTranscripts().filter(t => t.id !== id);
    localStorage.setItem(TRANSCRIPTS_KEY, JSON.stringify(transcripts));
  },

  searchTranscripts(query: string, label?: TranscriptLabel, dateRange?: [Date, Date]): Transcript[] {
    const transcripts = this.getTranscripts();
    
    return transcripts.filter(transcript => {
      const matchesQuery = !query || 
        transcript.title.toLowerCase().includes(query.toLowerCase()) ||
        transcript.content.toLowerCase().includes(query.toLowerCase());
      
      const matchesLabel = !label || transcript.label === label;
      
      const matchesDate = !dateRange || 
        (transcript.createdAt >= dateRange[0] && transcript.createdAt <= dateRange[1]);
      
      return matchesQuery && matchesLabel && matchesDate;
    });
  },

  // Settings
  getSettings(): AppSettings {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
      return {
        theme: 'system',
        defaultSaveLocation: '/Documents/VoiceTransformers/',
        sttSettings: {
          model: 'whisper-tiny',
          language: 'en-US',
          noiseReduction: true,
          autoStop: true,
          autoSummarization: false,
          actionDetection: false,
        },
      };
    }
    return JSON.parse(data);
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },
};