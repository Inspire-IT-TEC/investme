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
import { Search, Eye, Edit, Building2 } from "lucide-react";

export default function BackofficeCompanies() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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
    mutationFn: async (data: { id: number; status: string; observacoesInternas: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/companies/${data.id}`, {
        status: data.status,
        observacoesInternas: data.observacoesInternas
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Empresa atualizada",
        description: "Status da empresa foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      setEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Erro ao atualizar empresa",
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

  const handleUpdateCompany = (formData: FormData) => {
    if (!selectedCompany) return;
    
    const status = formData.get('status') as string;
    const observacoesInternas = formData.get('observacoesInternas') as string;
    
    updateCompanyMutation.mutate({
      id: selectedCompany.id,
      status,
      observacoesInternas
    });
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
                  <Building2 className="w-5 h-5" />
                  Empresas Cadastradas
                </CardTitle>
                <CardDescription>
                  Gerencie e analise empresas cadastradas na plataforma
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
                    <SelectValue placeholder="Todos os Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="pendente_analise">Pendente de Análise</SelectItem>
                    <SelectItem value="em_analise">Em Análise</SelectItem>
                    <SelectItem value="aprovada">Aprovada</SelectItem>
                    <SelectItem value="reprovada">Reprovada</SelectItem>
                    <SelectItem value="incompleto">Incompleto</SelectItem>
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
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Data Cadastro</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies && companies.length > 0 ? (
                      companies.map((company: any) => (
                        <TableRow key={company.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{company.razaoSocial}</div>
                              <div className="text-sm text-gray-500">{company.nomeFantasia}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">{company.cnpj}</TableCell>
                          <TableCell>
                            {new Date(company.createdAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(company.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedCompany(company)}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Ver Detalhes
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Detalhes da Empresa</DialogTitle>
                                    <DialogDescription>
                                      Informações completas da empresa cadastrada
                                    </DialogDescription>
                                  </DialogHeader>
                                  {companyDetails && (
                                    <div className="space-y-6">
                                      {/* Dados Básicos */}
                                      <div>
                                        <h3 className="text-lg font-medium mb-3">Dados Básicos</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div>
                                            <span className="font-medium">Razão Social:</span>
                                            <p>{companyDetails.razaoSocial}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium">Nome Fantasia:</span>
                                            <p>{companyDetails.nomeFantasia || '-'}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium">CNPJ:</span>
                                            <p>{companyDetails.cnpj}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium">Data Fundação:</span>
                                            <p>{new Date(companyDetails.dataFundacao).toLocaleDateString('pt-BR')}</p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Dados Financeiros */}
                                      <div>
                                        <h3 className="text-lg font-medium mb-3">Dados Financeiros</h3>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                          <div>
                                            <span className="font-medium">Faturamento:</span>
                                            <p>R$ {parseFloat(companyDetails.faturamento).toLocaleString('pt-BR')}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium">EBITDA:</span>
                                            <p>R$ {parseFloat(companyDetails.ebitda).toLocaleString('pt-BR')}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium">Dívida Líquida:</span>
                                            <p>R$ {parseFloat(companyDetails.dividaLiquida).toLocaleString('pt-BR')}</p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Sócios */}
                                      {companyDetails.shareholders && companyDetails.shareholders.length > 0 && (
                                        <div>
                                          <h3 className="text-lg font-medium mb-3">Quadro Societário</h3>
                                          <div className="space-y-2">
                                            {companyDetails.shareholders.map((shareholder: any, index: number) => (
                                              <div key={index} className="flex justify-between text-sm">
                                                <span>{shareholder.nomeCompleto}</span>
                                                <span className="font-mono">{shareholder.cpf}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Garantias */}
                                      {companyDetails.guarantees && companyDetails.guarantees.length > 0 && (
                                        <div>
                                          <h3 className="text-lg font-medium mb-3">Garantias</h3>
                                          <div className="space-y-3">
                                            {companyDetails.guarantees.map((guarantee: any, index: number) => (
                                              <div key={index} className="border border-gray-200 rounded p-3 text-sm">
                                                <div className="flex justify-between">
                                                  <span className="font-medium capitalize">{guarantee.tipo}</span>
                                                  <span>R$ {parseFloat(guarantee.valorEstimado).toLocaleString('pt-BR')}</span>
                                                </div>
                                                {guarantee.matricula && <p>Matrícula: {guarantee.matricula}</p>}
                                                {guarantee.renavam && <p>RENAVAM: {guarantee.renavam}</p>}
                                                {guarantee.descricao && <p>Descrição: {guarantee.descricao}</p>}
                                              </div>
                                            ))}
                                          </div>
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
                                    onClick={() => setSelectedCompany(company)}
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
                                  <form action={handleUpdateCompany} className="space-y-4">
                                    <div>
                                      <Label htmlFor="status">Status da Empresa</Label>
                                      <Select name="status" defaultValue={selectedCompany?.status}>
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
                                      <Label htmlFor="observacoesInternas">Observações Internas</Label>
                                      <Textarea
                                        name="observacoesInternas"
                                        defaultValue={selectedCompany?.observacoesInternas || ""}
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
                                        disabled={updateCompanyMutation.isPending}
                                      >
                                        {updateCompanyMutation.isPending ? "Salvando..." : "Salvar Alterações"}
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
  );
}
