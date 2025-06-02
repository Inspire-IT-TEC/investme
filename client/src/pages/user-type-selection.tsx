import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, TrendingUp, Users } from "lucide-react";

export default function UserTypeSelection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bem-vindo à Investme
          </h1>
          <p className="text-xl text-gray-600">
            Escolha como você quer participar da nossa plataforma
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Empreendedor */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-blue-700">
                Sou Empreendedor
              </CardTitle>
              <CardDescription className="text-base">
                Quero solicitar crédito para minha empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">O que você pode fazer:</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Cadastrar suas empresas</li>
                  <li>• Solicitar crédito</li>
                  <li>• Acompanhar análises</li>
                  <li>• Conversar com investidores</li>
                </ul>
              </div>
              <Link href="/register/entrepreneur">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Cadastrar como Empreendedor
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Investidor */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-700">
                Sou Investidor
              </CardTitle>
              <CardDescription className="text-base">
                Quero analisar e aprovar solicitações de crédito
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">O que você pode fazer:</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Ver solicitações na rede</li>
                  <li>• Aceitar projetos</li>
                  <li>• Analisar empresas</li>
                  <li>• Conversar com empreendedores</li>
                </ul>
              </div>
              <Link href="/register/investor">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Cadastrar como Investidor
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">Já tem uma conta?</p>
          <div className="space-x-4">
            <Link href="/login/entrepreneur">
              <Button variant="outline">
                Login Empreendedor
              </Button>
            </Link>
            <Link href="/login/investor">
              <Button variant="outline">
                Login Investidor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}