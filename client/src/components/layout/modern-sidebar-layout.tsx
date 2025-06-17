import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  FileText, 
  UserCheck, 
  Settings, 
  LogOut,
  Menu,
  X,
  Home,
  Briefcase,
  UserCog,
  MessageCircle,
  CreditCard,
  BarChart3,
  ClipboardCheck,
  FileSearch,
  Bell,
  Search,
  Moon,
  Sun
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  userTypes?: string[];
}

interface ModernSidebarLayoutProps {
  children: React.ReactNode;
  title?: string;
  userType?: 'user' | 'investor' | 'admin';
}

export function ModernSidebarLayout({ children, title, userType = 'user' }: ModernSidebarLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Navigation items based on user type
  const getNavigationItems = (): NavigationItem[] => {
    if (userType === 'admin') {
      return [
        { name: 'Dashboard', href: '/backoffice/dashboard', icon: BarChart3 },
        { name: 'Aprovações', href: '/backoffice/approvals', icon: ClipboardCheck },
        { name: 'Empresas', href: '/backoffice/companies', icon: Building2 },
        { name: 'Solicitações', href: '/backoffice/credit-requests', icon: CreditCard },
        { name: 'Investidores', href: '/backoffice/investors', icon: UserCheck },
        { name: 'Rede', href: '/backoffice/network', icon: TrendingUp },
        { name: 'Mensagens', href: '/backoffice/messages', icon: MessageCircle },
        { name: 'Usuários', href: '/backoffice/admin-users', icon: Users },
        { name: 'Auditoria', href: '/backoffice/audit', icon: FileSearch },
      ];
    } else if (userType === 'investor') {
      return [
        { name: 'Dashboard', href: '/investor/dashboard', icon: Home },
        { name: 'Rede', href: '/investor/network', icon: TrendingUp },
        { name: 'Mensagens', href: '/messages', icon: MessageCircle },
        { name: 'Perfil', href: '/profile', icon: UserCog },
      ];
    } else {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Empresas', href: '/companies', icon: Building2 },
        { name: 'Solicitações', href: '/credit-requests', icon: CreditCard },
        { name: 'Mensagens', href: '/messages', icon: MessageCircle },
        { name: 'Perfil', href: '/profile', icon: UserCog },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const isActive = (href: string) => {
    return location === href || location.startsWith(href + '/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="sidebar-layout">
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div className="mobile-overlay" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <aside className={`
        sidebar
        ${isMobile ? 'mobile-sidebar' : ''}
        ${isMobile && isSidebarOpen ? 'mobile-sidebar-open' : ''}
        ${isMobile && !isSidebarOpen ? 'mobile-sidebar-closed' : ''}
      `}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Investme</h1>
              <p className="text-xs text-white/70">
                {userType === 'admin' ? 'Backoffice' : userType === 'investor' ? 'Investidor' : 'Empreendedor'}
              </p>
            </div>
          </div>
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={closeSidebar}
              className="text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link key={item.href} href={item.href} onClick={closeSidebar}>
                <div className={`sidebar-nav-item ${active ? 'active' : ''}`}>
                  <Icon className="sidebar-nav-icon" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="space-y-2">
            <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-white/5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <UserCog className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.nome || 'Usuário'}
                </p>
                <p className="text-xs text-white/70 truncate">
                  {user?.email || 'email@exemplo.com'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Main Header */}
        <header className="main-header">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {title || 'Dashboard'}
              </h1>
              <p className="text-sm text-muted-foreground">
                Bem-vindo ao sistema Investme
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
            </Button>

            {/* Theme Toggle */}
            <Button variant="ghost" size="sm">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        </header>

        {/* Main Body */}
        <main className="main-body">
          {children}
        </main>
      </div>
    </div>
  );
}