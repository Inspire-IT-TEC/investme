import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const CompanyDetailPage = () => {
  const [, params] = useRoute("/empresa/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const companyId = params?.id ? parseInt(params.id) : null;

  // Fetch company data
  const { data: company, isLoading } = useQuery({
    queryKey: ["/api/companies", companyId],
    enabled: !!companyId,
  });

  // Fetch company valuations
  const { data: valuations } = useQuery({
    queryKey: ["/api/companies", companyId, "valuations"],
    enabled: !!companyId,
  });

  // Fetch latest valuation
  const { data: latestValuation } = useQuery({
    queryKey: ["/api/companies", companyId, "valuations", "latest"],
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
      return apiRequest(`/api/valuations/${valuationId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({ title: "Valuation excluído com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "valuations"] });
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return <div className="container mx-auto p-6">Carregando...</div>;
  }

  if (!company) {
    return <div className="container mx-auto p-6">Empresa não encontrada</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{company.razaoSocial}</h1>
            {company.nomeFantasia && (
              <p className="text-muted-foreground">{company.nomeFantasia}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setLocation(`/empresa/${companyId}/editar`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          
          {/* Valuation Button - Key requirement RF001/RF002 */}
          <Button
            onClick={() => setLocation(`/companies/${companyId}/valuation`)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Valuation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Company Information */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
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
                      <p>{company.cnpj}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      {getStatusBadge(company.status)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Data de Fundação</p>
                      <p>{formatDate(company.dataFundacao)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Funcionários</p>
                      <p>{company.numeroFuncionarios}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Descrição do Negócio</p>
                    <p className="text-sm">{company.descricaoNegocio}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {company.rua}, {company.numero}
                        {company.complemento && `, ${company.complemento}`}
                      </span>
                    </div>
                    <p className="text-sm ml-6">
                      {company.bairro}, {company.cidade} - {company.estado}
                    </p>
                    <p className="text-sm ml-6">CEP: {company.cep}</p>
                  </div>
                  
                  {(company.telefone || company.emailContato) && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Contato</p>
                        {company.telefone && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{company.telefone}</span>
                          </div>
                        )}
                        {company.emailContato && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span>{company.emailContato}</span>
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
                        {formatCurrency(company.faturamento)}
                      </p>
                    </div>
                    {company.ebitda && (
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground">EBITDA</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(company.ebitda)}
                        </p>
                      </div>
                    )}
                    {company.dividaLiquida && (
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground">Dívida Líquida</p>
                        <p className="text-xl font-bold text-red-600">
                          {formatCurrency(company.dividaLiquida)}
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
                  {valuations && valuations.length > 0 ? (
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
                        {valuations.map((valuation: any) => (
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
                  {creditRequests && creditRequests.length > 0 ? (
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
                        {creditRequests.map((request: any) => (
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
        </div>

        {/* Sidebar - Current Valuation */}
        <div className="space-y-4">
          {latestValuation ? (
            <Card>
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
                    {latestValuation.method === "dcf" ? "DCF" : "Múltiplos"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  {getValuationStatusBadge(latestValuation.status)}
                </div>
                
                {latestValuation.enterpriseValue && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor da Empresa</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(latestValuation.enterpriseValue)}
                    </p>
                  </div>
                )}
                
                {latestValuation.equityValue && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor do Equity</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(latestValuation.equityValue)}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-muted-foreground">
                    Realizado em {formatDate(latestValuation.createdAt)}
                  </p>
                </div>
                
                <Button
                  className="w-full"
                  onClick={() => setLocation(`/companies/${companyId}/valuation/${latestValuation.id}`)}
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
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
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Realizar Valuation
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Company Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Valuations Realizados:</span>
                <span className="font-semibold">{valuations?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Solicitações de Crédito:</span>
                <span className="font-semibold">{creditRequests?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Data de Cadastro:</span>
                <span className="font-semibold">{formatDate(company.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailPage;