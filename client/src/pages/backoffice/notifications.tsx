import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { ModernSidebarLayout } from "@/components/layout/modern-sidebar-layout";
import { Bell, Plus, Edit, Trash2, Users, User, Eye, Send } from "lucide-react";

export default function BackofficeNotifications() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<any>(null);
  const [newNotification, setNewNotification] = useState({
    titulo: '',
    conteudo: '',
    tipoUsuario: 'both',
    usuarioEspecificoId: null as number | null,
    tipoUsuarioEspecifico: '',
    ativa: true
  });

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['/api/admin/notifications'],
    queryFn: () => {
      return fetch('/api/admin/notifications', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
  });

  // Fetch users for targeting
  const { data: entrepreneurs } = useQuery({
    queryKey: ['/api/admin/users/for-notifications', 'entrepreneur'],
    queryFn: () => {
      return fetch('/api/admin/users/for-notifications?userType=entrepreneur', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
  });

  const { data: investors } = useQuery({
    queryKey: ['/api/admin/users/for-notifications', 'investor'],
    queryFn: () => {
      return fetch('/api/admin/users/for-notifications?userType=investor', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
  });

  // Create notification mutation
  const createNotificationMutation = useMutation({
    mutationFn: async (notificationData: any) => {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar notificação');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notificação criada!",
        description: "A notificação foi criada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
      setIsCreateDialogOpen(false);
      setNewNotification({
        titulo: '',
        conteudo: '',
        tipoUsuario: 'both',
        usuarioEspecificoId: null,
        tipoUsuarioEspecifico: '',
        ativa: true
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar notificação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update notification mutation
  const updateNotificationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar notificação');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notificação atualizada!",
        description: "A notificação foi atualizada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
      setEditingNotification(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar notificação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao excluir notificação');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notificação excluída!",
        description: "A notificação foi excluída com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir notificação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateNotification = () => {
    createNotificationMutation.mutate(newNotification);
  };

  const handleUpdateNotification = () => {
    if (editingNotification) {
      updateNotificationMutation.mutate({
        id: editingNotification.id,
        data: editingNotification
      });
    }
  };

  const toggleNotificationStatus = (notification: any) => {
    updateNotificationMutation.mutate({
      id: notification.id,
      data: { ...notification, ativa: !notification.ativa }
    });
  };

  const getStatusBadge = (ativa: boolean) => {
    return ativa ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Ativa</Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inativa</Badge>
    );
  };

  const getUserTypeBadge = (tipoUsuario: string) => {
    const typeMap = {
      'entrepreneur': { label: 'Empreendedores', color: 'bg-green-100 text-green-800' },
      'investor': { label: 'Investidores', color: 'bg-blue-100 text-blue-800' },
      'both': { label: 'Ambos', color: 'bg-purple-100 text-purple-800' }
    };
    
    const type = typeMap[tipoUsuario as keyof typeof typeMap] || { label: tipoUsuario, color: 'bg-gray-100 text-gray-800' };
    
    return <Badge variant="outline" className={type.color}>{type.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <ModernSidebarLayout title="Notificações" userType="admin" theme="blue">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando notificações...</p>
          </div>
        </div>
      </ModernSidebarLayout>
    );
  }

  return (
    <ModernSidebarLayout title="Notificações" userType="admin" theme="blue">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Bell className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
              Gerenciar Notificações
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2">
              Crie e gerencie notificações para empreendedores e investidores
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Notificação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl mx-4 md:mx-auto">
              <DialogHeader>
                <DialogTitle>Criar Nova Notificação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={newNotification.titulo}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Digite o título da notificação"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="conteudo">Conteúdo</Label>
                  <Textarea
                    id="conteudo"
                    value={newNotification.conteudo}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, conteudo: e.target.value }))}
                    placeholder="Digite o conteúdo da notificação"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipoUsuario">Tipo de Usuário</Label>
                    <Select
                      value={newNotification.tipoUsuario}
                      onValueChange={(value) => setNewNotification(prev => ({ 
                        ...prev, 
                        tipoUsuario: value,
                        usuarioEspecificoId: null,
                        tipoUsuarioEspecifico: ''
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">Ambos (Empreendedores e Investidores)</SelectItem>
                        <SelectItem value="entrepreneur">Apenas Empreendedores</SelectItem>
                        <SelectItem value="investor">Apenas Investidores</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Usuário Específico (Opcional)</Label>
                    {newNotification.tipoUsuario === 'entrepreneur' && (
                      <Select
                        value={newNotification.usuarioEspecificoId?.toString() || ''}
                        onValueChange={(value) => setNewNotification(prev => ({
                          ...prev,
                          usuarioEspecificoId: value ? parseInt(value) : null,
                          tipoUsuarioEspecifico: value ? 'entrepreneur' : ''
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os empreendedores" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos os empreendedores</SelectItem>
                          {entrepreneurs?.map((user: any) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.nome} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {newNotification.tipoUsuario === 'investor' && (
                      <Select
                        value={newNotification.usuarioEspecificoId?.toString() || ''}
                        onValueChange={(value) => setNewNotification(prev => ({
                          ...prev,
                          usuarioEspecificoId: value ? parseInt(value) : null,
                          tipoUsuarioEspecifico: value ? 'investor' : ''
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os investidores" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos os investidores</SelectItem>
                          {investors?.map((user: any) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.nome} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {newNotification.tipoUsuario === 'both' && (
                      <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                        Para todos os usuários
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativa"
                    checked={newNotification.ativa}
                    onCheckedChange={(checked) => setNewNotification(prev => ({ ...prev, ativa: checked }))}
                  />
                  <Label htmlFor="ativa">Notificação ativa</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateNotification}
                    disabled={createNotificationMutation.isPending || !newNotification.titulo || !newNotification.conteudo}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {createNotificationMutation.isPending ? "Criando..." : "Criar Notificação"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {!notifications || notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bell className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma notificação encontrada
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Comece criando notificações para comunicar informações importantes aos usuários da plataforma.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification: any) => (
              <Card key={notification.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                        <CardTitle className="text-base md:text-lg">{notification.titulo}</CardTitle>
                        <div className="flex gap-2">
                          {getStatusBadge(notification.ativa)}
                          {getUserTypeBadge(notification.tipoUsuario)}
                        </div>
                      </div>
                      <CardDescription className="text-xs md:text-sm">
                        Criada por {notification.adminName} • {formatDate(notification.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleNotificationStatus(notification)}
                        className="text-xs md:text-sm"
                      >
                        {notification.ativa ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingNotification(notification)}
                        className="md:w-auto"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteNotificationMutation.mutate(notification.id)}
                        className="md:w-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {notification.conteudo}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {notification.usuarioEspecificoId ? (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Usuário específico</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>Para todos</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        {editingNotification && (
          <Dialog open={!!editingNotification} onOpenChange={() => setEditingNotification(null)}>
            <DialogContent className="max-w-2xl mx-4 md:mx-auto">
              <DialogHeader>
                <DialogTitle>Editar Notificação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-titulo">Título</Label>
                  <Input
                    id="edit-titulo"
                    value={editingNotification.titulo}
                    onChange={(e) => setEditingNotification(prev => ({ ...prev, titulo: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-conteudo">Conteúdo</Label>
                  <Textarea
                    id="edit-conteudo"
                    value={editingNotification.conteudo}
                    onChange={(e) => setEditingNotification(prev => ({ ...prev, conteudo: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-ativa"
                    checked={editingNotification.ativa}
                    onCheckedChange={(checked) => setEditingNotification(prev => ({ ...prev, ativa: checked }))}
                  />
                  <Label htmlFor="edit-ativa">Notificação ativa</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditingNotification(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleUpdateNotification}
                    disabled={updateNotificationMutation.isPending}
                  >
                    {updateNotificationMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ModernSidebarLayout>
  );
}