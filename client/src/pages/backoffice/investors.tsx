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

export default function BackofficeInvestors() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
      case "ativo":
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case "pendente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case "rejeitado":
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
      case "inativo":
        return <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Investidores</h1>
        <p className="text-gray-600">Gerencie e aprove cadastros de investidores</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Investidores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {investors?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes de Aprovação</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {investors?.filter((inv: any) => inv.status === "pendente").length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investidores Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {investors?.filter((inv: any) => inv.status === "ativo").length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejeitados</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {investors?.filter((inv: any) => inv.status === "rejeitado").length || 0}
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
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Investidores</CardTitle>
          <CardDescription>
            Gerencie todos os investidores cadastrados na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando investidores...</div>
          ) : !investors?.length ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
                                    <Label className="font-semibold">Status</Label>
                                    <div className="mt-1">{getStatusBadge(selectedInvestor.status)}</div>
                                  </div>
                                  <div>
                                    <Label className="font-semibold">Data de Cadastro</Label>
                                    <p>{formatDate(selectedInvestor.createdAt)}</p>
                                  </div>
                                  <div>
                                    <Label className="font-semibold">Data de Nascimento</Label>
                                    <p>{selectedInvestor.dataNascimento ? formatDate(selectedInvestor.dataNascimento) : "Não informado"}</p>
                                  </div>
                                  <div>
                                    <Label className="font-semibold">Telefone</Label>
                                    <p>{selectedInvestor.telefone || "Não informado"}</p>
                                  </div>
                                  <div>
                                    <Label className="font-semibold">Endereço</Label>
                                    <p>{selectedInvestor.endereco || "Não informado"}</p>
                                  </div>
                                </div>

                                {selectedInvestor.status === "pendente" && (
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
                                            <Label htmlFor="reason">Motivo da Rejeição</Label>
                                            <Textarea
                                              id="reason"
                                              placeholder="Descreva o motivo da rejeição..."
                                              rows={3}
                                            />
                                          </div>
                                          <div className="flex justify-end space-x-2">
                                            <Button
                                              onClick={() => {
                                                const reason = (document.getElementById("reason") as HTMLTextAreaElement)?.value;
                                                if (reason) {
                                                  rejectInvestorMutation.mutate({
                                                    investorId: selectedInvestor.id,
                                                    reason
                                                  });
                                                }
                                              }}
                                              disabled={rejectInvestorMutation.isPending}
                                              variant="destructive"
                                            >
                                              Confirmar Rejeição
                                            </Button>
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
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