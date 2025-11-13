"use client";

import { useEffect, useState } from "react";
import { getChecklists, deleteChecklist, type Checklist } from "@/assets/api";
import ChecklistCreateModal from "../components/ChecklistCreateModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);
  const [checklistToDelete, setChecklistToDelete] = useState<Checklist | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getChecklists();
      setChecklists(data);
    } catch (err) {
      setError("Не удалось загрузить чеклисты");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredChecklists = checklists.filter((checklist) => {
    const query = searchQuery.toLowerCase();
    const title = checklist.title || "";
    const description = checklist.description || "";
    // Обрабатываем description как строку или массив строк
    const descriptionStr = Array.isArray(description) 
      ? description.join(' ') 
      : description;
    return title.toLowerCase().includes(query) || descriptionStr.toLowerCase().includes(query);
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Дата не указана";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ru-RU");
    } catch {
      return dateString;
    }
  };

  const getStatusDisplay = (status?: string) => {
    if (!status) return "Не начато";
    return status;
  };

  const getStatusColor = (status?: string) => {
    const statusLower = (status || "").toLowerCase();
    if (statusLower.includes("выполнено") || statusLower.includes("completed")) {
      return "bg-green-100 text-green-700";
    }
    if (statusLower.includes("процесс") || statusLower.includes("progress")) {
      return "bg-yellow-100 text-yellow-700";
    }
    return "bg-gray-100 text-gray-700";
  };

  const handleEditChecklist = (checklist: Checklist, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChecklist(checklist);
  };

  const handleDeleteChecklist = (checklist: Checklist, e: React.MouseEvent) => {
    e.stopPropagation();
    setChecklistToDelete(checklist);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!checklistToDelete) return;

    try {
      setDeleting(true);
      await deleteChecklist(checklistToDelete.id);
      setIsDeleteModalOpen(false);
      setChecklistToDelete(null);
      loadChecklists();
    } catch (err) {
      console.error("Не удалось удалить чеклист", err);
      alert("Не удалось удалить чеклист");
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleting) {
      setIsDeleteModalOpen(false);
      setChecklistToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20 relative overflow-hidden">
      {/* Мягкие размытые зеленые области на заднем плане */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Верхний левый угол */}
        <div 
          className="absolute rounded-full bg-[#DBEDAE]"
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
          className="absolute rounded-full bg-[#DBEDAE]"
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

      <div className="px-4 pt-16 pb-16 relative z-10 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-16">
          <h1 className="text-2xl font-bold text-black">Чеклисты</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-[#DBEDAE] text-black rounded-lg hover:bg-[#DBEDAE]/80 transition-colors font-medium flex items-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Создать чеклист
          </button>
        </div>

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
              placeholder="Поиск чеклистов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-black rounded-lg bg-white text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-[#DBEDAE] focus:border-transparent"
            />
          </div>
        </div>

        {/* Состояние загрузки и ошибки */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Загрузка чеклистов...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadChecklists}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Список чеклистов */}
        {!loading && !error && (
          <div className="space-y-8">
            {filteredChecklists.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  {searchQuery ? "Чеклисты не найдены" : "Нет чеклистов"}
                </p>
              </div>
            ) : (
              filteredChecklists.map((checklist) => (
            <div
              key={checklist.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => toggleItem(checklist.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-black text-lg">
                      {checklist.title || "Без названия"}
                    </h3>
                    {checklist.description && (
                      <p className="text-sm text-gray-600 mt-1">{checklist.description}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      Дата: {formatDate(checklist.created_at)}
                    </p>
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(checklist.status)}`}>
                        {getStatusDisplay(checklist.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => handleEditChecklist(checklist, e)}
                      className="w-8 h-8 bg-[#DBEDAE] rounded-full flex items-center justify-center hover:bg-[#DBEDAE]/80 transition-colors"
                      title="Редактировать"
                    >
                      <svg
                        className="w-4 h-4 text-black"
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
                    <button
                      onClick={(e) => handleDeleteChecklist(checklist, e)}
                      className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                      title="Удалить"
                    >
                      <svg
                        className="w-4 h-4 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                    <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-black/20 shadow-sm">
                      <svg
                        className={`w-4 h-4 text-black transition-transform ${
                          expandedItems.has(checklist.id) ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              {expandedItems.has(checklist.id) && (
                <div className="px-4 pb-4 border-t border-gray-200">
                  <div className="pt-4 space-y-4">
                    {checklist.items && checklist.items.length > 0 ? (
                      checklist.items.map((item, index) => (
                        <div key={item.id || index} className="border border-gray-200 rounded-lg p-3 bg-white">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={item.completed || false}
                              readOnly
                              className="w-4 h-4 text-[#DBEDAE] border-gray-300 rounded focus:ring-[#DBEDAE] mt-1 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <span className={`text-sm font-medium block ${item.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                                {item.text}
                              </span>
                              {item.description && (
                                <p className={`text-xs mt-1 text-gray-600 ${item.completed ? "line-through" : ""}`}>
                                  {item.description}
                                </p>
                              )}
                              {item.reference_image && (
                                <div className="mt-2 w-full max-w-xs h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                  <img
                                    src={item.reference_image}
                                    alt={`Эталонное фото для: ${item.text}`}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Нет пунктов в чеклисте</p>
                    )}
                  </div>
                </div>
              )}
            </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Модальное окно создания/редактирования чеклиста */}
      <ChecklistCreateModal
        isOpen={isCreateModalOpen || !!editingChecklist}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingChecklist(null);
        }}
        onSave={loadChecklists}
        checklist={editingChecklist}
      />

      {/* Модальное окно подтверждения удаления */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Удалить чеклист?"
        message={`Вы уверены, что хотите удалить чеклист "${checklistToDelete?.title || ""}"? Это действие нельзя отменить.`}
        loading={deleting}
      />
    </div>
  );
}

