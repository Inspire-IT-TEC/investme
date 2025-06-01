import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Bell, ChevronDown, Building2, CreditCard, User, LogOut, MessageCircle } from "lucide-react";
import { Link } from "wouter";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const getInitials = (name: string) => {
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Building2 },
    { name: 'Empresas', href: '/company-registration', icon: Building2 },
    { name: 'Mensagens', href: '/messages', icon: MessageCircle },
  ];

  const isActive = (href: string) => {
    return location === href || (href !== '/dashboard' && location.startsWith(href));
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary">Investme</h1>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive(item.href)
                          ? 'text-primary bg-primary/10'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {item.name}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0"
              >
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 px-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user ? getInitials(user.nomeCompleto) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-700 hidden md:block">
                    {user?.nomeCompleto}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user?.nomeCompleto}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center w-full">
                    <User className="w-4 h-4 mr-2" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile menu - to be implemented if needed */}
      <div className="md:hidden">
        {/* Mobile navigation would go here */}
      </div>
    </nav>
  );
}
