import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search,
  Building2, 
  TrendingUp, 
  Eye, 
  Calculator,
  Users,
  MapPin,
  Calendar,
  DollarSign
} from "lucide-react";
import { useLocation } from "wouter";

const InvestorNetworkPage = () => {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  // Fetch companies with valuations for the network view
  const { data: networkCompanies, isLoading } = useQuery({
    queryKey: ["/api/network/companies", { search, sector: sectorFilter, status: statusFilter }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (sectorFilter && sectorFilter !== 'all') params.append('sector', sectorFilter);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      
      return fetch(`/api/network/companies?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'aprovada': { label: 'Aprovada', variant: 'default' as const },
      'pendente': { label: 'Pendente', variant: 'secondary' as const },
      'rejeitada': { label: 'Rejeitada', variant: 'destructive' as const },
      'em_analise': { label: 'Em Análise', variant: 'outline' as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getValuationStatusBadge = (status: string) => {
    return status === "completed" ? (
      <Badge variant="default" className="bg-green-600">Avaliado</Badge>
    ) : (
      <Badge variant="secondary">Rascunho</Badge>
    );
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Get valuation author info based on RF021
  const getValuationAuthor = (valuation: any) => {
    if (valuation.userType === 'entrepreneur') {
      return `Valuation realizado pelo Empreendedor`;
    } else {
      return `Valuation realizado pelo Investidor`;
    }
  };

  const viewValuationDetails = (company: any) => {
    // RF020: Direct to detailed valuation view without editing permissions
    if (company.latestValuation) {
      setLocation(`/companies/${company.id}/valuation/${company.latestValuation.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Carregando rede de empresas...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rede de Empresas</h1>
          <p className="text-muted-foreground">
            Explore empresas disponíveis para investimento com suas respectivas avaliações
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Buscar empresa</label>
              <Input
                placeholder="Nome ou CNPJ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Setor</label>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os setores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os setores</SelectItem>
                  <SelectItem value="tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="saude">Saúde</SelectItem>
                  <SelectItem value="educacao">Educação</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="varejo">Varejo</SelectItem>
                  <SelectItem value="industria">Indústria</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="aprovada">Aprovadas</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Companies List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Empresas na Rede ({networkCompanies?.length || 0})
          </CardTitle>
          <CardDescription>
            Empresas disponíveis para análise e investimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {networkCompanies && networkCompanies.length > 0 ? (
            <div className="space-y-4">
              {networkCompanies.map((company: any) => (
                <Card key={company.id} className="border hover:border-blue-300 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Building2 className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold">{company.razaoSocial}</h3>
                          {getStatusBadge(company.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{company.numeroFuncionarios} funcionários</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{company.cidade}, {company.estado}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>Desde {formatDate(company.dataFundacao)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span>{formatCurrency(company.faturamento)} (fatur.)</span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {company.descricaoNegocio}
                        </p>

                        {/* Valuation Display - RF019 */}
                        {company.latestValuation && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="font-medium text-green-800">Valuation Disponível</span>
                                {getValuationStatusBadge(company.latestValuation.status)}
                              </div>
                              <Badge variant="outline">
                                {company.latestValuation.method === "dcf" ? "DCF" : "Múltiplos"}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {company.latestValuation.enterpriseValue && (
                                <div>
                                  <p className="text-xs text-green-600 font-medium">Valor da Empresa</p>
                                  <p className="text-lg font-bold text-green-800">
                                    {formatCurrency(company.latestValuation.enterpriseValue)}
                                  </p>
                                </div>
                              )}
                              {company.latestValuation.equityValue && (
                                <div>
                                  <p className="text-xs text-green-600 font-medium">Valor do Equity</p>
                                  <p className="text-lg font-bold text-green-800">
                                    {formatCurrency(company.latestValuation.equityValue)}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {/* RF021: Show who performed the valuation */}
                            <p className="text-xs text-green-600 mt-2">
                              {getValuationAuthor(company.latestValuation)} • {formatDate(company.latestValuation.createdAt)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {/* RF020: View valuation details without edit permission */}
                        {company.latestValuation && (
                          <Button
                            onClick={() => viewValuationDetails(company)}
                            variant="outline"
                            size="sm"
                          >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Ver Valuation
                          </Button>
                        )}
                        
                        {/* RF002: Investor can create their own valuation for this company */}
                        <Button
                          onClick={() => setLocation(`/companies/${company.id}/valuation`)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Fazer Valuation
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCompany(company)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Detalhes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalhes da Empresa</DialogTitle>
                              <DialogDescription>
                                Informações completas sobre {selectedCompany?.razaoSocial}
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedCompany && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">CNPJ</p>
                                    <p>{selectedCompany.cnpj}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Setor</p>
                                    <p>{selectedCompany.setor || "Não informado"}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Faturamento</p>
                                    <p>{formatCurrency(selectedCompany.faturamento)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Funcionários</p>
                                    <p>{selectedCompany.numeroFuncionarios}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-2">Descrição do Negócio</p>
                                  <p className="text-sm">{selectedCompany.descricaoNegocio}</p>
                                </div>

                                {selectedCompany.latestValuation && (
                                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h4 className="font-medium text-green-800 mb-2">Valuation Atual</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-xs text-green-600">Método</p>
                                        <p className="font-medium">
                                          {selectedCompany.latestValuation.method === "dcf" ? "DCF" : "Múltiplos"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-green-600">Data</p>
                                        <p className="font-medium">{formatDate(selectedCompany.latestValuation.createdAt)}</p>
                                      </div>
                                      {selectedCompany.latestValuation.equityValue && (
                                        <div className="col-span-2">
                                          <p className="text-xs text-green-600">Valor do Equity</p>
                                          <p className="text-xl font-bold text-green-800">
                                            {formatCurrency(selectedCompany.latestValuation.equityValue)}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-xs text-green-600 mt-2">
                                      {getValuationAuthor(selectedCompany.latestValuation)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
              <p className="text-gray-600">
                Ajuste os filtros para encontrar empresas disponíveis na rede
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestorNetworkPage;