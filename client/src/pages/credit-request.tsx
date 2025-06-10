import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import { formatCurrency } from "@/lib/validations";
import { Upload, FileText, X } from "lucide-react";

export default function CreditRequest() {
  const { companyId } = useParams<{ companyId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    companyId: companyId || "",
    valorSolicitado: "",
    prazoMeses: "",
    finalidade: ""
  });

  const [files, setFiles] = useState<File[]>([]);

  // Fetch all user companies for selection dropdown
  const { data: companies } = useQuery({
    queryKey: ["/api/companies"],
    enabled: !companyId
  });

  // Fetch specific company if companyId is provided
  const { data: company, isLoading } = useQuery({
    queryKey: ["/api/companies", companyId],
    queryFn: () => {
      const token = localStorage.getItem('token');
      return fetch(`/api/companies/${companyId}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(res => res.json());
    },
    enabled: !!companyId
  });

  const creditRequestMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/credit-requests", {
        method: "POST",
        body: data,
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar solicitação');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Solicitação enviada com sucesso!",
        description: "Sua solicitação de crédito está sendo analisada.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/credit-requests"] });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Erro na solicitação",
        description: error.message || "Erro ao enviar solicitação",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCompanyId = companyId || formData.companyId;
    
    if (!selectedCompanyId) {
      toast({
        title: "Empresa não selecionada",
        description: "Por favor, selecione uma empresa para a solicitação",
        variant: "destructive",
      });
      return;
    }
    
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('companyId', selectedCompanyId);
    formDataToSubmit.append('valorSolicitado', formData.valorSolicitado.replace(/[^\d,]/g, '').replace(',', '.'));
    formDataToSubmit.append('prazoMeses', formData.prazoMeses);
    formDataToSubmit.append('finalidade', formData.finalidade);
    
    files.forEach(file => {
      formDataToSubmit.append('documentos', file);
    });

    creditRequestMutation.mutate(formDataToSubmit);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // Only show this validation if we're trying to load a specific company
  if (companyId && (!company || company.status !== 'aprovada')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Empresa não encontrada ou não aprovada
                </h2>
                <p className="text-gray-600 mb-4">
                  Apenas empresas aprovadas podem solicitar crédito.
                </p>
                <Button onClick={() => setLocation("/dashboard")}>
                  Voltar ao Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Solicitar Crédito</h1>
          {companyId && company && (
            <p className="text-gray-600">
              Empresa: <span className="font-medium">{company.razaoSocial}</span> - {company.cnpj}
            </p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nova Solicitação de Crédito</CardTitle>
            <CardDescription>
              Preencha os dados da sua solicitação de empréstimo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Selection - only show when no companyId in URL */}
              {!companyId && (
                <div>
                  <Label htmlFor="companySelect">Selecionar Empresa *</Label>
                  <Select
                    value={formData.companyId}
                    onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies?.filter((company: any) => company.status === 'aprovada').map((company: any) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.razaoSocial} - {company.cnpj}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {companies?.filter((company: any) => company.status === 'aprovada').length === 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      Nenhuma empresa aprovada encontrada. Você precisa ter uma empresa aprovada para solicitar crédito.
                    </p>
                  )}
                </div>
              )}

              {/* Dados da Solicitação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="valorSolicitado">Valor Solicitado *</Label>
                  <Input
                    id="valorSolicitado"
                    value={formData.valorSolicitado}
                    onChange={(e) => setFormData({ ...formData, valorSolicitado: formatCurrency(e.target.value) })}
                    placeholder="R$ 0,00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="prazoMeses">Prazo Desejado (meses) *</Label>
                  <Select
                    value={formData.prazoMeses}
                    onValueChange={(value) => setFormData({ ...formData, prazoMeses: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o prazo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 meses</SelectItem>
                      <SelectItem value="12">12 meses</SelectItem>
                      <SelectItem value="18">18 meses</SelectItem>
                      <SelectItem value="24">24 meses</SelectItem>
                      <SelectItem value="36">36 meses</SelectItem>
                      <SelectItem value="48">48 meses</SelectItem>
                      <SelectItem value="60">60 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="finalidade">Finalidade do Empréstimo *</Label>
                <Textarea
                  id="finalidade"
                  value={formData.finalidade}
                  onChange={(e) => setFormData({ ...formData, finalidade: e.target.value })}
                  placeholder="Descreva como o empréstimo será utilizado (máximo 500 caracteres)"
                  maxLength={500}
                  rows={4}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.finalidade.length}/500 caracteres
                </p>
              </div>

              {/* Upload de Documentos */}
              <div>
                <Label>Documentos</Label>
                <div className="mt-2">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-2">
                      Arraste arquivos aqui ou{" "}
                      <label htmlFor="file-upload" className="text-primary hover:text-primary/80 cursor-pointer font-medium">
                        clique para selecionar
                      </label>
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF, JPG, PNG até 10MB cada. Máximo 10 arquivos.
                    </p>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Lista de Arquivos */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-gray-900">Arquivos selecionados:</h4>
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Informações Importantes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Documentos Recomendados:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Balanço Patrimonial (últimos 2 anos)</li>
                  <li>• Demonstração do Resultado do Exercício (DRE)</li>
                  <li>• Demonstrativo de Fluxo de Caixa</li>
                  <li>• Relatórios financeiros gerenciais</li>
                  <li>• Contratos e garantias (se aplicável)</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation("/dashboard")}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={creditRequestMutation.isPending}
                >
                  {creditRequestMutation.isPending ? "Enviando..." : "Enviar Solicitação"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
