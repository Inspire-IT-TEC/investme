import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export function ConfirmEmailPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resending'>('loading');
  const [message, setMessage] = useState('');
  const [userType, setUserType] = useState<'entrepreneur' | 'investor'>('entrepreneur');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const type = urlParams.get('type') as 'entrepreneur' | 'investor';

    if (!token || !type) {
      setStatus('error');
      setMessage('Link de confirmação inválido. Verifique se você clicou no link correto do email.');
      return;
    }

    setUserType(type);
    confirmEmail(token);
  }, []);

  const confirmEmail = async (token: string) => {
    try {
      const response = await apiRequest('POST', '/api/email-confirmation/confirm', {
        token
      });

      if (response.ok) {
        const data = await response.json();
        setStatus('success');
        setMessage(data.message);
      } else {
        const errorData = await response.json();
        setStatus('error');
        setMessage(errorData.message || 'Erro ao confirmar email');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Erro de conexão. Tente novamente mais tarde.');
    }
  };

  const resendConfirmationEmail = async () => {
    if (!email) {
      setMessage('Digite seu email para reenviar a confirmação.');
      return;
    }

    setStatus('resending');
    try {
      const response = await apiRequest('POST', '/api/email-confirmation/request', {
        email,
        userType
      });

      if (response.ok) {
        setMessage('Email de confirmação reenviado com sucesso! Verifique sua caixa de entrada.');
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Erro ao reenviar email');
      }
    } catch (error) {
      setMessage('Erro de conexão. Tente novamente mais tarde.');
    } finally {
      setStatus('error'); // Return to error state to show the message
    }
  };

  const goToLogin = () => {
    const loginPath = userType === 'entrepreneur' ? '/entrepreneur-login' : '/investor-login';
    setLocation(loginPath);
  };

  const userTypeLabel = userType === 'entrepreneur' ? 'Empreendedor' : 'Investidor';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            {status === 'loading' && <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-8 w-8 text-green-600" />}
            {status === 'error' && <AlertCircle className="h-8 w-8 text-red-600" />}
            {status === 'resending' && <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />}
          </div>
          <CardTitle className="text-xl">
            {status === 'loading' && 'Confirmando Email...'}
            {status === 'success' && 'Email Confirmado!'}
            {status === 'error' && 'Erro na Confirmação'}
            {status === 'resending' && 'Reenviando Email...'}
          </CardTitle>
          <CardDescription>
            Portal {userTypeLabel} - InvestMe
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert className={
            status === 'success' ? 'border-green-200 bg-green-50' :
            status === 'error' ? 'border-red-200 bg-red-50' :
            'border-blue-200 bg-blue-50'
          }>
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>

          {status === 'success' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">
                Sua conta foi ativada com sucesso! Agora você pode fazer login e acessar a plataforma.
              </p>
              <Button onClick={goToLogin} className="w-full">
                Ir para Login
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <p>Não conseguiu confirmar seu email? Tente as opções abaixo:</p>
                <ul className="mt-2 list-disc list-inside space-y-1 text-xs">
                  <li>Verifique se o link do email ainda é válido (24 horas)</li>
                  <li>Verifique sua pasta de spam</li>
                  <li>Solicite um novo email de confirmação</li>
                </ul>
              </div>
              
              <div className="border-t pt-3">
                <label className="text-sm font-medium text-gray-700">
                  Reenviar confirmação para:
                </label>
                <div className="flex gap-2 mt-1">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <Button
                    onClick={resendConfirmationEmail}
                    variant="outline"
                    size="sm"
                    disabled={status === 'resending'}
                  >
                    Reenviar
                  </Button>
                </div>
              </div>

              <Button onClick={goToLogin} variant="outline" className="w-full">
                Voltar para Login
              </Button>
            </div>
          )}

          {status === 'loading' && (
            <div className="text-center text-sm text-gray-600">
              Aguarde enquanto confirmamos seu email...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}