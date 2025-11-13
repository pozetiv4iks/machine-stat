"use client";

import { useEffect, useState } from "react";
import { waitForUserInitialization } from "./TelegramUserInitializer";
import AccessDenied from "./AccessDenied";
import { isTelegramWebAppAvailable } from "../utils/telegram";

interface AccessGuardProps {
  children: React.ReactNode;
}

export default function AccessGuard({ children }: AccessGuardProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Ждем инициализации пользователя
        await waitForUserInitialization();

        // Проверяем, имеет ли пользователь доступ
        if (typeof window !== "undefined") {
          // Дополнительная проверка: убеждаемся, что данные Telegram все еще доступны
          const hasTelegramData = isTelegramWebAppAvailable();
          
          if (!hasTelegramData) {
            // Если данных Telegram нет, но в sessionStorage есть старые данные - очищаем их
            console.warn("Telegram data not available in AccessGuard - denying access");
            sessionStorage.setItem("user_has_access", "false");
            setHasAccess(false);
            setIsChecking(false);
            return;
          }
          
          // Проверяем, является ли пользователь админом (@XSwagq)
          const userName = sessionStorage.getItem("current_user_name");
          const isAdminUser = userName === '@XSwagq';
          
          const userHasAccess = sessionStorage.getItem("user_has_access");
          // Админ всегда имеет доступ, или если user_has_access установлен в "true"
          setHasAccess(isAdminUser || userHasAccess === "true");
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error("Error checking access:", error);
        setHasAccess(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, []);

  // Пока проверяем доступ, не показываем ничего (LoadingScreen показывается отдельно)
  if (isChecking) {
    return null;
  }

  // Если пользователь не имеет доступа (false или null), показываем страницу отказа в доступе
  if (hasAccess !== true) {
    return <AccessDenied />;
  }

  // Если пользователь имеет доступ, показываем контент
  return <>{children}</>;
}

