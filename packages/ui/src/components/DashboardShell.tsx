import React, { useState } from 'react';
import { cn } from '@almosthack/utils';
import { SidebarNav } from './SidebarNav';
import { TopHeader } from './TopHeader';
import { Drawer, DrawerContent } from './Drawer';

export interface DashboardShellProps {
  currentPath?: string;
  onNavigate?: (href: string) => void;
  onOpenCommandPalette?: () => void;
  userName?: string;
  userEmail?: string;
  role?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  currentPath = '/overview',
  onNavigate,
  onOpenCommandPalette,
  userName,
  userEmail,
  role,
  headerActions,
  children,
  className,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigate = (href: string) => {
    setIsMobileMenuOpen(false);
    onNavigate?.(href);
  };

  return (
    <div className={cn('flex h-screen w-screen overflow-hidden bg-[#F7F4EA] text-[#171914] font-body', className)}>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        <SidebarNav currentPath={currentPath} onNavigate={handleNavigate} />
      </div>

      {/* Mobile Drawer Navigation */}
      <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DrawerContent side="left" className="p-0 max-w-[280px] w-[280px]">
          <SidebarNav currentPath={currentPath} onNavigate={handleNavigate} className="w-full border-r-0" />
        </DrawerContent>
      </Drawer>

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Header */}
        <TopHeader
          userName={userName}
          userEmail={userEmail}
          role={role}
          onOpenCommandPalette={onOpenCommandPalette}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        >
          {headerActions}
        </TopHeader>

        {/* Dynamic Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
