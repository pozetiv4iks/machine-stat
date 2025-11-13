"use client";

import { useState, useEffect } from "react";
import { createChecklist, updateChecklist, fileToBase64, type ChecklistItem, type Checklist } from "@/assets/api";

interface ChecklistCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  checklist?: Checklist | null; // Для режима редактирования
}

interface ChecklistItemForm {
  id: number;
  text: string;
  description: string;
  reference_image: string | null;
  imageFile: File | null;
}

export default function ChecklistCreateModal({
  isOpen,
  onClose,
  onSave,
  checklist,
}: ChecklistCreateModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // Всегда инициализируем с 6 пунктами
  const [items, setItems] = useState<ChecklistItemForm[]>([
    { id: 1, text: "", description: "", reference_image: null, imageFile: null },
    { id: 2, text: "", description: "", reference_image: null, imageFile: null },
    { id: 3, text: "", description: "", reference_image: null, imageFile: null },
    { id: 4, text: "", description: "", reference_image: null, imageFile: null },
    { id: 5, text: "", description: "", reference_image: null, imageFile: null },
    { id: 6, text: "", description: "", reference_image: null, imageFile: null },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!checklist;

  useEffect(() => {
    if (isOpen && checklist) {
      // Режим редактирования - заполняем форму данными чеклиста
      setTitle(checklist.title || "");
      // Обрабатываем description как строку или массив строк
      const descriptionValue = checklist.description || "";
      const descriptionStr = Array.isArray(descriptionValue) 
        ? descriptionValue.join('\n') 
        : descriptionValue;
      setDescription(descriptionStr);
      if (checklist.items && checklist.items.length > 0) {
        // Всегда должно быть 6 пунктов
        const mappedItems = checklist.items.map((item, index) => ({
          id: item.id || index + 1,
          text: item.text || "",
          description: item.description || "",
          reference_image: item.reference_image || null,
          imageFile: null,
        }));
        // Дополняем до 6 пунктов, если их меньше
        while (mappedItems.length < 6) {
          mappedItems.push({
            id: mappedItems.length + 1,
            text: "",
            description: "",
            reference_image: null,
            imageFile: null,
          });
        }
        // Обрезаем до 6 пунктов, если их больше
        setItems(mappedItems.slice(0, 6));
      } else {
        // Всегда 6 пунктов при создании
        setItems([
          { id: 1, text: "", description: "", reference_image: null, imageFile: null },
          { id: 2, text: "", description: "", reference_image: null, imageFile: null },
          { id: 3, text: "", description: "", reference_image: null, imageFile: null },
          { id: 4, text: "", description: "", reference_image: null, imageFile: null },
          { id: 5, text: "", description: "", reference_image: null, imageFile: null },
          { id: 6, text: "", description: "", reference_image: null, imageFile: null },
        ]);
      }
    } else if (isOpen && !checklist) {
      // Режим создания - очищаем форму, всегда 6 пунктов
      setTitle("");
      setDescription("");
      setItems([
        { id: 1, text: "", description: "", reference_image: null, imageFile: null },
        { id: 2, text: "", description: "", reference_image: null, imageFile: null },
        { id: 3, text: "", description: "", reference_image: null, imageFile: null },
        { id: 4, text: "", description: "", reference_image: null, imageFile: null },
        { id: 5, text: "", description: "", reference_image: null, imageFile: null },
        { id: 6, text: "", description: "", reference_image: null, imageFile: null },
      ]);
    }
  }, [isOpen, checklist]);

  if (!isOpen) return null;

  // Убрали возможность добавлять/удалять пункты - всегда должно быть ровно 6
  const handleAddItem = () => {
    // Нельзя добавлять - всегда 6 пунктов
    return;
  };

  const handleRemoveItem = (id: number) => {
    // Нельзя удалять - всегда должно быть 6 пунктов
    return;
  };

  const handleItemChange = (id: number, field: keyof ChecklistItemForm, value: string | File | null) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, [field]: value }
        : item
    ));
  };

  const handleImageChange = async (id: number, file: File | null) => {
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        handleItemChange(id, "reference_image", base64);
        handleItemChange(id, "imageFile", file);
      } catch (err) {
        console.error("Ошибка загрузки изображения:", err);
        setError("Не удалось загрузить изображение");
      }
    } else {
      handleItemChange(id, "reference_image", null);
      handleItemChange(id, "imageFile", null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError("Введите название чеклиста");
      return;
    }

    // Проверяем, что все 6 пунктов заполнены
    if (items.length !== 6) {
      setError("Чеклист должен содержать ровно 6 пунктов");
      return;
    }
    
    const validItems = items.filter(item => item.text.trim());
    if (validItems.length !== 6) {
      setError("Все 6 пунктов чеклиста должны быть заполнены");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Конвертируем форму в формат API
      const checklistItems: ChecklistItem[] = await Promise.all(
        validItems.map(async (item, index) => ({
          id: index + 1,
          text: item.text.trim(),
          completed: false,
          description: item.description.trim() || undefined,
          reference_image: item.reference_image || undefined,
        }))
      );

      if (isEditMode && checklist) {
        // Режим редактирования
        await updateChecklist(checklist.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          items: checklistItems,
        });
      } else {
        // Режим создания
        await createChecklist({
          title: title.trim(),
          description: description.trim() || undefined,
          items: checklistItems,
          status: "Не начато",
        });
      }

      // Сброс формы
      setTitle("");
      setDescription("");
      setItems([{ id: 1, text: "", description: "", reference_image: null, imageFile: null }]);
      onSave();
      onClose();
    } catch (err) {
      console.error("Ошибка сохранения чеклиста:", err);
      setError(isEditMode ? "Не удалось обновить чеклист" : "Не удалось создать чеклист");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle("");
      setDescription("");
      setItems([{ id: 1, text: "", description: "", reference_image: null, imageFile: null }]);
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/30 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col mx-4">
        {/* Заголовок */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">
            {isEditMode ? "Редактировать чеклист" : "Создать чеклист"}
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

        {/* Форма */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Название чеклиста */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-2">
              Название чеклиста *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DBEDAE] focus:border-transparent text-black"
              placeholder="Введите название"
              disabled={loading}
              required
            />
          </div>

          {/* Описание чеклиста */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-2">
              Описание (необязательно)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DBEDAE] focus:border-transparent text-black resize-none"
              placeholder="Введите описание"
              rows={2}
              disabled={loading}
            />
          </div>

          {/* Пункты чеклиста */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-black">
                Пункты чеклиста * (всего 6)
              </label>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Пункт {index + 1}
                    </span>
                  </div>

                  {/* Текст пункта */}
                  <div className="mb-3">
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => handleItemChange(item.id, "text", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DBEDAE] focus:border-transparent text-black text-sm"
                      placeholder="Текст пункта *"
                      disabled={loading}
                    />
                  </div>

                  {/* Описание пункта */}
                  <div className="mb-3">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DBEDAE] focus:border-transparent text-black text-sm"
                      placeholder="Описание (необязательно, в несколько слов)"
                      disabled={loading}
                    />
                  </div>

                  {/* Эталонное фото */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Эталонное фото (необязательно)
                    </label>
                    {item.reference_image ? (
                      <div className="relative">
                        <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-2 flex items-center justify-center">
                          <img
                            src={item.reference_image}
                            alt="Эталонное фото"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleImageChange(item.id, null)}
                          disabled={loading}
                          className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          Удалить фото
                        </button>
                      </div>
                    ) : (
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) {
                              handleImageChange(item.id, file);
                            }
                          }}
                          disabled={loading}
                          className="hidden"
                        />
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-[#DBEDAE] transition-colors disabled:opacity-50">
                          <svg
                            className="w-8 h-8 text-gray-400 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="text-sm text-gray-600">
                            Нажмите для загрузки фото
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Кнопки */}
        <div className="px-6 py-4 -mt-5 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-[#DBEDAE] text-black rounded-lg hover:bg-[#DBEDAE]/80 transition-colors disabled:opacity-50 font-medium"
          >
            {loading ? (isEditMode ? "Сохранение..." : "Создание...") : (isEditMode ? "Сохранить" : "Создать")}
          </button>
        </div>
      </div>
    </div>
  );
}

