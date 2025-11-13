"use client";

import { useEffect, useState } from "react";
import { waitForUserInitialization } from "./TelegramUserInitializer";

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

        // Всегда даем доступ к интерфейсу супер админа
        sessionStorage.setItem("user_has_access", "true");
        setHasAccess(true);
      } catch (error) {
        console.error("Error checking access:", error);
        // Даже при ошибке даем доступ
        setHasAccess(true);
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

  // Всегда показываем контент (интерфейс супер админа)
  return <>{children}</>;
}

