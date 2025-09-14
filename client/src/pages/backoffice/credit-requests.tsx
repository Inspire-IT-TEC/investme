import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useBackofficeNavigation } from "@/hooks/use-backoffice-navigation";
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
import BackofficeLayout from "@/components/layout/backoffice-layout";
import { useAuth, useRequireAdmin } from "@/hooks/use-auth";
import { Search, Eye, Check, X, CreditCard, FileText, Download, Calendar, DollarSign, Building } from "lucide-react";

export default function BackofficeCreditRequests() {
  const { toast } = useToast();
  const { logout } = useAuth();
  const isAuthorized = useRequireAdmin();

  // Recarregar dados automaticamente ao navegar para esta tela
  useBackofficeNavigation();

  if (!isAuthorized) {
    return null;
  }
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const updateRequestMutation = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
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

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value.toString()));
  };

  return (
    <BackofficeLayout onLogout={logout}>
      <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Solicitações de Crédito
                    </CardTitle>
                    <CardDescription>
                      Gerencie e analise solicitações de crédito
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar solicitações..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_analise">Em Análise</SelectItem>
                      <SelectItem value="aprovada">Aprovada</SelectItem>
                      <SelectItem value="reprovada">Reprovada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Carregando solicitações...</div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Empresa</TableHead>
                          <TableHead>Valor Solicitado</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {creditRequests && creditRequests.length > 0 ? (
                          creditRequests.map((request: any) => (
                            <TableRow key={request.id}>
                              <TableCell className="font-medium">{request.companyRazaoSocial}</TableCell>
                              <TableCell>{formatCurrency(request.valorSolicitado)}</TableCell>
                              <TableCell>{getStatusBadge(request.status)}</TableCell>
                              <TableCell>{new Date(request.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
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
                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle className="flex items-center">
                                          <FileText className="w-5 h-5 mr-2" />
                                          Detalhes da Solicitação de Crédito
                                        </DialogTitle>
                                        <DialogDescription>
                                          Informações completas da solicitação de crédito e documentos anexados
                                        </DialogDescription>
                                      </DialogHeader>
                                      {selectedRequest && (
                                        <div className="space-y-6">
                                          {/* Informações da Empresa */}
                                          <Card>
                                            <CardHeader>
                                              <CardTitle className="flex items-center text-lg">
                                                <Building className="w-5 h-5 mr-2" />
                                                Informações da Empresa
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <Label className="text-sm font-medium text-gray-500">Razão Social</Label>
                                                  <p className="mt-1 font-medium">{selectedRequest.companyRazaoSocial}</p>
                                                </div>
                                                <div>
                                                  <Label className="text-sm font-medium text-gray-500">CNPJ</Label>
                                                  <p className="mt-1">{selectedRequest.companyCnpj || 'Não informado'}</p>
                                                </div>
                                              </div>
                                            </CardContent>
                                          </Card>

                                          {/* Detalhes da Solicitação */}
                                          <Card>
                                            <CardHeader>
                                              <CardTitle className="flex items-center text-lg">
                                                <DollarSign className="w-5 h-5 mr-2" />
                                                Detalhes da Solicitação
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <Label className="text-sm font-medium text-gray-500">Valor Solicitado</Label>
                                                  <p className="mt-1 text-lg font-bold text-green-600">
                                                    {formatCurrency(selectedRequest.valorSolicitado)}
                                                  </p>
                                                </div>
                                                <div>
                                                  <Label className="text-sm font-medium text-gray-500">Prazo</Label>
                                                  <p className="mt-1">{selectedRequest.prazoMeses} meses</p>
                                                </div>
                                                <div>
                                                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                                                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                                                </div>
                                                <div>
                                                  <Label className="text-sm font-medium text-gray-500">Data da Solicitação</Label>
                                                  <p className="mt-1 flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {new Date(selectedRequest.createdAt).toLocaleDateString('pt-BR', {
                                                      day: '2-digit',
                                                      month: '2-digit',
                                                      year: 'numeric',
                                                      hour: '2-digit',
                                                      minute: '2-digit'
                                                    })}
                                                  </p>
                                                </div>
                                              </div>
                                              
                                              {selectedRequest.finalidade && (
                                                <div className="mt-4">
                                                  <Label className="text-sm font-medium text-gray-500">Finalidade</Label>
                                                  <p className="mt-1 p-3 bg-gray-50 rounded-lg border">
                                                    {selectedRequest.finalidade}
                                                  </p>
                                                </div>
                                              )}

                                              {selectedRequest.observacoesAnalise && (
                                                <div className="mt-4">
                                                  <Label className="text-sm font-medium text-gray-500">Observações da Análise</Label>
                                                  <p className="mt-1 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                    {selectedRequest.observacoesAnalise}
                                                  </p>
                                                </div>
                                              )}
                                            </CardContent>
                                          </Card>

                                          {/* Documentos Anexados */}
                                          {selectedRequest.documentos && selectedRequest.documentos.length > 0 && (
                                            <Card>
                                              <CardHeader>
                                                <CardTitle className="flex items-center text-lg">
                                                  <FileText className="w-5 h-5 mr-2" />
                                                  Documentos Anexados ({selectedRequest.documentos.length})
                                                </CardTitle>
                                              </CardHeader>
                                              <CardContent>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                  {selectedRequest.documentos.map((doc: string, index: number) => {
                                                    const fileName = doc.split('/').pop() || `Documento ${index + 1}`;
                                                    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
                                                    
                                                    return (
                                                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                                        <div className="flex items-center">
                                                          <FileText className="w-4 h-4 mr-2 text-blue-500" />
                                                          <div>
                                                            <p className="text-sm font-medium truncate max-w-48">
                                                              {fileName}
                                                            </p>
                                                            <p className="text-xs text-gray-500 uppercase">
                                                              {fileExtension}
                                                            </p>
                                                          </div>
                                                        </div>
                                                        <Button
                                                          variant="outline"
                                                          size="sm"
                                                          onClick={() => window.open(doc, '_blank')}
                                                          className="ml-2 flex-shrink-0"
                                                        >
                                                          <Download className="w-4 h-4 mr-1" />
                                                          Baixar
                                                        </Button>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              </CardContent>
                                            </Card>
                                          )}

                                          {/* Mensagem quando não há documentos */}
                                          {(!selectedRequest.documentos || selectedRequest.documentos.length === 0) && (
                                            <Card>
                                              <CardHeader>
                                                <CardTitle className="flex items-center text-lg">
                                                  <FileText className="w-5 h-5 mr-2" />
                                                  Documentos Anexados
                                                </CardTitle>
                                              </CardHeader>
                                              <CardContent>
                                                <div className="text-center py-8">
                                                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                  <p className="text-gray-500">Nenhum documento anexado</p>
                                                </div>
                                              </CardContent>
                                            </Card>
                                          )}
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                  
                                  {request.status === 'pendente' && (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() => updateRequestMutation.mutate({
                                          id: request.id,
                                          status: 'aprovada',
                                          message: 'Aprovada automaticamente'
                                        })}
                                        disabled={updateRequestMutation.isPending}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <Check className="w-4 h-4 mr-1" />
                                        Aprovar
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => updateRequestMutation.mutate({
                                          id: request.id,
                                          status: 'reprovada',
                                          message: 'Reprovada automaticamente'
                                        })}
                                        disabled={updateRequestMutation.isPending}
                                      >
                                        <X className="w-4 h-4 mr-1" />
                                        Reprovar
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
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
    </BackofficeLayout>
  );
}