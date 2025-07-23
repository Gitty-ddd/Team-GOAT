import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTranscripts } from '@/hooks/useTranscripts';
import { Transcript, TranscriptLabel } from '@/types/transcript';
import { Mic, MicOff, Square, Bookmark, ArrowLeft } from 'lucide-react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const Recording: React.FC = () => {
  const navigate = useNavigate();
  const { saveTranscript } = useTranscripts();
  const { toast } = useToast();
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [duration, setDuration] = useState(0);
  const [selectedLabel, setSelectedLabel] = useState<TranscriptLabel>('note');
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [autoStop, setAutoStop] = useState(false);
  const [bookmarks, setBookmarks] = useState<Array<{id: string, timestamp: number, label: string}>>([]);
  
  const recognitionRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
          setInterimTranscript('');
        } else {
          setInterimTranscript(interim);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: 'Recognition Error',
          description: 'Failed to recognize speech. Please try again.',
          variant: 'destructive',
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [toast]);

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) {
      toast({
        title: 'Not Supported',
        description: 'Speech recognition is not supported in your browser.',
        variant: 'destructive',
      });
      return;
    }

    setIsListening(true);
    setDuration(0);
    recognitionRef.current.start();

    intervalRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    toast({
      title: 'Recording Started',
      description: 'Start speaking now...',
    });
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const addBookmark = () => {
    const bookmark = {
      id: Date.now().toString(),
      timestamp: duration,
      label: `Bookmark ${bookmarks.length + 1}`,
    };
    setBookmarks(prev => [...prev, bookmark]);
    toast({
      title: 'Bookmark Added',
      description: `Added at ${formatDuration(duration)}`,
    });
  };

  const saveRecording = () => {
    if (!transcript.trim()) {
      toast({
        title: 'No Content',
        description: 'Please record some content before saving.',
        variant: 'destructive',
      });
      return;
    }

    const newTranscript: Transcript = {
      id: Date.now().toString(),
      title: `${selectedLabel} - ${new Date().toLocaleDateString()}`,
      content: transcript,
      createdAt: new Date(),
      updatedAt: new Date(),
      duration,
      wordCount: transcript.trim().split(/\s+/).length,
      label: selectedLabel,
      bookmarks: bookmarks.map(b => ({ ...b, content: '' })),
    };

    saveTranscript(newTranscript);
    toast({
      title: 'Recording Saved',
      description: 'Your transcript has been saved to the library.',
    });
    
    navigate('/library');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Recording</h1>
      </div>

      {/* Timer */}
      <div className="text-center">
        <div className="text-4xl font-bold text-primary mb-2">
          {formatDuration(duration)}
        </div>
        <p className="text-muted-foreground">Recording Time</p>
      </div>

      {/* Waveform Visualization Placeholder */}
      <Card className="p-6 bg-card border-border">
        <div className="h-20 bg-muted/30 rounded-lg flex items-center justify-center relative overflow-hidden">
          {isListening && (
            <div className="flex items-center justify-center gap-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full wave-bar"
                  style={{
                    height: `${Math.random() * 40 + 10}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          )}
          {!isListening && (
            <p className="text-muted-foreground">Audio visualization will appear here</p>
          )}
        </div>
      </Card>

      {/* Recording Controls */}
      <Card className="p-6 bg-card border-border">
        <div className="flex justify-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12"
            disabled={!isListening}
          >
            <Square className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={!isSupported}
            size="lg"
            className={`w-16 h-16 rounded-full transition-all duration-300 ${
              isListening 
                ? 'bg-destructive hover:bg-destructive/90 recording-pulse' 
                : 'bg-gradient-primary hover:shadow-glow'
            }`}
          >
            {isListening ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12"
            onClick={addBookmark}
            disabled={!isListening}
          >
            <Bookmark className="w-5 h-5" />
          </Button>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="noise-reduction">Noise Reduction</Label>
            <Switch
              id="noise-reduction"
              checked={noiseReduction}
              onCheckedChange={setNoiseReduction}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-stop">Auto-Stop on Silence</Label>
            <Switch
              id="auto-stop"
              checked={autoStop}
              onCheckedChange={setAutoStop}
            />
          </div>
        </div>
      </Card>

      {/* Add Label */}
      <Card className="p-6 bg-card border-border">
        <Label className="text-sm font-medium mb-3 block">Add Label</Label>
        <Select value={selectedLabel} onValueChange={(value) => setSelectedLabel(value as TranscriptLabel)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="lecture">Lecture</SelectItem>
            <SelectItem value="note">Note</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {/* Live Transcription */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Live Transcription</h3>
          {isListening && (
            <Badge variant="default" className="bg-primary">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
              Listening
            </Badge>
          )}
        </div>

        <Textarea
          value={transcript + (interimTranscript ? ` ${interimTranscript}` : '')}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={isListening ? "Listening... Tap the microphone to start recording your voice." : "Your speech will appear here..."}
          className="min-h-[150px] resize-none bg-muted/30 border-border"
        />

        {bookmarks.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Bookmarks</h4>
            <div className="flex flex-wrap gap-2">
              {bookmarks.map((bookmark) => (
                <Badge key={bookmark.id} variant="outline">
                  {formatDuration(bookmark.timestamp)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {transcript && (
          <div className="mt-4 flex gap-2">
            <Button onClick={saveRecording} className="flex-1">
              Save Recording
            </Button>
          </div>
        )}
      </Card>

      {!isSupported && (
        <Card className="p-4 bg-destructive/10 border-destructive/20">
          <p className="text-destructive text-sm text-center">
            Speech recognition is not supported in your browser.
            Please use Chrome, Safari, or Edge for the best experience.
          </p>
        </Card>
      )}
    </div>
  );
};