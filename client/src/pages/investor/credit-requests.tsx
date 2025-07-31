import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModernSidebarLayout } from "@/components/layout/modern-sidebar-layout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  FileText,
  MessageCircle,
  Send,
  ThumbsUp,
  ThumbsDown,
  Download,
  MapPin,
  Users,
  Mail,
  Phone,
  Globe,
  Shield,
  AlertCircle
} from "lucide-react";

// Detailed Analysis Dialog Component
function DetailedAnalysisDialog({ request, showAcceptButton, onAccept, acceptPending, companyStatus }: {
  request: any;
  showAcceptButton: boolean;
  onAccept: () => void;
  acceptPending: boolean;
  companyStatus: any;
}) {
  const [messageText, setMessageText] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const { toast } = useToast();

  // Fetch detailed company information
  const { data: companyDetails, isLoading: loadingDetails } = useQuery({
    queryKey: [`/api/investor/company-details/${request.id}`],
    enabled: request.status === 'em_analise',
    queryFn: () => {
      return fetch(`/api/investor/company-details/${request.id}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
  });

  // Fetch conversation for this request
  const { data: conversation, isLoading: loadingConversation } = useQuery({
    queryKey: [`/api/investor/conversations/credit-request-${request.id}`],
    enabled: request.status === 'em_analise',
    queryFn: () => {
      return fetch(`/api/investor/conversations/credit-request-${request.id}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { text: string }) => {
      const response = await fetch(`/api/investor/conversations/credit-request-${request.id}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });
      if (!response.ok) throw new Error('Erro ao enviar mensagem');
      return response.json();
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: [`/api/investor/conversations/credit-request-${request.id}`] });
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar",
        description: error.message || "Erro ao enviar mensagem.",
        variant: "destructive",
      });
    },
  });

  // Approve request mutation
  const approveRequestMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/investor/credit-requests/${request.id}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ observacoes })
      });
      if (!response.ok) throw new Error('Erro ao aprovar solicitação');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/investor/my-analysis'] });
      queryClient.invalidateQueries({ queryKey: ['/api/investor/approved-analysis'] });
      toast({
        title: "Solicitação aprovada",
        description: "A solicitação foi aprovada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao aprovar",
        description: error.message || "Erro ao aprovar solicitação.",
        variant: "destructive",
      });
    },
  });

  // Reject request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/investor/credit-requests/${request.id}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ observacoes })
      });
      if (!response.ok) throw new Error('Erro ao rejeitar solicitação');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/investor/my-analysis'] });
      queryClient.invalidateQueries({ queryKey: ['/api/investor/approved-analysis'] });
      toast({
        title: "Solicitação rejeitada",
        description: "A solicitação foi rejeitada.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao rejeitar",
        description: error.message || "Erro ao rejeitar solicitação.",
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-1" />
          Detalhes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Análise Detalhada da Solicitação</DialogTitle>
          <DialogDescription>
            Informações completas da empresa e solicitação de crédito
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[75vh]">
          <div className="space-y-6 p-1">
            {/* Basic Request Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-sm text-muted-foreground">Empresa</p>
                <p className="text-lg font-medium">{request.companyRazaoSocial || request.companyName || request.razaoSocial}</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-muted-foreground">CNPJ</p>
                <p className="text-lg font-medium">{request.companyCnpj || request.cnpj}</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-muted-foreground">Valor Solicitado</p>
                <p className="text-lg font-medium text-green-600">{formatCurrency(parseFloat(request.valorSolicitado || 0))}</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-muted-foreground">Prazo</p>
                <p className="text-lg font-medium">{request.prazoMeses} meses</p>
              </div>
            </div>

            {request.finalidade && (
              <div>
                <p className="font-semibold text-sm text-muted-foreground mb-2">Finalidade</p>
                <p className="text-sm bg-gray-50 p-3 rounded-lg">{request.finalidade}</p>
              </div>
            )}

            {/* Credit Request Documents */}
            {request.documentos && request.documentos.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Documentos da Solicitação
                </h4>
                <div className="space-y-2">
                  {request.documentos.map((docUrl: string, index: number) => {
                    const fileName = docUrl.split('/').pop() || `Documento ${index + 1}`;
                    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
                    
                    const getFileIcon = (ext: string) => {
                      if (['pdf'].includes(ext)) return '📄';
                      if (['doc', 'docx'].includes(ext)) return '📝';
                      if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '🖼️';
                      return '📎';
                    };

                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                        <span className="text-lg">{getFileIcon(fileExtension)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{fileName}</p>
                          <p className="text-xs text-muted-foreground">{fileExtension.toUpperCase()}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          asChild
                          className="hover:bg-blue-50"
                        >
                          <a 
                            href={docUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            <span className="text-xs">Baixar</span>
                          </a>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Separator />

            {/* Company Details */}
            {loadingDetails ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : companyDetails && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Informações da Empresa
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {companyDetails.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{companyDetails.email}</span>
                    </div>
                  )}
                  {companyDetails.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{companyDetails.telefone}</span>
                    </div>
                  )}
                  {companyDetails.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span>{companyDetails.website}</span>
                    </div>
                  )}
                  {companyDetails.cidade && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{companyDetails.cidade}, {companyDetails.estado}</span>
                    </div>
                  )}
                </div>

                {companyDetails.descricao && (
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground mb-2">Descrição</p>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{companyDetails.descricao}</p>
                  </div>
                )}

                {/* Valuation Information */}
                {companyDetails.valuation && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Valuation</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Valor da Empresa:</span>
                        <p className="font-medium text-green-600">{formatCurrency(companyDetails.valuation.valorEmpresa)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Receita Anual:</span>
                        <p className="font-medium">{formatCurrency(companyDetails.valuation.receitaAnual)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Documents */}
                {companyDetails.documentos && companyDetails.documentos.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Documentos</h4>
                    <div className="space-y-2">
                      {companyDetails.documentos.map((doc: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm flex-1">Documento {index + 1}</span>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={doc} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Messaging Section (only for analysis status) */}
            {request.status === 'em_analise' && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Comunicação
                  </h3>
                  
                  {/* Messages */}
                  <div className="max-h-60 overflow-y-auto space-y-2 bg-gray-50 p-3 rounded-lg">
                    {loadingConversation ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      </div>
                    ) : conversation?.messages?.length > 0 ? (
                      conversation.messages.map((message: any, index: number) => (
                        <div key={index} className={`flex ${message.remetenteId === localStorage.getItem('userId') ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            message.remetenteId === localStorage.getItem('userId') 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-white border'
                          }`}>
                            <p>{message.conteudo}</p>
                            <span className="text-xs opacity-70">
                              {new Date(message.createdAt).toLocaleTimeString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">Nenhuma mensagem ainda</p>
                    )}
                  </div>

                  {/* Send Message */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <Button 
                      onClick={() => sendMessageMutation.mutate({ text: messageText })}
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Analysis Decision */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Decisão da Análise</h3>
                  <Textarea
                    placeholder="Observações sobre a análise..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => approveRequestMutation.mutate()}
                      disabled={approveRequestMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button 
                      onClick={() => rejectRequestMutation.mutate()}
                      disabled={rejectRequestMutation.isPending}
                      variant="destructive"
                      className="flex-1"
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Accept Button for Available Requests */}
            {showAcceptButton && request.status === 'na_rede' && (
              <>
                <Separator />
                <div className="flex justify-center">
                  <Button 
                    onClick={onAccept}
                    disabled={acceptPending || !companyStatus?.hasApprovedCompany}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    title={!companyStatus?.hasApprovedCompany ? 'Você precisa ter uma empresa aprovada para aceitar análises' : ''}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Aceitar para Análise
                  </Button>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default function InvestorCreditRequests() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Fetch company status
  const { data: companyStatus } = useQuery({
    queryKey: ['/api/investor/company-status'],
    queryFn: () => {
      return fetch('/api/investor/company-status', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
  });

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

  // Fetch my analysis (requests I'm currently analyzing)
  const { data: myAnalysis, isLoading: loadingMyAnalysis } = useQuery({
    queryKey: ['/api/investor/my-analysis'],
    queryFn: () => {
      return fetch('/api/investor/my-analysis', {
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
      queryClient.invalidateQueries({ queryKey: ['/api/investor/my-analysis'] });
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
                {request.companyRazaoSocial || request.companyName || request.razaoSocial || 'Empresa'}
              </CardTitle>
              <CardDescription>
                CNPJ: {request.companyCnpj || request.cnpj || 'Não informado'}
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
            <DetailedAnalysisDialog 
              request={request} 
              showAcceptButton={showAcceptButton}
              onAccept={() => acceptRequestMutation.mutate(request.id)}
              acceptPending={acceptRequestMutation.isPending}
              companyStatus={companyStatus}
            />
            
            {showAcceptButton && request.status === 'na_rede' && (
              <Button 
                size="sm" 
                onClick={() => acceptRequestMutation.mutate(request.id)}
                disabled={acceptRequestMutation.isPending || !companyStatus?.hasApprovedCompany}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                title={!companyStatus?.hasApprovedCompany ? 'Você precisa ter uma empresa aprovada para aceitar análises' : ''}
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

        {/* Company Status Alert */}
        {companyStatus && !companyStatus.hasApprovedCompany && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800">
                    {!companyStatus.hasCompany ? 'Cadastro de empresa necessário' : 'Empresa pendente de aprovação'}
                  </h3>
                  <p className="text-yellow-700 text-sm mt-1">
                    {!companyStatus.hasCompany 
                      ? 'Para aceitar e analisar solicitações de crédito, você precisa ter uma empresa cadastrada na plataforma.'
                      : 'Sua empresa está sendo analisada pela nossa equipe. Após a aprovação, você poderá aceitar solicitações de crédito.'
                    }
                  </p>
                </div>
                <Button variant="outline" size="sm" className="text-yellow-700 border-yellow-300 hover:bg-yellow-100">
                  {!companyStatus.hasCompany ? 'Cadastrar Empresa' : 'Ver Status'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
              {loadingMyAnalysis ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando análises...</p>
                  </div>
                </div>
              ) : (myAnalysis || []).length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma análise encontrada</h3>
                    <p className="text-muted-foreground text-center">
                      Você ainda não aceitou nenhuma solicitação de crédito.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                (myAnalysis || []).map((request: any) => (
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