import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Clock, CheckCircle, DollarSign, Users, UserCheck } from "lucide-react";
import BackofficeLayout from "@/components/layout/backoffice-layout";
import { useAuth, useRequireAdmin } from "@/hooks/use-auth";
import { useBackofficeNavigation } from "@/hooks/use-backoffice-navigation";

export default function BackofficeDashboard() {
  const { logout } = useAuth();
  const isAuthorized = useRequireAdmin();
  
  // Recarregar dados automaticamente ao navegar para esta tela
  useBackofficeNavigation();

  if (!isAuthorized) {
    return null; // Will redirect to login
  }
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: companies } = useQuery({
    queryKey: ["/api/admin/companies"],
  });

  const { data: creditRequests } = useQuery({
    queryKey: ["/api/admin/credit-requests"],
  });

  const { data: investors } = useQuery({
    queryKey: ["/api/admin/investors"],
  });

  const { data: pendingInvestors } = useQuery({
    queryKey: ["/api/admin/investors", "pendente"],
    queryFn: async () => {
      const response = await fetch('/api/admin/investors?status=pendente', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch pending investors');
      return response.json();
    },
  });

  const { data: pendingEntrepreneurs } = useQuery({
    queryKey: ["/api/admin/entrepreneurs", "pendente"],
    queryFn: async () => {
      const response = await fetch('/api/admin/entrepreneurs?status=pendente', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch pending entrepreneurs');
      return response.json();
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <BackofficeLayout onLogout={logout}>
      <div className="p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-lg p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Back Office - Investme</h1>
              <p className="text-gray-300 text-sm sm:text-base hidden sm:block">Interface administrativa para gestão de empresas e análise de crédito</p>
              <p className="text-gray-300 text-sm sm:hidden">Gestão administrativa</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 truncate">Empresas Cadastradas</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                        {isLoading ? "-" : (stats as any)?.totalCompanies || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 truncate">Análises Pendentes</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                        {isLoading ? "-" : (stats as any)?.pendingAnalysis || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 truncate">Aprovações (Mês)</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                        {isLoading ? "-" : (stats as any)?.monthlyApprovals || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                      <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 truncate">Volume Mensal</p>
                      <p className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900">
                        {isLoading ? "-" : formatCurrency((stats as any)?.monthlyVolume || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-200 sm:col-span-2 lg:col-span-1">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                      <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 truncate">Aprovações Pendentes</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                        {((pendingInvestors as any[])?.length || 0) + ((pendingEntrepreneurs as any[])?.length || 0)}
                      </p>
                      <p className="text-xs text-gray-500 hidden sm:block">
                        {(pendingInvestors as any[])?.length || 0} investidores, {(pendingEntrepreneurs as any[])?.length || 0} empreendedores
                      </p>
                      <p className="text-xs text-gray-500 sm:hidden">
                        {(pendingInvestors as any[])?.length || 0}inv, {(pendingEntrepreneurs as any[])?.length || 0}emp
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Recent Companies */}
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Empresas Recentes</CardTitle>
                  <CardDescription className="text-sm">Últimas empresas cadastradas</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {companies && (companies as any[]).length > 0 ? (
                    <div className="space-y-3">
                      {(companies as any[]).slice(0, 5).map((company: any) => (
                        <div key={company.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="min-w-0 flex-1 mr-3">
                            <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{company.razaoSocial}</p>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">{company.nomeFantasia}</p>
                          </div>
                          <Badge variant="outline" className="capitalize flex-shrink-0 text-xs">
                            {company.status || 'ativa'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4 text-sm">Nenhuma empresa encontrada</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Credit Requests */}
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Solicitações Recentes</CardTitle>
                  <CardDescription className="text-sm">Últimas solicitações de crédito</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {creditRequests && (creditRequests as any[]).length > 0 ? (
                    <div className="space-y-3">
                      {(creditRequests as any[]).slice(0, 5).map((request: any) => (
                        <div key={request.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="min-w-0 flex-1 mr-3">
                            <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{request.companyRazaoSocial}</p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {formatCurrency(parseFloat(request.valorSolicitado || 0))}
                            </p>
                          </div>
                          <Badge 
                            variant={request.status === 'aprovada' ? 'default' : 'secondary'}
                            className="capitalize flex-shrink-0 text-xs"
                          >
                            {request.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4 text-sm">Nenhuma solicitação encontrada</p>
                  )}
                </CardContent>
              </Card>
            </div>
        </div>
      </div>
    </BackofficeLayout>
  );
}