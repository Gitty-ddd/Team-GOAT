import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Square, Copy, Download, Trash2, Volume2 } from 'lucide-react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const VoiceRecorder: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const recognitionRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if speech recognition is supported
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

  useEffect(() => {
    const words = transcript.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [transcript]);

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
      title: 'Listening Started',
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

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setWordCount(0);
    setDuration(0);
  };

  const copyToClipboard = async () => {
    if (!transcript) return;
    
    try {
      await navigator.clipboard.writeText(transcript);
      toast({
        title: 'Copied!',
        description: 'Text copied to clipboard.',
      });
    } catch (err) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy text to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const downloadTranscript = () => {
    if (!transcript) return;

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voicova-transcript-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded!',
      description: 'Transcript saved to your device.',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-secondary p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Voicova
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Speak naturally, transcribe instantly
          </p>
        </div>

        {/* Recording Controls */}
        <Card className="p-6 bg-card border-border">
          <div className="flex flex-col items-center space-y-6">
            {/* Main Record Button */}
            <div className="relative">
              <Button
                onClick={isListening ? stopListening : startListening}
                disabled={!isSupported}
                size="lg"
                className={`w-20 h-20 rounded-full transition-all duration-300 ${
                  isListening 
                    ? 'bg-destructive hover:bg-destructive/90 recording-pulse' 
                    : 'bg-gradient-primary hover:shadow-glow'
                }`}
              >
                {isListening ? (
                  <Square className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </Button>
              
              {/* Visual feedback bars around the button */}
              {isListening && (
                <div className="absolute inset-0 -m-4 flex items-center justify-center">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-8 bg-primary rounded-full wave-bar"
                      style={{
                        transform: `rotate(${i * 45}deg) translateY(-40px)`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="text-center space-y-2">
              {isListening ? (
                <>
                  <Badge variant="default" className="bg-primary">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                    Recording
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Duration: {formatDuration(duration)}
                  </p>
                </>
              ) : (
                <Badge variant="secondary">
                  <MicOff className="w-3 h-3 mr-2" />
                  Tap to start recording
                </Badge>
              )}
            </div>

            {!isSupported && (
              <div className="text-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-destructive text-sm">
                  Speech recognition is not supported in your browser.
                  Please use Chrome, Safari, or Edge for the best experience.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Transcript */}
        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Transcript</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{wordCount} words</span>
              </div>
            </div>

            <Textarea
              value={transcript + (interimTranscript ? ` ${interimTranscript}` : '')}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your speech will appear here..."
              className="min-h-[200px] resize-none bg-muted/30 border-border"
            />

            {interimTranscript && (
              <p className="text-sm text-muted-foreground italic">
                Interim: {interimTranscript}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={copyToClipboard}
                disabled={!transcript}
                variant="outline"
                size="sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button
                onClick={downloadTranscript}
                disabled={!transcript}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={clearTranscript}
                disabled={!transcript}
                variant="outline"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Powered by Web Speech API • Privacy-first voice recognition</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;