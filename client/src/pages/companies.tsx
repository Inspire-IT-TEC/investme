import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModernSidebarLayout } from "@/components/layout/modern-sidebar-layout";
import { Link } from "wouter";
import { Building2, Plus, Eye, Edit, Calendar, MapPin, FileText } from "lucide-react";

export default function Companies() {
  const { data: companies, isLoading } = useQuery({
    queryKey: ["/api/companies"],
    queryFn: () => {
      return fetch("/api/companies", {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'Pendente', variant: 'secondary' as const },
      'approved': { label: 'Aprovada', variant: 'default' as const },
      'rejected': { label: 'Rejeitada', variant: 'destructive' as const },
      'under_review': { label: 'Em Análise', variant: 'outline' as const },
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <ModernSidebarLayout title="Empresas" userType="user" theme="green">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando empresas...</p>
          </div>
        </div>
      </ModernSidebarLayout>
    );
  }

  return (
    <ModernSidebarLayout title="Empresas" userType="user" theme="green">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Building2 className="h-8 w-8 text-green-600" />
              Minhas Empresas
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas empresas cadastradas na plataforma
            </p>
          </div>
          <Link href="/company-registration">
            <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4" />
              Nova Empresa
            </Button>
          </Link>
        </div>

        {!companies || companies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma empresa cadastrada
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Cadastre sua primeira empresa para começar a solicitar crédito e acessar nossos serviços.
              </p>
              <Link href="/company-registration">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeira Empresa
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company: any) => {
              const status = getStatusBadge(company.status || 'pending');
              
              return (
                <Card key={company.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {company.razaoSocial}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          CNPJ: {company.cnpj}
                        </CardDescription>
                      </div>
                      <Badge variant={status.variant}>
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{company.cidade}, {company.estado}</span>
                      </div>
                      
                      {company.setor && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>{company.setor}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Cadastrada em {formatDate(company.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link href={`/empresa/${company.id}`}>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </Link>
                      
                      <Link href={`/empresa/${company.id}/editar`}>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ModernSidebarLayout>
  );
}