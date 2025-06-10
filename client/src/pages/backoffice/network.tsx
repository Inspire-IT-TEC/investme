import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, formatCurrency } from "@/lib/utils";
import { TrendingUp, Eye, Clock, CheckCircle, XCircle, AlertCircle, Users, DollarSign, Building2, MessageCircle } from "lucide-react";
import BackofficeSidebar from "@/components/layout/backoffice-sidebar";
import { useAuth } from "@/hooks/use-auth";

export default function BackofficeNetwork() {
  const { logout } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch all credit requests for network view
  const { data: networkRequests, isLoading } = useQuery({
    queryKey: ["/api/admin/network", statusFilter],
    queryFn: async () => {
      const url = statusFilter === "all" ? "/api/admin/network" : `/api/admin/network?status=${statusFilter}`;
      const response = await apiRequest("GET", url);
      return response.json();
    },
  });

  // Fetch network statistics
  const { data: networkStats } = useQuery({
    queryKey: ["/api/admin/network/stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/network/stats");
      return response.json();
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "na_rede":
        return <Badge className="bg-blue-100 text-blue-800">Na Rede</Badge>;
      case "em_analise":
        return <Badge className="bg-yellow-100 text-yellow-800">Em Análise</Badge>;
      case "aprovada":
        return <Badge className="bg-green-100 text-green-800">Aprovada</Badge>;
      case "reprovada":
        return <Badge className="bg-red-100 text-red-800">Reprovada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const calculateTimeRemaining = (dataLimiteAnalise: string) => {
    if (!dataLimiteAnalise) return "Sem prazo";
    
    const now = new Date();
    const limit = new Date(dataLimiteAnalise);
    const diff = limit.getTime() - now.getTime();
    
    if (diff <= 0) return "Tempo esgotado";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m restantes`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <BackofficeSidebar onLogout={logout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Rede de Negociações</h1>
                <p className="text-gray-600">Monitore todas as negociações e análises em andamento</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total na Rede</p>
                        <p className="text-2xl font-bold text-gray-900">{networkStats?.totalInNetwork || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Em Análise</p>
                        <p className="text-2xl font-bold text-gray-900">{networkStats?.inAnalysis || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                        <p className="text-2xl font-bold text-gray-900">{networkStats?.approved || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Volume Total</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(networkStats?.totalVolume || 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Solicitações na Rede</CardTitle>
                      <CardDescription>
                        Visualize todas as solicitações disponíveis para análise dos investidores
                      </CardDescription>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="na_rede">Na Rede</SelectItem>
                        <SelectItem value="em_analise">Em Análise</SelectItem>
                        <SelectItem value="aprovada">Aprovadas</SelectItem>
                        <SelectItem value="reprovada">Reprovadas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">Carregando solicitações...</div>
                  ) : !networkRequests?.length ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nenhuma solicitação encontrada na rede</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Empresa</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Prazo</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {networkRequests.map((request: any) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.companyRazaoSocial}</TableCell>
                            <TableCell>{formatCurrency(request.valorSolicitado)}</TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">
                                  {calculateTimeRemaining(request.dataLimiteAnalise)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedRequest(request)}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Detalhes
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                  <DialogHeader>
                                    <DialogTitle>Detalhes da Solicitação na Rede</DialogTitle>
                                    <DialogDescription>
                                      Informações completas da solicitação de crédito
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedRequest && (
                                    <div className="space-y-6">
                                      {/* Company Info */}
                                      <div className="border rounded-lg p-4">
                                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                                          <Building2 className="w-5 h-5 mr-2" />
                                          Informações da Empresa
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <p className="text-sm text-gray-600">Razão Social</p>
                                            <p className="font-medium">{selectedRequest.companyRazaoSocial}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-gray-600">CNPJ</p>
                                            <p className="font-medium">{selectedRequest.companyCnpj}</p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Request Details */}
                                      <div className="border rounded-lg p-4">
                                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                                          <DollarSign className="w-5 h-5 mr-2" />
                                          Detalhes da Solicitação
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <p className="text-sm text-gray-600">Valor Solicitado</p>
                                            <p className="font-medium text-lg">{formatCurrency(selectedRequest.valorSolicitado)}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-gray-600">Prazo de Pagamento</p>
                                            <p className="font-medium">{selectedRequest.prazoPagamento} meses</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-gray-600">Finalidade</p>
                                            <p className="font-medium">{selectedRequest.finalidade}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-gray-600">Status</p>
                                            <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Timeline */}
                                      <div className="border rounded-lg p-4">
                                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                                          <Clock className="w-5 h-5 mr-2" />
                                          Timeline
                                        </h3>
                                        <div className="space-y-3">
                                          <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Entrada na rede:</span>
                                            <span className="font-medium">{formatDate(selectedRequest.dataEntradaRede)}</span>
                                          </div>
                                          {selectedRequest.dataLimiteAnalise && (
                                            <div className="flex justify-between">
                                              <span className="text-sm text-gray-600">Limite para análise:</span>
                                              <span className="font-medium">{formatDate(selectedRequest.dataLimiteAnalise)}</span>
                                            </div>
                                          )}
                                          <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Tempo restante:</span>
                                            <span className="font-medium text-yellow-600">
                                              {calculateTimeRemaining(selectedRequest.dataLimiteAnalise)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Observations */}
                                      {selectedRequest.observacoesAnalise && (
                                        <div className="border rounded-lg p-4">
                                          <h3 className="text-lg font-semibold mb-3 flex items-center">
                                            <MessageCircle className="w-5 h-5 mr-2" />
                                            Observações da Análise
                                          </h3>
                                          <p className="bg-gray-50 p-3 rounded text-sm">
                                            {selectedRequest.observacoesAnalise}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}