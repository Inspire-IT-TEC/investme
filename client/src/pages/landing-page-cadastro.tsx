import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Check, Lock, Menu, Loader2 } from "lucide-react";
import { formatCpf, validateCpf } from "@/lib/validations";
import { insertEntrepreneurSchema } from "@shared/schema";
import { useState, useEffect } from "react";

// Declare Facebook Pixel for TypeScript
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

// Extended schema for landing page with confirm password, terms, and enhanced validations
const landingPageSchema = insertEntrepreneurSchema
  .extend({
    cpf: z
      .string()
      .min(1, "CPF é obrigatório")
      .transform((val) => val.replace(/\D/g, ""))
      .refine((val) => val.length === 11, {
        message: "CPF deve conter 11 dígitos",
      }),
    email: z
      .string()
      .min(1, "E-mail é obrigatório")
      .email("E-mail inválido")
      .toLowerCase(),
    telefone: z
      .string()
      .optional()
      .transform((val) => val || null)
      .refine((val) => !val || val.replace(/\D/g, "").length >= 10, {
        message: "Telefone deve conter pelo menos 10 dígitos",
      }),
    confirmaSenha: z.string().optional(),
    aceitoTermos: z.boolean().optional(),
  })
  .refine((data) => !data.confirmaSenha || data.senha === data.confirmaSenha, {
    message: "As senhas não coincidem",
    path: ["confirmaSenha"],
  });

type LandingPageFormData = z.infer<typeof landingPageSchema>;

