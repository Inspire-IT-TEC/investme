import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/validations";
import { Upload, FileText, X } from "lucide-react";

interface CreditRequestFormProps {
  companyId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreditRequestForm({ companyId, onSuccess, onCancel }: CreditRequestFormProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    valorSolicitado: "",
    prazoMeses: "",
    finalidade: ""
  });

  const [files, setFiles] = useState<File[]>([]);

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
      if (onSuccess) onSuccess();
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
      
      // Validate file types
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      const invalidFiles = newFiles.filter(file => !allowedTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        toast({
          title: "Tipos de arquivo não permitidos",
          description: "Use apenas arquivos PDF, JPG ou PNG.",
          variant: "destructive",
        });
        return;
      }

      // Validate file sizes (10MB each)
      const oversizedFiles = newFiles.filter(file => file.size > 10 * 1024 * 1024);
      
      if (oversizedFiles.length > 0) {
        toast({
          title: "Arquivos muito grandes",
          description: "Cada arquivo deve ter no máximo 10MB.",
          variant: "destructive",
        });
        return;
      }

      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.valorSolicitado || !formData.prazoMeses || !formData.finalidade) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const formDataToSubmit = new FormData();
    formDataToSubmit.append('companyId', companyId.toString());
    formDataToSubmit.append('valorSolicitado', formData.valorSolicitado.replace(/[^\d,]/g, '').replace(',', '.'));
    formDataToSubmit.append('prazoMeses', formData.prazoMeses);
    formDataToSubmit.append('finalidade', formData.finalidade);
    
    files.forEach(file => {
      formDataToSubmit.append('documentos', file);
    });

    creditRequestMutation.mutate(formDataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={creditRequestMutation.isPending}
        >
          {creditRequestMutation.isPending ? "Enviando..." : "Enviar Solicitação"}
        </Button>
      </div>
    </form>
  );
}
