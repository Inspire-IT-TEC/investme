import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, CreditCard, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: companies, isLoading } = useQuery({
    queryKey: ["/api/companies"],
  });

  const { data: creditRequests } = useQuery({
    queryKey: ["/api/credit-requests"],
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente_analise: { label: "Pendente de Análise", variant: "secondary" as const, icon: Clock },
      em_analise: { label: "Em Análise", variant: "secondary" as const, icon: Clock },
      aprovada: { label: "Aprovada", variant: "default" as const, icon: CheckCircle },
      reprovada: { label: "Reprovada", variant: "destructive" as const, icon: AlertCircle },
      incompleto: { label: "Incompleto", variant: "secondary" as const, icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente_analise;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="investme-gradient text-white rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo, {user?.nomeCompleto}</h1>
          <p className="text-blue-100">Gerencie suas empresas e solicitações de crédito</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Companies Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Minhas Empresas
                </CardTitle>
                <CardDescription>
                  Gerencie suas empresas cadastradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : companies && companies.length > 0 ? (
                  <div className="space-y-4">
                    {companies.map((company: any) => (
                      <div key={company.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{company.razaoSocial}</h4>
                            <p className="text-sm text-gray-600">{company.cnpj}</p>
                            <div className="mt-2">
                              {getStatusBadge(company.status)}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {company.status === 'aprovada' && (
                              <Link href={`/credit-request/${company.id}`}>
                                <Button size="sm">
                                  <CreditCard className="w-4 h-4 mr-1" />
                                  Solicitar Crédito
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Nenhuma empresa cadastrada</p>
                  </div>
                )}

                <Link href="/company-registration">
                  <Button 
                    variant="outline" 
                    className="w-full mt-6 border-dashed border-2 h-16 text-gray-600 hover:text-primary hover:border-primary"
                  >
                    <Plus className="w-6 h-6 mr-2" />
                    Cadastrar Nova Empresa
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/company-registration">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="w-4 h-4 mr-2" />
                    Nova Empresa
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status do Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cadastro Completo</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email Confirmado</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Documentos Verificados</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Credit Requests */}
        {creditRequests && creditRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Crédito Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Empresa</th>
                      <th className="text-left p-2">Valor</th>
                      <th className="text-left p-2">Data</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creditRequests.slice(0, 5).map((request: any) => (
                      <tr key={request.id} className="border-b">
                        <td className="p-2 font-medium">{request.companyRazaoSocial}</td>
                        <td className="p-2">R$ {parseFloat(request.valorSolicitado).toLocaleString('pt-BR')}</td>
                        <td className="p-2">{new Date(request.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td className="p-2">{getStatusBadge(request.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
