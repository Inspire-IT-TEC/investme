import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
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
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

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
  theme?: 'blue' | 'green';
}

export function ModernSidebarLayout({ children, title, userType = 'user', theme = 'blue' }: ModernSidebarLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { theme: currentTheme, setTheme } = useTheme();

  // Get user notifications
  const { data: notifications } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: () => {
      return fetch('/api/notifications', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get unread count
  const { data: unreadCount } = useQuery({
    queryKey: ['/api/notifications/unread/count'],
    queryFn: () => {
      return fetch('/api/notifications/unread/count', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Erro ao marcar notificação como lida');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread/count'] });
    },
  });

  // Theme-specific classes
  const getThemeClasses = () => {
    if (theme === 'green') {
      return {
        sidebarBg: 'bg-green-950',
        iconBg: 'bg-green-800',
        activeItem: 'bg-green-600 text-white',
        cardAccent: 'bg-green-100',
        primaryColor: 'text-green-600'
      };
    }
    return {
      sidebarBg: 'bg-[hsl(var(--sidebar-background))]',
      iconBg: 'bg-white/20',
      activeItem: 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]',
      cardAccent: 'bg-blue-100',
      primaryColor: 'text-primary'
    };
  };

  const themeClasses = getThemeClasses();

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
        { name: 'Notificações', href: '/backoffice/notifications', icon: Bell }, // Notifications management
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
        flex flex-col w-64 ${themeClasses.sidebarBg} text-white transition-all duration-300 ease-in-out
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
                <div className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:bg-white/10 hover:text-white ${
                  active ? themeClasses.activeItem : ''
                }`}>
                  <Icon className="w-5 h-5 mr-3 transition-transform duration-200" />
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
              <h1 className="text-lg md:text-2xl font-bold text-foreground truncate">
                {title || 'Dashboard'}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                Bem-vindo ao sistema Investme
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Search Button */}
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative p-2">
                  <Bell className="h-4 w-4" />
                  {unreadCount?.count > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 text-[10px] md:text-xs min-w-[16px] md:min-w-[20px]"
                    >
                      {unreadCount.count > 99 ? '99+' : unreadCount.count}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 md:w-80 p-0" align="end">
                <div className="p-4 border-b">
                  <h4 className="font-semibold text-sm">Notificações</h4>
                  {unreadCount?.count > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {unreadCount.count} não {unreadCount.count === 1 ? 'lida' : 'lidas'}
                    </p>
                  )}
                </div>
                <ScrollArea className="max-h-80">
                  {!notifications || notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Nenhuma notificação
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {notifications.map((notification: any) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-3 hover:bg-muted/50 cursor-pointer border-b border-border/50 last:border-b-0",
                            !notification.lida && "bg-blue-50 dark:bg-blue-950/20"
                          )}
                          onClick={() => {
                            if (!notification.lida) {
                              markAsReadMutation.mutate(notification.id);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-sm truncate">
                                {notification.titulo}
                              </h5>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notification.conteudo}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(notification.createdAt).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            {!notification.lida && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>

            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setTheme(currentTheme === "light" ? "dark" : "light")}
              className="relative p-2"
            >
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