import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

const routeFromUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname || `/${parsed.host}`;
    const search = parsed.search || '';
    const hash = parsed.hash || '';
    return `${path}${search}${hash}`;
  } catch {
    return '/';
  }
};

export function NativeDeepLinkHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleUrl = (url: string) => {
      navigate(routeFromUrl(url), { replace: true });
    };

    let removeListener: (() => Promise<void>) | undefined;

    CapacitorApp.getLaunchUrl().then((launch) => {
      if (launch?.url) handleUrl(launch.url);
    });

    CapacitorApp.addListener('appUrlOpen', ({ url }) => handleUrl(url)).then((listener) => {
      removeListener = () => listener.remove();
    });

    return () => {
      void removeListener?.();
    };
  }, [navigate]);

  return null;
}
