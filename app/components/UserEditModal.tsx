"use client";

import { useState, useEffect } from "react";
import { User, updateUser } from "@/assets/api";
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
    full_name: "",
    username: "",
    telegram_id: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        username: user.username || "",
        telegram_id: user.telegram_id || "",
        role: user.role || "",
      });
      setError(null);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateUser(user.id, formData);
      onSave();
      onClose();
    } catch (err) {
      setError("Не удалось обновить пользователя");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 pb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black">Редактировать пользователя</h2>
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
            {/* Имя */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Имя
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E1F5C6] focus:border-transparent"
                required
              />
            </div>

            {/* Логин */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Логин
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E1F5C6] focus:border-transparent"
                required
              />
            </div>

            {/* Telegram ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telegram ID
              </label>
              <input
                type="text"
                value={formData.telegram_id}
                onChange={(e) => handleChange("telegram_id", e.target.value)}
                placeholder="@username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E1F5C6] focus:border-transparent"
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

