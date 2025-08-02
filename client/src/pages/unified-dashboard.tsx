import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { 
  Building, 
  TrendingUp, 
  Users, 
  ChevronRight, 
  Plus,
  BarChart3,
  FileText,
  Settings,
  Bell,
  Crown
} from "lucide-react";

interface User {
  id: number;
  nomeCompleto: string;
  email: string;
  userTypes: string[];
  entrepreneurApproved: boolean;
  investorApproved: boolean;
  status: string;
}

interface DashboardStats {
  companies: number;
  creditRequests: number;
  investments: number;
  networkConnections: number;
}

export default function UnifiedDashboard() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Get user from token
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/auth/me'],
  });

  // Get dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    enabled: !!user
  });

  useEffect(() => {
    // Determine active tab based on URL or user type
    if (location.includes('entrepreneur')) {
      setActiveTab('entrepreneur');
    } else if (location.includes('investor')) {
      setActiveTab('investor');
    }
  }, [location]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation('/login');
    return null;
  }

  const isEntrepreneur = user.userTypes?.includes('entrepreneur');
  const isInvestor = user.userTypes?.includes('investor');
  const isBoth = isEntrepreneur && isInvestor;

  const entrepreneurActions = [
    {
      title: 'Cadastrar Empresa',
      description: 'Registre uma nova empresa na plataforma',
      icon: Building,
      route: '/entrepreneur-company-register',
      color: 'bg-blue-600'
    },
    {
      title: 'Solicitar Crédito',
      description: 'Crie uma nova solicitação de crédito',
      icon: FileText,
      route: '/entrepreneur-credit-request',
      color: 'bg-green-600'
    },
    {
      title: 'Minhas Empresas',
      description: 'Gerencie suas empresas cadastradas',
      icon: Building,
      route: '/entrepreneur-companies',
      color: 'bg-purple-600'
    }
  ];

  const investorActions = [
    {
      title: 'Explorar Oportunidades',
      description: 'Encontre empresas para investir',
      icon: TrendingUp,
      route: '/investor-opportunities',
      color: 'bg-emerald-600'
    },
    {
      title: 'Minhas Análises',
      description: 'Acompanhe suas análises de investimento',
      icon: BarChart3,
      route: '/investor-analysis',
      color: 'bg-orange-600'
    },
    {
      title: 'Portfolio',
      description: 'Visualize seus investimentos',
      icon: TrendingUp,
      route: '/investor-portfolio',
      color: 'bg-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Olá, {user.nomeCompleto.split(' ')[0]}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                {isEntrepreneur && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    <Building className="w-3 h-3 mr-1" />
                    Empreendedor
                  </Badge>
                )}
                {isInvestor && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Investidor
                  </Badge>
                )}
                {isBoth && (
                  <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Perfil Premium
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setLocation('/settings')}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            {isEntrepreneur && (
              <TabsTrigger value="entrepreneur">Empreendedor</TabsTrigger>
            )}
            {isInvestor && (
              <TabsTrigger value="investor">Investidor</TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Empresas</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.companies || 0}</div>
                  <p className="text-xs text-muted-foreground">empresas cadastradas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Crédito</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.creditRequests || 0}</div>
                  <p className="text-xs text-muted-foreground">solicitações ativas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Investimentos</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.investments || 0}</div>
                  <p className="text-xs text-muted-foreground">oportunidades</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Network</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.networkConnections || 0}</div>
                  <p className="text-xs text-muted-foreground">conexões</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              {isEntrepreneur && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="w-5 h-5 mr-2 text-blue-600" />
                      Ações Empreendedor
                    </CardTitle>
                    <CardDescription>
                      Gerencie suas empresas e solicitações de crédito
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {entrepreneurActions.slice(0, 2).map((action, index) => {
                      const IconComponent = action.icon;
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-start h-auto py-3"
                          onClick={() => setLocation(action.route)}
                        >
                          <div className={`${action.color} p-2 rounded-md mr-3`}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{action.title}</div>
                            <div className="text-sm text-gray-500">{action.description}</div>
                          </div>
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </Button>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {isInvestor && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                      Ações Investidor
                    </CardTitle>
                    <CardDescription>
                      Explore oportunidades e gerencie investimentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {investorActions.slice(0, 2).map((action, index) => {
                      const IconComponent = action.icon;
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-start h-auto py-3"
                          onClick={() => setLocation(action.route)}
                        >
                          <div className={`${action.color} p-2 rounded-md mr-3`}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{action.title}</div>
                            <div className="text-sm text-gray-500">{action.description}</div>
                          </div>
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </Button>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Entrepreneur Tab */}
          {isEntrepreneur && (
            <TabsContent value="entrepreneur" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {entrepreneurActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(action.route)}>
                      <CardHeader>
                        <div className={`${action.color} p-3 rounded-lg w-fit`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-lg">{action.title}</CardTitle>
                        <CardDescription>{action.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full" variant="outline">
                          Acessar
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          )}

          {/* Investor Tab */}
          {isInvestor && (
            <TabsContent value="investor" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {investorActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(action.route)}>
                      <CardHeader>
                        <div className={`${action.color} p-3 rounded-lg w-fit`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-lg">{action.title}</CardTitle>
                        <CardDescription>{action.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full" variant="outline">
                          Acessar
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Add User Type CTA */}
        {!isBoth && (
          <Card className="mt-8 border-dashed border-2 border-gray-300 dark:border-gray-600">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full mb-4">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expanda seu Perfil</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6 max-w-md">
                {isEntrepreneur 
                  ? "Torne-se também um investidor e explore oportunidades de investimento na plataforma." 
                  : "Registre também como empreendedor e cadastre suas empresas na plataforma."}
              </p>
              <Button 
                onClick={() => setLocation(isEntrepreneur ? '/add-investor-profile' : '/add-entrepreneur-profile')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isEntrepreneur ? 'Adicionar Perfil de Investidor' : 'Adicionar Perfil de Empreendedor'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}