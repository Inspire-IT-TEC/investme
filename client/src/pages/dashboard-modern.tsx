import { useQuery } from "@tanstack/react-query";
import { ModernCard, ModernCardContent, ModernCardHeader } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { 
  Building2, 
  DollarSign, 
  CreditCard,
  MessageCircle,
  Plus,
  ArrowUpRight,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { ModernSidebarLayout } from "@/components/layout/modern-sidebar-layout";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();

  // Fetch companies
  const { data: companies = [], isLoading: loadingCompanies } = useQuery({
    queryKey: ["/api/companies"],
  });

  // Fetch credit requests
  const { data: creditRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["/api/credit-requests"],
  });

  // Fetch entrepreneur profile
  const { data: entrepreneurProfile } = useQuery({
    queryKey: ["/api/entrepreneur/profile"],
  });

  // Fetch unread messages count
  const { data: unreadMessages } = useQuery({
    queryKey: ["/api/entrepreneur/unread-messages"],
    refetchInterval: 30000,
  });

  // Calculate stats
  const totalCompanies = Array.isArray(companies) ? companies.length : 0;
  const approvedCompanies = Array.isArray(companies) ? companies.filter((c: any) => c.status === 'aprovada').length : 0;
  const totalRequests = Array.isArray(creditRequests) ? creditRequests.length : 0;
  const totalRequestedValue = Array.isArray(creditRequests) ? creditRequests.reduce((sum: number, req: any) => sum + parseFloat(req.valorSolicitado || 0), 0) : 0;
  const unreadCount = (unreadMessages as any)?.count || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovada':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'em_analise':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'reprovada':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente_analise: { label: "Pendente", className: "status-info" },
      em_analise: { label: "Em Análise", className: "status-warning" },
      aprovada: { label: "Aprovada", className: "status-success" },
      reprovada: { label: "Reprovada", className: "status-error" },
      incompleto: { label: "Incompleto", className: "status-neutral" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente_analise;
    
    return (
      <span className={`status-indicator ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <ModernSidebarLayout title="Dashboard" userType="user" theme="green">
      <div className="space-y-6">
        {/* Welcome Card */}
        <ModernCard variant="gradient" className="gradient-primary-green text-white shadow-xl">
          <ModernCardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Bem-vindo, {user?.nomeCompleto || user?.nome || 'Empreendedor'}
                  </h1>
                  <p className="text-white/80 text-lg">Gerencie suas empresas e solicitações de crédito</p>
                </div>
              </div>
              <div className="hidden md:block text-right">
                <div className="text-white/80">Portal do Empreendedor</div>
                <div className="text-2xl font-bold">InvestMe</div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Profile Status Alert */}
        {entrepreneurProfile && (
          !(entrepreneurProfile as any)?.cadastroAprovado || 
          !(entrepreneurProfile as any)?.emailConfirmado || 
          !(entrepreneurProfile as any)?.documentosVerificados
        ) && (
          <ModernCard className="border-amber-200 bg-amber-50">
            <ModernCardContent>
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <p className="text-amber-800">
                  Seu perfil está em processo de validação. Algumas funcionalidades podem estar limitadas até a aprovação completa.
                </p>
              </div>
            </ModernCardContent>
          </ModernCard>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernCard className="hover:shadow-lg transition-all duration-200">
            <ModernCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Empresas</p>
                  <p className="text-3xl font-bold text-foreground">{totalCompanies}</p>
                  <p className="text-xs text-success">{approvedCompanies} aprovadas</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard className="hover:shadow-lg transition-all duration-200">
            <ModernCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Solicitações</p>
                  <p className="text-3xl font-bold text-foreground">{totalRequests}</p>
                  <p className="text-xs text-green-600">Total enviadas</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard className="hover:shadow-lg transition-all duration-200">
            <ModernCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                  <p className="text-3xl font-bold text-foreground">{formatCurrency(totalRequestedValue)}</p>
                  <p className="text-xs text-green-600">Solicitado</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard className="hover:shadow-lg transition-all duration-200">
            <ModernCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mensagens</p>
                  <p className="text-3xl font-bold text-foreground">{unreadCount}</p>
                  <p className="text-xs text-green-600">Não lidas</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
                  )}
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ModernCard>
            <ModernCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Ações Rápidas</h3>
                  <p className="text-sm text-muted-foreground">Acesse as principais funcionalidades</p>
                </div>
                <Activity className="h-5 w-5 text-green-600" />
              </div>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-3">
                <Link href="/company-registration">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Empresa
                    <ArrowUpRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
                <Link href="/nova-solicitacao">
                  <Button className="w-full justify-start" variant="outline">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Solicitar Crédito
                    <ArrowUpRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button className="w-full justify-start" variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Ver Mensagens
                    <ArrowUpRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
              </div>
            </ModernCardContent>
          </ModernCard>

          {/* Status do Perfil */}
          <ModernCard>
            <ModernCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Status do Perfil</h3>
                  <p className="text-sm text-muted-foreground">Validação do seu cadastro</p>
                </div>
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {(entrepreneurProfile as any)?.cadastroAprovado ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <Clock className="w-5 h-5 text-warning" />
                    )}
                    <div>
                      <p className="font-medium">Cadastro</p>
                      <p className="text-sm text-muted-foreground">
                        {(entrepreneurProfile as any)?.cadastroAprovado ? 'Aprovado' : 'Pendente'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {(entrepreneurProfile as any)?.emailConfirmado ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <Clock className="w-5 h-5 text-warning" />
                    )}
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {(entrepreneurProfile as any)?.emailConfirmado ? 'Confirmado' : 'Pendente'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {(entrepreneurProfile as any)?.documentosVerificados ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <Clock className="w-5 h-5 text-warning" />
                    )}
                    <div>
                      <p className="font-medium">Documentos</p>
                      <p className="text-sm text-muted-foreground">
                        {(entrepreneurProfile as any)?.documentosVerificados ? 'Verificados' : 'Pendente'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Recent Companies */}
        {Array.isArray(companies) && companies.length > 0 && (
          <ModernCard>
            <ModernCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Empresas Recentes</h3>
                  <p className="text-sm text-muted-foreground">Suas últimas empresas cadastradas</p>
                </div>
                <Link href="/companies">
                  <Button variant="outline" size="sm">
                    Ver Todas
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-3">
                {companies.slice(0, 5).map((company: any) => (
                  <div key={company.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(company.status)}
                      <div>
                        <p className="font-medium">{company.razaoSocial}</p>
                        <p className="text-sm text-muted-foreground">{company.cnpj}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(company.status)}
                      <Link href={`/company/${company.id}`}>
                        <Button variant="ghost" size="sm">
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </ModernCardContent>
          </ModernCard>
        )}

        {/* Recent Credit Requests */}
        {Array.isArray(creditRequests) && creditRequests.length > 0 && (
          <ModernCard>
            <ModernCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Solicitações Recentes</h3>
                  <p className="text-sm text-muted-foreground">Suas últimas solicitações de crédito</p>
                </div>
                <Link href="/credit-requests">
                  <Button variant="outline" size="sm">
                    Ver Todas
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-3">
                {creditRequests.slice(0, 5).map((request: any) => (
                  <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <p className="font-medium">{formatCurrency(request.valorSolicitado)}</p>
                        <p className="text-sm text-muted-foreground">{request.empresa?.razaoSocial}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(request.status)}
                      <Link href={`/credit-request/${request.id}`}>
                        <Button variant="ghost" size="sm">
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </ModernCardContent>
          </ModernCard>
        )}
      </div>
    </ModernSidebarLayout>
  );
}