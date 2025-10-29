import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModernSidebarLayout } from "@/components/layout/modern-sidebar-layout";
import { Link } from "wouter";
import { Building2, Plus, Eye, Edit, Calendar, MapPin, FileText, Users, TrendingUp, AlertCircle } from "lucide-react";

export default function Companies() {
  const { data: companies, isLoading } = useQuery({
    queryKey: ["/api/companies"],
    queryFn: () => {
      return fetch("/api/companies", {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
  });

  // Fetch entrepreneur profile
  const { data: entrepreneurProfile } = useQuery({
    queryKey: ["/api/entrepreneur/profile"],
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'Pendente', variant: 'secondary' as const },
      'approved': { label: 'Aprovada', variant: 'default' as const },
      'rejected': { label: 'Rejeitada', variant: 'destructive' as const },
      'under_review': { label: 'Em Análise', variant: 'outline' as const },
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <ModernSidebarLayout title="Empresas" userType="user" theme="green">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando empresas...</p>
          </div>
        </div>
      </ModernSidebarLayout>
    );
  }

  return (
    <ModernSidebarLayout title="Empresas" userType="user" theme="green">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Building2 className="h-8 w-8 text-green-600" />
              Minhas Empresas
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas empresas cadastradas na plataforma
            </p>
          </div>
          <Link href="/company-registration">
            <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4" />
              Nova Empresa
            </Button>
          </Link>
        </div>

        {/* Incomplete Profile Alert - Missing Address */}
        {entrepreneurProfile && (
          !(entrepreneurProfile as any)?.cep || 
          !(entrepreneurProfile as any)?.rua || 
          !(entrepreneurProfile as any)?.numero || 
          !(entrepreneurProfile as any)?.bairro || 
          !(entrepreneurProfile as any)?.cidade || 
          !(entrepreneurProfile as any)?.estado
        ) && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-blue-800 font-medium">
                      Complete seu perfil para ter acesso a todas as funcionalidades
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Faltam informações de endereço no seu cadastro
                    </p>
                  </div>
                </div>
                <Link href="/profile">
                  <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700" data-testid="button-complete-profile">
                    Completar Perfil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {!companies || companies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma empresa cadastrada
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Cadastre sua primeira empresa para começar a solicitar crédito e acessar nossos serviços.
              </p>
              <Link href="/company-registration">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeira Empresa
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {companies.map((company: any) => {
              const status = getStatusBadge(company.status || 'pending');
              
              return (
                <Card key={company.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl font-semibold text-gray-900 mb-1 leading-tight">
                          {company.razaoSocial}
                        </CardTitle>
                        {company.nomeFantasia && (
                          <p className="text-sm text-gray-600 mb-2">
                            {company.nomeFantasia}
                          </p>
                        )}
                        <CardDescription className="text-sm">
                          CNPJ: {company.cnpj}
                        </CardDescription>
                      </div>
                      <Badge variant={status.variant} className="ml-3 flex-shrink-0">
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{company.cidade}, {company.estado}</span>
                        </div>
                        
                        {company.setor && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span>{company.setor}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>Cadastrada em {formatDate(company.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {company.numeroFuncionarios && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{company.numeroFuncionarios} funcionários</span>
                          </div>
                        )}
                        
                        {company.faturamento && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <TrendingUp className="h-4 w-4 text-gray-400" />
                            <span>Faturamento: R$ {parseFloat(company.faturamento).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {company.descricaoNegocio && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                          {company.descricaoNegocio}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Link href={`/empresa/${company.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </Link>
                      
                      <Link href={`/empresa/${company.id}/editar`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ModernSidebarLayout>
  );
}