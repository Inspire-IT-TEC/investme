import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ModernSidebarLayout } from "@/components/layout/modern-sidebar-layout";
import { Link } from "wouter";
import { CreditCard, Plus, Eye, Calendar, Building2, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, FileText, Download, Edit, Upload, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CreditRequests() {
  const { toast } = useToast();
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [editFormData, setEditFormData] = useState({
    valorSolicitado: '',
    prazoMeses: '',
    finalidade: '',
    documentosExistentes: [] as string[]
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: creditRequests, isLoading } = useQuery({
    queryKey: ["/api/credit-requests"],
    queryFn: () => {
      return fetch("/api/credit-requests", {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
  });

  const { data: companies } = useQuery({
    queryKey: ["/api/companies"],
    queryFn: () => {
      return fetch("/api/companies", {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { 
        label: 'Pendente', 
        variant: 'secondary' as const, 
        icon: Clock,
        color: 'text-yellow-600'
      },
      'approved': { 
        label: 'Aprovada', 
        variant: 'default' as const, 
        icon: CheckCircle,
        color: 'text-green-600'
      },
      'rejected': { 
        label: 'Rejeitada', 
        variant: 'destructive' as const, 
        icon: XCircle,
        color: 'text-red-600'
      },
      'under_review': { 
        label: 'Em Análise', 
        variant: 'outline' as const, 
        icon: AlertCircle,
        color: 'text-blue-600'
      },
    };
    
    return statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'outline' as const, 
      icon: Clock,
      color: 'text-gray-600'
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCompanyName = (companyId: number) => {
    if (!companies) return 'Carregando...';
    const company = companies.find((c: any) => c.id === companyId);
    return company?.razaoSocial || 'Empresa não encontrada';
  };

  const editCreditRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('valorSolicitado', data.valorSolicitado);
      formData.append('prazoMeses', data.prazoMeses);
      formData.append('finalidade', data.finalidade);
      
      // Add existing documents
      data.documentosExistentes.forEach((doc: string) => {
        formData.append('documentosExistentes', doc);
      });
      
      // Add new uploaded files
      data.novosDocumentos.forEach((file: File) => {
        formData.append('novosDocumentos', file);
      });

      const response = await fetch(`/api/credit-requests/${data.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao editar solicitação');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credit-requests"] });
      setIsEditModalOpen(false);
      setEditingRequest(null);
      setUploadedFiles([]);
      toast({
        title: "Sucesso",
        description: "Solicitação editada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao editar solicitação",
        variant: "destructive",
      });
    },
  });

  const removeDocumentMutation = useMutation({
    mutationFn: async ({ requestId, documentoUrl }: { requestId: number; documentoUrl: string }) => {
      const response = await fetch(`/api/credit-requests/${requestId}/documents`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ documentoUrl }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao remover documento');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credit-requests"] });
      toast({
        title: "Sucesso",
        description: "Documento removido com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover documento",
        variant: "destructive",
      });
    },
  });

  const openEditModal = (request: any) => {
    setEditingRequest(request);
    setEditFormData({
      valorSolicitado: request.valorSolicitado.toString(),
      prazoMeses: request.prazoMeses.toString(),
      finalidade: request.finalidade || '',
      documentosExistentes: request.documentos || []
    });
    setUploadedFiles([]);
    setIsEditModalOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingDocument = async (documentoUrl: string) => {
    if (editingRequest) {
      await removeDocumentMutation.mutateAsync({
        requestId: editingRequest.id,
        documentoUrl
      });
      
      setEditFormData(prev => ({
        ...prev,
        documentosExistentes: prev.documentosExistentes.filter(doc => doc !== documentoUrl)
      }));
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingRequest) return;

    editCreditRequestMutation.mutate({
      id: editingRequest.id,
      valorSolicitado: editFormData.valorSolicitado,
      prazoMeses: editFormData.prazoMeses,
      finalidade: editFormData.finalidade,
      documentosExistentes: editFormData.documentosExistentes,
      novosDocumentos: uploadedFiles
    });
  };

  const canEditRequest = (request: any) => {
    return request.status === 'na_rede' || request.status === 'pending';
  };

  if (isLoading) {
    return (
      <ModernSidebarLayout title="Solicitações" userType="user" theme="green">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando solicitações...</p>
          </div>
        </div>
      </ModernSidebarLayout>
    );
  }

  const hasApprovedCompany = companies && companies.some((company: any) => company.status === 'approved' || company.status === 'aprovada');

  return (
    <ModernSidebarLayout title="Solicitações" userType="user" theme="green">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-green-600" />
              Solicitações de Crédito
            </h1>
            <p className="text-muted-foreground mt-2">
              Acompanhe suas solicitações de crédito e seus status
            </p>
          </div>
          
          {hasApprovedCompany ? (
            <Link href="/nova-solicitacao">
              <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4" />
                Nova Solicitação
              </Button>
            </Link>
          ) : (
            <Button disabled className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Solicitação
            </Button>
          )}
        </div>

        {!hasApprovedCompany && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  Empresa pendente de aprovação
                </p>
                <p className="text-sm text-yellow-700">
                  Você precisa ter pelo menos uma empresa aprovada para solicitar crédito.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!creditRequests || !Array.isArray(creditRequests) || creditRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma solicitação encontrada
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                {hasApprovedCompany 
                  ? "Você ainda não fez nenhuma solicitação de crédito. Comece agora para acessar financiamentos para sua empresa."
                  : "Aguarde a aprovação de sua empresa para poder solicitar crédito."
                }
              </p>
              {hasApprovedCompany && (
                <Link href="/nova-solicitacao">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Fazer Primeira Solicitação
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.isArray(creditRequests) && creditRequests.map((request: any) => {
              const status = getStatusBadge(request.status || 'pending');
              const StatusIcon = status.icon;
              
              return (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          {getCompanyName(request.companyId)}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Solicitação #{request.id}
                        </CardDescription>
                      </div>
                      <Badge variant={status.variant} className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Valor Solicitado:</span>
                        <span className="font-semibold text-lg text-green-600">
                          {formatCurrency(request.valorSolicitado)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Prazo:</span>
                        <span className="font-medium">
                          {request.prazoMeses} meses
                        </span>
                      </div>
                      
                      {request.finalidade && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Finalidade:</span>
                          <span className="font-medium text-right max-w-[200px] truncate">
                            {request.finalidade}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Data da Solicitação:</span>
                        <span className="font-medium">
                          {formatDate(request.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Building2 className="h-5 w-5" />
                              Detalhes da Solicitação #{request.id}
                            </DialogTitle>
                            <DialogDescription>
                              Informações completas da solicitação de crédito
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="grid gap-6">
                            {/* Status e Informações Básicas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                <div className="flex items-center gap-2">
                                  <Badge variant={status.variant} className="flex items-center gap-1">
                                    <StatusIcon className="h-3 w-3" />
                                    {status.label}
                                  </Badge>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Empresa</Label>
                                <p className="font-medium">{getCompanyName(request.companyId)}</p>
                              </div>
                            </div>

                            <Separator />

                            {/* Informações Financeiras */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Informações Financeiras
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-muted-foreground">Valor Solicitado</Label>
                                  <p className="text-2xl font-bold text-green-600">{formatCurrency(request.valorSolicitado)}</p>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-muted-foreground">Prazo</Label>
                                  <p className="text-lg font-semibold">{request.prazoMeses} meses</p>
                                </div>
                                {request.taxaJuros && (
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">Taxa de Juros</Label>
                                    <p className="text-lg font-semibold">{request.taxaJuros}% a.m.</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Separator />

                            {/* Finalidade */}
                            {request.finalidade && (
                              <>
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold">Finalidade do Crédito</h3>
                                  <p className="text-muted-foreground bg-muted p-3 rounded-lg">{request.finalidade}</p>
                                </div>
                                <Separator />
                              </>
                            )}

                            {/* Documentos */}
                            {request.documentos && request.documentos.length > 0 && (
                              <>
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Documentos Anexados ({request.documentos.length})
                                  </h3>
                                  <div className="grid grid-cols-1 gap-2">
                                    {request.documentos.map((documento: string, index: number) => (
                                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm">Documento {index + 1}</span>
                                        </div>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => window.open(documento, '_blank')}
                                        >
                                          <Download className="h-4 w-4 mr-2" />
                                          Baixar
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <Separator />
                              </>
                            )}

                            {/* Datas e Timeline */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Timeline
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-muted-foreground">Data da Solicitação</Label>
                                  <p className="font-medium">{formatDate(request.createdAt)}</p>
                                </div>
                                {request.updatedAt && request.updatedAt !== request.createdAt && (
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">Última Atualização</Label>
                                    <p className="font-medium">{formatDate(request.updatedAt)}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Observações do Backoffice */}
                            {request.observacoes && (
                              <>
                                <Separator />
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold">Observações do Backoffice</h3>
                                  <div className="bg-muted p-4 rounded-lg">
                                    <p className="text-sm">{request.observacoes}</p>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {canEditRequest(request) && (
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => openEditModal(request)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Solicitação
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Solicitação #{editingRequest?.id}
            </DialogTitle>
            <DialogDescription>
              Modifique os dados da solicitação e gerencie documentos
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Básicas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valorSolicitado">Valor Solicitado (R$)</Label>
                  <Input
                    id="valorSolicitado"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editFormData.valorSolicitado}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, valorSolicitado: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prazoMeses">Prazo (meses)</Label>
                  <Input
                    id="prazoMeses"
                    type="number"
                    min="1"
                    max="120"
                    value={editFormData.prazoMeses}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, prazoMeses: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="finalidade">Finalidade do Crédito</Label>
                <Textarea
                  id="finalidade"
                  value={editFormData.finalidade}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, finalidade: e.target.value }))}
                  placeholder="Descreva a finalidade do crédito..."
                  rows={3}
                  required
                />
              </div>
            </div>

            <Separator />

            {/* Gerenciamento de Documentos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos
              </h3>
              
              {/* Documentos Existentes */}
              {editFormData.documentosExistentes.length > 0 && (
                <div className="space-y-2">
                  <Label>Documentos Atuais</Label>
                  <div className="grid gap-2">
                    {editFormData.documentosExistentes.map((documento: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Documento {index + 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(documento, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Ver
                          </Button>
                          <Button 
                            type="button"
                            variant="destructive" 
                            size="sm"
                            onClick={() => removeExistingDocument(documento)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Upload de Novos Documentos */}
              <div className="space-y-2">
                <Label>Adicionar Novos Documentos</Label>
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Arquivos
                  </Button>
                </div>
                
                {/* Lista de Arquivos para Upload */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Arquivos Selecionados</Label>
                    <div className="grid gap-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => removeUploadedFile(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700"
                disabled={editCreditRequestMutation.isPending}
              >
                {editCreditRequestMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </ModernSidebarLayout>
  );
}