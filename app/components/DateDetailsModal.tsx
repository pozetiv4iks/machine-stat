"use client";

import { useState, useEffect } from "react";
import UserSelectModal from "./UserSelectModal";
import { getChecklists, type Checklist } from "@/assets/api";

interface DepartmentInfo {
  check: string;
  inspector: string;
  meeting: string;
  checklist_id?: number;
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
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [checklistsLoading, setChecklistsLoading] = useState(false);
  const [userSelectModal, setUserSelectModal] = useState<{
    isOpen: boolean;
    field: "inspector" | "meeting" | null;
    departmentIndex: number | null;
  }>({
    isOpen: false,
    field: null,
    departmentIndex: null,
  });
  const [checklistSelectModal, setChecklistSelectModal] = useState<{
    isOpen: boolean;
    departmentIndex: number | null;
  }>({
    isOpen: false,
    departmentIndex: null,
  });

  useEffect(() => {
    setEditedDepartments(departments);
  }, [departments, isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadChecklists();
    }
  }, [isOpen]);

  const loadChecklists = async () => {
    try {
      setChecklistsLoading(true);
      const data = await getChecklists();
      setChecklists(data);
    } catch (err) {
      console.error("Ошибка загрузки чеклистов:", err);
    } finally {
      setChecklistsLoading(false);
    }
  };

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

  const handleDepartmentChange = (index: number, field: "inspector" | "meeting" | "checklist_id" | "check", value: string | number | undefined) => {
    const updated = [...editedDepartments];
    updated[index] = { ...updated[index], [field]: value };
    setEditedDepartments(updated);
  };

  const handleOpenChecklistSelect = (index: number) => {
    setChecklistSelectModal({
      isOpen: true,
      departmentIndex: index,
    });
  };

  const handleSelectChecklist = (checklistId: number) => {
    if (checklistSelectModal.departmentIndex !== null) {
      const checklist = checklists.find(c => c.id === checklistId);
      if (checklist) {
        handleDepartmentChange(checklistSelectModal.departmentIndex, "checklist_id", checklistId);
        handleDepartmentChange(checklistSelectModal.departmentIndex, "check", checklist.title || "");
      }
    }
    setChecklistSelectModal({
      isOpen: false,
      departmentIndex: null,
    });
  };

  const handleClearChecklist = (index: number) => {
    handleDepartmentChange(index, "checklist_id", undefined);
    handleDepartmentChange(index, "check", "Ежедневная проверка");
  };

  const getChecklistName = (checklistId?: number) => {
    if (!checklistId) return "Ежедневная проверка";
    const checklist = checklists.find(c => c.id === checklistId);
    return checklist?.title || "Ежедневная проверка";
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
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
                      Чеклист для проверки
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenChecklistSelect(index)}
                        disabled={checklistsLoading}
                        className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DBEDAE] focus:border-transparent text-left ${
                          dept.checklist_id
                            ? "bg-white text-black"
                            : "bg-gray-50 text-gray-500"
                        } disabled:opacity-50`}
                      >
                        {getChecklistName(dept.checklist_id)}
                      </button>
                      {dept.checklist_id && (
                        <button
                          type="button"
                          onClick={() => handleClearChecklist(index)}
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
                      Имя кто проводит
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenUserSelect(index, "inspector")}
                        className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DBEDAE] focus:border-transparent text-left ${
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
                        className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DBEDAE] focus:border-transparent text-left ${
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
              className="flex-1 px-4 py-2 bg-[#DBEDAE] text-black rounded-lg hover:bg-[#DBEDAE]/80 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
        excludeUser={
          userSelectModal.field && userSelectModal.departmentIndex !== null
            ? editedDepartments
                .map((dept, idx) => 
                  idx !== userSelectModal.departmentIndex 
                    ? (userSelectModal.field === "inspector" ? dept.inspector : dept.meeting)
                    : null
                )
                .filter(Boolean)
            : []
        }
      />

      {/* Модалка выбора чеклиста */}
      {checklistSelectModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
          <div
            className="fixed inset-0 z-40"
            onClick={() =>
              setChecklistSelectModal({
                isOpen: false,
                departmentIndex: null,
              })
            }
          />
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto relative z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-black">Выберите чеклист</h3>
                <button
                  onClick={() =>
                    setChecklistSelectModal({
                      isOpen: false,
                      departmentIndex: null,
                    })
                  }
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
              {checklistsLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Загрузка чеклистов...</p>
                </div>
              ) : checklists.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Нет доступных чеклистов</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {checklists.map((checklist) => (
                    <button
                      key={checklist.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectChecklist(checklist.id);
                      }}
                      className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-[#DBEDAE]/20 hover:border-[#DBEDAE] transition-colors"
                    >
                      <p className="font-medium text-black">{checklist.title || "Без названия"}</p>
                      {checklist.description && (
                        <p className="text-sm text-gray-600 mt-1">{checklist.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

