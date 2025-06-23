import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { Building2, MessageCircle, Heart, Users, MapPin, TrendingUp, Search, Image as ImageIcon, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import BackofficeSidebar from "@/components/layout/backoffice-sidebar";
import { useAuth, useRequireAdmin } from "@/hooks/use-auth";

export default function BackofficeNetwork() {
  const { logout } = useAuth();
  const isAuthorized = useRequireAdmin();

  if (!isAuthorized) {
    return null;
  }
  
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch network companies
  const { data: companies, isLoading } = useQuery({
    queryKey: ['/api/network/companies', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await apiRequest("GET", `/api/network/companies?${params.toString()}`);
      return response.json();
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aprovada":
        return <Badge className="bg-green-100 text-green-800">Aprovada</Badge>;
      case "pendente_analise":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case "em_analise":
        return <Badge className="bg-blue-100 text-blue-800">Em Análise</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .filter(word => word.length > 2)
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const CompanyCard = ({ company }: { company: any }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    const { data: posts } = useQuery({
      queryKey: ['/api/network/posts', company.id],
      queryFn: async () => {
        const response = await apiRequest("GET", `/api/network/posts?companyId=${company.id}`);
        return response.json();
      },
    });

    const nextImage = () => {
      if (company.images && company.images.length > 1) {
        setCurrentImageIndex((prev) => (prev + 1) % company.images.length);
      }
    };

    const prevImage = () => {
      if (company.images && company.images.length > 1) {
        setCurrentImageIndex((prev) => (prev - 1 + company.images.length) % company.images.length);
      }
    };

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {/* Company Images Gallery */}
        <div className="relative">
          {company.images && company.images.length > 0 ? (
            <div className="relative w-full h-48 bg-gray-100">
              <img
                src={company.images[currentImageIndex]}
                alt={`${company.nomeFantasia || company.razaoSocial} - Imagem ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              
              {/* Navigation arrows for multiple images */}
              {company.images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevImage}
                    className="bg-black/50 text-white hover:bg-black/70 rounded-full h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextImage}
                    className="bg-black/50 text-white hover:bg-black/70 rounded-full h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              {/* Image indicators for multiple images */}
              {company.images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {company.images.map((_: any, index: number) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
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
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">
                    {company.nomeFantasia || company.razaoSocial}
                  </CardTitle>
                  {company.nomeFantasia && (
                    <p className="text-sm text-gray-600 truncate">
                      {company.razaoSocial}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{company.cidade}, {company.estado}</span>
                  </div>
                </div>
                {getStatusBadge(company.status)}
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
                Fundada em {company.dataFundacao ? new Date(company.dataFundacao).getFullYear() : 'N/A'}
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
                  <span>{posts?.length || 0}</span>
                </div>
              </div>
              
              <Badge variant="secondary" className="text-xs">
                {company.cnaePrincipal || 'N/A'}
              </Badge>
            </div>
            
            {/* Employee count if available */}
            {company.numeroFuncionarios && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {company.numeroFuncionarios} funcionários
                </span>
              </div>
            )}
          </div>
          
          {/* Posts Section - Simplified */}
          {posts && posts.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Últimos Posts ({posts.length})
              </h4>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {posts.slice(0, 2).map((post: any) => (
                  <div key={post.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 text-xs truncate">
                            {company.nomeFantasia || company.razaoSocial}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 text-xs mb-2 line-clamp-2">{post.content}</p>
                        
                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt="Post image"
                            className="w-full max-w-32 rounded mb-2"
                          />
                        )}
                        
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{post.likesCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{post.commentsCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {posts?.length === 0 && (
                  <div className="text-center py-6">
                    <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Nenhum post ainda</p>
                  </div>
                )}

                {posts && posts.length > 2 && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500">+{posts.length - 2} posts adicionais</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <BackofficeSidebar onLogout={logout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando rede...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <BackofficeSidebar onLogout={logout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Rede Social</h1>
              <p className="text-gray-600">Monitore a atividade na rede empresarial</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar empresas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies?.map((company: any) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>

          {companies?.length === 0 && (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma empresa encontrada
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Tente buscar com outros termos.' : 'Ainda não há empresas cadastradas na rede.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}