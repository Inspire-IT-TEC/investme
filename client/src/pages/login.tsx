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
import { Link } from "wouter";
import { TrendingUp, Building2, Mail } from "lucide-react";
import logoImage from "@assets/LogoSite_1759931025247.png";

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

  const [emailConfirmationError, setEmailConfirmationError] = useState<{
    message: string;
    email: string;
    userType: string;
  } | null>(null);
  const [hasEmailConfirmationError, setHasEmailConfirmationError] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", getLoginEndpoint(), data);
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
        description: "Bem-vindo à plataforma Investme.",
      });
      
      // Redirect to network as default landing page
      // Use replace: true to remove login page from history (prevents Android back button issue)
      setLocation("/network", { replace: true });
    },
    onError: (error: any) => {
      if (error.requiresEmailConfirmation) {
        setEmailConfirmationError({
          message: error.message,
          email: error.email,
          userType: getUserType()
        });
        setHasEmailConfirmationError(true);
      } else {
        setHasEmailConfirmationError(false);
        toast({
          title: "Erro no login",
          description: error.message || "Credenciais inválidas",
          variant: "destructive",
        });
      }
    },
  });

  const resendEmailMutation = useMutation({
    mutationFn: async ({ email, userType }: { email: string; userType: string }) => {
      const response = await apiRequest("POST", "/api/email-confirmation/request", {
        email,
        userType
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email reenviado!",
        description: "Verifique sua caixa de entrada e confirme seu email.",
      });
      setEmailConfirmationError(null);
      setHasEmailConfirmationError(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao reenviar email",
        description: error.message || "Tente novamente mais tarde.",
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
      isEntrepreneur ? 'bg-gradient-to-br from-green-50 via-white to-green-100' : 
      'bg-gradient-to-br from-blue-50 via-white to-blue-100'
    }`}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img src={logoImage} alt="InvestMe" className="h-16" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isInvestor ? 'Portal do Investidor' : 
             isEntrepreneur ? 'Portal do Empreendedor' : 
             'Entrar na Investme'}
          </h1>
          <p className="text-gray-600">Plataforma de Crédito Inteligente</p>
        </div>

        <Card className={`shadow-xl border-0 ${
          isEntrepreneur ? 'gradient-primary-green' : 'gradient-primary'
        }`}>
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 mx-auto bg-white/20">
              {isInvestor ? (
                <TrendingUp className="w-8 h-8 text-white" />
              ) : (
                <Building2 className="w-8 h-8 text-white" />
              )}
            </div>
            <CardTitle className="text-white text-2xl">
              {isInvestor ? 'Portal do Investidor' : 'Portal do Empreendedor'}
            </CardTitle>
            <CardDescription className="text-white/80">
              Digite seu email ou CPF e senha para acessar o dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="login" className="text-white font-medium">
                  Email ou CPF
                </Label>
                <Input
                  id="login"
                  type="text"
                  value={formData.login}
                  onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                  placeholder="Digite seu email ou CPF"
                  className="bg-white/95 border-white/30 focus:border-white text-gray-900 placeholder:text-gray-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="senha" className="text-white font-medium">
                  Senha
                </Label>
                <PasswordInput
                  id="senha"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  placeholder="••••••••"
                  className="bg-white/95 border-white/30 focus:border-white text-gray-900"
                  required
                />
              </div>

              {emailConfirmationError && (
                <Alert className="bg-amber-100/90 border-amber-300/50 text-amber-800">
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-3">
                      <p className="font-medium">{emailConfirmationError.message}</p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-amber-700 border-amber-300 hover:bg-amber-200"
                          onClick={() => resendEmailMutation.mutate({
                            email: emailConfirmationError.email,
                            userType: emailConfirmationError.userType
                          })}
                          disabled={resendEmailMutation.isPending}
                        >
                          {resendEmailMutation.isPending ? "Enviando..." : "Reenviar Email"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-amber-700 hover:bg-amber-200"
                          onClick={() => {
                            setEmailConfirmationError(null);
                            setHasEmailConfirmationError(false);
                          }}
                        >
                          Fechar
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {loginMutation.error && !hasEmailConfirmationError && (
                <Alert variant="destructive" className="bg-red-100/90 border-red-300/50 text-red-800">
                  <AlertDescription>
                    {(loginMutation.error as any)?.message || "Erro no login. Verifique suas credenciais."}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className={`w-full py-3 font-semibold bg-white hover:bg-white/90 transition-all duration-200 shadow-lg ${
                  isEntrepreneur ? 'text-green-600' : 'text-primary'
                }`}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              {isInvestor ? (
                <p className="text-sm text-white/80">
                  Não tem uma conta?{" "}
                  <span className="font-medium text-white/60">
                    Em breve
                  </span>
                </p>
              ) : (
                <p className="text-sm text-white/80">
                  Não tem uma conta?{" "}
                  <Link 
                    href="/register/entrepreneur" 
                    className="font-medium text-white hover:text-white/80 hover:underline transition-colors"
                  >
                    Cadastre-se aqui
                  </Link>
                </p>
              )}
              <p className="text-sm text-white/80">
                <Link 
                  href={`/forgot-password${userType === 'investor' ? '/investor' : userType === 'entrepreneur' ? '/entrepreneur' : ''}`}
                  className="font-medium text-white hover:text-white/80 hover:underline transition-colors"
                >
                  Esqueceu sua senha?
                </Link>
              </p>
              <p className="text-sm text-white/80">
                <a 
                  href="https://investme.com.br" 
                  className="font-medium text-white/60 hover:text-white/80 hover:underline transition-colors"
                >
                  ← Voltar ao site principal
                </a>
              </p>
            </div>


          </CardContent>
        </Card>
      </div>
    </div>
  );
}
