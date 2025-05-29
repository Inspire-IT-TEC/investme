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
import { formatCpf, formatCep } from "@/lib/validations";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    cpf: "",
    rg: "",
    nomeCompleto: "",
    email: "",
    senha: "",
    confirmSenha: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: ""
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const { confirmSenha, ...submitData } = data;
      const response = await apiRequest("POST", "/api/auth/register", submitData);
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Bem-vindo à plataforma Investme.",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro ao criar conta",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmSenha) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (formData.senha.length < 8) {
      toast({
        title: "Erro de validação",
        description: "A senha deve ter pelo menos 8 caracteres",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate(formData);
  };

  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    setFormData({ ...formData, cep: formatCep(cleanCep) });

    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            rua: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            estado: data.uf || ""
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Investme</h1>
          <p className="text-gray-600">Cadastre-se na Plataforma de Crédito Empresarial</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criar nova conta</CardTitle>
            <CardDescription>
              Preencha seus dados pessoais para começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Pessoais */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dados Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: formatCpf(e.target.value) })}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="rg">RG *</Label>
                    <Input
                      id="rg"
                      type="text"
                      value={formData.rg}
                      onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                      placeholder="Digite seu RG"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                    <Input
                      id="nomeCompleto"
                      type="text"
                      value={formData.nomeCompleto}
                      onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                      placeholder="Digite seu nome completo"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                      id="cep"
                      type="text"
                      value={formData.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      placeholder="00000-000"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="rua">Rua/Avenida *</Label>
                    <Input
                      id="rua"
                      type="text"
                      value={formData.rua}
                      onChange={(e) => setFormData({ ...formData, rua: e.target.value })}
                      placeholder="Preenchido automaticamente"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="numero">Número *</Label>
                    <Input
                      id="numero"
                      type="text"
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      placeholder="123"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      type="text"
                      value={formData.complemento}
                      onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                      placeholder="Sala, Andar..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="bairro">Bairro *</Label>
                    <Input
                      id="bairro"
                      type="text"
                      value={formData.bairro}
                      onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                      placeholder="Preenchido automaticamente"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                      id="cidade"
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      placeholder="Preenchido automaticamente"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="estado">Estado *</Label>
                    <Input
                      id="estado"
                      type="text"
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      placeholder="SP"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Senha */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Senha</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="senha">Senha *</Label>
                    <Input
                      id="senha"
                      type="password"
                      value={formData.senha}
                      onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                      placeholder="Mínimo 8 caracteres"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Mín. 8 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 símbolo
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="confirmSenha">Confirmar Senha *</Label>
                    <Input
                      id="confirmSenha"
                      type="password"
                      value={formData.confirmSenha}
                      onChange={(e) => setFormData({ ...formData, confirmSenha: e.target.value })}
                      placeholder="Confirme sua senha"
                      required
                    />
                  </div>
                </div>
              </div>

              {registerMutation.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {(registerMutation.error as any)?.message || "Erro no cadastro"}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Link href="/login">
                  <Button type="button" variant="outline">
                    Voltar ao Login
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Criando conta..." : "Criar Conta"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
