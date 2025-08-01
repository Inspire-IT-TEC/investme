import { useState, useEffect } from "react";
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
import { Link } from "wouter";
import { InvestmeLogo } from "@/components/ui/logo";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";

export default function ResetPassword() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [token, setToken] = useState("");
  const [userType, setUserType] = useState("");
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [passwordReset, setPasswordReset] = useState(false);

  // Extract token and type from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const typeParam = urlParams.get('type');
    
    if (tokenParam && typeParam) {
      setToken(tokenParam);
      setUserType(typeParam);
      setIsValidToken(true);
    } else {
      setIsValidToken(false);
    }
  }, [location]);

  const getLoginLink = () => {
    if (userType === 'entrepreneur') return '/login/entrepreneur';
    if (userType === 'investor') return '/login/investor';
    if (userType === 'admin') return '/backoffice/login';
    return '/';
  };

  const getTitle = () => {
    if (userType === 'entrepreneur') return 'Portal do Empreendedor';
    if (userType === 'investor') return 'Portal do Investidor';
    if (userType === 'admin') return 'Portal Administrativo';
    return 'InvestMe';
  };

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/password-reset/confirm", {
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }
      return response.json();
    },
    onSuccess: () => {
      setPasswordReset(true);
      toast({
        title: "Senha redefinida com sucesso!",
        description: "Você já pode fazer login com sua nova senha.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao redefinir senha",
        description: error.message || "Não foi possível redefinir a senha",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Erro de validação", 
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    resetPasswordMutation.mutate(formData);
  };

  const isEntrepreneur = userType === 'entrepreneur';
  const isAdmin = userType === 'admin';

  if (isValidToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="shadow-xl border-0">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Link inválido
                </h3>
                <p className="text-gray-600 mb-6">
                  Este link de recuperação de senha é inválido ou expirou.
                </p>
                <Link href="/">
                  <Button className="w-full">
                    Voltar ao início
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      isEntrepreneur ? 'bg-gradient-to-br from-green-50 via-white to-green-100' : 
      isAdmin ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' :
      'bg-gradient-to-br from-blue-50 via-white to-blue-100'
    }`}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <InvestmeLogo className="h-12" />
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isAdmin ? 'text-white' : 'text-gray-900'}`}>
            {getTitle()}
          </h1>
          <p className={isAdmin ? 'text-gray-300' : 'text-gray-600'}>
            Redefinir Senha
          </p>
        </div>

        {!passwordReset ? (
          <Card className={`shadow-xl border-0 ${
            isEntrepreneur ? 'gradient-primary-green' : 
            isAdmin ? 'bg-gray-800 border-gray-700' :
            'gradient-primary'
          }`}>
            <CardHeader className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 mx-auto ${
                isAdmin ? 'bg-gray-700' : 'bg-white/20'
              }`}>
                <Lock className={`w-8 h-8 ${isAdmin ? 'text-white' : 'text-white'}`} />
              </div>
              <CardTitle className={`text-2xl ${isAdmin ? 'text-white' : 'text-white'}`}>
                Criar nova senha
              </CardTitle>
              <CardDescription className={isAdmin ? 'text-gray-300' : 'text-white/80'}>
                Digite sua nova senha abaixo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="newPassword" className={`font-medium ${isAdmin ? 'text-white' : 'text-white'}`}>
                    Nova Senha
                  </Label>
                  <PasswordInput
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="Digite sua nova senha"
                    className={`${
                      isAdmin 
                        ? 'bg-gray-700 border-gray-600 focus:border-blue-500 text-white placeholder:text-gray-400'
                        : 'bg-white/95 border-white/30 focus:border-white text-gray-900 placeholder:text-gray-500'
                    }`}
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className={`font-medium ${isAdmin ? 'text-white' : 'text-white'}`}>
                    Confirmar Nova Senha
                  </Label>
                  <PasswordInput
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirme sua nova senha"
                    className={`${
                      isAdmin 
                        ? 'bg-gray-700 border-gray-600 focus:border-blue-500 text-white placeholder:text-gray-400'
                        : 'bg-white/95 border-white/30 focus:border-white text-gray-900 placeholder:text-gray-500'
                    }`}
                    required
                    minLength={6}
                  />
                </div>

                {resetPasswordMutation.error && (
                  <Alert variant="destructive" className="bg-red-100/90 border-red-300/50 text-red-800">
                    <AlertDescription>
                      {(resetPasswordMutation.error as any)?.message || "Erro ao redefinir senha."}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className={`w-full py-3 font-semibold transition-all duration-200 shadow-lg ${
                    isAdmin
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : isEntrepreneur 
                        ? 'bg-white hover:bg-white/90 text-green-600'
                        : 'bg-white hover:bg-white/90 text-primary'
                  }`}
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? "Redefinindo..." : "Redefinir Senha"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link 
                  href={getLoginLink()}
                  className={`text-sm font-medium transition-colors ${
                    isAdmin 
                      ? 'text-gray-300 hover:text-white'
                      : 'text-white/80 hover:text-white hover:underline'
                  }`}
                >
                  Voltar ao login
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className={`shadow-xl border-0 ${
            isAdmin ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isAdmin ? 'text-white' : 'text-gray-900'}`}>
                  Senha redefinida com sucesso!
                </h3>
                <p className={`text-sm mb-6 ${isAdmin ? 'text-gray-300' : 'text-gray-600'}`}>
                  Sua senha foi alterada. Agora você pode fazer login com sua nova senha.
                </p>
                <Link href={getLoginLink()}>
                  <Button className="w-full">
                    Fazer Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}