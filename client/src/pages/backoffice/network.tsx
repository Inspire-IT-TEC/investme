import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, formatCurrency } from "@/lib/utils";
import { TrendingUp, Eye, Clock, CheckCircle, XCircle, AlertCircle, Users, DollarSign, Building2, MessageCircle } from "lucide-react";

export default function BackofficeNetwork() {
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rede de Negociações</h1>
        <p className="text-gray-600">Monitore todas as negociações e análises em andamento</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total na Rede</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {networkStats?.totalInNetwork || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {networkStats?.inAnalysis || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {networkStats?.approved || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reprovadas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {networkStats?.rejected || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(networkStats?.totalValue || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="na_rede">Na Rede</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="reprovada">Reprovada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Table */}
      <Card>
        <CardHeader>
          <CardTitle>Negociações na Rede</CardTitle>
          <CardDescription>
            Todas as solicitações de crédito e seu status atual na rede
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando negociações...</div>
          ) : !networkRequests?.length ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma negociação encontrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Investidor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tempo Restante</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {networkRequests.map((request: any) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.companyRazaoSocial || 'Empresa não encontrada'}
                    </TableCell>
                    <TableCell>{request.companyCnpj || '-'}</TableCell>
                    <TableCell>{formatCurrency(request.valorSolicitado)}</TableCell>
                    <TableCell>{request.prazoMeses} meses</TableCell>
                    <TableCell>
                      {request.investorName || (request.status === 'na_rede' ? 'Aguardando' : '-')}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {request.status === 'em_analise' && request.dataLimiteAnalise ? (
                        <span className={
                          calculateTimeRemaining(request.dataLimiteAnalise).includes('esgotado') 
                            ? 'text-red-600 font-medium' 
                            : 'text-orange-600'
                        }>
                          {calculateTimeRemaining(request.dataLimiteAnalise)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Detalhes da Negociação</DialogTitle>
                              <DialogDescription>
                                Informações completas da solicitação de crédito
                              </DialogDescription>
                            </DialogHeader>
                            {selectedRequest && (
                              <div className="space-y-6">
                                {/* Company Information */}
                                <div className="border rounded-lg p-4">
                                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                                    <Building2 className="w-5 h-5 mr-2" />
                                    Informações da Empresa
                                  </h3>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium text-gray-600">Razão Social:</span>
                                      <p>{selectedRequest.companyRazaoSocial}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-600">CNPJ:</span>
                                      <p>{selectedRequest.companyCnpj}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-600">Status:</span>
                                      <p>{selectedRequest.companyStatus}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Credit Request Information */}
                                <div className="border rounded-lg p-4">
                                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                                    <DollarSign className="w-5 h-5 mr-2" />
                                    Detalhes da Solicitação
                                  </h3>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium text-gray-600">Valor Solicitado:</span>
                                      <p className="text-lg font-bold text-green-600">
                                        {formatCurrency(selectedRequest.valorSolicitado)}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-600">Prazo:</span>
                                      <p>{selectedRequest.prazoMeses} meses</p>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="font-medium text-gray-600">Finalidade:</span>
                                      <p>{selectedRequest.finalidade}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-600">Taxa de Juros:</span>
                                      <p>{selectedRequest.taxaJuros}% a.m.</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Investor Information */}
                                {selectedRequest.investorName && (
                                  <div className="border rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                                      <Users className="w-5 h-5 mr-2" />
                                      Informações do Investidor
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="font-medium text-gray-600">Nome:</span>
                                        <p>{selectedRequest.investorName}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-600">Email:</span>
                                        <p>{selectedRequest.investorEmail}</p>
                                      </div>
                                      {selectedRequest.dataAceite && (
                                        <div>
                                          <span className="font-medium text-gray-600">Data de Aceite:</span>
                                          <p>{formatDate(selectedRequest.dataAceite)}</p>
                                        </div>
                                      )}
                                      {selectedRequest.dataLimiteAnalise && (
                                        <div>
                                          <span className="font-medium text-gray-600">Prazo para Análise:</span>
                                          <p className="text-orange-600 font-medium">
                                            {calculateTimeRemaining(selectedRequest.dataLimiteAnalise)}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Timeline */}
                                <div className="border rounded-lg p-4">
                                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                                    <Clock className="w-5 h-5 mr-2" />
                                    Timeline da Negociação
                                  </h3>
                                  <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                      <div>
                                        <p className="font-medium">Solicitação Criada</p>
                                        <p className="text-sm text-gray-600">{formatDate(selectedRequest.createdAt)}</p>
                                      </div>
                                    </div>
                                    {selectedRequest.dataAceite && (
                                      <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div>
                                          <p className="font-medium">Aceita por Investidor</p>
                                          <p className="text-sm text-gray-600">{formatDate(selectedRequest.dataAceite)}</p>
                                        </div>
                                      </div>
                                    )}
                                    {selectedRequest.dataAprovacao && (
                                      <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <div>
                                          <p className="font-medium">Aprovada</p>
                                          <p className="text-sm text-gray-600">{formatDate(selectedRequest.dataAprovacao)}</p>
                                        </div>
                                      </div>
                                    )}
                                    {selectedRequest.dataReprovacao && (
                                      <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div>
                                          <p className="font-medium">Reprovada</p>
                                          <p className="text-sm text-gray-600">{formatDate(selectedRequest.dataReprovacao)}</p>
                                        </div>
                                      </div>
                                    )}
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}