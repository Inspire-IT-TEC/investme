import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import { MessageCircle, Send, Building2, Clock, CheckCircle2, Plus } from "lucide-react";

export default function Messages() {
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [selectedCreditRequest, setSelectedCreditRequest] = useState("");
  const [newConversationSubject, setNewConversationSubject] = useState("");
  const [newConversationMessage, setNewConversationMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/messages/conversations"],
    queryFn: () => {
      return fetch("/api/messages/conversations", {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
  });

  const { data: creditRequests } = useQuery({
    queryKey: ["/api/credit-requests/user"],
    queryFn: () => {
      return fetch("/api/credit-requests/user", {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/messages", selectedConversation],
    queryFn: () => {
      return fetch(`/api/messages/${selectedConversation}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      setMessageContent("");
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await fetch(`/api/messages/${conversationId}/read`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: async (data: { creditRequestId: number; assunto: string; conteudo: string }) => {
      const conversationId = `credit_${data.creditRequestId}_${Date.now()}`;
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          conversationId,
          creditRequestId: data.creditRequestId,
          assunto: data.assunto,
          conteudo: data.conteudo,
          destinatarioTipo: 'admin'
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setIsNewConversationOpen(false);
      setSelectedCreditRequest("");
      setNewConversationSubject("");
      setNewConversationMessage("");
      // Selecionar automaticamente a nova conversa
      if (data?.conversationId) {
        setSelectedConversation(data.conversationId);
      }
      toast({
        title: "Conversa iniciada",
        description: "Nova conversa criada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar conversa",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      markAsReadMutation.mutate(selectedConversation);
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!messageContent.trim() || !selectedConversation) return;

    const conversationParts = selectedConversation.split('_');
    const companyId = parseInt(conversationParts[0]);
    const creditRequestId = parseInt(conversationParts[1]);

    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      conteudo: messageContent,
      companyId,
      creditRequestId,
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mensagens</h1>
          <p className="text-gray-600">Comunicação com a equipe de análise</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Conversas
                  </CardTitle>
                  <CardDescription>
                    Suas conversas sobre solicitações de crédito
                  </CardDescription>
                </div>
                <Dialog open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Iniciar Nova Conversa</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Selecione uma Solicitação de Crédito
                        </label>
                        <Select value={selectedCreditRequest} onValueChange={setSelectedCreditRequest}>
                          <SelectTrigger>
                            <SelectValue placeholder="Escolha uma solicitação..." />
                          </SelectTrigger>
                          <SelectContent>
                            {creditRequests?.map((request: any) => (
                              <SelectItem key={request.id} value={request.id.toString()}>
                                {request.companyRazaoSocial} - R$ {request.valorSolicitado}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Assunto
                        </label>
                        <Input
                          value={newConversationSubject}
                          onChange={(e) => setNewConversationSubject(e.target.value)}
                          placeholder="Ex: Dúvidas sobre documentação, Urgente - Análise..."
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Mensagem Inicial
                        </label>
                        <Textarea
                          value={newConversationMessage}
                          onChange={(e) => setNewConversationMessage(e.target.value)}
                          placeholder="Digite sua mensagem inicial..."
                          rows={4}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsNewConversationOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => {
                            if (selectedCreditRequest && newConversationSubject.trim() && newConversationMessage.trim()) {
                              createConversationMutation.mutate({
                                creditRequestId: parseInt(selectedCreditRequest),
                                assunto: newConversationSubject.trim(),
                                conteudo: newConversationMessage.trim()
                              });
                            }
                          }}
                          disabled={!selectedCreditRequest || !newConversationSubject.trim() || !newConversationMessage.trim() || createConversationMutation.isPending}
                        >
                          {createConversationMutation.isPending ? "Criando..." : "Criar Conversa"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {conversationsLoading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex space-x-3 p-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations && conversations.length > 0 ? (
                <div className="divide-y">
                  {conversations.map((conversation: any) => (
                    <div
                      key={conversation.conversationId}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation === conversation.conversationId ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation.conversationId)}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-blue-500 text-white">
                            <Building2 className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {conversation.companyName ? `Empresa: ${conversation.companyName}` : `Solicitação #${conversation.creditRequestId}`}
                              </p>
                              <p className="text-xs text-blue-600 truncate mt-1">
                                Assunto: {conversation.assunto || 'Sem assunto'}
                              </p>
                            </div>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs ml-2 flex-shrink-0">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate mt-2">
                            {conversation.lastMessage}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTime(conversation.lastMessageDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma conversa encontrada</p>
                  <p className="text-sm text-gray-500 mt-2">
                    As conversas aparecerão quando você tiver solicitações de crédito
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Conversa - Solicitação #{selectedConversation.split('_')[1]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-full">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
                    {messagesLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="flex space-x-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-16 bg-gray-200 rounded"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : messages && messages.length > 0 ? (
                      messages.map((message: any) => (
                        <div
                          key={message.id}
                          className={`flex ${message.tipo === 'company' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.tipo === 'company'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.conteudo}</p>
                            <div className={`flex items-center justify-between mt-2 text-xs ${
                              message.tipo === 'company' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              <span>{formatTime(message.createdAt)}</span>
                              {message.tipo === 'company' && (
                                <div className="flex items-center ml-2">
                                  {message.lida ? (
                                    <CheckCircle2 className="w-3 h-3" />
                                  ) : (
                                    <Clock className="w-3 h-3" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Nenhuma mensagem ainda</p>
                        <p className="text-sm text-gray-500">Inicie a conversa enviando uma mensagem</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Textarea
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 min-h-[60px] resize-none"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageContent.trim() || sendMessageMutation.isPending}
                        className="px-6"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Selecione uma conversa</p>
                  <p className="text-gray-500">Escolha uma conversa na lista ao lado para começar</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}