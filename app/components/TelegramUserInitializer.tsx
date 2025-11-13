"use client";

import { useEffect, useState } from "react";
import { checkUserAccess, updateUserByUsername, getUserByUsername } from "@/assets/api";
import { getTelegramUser, getTelegramUserName, isTelegramWebAppAvailable } from "../utils/telegram";

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
      const sessionKey = "telegram_user_initialized";
      
      if (typeof window === "undefined") {
        return;
      }

      // 1. Сначала проверяем актуальность данных Telegram Web App
      const telegramUser = getTelegramUser();
      const hasTelegramData = !!telegramUser;
      
      // Если нет данных Telegram, проверяем есть ли сохраненные данные
      if (!hasTelegramData) {
        console.warn("Telegram Web App user data not available - clearing session");
        // Очищаем только флаг доступа, но сохраняем данные пользователя если они есть
        const existingUserName = sessionStorage.getItem("current_user_name");
        const existingUserId = sessionStorage.getItem("current_user_id");
        
        sessionStorage.removeItem("user_has_access");
        sessionStorage.removeItem("current_user_role");
        sessionStorage.setItem("user_has_access", "false");
        
        // Сохраняем существующие данные пользователя если они есть
        if (existingUserName) {
          sessionStorage.setItem("current_user_name", existingUserName);
        }
        if (existingUserId) {
          sessionStorage.setItem("current_user_id", existingUserId);
        }
        
        sessionStorage.setItem(sessionKey, "true");
        setInitialized(true);
        return;
      }

      // 2. Проверяем, не инициализировали ли мы уже пользователя в этой сессии
      const alreadyInitialized = sessionStorage.getItem(sessionKey);
      
      // Если уже инициализировано, проверяем что данные Telegram все еще актуальны
      if (alreadyInitialized === "true") {
        // Проверяем, что текущий пользователь в Telegram совпадает с сохраненным
        const currentTelegramUser = getTelegramUser();
        if (!currentTelegramUser) {
          setInitialized(true);
          return;
        }
        const currentUserName = getTelegramUserName();
        const savedUserName = sessionStorage.getItem("current_user_name");
        
        // Если пользователь изменился или данные не совпадают, переинициализируем
        if (savedUserName && savedUserName !== currentUserName) {
          console.log("User changed, reinitializing...");
          // Очищаем старые данные и продолжаем инициализацию
          sessionStorage.removeItem("user_has_access");
          sessionStorage.removeItem("current_user_id");
          sessionStorage.removeItem("current_user_name");
          sessionStorage.removeItem("current_user_role");
          sessionStorage.removeItem(sessionKey);
        } else {
          // Данные актуальны, просто устанавливаем статус
          setInitialized(true);
          return;
        }
      }

      try {
        // 3. Формируем userName для проверки доступа
        const currentTelegramUser = getTelegramUser();
        if (!currentTelegramUser) {
          sessionStorage.setItem("user_has_access", "false");
          sessionStorage.setItem(sessionKey, "true");
          setInitialized(true);
          return;
        }
        const userName = getTelegramUserName() || `@id${currentTelegramUser.id}`;

        // 4. СНАЧАЛА проверяем доступ через check-access API
        const accessResponse = await checkUserAccess(userName);
        
        if (!accessResponse.has_access || !accessResponse.user) {
          console.warn("User does not have access:", accessResponse.message);
          // Сохраняем данные пользователя из Telegram для отображения на экране ошибки
          sessionStorage.setItem("current_user_name", userName);
          if (currentTelegramUser.id) {
            sessionStorage.setItem("telegram_user_id", currentTelegramUser.id.toString());
          }
          // Сохраняем информацию о том, что пользователь не имеет доступа
          sessionStorage.setItem("user_has_access", "false");
          sessionStorage.setItem(sessionKey, "true");
          setInitialized(true);
          return;
        }

        // 5. Если пользователь одобрен, получаем Telegram ID (используем ID из Telegram)
        const telegramId = userName; // Telegram ID формируется из userName (@username или @id123)
        const telegramUserId = currentTelegramUser.id.toString(); // Числовой ID пользователя из Telegram

        // 6. Отправляем Telegram ID в БД через PUT /users/{user_name}
        // Получаем текущие данные пользователя для обновления
        let user = await getUserByUsername(userName);
        
        // Обновляем пользователя с Telegram ID в БД
        const telegramUserData = {
          user_name: userName,
          username: userName,
          first_name: currentTelegramUser.first_name || user.first_name || '',
          last_name: currentTelegramUser.last_name || user.last_name || '',
          full_name: [currentTelegramUser.first_name, currentTelegramUser.last_name].filter(Boolean).join(' ') || user.full_name || '',
          telegram_id: telegramId, // Отправляем Telegram ID в БД (@username или @id123)
          role: user.role || accessResponse.user.role, // Сохраняем существующую роль
        };
        
        // Отправляем обновление в БД (возвращает обновленного пользователя)
        user = await updateUserByUsername(userName, telegramUserData);

        // 7. Получаем обновленного пользователя из БД для проверки актуального статуса/роли
        user = await getUserByUsername(userName);
        
        // 8. По статусу/роли из БД определяем права доступа
        const userRole = user.role || '';
        const hasAccess = !!userRole && userRole.trim() !== '';
        
        if (!hasAccess) {
          console.warn("User has no role assigned, denying access");
          sessionStorage.setItem("user_has_access", "false");
          sessionStorage.setItem(sessionKey, "true");
          setInitialized(true);
          return;
        }

        // 9. Сохраняем информацию о пользователе в sessionStorage
        // Сохраняем ID пользователя из БД и ID из Telegram
        sessionStorage.setItem("current_user_id", user.id.toString()); // ID из БД
        sessionStorage.setItem("telegram_user_id", telegramUserId); // Числовой ID из Telegram
        sessionStorage.setItem("current_user_name", user.user_name || user.username || "");
        sessionStorage.setItem("current_user_role", userRole);
        sessionStorage.setItem("user_has_access", "true");
        sessionStorage.setItem(sessionKey, "true");
        
        console.log("User initialized from Telegram:", user);
      } catch (error) {
        console.error("Error initializing user from Telegram:", error);
        // В случае ошибки считаем что нет доступа
        sessionStorage.setItem("user_has_access", "false");
        sessionStorage.setItem(sessionKey, "true");
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

