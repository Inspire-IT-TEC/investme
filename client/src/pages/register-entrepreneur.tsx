import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building2, ArrowLeft, Loader2 } from "lucide-react";
import { formatCpf, formatCep, formatPhone, validateCpf, validateEmail, validatePassword } from "@/lib/validations";

export default function RegisterEntrepreneur() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    cpf: "",
    nomeCompleto: "",
    dataNascimento: "",
    email: "",
    senha: "",
    confirmarSenha: "",
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
  const [isConsultingCpf, setIsConsultingCpf] = useState(false);
  const [cpfConsulted, setCpfConsulted] = useState(false);
  const [isConsultingCep, setIsConsultingCep] = useState(false);
  const [cepConsulted, setCepConsulted] = useState(false);
  const [autoFilled, setAutoFilled] = useState({
    rua: false,
    bairro: false,
    cidade: false,
    estado: false
  });

  const consultCpfApi = async (cpf: string) => {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11 || !validateCpf(cpf)) {
      return;
    }

    setIsConsultingCpf(true);
    try {
      const response = await fetch(`https://integracaoconsultas.inspireit.com.br/consulta/${cleanCpf}`);
      const data = await response.json();
      
      if (data.returnCode === 0 && data.data?.encontrado) {
        // API retornou sucesso e dados encontrados
        setFormData(prev => ({
          ...prev,
          nomeCompleto: data.data.nomeCompleto || "",
          dataNascimento: data.data.dataNascimento ? new Date(data.data.dataNascimento).toISOString().split('T')[0] : ""
        }));
        setCpfConsulted(true);
        toast({
          title: "CPF consultado com sucesso!",
          description: "Os dados foram preenchidos automaticamente.",
        });
      } else {
        // API não retornou sucesso ou dados não encontrados
        setCpfConsulted(false);
        toast({
          title: "CPF não encontrado",
          description: "Preencha manualmente os dados pessoais.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao consultar CPF:', error);
      setCpfConsulted(false);
      toast({
        title: "Erro na consulta",
        description: "Não foi possível consultar o CPF. Preencha manualmente os dados.",
        variant: "destructive",
      });
    } finally {
      setIsConsultingCpf(false);
    }
  };

  const consultCepApi = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      return;
    }

    setIsConsultingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        // Rastrear quais campos foram preenchidos automaticamente e atualizar dados
        const newAutoFilled = {
          rua: !!(data.logradouro && data.logradouro.trim()),
          bairro: !!(data.bairro && data.bairro.trim()),
          cidade: !!(data.localidade && data.localidade.trim()),
          estado: !!(data.uf && data.uf.trim())
        };
        
        setAutoFilled(newAutoFilled);
        
        setFormData(prev => ({
          ...prev,
          rua: newAutoFilled.rua ? data.logradouro : prev.rua,
          bairro: newAutoFilled.bairro ? data.bairro : prev.bairro,
          cidade: newAutoFilled.cidade ? data.localidade : prev.cidade,
          estado: newAutoFilled.estado ? data.uf : prev.estado,
          complemento: data.complemento && data.complemento.trim() ? data.complemento : prev.complemento
        }));

        // Marcar como consultado se ao menos um campo foi preenchido
        const anyFieldFilled = Object.values(newAutoFilled).some(filled => filled);
        setCepConsulted(anyFieldFilled);
        
        if (anyFieldFilled) {
          toast({
            title: "CEP consultado com sucesso!",
            description: "Alguns dados de endereço foram preenchidos automaticamente.",
          });
        } else {
          toast({
            title: "CEP encontrado mas sem dados completos",
            description: "Complete manualmente os dados de endereço.",
            variant: "destructive",
          });
        }
      } else {
        // API retornou erro - CEP não encontrado
        setCepConsulted(false);
        setAutoFilled({ rua: false, bairro: false, cidade: false, estado: false });
        toast({
          title: "CEP não encontrado",
          description: "Preencha manualmente os dados de endereço.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao consultar CEP:', error);
      setCepConsulted(false);
      setAutoFilled({ rua: false, bairro: false, cidade: false, estado: false });
      toast({
        title: "Erro na consulta",
        description: "Não foi possível consultar o CEP. Preencha manualmente os dados.",
        variant: "destructive",
      });
    } finally {
      setIsConsultingCep(false);
    }
  };

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
      // Reset CPF consultation state when user changes CPF
      if (cpfConsulted) {
        setCpfConsulted(false);
      }
    } else if (field === "cep") {
      formattedValue = formatCep(value);
      // Reset CEP consultation state when user changes CEP
      if (cepConsulted) {
        setCepConsulted(false);
        setAutoFilled({ rua: false, bairro: false, cidade: false, estado: false });
      }
    } else if (field === "telefone") {
      formattedValue = formatPhone(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleCpfBlur = (cpf: string) => {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length === 11 && validateCpf(cpf)) {
      consultCpfApi(cpf);
    }
  };

  const handleCepBlur = (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      consultCepApi(cep);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!validateCpf(formData.cpf)) {
      newErrors.cpf = "CPF inválido";
    }

    if (!formData.nomeCompleto.trim()) {
      newErrors.nomeCompleto = "Nome completo é obrigatório";
    }

    if (!formData.dataNascimento) {
      newErrors.dataNascimento = "Data de nascimento é obrigatória";
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
                
                {/* CPF Field - First Field */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cpf">CPF *</Label>
                    <div className="relative">
                      <Input
                        id="cpf"
                        value={formData.cpf}
                        onChange={(e) => handleInputChange("cpf", e.target.value)}
                        onBlur={(e) => handleCpfBlur(e.target.value)}
                        placeholder="000.000.000-00"
                        className={errors.cpf ? "border-red-500" : ""}
                        disabled={isConsultingCpf}
                      />
                      {isConsultingCpf && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                    </div>
                    {errors.cpf && (
                      <p className="text-sm text-red-500 mt-1">{errors.cpf}</p>
                    )}
                    {isConsultingCpf && (
                      <p className="text-sm text-blue-600 mt-1">Consultando CPF...</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                    <Input
                      id="nomeCompleto"
                      value={formData.nomeCompleto}
                      onChange={(e) => handleInputChange("nomeCompleto", e.target.value)}
                      className={errors.nomeCompleto ? "border-red-500" : ""}
                      disabled={cpfConsulted}
                    />
                    {errors.nomeCompleto && (
                      <p className="text-sm text-red-500 mt-1">{errors.nomeCompleto}</p>
                    )}
                    {cpfConsulted && (
                      <p className="text-sm text-green-600 mt-1">Preenchido automaticamente</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                    <Input
                      id="dataNascimento"
                      type="date"
                      value={formData.dataNascimento}
                      onChange={(e) => handleInputChange("dataNascimento", e.target.value)}
                      className={errors.dataNascimento ? "border-red-500" : ""}
                      disabled={cpfConsulted}
                    />
                    {errors.dataNascimento && (
                      <p className="text-sm text-red-500 mt-1">{errors.dataNascimento}</p>
                    )}
                    {cpfConsulted && (
                      <p className="text-sm text-green-600 mt-1">Preenchido automaticamente</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="senha">Senha *</Label>
                    <PasswordInput
                      id="senha"
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
                    <PasswordInput
                      id="confirmarSenha"
                      value={formData.confirmarSenha}
                      onChange={(e) => handleInputChange("confirmarSenha", e.target.value)}
                      className={errors.confirmarSenha ? "border-red-500" : ""}
                    />
                    {errors.confirmarSenha && (
                      <p className="text-sm text-red-500 mt-1">{errors.confirmarSenha}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Endereço</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cep">CEP *</Label>
                    <div className="relative">
                      <Input
                        id="cep"
                        value={formData.cep}
                        onChange={(e) => handleInputChange("cep", e.target.value)}
                        onBlur={(e) => handleCepBlur(e.target.value)}
                        placeholder="00000-000"
                        className={errors.cep ? "border-red-500" : ""}
                        disabled={isConsultingCep}
                      />
                      {isConsultingCep && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                    </div>
                    {errors.cep && (
                      <p className="text-sm text-red-500 mt-1">{errors.cep}</p>
                    )}
                    {isConsultingCep && (
                      <p className="text-sm text-blue-600 mt-1">Consultando CEP...</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="rua">Rua *</Label>
                    <Input
                      id="rua"
                      value={formData.rua}
                      onChange={(e) => handleInputChange("rua", e.target.value)}
                      className={errors.rua ? "border-red-500" : ""}
                      disabled={autoFilled.rua}
                    />
                    {errors.rua && (
                      <p className="text-sm text-red-500 mt-1">{errors.rua}</p>
                    )}
                    {autoFilled.rua && (
                      <p className="text-sm text-green-600 mt-1">Preenchido automaticamente</p>
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
                      disabled={autoFilled.bairro}
                    />
                    {errors.bairro && (
                      <p className="text-sm text-red-500 mt-1">{errors.bairro}</p>
                    )}
                    {autoFilled.bairro && (
                      <p className="text-sm text-green-600 mt-1">Preenchido automaticamente</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => handleInputChange("cidade", e.target.value)}
                      className={errors.cidade ? "border-red-500" : ""}
                      disabled={autoFilled.cidade}
                    />
                    {errors.cidade && (
                      <p className="text-sm text-red-500 mt-1">{errors.cidade}</p>
                    )}
                    {autoFilled.cidade && (
                      <p className="text-sm text-green-600 mt-1">Preenchido automaticamente</p>
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
                      disabled={autoFilled.estado}
                    />
                    {errors.estado && (
                      <p className="text-sm text-red-500 mt-1">{errors.estado}</p>
                    )}
                    {autoFilled.estado && (
                      <p className="text-sm text-green-600 mt-1">Preenchido automaticamente</p>
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