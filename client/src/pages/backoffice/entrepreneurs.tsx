import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackofficeNavigation } from "@/hooks/use-backoffice-navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Briefcase, Users, CheckCircle, XCircle, Eye, UserCheck, AlertCircle } from "lucide-react";
import BackofficeSidebar from "@/components/layout/backoffice-sidebar";
import { useAuth, useRequireAdmin } from "@/hooks/use-auth";

export default function BackofficeEntrepreneurs() {
  const { toast } = useToast();
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const isAuthorized = useRequireAdmin();

  // Recarregar dados automaticamente ao navegar para esta tela
  useBackofficeNavigation();

  if (!isAuthorized) {
    return null;
  }
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch entrepreneurs
  const { data: entrepreneurs, isLoading } = useQuery({
    queryKey: ["/api/admin/entrepreneurs", statusFilter],
    queryFn: async () => {
      const url = statusFilter === "all" 
        ? "/api/admin/entrepreneurs" 
        : `/api/admin/entrepreneurs?status=${statusFilter}`;
      const response = await apiRequest("GET", url);
      return response.json();
    },
  });

  // Approve entrepreneur mutation
  const approveEntrepreneurMutation = useMutation({
    mutationFn: async (entrepreneurId: number) => {
      const response = await apiRequest("POST", `/api/admin/entrepreneurs/${entrepreneurId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/entrepreneurs"] });
      toast({
        title: "Empreendedor aprovado",
        description: "O empreendedor foi aprovado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao aprovar",
        description: error.message || "Erro ao aprovar empreendedor.",
        variant: "destructive",
      });
    },
  });

  // Reject entrepreneur mutation
  const rejectEntrepreneurMutation = useMutation({
    mutationFn: async ({ entrepreneurId, reason }: { entrepreneurId: number; reason: string }) => {
      const response = await apiRequest("POST", `/api/admin/entrepreneurs/${entrepreneurId}/reject`, { reason });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/entrepreneurs"] });
      toast({
        title: "Empreendedor rejeitado",
        description: "O empreendedor foi rejeitado.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao rejeitar",
        description: error.message || "Erro ao rejeitar empreendedor.",
        variant: "destructive",
      });
    },
  });

  // Granular approval mutations
  const approveFieldMutation = useMutation({
    mutationFn: async ({ userId, field, approved }: { userId: number; field: string; approved: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/entrepreneurs/${userId}/approve-field`, { field, approved });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/entrepreneurs"] });
      toast({
        title: "Status atualizado",
        description: "Item do perfil atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Erro ao atualizar status.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (entrepreneur: any) => {
    // Check if all approvals are complete
    const isComplete = entrepreneur.cadastroAprovado && entrepreneur.emailConfirmado && entrepreneur.documentosVerificados;
    
    if (entrepreneur.status === 'ativo' && isComplete) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>;
    } else if (entrepreneur.status === 'pendente' || !isComplete) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Incompleto</Badge>;
    } else if (entrepreneur.status === 'inativo') {
      return <Badge variant="destructive">Inativo</Badge>;
    } else {
      return <Badge variant="outline">{entrepreneur.status}</Badge>;
    }
  };

  const renderEntrepreneurDetails = (entrepreneur: any) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Nome Completo</Label>
          <p className="mt-1">{entrepreneur.nomeCompleto}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Email</Label>
          <p className="mt-1">{entrepreneur.email}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">CPF</Label>
          <p className="mt-1">{entrepreneur.cpf}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">RG</Label>
          <p className="mt-1">{entrepreneur.rg}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Status</Label>
          <div className="mt-1">{getStatusBadge(entrepreneur.status)}</div>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Data de Cadastro</Label>
          <p className="mt-1">{formatDate(entrepreneur.createdAt)}</p>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <Label className="text-sm font-medium text-gray-500">Endereço</Label>
        <p className="mt-1">
          {entrepreneur.rua}, {entrepreneur.numero}
          {entrepreneur.complemento && `, ${entrepreneur.complemento}`}
        </p>
        <p>{entrepreneur.bairro}, {entrepreneur.cidade} - {entrepreneur.estado}</p>
        <p>CEP: {entrepreneur.cep}</p>
      </div>
    </div>
  );

  const renderProfileApprovalItems = (entrepreneur: any) => (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg mb-4">Aprovação de Itens do Perfil</h4>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${entrepreneur.cadastroAprovado ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="font-medium">Cadastro Completo</span>
          </div>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant={entrepreneur.cadastroAprovado ? "default" : "outline"}
              onClick={() => approveFieldMutation.mutate({ userId: entrepreneur.id, field: 'cadastroAprovado', approved: true })}
              disabled={approveFieldMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Aprovar
            </Button>
            <Button 
              size="sm" 
              variant={!entrepreneur.cadastroAprovado ? "destructive" : "outline"}
              onClick={() => approveFieldMutation.mutate({ userId: entrepreneur.id, field: 'cadastroAprovado', approved: false })}
              disabled={approveFieldMutation.isPending}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Rejeitar
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${entrepreneur.emailConfirmado ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="font-medium">Email Confirmado</span>
          </div>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant={entrepreneur.emailConfirmado ? "default" : "outline"}
              onClick={() => approveFieldMutation.mutate({ userId: entrepreneur.id, field: 'emailConfirmado', approved: true })}
              disabled={approveFieldMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Aprovar
            </Button>
            <Button 
              size="sm" 
              variant={!entrepreneur.emailConfirmado ? "destructive" : "outline"}
              onClick={() => approveFieldMutation.mutate({ userId: entrepreneur.id, field: 'emailConfirmado', approved: false })}
              disabled={approveFieldMutation.isPending}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Rejeitar
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${entrepreneur.documentosVerificados ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="font-medium">Documentos Verificados</span>
          </div>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant={entrepreneur.documentosVerificados ? "default" : "outline"}
              onClick={() => approveFieldMutation.mutate({ userId: entrepreneur.id, field: 'documentosVerificados', approved: true })}
              disabled={approveFieldMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Aprovar
            </Button>
            <Button 
              size="sm" 
              variant={!entrepreneur.documentosVerificados ? "destructive" : "outline"}
              onClick={() => approveFieldMutation.mutate({ userId: entrepreneur.id, field: 'documentosVerificados', approved: false })}
              disabled={approveFieldMutation.isPending}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Rejeitar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <BackofficeSidebar onLogout={logout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Empreendedores</h1>
              <p className="text-gray-600">Gerencie cadastros e aprovações de empreendedores</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Briefcase className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-900">{entrepreneurs?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pendentes</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {entrepreneurs?.filter((e: any) => e.status === 'pendente').length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Aprovados</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {entrepreneurs?.filter((e: any) => e.status === 'ativo').length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <XCircle className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Inativos</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {entrepreneurs?.filter((e: any) => e.status === 'inativo').length || 0}
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
                    <CardTitle>Lista de Empreendedores</CardTitle>
                    <CardDescription>
                      Analise e gerencie todos os empreendedores cadastrados na plataforma
                    </CardDescription>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pendente">Pendentes</SelectItem>
                      <SelectItem value="ativo">Ativos</SelectItem>
                      <SelectItem value="inativo">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Carregando empreendedores...</div>
                ) : !entrepreneurs?.length ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum empreendedor encontrado</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data de Cadastro</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entrepreneurs.map((entrepreneur: any) => (
                        <TableRow key={entrepreneur.id}>
                          <TableCell className="font-medium">{entrepreneur.nomeCompleto}</TableCell>
                          <TableCell>{entrepreneur.email}</TableCell>
                          <TableCell>{entrepreneur.cpf}</TableCell>
                          <TableCell>{getStatusBadge(entrepreneur)}</TableCell>
                          <TableCell>{formatDate(entrepreneur.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedEntrepreneur(entrepreneur)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Ver
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedEntrepreneur(entrepreneur)}
                                  >
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    Analisar
                                  </Button>
                                </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Análise do Empreendedor</DialogTitle>
                                  <DialogDescription>
                                    Informações completas para aprovação
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedEntrepreneur && (
                                  <div className="space-y-6">
                                    {renderEntrepreneurDetails(selectedEntrepreneur)}
                                    {renderProfileApprovalItems(selectedEntrepreneur)}
                                    
                                    <div className="flex space-x-2 pt-4 border-t">
                                      <Button
                                        onClick={() => approveEntrepreneurMutation.mutate(selectedEntrepreneur.id)}
                                        disabled={approveEntrepreneurMutation.isPending}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Aprovar
                                      </Button>
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Rejeitar
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>Rejeitar Empreendedor</DialogTitle>
                                            <DialogDescription>
                                              Informe o motivo da rejeição
                                            </DialogDescription>
                                          </DialogHeader>
                                          <div className="space-y-4">
                                            <div>
                                              <Label htmlFor="rejection-reason">Motivo da Rejeição</Label>
                                              <Textarea
                                                id="rejection-reason"
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Descreva o motivo da rejeição..."
                                              />
                                            </div>
                                            <div className="flex space-x-2">
                                              <Button
                                                onClick={() => {
                                                  rejectEntrepreneurMutation.mutate({
                                                    entrepreneurId: selectedEntrepreneur.id,
                                                    reason: rejectionReason
                                                  });
                                                  setRejectionReason("");
                                                }}
                                                disabled={rejectEntrepreneurMutation.isPending || !rejectionReason.trim()}
                                                variant="destructive"
                                              >
                                                Confirmar Rejeição
                                              </Button>
                                            </div>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
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
          </div>
        </main>
      </div>

      {/* Entrepreneur Detail Modal */}
      {selectedEntrepreneur && (
        <Dialog open={!!selectedEntrepreneur} onOpenChange={() => setSelectedEntrepreneur(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Empreendedor</DialogTitle>
              <DialogDescription>
                Informações completas do empreendedor e suas empresas
              </DialogDescription>
            </DialogHeader>
            <EntrepreneurDetailView entrepreneur={selectedEntrepreneur} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Component for displaying entrepreneur details with companies
function EntrepreneurDetailView({ entrepreneur }: { entrepreneur: any }) {
  console.log('Entrepreneur data received:', entrepreneur);
  
  const { data: entrepreneurCompanies } = useQuery({
    queryKey: ["/api/companies", entrepreneur.id],
    queryFn: async () => {
      console.log('Fetching companies for entrepreneur ID:', entrepreneur.id);
      const response = await apiRequest("GET", `/api/companies?entrepreneurId=${entrepreneur.id}`);
      const data = await response.json();
      console.log('Companies response:', data);
      return data;
    }
  });

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="font-semibold">Nome Completo</Label>
          <p className="text-sm text-gray-700">{entrepreneur.nomeCompleto}</p>
        </div>
        <div>
          <Label className="font-semibold">Email</Label>
          <p className="text-sm text-gray-700">{entrepreneur.email}</p>
        </div>
        <div>
          <Label className="font-semibold">CPF</Label>
          <p className="text-sm text-gray-700">{entrepreneur.cpf}</p>
        </div>
        <div>
          <Label className="font-semibold">RG</Label>
          <p className="text-sm text-gray-700">{entrepreneur.rg}</p>
        </div>
      </div>

      {/* Address Information */}
      <div className="border-t pt-4">
        <Label className="font-semibold mb-2 block">Endereço</Label>
        <div className="text-sm text-gray-700">
          <p>{entrepreneur.rua}, {entrepreneur.numero}</p>
          {entrepreneur.complemento && <p>{entrepreneur.complemento}</p>}
          <p>{entrepreneur.bairro}, {entrepreneur.cidade} - {entrepreneur.estado}</p>
          <p>CEP: {entrepreneur.cep}</p>
        </div>
      </div>

      {/* Approval Status */}
      <div className="border-t pt-4">
        <Label className="font-semibold mb-2 block">Status de Aprovação</Label>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${entrepreneur.cadastroAprovado ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm">Cadastro Aprovado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${entrepreneur.emailConfirmado ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm">Email Confirmado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${entrepreneur.documentosVerificados ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm">Documentos Verificados</span>
          </div>
        </div>
      </div>

      {/* Companies */}
      <div className="border-t pt-4">
        <Label className="font-semibold mb-2 block">Empresas Cadastradas</Label>
        {entrepreneurCompanies && entrepreneurCompanies.length > 0 ? (
          <div className="space-y-3">
            {entrepreneurCompanies.map((company: any) => (
              <div key={company.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold text-xs">Razão Social</Label>
                    <p className="text-sm">{company.razaoSocial}</p>
                  </div>
                  <div>
                    <Label className="font-semibold text-xs">Nome Fantasia</Label>
                    <p className="text-sm">{company.nomeFantasia}</p>
                  </div>
                  <div>
                    <Label className="font-semibold text-xs">CNPJ</Label>
                    <p className="text-sm">{company.cnpj}</p>
                  </div>
                  <div>
                    <Label className="font-semibold text-xs">Status</Label>
                    <Badge variant="outline" className="text-xs">
                      {company.status || 'ativa'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Nenhuma empresa cadastrada</p>
        )}
      </div>
    </div>
  );
}