"use client";

import { useEffect, useState } from "react";
import { getReports, getUsers, type Report, type User } from "@/assets/api";
import Link from "next/link";

const CURRENT_USER_ID = 6; // ID проверяющего (Елена Смирнова)

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Загружаем текущего пользователя
      const users = await getUsers();
      const user = users.find(u => u.id === CURRENT_USER_ID);
      setCurrentUser(user || null);

      // Проверяем, является ли пользователь проверяющим
      if (user?.role === "проверяющий") {
        const data = await getReports(CURRENT_USER_ID);
        setReports(data);
      } else {
        setReports([]);
      }
    } catch (err) {
      setError("Не удалось загрузить отчеты");
      console.error(err);
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("завершено") || statusLower.includes("completed")) {
      return "bg-green-100 text-green-700";
    }
    if (statusLower.includes("процесс") || statusLower.includes("progress")) {
      return "bg-yellow-100 text-yellow-700";
    }
    return "bg-gray-100 text-gray-700";
  };

  // Если пользователь не проверяющий, не показываем отчеты
  if (currentUser && currentUser.role !== "проверяющий") {
    return (
      <div className="min-h-screen bg-white pb-20 relative overflow-hidden">
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
          <h1 className="text-2xl font-bold text-black mb-16">Отчеты</h1>
          <div className="text-center py-20">
            <p className="text-gray-600">У вас нет доступа к отчетам</p>
            <p className="text-sm text-gray-500 mt-2">Отчеты доступны только для проверяющих</p>
          </div>
        </div>
      </div>
    );
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
        <h1 className="text-2xl font-bold text-black mb-16">Отчеты</h1>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Загрузка отчетов...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-[#DBEDAE] text-black rounded-lg hover:bg-[#DBEDAE]/80 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">У вас пока нет отчетов</p>
            <p className="text-sm text-gray-400">Отчеты появятся после назначения проверок в календаре</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-black text-lg">
                      Отчет от {formatDate(report.date)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Отдел {report.department_index + 1}
                    </p>
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

