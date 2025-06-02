import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function Login() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    login: "",
    senha: ""
  });

  // Determine user type based on current route
  const getUserType = () => {
    if (location.includes('/login/investor')) return 'investor';
    if (location.includes('/login/entrepreneur')) return 'entrepreneur';
    return 'user';
  };

  const getLoginEndpoint = () => {
    const userType = getUserType();
    if (userType === 'investor') return '/api/investors/login';
    if (userType === 'entrepreneur') return '/api/entrepreneurs/login';
    return '/api/auth/login';
  };

  const loginMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", getLoginEndpoint(), data);
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo à plataforma Investme.",
      });
      
      // Redirect based on user type
      if (data.user.tipo === 'investor') {
        setLocation("/investor/dashboard");
      } else if (data.user.tipo === 'entrepreneur') {
        setLocation("/dashboard");
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Investme</h1>
          <p className="text-gray-600">Plataforma de Crédito Empresarial</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {getUserType() === 'investor' ? 'Login do Investidor' : 
               getUserType() === 'entrepreneur' ? 'Login do Empreendedor' : 
               'Entrar na sua conta'}
            </CardTitle>
            <CardDescription>
              Digite seu email ou CPF e senha para acessar o dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="login">Email ou CPF</Label>
                <Input
                  id="login"
                  type="text"
                  value={formData.login}
                  onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                  placeholder="Digite seu email ou CPF"
                  required
                />
              </div>

              <div>
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  placeholder="Digite sua senha"
                  required
                />
              </div>

              {loginMutation.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {(loginMutation.error as any)?.message || "Erro no login. Verifique suas credenciais."}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{" "}
                <Link href="/register" className="text-primary hover:text-primary/80 font-medium">
                  Cadastre-se aqui
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link 
                href="/backoffice" 
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Acesso para equipe Investme
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
