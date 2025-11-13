"use client";

import { useEffect, useState } from "react";
import { getChartData, type ChartData } from "@/assets/api";

export default function ChartPage() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("week");

  useEffect(() => {
    // При первой загрузке сбрасываем на первый период
    setPeriod("week");
  }, []);

  useEffect(() => {
    // Загружаем данные при изменении периода
    loadChartData(period);
  }, [period]);

  const loadChartData = async (selectedPeriod: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getChartData(selectedPeriod);
      setChartData(data);
    } catch (err) {
      setError("Не удалось загрузить данные графика");
      console.error(err);
      // Fallback данные при ошибке
      setChartData([
        { date: "Пн", value: 0, label: "Пн" },
        { date: "Вт", value: 0, label: "Вт" },
        { date: "Ср", value: 0, label: "Ср" },
        { date: "Чт", value: 0, label: "Чт" },
        { date: "Пт", value: 0, label: "Пт" },
        { date: "Сб", value: 0, label: "Сб" },
        { date: "Вс", value: 0, label: "Вс" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const maxValue = 6; // Фиксированное максимальное значение

  const totalValue = chartData.reduce((sum, d) => sum + (d.value || 0), 0);
  const averageValue = chartData.length > 0 
    ? Math.round((totalValue / chartData.length) * 10) / 10
    : 0;

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

      <div className="px-4 pt-16 pb-16 relative z-10 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-black mb-16">График</h1>

        {/* Фильтры */}
        <div className="mb-16 flex gap-3">
          <button
            onClick={() => setPeriod("week")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              period === "week"
                ? "bg-[#E1F5C6] text-black"
                : "bg-white border border-gray-300 text-gray-700"
            }`}
          >
            Неделя
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              period === "month"
                ? "bg-[#E1F5C6] text-black"
                : "bg-white border border-gray-300 text-gray-700"
            }`}
          >
            Месяц
          </button>
          <button
            onClick={() => setPeriod("year")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              period === "year"
                ? "bg-[#E1F5C6] text-black"
                : "bg-white border border-gray-300 text-gray-700"
            }`}
          >
            Год
          </button>
        </div>

        {/* Состояние загрузки и ошибки */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Загрузка данных графика...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => loadChartData(period)}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* График */}
        {!loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-lg font-semibold text-black mb-6">Активность пользователей</h2>
            
            {/* График столбцов */}
            {chartData.length > 0 ? (
              <div className="relative">
                {/* Ось Y с метками */}
                <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500 pr-2 z-10">
                  <span>6</span>
                  <span>5</span>
                  <span>4</span>
                  <span>3</span>
                  <span>2</span>
                  <span>1</span>
                  <span>0</span>
                </div>
                
                {/* График с горизонтальной прокруткой для годового периода */}
                <div className={`ml-8 overflow-x-auto ${period === 'year' ? 'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100' : ''}`}>
                  <div className={`flex items-end ${period === 'year' ? 'gap-6 min-w-max' : 'justify-between gap-6'} h-48 border-b border-gray-200`}>
                    {chartData.map((data, index) => {
                      const value = data.value || 0;
                      const heightPercent = (value / maxValue) * 100;
                      return (
                        <div key={index} className={`flex flex-col items-center gap-2 h-full ${period === 'year' ? 'w-16 flex-shrink-0' : 'flex-1'}`}>
                          <div className="relative w-full h-full flex items-end justify-center">
                            {/* Столбик */}
                            <div
                              className="w-full bg-[#E1F5C6] rounded-t-lg transition-all hover:opacity-80 relative"
                              style={{
                                height: `${heightPercent}%`,
                                minHeight: value > 0 ? "4px" : "0px",
                              }}
                            >
                              {/* Цифра на столбике */}
                              {value > 0 && (
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-black whitespace-nowrap">
                                  {value}
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Подпись под столбиком */}
                          <span className="text-xs text-gray-600 mt-1 whitespace-nowrap">
                            {data.label || data.date || `День ${index + 1}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Нет данных для отображения</p>
              </div>
            )}
          </div>
        )}

        {/* Статистика */}
        {!loading && (
          <div className="mt-16 grid grid-cols-2 gap-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
              <p className="text-sm text-gray-600 mb-1">Всего активностей</p>
              <p className="text-2xl font-bold text-black">{totalValue}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
              <p className="text-sm text-gray-600 mb-1">Среднее значение</p>
              <p className="text-2xl font-bold text-black">{averageValue}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

