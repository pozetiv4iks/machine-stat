"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentRole } from "../utils/localStorage";

const allNavItems = [
  {
    href: "/",
    label: "пользователи",
    roles: ["админ", "супер админ"], // Только для админов
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    href: "/checklists",
    label: "чеклисты",
    roles: ["админ", "супер админ"], // Только для админов
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
  },
  {
    href: "/chart",
    label: "график",
    roles: ["менеджмент", "проверяющий", "начальник отдела", "админ", "супер админ"], // Для всех кроме админов
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    href: "/calendar",
    label: "календарь",
    roles: ["менеджмент", "проверяющий", "начальник отдела", "админ", "супер админ"], // Для всех кроме админов
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    href: "/reports",
    label: "отчеты",
    roles: ["менеджмент", "проверяющий", "начальник отдела", "админ", "супер админ"], // Для всех кроме админов
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    href: "/chats",
    label: "чаты",
    roles: ["проверяющий", "начальник отдела", "админ", "супер админ"], // Для проверяющих и начальников отделов
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
];

export default function Navigation() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Получаем роль пользователя из localStorage
    if (typeof window !== "undefined") {
      const role = getCurrentRole();
      setUserRole(role);
      
      // Слушаем изменения в localStorage
      const handleStorageChange = () => {
        const newRole = getCurrentRole();
        setUserRole(newRole);
      };
      
      window.addEventListener('storage', handleStorageChange);
      // Также проверяем периодически для синхронизации между вкладками
      const interval = setInterval(() => {
        const newRole = getCurrentRole();
        if (newRole !== userRole) {
          setUserRole(newRole);
        }
      }, 100);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    }
  }, [userRole]);

  // Функция для проверки, должна ли вкладка отображаться для текущей роли
  const shouldShowItem = (item: typeof allNavItems[0]) => {
    if (!userRole) {
      // Если роль не определена, показываем все (для админов по умолчанию)
      return item.roles.includes("админ") || item.roles.includes("супер админ");
    }

    // Проверяем, есть ли роль в списке разрешенных
    if (item.roles.includes(userRole)) {
      return true;
    }

    // Проверяем, является ли пользователь начальником отдела (роль содержит слова "начальник отдела")
    const userRoleLower = userRole.toLowerCase();
    const isDepartmentHead = userRoleLower.includes("начальник отдела");
    if (isDepartmentHead && item.roles.includes("начальник отдела")) {
      return true;
    }

    return false;
  };

  // Фильтруем элементы навигации по роли
  const navItems = allNavItems.filter(shouldShowItem);

  return (
    <nav className="fixed bottom-[3px] left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16 px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/reports" && pathname?.toString().startsWith("/reports"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? "text-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className={isActive ? "text-black" : "text-gray-500"}>
                {item.icon}
              </div>
              <span
                className={`text-xs mt-1 ${
                  isActive ? "font-semibold text-black" : "text-gray-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

