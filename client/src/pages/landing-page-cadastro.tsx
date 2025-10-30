import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Check, Lock, X } from "lucide-react";
import { formatCpf } from "@/lib/validations";
import { insertEntrepreneurSchema } from "@shared/schema";

// Extended schema for landing page with confirm password, terms, and enhanced validations
const landingPageSchema = insertEntrepreneurSchema.extend({
  cpf: z.string()
    .min(1, "CPF é obrigatório")
    .transform(val => val.replace(/\D/g, ''))
    .refine(val => val.length === 11, {
      message: "CPF deve conter 11 dígitos"
    }),
  email: z.string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido")
    .toLowerCase(),
  telefone: z.string()
    .optional()
    .transform(val => val || null)
    .refine(val => !val || val.replace(/\D/g, '').length >= 10, {
      message: "Telefone deve conter pelo menos 10 dígitos"
    }),
  confirmaSenha: z.string().min(6, "A confirmação de senha deve ter pelo menos 6 caracteres"),
  aceitoTermos: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar os termos e condições"
  })
}).refine((data) => data.senha === data.confirmaSenha, {
  message: "As senhas não coincidem",
  path: ["confirmaSenha"],
});

type LandingPageFormData = z.infer<typeof landingPageSchema>;

export default function LandingPageCadastro() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LandingPageFormData>({
    resolver: zodResolver(landingPageSchema),
    defaultValues: {
      cpf: "",
      nomeCompleto: "",
      telefone: "",
      email: "",
      senha: "",
      confirmaSenha: "",
      aceitoTermos: false,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: LandingPageFormData) => {
      // Remove confirm password and terms before sending to API
      const { confirmaSenha, aceitoTermos, ...entrepreneurData } = data;
      
      const response = await apiRequest("POST", "/api/entrepreneurs/register", entrepreneurData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar conta");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Conta criada com sucesso!",
        description: "Você será redirecionado para fazer login.",
      });
      setLocation("/login");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LandingPageFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-blue-900 text-white py-4 px-6 shadow-md backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">
              <span className="text-white">Invest</span>
              <span className="text-blue-300">Me</span>
            </h1>
          </div>
          <Button 
            variant="ghost"
            className="text-white hover:bg-blue-800"
            onClick={() => setLocation("/login")}
            data-testid="button-login"
          >
            Já tenho conta
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Left Side - Promotional Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Hero Section */}
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold text-blue-900 leading-tight">
                A rede onde empresários <br />
                financiam empresários 🤝
              </h2>
              
              <p className="text-xl text-gray-700 max-w-2xl leading-relaxed">
                Seu banco disse <span className="font-bold text-blue-900">não</span>? 
                Outros empresários que entendem seu cenário dizem{" "}
                <span className="font-bold text-green-600">sim</span>.
              </p>

              <Button 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-6 text-lg rounded-lg shadow-lg"
                onClick={() => document.getElementById('cadastro-form')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-scroll-to-form"
              >
                Cadastre-se grátis e receba propostas
              </Button>
            </div>

            {/* Value Proposition */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 space-y-4 shadow-md">
              <p className="text-gray-700 leading-relaxed">
                Na InvestMe, seu histórico com banco não define se você consegue 
                crédito ou não. Aqui, outros empresários avaliam o potencial do seu 
                negócio, e não suas pendências financeiras.
              </p>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <p className="text-gray-700">
                    Sem depender de score ou rating bancário.
                  </p>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <p className="text-gray-700">
                    Negocie direto com quem vai investir.
                  </p>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <p className="text-gray-700">
                    Interaja com outros negócios.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-md text-center">
                <div className="text-4xl font-bold text-blue-900 mb-2">500+</div>
                <div className="text-sm text-gray-600">Empresas Conectadas</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">R$ 50M+</div>
                <div className="text-sm text-gray-600">Em Negociações</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md text-center">
                <div className="text-4xl font-bold text-blue-900 mb-2">95%</div>
                <div className="text-sm text-gray-600">Taxa de Satisfação</div>
              </div>
            </div>

            {/* Social Proof */}
            <p className="text-lg font-semibold text-blue-900">
              Empresários de Salvador e Lauro de Freitas já estão encontrando parceiros aqui.
            </p>
          </div>

          {/* Right Side - Registration Form */}
          <div className="lg:col-span-2">
            <div id="cadastro-form" className="bg-blue-50 rounded-2xl shadow-2xl p-8 border border-blue-200">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Comece a Investir Hoje
                </h3>
                <p className="text-sm text-gray-600">
                  Junte-se à rede de empresários que se apoiam mutuamente
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">CPF *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => field.onChange(formatCpf(e.target.value))}
                            placeholder="000.000.000-00"
                            className="h-12 bg-white border-gray-300"
                            data-testid="input-cpf"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nomeCompleto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Nome Completo *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Digite seu nome completo"
                            className="h-12 bg-white border-gray-300"
                            data-testid="input-nome"
                          />
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
                        <FormLabel className="text-sm font-medium text-gray-700">Telefone</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="(00) 00000-0000"
                            className="h-12 bg-white border-gray-300"
                            data-testid="input-telefone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">E-mail *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="seu@email.com"
                            className="h-12 bg-white border-gray-300"
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="senha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Nova Senha *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            className="h-12 bg-white border-gray-300"
                            data-testid="input-senha"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmaSenha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Confirmar Senha *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Digite a senha novamente"
                            className="h-12 bg-white border-gray-300"
                            data-testid="input-confirma-senha"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aceitoTermos"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-termos"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-xs text-gray-700">
                            Aceito os{" "}
                            <a href="#" className="text-blue-600 hover:underline">
                              termos e condições
                            </a>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-base rounded-lg shadow-lg"
                    disabled={registerMutation.isPending}
                    data-testid="button-cadastrar"
                  >
                    {registerMutation.isPending ? "CADASTRANDO..." : "CADASTRAR"}
                  </Button>

                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-600 pt-2">
                    <Lock className="h-4 w-4 text-blue-600" />
                    <span>Fique tranquilo, seus dados estarão seguros</span>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-6 mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-sm text-gray-400 space-x-4">
            <span>© 2025 InvestMe. Todos os direitos reservados.</span>
            <a href="#" className="hover:text-white">Política de Privacidade</a>
            <a href="#" className="hover:text-white">Termos de Uso</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
