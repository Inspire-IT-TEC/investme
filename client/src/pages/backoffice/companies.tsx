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
import { Search, Eye, Edit, Building2 } from "lucide-react";

export default function BackofficeCompanies() {
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
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editObservacoes, setEditObservacoes] = useState("");

  const { data: companies, isLoading } = useQuery({
    queryKey: ["/api/admin/companies", { status: statusFilter, search }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);
      return fetch(`/api/admin/companies?${params}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
  });

  const { data: companyDetails } = useQuery({
    queryKey: ["/api/admin/companies", selectedCompany?.id],
    queryFn: () => 
      fetch(`/api/admin/companies/${selectedCompany.id}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json()),
    enabled: !!selectedCompany?.id,
  });

  const updateCompanyMutation = useMutation({
    mutationFn: ({ id, status, observacoesInternas }: any) =>
      apiRequest("PATCH", `/api/admin/companies/${id}`, { status, observacoesInternas }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      setEditDialogOpen(false);
      setSelectedCompany(null);
      toast({
        title: "Empresa atualizada",
        description: "A empresa foi atualizada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Erro ao atualizar empresa.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente_analise: { label: "Pendente de Análise", variant: "secondary" as const },
      em_analise: { label: "Em Análise", variant: "secondary" as const },
      aprovada: { label: "Aprovada", variant: "default" as const },
      reprovada: { label: "Reprovada", variant: "destructive" as const },
      incompleto: { label: "Incompleto", variant: "secondary" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente_analise;
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const handleUpdateCompany = () => {
    if (!selectedCompany) return;
    
    updateCompanyMutation.mutate({
      id: selectedCompany.id,
      status: editStatus,
      observacoesInternas: editObservacoes
    });
  };

  const openEditDialog = (company: any) => {
    setSelectedCompany(company);
    setEditStatus(company.status);
    setEditObservacoes(company.observacoesInternas || "");
    setEditDialogOpen(true);
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
                      <Building2 className="w-5 h-5" />
                      Gestão de Empresas
                    </CardTitle>
                    <CardDescription>
                      Gerencie empresas cadastradas na plataforma
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar empresas..."
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
                      <SelectItem value="pendente_analise">Pendente de Análise</SelectItem>
                      <SelectItem value="em_analise">Em Análise</SelectItem>
                      <SelectItem value="aprovada">Aprovada</SelectItem>
                      <SelectItem value="reprovada">Reprovada</SelectItem>
                      <SelectItem value="incompleto">Incompleto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Carregando empresas...</div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Razão Social</TableHead>
                          <TableHead>Nome Fantasia</TableHead>
                          <TableHead>CNPJ</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {companies && companies.length > 0 ? (
                          companies.map((company: any) => (
                            <TableRow key={company.id}>
                              <TableCell className="font-medium">{company.razaoSocial}</TableCell>
                              <TableCell>{company.nomeFantasia}</TableCell>
                              <TableCell>{company.cnpj}</TableCell>
                              <TableCell>{getStatusBadge(company.status)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedCompany(company)}
                                      >
                                        <Eye className="w-4 h-4 mr-1" />
                                        Visualizar
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Detalhes da Empresa</DialogTitle>
                                        <DialogDescription>
                                          Informações completas da empresa
                                        </DialogDescription>
                                      </DialogHeader>
                                      {selectedCompany && (
                                        <div className="space-y-4">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <Label className="text-sm font-medium text-gray-500">Razão Social</Label>
                                              <p className="mt-1">{selectedCompany.razaoSocial}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium text-gray-500">Nome Fantasia</Label>
                                              <p className="mt-1">{selectedCompany.nomeFantasia}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium text-gray-500">CNPJ</Label>
                                              <p className="mt-1">{selectedCompany.cnpj}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium text-gray-500">Status</Label>
                                              <div className="mt-1">{getStatusBadge(selectedCompany.status)}</div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                  
                                  <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditDialog(company)}
                                      >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Editar
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Editar Empresa</DialogTitle>
                                        <DialogDescription>
                                          Altere o status e observações da empresa
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="edit-status">Status</Label>
                                          <Select value={editStatus} onValueChange={setEditStatus}>
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="pendente_analise">Pendente de Análise</SelectItem>
                                              <SelectItem value="em_analise">Em Análise</SelectItem>
                                              <SelectItem value="aprovada">Aprovada</SelectItem>
                                              <SelectItem value="reprovada">Reprovada</SelectItem>
                                              <SelectItem value="incompleto">Incompleto</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label htmlFor="edit-observacoes">Observações Internas</Label>
                                          <Textarea
                                            id="edit-observacoes"
                                            value={editObservacoes}
                                            onChange={(e) => setEditObservacoes(e.target.value)}
                                            placeholder="Adicione observações internas..."
                                          />
                                        </div>
                                        <div className="flex space-x-2">
                                          <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setEditDialogOpen(false)}
                                          >
                                            Cancelar
                                          </Button>
                                          <Button
                                            type="button"
                                            disabled={updateCompanyMutation.isPending}
                                            onClick={handleUpdateCompany}
                                          >
                                            {updateCompanyMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600">Nenhuma empresa encontrada</p>
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