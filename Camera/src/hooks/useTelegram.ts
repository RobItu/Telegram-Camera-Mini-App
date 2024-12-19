import { useEffect, useState } from 'react';

// Declare a global interface to extend the `Window` object to include `Telegram`.
// This allows TypeScript to recognize `window.Telegram` as a valid property.
declare global {
  interface Window {
    Telegram: any;
  }
}

export function useTelegram() {
  const [tg, setTg] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if the `Telegram` object exists on the `window` object.
    if (window.Telegram) {
      const webApp = window.Telegram.WebApp;
      setTg(webApp);
      setUser(webApp.initDataUnsafe?.user);
    }
  }, []);

  return { tg, user };
}
