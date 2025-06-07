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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
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
  Send,
  Clock,
  Shield,
  AlertCircle,
  Plus
} from "lucide-react";
import UnifiedNavbar from "@/components/layout/unified-navbar";
import { useLocation } from "wouter";

export default function InvestorDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [messageContent, setMessageContent] = useState("");
  const [selectedChatRequest, setSelectedChatRequest] = useState<any>(null);
  const [selectedDetailsRequest, setSelectedDetailsRequest] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if user has approved company
  const { data: companyStatus } = useQuery({
    queryKey: ["/api/investor/company-status"],
    queryFn: async () => {
      const response = await fetch('/api/investor/company-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) return { hasApprovedCompany: false, hasCompany: false };
      return response.json();
    },
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
          content,
          companyId,
          creditRequestId,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar mensagem');
      }
      return response.json();
    },
    onSuccess: () => {
      setMessageContent("");
      refetchMessages();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  if (loadingStats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedNavbar 
          userType="investor" 
          userName={user?.nomeCompleto || "Investidor"}
          isCompanyApproved={companyStatus?.hasApprovedCompany}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
            <p className="mt-4 text-lg font-medium text-gray-600">Carregando painel do investidor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show company registration prompt if no company is registered
  if (companyStatus && !companyStatus.hasCompany) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedNavbar 
          userType="investor" 
          userName={user?.nomeCompleto || "Investidor"}
          isCompanyApproved={false}
        />
        <div className="max-w-4xl mx-auto p-6">
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Cadastre sua empresa para acessar a rede</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Para participar da rede de investimentos, você precisa cadastrar uma empresa.
                  </p>
                </div>
                <Button 
                  onClick={() => setLocation("/investor-company-registration")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Empresa
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar 
        userType="investor" 
        userName={user?.nomeCompleto || "Investidor"}
        isCompanyApproved={companyStatus?.hasApprovedCompany}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards - Cores mais harmoniosas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-md border-green-100 bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <CardTitle className="text-sm font-medium text-green-800">Solicitações Disponíveis</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-700">
                {loadingStats ? "..." : stats?.availableRequests || 0}
              </div>
              <p className="text-xs text-green-600 mt-1">Na rede para análise</p>
            </CardContent>
          </Card>

          <Card className="shadow-md border-green-100 bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <CardTitle className="text-sm font-medium text-green-800">Aceitas por Mim</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-700">
                {loadingStats ? "..." : stats?.acceptedRequests || 0}
              </div>
              <p className="text-xs text-green-600 mt-1">Em análise</p>
            </CardContent>
          </Card>

          <Card className="shadow-md border-green-100 bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <CardTitle className="text-sm font-medium text-green-800">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-700">
                {loadingStats ? "..." : formatCurrency(stats?.totalValue || 0)}
              </div>
              <p className="text-xs text-green-600 mt-1">Em solicitações aceitas</p>
            </CardContent>
          </Card>

          <Card className="shadow-md border-green-100 bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <CardTitle className="text-sm font-medium text-green-800">Empresas Únicas</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-700">
                {loadingStats ? "..." : stats?.uniqueCompanies || 0}
              </div>
              <p className="text-xs text-green-600 mt-1">Empresas diferentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-green-50 border-green-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Visão Geral</TabsTrigger>
            <TabsTrigger value="network" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Rede</TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Em Análise</TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Finalizadas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="shadow-md border-green-100">
              <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-t-lg border-b border-green-200">
                <CardTitle className="text-green-800">Resumo das Atividades</CardTitle>
                <CardDescription className="text-green-600">
                  Suas estatísticas como investidor na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center py-8">
                  <TrendingUp className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Bem-vindo ao seu painel</h3>
                  <p className="text-gray-600">
                    Aqui você pode acompanhar suas atividades de investimento e análise de crédito
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <Card className="shadow-md border-green-100">
              <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-t-lg border-b border-green-200">
                <CardTitle className="text-green-800">Rede de Solicitações</CardTitle>
                <CardDescription className="text-green-600">
                  Solicitações de crédito disponíveis para análise
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
                      {creditRequests?.map((request: any) => (
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
                                    className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-400"
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
            <Card className="shadow-md border-green-100">
              <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-t-lg border-b border-green-200">
                <CardTitle className="text-green-800">Solicitações em Análise</CardTitle>
                <CardDescription className="text-green-600">
                  Solicitações que você aceitou e está analisando
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAnalysis ? (
                  <div className="text-center py-8">Carregando análises...</div>
                ) : !myAnalysis?.length ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma solicitação em análise</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Aceite solicitações da rede para começar a analisar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {myAnalysis?.map((request: any) => (
                      <Card key={request.id} className="border-green-200">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{request.companyRazaoSocial}</CardTitle>
                              <CardDescription>
                                {formatCurrency(request.valorSolicitado)} • {request.prazoMeses} meses
                              </CardDescription>
                            </div>
                            <Badge className={getStatusColor(request.status)}>
                              {getStatusLabel(request.status)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex space-x-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="border-green-200 text-green-600 hover:bg-green-50"
                                  onClick={() => setSelectedChatRequest(request)}
                                >
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Conversar
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                                <DialogHeader>
                                  <DialogTitle>Conversa com {request.companyRazaoSocial}</DialogTitle>
                                  <DialogDescription>
                                    Chat sobre a solicitação de {formatCurrency(request.valorSolicitado)}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex-1 flex flex-col overflow-hidden">
                                  <div className="flex-1 overflow-y-auto p-4 space-y-4 border rounded-lg bg-gray-50">
                                    {loadingMessages ? (
                                      <p className="text-center text-gray-500">Carregando mensagens...</p>
                                    ) : !chatMessages?.length ? (
                                      <p className="text-center text-gray-500">
                                        Nenhuma mensagem ainda. Inicie a conversa!
                                      </p>
                                    ) : (
                                      chatMessages?.map((message: any, index: number) => (
                                        <div key={index} className={`flex ${message.senderType === 'investor' ? 'justify-end' : 'justify-start'}`}>
                                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                            message.senderType === 'investor'
                                              ? 'bg-green-600 text-white'
                                              : 'bg-white border'
                                          }`}>
                                            <p className="text-sm">{message.content}</p>
                                            <p className={`text-xs mt-1 ${
                                              message.senderType === 'investor'
                                                ? 'text-green-100'
                                                : 'text-gray-500'
                                            }`}>
                                              {formatDate(message.createdAt)}
                                            </p>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                    <div ref={messagesEndRef} />
                                  </div>
                                  <div className="mt-4 flex space-x-2">
                                    <Textarea
                                      placeholder="Digite sua mensagem..."
                                      value={messageContent}
                                      onChange={(e) => setMessageContent(e.target.value)}
                                      className="flex-1"
                                      rows={2}
                                    />
                                    <Button 
                                      onClick={() => {
                                        if (messageContent.trim() && selectedChatRequest) {
                                          const conversationId = `${selectedChatRequest.companyId}_${selectedChatRequest.id}`;
                                          sendMessageMutation.mutate({
                                            conversationId,
                                            content: messageContent,
                                            companyId: selectedChatRequest.companyId,
                                            creditRequestId: selectedChatRequest.id,
                                          });
                                        }
                                      }}
                                      disabled={!messageContent.trim() || sendMessageMutation.isPending}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Send className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button 
                              onClick={() => approveRequestMutation.mutate({ requestId: request.id, observacoes: "Aprovado pelo investidor" })}
                              disabled={approveRequestMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Aprovar
                            </Button>

                            <Button 
                              variant="destructive"
                              onClick={() => rejectRequestMutation.mutate({ requestId: request.id, observacoes: "Reprovado pelo investidor" })}
                              disabled={rejectRequestMutation.isPending}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reprovar
                            </Button>
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
            <Card className="shadow-md border-green-100">
              <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-t-lg border-b border-green-200">
                <CardTitle className="text-green-800">Análises Finalizadas</CardTitle>
                <CardDescription className="text-green-600">
                  Histórico de solicitações analisadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma análise finalizada ainda</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Análises aprovadas ou reprovadas aparecerão aqui
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