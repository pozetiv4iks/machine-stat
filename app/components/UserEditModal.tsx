"use client";

import { useState, useEffect } from "react";
import { User, updateUser, createUser } from "@/assets/api";
import CustomSelect from "./CustomSelect";

interface UserEditModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const roles = [
  "менеджмент",
  "админ",
  "супер админ",
  "начальник отдела 1",
  "начальник отдела 2",
  "проверяющий",
];

export default function UserEditModal({
  user,
  isOpen,
  onClose,
  onSave,
}: UserEditModalProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    telegram_id: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Функция для нормализации логина (добавление @ если его нет)
  const normalizeUsername = (username: string): string => {
    if (!username) return "";
    // Если первый символ не @, добавляем его
    if (username[0] !== "@") {
      return "@" + username;
    }
    return username;
  };

  // Функция для получения Telegram ID из сессии/Telegram Web App
  const getCurrentTelegramId = (): string => {
    if (typeof window !== "undefined") {
      // Проверяем Telegram Web App API
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user) {
        const telegramUser = tg.initDataUnsafe.user;
        // Возвращаем username с @ или id
        if (telegramUser.username) {
          return `@${telegramUser.username}`;
        } else if (telegramUser.id) {
          return `@id${telegramUser.id}`;
        }
      }
      // Проверяем localStorage/sessionStorage
      const storedTelegramId = localStorage.getItem("telegram_id") || sessionStorage.getItem("telegram_id");
      if (storedTelegramId) {
        return storedTelegramId;
      }
    }
    return "";
  };

  // Функция для разделения полного имени на имя и фамилию
  const splitFullName = (fullName: string): { first: string; last: string } => {
    if (!fullName) return { first: "", last: "" };
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return { first: "", last: "" };
    if (parts.length === 1) return { first: parts[0], last: "" };
    // Берем первое слово как имя, остальное как фамилию
    return {
      first: parts[0],
      last: parts.slice(1).join(" "),
    };
  };

  useEffect(() => {
    if (user) {
      const { first, last } = splitFullName(user.full_name || "");
      setFormData({
        first_name: first || "",
        last_name: last || "",
        username: normalizeUsername(user.username || "") || "",
        telegram_id: user.telegram_id || "",
        role: user.role || "",
      });
    } else {
      // Режим создания нового пользователя
      setFormData({
        first_name: "",
        last_name: "",
        username: "",
        telegram_id: "",
        role: "",
      });
    }
    setError(null);
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Объединяем имя и фамилию в full_name
      const fullName = [formData.first_name, formData.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

      // Нормализуем логин перед отправкой (убеждаемся, что есть @)
      let normalizedFormData: any = {
        full_name: fullName,
        username: normalizeUsername(formData.username),
        role: formData.role,
      };

      // Telegram ID необязателен - добавляем только если указан
      if (formData.telegram_id && formData.telegram_id.trim()) {
        normalizedFormData.telegram_id = formData.telegram_id.trim();
      }

      if (user) {
        // Режим редактирования
        await updateUser(user.id, normalizedFormData);
      } else {
        // Режим создания
        await createUser(normalizedFormData);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(user ? "Не удалось обновить пользователя" : "Не удалось создать пользователя");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field === "username") {
      // Для логина автоматически добавляем @ в начало
      const normalizedValue = normalizeUsername(value || "");
      setFormData((prev) => ({ ...prev, [field]: normalizedValue }));
    } else {
      // Убеждаемся, что значение всегда строка
      setFormData((prev) => ({ ...prev, [field]: value || "" }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 pb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black">
              {user ? "Редактировать пользователя" : "Добавить пользователя"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Закрыть"
            >
              <svg
                className="w-6 h-6 text-gray-600"
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Имя и Фамилия */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  value={formData.first_name || ""}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E1F5C6] focus:border-transparent text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Фамилия
                </label>
                <input
                  type="text"
                  value={formData.last_name || ""}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E1F5C6] focus:border-transparent text-black"
                />
              </div>
            </div>

            {/* Логин */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Логин
              </label>
              <input
                type="text"
                value={formData.username || ""}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder="@username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E1F5C6] focus:border-transparent text-black"
                required
              />
            </div>

            {/* Telegram ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telegram ID (необязательно)
              </label>
              <input
                type="text"
                value={formData.telegram_id || ""}
                onChange={(e) => handleChange("telegram_id", e.target.value)}
                placeholder="@username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E1F5C6] focus:border-transparent text-black"
              />
            </div>

            {/* Роль */}
            <div>
              <CustomSelect
                label="Роль"
                value={formData.role}
                onChange={(value) => handleChange("role", value)}
                options={roles}
                placeholder="Выберите роль"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Кнопки */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#E1F5C6] text-black rounded-lg hover:bg-[#d4e8b0] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Сохранение..." : "Сохранить"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

