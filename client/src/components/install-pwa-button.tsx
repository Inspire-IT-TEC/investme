import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    // Always show the banner initially (with timeout to ensure page is loaded)
    const timeoutId = setTimeout(() => {
      if (!isInstalled) {
        console.log('Force showing install banner after timeout');
        setShowInstallBanner(true);
        
        // Try to trigger beforeinstallprompt detection
        const checkInstallability = () => {
          if ('serviceWorker' in navigator && 'PushManager' in window) {
            console.log('PWA requirements detected, app should be installable');
          }
        };
        checkInstallability();
      }
    }, 2000);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    console.log('Install button clicked, deferredPrompt available:', !!deferredPrompt);
    
    // First, try to use the native install prompt if available
    if (deferredPrompt) {
      try {
        console.log('Using deferred prompt for installation');
        // Show the install prompt
        await deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          setIsInstalled(true);
        } else {
          console.log('User dismissed the install prompt');
        }
        
        setDeferredPrompt(null);
        setShowInstallBanner(false);
        return;
      } catch (error) {
        console.log('Error showing install prompt:', error);
      }
    }

    // Try to detect if running in a supported browser and trigger native install
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isEdge = /Edge/.test(navigator.userAgent);
    const isSamsung = /SamsungBrowser/.test(navigator.userAgent);
    
    if (isChrome || isEdge || isSamsung) {
      console.log('Supported browser detected, should show native install prompt');
      
      // For Chrome/Edge, the beforeinstallprompt should have fired
      // If it didn't, it might be because the app is already installed or doesn't meet criteria
      if ('getInstalledRelatedApps' in navigator) {
        try {
          const relatedApps = await (navigator as any).getInstalledRelatedApps();
          if (relatedApps.length > 0) {
            alert('O aplicativo já parece estar instalado no seu dispositivo.');
            return;
          }
        } catch (error) {
          console.log('getInstalledRelatedApps not supported');
        }
      }
      
      // Try to manually trigger the install prompt by dispatching the event
      try {
        const beforeInstallPromptEvent = new Event('beforeinstallprompt');
        window.dispatchEvent(beforeInstallPromptEvent);
        console.log('Manually dispatched beforeinstallprompt event');
        
        // Wait a bit and check if prompt was captured
        setTimeout(() => {
          if (!deferredPrompt) {
            console.log('Native install not available, showing manual instructions');
            showManualInstallInstructions();
          }
        }, 500);
        return;
      } catch (error) {
        console.log('Could not dispatch beforeinstallprompt event');
      }
    }

    // Final fallback: Show manual instructions
    console.log('Showing manual install instructions as fallback');
    showManualInstallInstructions();
  };

  const showManualInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isEdge = /Edge/.test(navigator.userAgent);
    
    let instructions = '';
    
    if (isIOS) {
      if (isSafari) {
        instructions = 'Para instalar o app:\n\n1. Toque no ícone de compartilhar (□↗) na parte inferior\n2. Role para baixo e toque em "Adicionar à Tela de Início"\n3. Toque em "Adicionar"';
      } else {
        instructions = 'Para instalar o app:\n\n1. Abra este site no Safari\n2. Toque no ícone de compartilhar\n3. Selecione "Adicionar à Tela de Início"';
      }
    } else if (isAndroid) {
      if (isChrome) {
        instructions = 'Para instalar o app:\n\n1. Toque no menu (⋮) no canto superior direito\n2. Selecione "Adicionar à tela inicial"\n3. Confirme tocando em "Adicionar"';
      } else {
        instructions = 'Para instalar o app:\n\n1. Abra este site no Chrome do Android\n2. Toque no menu (⋮)\n3. Selecione "Adicionar à tela inicial"';
      }
    } else {
      if (isChrome) {
        instructions = 'Para instalar o app:\n\n1. No Chrome: Menu > "Adicionar à tela inicial"\n2. No Safari: Compartilhar > "Adicionar à Tela de Início"\n3. No Edge: Menu > "Aplicativos" > "Instalar este site como aplicativo"';
      } else {
        instructions = 'Para melhor experiência:\n\n1. No Chrome mobile: Menu > "Adicionar à tela inicial"\n2. No Safari: Compartilhar > "Adicionar à Tela de Início"\n3. No Edge: Menu > "Aplicativos" > "Instalar este site como aplicativo"';
      }
    }
    
    // Create a custom modal instead of alert
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      width: 100%;
      text-align: left;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    `;
    
    content.innerHTML = `
      <h3 style="margin: 0 0 16px 0; font-weight: 600; font-size: 18px; color: #1f2937;">
        Para instalar o app:
      </h3>
      <div style="white-space: pre-line; line-height: 1.6; color: #4b5563; margin-bottom: 20px;">
        ${instructions}
      </div>
      <button onclick="this.closest('div').remove()" style="
        background: #16a34a;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        width: 100%;
      ">
        OK
      </button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Remove modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    // Don't show again for this session
    sessionStorage.setItem('installBannerDismissed', 'true');
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Show install banner if not dismissed this session
  if ((showInstallBanner || deferredPrompt) && 
      sessionStorage.getItem('installBannerDismissed') !== 'true') {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <img src="/generated-icon.png" alt="InvestMe" className="w-8 h-8 rounded-lg" />
                <div>
                  <h3 className="font-semibold text-sm">Instalar InvestMe</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Acesso rápido direto da sua tela inicial
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="flex-1 h-8 text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Instalar
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}