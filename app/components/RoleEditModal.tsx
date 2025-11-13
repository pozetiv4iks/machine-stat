"use client";

import { useState, useEffect } from "react";
import { updateRole, createRole, type Role } from "@/assets/api";

interface RoleEditModalProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  type: "role" | "department";
}

export default function RoleEditModal({
  role,
  isOpen,
  onClose,
  onSave,
  type,
}: RoleEditModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!role;

  useEffect(() => {
    if (isOpen && role) {
      setName(role.name || "");
    } else if (isOpen && !role) {
      setName("");
    }
  }, [isOpen, role]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError(`Введите название ${type === "role" ? "роли" : "отдела"}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditMode && role) {
        await updateRole(role.id, {
          name: name.trim(),
          type: type,
        });
      } else {
        await createRole({
          name: name.trim(),
          type: type,
        });
      }

      setName("");
      onSave();
      onClose();
    } catch (err) {
      console.error("Ошибка сохранения:", err);
      setError(isEditMode ? "Не удалось обновить" : "Не удалось создать");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName("");
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-black">
              {isEditMode 
                ? `Редактировать ${type === "role" ? "роль" : "отдел"}` 
                : `Создать ${type === "role" ? "роль" : "отдел"}`}
            </h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >
              <svg
                className="w-6 h-6 text-black"
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

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">
                Название {type === "role" ? "роли" : "отдела"} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DBEDAE] focus:border-transparent text-black"
                placeholder={`Введите название ${type === "role" ? "роли" : "отдела"}`}
                disabled={loading}
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#DBEDAE] text-black rounded-lg hover:bg-[#DBEDAE]/80 transition-colors disabled:opacity-50 font-medium"
              >
                {loading ? (isEditMode ? "Сохранение..." : "Создание...") : (isEditMode ? "Сохранить" : "Создать")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

