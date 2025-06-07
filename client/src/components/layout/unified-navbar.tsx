import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LogOut, 
  MessageCircle, 
  Building2, 
  TrendingUp, 
  Users, 
  Settings,
  User
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

interface UnifiedNavbarProps {
  userType: "investor" | "entrepreneur";
  userName: string;
  isCompanyApproved?: boolean;
}

export default function UnifiedNavbar({ userType, userName, isCompanyApproved = true }: UnifiedNavbarProps) {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();

  // Fetch unread messages count
  const { data: unreadCount } = useQuery({
    queryKey: [`/api/${userType}/unread-messages`],
    queryFn: async () => {
      const response = await fetch(`/api/${userType}/unread-messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) return 0;
      const data = await response.json();
      return data.count || 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const getNavItems = () => {
    if (userType === "investor") {
      return [
        {
          key: "home",
          label: "Início",
          icon: Building2,
          path: "/investor-dashboard"
        }
      ];
    } else {
      return [
        {
          key: "home",
          label: "Início",
          icon: Building2,
          path: "/dashboard"
        },
        {
          key: "dashboard",
          label: "Dashboard",
          icon: TrendingUp,
          path: "/dashboard"
        },
        {
          key: "messages",
          label: "Mensagens",
          icon: MessageCircle,
          path: "/messages",
          badge: unreadCount > 0 ? unreadCount : null
        },
        {
          key: "network",
          label: "Rede",
          icon: Users,
          path: "/network"
        }
      ];
    }
  };

  const navItems = getNavItems();

  const getNavbarColor = () => {
    return userType === "investor" 
      ? "bg-green-600 hover:bg-green-700" 
      : "bg-purple-600 hover:bg-purple-700";
  };

  return (
    <nav className={`${getNavbarColor()} text-white shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Building2 className="h-8 w-8" />
            <span className="text-xl font-bold">Investme</span>
            <span className="text-sm opacity-75">
              {userType === "investor" ? "Portal do Investidor" : "Portal do Empreendedor"}
            </span>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Button
                key={item.key}
                variant="ghost"
                size="sm"
                className={`text-white hover:bg-white/20 relative ${userType === "investor" ? "hover:bg-green-700/30" : "hover:bg-purple-700/30"}`}
                onClick={() => setLocation(item.path)}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
                {item.disabled && (
                  <span className="ml-2 text-xs opacity-75">(Pendente)</span>
                )}
              </Button>
            ))}
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            <span className="text-sm opacity-90">Olá, {userName}</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}