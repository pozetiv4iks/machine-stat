"use client";

import { useState, useEffect } from "react";
import UserSelectModal from "./UserSelectModal";

interface DepartmentInfo {
  check: string;
  inspector: string;
  meeting: string;
}

interface DateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  departments: DepartmentInfo[];
  onSave?: (departments: DepartmentInfo[]) => void;
}

export default function DateDetailsModal({
  isOpen,
  onClose,
  date,
  departments,
  onSave,
}: DateDetailsModalProps) {
  const [editedDepartments, setEditedDepartments] = useState<DepartmentInfo[]>(departments);
  const [loading, setLoading] = useState(false);
  const [userSelectModal, setUserSelectModal] = useState<{
    isOpen: boolean;
    field: "inspector" | "meeting" | null;
    departmentIndex: number | null;
  }>({
    isOpen: false,
    field: null,
    departmentIndex: null,
  });

  useEffect(() => {
    setEditedDepartments(departments);
  }, [departments, isOpen]);

  if (!isOpen || !date) return null;

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const monthNames = [
      "Января",
      "Февраля",
      "Марта",
      "Апреля",
      "Мая",
      "Июня",
      "Июля",
      "Августа",
      "Сентября",
      "Октября",
      "Ноября",
      "Декабря",
    ];
    const month = monthNames[date.getMonth()];
    return `${day} ${month}`;
  };

  const handleDepartmentChange = (index: number, field: "inspector" | "meeting", value: string) => {
    const updated = [...editedDepartments];
    updated[index] = { ...updated[index], [field]: value };
    setEditedDepartments(updated);
  };

  const handleOpenUserSelect = (index: number, field: "inspector" | "meeting") => {
    setUserSelectModal({
      isOpen: true,
      field,
      departmentIndex: index,
    });
  };

  const handleSelectUser = (userName: string) => {
    if (userSelectModal.field !== null && userSelectModal.departmentIndex !== null) {
      handleDepartmentChange(userSelectModal.departmentIndex, userSelectModal.field, userName);
    }
    setUserSelectModal({
      isOpen: false,
      field: null,
      departmentIndex: null,
    });
  };

  const handleClearField = (index: number, field: "inspector" | "meeting") => {
    handleDepartmentChange(index, field, "");
  };

  const handleSave = async () => {
    if (onSave) {
      setLoading(true);
      try {
        await onSave(editedDepartments);
        onClose();
      } catch (error) {
        console.error("Ошибка при сохранении:", error);
      } finally {
        setLoading(false);
      }
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 pb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black">
              {formatDate(date)}
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

          <div className="space-y-6">
            {editedDepartments.map((dept, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h3 className="text-lg font-semibold text-black mb-4">
                  Отдел {index + 1}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Проверка
                    </label>
                    <p className="text-black">{dept.check}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Имя кто проводит
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenUserSelect(index, "inspector")}
                        className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E1F5C6] focus:border-transparent text-left ${
                          dept.inspector
                            ? "bg-white text-black"
                            : "bg-gray-50 text-gray-500"
                        }`}
                      >
                        {dept.inspector || "Не указано"}
                      </button>
                      {dept.inspector && (
                        <button
                          type="button"
                          onClick={() => handleClearField(index, "inspector")}
                          className="px-3 py-2 text-gray-500 hover:text-red-600 transition-colors"
                          aria-label="Очистить"
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Встреча
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenUserSelect(index, "meeting")}
                        className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E1F5C6] focus:border-transparent text-left ${
                          dept.meeting && dept.meeting !== "Не назначена"
                            ? "bg-white text-black"
                            : "bg-gray-50 text-gray-500"
                        }`}
                      >
                        {dept.meeting || "Не назначена"}
                      </button>
                      {dept.meeting && dept.meeting !== "Не назначена" && (
                        <button
                          type="button"
                          onClick={() => handleClearField(index, "meeting")}
                          className="px-3 py-2 text-gray-500 hover:text-red-600 transition-colors"
                          aria-label="Очистить"
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#E1F5C6] text-black rounded-lg hover:bg-[#d4e8b0] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </div>
      </div>

      {/* Модалка выбора пользователя */}
      <UserSelectModal
        isOpen={userSelectModal.isOpen}
        onClose={() =>
          setUserSelectModal({
            isOpen: false,
            field: null,
            departmentIndex: null,
          })
        }
        onSelect={handleSelectUser}
        title={
          userSelectModal.field === "inspector"
            ? "Выберите проверяющего"
            : "Выберите участника встречи"
        }
      />
    </div>
  );
}

