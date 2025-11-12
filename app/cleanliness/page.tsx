"use client";

export default function CleanlinessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 via-white to-white pb-20">
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold text-black mb-4">Чистота мест</h1>
        <p className="text-gray-600 mb-6">
          Мониторинг чистоты рабочих мест и оборудования
        </p>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-200">
            <h2 className="font-semibold text-black mb-2">Участок 1</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Статус:</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Чисто
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-200">
            <h2 className="font-semibold text-black mb-2">Участок 2</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Статус:</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                Требуется уборка
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-200">
            <h2 className="font-semibold text-black mb-2">Участок 3</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Статус:</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Чисто
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

