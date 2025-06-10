import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { 
  TrendingUp, 
  Building2, 
  DollarSign, 
  Users, 
  Eye, 
  CheckCircle, 
  XCircle,
  MessageCircle,
  Send,
  Clock,
  Shield,
  AlertCircle,
  Plus,
  Edit,
  CreditCard
} from "lucide-react";
import UnifiedNavbar from "@/components/layout/unified-navbar";
import { useLocation, Link } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [messageContent, setMessageContent] = useState("");
  const [selectedChatRequest, setSelectedChatRequest] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch companies
  const { data: companies, isLoading: loadingCompanies } = useQuery({
    queryKey: ["/api/companies"],
  });

  // Fetch credit requests
  const { data: creditRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ["/api/credit-requests"],
  });

  // Fetch entrepreneur profile
  const { data: entrepreneurProfile } = useQuery({
    queryKey: ["/api/entrepreneur/profile"],
  });

  // Fetch unread messages count
  const { data: unreadMessages } = useQuery({
    queryKey: ["/api/entrepreneur/unread-messages"],
    refetchInterval: 30000,
  });

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente_analise: { label: "Pendente de Análise", variant: "secondary" as const, color: "text-yellow-600" },
      em_analise: { label: "Em Análise", variant: "secondary" as const, color: "text-blue-600" },
      aprovada: { label: "Aprovada", variant: "default" as const, color: "text-green-600" },
      reprovada: { label: "Reprovada", variant: "destructive" as const, color: "text-red-600" },
      incompleto: { label: "Incompleto", variant: "secondary" as const, color: "text-gray-600" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente_analise;
    
    return (
      <Badge variant={config.variant} className={`${config.color} border-current`}>
        {config.label}
      </Badge>
    );
  };

  const getCompanyStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovada':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'em_analise':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'reprovada':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  // Calculate stats
  const totalCompanies = companies?.length || 0;
  const approvedCompanies = companies?.filter((c: any) => c.status === 'aprovada').length || 0;
  const totalRequests = creditRequests?.length || 0;
  const totalRequestedValue = creditRequests?.reduce((sum: number, req: any) => sum + parseFloat(req.valorSolicitado || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar 
        userType="entrepreneur" 
        userName={user?.nomeCompleto || user?.nome || "Empreendedor"}
        isCompanyApproved={true}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">Bem-vindo, {user?.nomeCompleto}</h1>
                <p className="text-blue-100">Gerencie suas empresas e solicitações de crédito</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">Portal do Empreendedor</div>
              <div className="text-lg font-semibold">InvestMe</div>
            </div>
          </div>
        </div>

        {/* Profile Status Alert */}
        {entrepreneurProfile && (
          !entrepreneurProfile.cadastroAprovado || 
          !entrepreneurProfile.emailConfirmado || 
          !entrepreneurProfile.documentosVerificados
        ) && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Seu perfil está em processo de validação. Algumas funcionalidades podem estar limitadas até a aprovação completa.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-blue-200">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger 
              value="companies" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600"
            >
              Empresas ({totalCompanies})
            </TabsTrigger>
            <TabsTrigger 
              value="requests" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600"
            >
              Solicitações ({totalRequests})
            </TabsTrigger>
            <TabsTrigger 
              value="messages" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600"
            >
              Mensagens {unreadMessages?.count > 0 && (
                <Badge className="ml-1 bg-red-500 text-white text-xs px-1 py-0">
                  {unreadMessages.count}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Building2 className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Empresas</p>
                      <p className="text-2xl font-bold text-gray-900">{totalCompanies}</p>
                      <p className="text-xs text-green-600">{approvedCompanies} aprovadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CreditCard className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Solicitações</p>
                      <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
                      <p className="text-xs text-blue-600">Total enviadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Valor Total</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRequestedValue)}</p>
                      <p className="text-xs text-blue-600">Solicitado</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <MessageCircle className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Mensagens</p>
                      <p className="text-2xl font-bold text-gray-900">{unreadMessages?.count || 0}</p>
                      <p className="text-xs text-blue-600">Não lidas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Status */}
            <Card className="border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="text-blue-800">Status do Perfil</CardTitle>
                <CardDescription className="text-blue-600">
                  Acompanhe o status de validação do seu cadastro
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    {entrepreneurProfile?.cadastroAprovado ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">Cadastro</p>
                      <p className="text-sm text-gray-600">
                        {entrepreneurProfile?.cadastroAprovado ? 'Aprovado' : 'Pendente'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {entrepreneurProfile?.emailConfirmado ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">
                        {entrepreneurProfile?.emailConfirmado ? 'Confirmado' : 'Pendente'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {entrepreneurProfile?.documentosVerificados ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">Documentos</p>
                      <p className="text-sm text-gray-600">
                        {entrepreneurProfile?.documentosVerificados ? 'Verificados' : 'Pendente'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies" className="space-y-6">
            <Card className="border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-blue-800">Minhas Empresas</CardTitle>
                    <CardDescription className="text-blue-600">
                      Gerencie as empresas cadastradas na plataforma
                    </CardDescription>
                  </div>
                  <Link href="/nova-empresa">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Empresa
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loadingCompanies ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Carregando empresas...</p>
                  </div>
                ) : !companies?.length ? (
                  <div className="text-center py-12">
                    <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa cadastrada</h3>
                    <p className="text-gray-600 mb-4">Cadastre sua primeira empresa para começar a solicitar crédito</p>
                    <Link href="/nova-empresa">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Cadastrar Empresa
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {companies.map((company: any) => (
                      <Card key={company.id} className="border border-gray-200 hover:border-blue-300 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {getCompanyStatusIcon(company.status)}
                              <h3 className="font-medium text-gray-900 truncate">{company.razaoSocial}</h3>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p><span className="font-medium">CNPJ:</span> {company.cnpj}</p>
                            <p><span className="font-medium">Setor:</span> {company.setor}</p>
                            <div className="flex items-center justify-between mt-3">
                              {getStatusBadge(company.status)}
                              <Link href={`/empresa/${company.id}`}>
                                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Ver
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credit Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <Card className="border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="text-blue-800">Solicitações de Crédito</CardTitle>
                <CardDescription className="text-blue-600">
                  Acompanhe suas solicitações de crédito e seus status
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {loadingRequests ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Carregando solicitações...</p>
                  </div>
                ) : !creditRequests?.length ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma solicitação enviada</h3>
                    <p className="text-gray-600 mb-4">Suas solicitações de crédito aparecerão aqui</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {creditRequests.map((request: any) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.company?.razaoSocial}</TableCell>
                          <TableCell>{formatCurrency(request.valorSolicitado)}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>{formatDate(request.createdAt)}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Ver
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Detalhes da Solicitação</DialogTitle>
                                  <DialogDescription>
                                    Informações detalhadas da solicitação de crédito
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Empresa</label>
                                      <p className="text-sm text-gray-900">{request.company?.razaoSocial}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Valor Solicitado</label>
                                      <p className="text-sm text-gray-900">{formatCurrency(request.valorSolicitado)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Finalidade</label>
                                      <p className="text-sm text-gray-900">{request.finalidade}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Prazo</label>
                                      <p className="text-sm text-gray-900">{request.prazoPagamento} meses</p>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <div className="mt-1">{getStatusBadge(request.status)}</div>
                                  </div>
                                  {request.observacoesAnalise && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Observações</label>
                                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{request.observacoesAnalise}</p>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card className="border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="text-blue-800">Central de Mensagens</CardTitle>
                <CardDescription className="text-blue-600">
                  Comunicação com investidores e backoffice
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Central de Mensagens</h3>
                  <p className="text-gray-600">
                    As conversações com investidores aparecerão aqui quando suas solicitações estiverem sendo analisadas
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}