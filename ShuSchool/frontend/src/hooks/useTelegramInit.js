import { useState, useEffect } from 'react';

export const useTelegramInit = () => {
  const [initData, setInitData] = useState(null);
  const [tgUser, setTgUser] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg && tg.initData) {
      try {
        tg.expand(); // Expand to full screen
      } catch (e) {
        console.warn("Telegram WebApp expand failed", e);
      }
      setInitData(tg.initData);
      
      try {
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
          setTgUser(tg.initDataUnsafe.user);
        }
      } catch (e) {
        console.error("Error parsing Telegram User Data", e);
      }
    }
  }, []);

  return { initData, tgUser };
};
