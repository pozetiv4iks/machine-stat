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

// МОКОВЫЕ ДАННЫЕ: Список пользователей для моковой проверки (для тестирования без API)
// TODO: Удалить после подключения реального API
const MOCK_USERS: Record<string, { role: string; id: number }> = {
  "@ewq2112": {
    role: "Начальник отдела",
    id: 1,
  },
};

// МОКОВАЯ ПРОВЕРКА: Проверяет, есть ли пользователь в моковом списке
// TODO: Удалить после подключения реального API
function checkMockUser(userName: string): { hasAccess: boolean; role?: string; id?: number } {
  const mockUser = MOCK_USERS[userName];
  if (mockUser) {
    console.log(`[МОКОВЫЕ ДАННЫЕ] Пользователь ${userName} найден в моковом списке с ролью: ${mockUser.role}`);
    return {
      hasAccess: true,
      role: mockUser.role,
      id: mockUser.id,
    };
  }
  return { hasAccess: false };
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

        // МОКОВАЯ ПРОВЕРКА: Сначала проверяем моковые данные
        // TODO: Удалить после подключения реального API
        const mockCheck = checkMockUser(userName);
        if (mockCheck.hasAccess) {
          console.log(`[МОКОВЫЕ ДАННЫЕ] Используем моковые данные для пользователя ${userName}`);
          
          // Сохраняем моковые данные пользователя
          const mockUserData = {
            id: mockCheck.id || 1,
            user_name: userName,
            username: userName,
            first_name: telegramUser.first_name || '',
            last_name: telegramUser.last_name || '',
            full_name: [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' ') || '',
            telegram_id: userName,
            role: mockCheck.role || '',
          };

          sessionStorage.setItem("current_user_id", mockUserData.id.toString());
          sessionStorage.setItem("current_user_name", mockUserData.user_name);
          sessionStorage.setItem("current_user_role", mockUserData.role);
          sessionStorage.setItem(sessionKey, "true");
          
          console.log("[МОКОВЫЕ ДАННЫЕ] User initialized from mock data:", mockUserData);
          setInitialized(true);
          return;
        }

        // 2. Проверяем доступ через check-access (реальный API)
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

