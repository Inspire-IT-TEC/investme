import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { ChevronDown, Building2, CreditCard, BarChart3, User, LogOut, Shield } from "lucide-react";
import { Link } from "wouter";

export default function BackofficeNavbar() {
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
    { name: 'Dashboard', href: '/backoffice/dashboard', icon: BarChart3 },
    { name: 'Empresas', href: '/backoffice/companies', icon: Building2 },
    { name: 'Solicitações', href: '/backoffice/credit-requests', icon: CreditCard },
  ];

  const isActive = (href: string) => {
    return location === href;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center">
            <Link href="/backoffice/dashboard" className="flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-gray-800" />
                <h1 className="text-2xl font-bold text-gray-800">Investme</h1>
                <span className="text-sm bg-gray-800 text-white px-2 py-1 rounded">Back Office</span>
              </div>
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
                          ? 'text-gray-900 bg-gray-100'
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
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 px-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gray-800 text-white text-sm">
                      {user ? getInitials(user.nome || user.nomeCompleto || 'Admin') : 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-700 hidden md:block">
                    {user?.nome || user?.nomeCompleto || 'Administrador'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user?.nome || user?.nomeCompleto || 'Administrador'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <div className="flex items-center mt-1">
                    <Shield className="w-3 h-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">Administrador</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/backoffice/profile" className="flex items-center w-full">
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
