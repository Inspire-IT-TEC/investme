import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import { formatCnpj, formatCep, formatCurrency } from "@/lib/validations";
import { Plus, Trash2, Upload, Loader2 } from "lucide-react";

export default function CompanyRegistration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    cnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    dataFundacao: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    telefone: "",
    emailContato: "",
    cnaePrincipal: "",
    cnaeSecundarios: [] as string[],
    inscricaoEstadual: "",
    inscricaoMunicipal: "",
    faturamento: "",
    ebitda: "",
    dividaLiquida: "",
    numeroFuncionarios: "1",
    descricaoNegocio: "",
    images: [] as string[],
  });

  const [shareholders, setShareholders] = useState([
    { nomeCompleto: "", cpf: "" }
  ]);

  const [guarantees, setGuarantees] = useState([
    { tipo: "", matricula: "", renavam: "", descricao: "", valorEstimado: "" }
  ]);

  const [uploadingImages, setUploadingImages] = useState(false);
  const [isConsultingCnpj, setIsConsultingCnpj] = useState(false);
  const [cnpjConsulted, setCnpjConsulted] = useState(false);

  const consultCnpjApi = async (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) {
      return;
    }

    setIsConsultingCnpj(true);
    try {
      const response = await fetch(`https://integracaoconsultas.inspireit.com.br/consulta/${cleanCnpj}`);
      const data = await response.json();
      
      if (data.returnCode === 0 && data.data?.encontrado) {
        // API retornou sucesso e dados encontrados
        setFormData(prev => ({
          ...prev,
          razaoSocial: data.data.razaoSocial || "",
          nomeFantasia: data.data.nomeFantasia || "",
          dataFundacao: data.data.dataFundacao ? new Date(data.data.dataFundacao).toISOString().split('T')[0] : ""
        }));
        setCnpjConsulted(true);
        toast({
          title: "CNPJ consultado com sucesso!",
          description: "Os dados da empresa foram preenchidos automaticamente.",
        });
      } else {
        // API não retornou sucesso ou dados não encontrados
        setCnpjConsulted(false);
        toast({
          title: "CNPJ não encontrado",
          description: "Preencha manualmente os dados da empresa.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao consultar CNPJ:', error);
      setCnpjConsulted(false);
      toast({
        title: "Erro na consulta",
        description: "Não foi possível consultar o CNPJ. Preencha manualmente os dados.",
        variant: "destructive",
      });
    } finally {
      setIsConsultingCnpj(false);
    }
  };

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/companies", data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/credit-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/entrepreneur/profile"] });
      
      toast({
        title: "Empresa cadastrada com sucesso!",
        description: "Sua empresa está sendo analisada pela equipe Investme.",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro ao cadastrar empresa",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === "cnpj") {
      formattedValue = formatCnpj(value);
      // Reset CNPJ consultation state when user changes CNPJ
      if (cnpjConsulted) {
        setCnpjConsulted(false);
      }
    } else if (field === "cep") {
      formattedValue = formatCep(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleCnpjBlur = (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length === 14) {
      consultCnpjApi(cnpj);
    }
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

  const addShareholder = () => {
    setShareholders([...shareholders, { nomeCompleto: "", cpf: "" }]);
  };

  const removeShareholder = (index: number) => {
    setShareholders(shareholders.filter((_, i) => i !== index));
  };

  const updateShareholder = (index: number, field: string, value: string) => {
    const updated = [...shareholders];
    updated[index] = { ...updated[index], [field]: value };
    setShareholders(updated);
  };

  const addGuarantee = () => {
    setGuarantees([...guarantees, { tipo: "", matricula: "", renavam: "", descricao: "", valorEstimado: "" }]);
  };

  const removeGuarantee = (index: number) => {
    setGuarantees(guarantees.filter((_, i) => i !== index));
  };

  const updateGuarantee = (index: number, field: string, value: string) => {
    const updated = [...guarantees];
    updated[index] = { ...updated[index], [field]: value };
    setGuarantees(updated);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const currentImageCount = formData.images.length;
    const maxImages = 5;
    const availableSlots = maxImages - currentImageCount;
    const filesToUpload = Array.from(files).slice(0, availableSlots);

    if (filesToUpload.length === 0) {
      toast({
        title: "Limite de imagens",
        description: "Você pode adicionar no máximo 5 imagens por empresa.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImages(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/upload/company-image', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!response.ok) throw new Error('Falha no upload da imagem');
        const result = await response.json();
        return result.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

      toast({
        title: "Imagens enviadas",
        description: `${uploadedUrls.length} imagem(ns) adicionada(s) com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Falha ao enviar uma ou mais imagens.",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      dataFundacao: formData.dataFundacao,
      faturamento: formData.faturamento.replace(/[^\d,]/g, '').replace(',', '.'),
      ebitda: formData.ebitda.replace(/[^\d,]/g, '').replace(',', '.'),
      dividaLiquida: formData.dividaLiquida.replace(/[^\d,]/g, '').replace(',', '.'),
      numeroFuncionarios: formData.numeroFuncionarios,
      descricaoNegocio: formData.descricaoNegocio,
      shareholders: shareholders.filter(s => s.nomeCompleto && s.cpf),
      guarantees: guarantees.filter(g => g.tipo && g.valorEstimado).map(g => ({
        ...g,
        valorEstimado: g.valorEstimado.replace(/[^\d,]/g, '').replace(',', '.')
      }))
    };

    registerMutation.mutate(submitData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Cadastro de Empresa</CardTitle>
            <CardDescription>
              Preencha os dados da sua empresa para análise de crédito
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Dados Básicos */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dados Básicos</h3>
                
                {/* CNPJ Field - First Field */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <div className="relative">
                      <Input
                        id="cnpj"
                        value={formData.cnpj}
                        onChange={(e) => handleInputChange("cnpj", e.target.value)}
                        onBlur={(e) => handleCnpjBlur(e.target.value)}
                        placeholder="00.000.000/0000-00"
                        className={isConsultingCnpj ? "pr-10" : ""}
                        disabled={isConsultingCnpj}
                        required
                      />
                      {isConsultingCnpj && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                    </div>
                    {isConsultingCnpj && (
                      <p className="text-sm text-blue-600 mt-1">Consultando CNPJ...</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="razaoSocial">Razão Social *</Label>
                    <Input
                      id="razaoSocial"
                      value={formData.razaoSocial}
                      onChange={(e) => handleInputChange("razaoSocial", e.target.value)}
                      placeholder="Digite a razão social"
                      disabled={cnpjConsulted}
                      required
                    />
                    {cnpjConsulted && (
                      <p className="text-sm text-green-600 mt-1">Preenchido automaticamente</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                    <Input
                      id="nomeFantasia"
                      value={formData.nomeFantasia}
                      onChange={(e) => handleInputChange("nomeFantasia", e.target.value)}
                      placeholder="Digite o nome fantasia"
                      disabled={cnpjConsulted}
                    />
                    {cnpjConsulted && (
                      <p className="text-sm text-green-600 mt-1">Preenchido automaticamente</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="dataFundacao">Data de Fundação *</Label>
                    <Input
                      id="dataFundacao"
                      type="date"
                      value={formData.dataFundacao}
                      onChange={(e) => handleInputChange("dataFundacao", e.target.value)}
                      disabled={cnpjConsulted}
                      required
                    />
                    {cnpjConsulted && (
                      <p className="text-sm text-green-600 mt-1">Preenchido automaticamente</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <Label htmlFor="emailContato">Email de Contato</Label>
                    <Input
                      id="emailContato"
                      type="email"
                      value={formData.emailContato}
                      onChange={(e) => setFormData({ ...formData, emailContato: e.target.value })}
                      placeholder="contato@empresa.com"
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
                      value={formData.complemento}
                      onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                      placeholder="Sala, Andar..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="bairro">Bairro *</Label>
                    <Input
                      id="bairro"
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
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      placeholder="SP"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* CNAE */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Atividade Econômica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cnaePrincipal">CNAE Principal *</Label>
                    <Input
                      id="cnaePrincipal"
                      value={formData.cnaePrincipal}
                      onChange={(e) => setFormData({ ...formData, cnaePrincipal: e.target.value })}
                      placeholder="Ex: 6201-5/00 - Desenvolvimento de programas de computador sob encomenda"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                    <Input
                      id="inscricaoEstadual"
                      value={formData.inscricaoEstadual}
                      onChange={(e) => setFormData({ ...formData, inscricaoEstadual: e.target.value })}
                      placeholder="Digite a inscrição estadual"
                    />
                  </div>
                </div>
              </div>

              {/* Quadro Societário */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quadro Societário</h3>
                <div className="space-y-4">
                  {shareholders.map((shareholder, index) => (
                    <div key={index} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Label>Nome Completo</Label>
                        <Input
                          value={shareholder.nomeCompleto}
                          onChange={(e) => updateShareholder(index, 'nomeCompleto', e.target.value)}
                          placeholder="Nome do sócio"
                        />
                      </div>
                      <div className="flex-1">
                        <Label>CPF</Label>
                        <Input
                          value={shareholder.cpf}
                          onChange={(e) => updateShareholder(index, 'cpf', e.target.value)}
                          placeholder="000.000.000-00"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeShareholder(index)}
                        disabled={shareholders.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addShareholder}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Sócio
                  </Button>
                </div>
              </div>

              {/* Dados Financeiros */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dados Financeiros</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="faturamento">Faturamento (12 meses) *</Label>
                    <Input
                      id="faturamento"
                      value={formData.faturamento}
                      onChange={(e) => setFormData({ ...formData, faturamento: formatCurrency(e.target.value) })}
                      placeholder="R$ 0,00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="ebitda">EBITDA *</Label>
                    <Input
                      id="ebitda"
                      value={formData.ebitda}
                      onChange={(e) => setFormData({ ...formData, ebitda: formatCurrency(e.target.value) })}
                      placeholder="R$ 0,00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="dividaLiquida">Dívida Líquida *</Label>
                    <Input
                      id="dividaLiquida"
                      value={formData.dividaLiquida}
                      onChange={(e) => setFormData({ ...formData, dividaLiquida: formatCurrency(e.target.value) })}
                      placeholder="R$ 0,00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="numeroFuncionarios">Número de Funcionários *</Label>
                    <Input
                      id="numeroFuncionarios"
                      type="number"
                      value={formData.numeroFuncionarios}
                      onChange={(e) => setFormData({ ...formData, numeroFuncionarios: e.target.value })}
                      placeholder="1"
                      min="1"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="descricaoNegocio">Descrição do Negócio</Label>
                    <Textarea
                      id="descricaoNegocio"
                      value={formData.descricaoNegocio}
                      onChange={(e) => setFormData({ ...formData, descricaoNegocio: e.target.value })}
                      placeholder="Descreva brevemente o tipo de negócio e atividades principais"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Imagens da Empresa */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Imagens da Empresa</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Adicione até 5 imagens que representem sua empresa (produtos, instalações, equipe, etc.)
                </p>
                
                <div className="space-y-4">
                  {/* Upload Button */}
                  <div className="flex items-center gap-4">
                    <label
                      htmlFor="image-upload"
                      className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        formData.images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingImages ? 'Enviando...' : 'Adicionar Imagens'}
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImages || formData.images.length >= 5}
                      className="hidden"
                    />
                    <span className="text-sm text-gray-500">
                      {formData.images.length}/5 imagens
                    </span>
                  </div>

                  {/* Image Preview Grid */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {formData.images.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Imagem da empresa ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Garantias */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Garantias</h3>
                <div className="space-y-4">
                  {guarantees.map((guarantee, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Tipo de Garantia</Label>
                          <Select
                            value={guarantee.tipo}
                            onValueChange={(value) => updateGuarantee(index, 'tipo', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="imovel">Imóvel</SelectItem>
                              <SelectItem value="veiculo">Veículo</SelectItem>
                              <SelectItem value="recebivel">Recebível</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Valor Estimado</Label>
                          <Input
                            value={guarantee.valorEstimado}
                            onChange={(e) => updateGuarantee(index, 'valorEstimado', formatCurrency(e.target.value))}
                            placeholder="R$ 0,00"
                          />
                        </div>

                        {guarantee.tipo === 'imovel' && (
                          <div>
                            <Label>Matrícula</Label>
                            <Input
                              value={guarantee.matricula}
                              onChange={(e) => updateGuarantee(index, 'matricula', e.target.value)}
                              placeholder="Número da matrícula"
                            />
                          </div>
                        )}

                        {guarantee.tipo === 'veiculo' && (
                          <div>
                            <Label>RENAVAM</Label>
                            <Input
                              value={guarantee.renavam}
                              onChange={(e) => updateGuarantee(index, 'renavam', e.target.value)}
                              placeholder="Número do RENAVAM"
                            />
                          </div>
                        )}

                        {guarantee.tipo === 'recebivel' && (
                          <div className="md:col-span-2">
                            <Label>Descrição</Label>
                            <Textarea
                              value={guarantee.descricao}
                              onChange={(e) => updateGuarantee(index, 'descricao', e.target.value)}
                              placeholder="Descreva o recebível"
                            />
                          </div>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeGuarantee(index)}
                        className="mt-4"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remover Garantia
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addGuarantee}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Garantia
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={() => setLocation("/dashboard")}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? "Cadastrando..." : "Cadastrar Empresa"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
