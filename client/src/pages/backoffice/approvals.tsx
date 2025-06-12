import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { CheckCircle, XCircle, Eye, UserCheck, Building, AlertCircle } from "lucide-react";
import BackofficeSidebar from "@/components/layout/backoffice-sidebar";
import { useAuth, useRequireAdmin } from "@/hooks/use-auth";

export default function BackofficeApprovals() {
  const { toast } = useToast();
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const isAuthorized = useRequireAdmin();

  if (!isAuthorized) {
    return null;
  }
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch pending investors
  const { data: pendingInvestors, isLoading: investorsLoading } = useQuery({
    queryKey: ["/api/admin/investors", "pendente"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/investors?status=pendente");
      return response.json();
    },
  });

  // Fetch pending entrepreneurs
  const { data: pendingEntrepreneurs, isLoading: entrepreneursLoading } = useQuery({
    queryKey: ["/api/admin/entrepreneurs", "pendente"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users?tipo=entrepreneur&status=pendente");
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

  // Approve entrepreneur mutation
  const approveEntrepreneurMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/approve`);
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
    mutationFn: async ({ userId, reason }: { userId: number; reason: string }) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/reject`, { reason });
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

  return (
    <div className="flex h-screen bg-gray-50">
      <BackofficeSidebar onLogout={logout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Aprovação de Cadastros</h1>
                <p className="text-gray-600">Aprove ou rejeite cadastros de investidores e empreendedores</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Investidores Pendentes</CardTitle>
                    <UserCheck className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pendingInvestors?.length || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Empreendedores Pendentes</CardTitle>
                    <Building className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pendingEntrepreneurs?.length || 0}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <Tabs defaultValue="investors" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="investors">
                    Investidores ({pendingInvestors?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="entrepreneurs">
                    Empreendedores ({pendingEntrepreneurs?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="investors" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Investidores Pendentes de Aprovação</CardTitle>
                      <CardDescription>
                        Analise e aprove cadastros de investidores
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {investorsLoading ? (
                        <div className="text-center py-8">Carregando investidores...</div>
                      ) : !pendingInvestors?.length ? (
                        <div className="text-center py-8">
                          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Nenhum investidor pendente de aprovação</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nome</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>CPF</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead>Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pendingInvestors.map((investor: any) => (
                              <TableRow key={investor.id}>
                                <TableCell className="font-medium">{investor.nomeCompleto}</TableCell>
                                <TableCell>{investor.email}</TableCell>
                                <TableCell>{investor.cpf}</TableCell>
                                <TableCell>{formatDate(investor.createdAt)}</TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      onClick={() => approveInvestorMutation.mutate(investor.id)}
                                      disabled={approveInvestorMutation.isPending}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Aprovar
                                    </Button>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="border-red-200 text-red-600 hover:bg-red-50"
                                        >
                                          <XCircle className="w-4 h-4 mr-1" />
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
                                          <Button
                                            onClick={() => {
                                              rejectInvestorMutation.mutate({
                                                investorId: investor.id,
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

                <TabsContent value="entrepreneurs" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Empreendedores Pendentes de Aprovação</CardTitle>
                      <CardDescription>
                        Analise e aprove cadastros de empreendedores
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {entrepreneursLoading ? (
                        <div className="text-center py-8">Carregando empreendedores...</div>
                      ) : !pendingEntrepreneurs?.length ? (
                        <div className="text-center py-8">
                          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Nenhum empreendedor pendente de aprovação</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nome</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>CPF</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead>Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pendingEntrepreneurs.map((entrepreneur: any) => (
                              <TableRow key={entrepreneur.id}>
                                <TableCell className="font-medium">{entrepreneur.nomeCompleto}</TableCell>
                                <TableCell>{entrepreneur.email}</TableCell>
                                <TableCell>{entrepreneur.cpf}</TableCell>
                                <TableCell>{formatDate(entrepreneur.createdAt)}</TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      onClick={() => approveEntrepreneurMutation.mutate(entrepreneur.id)}
                                      disabled={approveEntrepreneurMutation.isPending}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Aprovar
                                    </Button>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="border-red-200 text-red-600 hover:bg-red-50"
                                        >
                                          <XCircle className="w-4 h-4 mr-1" />
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
                                          <Button
                                            onClick={() => {
                                              rejectEntrepreneurMutation.mutate({
                                                userId: entrepreneur.id,
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
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}