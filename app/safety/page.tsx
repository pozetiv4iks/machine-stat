"use client";

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 via-white to-white pb-20">
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold text-black mb-4">Безопасность</h1>
        <p className="text-gray-600 mb-6">
          Мониторинг показателей безопасности на производстве
        </p>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-200">
            <h2 className="font-semibold text-black mb-2">Пожарная безопасность</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Статус:</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Норма
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-200">
            <h2 className="font-semibold text-black mb-2">Техника безопасности</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Статус:</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Норма
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-200">
            <h2 className="font-semibold text-black mb-2">Экологический контроль</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Статус:</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Норма
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

