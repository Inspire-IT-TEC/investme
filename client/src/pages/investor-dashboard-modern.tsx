import { useQuery } from "@tanstack/react-query";
import { ModernCard, ModernCardContent, ModernCardHeader } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard,
  MessageCircle,
  Plus,
  ArrowUpRight,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  Users,
  BarChart3
} from "lucide-react";
import { ModernSidebarLayout } from "@/components/layout/modern-sidebar-layout";
import { Link } from "wouter";

export default function InvestorDashboard() {
  const { user } = useAuth();

  // Fetch investor stats
  const { data: stats } = useQuery({
    queryKey: ["/api/investor/stats"],
  });

  // Fetch available credit requests
  const { data: availableRequests = [] } = useQuery({
    queryKey: ["/api/investor/credit-requests"],
  });

  // Fetch investor's analysis history
  const { data: myAnalysis = [] } = useQuery({
    queryKey: ["/api/investor/my-analysis"],
  });

  // Fetch approved analysis
  const { data: approvedAnalysis = [] } = useQuery({
    queryKey: ["/api/investor/approved-analysis"],
  });

  // Fetch company status
  const { data: companyStatus } = useQuery({
    queryKey: ["/api/investor/company-status"],
  });

  // Fetch unread messages count
  const { data: unreadMessages } = useQuery({
    queryKey: ["/api/investor/unread-messages"],
    refetchInterval: 30000,
  });

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
    <ModernSidebarLayout title="Dashboard do Investidor" userType="investor">
      <div className="space-y-6">
        {/* Welcome Card */}
        <ModernCard variant="gradient" className="gradient-primary text-white shadow-xl">
          <ModernCardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Bem-vindo, {user?.nomeCompleto || user?.nome || 'Investidor'}
                  </h1>
                  <p className="text-white/80 text-lg">Analise e invista em oportunidades de crédito</p>
                </div>
              </div>
              <div className="hidden md:block text-right">
                <div className="text-white/80">Portal do Investidor</div>
                <div className="text-2xl font-bold">InvestMe</div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Company Status Alert */}
        {companyStatus && !(companyStatus as any)?.hasApprovedCompany && (
          <ModernCard className="border-warning bg-warning/5">
            <ModernCardContent>
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-warning-foreground font-medium">
                    Cadastro de empresa necessário
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Para analisar solicitações, você precisa ter uma empresa aprovada na plataforma.
                  </p>
                </div>
                <Link href="/investor-company-registration">
                  <Button variant="outline" size="sm">
                    Cadastrar Empresa
                  </Button>
                </Link>
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
                  <p className="text-sm font-medium text-muted-foreground">Disponíveis</p>
                  <p className="text-3xl font-bold text-foreground">
                    {(stats as any)?.availableRequests || 0}
                  </p>
                  <p className="text-xs text-primary">Solicitações</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard className="hover:shadow-lg transition-all duration-200">
            <ModernCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aceitas</p>
                  <p className="text-3xl font-bold text-foreground">
                    {(stats as any)?.acceptedRequests || 0}
                  </p>
                  <p className="text-xs text-success">Análises realizadas</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard className="hover:shadow-lg transition-all duration-200">
            <ModernCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                  <p className="text-3xl font-bold text-foreground">
                    {formatCurrency((stats as any)?.totalInvestmentValue || 0)}
                  </p>
                  <p className="text-xs text-primary">Analisado</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
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
                  <p className="text-xs text-primary">Não lidas</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-primary" />
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
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-3">
                <Link href="/investor/network">
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Ver Rede de Investimentos
                    <ArrowUpRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
                {!(companyStatus as any)?.hasApprovedCompany && (
                  <Link href="/investor-company-registration">
                    <Button className="w-full justify-start" variant="outline">
                      <Building2 className="w-4 h-4 mr-2" />
                      Cadastrar Empresa
                      <ArrowUpRight className="w-4 h-4 ml-auto" />
                    </Button>
                  </Link>
                )}
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

          {/* Investment Summary */}
          <ModernCard>
            <ModernCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Resumo de Investimentos</h3>
                  <p className="text-sm text-muted-foreground">Sua atividade na plataforma</p>
                </div>
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">Análises Aprovadas</p>
                      <p className="text-sm text-muted-foreground">
                        {Array.isArray(approvedAnalysis) ? approvedAnalysis.length : 0} solicitações
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium">Em Análise</p>
                      <p className="text-sm text-muted-foreground">
                        {Array.isArray(myAnalysis) ? myAnalysis.length : 0} solicitações
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Disponíveis</p>
                      <p className="text-sm text-muted-foreground">
                        {Array.isArray(availableRequests) ? availableRequests.length : 0} solicitações
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Available Requests */}
        {Array.isArray(availableRequests) && availableRequests.length > 0 && (
          <ModernCard>
            <ModernCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Solicitações Disponíveis</h3>
                  <p className="text-sm text-muted-foreground">Oportunidades de investimento</p>
                </div>
                <Link href="/investor/network">
                  <Button variant="outline" size="sm">
                    Ver Todas
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-3">
                {availableRequests.slice(0, 5).map((request: any) => (
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
                      <Link href={`/investor/network`}>
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

        {/* Recent Analysis */}
        {Array.isArray(myAnalysis) && myAnalysis.length > 0 && (
          <ModernCard>
            <ModernCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Minhas Análises Recentes</h3>
                  <p className="text-sm text-muted-foreground">Suas últimas análises realizadas</p>
                </div>
              </div>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-3">
                {myAnalysis.slice(0, 5).map((analysis: any) => (
                  <div key={analysis.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(analysis.status)}
                      <div>
                        <p className="font-medium">{formatCurrency(analysis.valorSolicitado)}</p>
                        <p className="text-sm text-muted-foreground">{analysis.empresa?.razaoSocial}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(analysis.status)}
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