import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModernSidebarLayout } from "@/components/layout/modern-sidebar-layout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  CreditCard, 
  Eye, 
  Search, 
  Filter, 
  Calendar,
  DollarSign,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  FileText
} from "lucide-react";

export default function InvestorCreditRequests() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Fetch available credit requests
  const { data: availableRequests, isLoading: loadingAvailable } = useQuery({
    queryKey: ['/api/investor/credit-requests'],
    queryFn: () => {
      return fetch('/api/investor/credit-requests', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
  });

  // Fetch approved analysis (requests I've approved)
  const { data: approvedRequests, isLoading: loadingApproved } = useQuery({
    queryKey: ['/api/investor/approved-analysis'],
    queryFn: () => {
      return fetch('/api/investor/approved-analysis', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
  });

  // Accept credit request for analysis
  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await fetch(`/api/investor/credit-requests/${requestId}/accept`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Erro ao aceitar solicitação');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/investor/credit-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/investor/approved-analysis'] });
      toast({
        title: "Solicitação aceita",
        description: "Você agora pode analisar esta solicitação de crédito.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao aceitar",
        description: error.message || "Erro ao aceitar solicitação.",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'na_rede': { 
        label: 'Disponível', 
        variant: 'secondary' as const, 
        icon: Clock,
        color: 'text-blue-600'
      },
      'em_analise': { 
        label: 'Em Análise', 
        variant: 'default' as const, 
        icon: Eye,
        color: 'text-yellow-600'
      },
      'aprovada': { 
        label: 'Aprovada', 
        variant: 'default' as const, 
        icon: CheckCircle,
        color: 'text-green-600'
      },
      'reprovada': { 
        label: 'Reprovada', 
        variant: 'destructive' as const, 
        icon: XCircle,
        color: 'text-red-600'
      },
    };

    const config = statusMap[status as keyof typeof statusMap] || statusMap['na_rede'];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const filterRequests = (requests: any[]) => {
    if (!requests) return [];
    
    return requests.filter((request: any) => {
      const matchesSearch = !searchTerm || 
        request.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.razaoSocial?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const RequestCard = ({ request, showAcceptButton = false }: { request: any, showAcceptButton?: boolean }) => (
    <Card key={request.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {request.companyName || request.razaoSocial || 'Empresa'}
              </CardTitle>
              <CardDescription>
                CNPJ: {request.cnpj || 'Não informado'}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge(request.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Valor Solicitado</p>
              <p className="font-semibold">{formatCurrency(parseFloat(request.valorSolicitado || 0))}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Prazo</p>
              <p className="font-semibold">{request.prazoMeses} meses</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Criado em {formatDate(request.createdAt)}
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                  <Eye className="w-4 h-4 mr-1" />
                  Detalhes
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Detalhes da Solicitação</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold">Empresa</p>
                      <p>{request.companyName || request.razaoSocial}</p>
                    </div>
                    <div>
                      <p className="font-semibold">CNPJ</p>
                      <p>{request.cnpj}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Valor Solicitado</p>
                      <p>{formatCurrency(parseFloat(request.valorSolicitado || 0))}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Prazo</p>
                      <p>{request.prazoMeses} meses</p>
                    </div>
                  </div>
                  {request.proposito && (
                    <div>
                      <p className="font-semibold">Propósito</p>
                      <p>{request.proposito}</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            
            {showAcceptButton && request.status === 'na_rede' && (
              <Button 
                size="sm" 
                onClick={() => acceptRequestMutation.mutate(request.id)}
                disabled={acceptRequestMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Aceitar Análise
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ModernSidebarLayout title="Solicitações de Crédito" userType="investor">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-blue-600" />
              Solicitações de Crédito
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie solicitações disponíveis e suas análises aprovadas
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="na_rede">Disponível</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="reprovada">Reprovada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Solicitações Disponíveis</TabsTrigger>
            <TabsTrigger value="approved">Minhas Análises</TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="mt-6">
            <div className="space-y-4">
              {loadingAvailable ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando solicitações...</p>
                  </div>
                </div>
              ) : filterRequests(availableRequests || []).length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma solicitação encontrada</h3>
                    <p className="text-muted-foreground text-center">
                      Não há solicitações de crédito disponíveis no momento.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filterRequests(availableRequests || []).map((request: any) => (
                  <RequestCard key={request.id} request={request} showAcceptButton={true} />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="approved" className="mt-6">
            <div className="space-y-4">
              {loadingApproved ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando análises...</p>
                  </div>
                </div>
              ) : filterRequests(approvedRequests || []).length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma análise encontrada</h3>
                    <p className="text-muted-foreground text-center">
                      Você ainda não aprovou nenhuma solicitação de crédito.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filterRequests(approvedRequests || []).map((request: any) => (
                  <RequestCard key={request.id} request={request} showAcceptButton={false} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ModernSidebarLayout>
  );
}