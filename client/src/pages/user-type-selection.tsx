import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, ArrowRight, Download, Smartphone, Shield, Zap, Users, BarChart3, CheckCircle, Star, DollarSign } from "lucide-react";
import { InvestmeLogo } from "@/components/ui/logo";

export default function UserTypeSelection() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    // For testing purposes, show button always (remove in production)
    setShowInstallButton(true);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallButton(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback for browsers that don't support PWA installation
      alert('Para instalar o app:\n\n1. No Chrome mobile: Menu > "Adicionar à tela inicial"\n2. No Safari: Compartilhar > "Adicionar à Tela de Início"\n3. No Edge: Menu > "Aplicativos" > "Instalar este site como aplicativo"');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Install Button - Fixed position */}
      {showInstallButton && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={handleInstallApp}
            className="bg-slate-800 hover:bg-slate-900 text-white shadow-lg backdrop-blur-sm"
            title="Adicionar à tela inicial"
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Instalar App</span>
            <Smartphone className="h-4 w-4 sm:hidden" />
          </Button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-blue-600/5"></div>
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <InvestmeLogo className="h-14 md:h-16" />
            </div>
            <Badge variant="secondary" className="mb-6 bg-slate-100 text-slate-700 hover:bg-slate-200">
              <Zap className="h-3 w-3 mr-1" />
              Plataforma de Crédito Inteligente
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Conectamos
              <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Empreendedores & Investidores
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              A primeira plataforma brasileira que usa inteligência artificial para transformar 
              análise de crédito e facilitar investimentos seguros e lucrativos
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-16">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">R$ 50M+</div>
                <div className="text-sm md:text-base text-slate-600">Em crédito facilitado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">500+</div>
                <div className="text-sm md:text-base text-slate-600">Empresas conectadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">98%</div>
                <div className="text-sm md:text-base text-slate-600">Taxa de aprovação</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">24h</div>
                <div className="text-sm md:text-base text-slate-600">Análise média</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Type Selection Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Escolha seu perfil
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Selecione como você deseja participar da nossa rede de crédito inteligente
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Empreendedor Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-green-600 to-emerald-700 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative p-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl mb-6 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                    <Building2 className="w-12 h-12 text-white" />
                  </div>
                  <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30">
                    Para Empresas
                  </Badge>
                  <h3 className="text-3xl font-bold text-white mb-3">Sou Empreendedor</h3>
                  <p className="text-green-100 text-lg leading-relaxed">
                    Solicite crédito inteligente para fazer sua empresa crescer
                  </p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {[
                    { icon: Building2, text: "Cadastrar múltiplas empresas" },
                    { icon: DollarSign, text: "Solicitar crédito até R$ 2M" },
                    { icon: BarChart3, text: "Acompanhar análises em tempo real" },
                    { icon: Users, text: "Conectar com investidores qualificados" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center text-green-100 group-hover:text-white transition-colors">
                      <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
                
                <Link href="/register/entrepreneur" className="block">
                  <Button className="w-full bg-white text-green-600 hover:bg-green-50 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-lg">
                    Começar como Empreendedor
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Investidor Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative p-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl mb-6 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                    <TrendingUp className="w-12 h-12 text-white" />
                  </div>
                  <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30">
                    Para Investidores
                  </Badge>
                  <h3 className="text-3xl font-bold text-white mb-3">Sou Investidor</h3>
                  <p className="text-blue-100 text-lg leading-relaxed">
                    Analise oportunidades e invista em empresas promissoras
                  </p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {[
                    { icon: BarChart3, text: "Ver análises detalhadas de crédito" },
                    { icon: Shield, text: "Investimentos seguros e rentáveis" },
                    { icon: Star, text: "Avaliar empresas com IA" },
                    { icon: Users, text: "Rede exclusiva de oportunidades" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center text-blue-100 group-hover:text-white transition-colors">
                      <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
                
                <Link href="/register/investor" className="block">
                  <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-lg">
                    Começar como Investidor
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Por que escolher a Investme?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Nossa plataforma combina tecnologia avançada com expertise financeira
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Análise Instantânea</h3>
                <p className="text-slate-600 leading-relaxed">
                  Inteligência artificial analisa sua empresa em segundos, 
                  não em semanas como bancos tradicionais
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">100% Seguro</h3>
                <p className="text-slate-600 leading-relaxed">
                  Plataforma criptografada com as melhores práticas de segurança 
                  bancária para proteger seus dados
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Rede Qualificada</h3>
                <p className="text-slate-600 leading-relaxed">
                  Conectamos apenas investidores verificados com empresas 
                  pré-qualificadas para garantir sucesso mútuo
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">
            Já faz parte da nossa rede?
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-md mx-auto">
            <Link href="/login/entrepreneur" className="flex-1">
              <Button 
                variant="outline" 
                className="w-full py-4 text-lg font-semibold border-2 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 transition-all duration-300"
              >
                Login Empreendedor
              </Button>
            </Link>
            <Link href="/login/investor" className="flex-1">
              <Button 
                variant="outline" 
                className="w-full py-4 text-lg font-semibold border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
              >
                Login Investidor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}