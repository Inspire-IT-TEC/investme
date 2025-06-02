import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, TrendingUp, ArrowRight } from "lucide-react";
import { InvestmeLogo } from "@/components/ui/logo";

export default function UserTypeSelection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <InvestmeLogo className="h-12" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Bem-vindo à Investme
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Escolha como você quer participar da nossa plataforma de crédito inteligente
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Empreendedor */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-indigo-600 to-purple-700">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-4 group-hover:bg-white/30 transition-colors">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Sou Empreendedor</h2>
                <p className="text-indigo-100">Quero solicitar crédito para minha empresa</p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">O que você pode fazer:</h3>
                <ul className="space-y-2 text-indigo-100">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mr-3"></div>
                    Cadastrar suas empresas
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mr-3"></div>
                    Solicitar crédito
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mr-3"></div>
                    Acompanhar análises
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mr-3"></div>
                    Conversar com investidores
                  </li>
                </ul>
              </div>
              
              <Link href="/register/entrepreneur">
                <Button className="w-full bg-white text-indigo-600 hover:bg-gray-50 py-3 rounded-lg font-medium transition-colors">
                  Cadastrar como Empreendedor
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Investidor */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-green-600 to-emerald-700">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-4 group-hover:bg-white/30 transition-colors">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Sou Investidor</h2>
                <p className="text-green-100">Quero analisar e aprovar solicitações de crédito</p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">O que você pode fazer:</h3>
                <ul className="space-y-2 text-green-100">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mr-3"></div>
                    Ver solicitações na rede
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mr-3"></div>
                    Aceitar projetos
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mr-3"></div>
                    Analisar empresas
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mr-3"></div>
                    Conversar com empreendedores
                  </li>
                </ul>
              </div>
              
              <Link href="/register/investor">
                <Button className="w-full bg-white text-green-600 hover:bg-gray-50 py-3 rounded-lg font-medium transition-colors">
                  Cadastrar como Investidor
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">Já tem uma conta?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login/entrepreneur">
              <Button variant="outline" className="px-8 py-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                Login Empreendedor
              </Button>
            </Link>
            <Link href="/login/investor">
              <Button variant="outline" className="px-8 py-2 border-green-200 text-green-600 hover:bg-green-50">
                Login Investidor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}