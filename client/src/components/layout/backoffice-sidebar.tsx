import { useState } from "react";
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
  Clock
} from "lucide-react";

interface BackofficeSidebarProps {
  onLogout: () => void;
}

export default function BackofficeSidebar({ onLogout }: BackofficeSidebarProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <UserCog className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Backoffice</h1>
              <p className="text-xs text-gray-500">Investme Admin</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 h-8 w-8"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={item.active ? "default" : "ghost"}
                className={`w-full justify-start h-10 ${
                  item.active 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "text-gray-700 hover:bg-gray-100"
                } ${isCollapsed ? 'px-2' : 'px-3'}`}
              >
                <Icon className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={onLogout}
          className={`w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 ${
            isCollapsed ? 'px-2' : 'px-3'
          }`}
        >
          <LogOut className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
        </Button>
      </div>
    </div>
  );
}