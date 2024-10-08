export const getTelegramUsername = () => {
  if (typeof window !== 'undefined' && typeof window.Telegram !== 'undefined') {
    window.Telegram.WebApp.ready();
    const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe;
    return initDataUnsafe?.user?.username || 'Unknown user';
  } else {
    console.log('Telegram WebApp is not available');
    return 'Telegram WebApp not available';
  }
};
