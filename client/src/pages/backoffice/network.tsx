import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { Building2, MessageCircle, Heart, Users, MapPin, TrendingUp, Search } from "lucide-react";
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

  const CompanyCard = ({ company }: { company: any }) => {
    const { data: posts } = useQuery({
      queryKey: ['/api/network/posts', company.id],
      queryFn: async () => {
        const response = await apiRequest("GET", `/api/network/posts?companyId=${company.id}`);
        return response.json();
      },
    });

    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">
                  {company.nomeFantasia || company.razaoSocial}
                </CardTitle>
                {company.nomeFantasia && (
                  <p className="text-sm text-gray-600 truncate">
                    {company.razaoSocial}
                  </p>
                )}
                <CardDescription className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {company.cidade}, {company.estado}
                </CardDescription>
              </div>
            </div>
            {getStatusBadge(company.status)}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Company Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-600" />
              <p className="text-xs text-gray-600">Faturamento</p>
              <p className="text-sm font-semibold">
                R$ {parseFloat(company.faturamento || 0).toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <Users className="h-4 w-4 mx-auto mb-1 text-blue-600" />
              <p className="text-xs text-gray-600">Funcionários</p>
              <p className="text-sm font-semibold">{company.numeroFuncionarios || 0}</p>
            </div>
          </div>

          {/* Company Description */}
          {company.descricaoNegocio && (
            <div className="mb-4">
              <p className="text-sm text-gray-700 line-clamp-3">
                {company.descricaoNegocio}
              </p>
            </div>
          )}

          {/* Posts Section */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Posts ({posts?.length || 0})
            </h4>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {posts?.slice(0, 3).map((post: any) => (
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

              {posts && posts.length > 3 && (
                <div className="text-center">
                  <p className="text-xs text-gray-500">+{posts.length - 3} posts adicionais</p>
                </div>
              )}
            </div>
          </div>
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