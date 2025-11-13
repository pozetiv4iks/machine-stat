"use client";

import { useEffect, useState } from "react";
import { getCurrentRole, setCurrentRole, getRolesFromStorage } from "../utils/localStorage";

const availableRoles = [
  "супер админ",
  "админ",
  "менеджмент",
  "начальник отдела 1",
  "начальник отдела 2",
  "проверяющий",
];

export default function RoleSwitcher() {
  const [currentRole, setCurrentRoleState] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const role = getCurrentRole();
    setCurrentRoleState(role);
    
    // Слушаем изменения в localStorage
    const handleStorageChange = () => {
      const newRole = getCurrentRole();
      setCurrentRoleState(newRole);
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Также слушаем изменения в sessionStorage
    const interval = setInterval(() => {
      const newRole = getCurrentRole();
      if (newRole !== currentRole) {
        setCurrentRoleState(newRole);
      }
    }, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [currentRole]);

  const handleRoleChange = (role: string) => {
    setCurrentRole(role);
    setCurrentRoleState(role);
    setIsOpen(false);
    // Перезагружаем страницу для применения изменений
    window.location.reload();
  };

  if (!currentRole) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-1 text-xs bg-[#DBEDAE] text-black rounded-lg hover:bg-[#DBEDAE]/80 transition-colors font-medium flex items-center gap-1 max-w-[120px]"
        title={currentRole}
      >
        <span className="truncate">{currentRole}</span>
        <svg
          className={`w-3 h-3 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

            {isOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsOpen(false)}
                />
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                  <div className="py-1">
                    {availableRoles.map((role) => (
                      <button
                        key={role}
                        onClick={() => handleRoleChange(role)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                          currentRole === role
                            ? 'bg-[#DBEDAE] text-black font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
    </div>
  );
}

