import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building2, ArrowLeft } from "lucide-react";
import { formatCpf, formatCep, formatPhone, validateCpf, validateEmail, validatePassword } from "@/lib/validations";

export default function RegisterEntrepreneur() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    cpf: "",
    rg: "",
    telefone: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/entrepreneurs/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao cadastrar");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Você já pode fazer login como empreendedor.",
      });
      setLocation("/login/entrepreneur");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === "cpf") {
      formattedValue = formatCpf(value);
    } else if (field === "cep") {
      formattedValue = formatCep(value);
    } else if (field === "telefone") {
      formattedValue = formatPhone(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nomeCompleto.trim()) {
      newErrors.nomeCompleto = "Nome completo é obrigatório";
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = "Email inválido";
    }

    const passwordValidation = validatePassword(formData.senha);
    if (!passwordValidation.isValid) {
      newErrors.senha = passwordValidation.errors[0];
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = "Senhas não coincidem";
    }

    if (!validateCpf(formData.cpf)) {
      newErrors.cpf = "CPF inválido";
    }

    if (!formData.rg.trim()) {
      newErrors.rg = "RG é obrigatório";
    }

    // Validações de endereço
    if (!formData.cep.trim()) {
      newErrors.cep = "CEP é obrigatório";
    }
    if (!formData.rua.trim()) {
      newErrors.rua = "Rua é obrigatória";
    }
    if (!formData.numero.trim()) {
      newErrors.numero = "Número é obrigatório";
    }
    if (!formData.bairro.trim()) {
      newErrors.bairro = "Bairro é obrigatório";
    }
    if (!formData.cidade.trim()) {
      newErrors.cidade = "Cidade é obrigatória";
    }
    if (!formData.estado.trim()) {
      newErrors.estado = "Estado é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const { confirmarSenha, ...dataToSubmit } = formData;
      registerMutation.mutate(dataToSubmit);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-blue-700">
              Cadastro de Empreendedor
            </CardTitle>
            <CardDescription>
              Preencha os dados para solicitar crédito para suas empresas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Dados Pessoais</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                    <Input
                      id="nomeCompleto"
                      value={formData.nomeCompleto}
                      onChange={(e) => handleInputChange("nomeCompleto", e.target.value)}
                      className={errors.nomeCompleto ? "border-red-500" : ""}
                    />
                    {errors.nomeCompleto && (
                      <p className="text-sm text-red-500 mt-1">{errors.nomeCompleto}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="senha">Senha *</Label>
                    <Input
                      id="senha"
                      type="password"
                      value={formData.senha}
                      onChange={(e) => handleInputChange("senha", e.target.value)}
                      className={errors.senha ? "border-red-500" : ""}
                    />
                    {errors.senha && (
                      <p className="text-sm text-red-500 mt-1">{errors.senha}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                    <Input
                      id="confirmarSenha"
                      type="password"
                      value={formData.confirmarSenha}
                      onChange={(e) => handleInputChange("confirmarSenha", e.target.value)}
                      className={errors.confirmarSenha ? "border-red-500" : ""}
                    />
                    {errors.confirmarSenha && (
                      <p className="text-sm text-red-500 mt-1">{errors.confirmarSenha}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange("cpf", e.target.value)}
                      placeholder="000.000.000-00"
                      className={errors.cpf ? "border-red-500" : ""}
                    />
                    {errors.cpf && (
                      <p className="text-sm text-red-500 mt-1">{errors.cpf}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="rg">RG *</Label>
                    <Input
                      id="rg"
                      value={formData.rg}
                      onChange={(e) => handleInputChange("rg", e.target.value)}
                      className={errors.rg ? "border-red-500" : ""}
                    />
                    {errors.rg && (
                      <p className="text-sm text-red-500 mt-1">{errors.rg}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange("telefone", e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Endereço</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => handleInputChange("cep", e.target.value)}
                      placeholder="00000-000"
                      className={errors.cep ? "border-red-500" : ""}
                    />
                    {errors.cep && (
                      <p className="text-sm text-red-500 mt-1">{errors.cep}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="rua">Rua *</Label>
                    <Input
                      id="rua"
                      value={formData.rua}
                      onChange={(e) => handleInputChange("rua", e.target.value)}
                      className={errors.rua ? "border-red-500" : ""}
                    />
                    {errors.rua && (
                      <p className="text-sm text-red-500 mt-1">{errors.rua}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="numero">Número *</Label>
                    <Input
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => handleInputChange("numero", e.target.value)}
                      className={errors.numero ? "border-red-500" : ""}
                    />
                    {errors.numero && (
                      <p className="text-sm text-red-500 mt-1">{errors.numero}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={formData.complemento}
                      onChange={(e) => handleInputChange("complemento", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bairro">Bairro *</Label>
                    <Input
                      id="bairro"
                      value={formData.bairro}
                      onChange={(e) => handleInputChange("bairro", e.target.value)}
                      className={errors.bairro ? "border-red-500" : ""}
                    />
                    {errors.bairro && (
                      <p className="text-sm text-red-500 mt-1">{errors.bairro}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => handleInputChange("cidade", e.target.value)}
                      className={errors.cidade ? "border-red-500" : ""}
                    />
                    {errors.cidade && (
                      <p className="text-sm text-red-500 mt-1">{errors.cidade}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="estado">Estado *</Label>
                    <Input
                      id="estado"
                      value={formData.estado}
                      onChange={(e) => handleInputChange("estado", e.target.value)}
                      placeholder="SP"
                      className={errors.estado ? "border-red-500" : ""}
                    />
                    {errors.estado && (
                      <p className="text-sm text-red-500 mt-1">{errors.estado}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Link href="/user-type-selection">
                  <Button type="button" variant="outline" className="flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </div>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link href="/login/entrepreneur" className="text-blue-600 hover:underline">
                  Faça login aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}