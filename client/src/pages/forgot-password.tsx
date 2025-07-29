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
import { Link } from "wouter";
import { InvestmeLogo } from "@/components/ui/logo";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Determine user type based on current route
  const getUserType = () => {
    if (location.includes('/entrepreneur')) return 'entrepreneur';
    if (location.includes('/investor')) return 'investor';
    if (location.includes('/admin') || location.includes('/backoffice')) return 'admin';
    return 'user';
  };

  const getBackLink = () => {
    const userType = getUserType();
    if (userType === 'entrepreneur') return '/login/entrepreneur';
    if (userType === 'investor') return '/login/investor';
    if (userType === 'admin') return '/backoffice/login';
    return '/';
  };

  const getTitle = () => {
    const userType = getUserType();
    if (userType === 'entrepreneur') return 'Portal do Empreendedor';
    if (userType === 'investor') return 'Portal do Investidor';
    if (userType === 'admin') return 'Portal Administrativo';
    return 'InvestMe';
  };

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/password-reset/request", { email });
      return response.json();
    },
    onSuccess: () => {
      setEmailSent(true);
      toast({
        title: "Email enviado com sucesso!",
        description: "Verifique sua caixa de entrada para instruções de recuperação.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Não foi possível enviar o email de recuperação",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      forgotPasswordMutation.mutate(email.trim());
    }
  };

  const userType = getUserType();
  const isEntrepreneur = userType === 'entrepreneur';
  const isAdmin = userType === 'admin';

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
            Recuperação de Senha
          </p>
        </div>

        {!emailSent ? (
          <Card className={`shadow-xl border-0 ${
            isEntrepreneur ? 'gradient-primary-green' : 
            isAdmin ? 'bg-gray-800 border-gray-700' :
            'gradient-primary'
          }`}>
            <CardHeader className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 mx-auto ${
                isAdmin ? 'bg-gray-700' : 'bg-white/20'
              }`}>
                <Mail className={`w-8 h-8 ${isAdmin ? 'text-white' : 'text-white'}`} />
              </div>
              <CardTitle className={`text-2xl ${isAdmin ? 'text-white' : 'text-white'}`}>
                Esqueceu sua senha?
              </CardTitle>
              <CardDescription className={isAdmin ? 'text-gray-300' : 'text-white/80'}>
                Digite seu email para receber as instruções de recuperação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className={`font-medium ${isAdmin ? 'text-white' : 'text-white'}`}>
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu email"
                    className={`${
                      isAdmin 
                        ? 'bg-gray-700 border-gray-600 focus:border-blue-500 text-white placeholder:text-gray-400'
                        : 'bg-white/95 border-white/30 focus:border-white text-gray-900 placeholder:text-gray-500'
                    }`}
                    required
                  />
                </div>

                {forgotPasswordMutation.error && (
                  <Alert variant="destructive" className="bg-red-100/90 border-red-300/50 text-red-800">
                    <AlertDescription>
                      {(forgotPasswordMutation.error as any)?.message || "Erro ao enviar email de recuperação."}
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
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending ? "Enviando..." : "Enviar Email de Recuperação"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link 
                  href={getBackLink()}
                  className={`inline-flex items-center text-sm font-medium transition-colors ${
                    isAdmin 
                      ? 'text-gray-300 hover:text-white'
                      : 'text-white/80 hover:text-white hover:underline'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
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
                  Email enviado com sucesso!
                </h3>
                <p className={`text-sm mb-6 ${isAdmin ? 'text-gray-300' : 'text-gray-600'}`}>
                  Enviamos as instruções para recuperar sua senha para <strong>{email}</strong>
                </p>
                <div className={`text-xs p-4 rounded-lg mb-6 ${
                  isAdmin ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'
                }`}>
                  <p className="mb-2"><strong>Importante:</strong></p>
                  <ul className="text-left space-y-1">
                    <li>• Verifique sua caixa de entrada e spam</li>
                    <li>• O link expira em 1 hora</li>
                    <li>• Se não receber, tente novamente</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setEmailSent(false);
                      setEmail("");
                    }}
                    variant="outline"
                    className={`w-full ${
                      isAdmin 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : ''
                    }`}
                  >
                    Enviar novamente
                  </Button>
                  <Link href={getBackLink()}>
                    <Button 
                      variant="ghost" 
                      className={`w-full ${
                        isAdmin 
                          ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar ao login
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}