import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranscripts } from '@/hooks/useTranscripts';
import { Volume2, Mic, Search, FolderOpen, Settings, Calendar, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { getRecentTranscripts, getWeeklyStats } = useTranscripts();
  const recentTranscripts = getRecentTranscripts(3);
  const weeklyStats = getWeeklyStats();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const labelColors = {
    meeting: 'bg-blue-500',
    lecture: 'bg-green-500',
    note: 'bg-yellow-500',
    interview: 'bg-purple-500',
    custom: 'bg-gray-500',
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Volume2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Voicova
          </h1>
        </div>
      </div>

      {/* Weekly Summary */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold mb-4">Weekly Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{weeklyStats.recordings}</div>
            <div className="text-sm text-muted-foreground">Recordings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{formatDuration(weeklyStats.totalTime)}</div>
            <div className="text-sm text-muted-foreground">Total Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{weeklyStats.voicesUsed}</div>
            <div className="text-sm text-muted-foreground">Voice Types</div>
          </div>
        </div>
      </Card>

      {/* Start Recording CTA */}
      <Link to="/record">
        <Button className="w-full h-14 bg-gradient-primary hover:shadow-glow transition-all duration-300">
          <Mic className="w-6 h-6 mr-3" />
          Start New Recording
        </Button>
      </Link>

      {/* Quick Access */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/search">
            <Button variant="outline" className="w-full h-20 flex-col">
              <Search className="w-6 h-6 mb-2" />
              <span className="text-sm">Search</span>
            </Button>
          </Link>
          <Link to="/library">
            <Button variant="outline" className="w-full h-20 flex-col">
              <FolderOpen className="w-6 h-6 mb-2" />
              <span className="text-sm">Library</span>
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent Transcripts */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Transcripts</h3>
          <Link to="/library">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
        
        {recentTranscripts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No transcripts yet</p>
            <p className="text-sm">Start your first recording!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTranscripts.map((transcript) => (
              <Link
                key={transcript.id}
                to={`/transcript/${transcript.id}`}
                className="block"
              >
                <div className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium truncate flex-1">{transcript.title}</h4>
                    <Badge 
                      variant="secondary" 
                      className={`ml-2 text-white ${labelColors[transcript.label]}`}
                    >
                      {transcript.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {transcript.content.substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDistanceToNow(transcript.createdAt)} ago</span>
                    <span>{transcript.wordCount} words • {formatDuration(transcript.duration)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};