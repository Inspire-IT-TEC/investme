import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { Building2, MessageCircle, Heart, Users, MapPin, TrendingUp, Eye, Search } from "lucide-react";
import BackofficeSidebar from "@/components/layout/backoffice-sidebar";
import { useAuth, useRequireAdmin } from "@/hooks/use-auth";

export default function BackofficeNetwork() {
  const { logout } = useAuth();
  const isAuthorized = useRequireAdmin();

  if (!isAuthorized) {
    return null;
  }
  
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
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

  // Fetch company posts
  const { data: posts } = useQuery({
    queryKey: ['/api/network/posts', selectedCompany?.id],
    queryFn: async () => {
      if (!selectedCompany) return [];
      const response = await apiRequest("GET", `/api/network/posts?companyId=${selectedCompany.id}`);
      return response.json();
    },
    enabled: !!selectedCompany,
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Companies List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Empresas na Rede
                  </CardTitle>
                  <CardDescription>
                    Empresas ativas participando da rede social
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar empresas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {companies?.map((company: any) => (
                        <div
                          key={company.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedCompany?.id === company.id
                              ? 'bg-blue-50 border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedCompany(company)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm text-gray-900 truncate">
                                {company.razaoSocial}
                              </h3>
                              {company.nomeFantasia && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {company.nomeFantasia}
                                </p>
                              )}
                              <div className="flex items-center gap-1 mt-2">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {company.cidade}, {company.estado}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {getStatusBadge(company.status)}
                              {company.numeroFuncionarios && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {company.numeroFuncionarios}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {companies?.length === 0 && (
                      <div className="text-center py-8">
                        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 text-sm">Nenhuma empresa encontrada</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Posts Feed */}
            <div className="lg:col-span-2">
              {selectedCompany ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Posts de {selectedCompany.razaoSocial}
                    </CardTitle>
                    <CardDescription>
                      Atividade recente na rede social
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {posts?.map((post: any) => (
                        <div key={post.id} className="border rounded-lg p-4 bg-white">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-gray-900">
                                  {selectedCompany.razaoSocial}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(post.createdAt)}
                                </span>
                              </div>
                              
                              <p className="text-gray-700 mb-3">{post.content}</p>
                              
                              {post.imageUrl && (
                                <img
                                  src={post.imageUrl}
                                  alt="Post image"
                                  className="w-full max-w-md rounded-lg mb-3"
                                />
                              )}
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Heart className="w-4 h-4" />
                                  <span>{post.likesCount || 0} curtidas</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="w-4 h-4" />
                                  <span>{post.commentsCount || 0} comentários</span>
                                </div>
                              </div>

                              {post.comments && post.comments.length > 0 && (
                                <div className="mt-3 pt-3 border-t">
                                  <div className="space-y-2">
                                    {post.comments.slice(0, 3).map((comment: any) => (
                                      <div key={comment.id} className="flex gap-2">
                                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                          <Users className="w-3 h-3 text-gray-500" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-sm text-gray-700">{comment.content}</p>
                                          <span className="text-xs text-gray-500">
                                            {formatDate(comment.createdAt)}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                    {post.comments.length > 3 && (
                                      <p className="text-xs text-gray-500 pl-8">
                                        +{post.comments.length - 3} comentários
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {posts?.length === 0 && (
                        <div className="text-center py-12">
                          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Nenhum post encontrado
                          </h3>
                          <p className="text-gray-600">
                            Esta empresa ainda não fez nenhuma publicação na rede.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Eye className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Selecione uma empresa
                    </h3>
                    <p className="text-gray-600 text-center">
                      Escolha uma empresa da lista à esquerda para ver suas publicações na rede.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}