import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Service worker registration - only works in production builds
    // In development, PWA features are simulated
    const isDev = import.meta.env.DEV;
    
    if ('serviceWorker' in navigator && !isDev) {
      // Only register in production
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(registration => {
          console.log('✅ Service Worker registered:', registration.scope);
        })
        .catch(error => {
          console.warn('⚠️ Service Worker registration failed:', error.message);
        });
    }

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) {
      // Show helpful message in development
      if (import.meta.env.DEV) {
        console.log('ℹ️ PWA install is only available in production builds or when served over HTTPS');
        return false;
      }
      return false;
    }

    try {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
        return true;
      }
    } catch (error) {
      console.error('Installation failed:', error);
    }
    
    return false;
  };

  return { install, canInstall: !!installPrompt, isInstalled };
}