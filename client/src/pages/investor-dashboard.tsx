import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { 
  TrendingUp, 
  Building2, 
  DollarSign, 
  Users, 
  Eye, 
  CheckCircle, 
  XCircle,
  MessageCircle,
  LogOut,
  Send,
  Clock,
  Shield
} from "lucide-react";

export default function InvestorDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [messageContent, setMessageContent] = useState("");
  const [selectedChatRequest, setSelectedChatRequest] = useState<any>(null);
  const [selectedDetailsRequest, setSelectedDetailsRequest] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch detailed company information
  const { data: companyDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ["/api/investor/company-details", selectedDetailsRequest?.id],
    queryFn: async () => {
      if (!selectedDetailsRequest) return null;
      const response = await fetch(`/api/investor/company-details/${selectedDetailsRequest.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.json();
    },
    enabled: !!selectedDetailsRequest,
  });

  // Fetch investor stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["/api/investor/stats"],
    queryFn: async () => {
      const response = await fetch('/api/investor/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.json();
    },
  });

  // Fetch available credit requests for the network
  const { data: creditRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ["/api/investor/credit-requests"],
  });

  // Fetch requests being analyzed by this investor
  const { data: myAnalysis, isLoading: loadingAnalysis } = useQuery({
    queryKey: ["/api/investor/my-analysis"],
  });

  // Accept credit request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await fetch(`/api/investor/credit-requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao aceitar solicitação');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Solicitação aceita!",
        description: "Você agora pode iniciar a conversa com o empreendedor.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/investor/credit-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/investor/my-analysis"] });
      setSelectedRequest(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao aceitar solicitação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Approve credit request mutation
  const approveRequestMutation = useMutation({
    mutationFn: async ({ requestId, observacoes }: { requestId: number; observacoes: string }) => {
      const response = await fetch(`/api/investor/credit-requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ observacoes }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao aprovar solicitação');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Solicitação aprovada!",
        description: "A solicitação foi aprovada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/investor/my-analysis"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao aprovar solicitação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject credit request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: async ({ requestId, observacoes }: { requestId: number; observacoes: string }) => {
      const response = await fetch(`/api/investor/credit-requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ observacoes }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao reprovar solicitação');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Solicitação reprovada",
        description: "A solicitação foi reprovada.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/investor/my-analysis"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao reprovar solicitação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Chat messages queries and mutations
  const { data: chatMessages, isLoading: loadingMessages, refetch: refetchMessages } = useQuery({
    queryKey: ["/api/investor/messages", selectedChatRequest?.id],
    queryFn: async () => {
      if (!selectedChatRequest) return [];
      const conversationId = `${selectedChatRequest.companyId}_${selectedChatRequest.id}`;
      const response = await fetch(`/api/investor/messages/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.json();
    },
    enabled: !!selectedChatRequest,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content, companyId, creditRequestId }: any) => {
      const response = await fetch('/api/investor/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          conteudo: content,
          companyId,
          creditRequestId,
        }),
      });
      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }
      return response.json();
    },
    onSuccess: () => {
      setMessageContent("");
      refetchMessages();
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageContent.trim() || !selectedChatRequest) return;
    
    const conversationId = `${selectedChatRequest.companyId}_${selectedChatRequest.id}`;
    sendMessageMutation.mutate({
      conversationId,
      content: messageContent,
      companyId: selectedChatRequest.companyId,
      creditRequestId: selectedChatRequest.id,
    });
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/user-type-selection';
  };

  // Function to calculate remaining time
  const calculateTimeRemaining = (dataLimiteAnalise: string) => {
    const now = new Date();
    const limit = new Date(dataLimiteAnalise);
    const diff = limit.getTime() - now.getTime();
    
    if (diff <= 0) return "Tempo esgotado";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m restantes`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Investme</h1>
                <p className="text-sm text-gray-600">Painel do Investidor</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solicitações Disponíveis</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? "..." : stats?.availableRequests || 0}
              </div>
              <p className="text-xs text-muted-foreground">Na rede para análise</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aceitas por Mim</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? "..." : stats?.acceptedRequests || 0}
              </div>
              <p className="text-xs text-muted-foreground">Em análise</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? "..." : formatCurrency(stats?.totalValue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">Em solicitações aceitas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresas Únicas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? "..." : stats?.uniqueCompanies || 0}
              </div>
              <p className="text-xs text-muted-foreground">Empresas diferentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="network">Rede</TabsTrigger>
            <TabsTrigger value="analysis">Em Análise</TabsTrigger>
            <TabsTrigger value="completed">Finalizadas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo das Atividades</CardTitle>
                <CardDescription>
                  Suas estatísticas como investidor na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Bem-vindo ao Investme!</h3>
                  <p className="text-gray-600 mb-4">
                    Use a aba "Rede" para ver todas as solicitações de crédito disponíveis para análise.
                  </p>
                  <p className="text-sm text-gray-500">
                    Quando você aceitar uma solicitação, ela aparecerá na aba "Aceitas por Mim".
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rede - Solicitações Disponíveis</CardTitle>
                <CardDescription>
                  Todas as solicitações de crédito na rede aguardando análise de investidores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingRequests ? (
                  <div className="text-center py-8">Carregando solicitações...</div>
                ) : !creditRequests?.length ? (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma solicitação disponível no momento</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Solicitações aparecerão aqui quando empreendedores solicitarem crédito
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empresa</TableHead>
                        <TableHead>CNPJ</TableHead>
                        <TableHead>Valor Solicitado</TableHead>
                        <TableHead>Finalidade</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {creditRequests.map((request: any) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {request.companyRazaoSocial || 'Empresa não encontrada'}
                          </TableCell>
                          <TableCell>{request.companyCnpj || '-'}</TableCell>
                          <TableCell>{formatCurrency(request.valorSolicitado)}</TableCell>
                          <TableCell>{request.finalidade}</TableCell>
                          <TableCell>{formatDate(request.createdAt)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(request.status)}>
                              {getStatusLabel(request.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setSelectedRequest(request)}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Ver Detalhes
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Detalhes da Solicitação</DialogTitle>
                                    <DialogDescription>
                                      Análise completa da solicitação de crédito
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedRequest && (
                                    <div className="space-y-6">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <h3 className="font-semibold mb-2">Informações da Empresa</h3>
                                          <div className="space-y-1 text-sm">
                                            <p><strong>Razão Social:</strong> {selectedRequest.companyRazaoSocial || 'Não informado'}</p>
                                            <p><strong>CNPJ:</strong> {selectedRequest.companyCnpj || 'Não informado'}</p>
                                            <p><strong>Status:</strong> {selectedRequest.companyStatus || 'Não informado'}</p>
                                          </div>
                                        </div>
                                        <div>
                                          <h3 className="font-semibold mb-2">Solicitação de Crédito</h3>
                                          <div className="space-y-1 text-sm">
                                            <p><strong>Valor:</strong> {formatCurrency(selectedRequest.valorSolicitado)}</p>
                                            <p><strong>Prazo:</strong> {selectedRequest.prazoMeses} meses</p>
                                            <p><strong>Finalidade:</strong> {selectedRequest.finalidade}</p>
                                            <p><strong>Taxa Proposta:</strong> {selectedRequest.taxaJuros}% a.m.</p>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex justify-end space-x-2">
                                        <Button
                                          onClick={() => acceptRequestMutation.mutate(selectedRequest.id)}
                                          disabled={acceptRequestMutation.isPending}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          {acceptRequestMutation.isPending ? "Aceitando..." : "Aceitar Solicitação"}
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Em Análise - 24h para Resposta</CardTitle>
                <CardDescription>
                  Solicitações que você aceitou da rede e tem 24 horas para dar uma resposta
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAnalysis ? (
                  <div className="text-center py-8">Carregando análises...</div>
                ) : !myAnalysis?.length ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma solicitação em análise</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Aceite solicitações da rede para começar a analisar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myAnalysis.map((request: any) => (
                      <Card key={request.id} className="border-l-4 border-l-orange-500">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{request.companyRazaoSocial}</h3>
                              <p className="text-gray-600">{request.companyCnpj}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Tempo restante:</p>
                              <p className="font-medium text-orange-600">
                                {calculateTimeRemaining(request.dataLimiteAnalise)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Valor Solicitado</p>
                              <p className="font-medium">{formatCurrency(request.valorSolicitado)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Finalidade</p>
                              <p className="font-medium">{request.finalidade}</p>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedDetailsRequest(request)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Mais Detalhes
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Detalhes Completos - {request.companyRazaoSocial}</DialogTitle>
                                  <DialogDescription>
                                    Informações detalhadas da empresa e solicitação de crédito
                                  </DialogDescription>
                                </DialogHeader>
                                
                                {loadingDetails ? (
                                  <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                  </div>
                                ) : companyDetails ? (
                                  <div className="space-y-6">
                                    {/* Company Information */}
                                    <div className="border rounded-lg p-4">
                                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                                        <Building2 className="w-5 h-5 mr-2" />
                                        Informações da Empresa
                                      </h3>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <label className="font-medium text-gray-600">Razão Social:</label>
                                          <p>{companyDetails.company.razaoSocial}</p>
                                        </div>
                                        <div>
                                          <label className="font-medium text-gray-600">CNPJ:</label>
                                          <p>{companyDetails.company.cnpj}</p>
                                        </div>
                                        <div>
                                          <label className="font-medium text-gray-600">Status:</label>
                                          <Badge variant={companyDetails.company.status === 'ativa' ? 'default' : 'secondary'}>
                                            {companyDetails.company.status}
                                          </Badge>
                                        </div>
                                        <div>
                                          <label className="font-medium text-gray-600">Setor:</label>
                                          <p>{companyDetails.company.setor || 'Não informado'}</p>
                                        </div>
                                        <div>
                                          <label className="font-medium text-gray-600">Porte:</label>
                                          <p>{companyDetails.company.porte || 'Não informado'}</p>
                                        </div>
                                        <div>
                                          <label className="font-medium text-gray-600">Faturamento Anual:</label>
                                          <p>{companyDetails.company.faturamentoAnual ? formatCurrency(companyDetails.company.faturamentoAnual) : 'Não informado'}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Shareholders */}
                                    {companyDetails.shareholders && companyDetails.shareholders.length > 0 && (
                                      <div className="border rounded-lg p-4">
                                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                                          <Users className="w-5 h-5 mr-2" />
                                          Sócios da Empresa
                                        </h3>
                                        <div className="space-y-3">
                                          {companyDetails.shareholders.map((shareholder: any) => (
                                            <div key={shareholder.id} className="bg-gray-50 p-3 rounded border">
                                              <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                  <label className="font-medium text-gray-600">Nome:</label>
                                                  <p>{shareholder.nome}</p>
                                                </div>
                                                <div>
                                                  <label className="font-medium text-gray-600">CPF:</label>
                                                  <p>{shareholder.cpf}</p>
                                                </div>
                                                <div>
                                                  <label className="font-medium text-gray-600">Participação:</label>
                                                  <p>{shareholder.participacao}%</p>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Guarantees */}
                                    {companyDetails.guarantees && companyDetails.guarantees.length > 0 && (
                                      <div className="border rounded-lg p-4">
                                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                                          <Shield className="w-5 h-5 mr-2" />
                                          Garantias Oferecidas
                                        </h3>
                                        <div className="space-y-3">
                                          {companyDetails.guarantees.map((guarantee: any) => (
                                            <div key={guarantee.id} className="bg-gray-50 p-3 rounded border">
                                              <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                  <label className="font-medium text-gray-600">Tipo:</label>
                                                  <p>{guarantee.tipo}</p>
                                                </div>
                                                <div>
                                                  <label className="font-medium text-gray-600">Valor:</label>
                                                  <p>{formatCurrency(guarantee.valor)}</p>
                                                </div>
                                                {guarantee.descricao && (
                                                  <div className="col-span-2">
                                                    <label className="font-medium text-gray-600">Descrição:</label>
                                                    <p>{guarantee.descricao}</p>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Credit Request Information */}
                                    <div className="border rounded-lg p-4">
                                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                                        <DollarSign className="w-5 h-5 mr-2" />
                                        Detalhes da Solicitação
                                      </h3>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <label className="font-medium text-gray-600">Valor Solicitado:</label>
                                          <p className="text-lg font-bold text-green-600">
                                            {formatCurrency(companyDetails.creditRequest.valorSolicitado)}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="font-medium text-gray-600">Prazo:</label>
                                          <p>{companyDetails.creditRequest.prazoMeses} meses</p>
                                        </div>
                                        <div className="col-span-2">
                                          <label className="font-medium text-gray-600">Finalidade:</label>
                                          <p>{companyDetails.creditRequest.finalidade}</p>
                                        </div>
                                        <div>
                                          <label className="font-medium text-gray-600">Data da Solicitação:</label>
                                          <p>{formatDate(companyDetails.creditRequest.createdAt)}</p>
                                        </div>
                                        <div>
                                          <label className="font-medium text-gray-600">Data de Aceite:</label>
                                          <p>{formatDate(companyDetails.creditRequest.dataAceite)}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Analysis Information */}
                                    <div className="border rounded-lg p-4">
                                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                                        <Clock className="w-5 h-5 mr-2" />
                                        Informações da Análise
                                      </h3>
                                      <div className="grid grid-cols-1 gap-4 text-sm">
                                        <div>
                                          <label className="font-medium text-gray-600">Status:</label>
                                          <Badge variant="outline" className="ml-2">
                                            Em Análise
                                          </Badge>
                                        </div>
                                        <div>
                                          <label className="font-medium text-gray-600">Prazo para Resposta:</label>
                                          <p className="text-orange-600 font-medium">
                                            {companyDetails.creditRequest.dataLimiteAnalise ? formatDate(companyDetails.creditRequest.dataLimiteAnalise) : 'Não definido'}
                                          </p>
                                        </div>
                                        {companyDetails.creditRequest.observacoesAnalise && (
                                          <div>
                                            <label className="font-medium text-gray-600">Observações:</label>
                                            <p className="bg-gray-50 p-2 rounded border">
                                              {companyDetails.creditRequest.observacoesAnalise}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Documents Section */}
                                    <div className="border rounded-lg p-4">
                                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                                        <MessageCircle className="w-5 h-5 mr-2" />
                                        Documentos e Anexos
                                      </h3>
                                      <div className="text-sm text-gray-600">
                                        <p>Para visualizar documentos anexados pela empresa, utilize o sistema de mensagens.</p>
                                        <p className="mt-2">Documentos geralmente incluem:</p>
                                        <ul className="list-disc list-inside mt-1 space-y-1">
                                          <li>Demonstrações financeiras</li>
                                          <li>Comprovantes de faturamento</li>
                                          <li>Certidões negativas</li>
                                          <li>Contratos e garantias</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-gray-500">
                                    Erro ao carregar detalhes da empresa
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button className="bg-green-600 hover:bg-green-700" size="sm">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Aprovar
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Aprovar Solicitação</DialogTitle>
                                  <DialogDescription>
                                    Você está aprovando a solicitação de crédito de {request.companyRazaoSocial}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Observações (opcional)</label>
                                    <textarea
                                      className="w-full mt-1 p-2 border rounded"
                                      rows={3}
                                      placeholder="Adicione observações sobre a aprovação..."
                                      id={`approve-obs-${request.id}`}
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <DialogTrigger asChild>
                                      <Button variant="outline">Cancelar</Button>
                                    </DialogTrigger>
                                    <Button 
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => {
                                        const textarea = document.getElementById(`approve-obs-${request.id}`) as HTMLTextAreaElement;
                                        approveRequestMutation.mutate({
                                          requestId: request.id,
                                          observacoes: textarea?.value || ''
                                        });
                                      }}
                                      disabled={approveRequestMutation.isPending}
                                    >
                                      {approveRequestMutation.isPending ? 'Aprovando...' : 'Confirmar Aprovação'}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reprovar
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reprovar Solicitação</DialogTitle>
                                  <DialogDescription>
                                    Você está reprovando a solicitação de crédito de {request.companyRazaoSocial}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Motivo da reprovação *</label>
                                    <textarea
                                      className="w-full mt-1 p-2 border rounded"
                                      rows={3}
                                      placeholder="Explique o motivo da reprovação..."
                                      id={`reject-obs-${request.id}`}
                                      required
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <DialogTrigger asChild>
                                      <Button variant="outline">Cancelar</Button>
                                    </DialogTrigger>
                                    <Button 
                                      variant="destructive"
                                      onClick={() => {
                                        const textarea = document.getElementById(`reject-obs-${request.id}`) as HTMLTextAreaElement;
                                        if (!textarea?.value.trim()) {
                                          toast({
                                            title: "Campo obrigatório",
                                            description: "Por favor, informe o motivo da reprovação.",
                                            variant: "destructive",
                                          });
                                          return;
                                        }
                                        rejectRequestMutation.mutate({
                                          requestId: request.id,
                                          observacoes: textarea.value
                                        });
                                      }}
                                      disabled={rejectRequestMutation.isPending}
                                    >
                                      {rejectRequestMutation.isPending ? 'Reprovando...' : 'Confirmar Reprovação'}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedChatRequest(request)}
                                >
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Conversar
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[80vh]">
                                <DialogHeader>
                                  <DialogTitle>Conversa com {request.companyRazaoSocial}</DialogTitle>
                                  <DialogDescription>
                                    Chat privado sobre a solicitação de crédito de {formatCurrency(request.valorSolicitado)}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                {/* Messages Area */}
                                <div className="h-96 border rounded-lg overflow-hidden flex flex-col">
                                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                    {loadingMessages ? (
                                      <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                          <div key={i} className="animate-pulse">
                                            <div className="flex space-x-3">
                                              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                              <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                                <div className="h-16 bg-gray-200 rounded"></div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : chatMessages && chatMessages.length > 0 ? (
                                      <>
                                        {chatMessages.map((message: any) => (
                                          <div
                                            key={message.id}
                                            className={`flex space-x-3 ${
                                              message.tipo === 'investor' ? 'flex-row-reverse space-x-reverse' : ''
                                            }`}
                                          >
                                            <Avatar className="w-8 h-8">
                                              <AvatarFallback className={
                                                message.tipo === 'investor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                              }>
                                                {message.tipo === 'investor' ? 'I' : 'E'}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className={`flex-1 ${message.tipo === 'investor' ? 'text-right' : ''}`}>
                                              <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-sm font-medium text-gray-900">
                                                  {message.tipo === 'investor' ? 'Você' : request.companyRazaoSocial}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                  {formatTime(message.createdAt)}
                                                </span>
                                              </div>
                                              <div className={`p-3 rounded-lg max-w-sm ${
                                                message.tipo === 'investor' 
                                                  ? 'bg-blue-500 text-white ml-auto' 
                                                  : 'bg-white border shadow-sm'
                                              }`}>
                                                <p className="text-sm whitespace-pre-wrap">{message.conteudo}</p>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                      </>
                                    ) : (
                                      <div className="text-center text-gray-500 py-8">
                                        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <p>Nenhuma mensagem ainda.</p>
                                        <p className="text-sm">Comece a conversa sobre esta solicitação de crédito.</p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Message Input */}
                                  <div className="border-t p-4 bg-white">
                                    <div className="flex space-x-2">
                                      <Textarea
                                        value={messageContent}
                                        onChange={(e) => setMessageContent(e.target.value)}
                                        placeholder="Digite sua mensagem..."
                                        className="flex-1 min-h-[60px] resize-none"
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                          }
                                        }}
                                      />
                                      <Button
                                        onClick={handleSendMessage}
                                        disabled={!messageContent.trim() || sendMessageMutation.isPending}
                                        className="px-6"
                                      >
                                        <Send className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Solicitações Finalizadas</CardTitle>
                <CardDescription>
                  Solicitações que você aprovou ou reprovou
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma solicitação finalizada ainda</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Solicitações aprovadas ou reprovadas aparecerão aqui
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}