"use client";

import { useState, useEffect } from "react";
import { getUsers, type User } from "@/assets/api";

interface UserSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (userName: string) => void;
  title: string;
  excludeUser?: string[]; // Пользователи, уже выбранные в других отделах
}

export default function UserSelectModal({
  isOpen,
  onClose,
  onSelect,
  title,
  excludeUser = [],
}: UserSelectModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Не удалось загрузить пользователей", err);
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = (user: User) => {
    return user.full_name || user.username || "Без имени";
  };

  const isUserSelected = (user: User) => {
    const displayName = getUserDisplayName(user);
    return excludeUser.some(excluded => 
      excluded === displayName || 
      excluded === user.full_name || 
      excluded === user.username ||
      (excluded.startsWith('@') && user.username === excluded.substring(1)) ||
      (!excluded.startsWith('@') && user.username === `@${excluded}`)
    );
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const name = user.full_name || user.username || "";
    const username = user.username || "";
    return name.toLowerCase().includes(query) || username.toLowerCase().includes(query);
  });

  const handleSelectUser = (user: User) => {
    // Не позволяем выбрать уже выбранного пользователя
    if (isUserSelected(user)) {
      return;
    }
    const displayName = getUserDisplayName(user);
    onSelect(displayName);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-black">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Закрыть"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Поиск пользователей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E1F5C6] focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Загрузка пользователей...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                {searchQuery ? "Пользователи не найдены" : "Нет пользователей"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => {
                const isSelected = isUserSelected(user);
                return (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    disabled={isSelected}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors border ${
                      isSelected
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                        : "hover:bg-gray-100 border-transparent hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className={`font-medium ${isSelected ? "text-gray-400" : "text-black"}`}>
                          {getUserDisplayName(user)}
                        </p>
                        {user.username && (
                          <p className={`text-sm mt-1 ${isSelected ? "text-gray-400" : "text-gray-500"}`}>
                            {user.username.startsWith("@") ? user.username : `@${user.username}`}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">уже выбран</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

