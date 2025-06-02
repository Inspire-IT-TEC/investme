import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  LogOut
} from "lucide-react";

export default function InvestorDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [messageContent, setMessageContent] = useState("");
  const [selectedChatRequest, setSelectedChatRequest] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch investor stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["/api/investor/stats"],
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
                                <Button variant="outline" size="sm">
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Conversar
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh]">
                                <DialogHeader>
                                  <DialogTitle>Conversa com {request.companyRazaoSocial}</DialogTitle>
                                  <DialogDescription>
                                    Chat privado sobre a solicitação de crédito
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="h-96 border rounded p-4 overflow-y-auto bg-gray-50">
                                  <div className="text-center text-gray-500 py-8">
                                    Sistema de chat em desenvolvimento
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <input
                                    type="text"
                                    placeholder="Digite sua mensagem..."
                                    className="flex-1 px-3 py-2 border rounded"
                                    disabled
                                  />
                                  <Button disabled>Enviar</Button>
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