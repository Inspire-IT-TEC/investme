import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPWASimple() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event captured');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    const handleAppInstalled = () => {
      console.log('App installed successfully');
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Force show banner after 2 seconds if not already shown
    const timer = setTimeout(() => {
      if (!isInstalled && !sessionStorage.getItem('installBannerDismissed')) {
        setShowBanner(true);
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      console.log('Attempting automatic PWA installation');
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('User accepted installation');
          setIsInstalled(true);
        } else {
          console.log('User declined installation');
        }
        
        setDeferredPrompt(null);
        setShowBanner(false);
        return;
      } catch (error) {
        console.error('Installation failed:', error);
      }
    }

    // If no native prompt available, trigger browser-specific actions
    triggerBrowserInstall();
  };

  const triggerBrowserInstall = () => {
    const userAgent = navigator.userAgent;
    const isChrome = /Chrome/.test(userAgent) && !/Edge/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isEdge = /Edge/.test(userAgent);

    if (isChrome) {
      // Chrome should show native install, but if not, guide user
      alert('Para instalar:\n\n1. Clique no ícone ⚙️ na barra de endereço\n2. Selecione "Instalar InvestMe"\n3. Confirme a instalação');
    } else if (isSafari) {
      alert('Para instalar no Safari:\n\n1. Toque no ícone de compartilhar □↗\n2. Role para baixo e toque em "Adicionar à Tela de Início"\n3. Toque em "Adicionar"');
    } else if (isFirefox) {
      alert('Para instalar no Firefox:\n\n1. Abra o menu (⋮)\n2. Selecione "Instalar"\n3. Confirme a instalação');
    } else if (isEdge) {
      alert('Para instalar no Edge:\n\n1. Clique no menu (⋯)\n2. Selecione "Aplicativos" > "Instalar este site como aplicativo"\n3. Confirme a instalação');
    } else {
      alert('Para instalar:\n\n1. Use Chrome, Edge ou Safari para melhor experiência\n2. Procure pela opção "Instalar" ou "Adicionar à tela inicial" no menu do navegador');
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('installBannerDismissed', 'true');
  };

  if (isInstalled) {
    return null;
  }

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-white/20 p-2 rounded-lg">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">
                Instalar InvestMe
              </h3>
              <p className="text-xs text-green-100 mb-3">
                Acesso rápido direto da sua tela inicial
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  size="sm"
                  variant="secondary"
                  className="flex-1 h-8 text-xs bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Instalar App
                </Button>
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-white hover:bg-white/20"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}