export default function LandingPageCadastro() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isConsultingCpf, setIsConsultingCpf] = useState(false);

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

  // Meta Pixel (Facebook Pixel) initialization
  useEffect(() => {
    // Initialize Facebook Pixel
    (function (f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      "script",
      "https://connect.facebook.net/en_US/fbevents.js",
      undefined,
      undefined,
      undefined,
    );

    // Initialize and track PageView
    if (window.fbq) {
      window.fbq("init", "3312906982180786");
      window.fbq("track", "PageView");
    }

    // Add noscript image for tracking
    const noscript = document.createElement("noscript");
    const img = document.createElement("img");
    img.height = 1;
    img.width = 1;
    img.style.display = "none";
    img.src =
      "https://www.facebook.com/tr?id=3312906982180786&ev=PageView&noscript=1";
    noscript.appendChild(img);
    document.body.appendChild(noscript);

    return () => {
      // Cleanup noscript on unmount
      document.body.removeChild(noscript);
    };
  }, []);

  const consultCpfApi = async (cpf: string) => {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11 || !validateCpf(cpf)) {
      return;
    }

    setIsConsultingCpf(true);
    try {
      const response = await fetch(
        `https://integracaoconsultas.inspireit.com.br/consulta/${cleanCpf}`,
      );
      const data = await response.json();

      if (data.returnCode === 0 && data.data?.encontrado) {
        // API retornou sucesso e dados encontrados
        form.setValue("nomeCompleto", data.data.nomeCompleto || "");
        toast({
          title: "CPF consultado com sucesso!",
          description: "O nome foi preenchido automaticamente.",
        });
      } else {
        // API não retornou sucesso ou dados não encontrados
        toast({
          title: "CPF não encontrado",
          description: "Preencha manualmente os dados pessoais.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao consultar CPF:", error);
      toast({
        title: "Erro na consulta",
        description:
          "Não foi possível consultar o CPF. Preencha manualmente os dados.",
        variant: "destructive",
      });
    } finally {
      setIsConsultingCpf(false);
    }
  };

  const handleCpfBlur = (cpf: string) => {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length === 11 && validateCpf(cpf)) {
      consultCpfApi(cpf);
    }
  };

  const registerMutation = useMutation({
    mutationFn: async (data: LandingPageFormData) => {
      // Remove confirm password and terms before sending to API
      const { confirmaSenha, aceitoTermos, ...entrepreneurData } = data;

      const response = await apiRequest(
        "POST",
        "/api/entrepreneurs/register",
        entrepreneurData,
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar conta");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Conta criada com sucesso!",
        description: "Você receberá um e-mail de boas-vindas. Redirecionando para o login...",
      });
      setTimeout(() => {
        setLocation("/login/entrepreneur");
      }, 2000);
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
    <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-blue-50 md:via-blue-100 md:to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1e3a8a] text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">
              <span className="text-white">Invest</span>
              <span className="text-blue-300">Me</span>
            </h1>
          </div>

          {/* Desktop menu */}
          <Button
            variant="ghost"
            className="hidden md:flex text-white hover:bg-blue-800"
            onClick={() => setLocation("/login")}
            data-testid="button-login"
          >
            Já tenho conta
          </Button>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            data-testid="button-mobile-menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="px-6 py-8 space-y-6">
          {/* Handshake Icon */}
          <div className="flex justify-center">
            <div className="text-6xl">🤝</div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-[#4338ca] text-center leading-tight">
            InvestMe, a rede social onde empresários e oportunidades de crédito
            se encontram
          </h2>

          {/* Subtitle */}
          <p className="text-center text-gray-700">
            Precisando de capital para crescer e o banco disse
            <span className="font-semibold">não</span>? Se conecte com quem quer
            investir avaliando o potencial do seu negócio, e não só seu score ou
            rating bancário.
          </p>

          {/* Subtitle */}
          <p className="text-center text-gray-700">
            Participe de um ecossistema onde negócios se conectam, se apoiam e
            se financiam, de forma simples, direta e transparente
          </p>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Button
              className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white font-medium px-6 py-3 rounded-lg text-sm"
              onClick={() =>
                document
                  .getElementById("mobile-form")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              data-testid="button-cta-mobile"
            >
              Cadastre-se grátis e solicite crédito
            </Button>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 flex-shrink-0">
                <Check className="h-5 w-5 text-green-600" strokeWidth={3} />
              </div>
              <p className="text-gray-800 text-sm">
                Sem depender de score ou rating bancário.
              </p>
            </div>

            <div className="flex items-start space-x-3">
              <div className="mt-0.5 flex-shrink-0">
                <Check className="h-5 w-5 text-green-600" strokeWidth={3} />
              </div>
              <p className="text-gray-800 text-sm">
                Negocie direto com quem vai investir
              </p>
            </div>

            <div className="flex items-start space-x-3">
              <div className="mt-0.5 flex-shrink-0">
                <Check className="h-5 w-5 text-green-600" strokeWidth={3} />
              </div>
              <p className="text-gray-800 text-sm">
                Interaja com outros negócios
              </p>
            </div>
          </div>

          {/* Security Message */}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <span>🔒</span>
            <span>Fique tranquilo, seus dados estarão seguros</span>
          </div>

          {/* Mobile Form */}
          <div
            id="mobile-form"
            className="bg-[#dbeafe] rounded-2xl p-6 space-y-4"
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-800 flex items-center gap-2">
                        CPF *
                        {isConsultingCpf && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) =>
                            field.onChange(formatCpf(e.target.value))
                          }
                          onBlur={(e) => handleCpfBlur(e.target.value)}
                          placeholder=""
                          className="h-11 bg-white border-gray-300"
                          data-testid="input-cpf-mobile"
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
                      <FormLabel className="text-sm font-medium text-gray-800">
                        Nome Completo *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder=""
                          className="h-11 bg-white border-gray-300"
                          data-testid="input-nome-mobile"
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
                      <FormLabel className="text-sm font-medium text-gray-800">
                        Telefone *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder=""
                          className="h-11 bg-white border-gray-300"
                          data-testid="input-telefone-mobile"
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
                      <FormLabel className="text-sm font-medium text-gray-800">
                        E-mail *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder=""
                          className="h-11 bg-white border-gray-300"
                          data-testid="input-email-mobile"
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
                      <FormLabel className="text-sm font-medium text-gray-800">
                        Nova Senha *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder=""
                          className="h-11 bg-white border-gray-300"
                          data-testid="input-senha-mobile"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-base rounded-lg"
                    disabled={registerMutation.isPending}
                    data-testid="button-cadastrar-mobile"
                  >
                    {registerMutation.isPending
                      ? "CADASTRANDO..."
                      : "CADASTRAR"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Left Side - Promotional Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Hero Section */}
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold text-blue-900 leading-tight">
                InvestMe, a rede social onde empresários e oportunidades de
                crédito se encontram
              </h2>

              <p className="text-xl text-gray-700 max-w-2xl leading-relaxed">
                Precisando de capital para crescer e o banco disse{" "}
                <span className="font-bold text-blue-900">não</span>? Se conecte
                com quem quer investir avaliando o potencial do seu negócio, e
                não só seu score ou rating bancário.
              </p>

              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-6 text-lg rounded-lg shadow-lg"
                onClick={() =>
                  document
                    .getElementById("cadastro-form")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                data-testid="button-scroll-to-form"
              >
                Cadastre-se grátis e solicite crédito
              </Button>
            </div>

            {/* Value Proposition */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 space-y-4 shadow-md">
              <p className="text-gray-700 leading-relaxed">
                Participe de um ecossistema onde negócios se conectam, se apoiam
                e se financiam, de forma simples, direta e transparente.
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
                  <p className="text-gray-700">Interaja com outros negócios.</p>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <p className="text-lg font-semibold text-blue-900">
              Empresários de Salvador e Lauro de Freitas já estão encontrando
              parceiros aqui.
            </p>
          </div>

          {/* Right Side - Registration Form */}
          <div className="lg:col-span-2">
            <div
              id="cadastro-form"
              className="bg-blue-50 rounded-2xl shadow-2xl p-8 border border-blue-200"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Comece a Investir Hoje
                </h3>
                <p className="text-sm text-gray-600">
                  Junte-se à rede de empresários que se apoiam mutuamente
                </p>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          CPF *
                          {isConsultingCpf && (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) =>
                              field.onChange(formatCpf(e.target.value))
                            }
                            onBlur={(e) => handleCpfBlur(e.target.value)}
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
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Nome Completo *
                        </FormLabel>
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
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Telefone
                        </FormLabel>
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
                        <FormLabel className="text-sm font-medium text-gray-700">
                          E-mail *
                        </FormLabel>
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
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Nova Senha *
                        </FormLabel>
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
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Confirmar Senha *
                        </FormLabel>
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
                            <a
                              href="#"
                              className="text-blue-600 hover:underline"
                            >
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
                    {registerMutation.isPending
                      ? "CADASTRANDO..."
                      : "CADASTRAR"}
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

      {/* Footer - Hidden on mobile */}
      <footer className="hidden md:block bg-gray-900 text-white py-8 px-6 mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-sm text-gray-400 space-x-4">
            <span>© 2025 InvestMe. Todos os direitos reservados.</span>
            <a href="#" className="hover:text-white">
              Política de Privacidade
            </a>
            <a href="#" className="hover:text-white">
              Termos de Uso
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
