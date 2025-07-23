import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/storage';
import { AppSettings } from '@/types/transcript';
import { 
  Settings as SettingsIcon, 
  Mic, 
  Volume2, 
  Palette, 
  FolderOpen, 
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());
  const [isLoading, setIsLoading] = useState(false);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    storage.saveSettings(updatedSettings);
    
    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been updated.',
    });
  };

  const updateSTTSettings = (newSTTSettings: Partial<AppSettings['sttSettings']>) => {
    updateSettings({
      sttSettings: { ...settings.sttSettings, ...newSTTSettings }
    });
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voicova-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Settings Exported',
      description: 'Your settings have been saved to file.',
    });
  };

  const resetSettings = () => {
    const defaultSettings = storage.getSettings();
    setSettings(defaultSettings);
    storage.saveSettings(defaultSettings);
    
    toast({
      title: 'Settings Reset',
      description: 'All settings have been restored to defaults.',
    });
  };

  const clearAllData = () => {
    if (confirm('Are you sure? This will delete all transcripts and settings. This action cannot be undone.')) {
      localStorage.clear();
      toast({
        title: 'Data Cleared',
        description: 'All app data has been deleted.',
        variant: 'destructive',
      });
      // Reload to reset app state
      window.location.reload();
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Speech Recognition */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-3 mb-4">
          <Mic className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Speech Recognition</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">STT Model</Label>
            <Select 
              value={settings.sttSettings.model} 
              onValueChange={(value) => updateSTTSettings({ model: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whisper-tiny">Whisper Tiny (Fast)</SelectItem>
                <SelectItem value="whisper-base">Whisper Base (Balanced)</SelectItem>
                <SelectItem value="vosk">Vosk (Lightweight)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Whisper Tiny is fastest but less accurate. Whisper Base provides better accuracy.
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Language & Accent</Label>
            <Select 
              value={settings.sttSettings.language} 
              onValueChange={(value) => updateSTTSettings({ language: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="en-GB">English (UK)</SelectItem>
                <SelectItem value="en-AU">English (AU)</SelectItem>
                <SelectItem value="es-ES">Spanish</SelectItem>
                <SelectItem value="fr-FR">French</SelectItem>
                <SelectItem value="de-DE">German</SelectItem>
                <SelectItem value="it-IT">Italian</SelectItem>
                <SelectItem value="pt-BR">Portuguese (BR)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="noise-reduction">Noise Reduction</Label>
              <p className="text-xs text-muted-foreground">
                Filter background noise during recording
              </p>
            </div>
            <Switch
              id="noise-reduction"
              checked={settings.sttSettings.noiseReduction}
              onCheckedChange={(checked) => updateSTTSettings({ noiseReduction: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-stop">Auto-Stop on Silence</Label>
              <p className="text-xs text-muted-foreground">
                Automatically stop recording after silence
              </p>
            </div>
            <Switch
              id="auto-stop"
              checked={settings.sttSettings.autoStop}
              onCheckedChange={(checked) => updateSTTSettings({ autoStop: checked })}
            />
          </div>
        </div>
      </Card>

      {/* AI Features */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-3 mb-4">
          <Volume2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">AI Features</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-summarization">Auto Summarization</Label>
              <p className="text-xs text-muted-foreground">
                Generate transcript summaries automatically
              </p>
            </div>
            <Switch
              id="auto-summarization"
              checked={settings.sttSettings.autoSummarization}
              onCheckedChange={(checked) => updateSTTSettings({ autoSummarization: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="action-detection">Action Item Detection</Label>
              <p className="text-xs text-muted-foreground">
                Detect tasks and reminders in transcripts
              </p>
            </div>
            <Switch
              id="action-detection"
              checked={settings.sttSettings.actionDetection}
              onCheckedChange={(checked) => updateSTTSettings({ actionDetection: checked })}
            />
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Appearance</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Theme</Label>
            <Select 
              value={settings.theme} 
              onValueChange={(value) => updateSettings({ theme: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="w-full h-20 bg-background border rounded mb-2"></div>
              <p className="text-sm">Light</p>
            </div>
            <div className="p-4 border rounded-lg text-center bg-gray-900 text-white">
              <div className="w-full h-20 bg-gray-800 border border-gray-700 rounded mb-2"></div>
              <p className="text-sm">Dark</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Storage */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-3 mb-4">
          <FolderOpen className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Storage</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Default Save Location</Label>
            <Input
              value={settings.defaultSaveLocation}
              onChange={(e) => updateSettings({ defaultSaveLocation: e.target.value })}
              placeholder="/Documents/VoiceTransformers/"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Default folder for exported transcripts
            </p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium mb-2">Storage Usage</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Transcripts:</span>
                <span>{storage.getTranscripts().length} files</span>
              </div>
              <div className="flex justify-between">
                <span>Local Storage:</span>
                <span>~{Math.round(JSON.stringify(localStorage).length / 1024)}KB</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-3 mb-4">
          <Download className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Data Management</h2>
        </div>
        
        <div className="space-y-3">
          <Button variant="outline" onClick={exportSettings} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export Settings
          </Button>
          
          <Button variant="outline" onClick={resetSettings} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          
          <Button 
            variant="outline" 
            onClick={clearAllData} 
            className="w-full text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Data
          </Button>
        </div>
        
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground">
            All data is stored locally on your device. Clearing data will permanently delete all transcripts and settings.
          </p>
        </div>
      </Card>

      {/* App Info */}
      <Card className="p-6 bg-card border-border">
        <div className="text-center space-y-2">
          <h3 className="font-semibold">Voicova</h3>
          <p className="text-sm text-muted-foreground">Version 1.0.0</p>
          <p className="text-xs text-muted-foreground">
            Offline Speech-to-Text • Privacy-first voice recognition
          </p>
        </div>
      </Card>
    </div>
  );
};