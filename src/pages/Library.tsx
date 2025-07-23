import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranscripts } from '@/hooks/useTranscripts';
import { useToast } from '@/hooks/use-toast';
import { TranscriptLabel } from '@/types/transcript';
import { 
  FolderOpen, 
  Grid, 
  List, 
  MoreVertical, 
  Download, 
  Trash2, 
  Edit,
  Calendar,
  Clock,
  FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const Library: React.FC = () => {
  const { transcripts, deleteTranscript } = useTranscripts();
  const { toast } = useToast();
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterLabel, setFilterLabel] = useState<TranscriptLabel | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'length'>('date');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const filteredTranscripts = transcripts
    .filter(t => filterLabel === 'all' || t.label === filterLabel)
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        case 'length':
          return b.wordCount - a.wordCount;
        default:
          return 0;
      }
    });

  const handleSelectAll = () => {
    if (selectedItems.length === filteredTranscripts.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredTranscripts.map(t => t.id));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleBatchDelete = () => {
    selectedItems.forEach(id => deleteTranscript(id));
    setSelectedItems([]);
    toast({
      title: 'Deleted',
      description: `${selectedItems.length} transcript(s) deleted.`,
    });
  };

  const handleBatchExport = () => {
    const exportData = transcripts
      .filter(t => selectedItems.includes(t.id))
      .map(t => ({
        title: t.title,
        content: t.content,
        createdAt: t.createdAt,
        label: t.label,
        duration: t.duration,
        wordCount: t.wordCount,
      }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voicova-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Exported',
      description: `${selectedItems.length} transcript(s) exported.`,
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

  const getLabelCounts = () => {
    const counts = { meeting: 0, lecture: 0, note: 0, interview: 0, custom: 0 };
    transcripts.forEach(t => counts[t.label]++);
    return counts;
  };

  const labelCounts = getLabelCounts();

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Library</h1>
          <p className="text-muted-foreground">{transcripts.length} transcript(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Label Statistics */}
      <Card className="p-4 bg-card border-border">
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(labelCounts).map(([label, count]) => (
            <div 
              key={label}
              className="text-center p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setFilterLabel(label as TranscriptLabel)}
            >
              <div className={`w-8 h-8 rounded-full ${labelColors[label as TranscriptLabel]} mx-auto mb-2`} />
              <div className="text-lg font-bold">{count}</div>
              <div className="text-sm text-muted-foreground capitalize">{label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters and Actions */}
      <Card className="p-4 bg-card border-border">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Select value={filterLabel} onValueChange={(value) => setFilterLabel(value as TranscriptLabel | 'all')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by label" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Labels</SelectItem>
              <SelectItem value="meeting">Meeting ({labelCounts.meeting})</SelectItem>
              <SelectItem value="lecture">Lecture ({labelCounts.lecture})</SelectItem>
              <SelectItem value="note">Note ({labelCounts.note})</SelectItem>
              <SelectItem value="interview">Interview ({labelCounts.interview})</SelectItem>
              <SelectItem value="custom">Custom ({labelCounts.custom})</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'name' | 'length')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="length">Length</SelectItem>
            </SelectContent>
          </Select>

          {filteredTranscripts.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={selectedItems.length === filteredTranscripts.length}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm">
                Select All
              </label>
            </div>
          )}
        </div>

        {selectedItems.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
            <span className="text-sm font-medium">
              {selectedItems.length} selected
            </span>
            <Button variant="outline" size="sm" onClick={handleBatchExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleBatchDelete} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </Card>

      {/* Transcripts */}
      {filteredTranscripts.length === 0 ? (
        <Card className="p-8 bg-card border-border">
          <div className="text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No transcripts found</h3>
            <p className="text-muted-foreground mb-4">
              {filterLabel === 'all' 
                ? "You haven't recorded anything yet. Start your first recording!"
                : `No ${filterLabel} transcripts found. Try a different filter.`
              }
            </p>
            <Link to="/record">
              <Button>Start Recording</Button>
            </Link>
          </div>
        </Card>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredTranscripts.map((transcript) => (
            <Card key={transcript.id} className="p-4 bg-card border-border">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedItems.includes(transcript.id)}
                  onCheckedChange={() => handleSelectItem(transcript.id)}
                />
                
                <Link 
                  to={`/transcript/${transcript.id}`} 
                  className="flex-1 min-w-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold truncate flex-1">{transcript.title}</h3>
                    <Badge 
                      variant="secondary" 
                      className={`ml-2 text-white ${labelColors[transcript.label]}`}
                    >
                      {transcript.label}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {transcript.content.substring(0, 150)}...
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(transcript.createdAt)} ago
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {transcript.wordCount} words
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(transcript.duration)}
                      </span>
                    </div>
                    {transcript.summary && (
                      <Badge variant="outline" className="text-xs">
                        Summary
                      </Badge>
                    )}
                  </div>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTranscripts.map((transcript) => (
            <Card key={transcript.id} className="p-4 bg-card border-border">
              <div className="flex items-start justify-between mb-3">
                <Checkbox
                  checked={selectedItems.includes(transcript.id)}
                  onCheckedChange={() => handleSelectItem(transcript.id)}
                />
                <Badge 
                  variant="secondary" 
                  className={`text-white ${labelColors[transcript.label]}`}
                >
                  {transcript.label}
                </Badge>
              </div>
              
              <Link to={`/transcript/${transcript.id}`}>
                <h3 className="font-semibold mb-2 line-clamp-2">{transcript.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {transcript.content.substring(0, 100)}...
                </p>
                
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>{formatDistanceToNow(transcript.createdAt)} ago</span>
                    <span>{formatDuration(transcript.duration)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{transcript.wordCount} words</span>
                    {transcript.summary && (
                      <Badge variant="outline" className="text-xs">
                        Summary
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};