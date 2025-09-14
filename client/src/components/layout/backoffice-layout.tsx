import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import BackofficeSidebar from './backoffice-sidebar';
import { SidebarProvider, useSidebar } from '@/hooks/use-sidebar';

interface BackofficeLayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

function BackofficeLayoutContent({ children, onLogout }: BackofficeLayoutProps) {
  const { isMobile, isOpen, toggleSidebar, closeSidebar } = useSidebar();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <BackofficeSidebar onLogout={onLogout} />
      
      {/* Overlay para mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isMobile ? 'ml-0' : 'ml-0'
      }`}>
        {/* Header mobile com botão do menu */}
        {isMobile && (
          <header className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-2 h-8 w-8"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">Backoffice</h1>
            <div className="w-8" /> {/* Spacer para centralizar o título */}
          </header>
        )}
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function BackofficeLayout({ children, onLogout }: BackofficeLayoutProps) {
  return (
    <SidebarProvider>
      <BackofficeLayoutContent onLogout={onLogout}>
        {children}
      </BackofficeLayoutContent>
    </SidebarProvider>
  );
}