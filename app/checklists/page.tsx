"use client";

import { useEffect, useState } from "react";
import { getChecklists, type Checklist } from "@/assets/api";

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

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
    return title.toLowerCase().includes(query) || description.toLowerCase().includes(query);
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
        <h1 className="text-2xl font-bold text-black mb-16">Чеклисты</h1>

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
              className="block w-full pl-10 pr-3 py-3 border border-black rounded-lg bg-white text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-[#E1F5C6] focus:border-transparent"
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
                  <button className="ml-4 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-black/20 shadow-sm">
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
              {expandedItems.has(checklist.id) && (
                <div className="px-4 pb-4 border-t border-gray-200">
                  <div className="pt-4 space-y-2">
                    {checklist.items && checklist.items.length > 0 ? (
                      checklist.items.map((item, index) => (
                        <div key={item.id || index} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.completed || false}
                            readOnly
                            className="w-4 h-4 text-[#E1F5C6] border-gray-300 rounded focus:ring-[#E1F5C6]"
                          />
                          <span className={`text-sm ${item.completed ? "line-through text-gray-500" : "text-gray-700"}`}>
                            {item.text}
                          </span>
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
    </div>
  );
}

