import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import BackofficeNavbar from "@/components/layout/backoffice-navbar";
import { Search, Eye, Check, X, CreditCard, FileText } from "lucide-react";

export default function BackofficeCreditRequests() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: creditRequests, isLoading } = useQuery({
    queryKey: ["/api/admin/credit-requests", { status: statusFilter, search }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);
      return fetch(`/api/admin/credit-requests?${params}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
  });

  const { data: requestDetails } = useQuery({
    queryKey: ["/api/admin/credit-requests", selectedRequest?.id],
    queryFn: () => 
      fetch(`/api/admin/credit-requests/${selectedRequest.id}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json()),
    enabled: !!selectedRequest?.id,
  });

  const updateRequestMutation = useMutation({
    mutationFn: async (data: { id: number; status: string; observacoesAnalise: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/credit-requests/${data.id}`, {
        status: data.status,
        observacoesAnalise: data.observacoesAnalise
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Solicitação atualizada",
        description: "Status da solicitação foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credit-requests"] });
      setEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Erro ao atualizar solicitação",
        variant: "destructive",
      });
    },
  });

  const quickUpdateMutation = useMutation({
    mutationFn: async (data: { id: number; status: string; message: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/credit-requests/${data.id}`, {
        status: data.status,
        observacoesAnalise: data.message
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: `Solicitação ${variables.status === 'aprovada' ? 'aprovada' : 'reprovada'}`,
        description: "Status da solicitação foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credit-requests"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Erro ao atualizar solicitação",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { label: "Pendente", variant: "secondary" as const },
      em_analise: { label: "Em Análise", variant: "secondary" as const },
      aprovada: { label: "Aprovada", variant: "default" as const },
      reprovada: { label: "Reprovada", variant: "destructive" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const handleQuickApprove = (requestId: number) => {
    quickUpdateMutation.mutate({
      id: requestId,
      status: 'aprovada',
      message: `Solicitação aprovada em ${new Date().toLocaleDateString('pt-BR')}`
    });
  };

  const handleQuickReject = (requestId: number) => {
    quickUpdateMutation.mutate({
      id: requestId,
      status: 'reprovada',
      message: `Solicitação reprovada em ${new Date().toLocaleDateString('pt-BR')}`
    });
  };

  const handleUpdateRequest = (formData: FormData) => {
    if (!selectedRequest) return;
    
    const status = formData.get('status') as string;
    const observacoesAnalise = formData.get('observacoesAnalise') as string;
    
    updateRequestMutation.mutate({
      id: selectedRequest.id,
      status,
      observacoesAnalise
    });
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value.toString()));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BackofficeNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Solicitações de Crédito
                </CardTitle>
                <CardDescription>
                  Analise e aprove solicitações de crédito das empresas
                </CardDescription>
              </div>
              <div className="flex space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar empresa..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todas as Solicitações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Solicitações</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="em_analise">Em Análise</SelectItem>
                    <SelectItem value="aprovada">Aprovadas</SelectItem>
                    <SelectItem value="reprovada">Reprovadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Valor Solicitado</TableHead>
                      <TableHead>Prazo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creditRequests && creditRequests.length > 0 ? (
                      creditRequests.map((request: any) => (
                        <TableRow key={request.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{request.companyRazaoSocial}</div>
                              <div className="text-sm text-gray-500 font-mono">{request.companyCnpj}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(request.valorSolicitado)}
                          </TableCell>
                          <TableCell>{request.prazoMeses} meses</TableCell>
                          <TableCell>
                            {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              {request.status === 'pendente' || request.status === 'em_analise' ? (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleQuickApprove(request.id)}
                                    disabled={quickUpdateMutation.isPending}
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Aprovar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleQuickReject(request.id)}
                                    disabled={quickUpdateMutation.isPending}
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Reprovar
                                  </Button>
                                </>
                              ) : null}

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedRequest(request)}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Ver Detalhes
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Detalhes da Solicitação</DialogTitle>
                                    <DialogDescription>
                                      Informações completas da solicitação de crédito
                                    </DialogDescription>
                                  </DialogHeader>
                                  {requestDetails && (
                                    <div className="space-y-6">
                                      {/* Dados da Solicitação */}
                                      <div>
                                        <h3 className="text-lg font-medium mb-3">Dados da Solicitação</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div>
                                            <span className="font-medium">Valor Solicitado:</span>
                                            <p>{formatCurrency(requestDetails.valorSolicitado)}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium">Prazo:</span>
                                            <p>{requestDetails.prazoMeses} meses</p>
                                          </div>
                                          <div className="col-span-2">
                                            <span className="font-medium">Finalidade:</span>
                                            <p>{requestDetails.finalidade}</p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Dados da Empresa */}
                                      {requestDetails.company && (
                                        <div>
                                          <h3 className="text-lg font-medium mb-3">Dados da Empresa</h3>
                                          <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                              <span className="font-medium">Razão Social:</span>
                                              <p>{requestDetails.company.razaoSocial}</p>
                                            </div>
                                            <div>
                                              <span className="font-medium">CNPJ:</span>
                                              <p>{requestDetails.company.cnpj}</p>
                                            </div>
                                            <div>
                                              <span className="font-medium">Faturamento:</span>
                                              <p>R$ {parseFloat(requestDetails.company.faturamento).toLocaleString('pt-BR')}</p>
                                            </div>
                                            <div>
                                              <span className="font-medium">EBITDA:</span>
                                              <p>R$ {parseFloat(requestDetails.company.ebitda).toLocaleString('pt-BR')}</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Documentos */}
                                      {requestDetails.documentos && requestDetails.documentos.length > 0 && (
                                        <div>
                                          <h3 className="text-lg font-medium mb-3">Documentos</h3>
                                          <div className="space-y-2">
                                            {requestDetails.documentos.map((doc: string, index: number) => (
                                              <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                                                <div className="flex items-center space-x-2">
                                                  <FileText className="w-4 h-4 text-gray-400" />
                                                  <span className="text-sm">Documento {index + 1}</span>
                                                </div>
                                                <Button size="sm" variant="outline" asChild>
                                                  <a href={doc} target="_blank" rel="noopener noreferrer">
                                                    Visualizar
                                                  </a>
                                                </Button>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Observações */}
                                      {requestDetails.observacoesAnalise && (
                                        <div>
                                          <h3 className="text-lg font-medium mb-3">Observações da Análise</h3>
                                          <p className="text-sm bg-gray-50 p-3 rounded">
                                            {requestDetails.observacoesAnalise}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>

                              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedRequest(request)}
                                  >
                                    Editar
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Editar Solicitação</DialogTitle>
                                    <DialogDescription>
                                      Altere o status e observações da solicitação
                                    </DialogDescription>
                                  </DialogHeader>
                                  <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    handleUpdateRequest(formData);
                                  }} className="space-y-4">
                                    <div>
                                      <Label htmlFor="status">Status da Solicitação</Label>
                                      <Select name="status" defaultValue={selectedRequest?.status}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pendente">Pendente</SelectItem>
                                          <SelectItem value="em_analise">Em Análise</SelectItem>
                                          <SelectItem value="aprovada">Aprovada</SelectItem>
                                          <SelectItem value="reprovada">Reprovada</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div>
                                      <Label htmlFor="observacoesAnalise">Observações da Análise</Label>
                                      <Textarea
                                        name="observacoesAnalise"
                                        defaultValue={selectedRequest?.observacoesAnalise || ""}
                                        placeholder="Adicione observações sobre a análise..."
                                        rows={4}
                                      />
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditDialogOpen(false)}
                                      >
                                        Cancelar
                                      </Button>
                                      <Button
                                        type="submit"
                                        disabled={updateRequestMutation.isPending}
                                      >
                                        {updateRequestMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                                      </Button>
                                    </div>
                                  </form>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Nenhuma solicitação encontrada</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
