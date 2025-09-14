import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Building2, 
  Edit, 
  Calculator, 
  TrendingUp, 
  History, 
  FileText, 
  DollarSign,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Plus,
  Menu,
  ExternalLink,
  CreditCard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const CompanyDetailPage = () => {
  const [, params] = useRoute("/empresa/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Detectar mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const companyId = params?.id ? parseInt(params.id) : null;

  // Fetch company data
  const { data: company, isLoading } = useQuery({
    queryKey: [`/api/companies/${companyId}`],
    enabled: !!companyId,
  });

  // Fetch company valuations
  const { data: valuations } = useQuery({
    queryKey: [`/api/companies/${companyId}/valuations`],
    enabled: !!companyId,
  });

  // Fetch latest valuation
  const { data: latestValuation } = useQuery({
    queryKey: [`/api/companies/${companyId}/valuations/latest`],
    enabled: !!companyId,
  });

  // Fetch credit requests for this company
  const { data: creditRequests } = useQuery({
    queryKey: ["/api/companies", companyId, "credit-requests"],
    enabled: !!companyId,
  });

  // Delete valuation mutation
  const deleteValuationMutation = useMutation({
    mutationFn: async (valuationId: number) => {
      return apiRequest("DELETE", `/api/valuations/${valuationId}`);
    },
    onSuccess: () => {
      toast({ title: "Valuation excluído com sucesso" });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/valuations`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/valuations/latest`] });
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir valuation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'aprovada': { label: 'Aprovada', variant: 'default' as const },
      'pendente': { label: 'Pendente', variant: 'secondary' as const },
      'rejeitada': { label: 'Rejeitada', variant: 'destructive' as const },
      'em_analise': { label: 'Em Análise', variant: 'outline' as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getValuationStatusBadge = (status: string) => {
    return status === "completed" ? (
      <Badge variant="default">Concluído</Badge>
    ) : (
      <Badge variant="secondary">Rascunho</Badge>
    );
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'Data não informada';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      
      return date.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Empresa não encontrada</p>
          <Button 
            variant="outline" 
            onClick={() => setLocation("/dashboard")}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Componente das tabs mobile
  const MobileTabs = () => (
    <div className="bg-white rounded-lg border border-gray-200 sticky top-16 z-10">
      <div className="overflow-x-auto">
        <div className="flex space-x-1 p-2 min-w-max">
          {[
            { value: 'overview', label: 'Geral', icon: Building2 },
            { value: 'financials', label: 'Financeiro', icon: DollarSign },
            { value: 'valuations', label: 'Valuations', icon: TrendingUp },
            { value: 'credit', label: 'Crédito', icon: CreditCard }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.value}
                variant={activeTab === tab.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.value)}
                className={`whitespace-nowrap flex items-center space-x-1 flex-shrink-0 ${
                  activeTab === tab.value 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                data-testid={`tab-${tab.value}`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Componente do conteúdo das tabs
  const TabContent = ({ tabValue, children }: { tabValue: string; children: React.ReactNode }) => {
    if (isMobile && activeTab !== tabValue) return null;
    return <div className="space-y-4">{children}</div>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile-First */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation("/dashboard")}
              size="sm"
              className="p-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex-1 mx-3 min-w-0">
              <h1 className={`font-bold text-gray-900 truncate ${
                isMobile ? 'text-lg' : 'text-xl'
              }`} data-testid="text-company-name">
                {(company as any)?.razaoSocial || 'Empresa'}
              </h1>
              {(company as any)?.nomeFantasia && (
                <p className="text-sm text-gray-600 truncate" data-testid="text-company-fantasy">
                  {(company as any).nomeFantasia}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              {!isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation(`/empresa/${companyId}/editar`)}
                  data-testid="button-edit"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
              )}
              
              <Button
                onClick={() => setLocation(`/companies/${companyId}/valuation`)}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-valuation"
              >
                <Calculator className="w-4 h-4" />
                {!isMobile && <span className="ml-1">Valuation</span>}
              </Button>
            </div>
          </div>
          
          {/* Ações extras no mobile */}
          {isMobile && (
            <div className="mt-3 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation(`/empresa/${companyId}/editar`)}
                className="w-full max-w-xs"
                data-testid="button-edit-mobile"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Empresa
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Container principal */}
      <div className={`${
        isMobile ? 'px-4 py-4' : 'container mx-auto p-6'
      } space-y-4`}>
        
        {/* Tabs Mobile */}
        {isMobile && <MobileTabs />}
        
        {/* Layout responsivo */}
        <div className={isMobile ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-3 gap-6'}>
          {/* Conteúdo principal */}
          <div className={isMobile ? 'space-y-4' : 'lg:col-span-2 space-y-6'}>
            {isMobile ? (
              // Layout mobile - uma tab por vez
              <>
                <TabContent tabValue="overview">
                  <Card data-testid="card-overview">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Building2 className="w-5 h-5 mr-2" />
                        Informações da Empresa
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="font-medium text-gray-600">CNPJ</p>
                            <p className="text-gray-900">{(company as any)?.cnpj || 'Não informado'}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600">Status</p>
                            <div className="mt-1">{getStatusBadge((company as any)?.status || 'pendente')}</div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <p className="font-medium text-gray-600 mb-2">Descrição do Negócio</p>
                          <p className="text-sm text-gray-800">{(company as any)?.descricaoNegocio || 'Descrição não disponível'}</p>
                        </div>
                        
                        {((company as any)?.telefone || (company as any)?.emailContato) && (
                          <>
                            <Separator />
                            <div className="space-y-2">
                              <p className="font-medium text-gray-600">Contato</p>
                              {(company as any)?.telefone && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Phone className="w-4 h-4 text-gray-500" />
                                  <span>{(company as any).telefone}</span>
                                </div>
                              )}
                              {(company as any)?.emailContato && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Mail className="w-4 h-4 text-gray-500" />
                                  <span>{(company as any).emailContato}</span>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabContent>

                <TabContent tabValue="financials">
                  <Card data-testid="card-financials">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="w-5 h-5 mr-2" />
                        Informações Financeiras
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-600">Faturamento</p>
                          <p className="text-xl font-bold text-blue-600">
                            {(company as any)?.faturamento ? formatCurrency((company as any).faturamento) : 'Não informado'}
                          </p>
                        </div>
                        {(company as any)?.ebitda && (
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-600">EBITDA</p>
                            <p className="text-xl font-bold text-green-600">
                              {formatCurrency((company as any).ebitda)}
                            </p>
                          </div>
                        )}
                        {(company as any)?.dividaLiquida && (
                          <div className="text-center p-4 bg-red-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-600">Dívida Líquida</p>
                            <p className="text-xl font-bold text-red-600">
                              {formatCurrency((company as any).dividaLiquida)}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabContent>

                <TabContent tabValue="valuations">
                  <Card data-testid="card-valuations">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2" />
                          Valuations
                        </div>
                        <Button
                          onClick={() => setLocation(`/companies/${companyId}/valuation`)}
                          size="sm"
                          data-testid="button-new-valuation"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(valuations as any) && (valuations as any).length > 0 ? (
                        <div className="space-y-3">
                          {(valuations as any).map((valuation: any) => (
                            <div key={valuation.id} className="border border-gray-200 rounded-lg p-3" data-testid={`card-valuation-${valuation.id}`}>
                              <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline">
                                  {valuation.method === "dcf" ? "DCF" : "Múltiplos"}
                                </Badge>
                                {getValuationStatusBadge(valuation.status)}
                              </div>
                              
                              {valuation.enterpriseValue && (
                                <div className="mb-2">
                                  <p className="text-sm text-gray-600">Valor da Empresa</p>
                                  <p className="font-bold text-lg">{formatCurrency(valuation.enterpriseValue)}</p>
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-500">{formatDate(valuation.createdAt)}</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setLocation(`/companies/${companyId}/valuation/${valuation.id}`)}
                                  data-testid={`button-view-valuation-${valuation.id}`}
                                >
                                  Ver
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Nenhum valuation realizado</p>
                          <p className="text-sm text-gray-500 mb-4">
                            Realize o primeiro valuation desta empresa
                          </p>
                          <Button
                            onClick={() => setLocation(`/companies/${companyId}/valuation`)}
                            className="bg-green-600 hover:bg-green-700"
                            data-testid="button-first-valuation"
                          >
                            <Calculator className="w-4 h-4 mr-2" />
                            Realizar Valuation
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabContent>

                <TabContent tabValue="credit">
                  <Card data-testid="card-credit">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Solicitações de Crédito
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(creditRequests as any) && (creditRequests as any).length > 0 ? (
                        <div className="space-y-3">
                          {(creditRequests as any).map((request: any) => (
                            <div key={request.id} className="border border-gray-200 rounded-lg p-3" data-testid={`card-credit-${request.id}`}>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium">{formatCurrency(request.valorSolicitado)}</p>
                                  <p className="text-sm text-gray-600">{request.prazoMeses} meses</p>
                                </div>
                                {getStatusBadge(request.status)}
                              </div>
                              <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Nenhuma solicitação de crédito</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabContent>
              </>
            ) : (
              // Layout desktop - tabs tradicionais
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="financials">Financeiro</TabsTrigger>
                  <TabsTrigger value="valuations">Valuations</TabsTrigger>
                  <TabsTrigger value="credit">Crédito</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Building2 className="w-5 h-5 mr-2" />
                        Informações da Empresa
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">CNPJ</p>
                          <p>{(company as any)?.cnpj || 'Não informado'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Status</p>
                          {getStatusBadge((company as any)?.status || 'pendente')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Data de Fundação</p>
                          <p>{(company as any)?.dataFundacao ? formatDate((company as any).dataFundacao) : 'Não informado'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Funcionários</p>
                          <p>{(company as any)?.numeroFuncionarios || 'Não informado'}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Descrição do Negócio</p>
                        <p className="text-sm">{(company as any)?.descricaoNegocio || 'Descrição não disponível'}</p>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {(company as any)?.rua || 'Não informado'}, {(company as any)?.numero || 'S/N'}
                            {(company as any)?.complemento && `, ${(company as any).complemento}`}
                          </span>
                        </div>
                        <p className="text-sm ml-6">
                          {(company as any)?.bairro || 'Não informado'}, {(company as any)?.cidade || 'Não informado'} - {(company as any)?.estado || 'N/A'}
                        </p>
                        <p className="text-sm ml-6">CEP: {(company as any)?.cep || 'Não informado'}</p>
                      </div>
                      
                      {((company as any)?.telefone || (company as any)?.emailContato) && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Contato</p>
                            {(company as any)?.telefone && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span>{(company as any).telefone}</span>
                              </div>
                            )}
                            {(company as any)?.emailContato && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span>{(company as any).emailContato}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Financials Tab */}
                <TabsContent value="financials" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="w-5 h-5 mr-2" />
                        Informações Financeiras
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground">Faturamento</p>
                          <p className="text-xl font-bold text-blue-600">
                            {(company as any)?.faturamento ? formatCurrency((company as any).faturamento) : 'Não informado'}
                          </p>
                        </div>
                        {(company as any)?.ebitda && (
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">EBITDA</p>
                            <p className="text-xl font-bold text-green-600">
                              {formatCurrency((company as any).ebitda)}
                            </p>
                          </div>
                        )}
                        {(company as any)?.dividaLiquida && (
                          <div className="text-center p-4 bg-red-50 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Dívida Líquida</p>
                            <p className="text-xl font-bold text-red-600">
                              {formatCurrency((company as any).dividaLiquida)}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Valuations Tab - Key requirement RF014/RF015 */}
                <TabsContent value="valuations" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2" />
                          Histórico de Valuations
                        </div>
                        <Button
                          onClick={() => setLocation(`/companies/${companyId}/valuation`)}
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Novo Valuation
                        </Button>
                      </CardTitle>
                      <CardDescription>
                        Histórico de avaliações realizadas para esta empresa
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(valuations as any) && (valuations as any).length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Método</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Valor da Empresa</TableHead>
                              <TableHead>Valor do Equity</TableHead>
                              <TableHead>Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(valuations as any).map((valuation: any) => (
                              <TableRow key={valuation.id}>
                                <TableCell>{formatDate(valuation.createdAt)}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {valuation.method === "dcf" ? "DCF" : "Múltiplos"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {getValuationStatusBadge(valuation.status)}
                                </TableCell>
                                <TableCell>
                                  {valuation.enterpriseValue ? 
                                    formatCurrency(valuation.enterpriseValue) : 
                                    "-"
                                  }
                                </TableCell>
                                <TableCell>
                                  {valuation.equityValue ? 
                                    formatCurrency(valuation.equityValue) : 
                                    "-"
                                  }
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setLocation(`/companies/${companyId}/valuation/${valuation.id}`)}
                                    >
                                      Ver
                                    </Button>
                                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                          Excluir
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Confirmar Exclusão</DialogTitle>
                                          <DialogDescription>
                                            Tem certeza que deseja excluir este valuation? Esta ação não pode ser desfeita.
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex justify-end space-x-2">
                                          <Button
                                            variant="outline"
                                            onClick={() => setDeleteDialogOpen(false)}
                                          >
                                            Cancelar
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            onClick={() => deleteValuationMutation.mutate(valuation.id)}
                                            disabled={deleteValuationMutation.isPending}
                                          >
                                            Excluir
                                          </Button>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8">
                          <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Nenhum valuation realizado</p>
                          <p className="text-sm text-gray-500 mb-4">
                            Realize o primeiro valuation desta empresa para começar a análise
                          </p>
                          <Button
                            onClick={() => setLocation(`/companies/${companyId}/valuation`)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Calculator className="w-4 h-4 mr-2" />
                            Realizar Valuation
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Credit Tab */}
                <TabsContent value="credit" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Solicitações de Crédito
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(creditRequests as any) && (creditRequests as any).length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Valor</TableHead>
                              <TableHead>Prazo</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(creditRequests as any).map((request: any) => (
                              <TableRow key={request.id}>
                                <TableCell>{formatDate(request.createdAt)}</TableCell>
                                <TableCell>{formatCurrency(request.valorSolicitado)}</TableCell>
                                <TableCell>{request.prazoMeses} meses</TableCell>
                                <TableCell>{getStatusBadge(request.status)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Nenhuma solicitação de crédito</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>

          {/* Sidebar - Current Valuation e Stats */}
          <div className={isMobile ? 'space-y-4' : 'space-y-4'}>
            {(latestValuation as any) ? (
              <Card data-testid="card-latest-valuation">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Valuation Atual
                  </CardTitle>
                  <CardDescription>
                    Última avaliação realizada
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Método:</span>
                    <Badge variant="outline">
                      {(latestValuation as any).method === "dcf" ? "DCF" : "Múltiplos"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    {getValuationStatusBadge((latestValuation as any).status)}
                  </div>
                  
                  {(latestValuation as any).enterpriseValue && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Valor da Empresa</p>
                      <p className="text-xl font-bold">
                        {formatCurrency((latestValuation as any).enterpriseValue)}
                      </p>
                    </div>
                  )}
                  
                  {(latestValuation as any).equityValue && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Valor do Equity</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency((latestValuation as any).equityValue)}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Realizado em {formatDate((latestValuation as any)?.createdAt)}
                    </p>
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={() => setLocation(`/companies/${companyId}/valuation/${(latestValuation as any).id}`)}
                    data-testid="button-view-latest-valuation"
                  >
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card data-testid="card-no-valuation">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="w-5 h-5 mr-2" />
                    Valuation
                  </CardTitle>
                  <CardDescription>
                    Realize uma avaliação da empresa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Não há valuations realizados para esta empresa. Realize uma avaliação para determinar o valor de mercado.
                  </p>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setLocation(`/companies/${companyId}/valuation`)}
                    data-testid="button-start-valuation"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Realizar Valuation
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Company Stats */}
            <Card data-testid="card-stats">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Valuations Realizados:</span>
                  <span className="font-semibold">{(valuations as any)?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Solicitações de Crédito:</span>
                  <span className="font-semibold">{(creditRequests as any)?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data de Cadastro:</span>
                  <span className="font-semibold">{formatDate((company as any).createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailPage;