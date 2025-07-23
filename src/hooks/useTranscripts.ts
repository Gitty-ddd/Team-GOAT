import { useState, useEffect, useCallback } from 'react';
import { Transcript, TranscriptLabel } from '@/types/transcript';
import { storage } from '@/lib/storage';

export const useTranscripts = () => {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTranscripts(storage.getTranscripts());
    setIsLoading(false);
  }, []);

  const saveTranscript = useCallback((transcript: Transcript) => {
    storage.saveTranscript(transcript);
    setTranscripts(storage.getTranscripts());
  }, []);

  const deleteTranscript = useCallback((id: string) => {
    storage.deleteTranscript(id);
    setTranscripts(storage.getTranscripts());
  }, []);

  const searchTranscripts = useCallback((query: string, label?: TranscriptLabel, dateRange?: [Date, Date]) => {
    return storage.searchTranscripts(query, label, dateRange);
  }, []);

  const getRecentTranscripts = useCallback((limit: number = 5) => {
    return transcripts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }, [transcripts]);

  const getTranscriptsByLabel = useCallback((label: TranscriptLabel) => {
    return transcripts.filter(t => t.label === label);
  }, [transcripts]);

  const getWeeklyStats = useCallback(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyTranscripts = transcripts.filter(t => t.createdAt >= oneWeekAgo);
    
    return {
      recordings: weeklyTranscripts.length,
      totalTime: weeklyTranscripts.reduce((acc, t) => acc + t.duration, 0),
      voicesUsed: new Set(weeklyTranscripts.map(t => t.label)).size,
    };
  }, [transcripts]);

  return {
    transcripts,
    isLoading,
    saveTranscript,
    deleteTranscript,
    searchTranscripts,
    getRecentTranscripts,
    getTranscriptsByLabel,
    getWeeklyStats,
  };
};