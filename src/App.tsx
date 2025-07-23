import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Recording } from '@/pages/Recording';
import { TranscriptViewer } from '@/pages/TranscriptViewer';
import { Search } from '@/pages/Search';
import { Library } from '@/pages/Library';
import { Settings } from '@/pages/Settings';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="record" element={<Recording />} />
            <Route path="transcript/:id" element={<TranscriptViewer />} />
            <Route path="search" element={<Search />} />
            <Route path="library" element={<Library />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
