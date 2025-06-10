import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, CreditCard, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import UnifiedNavbar from "@/components/layout/unified-navbar";
import { Link } from "wouter";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: companies, isLoading } = useQuery({
    queryKey: ["/api/companies"],
  });

  const { data: creditRequests } = useQuery({
    queryKey: ["/api/credit-requests"],
  });

  // Fetch entrepreneur profile data for status display
  const { data: entrepreneurProfile } = useQuery({
    queryKey: ["/api/entrepreneur/profile"],
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
    <div className="min-h-screen bg-slate-50">
      <UnifiedNavbar 
        userType="entrepreneur" 
        userName={user?.nomeCompleto || user?.nome || "Empreendedor"}
        isCompanyApproved={true}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold mb-1">Bem-vindo, {user?.nomeCompleto}</h1>
              <p className="text-blue-100 text-sm">Gerencie suas empresas e solicitações de crédito</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {/* Companies Section */}
          <div className="lg:col-span-3">
            <Card className="shadow-sm border border-slate-200">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg py-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5" />
                  Minhas Empresas
                </CardTitle>
                <CardDescription className="text-blue-100 text-sm">
                  Gerencie suas empresas cadastradas
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : companies && Array.isArray(companies) && companies.length > 0 ? (
                  <div className="space-y-3">
                    {companies.map((company: any) => (
                      <div key={company.id} className="border border-slate-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-base">{company.razaoSocial}</h4>
                            <p className="text-sm text-gray-500">{company.cnpj}</p>
                            <div className="mt-2">
                              {getStatusBadge(company.status)}
                            </div>
                          </div>
                          <div>
                            {company.status === 'aprovada' && (
                              <Link href={`/credit-request/${company.id}`}>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
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
                  <div className="text-center py-6">
                    <Building2 className="w-10 h-10 mx-auto mb-3 text-blue-400" />
                    <p className="text-gray-500 text-sm">Nenhuma empresa cadastrada</p>
                  </div>
                )}

                <Link href="/company-registration">
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 border-dashed border-2 h-12 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Nova Empresa
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="shadow-sm border border-slate-200">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg py-3">
                <CardTitle className="text-base">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <Link href="/company-registration">
                  <Button variant="outline" className="w-full justify-start text-sm border-blue-300 text-blue-600 hover:bg-blue-50">
                    <Building2 className="w-4 h-4 mr-2" />
                    Nova Empresa
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-slate-200">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg py-3">
                <CardTitle className="text-base">Status do Perfil</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Cadastro Completo</span>
                    {entrepreneurProfile?.cadastroAprovado ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Email Confirmado</span>
                    {entrepreneurProfile?.emailConfirmado ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Documentos Verificados</span>
                    {entrepreneurProfile?.documentosVerificados ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  {(!entrepreneurProfile?.cadastroAprovado || !entrepreneurProfile?.emailConfirmado || !entrepreneurProfile?.documentosVerificados) && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-xs text-blue-700">
                        Aguardando validação pelo backoffice
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Credit Requests */}
        {creditRequests && Array.isArray(creditRequests) && creditRequests.length > 0 && (
          <Card className="shadow-sm border border-slate-200">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg py-4">
              <CardTitle className="text-lg">Solicitações de Crédito Recentes</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Empresa</th>
                      <th className="text-left p-2">Valor</th>
                      <th className="text-left p-2">Data</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Aprovado por</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creditRequests.slice(0, 5).map((request: any) => (
                      <tr key={request.id} className="border-b">
                        <td className="p-2 font-medium">{request.companyRazaoSocial || 'Nome não disponível'}</td>
                        <td className="p-2">R$ {parseFloat(request.valorSolicitado).toLocaleString('pt-BR')}</td>
                        <td className="p-2">{new Date(request.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td className="p-2">{getStatusBadge(request.status)}</td>
                        <td className="p-2 text-sm text-gray-600">
                          {request.status === 'aprovada' && request.approvingCompanyName 
                            ? request.approvingCompanyName 
                            : '-'
                          }
                        </td>
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
