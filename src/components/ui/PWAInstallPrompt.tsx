import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(isInStandaloneMode);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Check if user dismissed prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Show prompt if not dismissed recently (7 days) and not installed
    if (!isInStandaloneMode && (!dismissed || daysSinceDismissed > 7)) {
      // For Android/Chrome
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      });

      // For iOS - show manual instructions after 3 seconds
      if (ios && !isInStandaloneMode) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt (Android/Chrome)
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-white rounded-xl shadow-2xl border-2 border-[#1a2332] p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3 mb-3">
          <div className="bg-[#1a2332] rounded-lg p-2">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">Install Discovering Me</h3>
            <p className="text-sm text-gray-600">
              Add to your home screen for quick access and offline use
            </p>
          </div>
        </div>

        {isIOS ? (
          // iOS Instructions
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <p className="text-sm text-blue-900 mb-2 font-medium">
              To install on iOS:
            </p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Tap the Share button (📤)</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" in the top right</li>
            </ol>
          </div>
        ) : (
          // Android/Chrome Install Button
          <button
            onClick={handleInstallClick}
            className="w-full bg-[#1a2332] text-white px-4 py-3 rounded-lg hover:bg-[#2d3e50] font-semibold flex items-center justify-center gap-2 mb-2"
          >
            <Download className="w-5 h-5" />
            Install App
          </button>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="flex-1 border-t border-gray-200"></div>
          <span>Quick & Easy</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>
      </div>
    </div>
  );
}
