"use client";

import { useEffect, useState } from "react";

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

      // Проверяем, не инициализировали ли мы уже в этой сессии
      const alreadyInitialized = sessionStorage.getItem(sessionKey);
      if (alreadyInitialized === "true") {
        setInitialized(true);
        return;
      }

      // Просто устанавливаем флаг инициализации и доступ
      // Всегда даем доступ к интерфейсу супер админа
      sessionStorage.setItem("user_has_access", "true");
      
      // Инициализируем localStorage
      if (typeof window !== 'undefined') {
        const { initializeStorageFromMocks, getCurrentRole, setCurrentRole } = await import('../utils/localStorage');
        initializeStorageFromMocks();
        
        // Устанавливаем роль по умолчанию, если не установлена
        const currentRole = getCurrentRole();
        if (!currentRole) {
          setCurrentRole("супер админ");
        } else {
          sessionStorage.setItem("current_user_role", currentRole);
        }
      }
      
      sessionStorage.setItem(sessionKey, "true");
      setInitialized(true);
    };

    // Инициализируем только в браузере
    if (typeof window !== "undefined") {
      initUser();
    }
  }, []);

  // Этот компонент не рендерит ничего видимого
  return null;
}

