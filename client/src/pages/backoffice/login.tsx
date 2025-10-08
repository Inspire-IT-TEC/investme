import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Shield } from "lucide-react";
import logoImage from "@assets/LogoSite_1759931025247.png";

export default function BackofficeLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    senha: ""
  });

  const loginMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/admin/auth/login", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Back Office Investme.",
      });
      // Use replace: true to remove login page from history (prevents Android back button issue)
      setLocation("/backoffice/dashboard", { replace: true });
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img src={logoImage} alt="InvestMe" className="h-16" />
          </div>
          <p className="text-gray-300 text-lg">Back Office - Acesso Restrito</p>
        </div>

        <Card className="border-gray-700">
          <CardHeader>
            <CardTitle className="text-center">Acesso Administrativo</CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais de administrador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@investme.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="senha">Senha</Label>
                <PasswordInput
                  id="senha"
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
                {loginMutation.isPending ? "Entrando..." : "Entrar no Back Office"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <div>
                <a 
                  href="/forgot-password/admin" 
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  Esqueceu sua senha?
                </a>
              </div>
              <div>
                <a 
                  href="/" 
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Voltar ao site principal
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
