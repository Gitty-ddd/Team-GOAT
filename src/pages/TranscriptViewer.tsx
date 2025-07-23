import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTranscripts } from '@/hooks/useTranscripts';
import { Transcript } from '@/types/transcript';
import { 
  ArrowLeft, 
  Edit, 
  Search, 
  Volume2, 
  Copy, 
  Download, 
  Trash2, 
  Bookmark,
  Share,
  FileText
} from 'lucide-react';

export const TranscriptViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { transcripts, saveTranscript, deleteTranscript } = useTranscripts();
  const { toast } = useToast();
  
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedContent, setHighlightedContent] = useState('');

  useEffect(() => {
    const found = transcripts.find(t => t.id === id);
    if (found) {
      setTranscript(found);
      setEditedContent(found.content);
    }
  }, [id, transcripts]);

  useEffect(() => {
    if (!transcript || !searchQuery) {
      setHighlightedContent(transcript?.content || '');
      return;
    }

    const highlighted = transcript.content.replace(
      new RegExp(`(${searchQuery})`, 'gi'),
      '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>'
    );
    setHighlightedContent(highlighted);
  }, [transcript, searchQuery]);

  const handleSave = () => {
    if (!transcript) return;

    const updatedTranscript: Transcript = {
      ...transcript,
      content: editedContent,
      updatedAt: new Date(),
      wordCount: editedContent.trim().split(/\s+/).length,
    };

    saveTranscript(updatedTranscript);
    setTranscript(updatedTranscript);
    setIsEditing(false);
    
    toast({
      title: 'Saved',
      description: 'Transcript has been updated.',
    });
  };

  const handleDelete = () => {
    if (!transcript) return;
    
    deleteTranscript(transcript.id);
    toast({
      title: 'Deleted',
      description: 'Transcript has been deleted.',
    });
    navigate('/library');
  };

  const copyToClipboard = async () => {
    if (!transcript) return;
    
    try {
      await navigator.clipboard.writeText(transcript.content);
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

    const blob = new Blob([transcript.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${transcript.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded!',
      description: 'Transcript saved to your device.',
    });
  };

  const generateSummary = () => {
    if (!transcript) return;
    
    // Simple summary generation (would be replaced with actual NLP)
    const sentences = transcript.content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const summary = sentences.slice(0, 3).join('. ') + '.';
    
    const updatedTranscript: Transcript = {
      ...transcript,
      summary,
      updatedAt: new Date(),
    };
    
    saveTranscript(updatedTranscript);
    setTranscript(updatedTranscript);
    
    toast({
      title: 'Summary Generated',
      description: 'AI summary has been created.',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const labelColors = {
    meeting: 'bg-blue-500',
    lecture: 'bg-green-500',
    note: 'bg-yellow-500',
    interview: 'bg-purple-500',
    custom: 'bg-gray-500',
  };

  if (!transcript) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Transcript Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold truncate">{transcript.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant="secondary" 
              className={`text-white ${labelColors[transcript.label]}`}
            >
              {transcript.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {transcript.wordCount} words • {formatDuration(transcript.duration)}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit className="w-5 h-5" />
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 bg-card border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search in transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Summary */}
      {transcript.summary && (
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">AI Summary</h3>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{transcript.summary}</p>
        </Card>
      )}

      {/* Bookmarks */}
      {transcript.bookmarks.length > 0 && (
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-3">Bookmarks</h3>
          <div className="space-y-2">
            {transcript.bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-primary" />
                  <span className="text-sm">{bookmark.label}</span>
                </div>
                <Badge variant="outline">{formatDuration(bookmark.timestamp)}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Transcript Content */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Transcript</h3>
          <div className="flex items-center gap-2">
            {!transcript.summary && (
              <Button variant="outline" size="sm" onClick={generateSummary}>
                Generate Summary
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[300px] resize-none"
            />
            <div className="flex gap-2">
              <Button onClick={handleSave}>Save Changes</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="prose prose-sm max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
          />
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={copyToClipboard} variant="outline" size="sm">
          <Copy className="w-4 h-4 mr-2" />
          Copy
        </Button>
        <Button onClick={downloadTranscript} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button variant="outline" size="sm">
          <Share className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button onClick={handleDelete} variant="outline" size="sm" className="text-destructive">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
};