import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, ArrowRight, Download, Smartphone, Users, DollarSign, BarChart3, Shield, Star } from "lucide-react";
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

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

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
      alert('Para instalar o app:\n\n1. No Chrome mobile: Menu > "Adicionar à tela inicial"\n2. No Safari: Compartilhar > "Adicionar à Tela de Início"\n3. No Edge: Menu > "Aplicativos" > "Instalar este site como aplicativo"');
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-200 to-blue-300 overflow-hidden">
      {/* Install Button */}
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

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <InvestmeLogo className="h-10" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            Bem-vindo à Investme
          </h1>
          <p className="text-sm md:text-base text-slate-600">
            Escolha como você quer participar da nossa plataforma
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-5xl">
            {/* Cards */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Empreendedor Card */}
              <Card className="group relative overflow-hidden bg-gradient-to-br from-green-600 to-emerald-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl mb-4">
                      <Building2 className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Sou Empreendedor</h3>
                    <p className="text-green-100">
                      Solicite crédito inteligente para sua empresa
                    </p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {[
                      { icon: Building2, text: "Cadastrar empresas" },
                      { icon: DollarSign, text: "Solicitar crédito" },
                      { icon: BarChart3, text: "Acompanhar análises" },
                      { icon: Users, text: "Conectar com investidores" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center text-green-100">
                        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link href="/register/entrepreneur" className="block">
                    <Button className="w-full bg-white text-green-600 hover:bg-green-50 py-3 text-lg font-semibold rounded-xl transition-all">
                      Cadastrar como Empreendedor
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Investidor Card */}
              <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl mb-4">
                      <TrendingUp className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Sou Investidor</h3>
                    <p className="text-blue-100">
                      Analise e invista em empresas promissoras
                    </p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {[
                      { icon: BarChart3, text: "Ver análises de crédito" },
                      { icon: Shield, text: "Investimentos seguros" },
                      { icon: Star, text: "Avaliar empresas" },
                      { icon: Users, text: "Rede de oportunidades" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center text-blue-100">
                        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link href="/register/investor" className="block">
                    <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 py-3 text-lg font-semibold rounded-xl transition-all">
                      Cadastrar como Investidor
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Login Section */}
            <div className="text-center">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Já faz parte da nossa rede?
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Link href="/login/entrepreneur" className="flex-1">
                  <Button 
                    variant="outline" 
                    className="w-full py-2 font-semibold border-2 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 transition-all"
                  >
                    Login Empreendedor
                  </Button>
                </Link>
                <Link href="/login/investor" className="flex-1">
                  <Button 
                    variant="outline" 
                    className="w-full py-2 font-semibold border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all"
                  >
                    Login Investidor
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}