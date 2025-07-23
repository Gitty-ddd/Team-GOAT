import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { Toaster } from '@/components/ui/toaster';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-secondary">
      <main className="pb-16">
        <Outlet />
      </main>
      <BottomNavigation />
      <Toaster />
    </div>
  );
};