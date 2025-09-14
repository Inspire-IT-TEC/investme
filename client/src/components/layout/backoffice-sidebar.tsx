import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/hooks/use-sidebar";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  FileText, 
  UserCheck, 
  Settings, 
  LogOut,
  Menu,
  ChevronLeft,
  Home,
  Briefcase,
  UserCog,
  Clock
} from "lucide-react";

interface BackofficeSidebarProps {
  onLogout: () => void;
}

export default function BackofficeSidebar({ onLogout }: BackofficeSidebarProps) {
  const [location] = useLocation();
  const { isMobile, isOpen, isCollapsed, toggleSidebar, closeSidebar } = useSidebar();

  const menuItems = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/backoffice",
      active: location === "/backoffice"
    },
    {
      label: "Empresas",
      icon: Building2,
      href: "/backoffice/companies",
      active: location === "/backoffice/companies"
    },
    {
      label: "Solicitações",
      icon: FileText,
      href: "/backoffice/credit-requests",
      active: location === "/backoffice/credit-requests"
    },
    {
      label: "Investidores",
      icon: TrendingUp,
      href: "/backoffice/investors",
      active: location === "/backoffice/investors"
    },
    {
      label: "Empreendedores",
      icon: Briefcase,
      href: "/backoffice/entrepreneurs",
      active: location === "/backoffice/entrepreneurs"
    },
    {
      label: "Aprovações",
      icon: UserCheck,
      href: "/backoffice/approvals",
      active: location === "/backoffice/approvals"
    },
    {
      label: "Mudanças Pendentes",
      icon: Clock,
      href: "/backoffice/pending-changes",
      active: location === "/backoffice/pending-changes"
    },
    {
      label: "Rede",
      icon: Users,
      href: "/backoffice/network",
      active: location === "/backoffice/network"
    }
  ];

  return (
    <div className={`bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300 ${
      isMobile 
        ? `fixed left-0 top-0 z-50 shadow-lg transform ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          } w-64`
        : isCollapsed 
          ? 'w-16' 
          : 'w-64'
    }`}>
      {/* Header */}
      <div className={`border-b border-gray-200 flex items-center justify-between ${
        isMobile ? 'p-2' : 'p-4'
      }`}>
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <UserCog className={`text-blue-600 ${
              isMobile ? 'h-6 w-6' : 'h-8 w-8'
            }`} />
            <div>
              <h1 className={`font-bold text-gray-900 ${
                isMobile ? 'text-base' : 'text-lg'
              }`}>Backoffice</h1>
              <p className="text-xs text-gray-500">Investme Admin</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={`${
            isMobile ? 'p-1 h-6 w-6' : 'p-1 h-8 w-8'
          }`}
        >
          {isMobile ? (
            <ChevronLeft className="h-4 w-4" />
          ) : isCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 space-y-2 ${
        isMobile ? 'p-2' : 'p-4'
      }`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={item.active ? "default" : "ghost"}
                onClick={isMobile ? closeSidebar : undefined}
                className={`w-full justify-start ${
                  isMobile ? 'h-8' : 'h-10'
                } ${
                  item.active 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "text-gray-700 hover:bg-gray-100"
                } ${
                  isMobile ? 'px-3' : isCollapsed ? 'px-2' : 'px-3'
                }`}
              >
                <Icon className={`${
                  isMobile ? 'h-4 w-4' : 'h-4 w-4'
                } ${(isMobile || !isCollapsed) ? 'mr-3' : ''}`} />
                {(isMobile || !isCollapsed) && (
                  <span className={`font-medium ${
                    isMobile ? 'text-sm' : 'text-sm'
                  }`}>{item.label}</span>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`border-t border-gray-200 ${
        isMobile ? 'p-2' : 'p-4'
      }`}>
        <Button
          variant="ghost"
          onClick={() => {
            if (isMobile) closeSidebar();
            onLogout();
          }}
          className={`w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 ${
            isMobile ? 'h-8' : 'h-10'
          } ${
            isMobile ? 'px-3' : isCollapsed ? 'px-2' : 'px-3'
          }`}
        >
          <LogOut className={`${
            isMobile ? 'h-4 w-4' : 'h-4 w-4'
          } ${(isMobile || !isCollapsed) ? 'mr-3' : ''}`} />
          {(isMobile || !isCollapsed) && (
            <span className={`font-medium ${
              isMobile ? 'text-sm' : 'text-sm'
            }`}>Sair</span>
          )}
        </Button>
      </div>
    </div>
  );
}