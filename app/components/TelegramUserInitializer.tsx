"use client";

import { useEffect, useState } from "react";
import { checkUserAccess, updateUserByUsername, getUserByUsername } from "@/assets/api";

// Глобальная переменная для отслеживания инициализации
let initializationPromise: Promise<boolean> | null = null;

export function waitForUserInitialization(): Promise<boolean> {
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = new Promise((resolve) => {
    const checkInitialized = () => {
      const initialized = sessionStorage.getItem("telegram_user_initialized") === "true";
      if (initialized) {
        resolve(true);
      } else {
        setTimeout(checkInitialized, 100);
      }
    };
    checkInitialized();
  });
  
  return initializationPromise;
}

export default function TelegramUserInitializer() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initUser = async () => {
      // Проверяем, не инициализировали ли мы уже пользователя в этой сессии
      const sessionKey = "telegram_user_initialized";
      const alreadyInitialized = sessionStorage.getItem(sessionKey);
      
      if (alreadyInitialized === "true") {
        setInitialized(true);
        return;
      }

      if (typeof window === "undefined") {
        return;
      }

      try {
        // 1. Получаем данные из Telegram Web App
        const tg = (window as any).Telegram?.WebApp;
        if (!tg?.initDataUnsafe?.user) {
          console.warn("Telegram Web App user data not available");
          setInitialized(true);
          return;
        }

        const telegramUser = tg.initDataUnsafe.user;
        const userName = telegramUser.username 
          ? `@${telegramUser.username}` 
          : `@id${telegramUser.id}`;

        // 2. Проверяем доступ через check-access (реальный API с fallback на моковые данные)
        const accessResponse = await checkUserAccess(userName);
        
        if (!accessResponse.has_access || !accessResponse.user) {
          console.warn("User does not have access:", accessResponse.message);
          setInitialized(true);
          return;
        }

        // 3. Получаем полные данные пользователя
        let user = await getUserByUsername(userName);
        
        // 4. Проверяем, первый ли это вход (нет telegram_id или он не совпадает)
        const isFirstLogin = !user.telegram_id || user.telegram_id !== userName;
        
        if (isFirstLogin) {
          // 5. Обновляем пользователя с ID из Telegram через PUT /users/{user_name}
          const telegramUserData = {
            user_name: userName,
            username: userName,
            first_name: telegramUser.first_name || user.first_name || '',
            last_name: telegramUser.last_name || user.last_name || '',
            full_name: [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' ') || user.full_name || '',
            telegram_id: userName,
            role: user.role || accessResponse.user.role,
          };
          
          user = await updateUserByUsername(userName, telegramUserData);
        }

        // 6. Сохраняем информацию о пользователе в sessionStorage
        sessionStorage.setItem("current_user_id", user.id.toString());
        sessionStorage.setItem("current_user_name", user.user_name || user.username || "");
        sessionStorage.setItem("current_user_role", user.role || "");
        sessionStorage.setItem(sessionKey, "true");
        
        console.log("User initialized from Telegram:", user);
      } catch (error) {
        console.error("Error initializing user from Telegram:", error);
      } finally {
        setInitialized(true);
      }
    };

    // Инициализируем только в браузере
    if (typeof window !== "undefined") {
      initUser();
    }
  }, []);

  // Этот компонент не рендерит ничего видимого
  return null;
}

