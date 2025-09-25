import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { editCompanySchema } from "@shared/schema";
import { z } from "zod";
import { ArrowLeft, Save, Upload, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/validations";
import { queryClient } from "@/lib/queryClient";

type EditCompanyForm = z.infer<typeof editCompanySchema>;

export default function InvestorCompanyEdit() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Fetch investor company data
  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['/api/investor/company'],
    queryFn: async () => {
      const response = await fetch('/api/investor/company', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Erro ao carregar dados da empresa');
      }
      return response.json();
    },
  });

  const form = useForm<EditCompanyForm>({
    resolver: zodResolver(editCompanySchema),
    defaultValues: {
      razaoSocial: "",
      nomeFantasia: "",
      cnpj: "",
      telefone: "",
      emailContato: "",
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cnaePrincipal: "",
      cnaeSecundarios: [],
      dataFundacao: new Date(),
      faturamento: "",
      numeroFuncionarios: 1,
      descricaoNegocio: "",
      tipoProprietario: "",
    },
  });

  // Update form when company data loads
  useEffect(() => {
    if (company) {
      const companyData = company;
      form.reset({
        razaoSocial: companyData.razaoSocial || "",
        nomeFantasia: companyData.nomeFantasia || "",
        cnpj: companyData.cnpj || "",
        telefone: companyData.telefone || "",
        emailContato: companyData.emailContato || "",
        cep: companyData.cep || "",
        rua: companyData.rua || "",
        numero: companyData.numero || "",
        complemento: companyData.complemento || "",
        bairro: companyData.bairro || "",
        cidade: companyData.cidade || "",
        estado: companyData.estado || "",
        cnaePrincipal: companyData.cnaePrincipal || "",
        cnaeSecundarios: companyData.cnaeSecundarios || [],
        dataFundacao: companyData.dataFundacao ? new Date(companyData.dataFundacao) : new Date(),
        faturamento: companyData.faturamento || "",
        numeroFuncionarios: companyData.numeroFuncionarios || 1,
        descricaoNegocio: companyData.descricaoNegocio || "",
        tipoProprietario: companyData.tipoProprietario || "",
      });
      
      // Set existing images
      setImages(companyData.images || []);
    }
  }, [company, form]);

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (data: EditCompanyForm) => {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          images
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar empresa');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Empresa atualizada",
        description: "Os dados da empresa foram atualizados com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/investor/company'] });
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      navigate('/investor/dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar empresa",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const currentImageCount = images.length;
    const maxImages = 10;
    const availableSlots = maxImages - currentImageCount;
    const filesToUpload = Array.from(files).slice(0, availableSlots);

    if (filesToUpload.length === 0) {
      toast({
        title: "Limite de imagens",
        description: "Você pode adicionar no máximo 10 imagens por empresa.",
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

  const onSubmit = (data: EditCompanyForm) => {
    updateCompanyMutation.mutate(data);
  };

  if (isLoadingCompany) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Empresa não encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/investor/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Editar Empresa</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="razaoSocial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Razão Social *</FormLabel>
                        <FormControl>
                          <Input placeholder="Razão social da empresa" {...field} />
                        </FormControl>
                        <FormMessage />
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
                          <Input placeholder="Nome fantasia" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ *</FormLabel>
                        <FormControl>
                          <Input placeholder="00.000.000/0000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="descricaoNegocio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição do Negócio *</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={4}
                          placeholder="Descreva a atividade principal da empresa"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Financial Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="faturamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Faturamento Anual *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="R$ 0,00" 
                            value={field.value ? formatCurrency(field.value) : ''}
                            onChange={(e) => {
                              const formatted = formatCurrency(e.target.value);
                              field.onChange(formatted);
                            }}
                          />
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
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="valuation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valuation da Empresa (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="R$ 5.000.000,00"
                            value={field.value ? formatCurrency(field.value) : ''}
                            onChange={(e) => {
                              const formatted = formatCurrency(e.target.value);
                              field.onChange(formatted);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-sm text-gray-500">Campo opcional - valor estimado da empresa</p>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address Information */}
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
                            <Input placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="rua"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rua *</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome da rua" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="numero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número *</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
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
                            <Input placeholder="Apto 101" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bairro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do bairro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Imagens da Empresa */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Imagens da Empresa</h3>
                  <p className="text-sm text-muted-foreground">
                    Adicione até 10 imagens que representem sua empresa (produtos, instalações, equipe, etc.)
                  </p>
                  
                  <div className="space-y-4">
                    {/* Upload Button */}
                    <div className="flex items-center gap-4">
                      <label
                        htmlFor="image-upload"
                        className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          images.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''
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
                        disabled={uploadingImages || images.length >= 10}
                        className="hidden"
                      />
                      <span className="text-sm text-muted-foreground">
                        {images.length}/10 imagens
                      </span>
                    </div>

                    {/* Image Preview Grid */}
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {images.map((imageUrl, index) => (
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

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <Button 
                    type="submit" 
                    disabled={updateCompanyMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {updateCompanyMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}