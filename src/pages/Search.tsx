import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranscripts } from '@/hooks/useTranscripts';
import { TranscriptLabel } from '@/types/transcript';
import { Search as SearchIcon, Filter, Calendar, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const Search: React.FC = () => {
  const { searchTranscripts } = useTranscripts();
  const [query, setQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<TranscriptLabel | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'length'>('date');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      setIsSearching(true);
      
      const searchResults = searchTranscripts(
        query,
        selectedLabel === 'all' ? undefined : selectedLabel
      );
      
      // Sort results
      const sortedResults = searchResults.sort((a, b) => {
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
      
      setResults(sortedResults);
      setIsSearching(false);
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, selectedLabel, sortBy, searchTranscripts]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    
    const regex = new RegExp(`(${highlight})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
  };

  const labelColors = {
    meeting: 'bg-blue-500',
    lecture: 'bg-green-500',
    note: 'bg-yellow-500',
    interview: 'bg-purple-500',
    custom: 'bg-gray-500',
  };

  const getSnippet = (content: string, query: string) => {
    if (!query.trim()) return content.substring(0, 150) + '...';
    
    const index = content.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return content.substring(0, 150) + '...';
    
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 100);
    const snippet = (start > 0 ? '...' : '') + content.substring(start, end) + (end < content.length ? '...' : '');
    
    return highlightText(snippet, query);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Search Transcripts</h1>
        <p className="text-muted-foreground">Find your recordings quickly</p>
      </div>

      {/* Search Bar */}
      <Card className="p-4 bg-card border-border">
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search all transcripts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 h-12 text-lg"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={selectedLabel} onValueChange={(value) => setSelectedLabel(value as TranscriptLabel | 'all')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by label" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Labels</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="lecture">Lecture</SelectItem>
              <SelectItem value="note">Note</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
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
        </div>
      </Card>

      {/* Search Results */}
      <div className="space-y-4">
        {isSearching ? (
          <Card className="p-8 bg-card border-border">
            <div className="text-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-muted-foreground">Searching...</p>
            </div>
          </Card>
        ) : results.length === 0 ? (
          <Card className="p-8 bg-card border-border">
            <div className="text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {query ? 'No results found' : 'Start searching'}
              </h3>
              <p className="text-muted-foreground">
                {query 
                  ? `No transcripts match "${query}"` 
                  : 'Enter a search term to find your transcripts'
                }
              </p>
            </div>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {results.length} transcript{results.length !== 1 ? 's' : ''}
                {query && ` for "${query}"`}
              </p>
            </div>

            <div className="space-y-3">
              {results.map((transcript) => (
                <Link
                  key={transcript.id}
                  to={`/transcript/${transcript.id}`}
                  className="block"
                >
                  <Card className="p-4 bg-card border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <h3 
                        className="font-semibold truncate flex-1"
                        dangerouslySetInnerHTML={{ 
                          __html: highlightText(transcript.title, query) 
                        }}
                      />
                      <Badge 
                        variant="secondary" 
                        className={`ml-2 text-white ${labelColors[transcript.label]}`}
                      >
                        {transcript.label}
                      </Badge>
                    </div>
                    
                    <div 
                      className="text-sm text-muted-foreground mb-3 line-clamp-2"
                      dangerouslySetInnerHTML={{ 
                        __html: getSnippet(transcript.content, query) 
                      }}
                    />
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(transcript.createdAt)} ago
                        </span>
                        <span>{transcript.wordCount} words</span>
                        <span>{formatDuration(transcript.duration)}</span>
                      </div>
                      {transcript.bookmarks.length > 0 && (
                        <span className="flex items-center gap-1">
                          <SearchIcon className="w-3 h-3" />
                          {transcript.bookmarks.length} bookmarks
                        </span>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Quick Search Suggestions */}
      {!query && (
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-3">Quick Search</h3>
          <div className="flex flex-wrap gap-2">
            {['meeting', 'lecture', 'interview', 'notes'].map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => setQuery(suggestion)}
                className="text-sm"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};