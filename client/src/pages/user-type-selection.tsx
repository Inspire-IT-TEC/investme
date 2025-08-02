import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Building, TrendingUp, Users, ChevronRight } from "lucide-react";

interface UserTypeSelectionProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
}

export default function UserTypeSelection({ 
  title = "Escolha seu Perfil", 
  description = "Como você gostaria de usar a plataforma InvestMe?",
  showBackButton = false 
}: UserTypeSelectionProps) {
  const [, setLocation] = useLocation();

  const userTypes = [
    {
      id: 'entrepreneur',
      title: 'Empreendedor',
      description: 'Registre sua empresa, solicite crédito e encontre investidores',
      icon: Building,
      features: [
        'Cadastro de empresa',
        'Solicitação de crédito',
        'Networking com investidores',
        'Gestão de documentos'
      ],
      buttonText: 'Sou Empreendedor',
      route: '/entrepreneur-register'
    },
    {
      id: 'investor',
      title: 'Investidor',
      description: 'Explore oportunidades de investimento e analise empresas',
      icon: TrendingUp,
      features: [
        'Análise de empresas',
        'Oportunidades de investimento',
        'Networking com empreendedores',
        'Dashboard de investimentos'
      ],
      buttonText: 'Sou Investidor',
      route: '/investor-register'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* User Type Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {userTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <Card 
                key={type.id} 
                className="relative overflow-hidden border-2 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group cursor-pointer"
                onClick={() => setLocation(type.route)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-lg">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    {type.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    {type.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(type.route);
                    }}
                  >
                    {type.buttonText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Já tem uma conta?{' '}
            <Button
              variant="link"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-0 h-auto font-semibold"
              onClick={() => setLocation('/login')}
            >
              Faça login aqui
            </Button>
          </p>
        </div>

        {showBackButton && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => setLocation('/')}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Voltar ao Início
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}