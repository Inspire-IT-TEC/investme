import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  User, 
  Save, 
  AlertCircle,
  CheckCircle,
  Clock,
  Edit
} from "lucide-react";
import UnifiedNavbar from "@/components/layout/unified-navbar";

const profileUpdateSchema = z.object({
  nomeCompleto: z.string().min(1, "Nome completo é obrigatório"),
  email: z.string().email("Email inválido"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos"),
  rg: z.string().min(1, "RG é obrigatório"),
  cep: z.string().min(8, "CEP deve ter 8 dígitos"),
  rua: z.string().min(1, "Rua é obrigatória"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().min(2, "Estado é obrigatório"),
  telefone: z.string().optional(),
});

const passwordChangeSchema = z.object({
  senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
  novaSenha: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string().min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

type ProfileFormData = z.infer<typeof profileUpdateSchema>;
type PasswordChangeData = z.infer<typeof passwordChangeSchema>;

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  // Determine user type based on current path or stored data
  const getCurrentUserType = () => {
    // Check if we're in investor context
    if (window.location.pathname.includes('/investor') || 
        localStorage.getItem('userType') === 'investor' ||
        user?.role === 'investor') {
      return 'investor';
    }
    return 'entrepreneur';
  };
  
  const userType = getCurrentUserType();

  // Fetch current user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: [`/api/${userType}/profile`],
    queryFn: async () => {
      const response = await fetch(`/api/${userType}/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Erro ao carregar perfil');
      return response.json();
    },
  });

  // Fetch pending profile changes
  const { data: pendingChanges } = useQuery({
    queryKey: [`/api/${userType}/pending-profile-changes`],
    queryFn: async () => {
      const response = await fetch(`/api/${userType}/pending-profile-changes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) return null;
      return response.json();
    },
  });

  // Check if user has approved company (for investors)
  const { data: companyStatus } = useQuery({
    queryKey: [`/api/${userType}/company-status`],
    queryFn: async () => {
      if (userType !== "investor") return { hasApprovedCompany: true };
      const response = await fetch(`/api/investor/company-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) return { hasApprovedCompany: false };
      return response.json();
    },
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      nomeCompleto: profile?.nomeCompleto || "",
      email: profile?.email || "",
      cpf: profile?.cpf || "",
      rg: profile?.rg || "",
      cep: profile?.cep || "",
      rua: profile?.rua || "",
      numero: profile?.numero || "",
      complemento: profile?.complemento || "",
      bairro: profile?.bairro || "",
      cidade: profile?.cidade || "",
      estado: profile?.estado || "",
      telefone: profile?.telefone || "",
    },
  });

  // Reset form when profile data loads
  useState(() => {
    if (profile) {
      form.reset({
        nomeCompleto: profile.nomeCompleto || "",
        email: profile.email || "",
        cpf: profile.cpf || "",
        rg: profile.rg || "",
        cep: profile.cep || "",
        rua: profile.rua || "",
        numero: profile.numero || "",
        complemento: profile.complemento || "",
        bairro: profile.bairro || "",
        cidade: profile.cidade || "",
        estado: profile.estado || "",
        telefone: profile.telefone || "",
      });
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await fetch(`/api/${userType}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar perfil');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Alterações enviadas!",
        description: "Suas alterações foram enviadas para aprovação do backoffice.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: [`/api/${userType}/pending-profile-changes`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancelEdit = () => {
    form.reset();
    setIsEditing(false);
  };

  // Password change form
  const passwordForm = useForm<PasswordChangeData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      senhaAtual: "",
      novaSenha: "",
      confirmarSenha: "",
    },
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordChangeData) => {
      const response = await fetch(`/api/${userType}/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao alterar senha');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Senha alterada!",
        description: "Sua senha foi alterada com sucesso.",
      });
      passwordForm.reset();
      setShowPasswordChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onPasswordSubmit = (data: PasswordChangeData) => {
    changePasswordMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedNavbar 
          userType={userType} 
          userName={user?.nome || user?.nomeCompleto || "Usuário"}
          isCompanyApproved={companyStatus?.hasApprovedCompany}
        />
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar 
        userType={userType} 
        userName={profile?.nomeCompleto || "Usuário"}
        isCompanyApproved={companyStatus?.hasApprovedCompany}
      />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <User className="h-8 w-8 mr-3" />
            Meu Perfil
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie suas informações pessoais
          </p>
        </div>

        {/* Pending Changes Alert */}
        {pendingChanges && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Você tem alterações pendentes de aprovação pelo backoffice.</span>
                <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                  Aguardando Aprovação
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Suas informações de cadastro. Alterações ficam pendentes para aprovação.
              </CardDescription>
            </div>
            {!isEditing && (
              <Button 
                onClick={() => setIsEditing(true)}
                className="flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nomeCompleto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RG</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rua"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rua</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="numero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="complemento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bairro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {isEditing && (
                  <div className="flex space-x-4 pt-6">
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="flex items-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateProfileMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancelEdit}
                      disabled={updateProfileMutation.isPending}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}