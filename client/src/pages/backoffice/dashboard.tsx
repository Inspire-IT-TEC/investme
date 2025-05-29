import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Clock, CheckCircle, DollarSign } from "lucide-react";
import BackofficeNavbar from "@/components/layout/backoffice-navbar";

export default function BackofficeDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: companies } = useQuery({
    queryKey: ["/api/admin/companies"],
  });

  const { data: creditRequests } = useQuery({
    queryKey: ["/api/admin/credit-requests"],
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
    <div className="min-h-screen bg-gray-50">
      <BackofficeNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">Back Office - Investme</h1>
          <p className="text-gray-300">Interface administrativa para gestão de empresas e análise de crédito</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Empresas Cadastradas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? "-" : stats?.totalCompanies || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Análises Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? "-" : stats?.pendingAnalysis || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Aprovações (Mês)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? "-" : stats?.monthlyApprovals || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Volume (Mês)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? "-" : formatCurrency(stats?.monthlyVolume || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Companies */}
          <Card>
            <CardHeader>
              <CardTitle>Empresas Recentes</CardTitle>
              <CardDescription>Últimas empresas cadastradas</CardDescription>
            </CardHeader>
            <CardContent>
              {companies && companies.length > 0 ? (
                <div className="space-y-4">
                  {companies.slice(0, 5).map((company: any) => (
                    <div key={company.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{company.razaoSocial}</p>
                        <p className="text-sm text-gray-600">{company.cnpj}</p>
                      </div>
                      <Badge 
                        variant={company.status === 'aprovada' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {company.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhuma empresa cadastrada</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Credit Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Solicitações Recentes</CardTitle>
              <CardDescription>Últimas solicitações de crédito</CardDescription>
            </CardHeader>
            <CardContent>
              {creditRequests && creditRequests.length > 0 ? (
                <div className="space-y-4">
                  {creditRequests.slice(0, 5).map((request: any) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{request.companyRazaoSocial}</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(parseFloat(request.valorSolicitado || 0))}
                        </p>
                      </div>
                      <Badge 
                        variant={request.status === 'aprovada' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhuma solicitação encontrada</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
