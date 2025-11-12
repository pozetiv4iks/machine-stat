export default function StatsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Статистика
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Просмотр статистики и метрик системы
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Статистические карточки */}
        <div className="bg-white dark:bg-zinc-800 overflow-hidden shadow rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate">
                    CPU Usage
                  </dt>
                  <dd className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    45%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 overflow-hidden shadow rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate">
                    Memory
                  </dt>
                  <dd className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    62%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 overflow-hidden shadow rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate">
                    Disk Usage
                  </dt>
                  <dd className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    78%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 overflow-hidden shadow rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate">
                    Network
                  </dt>
                  <dd className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    1.2 GB/s
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* График или таблица */}
      <div className="mt-8 bg-white dark:bg-zinc-800 shadow rounded-lg border border-zinc-200 dark:border-zinc-700">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
            Детальная статистика
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-zinc-200 dark:border-zinc-700">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Время работы системы
              </span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                5 дней 12 часов
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-zinc-200 dark:border-zinc-700">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Активные процессы
              </span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                127
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-zinc-200 dark:border-zinc-700">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Температура CPU
              </span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                52°C
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Скорость вентилятора
              </span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                2400 RPM
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

