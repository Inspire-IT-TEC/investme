import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModernSidebarLayout } from "@/components/layout/modern-sidebar-layout";
import { Link } from "wouter";
import { CreditCard, Plus, Eye, Calendar, Building2, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function CreditRequests() {
  const { data: creditRequests, isLoading } = useQuery({
    queryKey: ["/api/credit-requests"],
    queryFn: () => {
      return fetch("/api/credit-requests", {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
  });

  const { data: companies } = useQuery({
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

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { 
        label: 'Pendente', 
        variant: 'secondary' as const, 
        icon: Clock,
        color: 'text-yellow-600'
      },
      'approved': { 
        label: 'Aprovada', 
        variant: 'default' as const, 
        icon: CheckCircle,
        color: 'text-green-600'
      },
      'rejected': { 
        label: 'Rejeitada', 
        variant: 'destructive' as const, 
        icon: XCircle,
        color: 'text-red-600'
      },
      'under_review': { 
        label: 'Em Análise', 
        variant: 'outline' as const, 
        icon: AlertCircle,
        color: 'text-blue-600'
      },
    };
    
    return statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'outline' as const, 
      icon: Clock,
      color: 'text-gray-600'
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getCompanyName = (companyId: number) => {
    if (!companies) return 'Carregando...';
    const company = companies.find((c: any) => c.id === companyId);
    return company?.razaoSocial || 'Empresa não encontrada';
  };

  if (isLoading) {
    return (
      <ModernSidebarLayout title="Solicitações" userType="user" theme="green">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando solicitações...</p>
          </div>
        </div>
      </ModernSidebarLayout>
    );
  }

  const hasApprovedCompany = companies && companies.some((company: any) => company.status === 'approved');

  return (
    <ModernSidebarLayout title="Solicitações" userType="user" theme="green">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-green-600" />
              Solicitações de Crédito
            </h1>
            <p className="text-muted-foreground mt-2">
              Acompanhe suas solicitações de crédito e seus status
            </p>
          </div>
          
          {hasApprovedCompany ? (
            <Link href="/nova-solicitacao">
              <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4" />
                Nova Solicitação
              </Button>
            </Link>
          ) : (
            <Button disabled className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Solicitação
            </Button>
          )}
        </div>

        {!hasApprovedCompany && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  Empresa pendente de aprovação
                </p>
                <p className="text-sm text-yellow-700">
                  Você precisa ter pelo menos uma empresa aprovada para solicitar crédito.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!creditRequests || creditRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma solicitação encontrada
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                {hasApprovedCompany 
                  ? "Você ainda não fez nenhuma solicitação de crédito. Comece agora para acessar financiamentos para sua empresa."
                  : "Aguarde a aprovação de sua empresa para poder solicitar crédito."
                }
              </p>
              {hasApprovedCompany && (
                <Link href="/nova-solicitacao">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Fazer Primeira Solicitação
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {creditRequests.map((request: any) => {
              const status = getStatusBadge(request.status || 'pending');
              const StatusIcon = status.icon;
              
              return (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          {getCompanyName(request.companyId)}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Solicitação #{request.id}
                        </CardDescription>
                      </div>
                      <Badge variant={status.variant} className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Valor Solicitado:</span>
                        <span className="font-semibold text-lg text-green-600">
                          {formatCurrency(request.valorSolicitado)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Prazo:</span>
                        <span className="font-medium">
                          {request.prazoMeses} meses
                        </span>
                      </div>
                      
                      {request.finalidade && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Finalidade:</span>
                          <span className="font-medium text-right max-w-[200px] truncate">
                            {request.finalidade}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Data da Solicitação:</span>
                        <span className="font-medium">
                          {formatDate(request.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
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