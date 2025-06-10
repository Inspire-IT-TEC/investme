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
import { useAuth } from "@/hooks/use-auth";

export default function BackofficeInvestors() {
  const { toast } = useToast();
  const { logout } = useAuth();
  const queryClient = useQueryClient();
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
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setSelectedInvestor(investor)}
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      Ver
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Detalhes do Investidor</DialogTitle>
                                      <DialogDescription>
                                        Informações completas do investidor
                                      </DialogDescription>
                                    </DialogHeader>
                                    {selectedInvestor && (
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label className="font-semibold">Nome Completo</Label>
                                            <p>{selectedInvestor.nomeCompleto}</p>
                                          </div>
                                          <div>
                                            <Label className="font-semibold">Email</Label>
                                            <p>{selectedInvestor.email}</p>
                                          </div>
                                          <div>
                                            <Label className="font-semibold">CPF</Label>
                                            <p>{selectedInvestor.cpf}</p>
                                          </div>
                                          <div>
                                            <Label className="font-semibold">RG</Label>
                                            <p>{selectedInvestor.rg}</p>
                                          </div>
                                          <div>
                                            <Label className="font-semibold">Status</Label>
                                            <div className="mt-1">{getStatusBadge(selectedInvestor.status)}</div>
                                          </div>
                                        </div>
                                        
                                        <div className="flex space-x-2 pt-4 border-t">
                                          <Button
                                            onClick={() => approveInvestorMutation.mutate(selectedInvestor.id)}
                                            disabled={approveInvestorMutation.isPending}
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
                                                <DialogTitle>Rejeitar Investidor</DialogTitle>
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
                                                      rejectInvestorMutation.mutate({
                                                        investorId: selectedInvestor.id,
                                                        reason: rejectionReason
                                                      });
                                                      setRejectionReason("");
                                                    }}
                                                    disabled={rejectInvestorMutation.isPending || !rejectionReason.trim()}
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
          </div>
        </main>
      </div>
    </div>
  );
}