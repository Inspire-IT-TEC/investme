import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import BackofficeNavbar from "@/components/layout/backoffice-navbar";
import { Plus, Users, Shield, Eye, CheckCircle } from "lucide-react";

export default function AdminUsers() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: adminUsers, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(userData),
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Usuário criado com sucesso!",
        description: "O novo usuário administrativo foi cadastrado.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: any }) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(userData),
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "Usuário atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getPerfilBadge = (perfil: string) => {
    const perfilConfig = {
      admin: { label: "Administrador", variant: "destructive" as const, icon: Shield },
      aprovacao_credito: { label: "Aprovação de Crédito", variant: "default" as const, icon: CheckCircle },
      aprovacao_empresa: { label: "Aprovação de Empresa", variant: "secondary" as const, icon: CheckCircle },
      visualizacao: { label: "Visualização", variant: "outline" as const, icon: Eye },
    };

    const config = perfilConfig[perfil as keyof typeof perfilConfig] || perfilConfig.visualizacao;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const userData = {
      email: formData.get("email"),
      senha: formData.get("senha"),
      nome: formData.get("nome"),
      perfil: formData.get("perfil"),
      ativo: true,
    };
    createUserMutation.mutate(userData);
  };

  const handleUpdateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const userData = {
      perfil: formData.get("perfil"),
      ativo: formData.get("ativo") === "true",
    };
    updateUserMutation.mutate({ id: selectedUser.id, userData });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BackofficeNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Usuários Administrativos</h1>
          <p className="text-gray-600">Gerencie usuários e permissões do backoffice</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">
              {adminUsers?.length || 0} usuários cadastrados
            </span>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Adicione um novo usuário administrativo ao sistema
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" name="nome" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div>
                  <Label htmlFor="senha">Senha</Label>
                  <Input id="senha" name="senha" type="password" required />
                </div>
                <div>
                  <Label htmlFor="perfil">Perfil</Label>
                  <Select name="perfil" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visualizacao">Visualização</SelectItem>
                      <SelectItem value="aprovacao_empresa">Aprovação de Empresa</SelectItem>
                      <SelectItem value="aprovacao_credito">Aprovação de Crédito</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? "Criando..." : "Criar Usuário"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>
              Usuários com acesso ao sistema administrativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : adminUsers && adminUsers.length > 0 ? (
              <div className="space-y-4">
                {adminUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{user.nome}</h4>
                        {getPerfilBadge(user.perfil)}
                        {!user.ativo && (
                          <Badge variant="destructive">Inativo</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        Criado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum usuário cadastrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Alterar perfil e status do usuário
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <Label>Nome: {selectedUser.nome}</Label>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
                <div>
                  <Label htmlFor="edit-perfil">Perfil</Label>
                  <Select name="perfil" defaultValue={selectedUser.perfil} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visualizacao">Visualização</SelectItem>
                      <SelectItem value="aprovacao_empresa">Aprovação de Empresa</SelectItem>
                      <SelectItem value="aprovacao_credito">Aprovação de Crédito</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-ativo">Status</Label>
                  <Select name="ativo" defaultValue={selectedUser.ativo ? "true" : "false"} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Ativo</SelectItem>
                      <SelectItem value="false">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setSelectedUser(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updateUserMutation.isPending}>
                    {updateUserMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}