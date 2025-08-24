import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { UserCheck, Building2, TrendingUp, RotateCcw } from "lucide-react";
import { useLocation } from "wouter";

export function ProfileSwitcher() {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Buscar perfis duais do usuário
  const { data: dualProfile } = useQuery({
    queryKey: ['/api/dual-profile'],
    queryFn: async () => {
      const response = await fetch('/api/dual-profile', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) return null;
      return response.json();
    },
  });

  // Mutação para trocar perfil
  const switchProfileMutation = useMutation({
    mutationFn: async (profileType: 'entrepreneur' | 'investor') => {
      const response = await fetch('/api/switch-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ profileType })
      });
      
      if (!response.ok) {
        throw new Error('Erro ao trocar perfil');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Atualizar token e estado de usuário
      localStorage.setItem('token', data.token);
      login(data.user, data.token);
      
      // Redirecionar para dashboard apropriado
      const targetPath = data.user.tipo === 'investor' ? '/investor/dashboard' : '/dashboard';
      setLocation(targetPath);
      
      toast({
        title: "Perfil alterado com sucesso!",
        description: `Agora você está usando o perfil de ${data.user.tipo === 'investor' ? 'Investidor' : 'Empreendedor'}.`,
      });
      
      setIsOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro ao trocar perfil",
        description: "Não foi possível trocar o perfil. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Se não há perfil dual, não mostrar o componente
  if (!dualProfile || (!dualProfile.entrepreneurId && !dualProfile.investorId)) {
    return null;
  }

  const currentProfileType = (user as any)?.tipo;
  const canSwitchToEntrepreneur = dualProfile.entrepreneurId && currentProfileType !== 'entrepreneur';
  const canSwitchToInvestor = dualProfile.investorId && currentProfileType !== 'investor';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
          <RotateCcw className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Trocar Perfil</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Trocar Perfil
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Você possui múltiplos perfis. Escolha qual perfil deseja usar:
          </div>
          
          <div className="space-y-3">
            {canSwitchToEntrepreneur && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Building2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Empreendedor</div>
                    <div className="text-sm text-muted-foreground">
                      Cadastrar empresas e solicitar crédito
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm"
                  onClick={() => switchProfileMutation.mutate('entrepreneur')}
                  disabled={switchProfileMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Usar
                </Button>
              </div>
            )}
            
            {canSwitchToInvestor && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Investidor</div>
                    <div className="text-sm text-muted-foreground">
                      Analisar empresas e fazer investimentos
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm"
                  onClick={() => switchProfileMutation.mutate('investor')}
                  disabled={switchProfileMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Usar
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCheck className="h-4 w-4" />
            <span>Perfil atual: </span>
            <Badge variant={currentProfileType === 'investor' ? 'default' : 'secondary'}>
              {currentProfileType === 'investor' ? 'Investidor' : 'Empreendedor'}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}