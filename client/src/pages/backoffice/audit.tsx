import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import BackofficeNavbar from "@/components/layout/backoffice-navbar";
import { FileSearch, Shield, Building2, CreditCard, Eye } from "lucide-react";

export default function AuditPage() {
  const [entidadeFilter, setEntidadeFilter] = useState("");
  const [acaoFilter, setAcaoFilter] = useState("");

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["/api/admin/audit", { entidadeTipo: entidadeFilter, acao: acaoFilter }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (entidadeFilter && entidadeFilter !== 'all') params.append('entidadeTipo', entidadeFilter);
      if (acaoFilter && acaoFilter !== 'all') params.append('acao', acaoFilter);
      return fetch(`/api/admin/audit?${params}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
  });

  const getAcaoBadge = (acao: string) => {
    const acaoConfig = {
      aprovada_empresa: { label: "Empresa Aprovada", variant: "default" as const, icon: Building2 },
      reprovada_empresa: { label: "Empresa Reprovada", variant: "destructive" as const, icon: Building2 },
      aprovada_credito: { label: "Crédito Aprovado", variant: "default" as const, icon: CreditCard },
      reprovada_credito: { label: "Crédito Reprovado", variant: "destructive" as const, icon: CreditCard },
      em_analise_credito: { label: "Crédito em Análise", variant: "secondary" as const, icon: Eye },
    };

    const config = acaoConfig[acao as keyof typeof acaoConfig] || { 
      label: acao, 
      variant: "outline" as const, 
      icon: FileSearch 
    };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getEntidadeBadge = (tipo: string) => {
    const tipoConfig = {
      company: { label: "Empresa", variant: "secondary" as const, icon: Building2 },
      credit_request: { label: "Solicitação", variant: "outline" as const, icon: CreditCard },
      user: { label: "Usuário", variant: "secondary" as const, icon: Shield },
    };

    const config = tipoConfig[tipo as keyof typeof tipoConfig] || { 
      label: tipo, 
      variant: "outline" as const, 
      icon: FileSearch 
    };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BackofficeNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Auditoria do Sistema</h1>
          <p className="text-gray-600">Histórico de todas as ações realizadas no sistema</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Entidade:</span>
            <Select value={entidadeFilter} onValueChange={setEntidadeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas as entidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as entidades</SelectItem>
                <SelectItem value="company">Empresas</SelectItem>
                <SelectItem value="credit_request">Solicitações de Crédito</SelectItem>
                <SelectItem value="user">Usuários</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Ação:</span>
            <Select value={acaoFilter} onValueChange={setAcaoFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas as ações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                <SelectItem value="aprovada_empresa">Empresa Aprovada</SelectItem>
                <SelectItem value="reprovada_empresa">Empresa Reprovada</SelectItem>
                <SelectItem value="aprovada_credito">Crédito Aprovado</SelectItem>
                <SelectItem value="reprovada_credito">Crédito Reprovado</SelectItem>
                <SelectItem value="em_analise_credito">Crédito em Análise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="w-5 h-5" />
              Log de Auditoria
            </CardTitle>
            <CardDescription>
              Registro de todas as ações administrativas realizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded">
                    <div className="w-20 h-6 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : auditLogs && auditLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Entidade</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {new Date(log.createdAt).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {getAcaoBadge(log.acao)}
                        </TableCell>
                        <TableCell>
                          {getEntidadeBadge(log.entidadeTipo)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          #{log.entidadeId}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{log.adminUserNome}</div>
                            <div className="text-xs text-gray-500">{log.adminUserEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {log.observacoes && (
                            <div className="text-sm text-gray-600 truncate" title={log.observacoes}>
                              {log.observacoes}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Nenhum registro de auditoria encontrado</p>
                <p className="text-sm text-gray-500">
                  Os logs de auditoria aparecerão aqui conforme as ações são realizadas no sistema
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}