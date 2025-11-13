"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getReportById, updateReport, getChecklistById, fileToBase64, type Report, type ReportItem } from "@/assets/api";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = parseInt(params.id as string);
  
  const [report, setReport] = useState<Report | null>(null);
  const [checklistTitle, setChecklistTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFinalModal, setShowFinalModal] = useState(false);

  useEffect(() => {
    if (reportId) {
      loadReport();
    }
  }, [reportId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const reportData = await getReportById(reportId);
      setReport(reportData);
      
      // Загружаем название чеклиста
      if (reportData.checklist_id) {
        const checklist = await getChecklistById(reportData.checklist_id);
        setChecklistTitle(checklist.title || "");
      }
    } catch (err) {
      setError("Не удалось загрузить отчет");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemToggle = (itemId: number) => {
    if (!report) return;
    
    const updatedItems = report.items.map(item => {
      if (item.id === itemId) {
        const newCompleted = !item.completed;
        // Если отмечаем как выполненное, удаляем фото
        return { 
          ...item, 
          completed: newCompleted,
          report_photo: newCompleted ? undefined : item.report_photo
        };
      }
      return item;
    });
    
    setReport({ ...report, items: updatedItems });
  };

  const handlePhotoChange = async (itemId: number, file: File | null) => {
    if (!report) return;

    if (file) {
      try {
        const base64 = await fileToBase64(file);
        const updatedItems = report.items.map(item =>
          item.id === itemId
            ? { ...item, report_photo: base64 }
            : item
        );
        setReport({ ...report, items: updatedItems });
      } catch (err) {
        console.error("Ошибка загрузки изображения:", err);
        setError("Не удалось загрузить изображение");
      }
    } else {
      const updatedItems = report.items.map(item =>
        item.id === itemId
          ? { ...item, report_photo: undefined }
          : item
      );
      setReport({ ...report, items: updatedItems });
    }
  };

  const handleSave = async () => {
    if (!report) return;

    // Проверяем, что для всех незавершенных пунктов есть фото
    const incompleteItems = report.items.filter(item => !item.completed);
    const itemsWithoutPhoto = incompleteItems.filter(item => !item.report_photo);
    
    if (itemsWithoutPhoto.length > 0) {
      setError("Для всех незавершенных пунктов необходимо приложить фото");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Подсчитываем баллы (количество выполненных пунктов)
      const completedCount = report.items.filter(item => item.completed).length;
      const score = completedCount;

      // Определяем статус на основе завершенных пунктов
      const allCompleted = report.items.every(item => item.completed);
      const someCompleted = report.items.some(item => item.completed);
      
      let newStatus = "Не начато";
      if (allCompleted) {
        newStatus = "Завершено";
      } else if (someCompleted) {
        newStatus = "В процессе";
      }

      if (!report.id) {
        throw new Error("Report ID is missing");
      }

      await updateReport(report.id, {
        ...report,
        status: newStatus,
        score: score,
      });

      // Показываем финальную модалку
      setShowFinalModal(true);
    } catch (err) {
      console.error("Ошибка сохранения отчета:", err);
      setError("Не удалось сохранить отчет");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-20 flex items-center justify-center">
        <p className="text-gray-500">Загрузка отчета...</p>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="min-h-screen bg-white pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push("/reports")}
            className="px-4 py-2 bg-[#DBEDAE] text-black rounded-lg hover:bg-[#DBEDAE]/80 transition-colors"
          >
            Вернуться к отчетам
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white pb-20 relative overflow-hidden">
      {/* Мягкие размытые зеленые области на заднем плане */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
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
        {/* Заголовок */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/reports")}
            className="mb-4 flex items-center text-gray-600 hover:text-black transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Назад к отчетам
          </button>
          <h1 className="text-2xl font-bold text-black mb-2">
            {checklistTitle || "Отчет"}
          </h1>
          <p className="text-gray-600">Дата: {formatDate(report.date)}</p>
          <p className="text-gray-600">Отдел {report.department_index + 1}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Пункты отчета */}
        <div className="space-y-4 mb-8">
          {report.items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => handleItemToggle(item.id)}
                  className="flex-shrink-0 mt-1"
                >
                  {item.completed ? (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className={`text-sm font-medium block ${item.completed ? "text-green-700" : "text-red-700"}`}>
                        {item.text}
                      </span>
                      {item.description && (
                        <p className={`text-xs mt-1 text-gray-600`}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Эталонное фото */}
                  {item.reference_image && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">Эталонное фото:</p>
                      <div className="w-full max-w-xs h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                        <img
                          src={item.reference_image}
                          alt="Эталонное фото"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Загрузка фото для незавершенных пунктов (крестик) */}
                  {!item.completed && (
                    <div className="mt-3">
                      <p className="text-xs text-red-600 mb-2 font-medium">Приложите фото (обязательно):</p>
                      {item.report_photo ? (
                        <div className="relative">
                          <div className="w-full max-w-xs h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center mb-2">
                            <img
                              src={item.report_photo}
                              alt="Фото отчета"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handlePhotoChange(item.id, null)}
                            className="text-sm text-red-500 hover:text-red-700"
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
                                handlePhotoChange(item.id, file);
                              }
                            }}
                            className="hidden"
                          />
                          <div className="border-2 border-dashed border-red-300 rounded-lg p-4 text-center cursor-pointer hover:border-red-400 transition-colors max-w-xs">
                            <svg
                              className="w-8 h-8 text-red-400 mx-auto mb-2"
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
                            <p className="text-sm text-red-600">Нажмите для загрузки фото</p>
                          </div>
                        </label>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Кнопка сохранения */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/reports")}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-[#DBEDAE] text-black rounded-lg hover:bg-[#DBEDAE]/80 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Сохранение..." : "Сохранить отчет"}
          </button>
        </div>
      </div>

      {/* Финальная модалка с результатами */}
      {showFinalModal && report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-black mb-4">Результаты проверки</h2>
              
              {/* Баллы */}
              <div className="mb-6 p-4 bg-[#DBEDAE] rounded-lg">
                <p className="text-lg font-semibold text-black">
                  Баллы: {report.score ?? report.items.filter(item => item.completed).length} / {report.items.length}
                </p>
              </div>

              {/* Список пунктов с результатами */}
              <div className="space-y-4 mb-6">
                {report.items.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      {/* Галочка или крестик */}
                      <div className="flex-shrink-0 mt-1">
                        {item.completed ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium block ${item.completed ? "text-green-700" : "text-red-700"}`}>
                          {item.text}
                        </span>
                        {item.description && (
                          <p className="text-xs mt-1 text-gray-600">
                            {item.description}
                          </p>
                        )}
                        
                        {/* Показываем фото только для незавершенных пунктов (крестик) */}
                        {!item.completed && item.report_photo && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-2">Приложенное фото:</p>
                            <div className="w-full max-w-xs h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                              <img
                                src={item.report_photo}
                                alt="Фото отчета"
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Кнопка закрытия */}
              <button
                onClick={() => {
                  setShowFinalModal(false);
                  router.push("/reports");
                }}
                className="w-full px-4 py-2 bg-[#DBEDAE] text-black rounded-lg hover:bg-[#DBEDAE]/80 transition-colors font-medium"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

