import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Eye, Clock, User, Calendar, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

interface PendingChange {
  id: number;
  userId: number;
  userType: string;
  changedFields: Record<string, any>;
  status: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: number;
  reviewComment?: string;
  user?: {
    id: number;
    nomeCompleto: string;
    email: string;
    cpf: string;
  };
}

export default function BackofficePendingChanges() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedChange, setSelectedChange] = useState<PendingChange | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const { data: pendingChanges = [], isLoading } = useQuery({
    queryKey: ['/api/admin/pending-profile-changes', activeTab],
    queryFn: async () => {
      const statusParam = activeTab === "all" ? "" : `?status=${activeTab}`;
      const response = await fetch(`/api/admin/pending-profile-changes${statusParam}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch pending changes');
      return response.json();
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, approved, comment }: { id: number; approved: boolean; comment?: string }) => {
      const response = await apiRequest('POST', `/api/admin/pending-profile-changes/${id}/review`, { approved, comment });
      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Sucesso",
        description: data.message,
      });
      // Invalidate all tabs
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-profile-changes'] });
      setSelectedChange(null);
      setReviewComment("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar solicitação",
        variant: "destructive",
      });
    },
  });

  const handleReview = (approved: boolean) => {
    if (!selectedChange) return;
    
    reviewMutation.mutate({
      id: selectedChange.id,
      approved,
      comment: reviewComment || undefined
    });
  };

  const formatFieldName = (field: string) => {
    const fieldMap: Record<string, string> = {
      nomeCompleto: "Nome Completo",
      email: "Email",
      telefone: "Telefone",
      cep: "CEP",
      rua: "Rua",
      numero: "Número",
      complemento: "Complemento",
      bairro: "Bairro",
      cidade: "Cidade",
      estado: "Estado",
      dataNascimento: "Data de Nascimento",
      cpf: "CPF",
      rg: "RG",
      profissao: "Profissão",
      rendaMensal: "Renda Mensal"
    };
    return fieldMap[field] || field;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendente", variant: "secondary" as const, icon: Clock },
      approved: { label: "Aprovada", variant: "default" as const, icon: Check },
      rejected: { label: "Rejeitada", variant: "destructive" as const, icon: X }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando mudanças pendentes...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/backoffice">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Mudanças de Perfil Pendentes</h1>
          <p className="text-gray-600 mt-2">Gerencie solicitações de alteração de perfil de usuários</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="approved">Aprovadas</TabsTrigger>
          <TabsTrigger value="rejected">Rejeitadas</TabsTrigger>
          <TabsTrigger value="all">Todas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {(pendingChanges as PendingChange[]).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma mudança encontrada</h3>
                  <p>Não há mudanças de perfil {activeTab === "all" ? "" : activeTab === "pending" ? "pendentes" : activeTab}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {(pendingChanges as PendingChange[]).map((change: PendingChange) => (
                <Card key={change.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {change.user?.nomeCompleto || "Usuário não encontrado"}
                          <Badge variant="outline">
                            {change.userType === 'entrepreneur' ? 'Empreendedor' : 'Investidor'}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4">
                          <span>{change.user?.email}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(change.requestedAt).toLocaleDateString('pt-BR')}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(change.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Campos alterados:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {Object.entries(change.changedFields).map(([field, value]) => (
                            <div key={field} className="bg-gray-50 p-2 rounded border">
                              <span className="font-medium text-gray-600">{formatFieldName(field)}:</span>
                              <span className="ml-2 text-gray-900">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {change.reviewComment && (
                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                          <h5 className="font-semibold text-blue-800 text-sm mb-1">Comentário da revisão:</h5>
                          <p className="text-blue-700 text-sm">{change.reviewComment}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedChange(change)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                        
                        {change.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => {
                                setSelectedChange(change);
                                setReviewComment("");
                                setTimeout(() => handleReview(true), 100);
                              }}
                              disabled={reviewMutation.isPending}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => setSelectedChange(change)}
                              disabled={reviewMutation.isPending}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      <Dialog open={!!selectedChange} onOpenChange={() => setSelectedChange(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Revisar Mudança de Perfil</DialogTitle>
            <DialogDescription>
              Solicitação de {selectedChange?.user?.nomeCompleto} ({selectedChange?.userType === 'entrepreneur' ? 'Empreendedor' : 'Investidor'})
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4">
              {selectedChange && (
                <>
                  <div>
                    <h4 className="font-semibold mb-2">Informações do usuário:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded">
                      <div>
                        <span className="font-medium">Nome:</span> {selectedChange.user?.nomeCompleto}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {selectedChange.user?.email}
                      </div>
                      <div>
                        <span className="font-medium">CPF:</span> {selectedChange.user?.cpf}
                      </div>
                      <div>
                        <span className="font-medium">Data da solicitação:</span> {new Date(selectedChange.requestedAt).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Campos a serem alterados:</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedChange.changedFields).map(([field, value]) => (
                        <div key={field} className="bg-blue-50 p-3 rounded border">
                          <div className="font-medium text-blue-800">{formatFieldName(field)}</div>
                          <div className="text-blue-700 mt-1">{String(value)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedChange.status === 'pending' && (
                    <div className="space-y-2">
                      <Label htmlFor="review-comment">Comentário da revisão (opcional)</Label>
                      <Textarea
                        id="review-comment"
                        placeholder="Adicione um comentário sobre esta revisão..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={3}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedChange(null)}>
              Fechar
            </Button>
            {selectedChange?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleReview(false)}
                  disabled={reviewMutation.isPending}
                >
                  <X className="h-4 w-4 mr-1" />
                  Rejeitar
                </Button>
                <Button
                  onClick={() => handleReview(true)}
                  disabled={reviewMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Aprovar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}