import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ModernSidebarLayout } from "@/components/layout/modern-sidebar-layout";
import { useAuth } from "@/hooks/use-auth";
import { 
  User, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Key,
  Eye,
  EyeOff
} from "lucide-react";

export default function InvestorProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Fetch investor profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/investor/profile'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/investor/profile");
      return response.json();
    },
    retry: false,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const response = await apiRequest("PUT", "/api/investor/profile", profileData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/investor/profile'] });
      setIsEditing(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro ao atualizar o perfil.",
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData: any) => {
      const response = await apiRequest("PUT", "/api/auth/change-password", passwordData);
      return response.json();
    },
    onSuccess: () => {
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Ocorreu um erro ao alterar a senha.",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = (formData: FormData) => {
    const profileData = Object.fromEntries(formData.entries());
    updateProfileMutation.mutate(profileData);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate(passwordData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'inativo':
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getApprovalStatus = (field: boolean | undefined) => {
    if (field === true) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (field === false) {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
    return <AlertCircle className="w-4 h-4 text-yellow-600" />;
  };

  if (isLoading) {
    return (
      <ModernSidebarLayout title="Perfil" userType="investor" theme="blue">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </ModernSidebarLayout>
    );
  }

  return (
    <ModernSidebarLayout title="Perfil" userType="investor" theme="blue">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
            <p className="text-muted-foreground">Gerencie suas informações pessoais e de investimento</p>
          </div>
          {profile && getStatusBadge(profile.status)}
        </div>

        {!profile ? (
          <Card>
            <CardContent className="py-16 text-center">
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Perfil não encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Ainda não há um perfil de investidor associado à sua conta.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Informações Pessoais</TabsTrigger>
              <TabsTrigger value="security">Segurança</TabsTrigger>
              <TabsTrigger value="status">Status da Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Dados Pessoais</CardTitle>
                      <CardDescription>
                        Mantenha suas informações atualizadas
                      </CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "outline" : "default"}
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? "Cancelar" : "Editar"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleSaveProfile(formData);
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nomeCompleto">Nome Completo</Label>
                        <Input
                          id="nomeCompleto"
                          name="nomeCompleto"
                          defaultValue={profile.nomeCompleto}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          defaultValue={profile.email}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cpf">CPF</Label>
                        <Input
                          id="cpf"
                          name="cpf"
                          defaultValue={profile.cpf}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rg">RG</Label>
                        <Input
                          id="rg"
                          name="rg"
                          defaultValue={profile.rg}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          name="telefone"
                          defaultValue={profile.telefone}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                        <Input
                          id="dataNascimento"
                          name="dataNascimento"
                          type="date"
                          defaultValue={profile.dataNascimento ? new Date(profile.dataNascimento).toISOString().split('T')[0] : ''}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="profissao">Profissão</Label>
                        <Input
                          id="profissao"
                          name="profissao"
                          defaultValue={profile.profissao}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rendaMensal">Renda Mensal</Label>
                        <Input
                          id="rendaMensal"
                          name="rendaMensal"
                          type="number"
                          defaultValue={profile.rendaMensal}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="endereco">Endereço</Label>
                        <Input
                          id="endereco"
                          name="endereco"
                          defaultValue={profile.endereco}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input
                          id="cidade"
                          name="cidade"
                          defaultValue={profile.cidade}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Input
                          id="estado"
                          name="estado"
                          defaultValue={profile.estado}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cep">CEP</Label>
                        <Input
                          id="cep"
                          name="cep"
                          defaultValue={profile.cep}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="experienciaInvestimentos">Experiência em Investimentos</Label>
                        <Textarea
                          id="experienciaInvestimentos"
                          name="experienciaInvestimentos"
                          defaultValue={profile.experienciaInvestimentos}
                          disabled={!isEditing}
                          rows={3}
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="objetivosInvestimento">Objetivos de Investimento</Label>
                        <Textarea
                          id="objetivosInvestimento"
                          name="objetivosInvestimento"
                          defaultValue={profile.objetivosInvestimento}
                          disabled={!isEditing}
                          rows={3}
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end mt-6">
                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            "Salvar Alterações"
                          )}
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        Alterar Senha
                      </CardTitle>
                      <CardDescription>
                        Mantenha sua conta segura alterando a senha regularmente
                      </CardDescription>
                    </div>
                    <Button
                      variant={isChangingPassword ? "outline" : "default"}
                      onClick={() => setIsChangingPassword(!isChangingPassword)}
                    >
                      {isChangingPassword ? "Cancelar" : "Alterar Senha"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isChangingPassword ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Senha Atual</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            placeholder="Digite sua senha atual"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nova Senha</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            placeholder="Digite sua nova senha"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="Confirme sua nova senha"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={handleChangePassword}
                          disabled={changePasswordMutation.isPending || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        >
                          {changePasswordMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Alterando...
                            </>
                          ) : (
                            "Alterar Senha"
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Clique no botão "Alterar Senha" para modificar sua senha de acesso
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="status" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status da Conta</CardTitle>
                  <CardDescription>
                    Acompanhe o status de aprovação do seu perfil
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getApprovalStatus(profile.emailConfirmado)}
                        <div>
                          <p className="font-medium">Email Confirmado</p>
                          <p className="text-sm text-muted-foreground">
                            Confirme seu email para ativar sua conta
                          </p>
                        </div>
                      </div>
                      <Badge variant={profile.emailConfirmado ? "default" : "secondary"}>
                        {profile.emailConfirmado ? "Confirmado" : "Pendente"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getApprovalStatus(profile.documentosVerificados)}
                        <div>
                          <p className="font-medium">Documentos Verificados</p>
                          <p className="text-sm text-muted-foreground">
                            CPF, RG e outros documentos foram validados
                          </p>
                        </div>
                      </div>
                      <Badge variant={profile.documentosVerificados ? "default" : "secondary"}>
                        {profile.documentosVerificados ? "Verificado" : "Pendente"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getApprovalStatus(profile.rendaComprovada)}
                        <div>
                          <p className="font-medium">Renda Comprovada</p>
                          <p className="text-sm text-muted-foreground">
                            Comprovantes de renda foram analisados
                          </p>
                        </div>
                      </div>
                      <Badge variant={profile.rendaComprovada ? "default" : "secondary"}>
                        {profile.rendaComprovada ? "Comprovada" : "Pendente"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getApprovalStatus(profile.perfilInvestidor)}
                        <div>
                          <p className="font-medium">Perfil de Investidor</p>
                          <p className="text-sm text-muted-foreground">
                            Questionário de perfil foi preenchido adequadamente
                          </p>
                        </div>
                      </div>
                      <Badge variant={profile.perfilInvestidor ? "default" : "secondary"}>
                        {profile.perfilInvestidor ? "Aprovado" : "Pendente"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getApprovalStatus(profile.cadastroAprovado)}
                        <div>
                          <p className="font-medium">Cadastro Aprovado</p>
                          <p className="text-sm text-muted-foreground">
                            Aprovação final do cadastro
                          </p>
                        </div>
                      </div>
                      <Badge variant={profile.cadastroAprovado ? "default" : "secondary"}>
                        {profile.cadastroAprovado ? "Aprovado" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ModernSidebarLayout>
  );
}