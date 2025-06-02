import { useState } from "react";
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

  // Fetch investor stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["/api/investor/stats"],
  });

  // Fetch available credit requests for the network
  const { data: creditRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ["/api/investor/credit-requests"],
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/user-type-selection';
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="network">Rede</TabsTrigger>
            <TabsTrigger value="accepted">Aceitas por Mim</TabsTrigger>
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
                            {request.company?.razaoSocial}
                          </TableCell>
                          <TableCell>{request.company?.cnpj}</TableCell>
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
                                            <p><strong>Razão Social:</strong> {selectedRequest.company?.razaoSocial}</p>
                                            <p><strong>CNPJ:</strong> {selectedRequest.company?.cnpj}</p>
                                            <p><strong>Faturamento:</strong> {formatCurrency(selectedRequest.company?.faturamento)}</p>
                                            <p><strong>EBITDA:</strong> {formatCurrency(selectedRequest.company?.ebitda)}</p>
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

          <TabsContent value="accepted" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Solicitações Aceitas por Mim</CardTitle>
                <CardDescription>
                  Solicitações que você aceitou e está analisando
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma solicitação aceita ainda</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Quando você aceitar solicitações da rede, elas aparecerão aqui
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