"use client";

import { useEffect, useState } from "react";
import { getUsers, type User } from "@/assets/api";
import UserEditModal from "../components/UserEditModal";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError("Не удалось загрузить пользователей");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const name = user.full_name || user.username || "";
    const username = user.username || "";
    const telegramId = user.telegram_id || "";
    return name.toLowerCase().includes(query) || username.toLowerCase().includes(query) || telegramId.toLowerCase().includes(query);
  });

  const getUserDisplayName = (user: User) => {
    return user.full_name || user.username || "Без имени";
  };

  const getUserRole = (user: User) => {
    return user.role || "Пользователь";
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveUser = () => {
    loadUsers(); // Перезагружаем список пользователей после сохранения
  };

  return (
    <div className="min-h-screen bg-white pb-20 relative overflow-hidden">
      {/* Мягкие размытые зеленые области на заднем плане */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Верхний левый угол */}
        <div 
          className="absolute rounded-full bg-[#E1F5C6]"
          style={{
            width: '700px',
            height: '700px',
            filter: 'blur(100px)',
            opacity: 0.5,
            top: '-250px',
            left: '-250px',
          }}
        />
        {/* Нижний правый угол */}
        <div 
          className="absolute rounded-full bg-[#E1F5C6]"
          style={{
            width: '700px',
            height: '700px',
            filter: 'blur(100px)',
            opacity: 0.5,
            bottom: '-250px',
            right: '-250px',
          }}
        />
      </div>

      <div className="px-12 pt-16 pb-16 relative z-10 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-black mb-16">Пользователи</h1>

        {/* Поисковая строка */}
        <div className="mb-16">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-black"
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
              className="block w-full pl-10 pr-3 py-3 border border-black rounded-lg bg-white text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-[#E1F5C6] focus:border-transparent"
            />
          </div>
        </div>

        {/* Состояние загрузки и ошибки */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Загрузка пользователей...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadUsers}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Список пользователей */}
        {!loading && !error && (
          <div className="space-y-8">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  {searchQuery ? "Пользователи не найдены" : "Нет пользователей"}
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-black text-lg">
                        {getUserDisplayName(user)}
                      </h3>
                      {user.username && (
                        <p className="text-sm text-gray-600 mt-1">@{user.username}</p>
                      )}
                      {user.telegram_id && (
                        <p className="text-sm text-gray-500 mt-1">Telegram: {user.telegram_id}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {getUserRole(user)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="ml-4 p-2 text-gray-600 hover:text-black transition-colors"
                      aria-label="Редактировать"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Модальное окно редактирования */}
      <UserEditModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
      />
    </div>
  );
}

