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
import { InvestmeLogo } from "@/components/ui/logo";
import { TrendingUp, Building2 } from "lucide-react";

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

  const userType = getUserType();
  const isInvestor = userType === 'investor';
  const isEntrepreneur = userType === 'entrepreneur';

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      isInvestor ? 'bg-gradient-to-br from-green-50 via-white to-emerald-50' :
      isEntrepreneur ? 'bg-gradient-to-br from-indigo-50 via-white to-purple-50' :
      'bg-gradient-to-br from-indigo-50 via-white to-blue-50'
    }`}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <InvestmeLogo className="h-12" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isInvestor ? 'Portal do Investidor' : 
             isEntrepreneur ? 'Portal do Empreendedor' : 
             'Entrar na Investme'}
          </h1>
          <p className="text-gray-600">Plataforma de Crédito Inteligente</p>
        </div>

        <Card className={`shadow-xl border-0 ${
          isInvestor ? 'bg-gradient-to-br from-green-600 to-emerald-700' :
          isEntrepreneur ? 'bg-gradient-to-br from-indigo-600 to-purple-700' :
          'bg-white'
        }`}>
          <CardHeader className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 mx-auto ${
              isInvestor ? 'bg-white/20' :
              isEntrepreneur ? 'bg-white/20' :
              'bg-indigo-100'
            }`}>
              {isInvestor ? (
                <TrendingUp className="w-8 h-8 text-white" />
              ) : isEntrepreneur ? (
                <Building2 className="w-8 h-8 text-white" />
              ) : (
                <Building2 className="w-8 h-8 text-indigo-600" />
              )}
            </div>
            <CardTitle className={isInvestor || isEntrepreneur ? 'text-white' : 'text-gray-900'}>
              {isInvestor ? 'Login do Investidor' : 
               isEntrepreneur ? 'Login do Empreendedor' : 
               'Entrar na sua conta'}
            </CardTitle>
            <CardDescription className={isInvestor || isEntrepreneur ? 'text-gray-100' : 'text-gray-600'}>
              Digite seu email ou CPF e senha para acessar o dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="login" className={isInvestor || isEntrepreneur ? 'text-white' : 'text-gray-700'}>
                  Email ou CPF
                </Label>
                <Input
                  id="login"
                  type="text"
                  value={formData.login}
                  onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                  placeholder="Digite seu email ou CPF"
                  className="bg-white/90 border-white/20"
                  required
                />
              </div>

              <div>
                <Label htmlFor="senha" className={isInvestor || isEntrepreneur ? 'text-white' : 'text-gray-700'}>
                  Senha
                </Label>
                <Input
                  id="senha"
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  placeholder="Digite sua senha"
                  className="bg-white/90 border-white/20"
                  required
                />
              </div>

              {loginMutation.error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertDescription>
                    {(loginMutation.error as any)?.message || "Erro no login. Verifique suas credenciais."}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className={`w-full py-3 font-medium transition-colors ${
                  isInvestor ? 'bg-white text-green-600 hover:bg-gray-50' :
                  isEntrepreneur ? 'bg-white text-indigo-600 hover:bg-gray-50' :
                  'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className={`text-sm ${isInvestor || isEntrepreneur ? 'text-gray-100' : 'text-gray-600'}`}>
                Não tem uma conta?{" "}
                <Link 
                  href="/register" 
                  className={`font-medium hover:underline ${
                    isInvestor || isEntrepreneur ? 'text-white' : 'text-indigo-600 hover:text-indigo-500'
                  }`}
                >
                  Cadastre-se aqui
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link 
                href="/backoffice" 
                className={`text-sm hover:underline ${
                  isInvestor || isEntrepreneur ? 'text-gray-200 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
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
