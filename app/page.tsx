"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentRole } from "./utils/localStorage";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Получаем роль пользователя
    const role = getCurrentRole();
    
    // Редиректим в зависимости от роли
    if (role === "менеджмент") {
      router.replace("/chart");
    } else if (role === "проверяющий") {
      router.replace("/calendar");
    } else {
      // Для админов, супер админов и других ролей - редирект на пользователей
      router.replace("/users");
    }
  }, [router]);

  // Показываем загрузку во время редиректа
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Загрузка...</p>
      </div>
    </div>
  );
}
