import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { TrendingUp, Users, CheckCircle, XCircle, Eye, UserCheck, AlertCircle } from "lucide-react";
import BackofficeSidebar from "@/components/layout/backoffice-sidebar";
import { useAuth, useRequireAdmin } from "@/hooks/use-auth";

export default function BackofficeInvestors() {
  const { toast } = useToast();
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const isAuthorized = useRequireAdmin();

  if (!isAuthorized) {
    return null;
  }
  
  const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch investors
  const { data: investors, isLoading } = useQuery({
    queryKey: ["/api/admin/investors", statusFilter],
    queryFn: async () => {
      const url = statusFilter === "all" ? "/api/admin/investors" : `/api/admin/investors?status=${statusFilter}`;
      const response = await apiRequest("GET", url);
      return response.json();
    },
  });

  // Approve investor mutation
  const approveInvestorMutation = useMutation({
    mutationFn: async (investorId: number) => {
      const response = await apiRequest("POST", `/api/admin/investors/${investorId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/investors"] });
      toast({
        title: "Investidor aprovado",
        description: "O investidor foi aprovado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao aprovar",
        description: error.message || "Erro ao aprovar investidor.",
        variant: "destructive",
      });
    },
  });

  // Reject investor mutation
  const rejectInvestorMutation = useMutation({
    mutationFn: async ({ investorId, reason }: { investorId: number; reason: string }) => {
      const response = await apiRequest("POST", `/api/admin/investors/${investorId}/reject`, { reason });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/investors"] });
      toast({
        title: "Investidor rejeitado",
        description: "O investidor foi rejeitado.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao rejeitar",
        description: error.message || "Erro ao rejeitar investidor.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'pendente':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'inativo':
        return <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderInvestorDetails = (investor: any) => {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="font-semibold">Nome Completo</Label>
          <p className="text-sm text-gray-700">{investor.nomeCompleto}</p>
        </div>
        <div>
          <Label className="font-semibold">Email</Label>
          <p className="text-sm text-gray-700">{investor.email}</p>
        </div>
        <div>
          <Label className="font-semibold">CPF</Label>
          <p className="text-sm text-gray-700">{investor.cpf}</p>
        </div>
        <div>
          <Label className="font-semibold">RG</Label>
          <p className="text-sm text-gray-700">{investor.rg}</p>
        </div>
        <div>
          <Label className="font-semibold">Telefone</Label>
          <p className="text-sm text-gray-700">{investor.telefone || 'Não informado'}</p>
        </div>
        <div>
          <Label className="font-semibold">Data de Nascimento</Label>
          <p className="text-sm text-gray-700">{investor.dataNascimento ? formatDate(investor.dataNascimento) : 'Não informado'}</p>
        </div>
        <div>
          <Label className="font-semibold">Profissão</Label>
          <p className="text-sm text-gray-700">{investor.profissao || 'Não informado'}</p>
        </div>
        <div>
          <Label className="font-semibold">Renda Mensal</Label>
          <p className="text-sm text-gray-700">{investor.rendaMensal ? formatCurrency(investor.rendaMensal) : 'Não informado'}</p>
        </div>
        <div className="col-span-2">
          <Label className="font-semibold">Endereço</Label>
          <p className="text-sm text-gray-700">
            {[investor.rua, investor.numero, investor.cidade, investor.estado, investor.cep].filter(Boolean).join(', ') || 'Não informado'}
          </p>
        </div>
        <div className="col-span-2">
          <Label className="font-semibold">Experiência em Investimentos</Label>
          <p className="text-sm text-gray-700">{investor.experienciaInvestimentos || 'Não informado'}</p>
        </div>
        <div className="col-span-2">
          <Label className="font-semibold">Objetivos de Investimento</Label>
          <p className="text-sm text-gray-700">{investor.objetivosInvestimento || 'Não informado'}</p>
        </div>
      </div>
    );
  };

  const renderInvestorApprovalItems = (investor: any) => {
    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Aprovação de Itens do Perfil</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${investor.cadastroAprovado ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="font-medium text-gray-900">Cadastro Completo</span>
            </div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => handleFieldApproval(investor.id, 'cadastroAprovado', true)}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Aprovar
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
                onClick={() => handleFieldApproval(investor.id, 'cadastroAprovado', false)}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Rejeitar
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${investor.emailConfirmado ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="font-medium text-gray-900">Email Confirmado</span>
            </div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => handleFieldApproval(investor.id, 'emailConfirmado', true)}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Aprovar
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
                onClick={() => handleFieldApproval(investor.id, 'emailConfirmado', false)}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Rejeitar
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${investor.documentosVerificados ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="font-medium text-gray-900">Documentos Verificados</span>
            </div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => handleFieldApproval(investor.id, 'documentosVerificados', true)}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Aprovar
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
                onClick={() => handleFieldApproval(investor.id, 'documentosVerificados', false)}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Rejeitar
              </Button>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 pt-4">
          <Button
            onClick={() => approveInvestorMutation.mutate(investor.id)}
            disabled={approveInvestorMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Aprovar
          </Button>
          <Button 
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => {
              // Abrir modal de rejeição se necessário
            }}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Rejeitar
          </Button>
        </div>
      </div>
    );
  };

  const handleFieldApproval = async (investorId: number, field: string, approved: boolean) => {
    try {
      await apiRequest("PATCH", `/api/admin/investors/${investorId}/approve-field`, {
        field,
        approved
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/investors"] });
      toast({
        title: approved ? "Campo aprovado" : "Campo desaprovado",
        description: `O campo foi ${approved ? "aprovado" : "desaprovado"} com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar campo.",
        variant: "destructive",
      });
    }
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
                <h1 className="text-3xl font-bold text-gray-900">Gestão de Investidores</h1>
                <p className="text-gray-600">Gerencie e aprove cadastros de investidores</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total</p>
                        <p className="text-2xl font-bold text-gray-900">{investors?.length || 0}</p>
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
                          {investors?.filter((i: any) => i.status === 'pendente').length || 0}
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
                          {investors?.filter((i: any) => i.status === 'ativo').length || 0}
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
                          {investors?.filter((i: any) => i.status === 'inativo').length || 0}
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
                      <CardTitle>Lista de Investidores</CardTitle>
                      <CardDescription>
                        Analise e gerencie todos os investidores cadastrados na plataforma
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
                    <div className="text-center py-8">Carregando investidores...</div>
                  ) : !investors?.length ? (
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nenhum investidor encontrado</p>
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
                        {investors.map((investor: any) => (
                          <TableRow key={investor.id}>
                            <TableCell className="font-medium">{investor.nomeCompleto}</TableCell>
                            <TableCell>{investor.email}</TableCell>
                            <TableCell>{investor.cpf}</TableCell>
                            <TableCell>{getStatusBadge(investor.status)}</TableCell>
                            <TableCell>{formatDate(investor.createdAt)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedInvestor(investor)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Ver
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setSelectedInvestor(investor)}
                                    >
                                      <UserCheck className="w-4 h-4 mr-1" />
                                      Analisar
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Análise do Investidor</DialogTitle>
                                      <DialogDescription>
                                        Informações completas para aprovação
                                      </DialogDescription>
                                    </DialogHeader>
                                    {selectedInvestor && (
                                      <div className="space-y-6">
                                        {renderInvestorDetails(selectedInvestor)}
                                        
                                        <div className="border-t pt-4">
                                          {renderInvestorApprovalItems(selectedInvestor)}
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
          </div>
        </main>
      </div>

      {/* Investor Detail Modal */}
      {selectedInvestor && (
        <Dialog open={!!selectedInvestor} onOpenChange={() => setSelectedInvestor(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Investidor</DialogTitle>
              <DialogDescription>
                Informações completas do investidor
              </DialogDescription>
            </DialogHeader>
            <InvestorDetailView investor={selectedInvestor} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Component for displaying investor details
function InvestorDetailView({ investor }: { investor: any }) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="font-semibold">Nome Completo</Label>
          <p className="text-sm text-gray-700">{investor.nomeCompleto}</p>
        </div>
        <div>
          <Label className="font-semibold">Email</Label>
          <p className="text-sm text-gray-700">{investor.email}</p>
        </div>
        <div>
          <Label className="font-semibold">CPF</Label>
          <p className="text-sm text-gray-700">{investor.cpf}</p>
        </div>
        <div>
          <Label className="font-semibold">RG</Label>
          <p className="text-sm text-gray-700">{investor.rg}</p>
        </div>
        <div>
          <Label className="font-semibold">Telefone</Label>
          <p className="text-sm text-gray-700">{investor.telefone || 'Não informado'}</p>
        </div>
        <div>
          <Label className="font-semibold">Data de Nascimento</Label>
          <p className="text-sm text-gray-700">{investor.dataNascimento ? formatDate(investor.dataNascimento) : 'Não informado'}</p>
        </div>
        <div>
          <Label className="font-semibold">Profissão</Label>
          <p className="text-sm text-gray-700">{investor.profissao || 'Não informado'}</p>
        </div>
        <div>
          <Label className="font-semibold">Renda Mensal</Label>
          <p className="text-sm text-gray-700">{investor.rendaMensal ? formatCurrency(investor.rendaMensal) : 'Não informado'}</p>
        </div>
      </div>

      {/* Address Information */}
      {(investor.rua || investor.cidade || investor.estado || investor.cep) && (
        <div>
          <Label className="font-semibold">Endereço</Label>
          <p className="text-sm text-gray-700">
            {[investor.rua, investor.numero, investor.cidade, investor.estado, investor.cep].filter(Boolean).join(', ') || 'Não informado'}
          </p>
        </div>
      )}

      {/* Investment Information */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Informações de Investimento</h4>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label className="font-semibold">Experiência em Investimentos</Label>
            <p className="text-sm text-gray-700">{investor.experienciaInvestimentos || 'Não informado'}</p>
          </div>
          <div>
            <Label className="font-semibold">Objetivos de Investimento</Label>
            <p className="text-sm text-gray-700">{investor.objetivosInvestimento || 'Não informado'}</p>
          </div>
        </div>
      </div>

      {/* Status Information */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Status do Cadastro</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Label className="font-medium">Email Confirmado:</Label>
            {investor.emailConfirmado ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <span className="text-sm">{investor.emailConfirmado ? 'Sim' : 'Não'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Label className="font-medium">Documentos Verificados:</Label>
            {investor.documentosVerificados ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <span className="text-sm">{investor.documentosVerificados ? 'Sim' : 'Não'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Label className="font-medium">Renda Comprovada:</Label>
            {investor.rendaComprovada ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <span className="text-sm">{investor.rendaComprovada ? 'Sim' : 'Não'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Label className="font-medium">Cadastro Aprovado:</Label>
            {investor.cadastroAprovado ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <span className="text-sm">{investor.cadastroAprovado ? 'Sim' : 'Não'}</span>
          </div>
        </div>
      </div>

      {/* Registration Date */}
      <div>
        <Label className="font-semibold">Data de Cadastro</Label>
        <p className="text-sm text-gray-700">{formatDate(investor.createdAt)}</p>
      </div>
    </div>
  );
}