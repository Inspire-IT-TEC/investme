import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { ModernSidebarLayout } from "@/components/layout/modern-sidebar-layout";
import { useAuth } from "@/hooks/use-auth";
import { 
  Heart, 
  MessageCircle, 
  Filter, 
  MapPin, 
  Building2, 
  Calendar,
  Image as ImageIcon,
  Send,
  Search,
  Users,
  TrendingUp
} from "lucide-react";

export default function Network() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [commentText, setCommentText] = useState("");

  // Determinar o tipo de usuário baseado na URL ou contexto
  const userType = (user as any)?.tipo || 'entrepreneur';
  const theme = userType === 'investor' ? 'blue' : 'green';

  // Fetch states
  const { data: states } = useQuery({
    queryKey: ['/api/states'],
    queryFn: () => {
      return fetch('/api/states', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
  });

  // Fetch cities based on selected state
  const { data: cities } = useQuery({
    queryKey: ['/api/cities', selectedState],
    queryFn: () => {
      if (!selectedState || selectedState === "all") return [];
      return fetch(`/api/cities?stateId=${selectedState}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
    enabled: !!(selectedState && selectedState !== "all"),
  });

  // Fetch network companies with filters
  const { data: companies, isLoading } = useQuery({
    queryKey: ['/api/network/companies', selectedState, selectedCity, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedState && selectedState !== "all") params.append('stateId', selectedState);
      if (selectedCity && selectedCity !== "all") params.append('cityId', selectedCity);
      if (searchTerm) params.append('search', searchTerm);
      
      return fetch(`/api/network/companies?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
  });

  // Fetch company posts
  const { data: posts } = useQuery({
    queryKey: ['/api/network/posts', selectedCompany?.id],
    queryFn: () => {
      if (!selectedCompany) return [];
      return fetch(`/api/network/posts?companyId=${selectedCompany.id}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
    enabled: !!selectedCompany,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await fetch('/api/network/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar post');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post criado!",
        description: "Seu post foi publicado na rede.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/network/posts'] });
      setNewPostContent("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await fetch(`/api/network/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao curtir post');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/network/posts'] });
    },
  });

  // Comment on post mutation
  const commentPostMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      const response = await fetch(`/api/network/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao comentar');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/network/posts'] });
      setCommentText("");
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCompanyInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <ModernSidebarLayout title="Rede Empresarial" userType={userType} theme={theme}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando rede...</p>
          </div>
        </div>
      </ModernSidebarLayout>
    );
  }

  return (
    <ModernSidebarLayout title="Rede Empresarial" userType={userType} theme={theme}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              Rede Empresarial
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2">
              Conecte-se com empresas e empreendedores de todo o Brasil
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {companies?.length || 0} empresas
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <span className="font-semibold">Filtros</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar empresa</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome da empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Select value={selectedState} onValueChange={(value) => {
                  setSelectedState(value);
                  setSelectedCity("all");
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os estados</SelectItem>
                    {(states || []).map((state: any) => (
                      <SelectItem key={state.id} value={state.id.toString()}>
                        {state.name} ({state.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cidade</label>
                <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as cidades</SelectItem>
                    {(cities || []).map((city: any) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedState("all");
                    setSelectedCity("all");
                    setSearchTerm("");
                  }}
                  className="w-full"
                >
                  Limpar filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Companies Grid */}
        {!companies || companies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma empresa encontrada
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Não há empresas na rede que correspondam aos filtros selecionados.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(companies || []).map((company: any) => (
              <Card key={company.id} className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden" onClick={() => setSelectedCompany(company)}>
                {/* Company Images - Instagram Style */}
                <div className="relative group">
                  {company.images && company.images.length > 0 ? (
                    <div className="relative">
                      <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide" 
                           style={{ scrollBehavior: 'smooth' }}>
                        {company.images.slice(0, 5).map((imageUrl: string, index: number) => (
                          <div key={index} className="flex-none w-full snap-start relative">
                            <img
                              src={imageUrl}
                              alt={`${company.nomeFantasia || company.razaoSocial} - Imagem ${index + 1}`}
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Image indicators */}
                      {company.images.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                          {company.images.slice(0, 5).map((_: any, index: number) => (
                            <div
                              key={index}
                              className="w-1.5 h-1.5 rounded-full bg-white/60"
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Image count badge */}
                      {company.images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          {company.images.length}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Default fallback image when no images are uploaded
                    <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Building2 className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm font-medium">{company.nomeFantasia || company.razaoSocial}</p>
                        <p className="text-xs text-gray-400 mt-1">Empresa</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={company.logoUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getCompanyInitials(company.nomeFantasia || company.razaoSocial)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">
                        {company.nomeFantasia || company.razaoSocial}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{company.cidade}, {company.estado}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">CNPJ: </span>
                      <span className="font-medium">{company.cnpj}</span>
                    </div>
                    
                    {company.descricaoNegocio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {company.descricaoNegocio}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Faturamento</span>
                      <span className="font-medium">
                        R$ {parseFloat(company.faturamento || 0).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Fundada em {new Date(company.dataFundacao).getFullYear()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{company.likesCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{company.postsCount || 0}</span>
                        </div>
                      </div>
                      
                      <Badge variant="secondary" className="text-xs">
                        {company.cnaePrincipal}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Company Detail Dialog */}
        {selectedCompany && (
          <Dialog open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedCompany.logoUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getCompanyInitials(selectedCompany.nomeFantasia || selectedCompany.razaoSocial)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedCompany.nomeFantasia || selectedCompany.razaoSocial}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedCompany.cidade}, {selectedCompany.estado}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Company Description */}
                {selectedCompany.descricaoNegocio && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Sobre a empresa</h4>
                    <p className="text-sm text-muted-foreground">{selectedCompany.descricaoNegocio}</p>
                  </div>
                )}

                {/* Company Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Building2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">CNPJ</p>
                    <p className="font-semibold text-xs">{selectedCompany.cnpj}</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Faturamento</p>
                    <p className="font-semibold">
                      R$ {parseFloat(selectedCompany.faturamento || 0).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Fundação</p>
                    <p className="font-semibold">{new Date(selectedCompany.dataFundacao).getFullYear()}</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Posts</p>
                    <p className="font-semibold">{posts?.length || 0}</p>
                  </div>
                </div>

                {/* Create Post (only for company owner) */}
                {userType === 'entrepreneur' && selectedCompany.userId === user?.id && (
                  <Card>
                    <CardHeader>
                      <h3 className="font-semibold">Criar novo post</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Compartilhe novidades sobre sua empresa..."
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          rows={3}
                        />
                        <div className="flex justify-between items-center">
                          <Button variant="outline" size="sm">
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Adicionar foto
                          </Button>
                          <Button 
                            onClick={() => createPostMutation.mutate({
                              companyId: selectedCompany.id,
                              content: newPostContent,
                            })}
                            disabled={!newPostContent.trim() || createPostMutation.isPending}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            {createPostMutation.isPending ? "Publicando..." : "Publicar"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Posts */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Atividades da empresa</h3>
                  
                  {!posts || posts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma atividade ainda</p>
                    </div>
                  ) : (
                    (posts || []).map((post: any) => (
                      <Card key={post.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {getCompanyInitials(selectedCompany.nomeFantasia || selectedCompany.razaoSocial)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">
                                  {selectedCompany.nomeFantasia || selectedCompany.razaoSocial}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(post.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <p className="text-sm mb-4">{post.content}</p>
                          
                          {post.imageUrl && (
                            <img 
                              src={post.imageUrl} 
                              alt="Post image" 
                              className="w-full rounded-lg mb-4 max-h-96 object-cover"
                            />
                          )}
                          
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => likePostMutation.mutate(post.id)}
                                className="flex items-center gap-2 text-muted-foreground hover:text-red-500"
                              >
                                <Heart className={`h-4 w-4 ${post.userLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                <span>{post.likesCount || 0}</span>
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2 text-muted-foreground"
                              >
                                <MessageCircle className="h-4 w-4" />
                                <span>{post.commentsCount || 0}</span>
                              </Button>
                            </div>
                          </div>
                          
                          {/* Comments section */}
                          <div className="mt-4 space-y-3">
                            {(post.comments || []).map((comment: any) => (
                              <div key={comment.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {comment.userName?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="text-xs font-medium">{comment.userName}</p>
                                  <p className="text-sm">{comment.content}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {formatDate(comment.createdAt)}
                                  </p>
                                </div>
                              </div>
                            ))}
                            
                            {/* Add comment */}
                            <div className="flex gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {user?.nomeCompleto?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 flex gap-2">
                                <Input
                                  placeholder="Escreva um comentário..."
                                  value={commentText}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  className="text-sm"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    if (commentText.trim()) {
                                      commentPostMutation.mutate({
                                        postId: post.id,
                                        content: commentText
                                      });
                                    }
                                  }}
                                  disabled={!commentText.trim() || commentPostMutation.isPending}
                                >
                                  <Send className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ModernSidebarLayout>
  );
}