import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram: any;
  }
}

export function useTelegram() {
  const [tg, setTg] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (window.Telegram) {
      const webApp = window.Telegram.WebApp;
      setTg(webApp);
      setUser(webApp.initDataUnsafe?.user);
    }
  }, []);

  return { tg, user };
}
