import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Save, AlertCircle, Upload, Trash2, Loader2 } from "lucide-react";
import { ModernSidebarLayout } from "@/components/layout/modern-sidebar-layout";
import { useLocation } from "wouter";

const companySchema = z.object({
  razaoSocial: z.string().min(1, "Razão social é obrigatória"),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().min(14, "CNPJ deve ter 14 dígitos"),
  cep: z.string().min(8, "CEP deve ter 8 dígitos"),
  rua: z.string().min(1, "Rua é obrigatória"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().min(2, "Estado é obrigatório"),
  telefone: z.string().optional(),
  emailContato: z.string().email("Email inválido").optional(),
  cnaePrincipal: z.string().min(1, "CNAE principal é obrigatório"),
  inscricaoEstadual: z.string().optional(),
  inscricaoMunicipal: z.string().optional(),
  dataFundacao: z.string().min(1, "Data de fundação é obrigatória"),
  faturamento: z.string().min(1, "Faturamento é obrigatório"),
  ebitda: z.string().min(1, "EBITDA é obrigatório"),
  dividaLiquida: z.string().min(1, "Dívida líquida é obrigatória"),
  numeroFuncionarios: z.string().min(1, "Número de funcionários é obrigatório"),
});

type CompanyFormData = z.infer<typeof companySchema>;

export default function InvestorCompanyRegistration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isConsultingCnpj, setIsConsultingCnpj] = useState(false);
  const [cnpjConsulted, setCnpjConsulted] = useState(false);

  const formatCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return numbers.replace(/(\d{2})(\d{0,3})/, '$1.$2');
    if (numbers.length <= 8) return numbers.replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
    if (numbers.length <= 12) return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
  };

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
        form.setValue('razaoSocial', data.data.razaoSocial || '');
        form.setValue('nomeFantasia', data.data.nomeFantasia || '');
        if (data.data.dataFundacao) {
          const foundingDate = new Date(data.data.dataFundacao);
          form.setValue('dataFundacao', foundingDate.toISOString().split('T')[0]);
        }
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

  const handleCnpjBlur = (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length === 14) {
      consultCnpjApi(cnpj);
    }
  };

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      razaoSocial: "",
      nomeFantasia: "",
      cnpj: "",
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
      inscricaoEstadual: "",
      inscricaoMunicipal: "",
      dataFundacao: "",
      faturamento: "",
      ebitda: "",
      dividaLiquida: "",
      numeroFuncionarios: "",
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      const response = await fetch('/api/investor/company', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          images,
          tipoProprietario: 'investidor',
          dataFundacao: new Date(data.dataFundacao).toISOString(),
          faturamento: parseFloat(data.faturamento.replace(/[^\d.,]/g, '').replace(',', '.')) || 0,
          ebitda: parseFloat(data.ebitda.replace(/[^\d.,]/g, '').replace(',', '.')) || 0,
          dividaLiquida: parseFloat(data.dividaLiquida.replace(/[^\d.,]/g, '').replace(',', '.')) || 0,
          numeroFuncionarios: parseInt(data.numeroFuncionarios) || 1,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao cadastrar empresa');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Empresa cadastrada!",
        description: "Sua empresa foi cadastrada e aguarda aprovação do backoffice.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/investor/company-status"] });
      setLocation("/investor-dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cadastrar empresa",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const currentImageCount = images.length;
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
      setImages(prev => [...prev, ...uploadedUrls]);

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
      event.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: CompanyFormData) => {
    createCompanyMutation.mutate(data);
  };

  return (
    <ModernSidebarLayout title="Cadastro de Empresa" userType="investor" theme="blue">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Building2 className="h-8 w-8 mr-3" />
            Cadastro de Empresa
          </h1>
          <p className="text-muted-foreground mt-2">
            Cadastre sua empresa para acessar a rede de investimentos
          </p>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Após o cadastro, sua empresa ficará pendente para aprovação pelo backoffice. 
            Apenas após a aprovação você poderá acessar a aba "Rede".
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
            <CardDescription>
              Preencha todos os dados da sua empresa
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Dados básicos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dados Básicos</h3>
                  
                  {/* CNPJ - Primeiro campo */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                {...field} 
                                placeholder="00.000.000/0001-00"
                                value={formatCnpj(field.value)}
                                onChange={(e) => {
                                  const formatted = formatCnpj(e.target.value);
                                  field.onChange(formatted);
                                  // Reset consultation state when user changes CNPJ
                                  if (cnpjConsulted) {
                                    setCnpjConsulted(false);
                                  }
                                }}
                                onBlur={() => handleCnpjBlur(field.value)}
                                className={isConsultingCnpj ? "pr-10" : ""}
                                disabled={isConsultingCnpj}
                              />
                              {isConsultingCnpj && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                          {isConsultingCnpj && (
                            <p className="text-sm text-blue-600 mt-1">Consultando CNPJ...</p>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="razaoSocial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Razão Social *</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={cnpjConsulted} />
                          </FormControl>
                          <FormMessage />
                          {cnpjConsulted && (
                            <p className="text-sm text-green-600 mt-1">Preenchido automaticamente</p>
                          )}
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nomeFantasia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Fantasia</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={cnpjConsulted} />
                          </FormControl>
                          <FormMessage />
                          {cnpjConsulted && (
                            <p className="text-sm text-green-600 mt-1">Preenchido automaticamente</p>
                          )}
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dataFundacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Fundação *</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" disabled={cnpjConsulted} />
                          </FormControl>
                          <FormMessage />
                          {cnpjConsulted && (
                            <p className="text-sm text-green-600 mt-1">Preenchido automaticamente</p>
                          )}
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cnaePrincipal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNAE Principal *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="0000-0/00" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="00000-000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="rua"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Rua *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="numero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="complemento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bairro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="SP" maxLength={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Contato */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contato</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="(11) 99999-9999" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="emailContato"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email de Contato</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Informações Financeiras */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informações Financeiras</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dataFundacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Fundação *</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="faturamento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Faturamento Anual (R$) *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="1.000.000,00" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="ebitda"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>EBITDA (R$) *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="200.000,00" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dividaLiquida"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dívida Líquida (R$) *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="50.000,00" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="numeroFuncionarios"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Funcionários *</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Inscrições */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Inscrições</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="inscricaoEstadual"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inscrição Estadual</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="inscricaoMunicipal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inscrição Municipal</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 pt-6">
                  <Button 
                    type="submit" 
                    disabled={createCompanyMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {createCompanyMutation.isPending ? "Cadastrando..." : "Cadastrar Empresa"}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setLocation("/investor-dashboard")}
                    disabled={createCompanyMutation.isPending}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </ModernSidebarLayout>
  );
}