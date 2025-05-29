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
import { Shield } from "lucide-react";

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
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Back Office Investme.",
      });
      setLocation("/backoffice/dashboard");
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
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white rounded-full">
              <Shield className="w-8 h-8 text-gray-800" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Investme</h1>
          <p className="text-gray-300">Back Office - Acesso Restrito</p>
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
                {loginMutation.isPending ? "Entrando..." : "Entrar no Back Office"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <a 
                href="/" 
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Voltar ao site principal
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
