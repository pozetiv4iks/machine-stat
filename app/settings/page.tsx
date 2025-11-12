export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Настройки
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Управление настройками приложения
        </p>
      </div>

      <div className="space-y-6">
        {/* Общие настройки */}
        <div className="bg-white dark:bg-zinc-800 shadow rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
              Общие настройки
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Автоматическое обновление
                  </label>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Автоматически обновлять статистику
                  </p>
                </div>
                <button
                  type="button"
                  className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-zinc-200 dark:bg-zinc-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
                  role="switch"
                  aria-checked="true"
                >
                  <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Уведомления
                  </label>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Получать уведомления о событиях
                  </p>
                </div>
                <button
                  type="button"
                  className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-zinc-200 dark:bg-zinc-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
                  role="switch"
                  aria-checked="false"
                >
                  <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Настройки отображения */}
        <div className="bg-white dark:bg-zinc-800 shadow rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
              Отображение
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Интервал обновления
                </label>
                <select className="block w-full rounded-md border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 sm:text-sm py-2 px-3">
                  <option>1 секунда</option>
                  <option>5 секунд</option>
                  <option>10 секунд</option>
                  <option>30 секунд</option>
                  <option>1 минута</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Единицы измерения
                </label>
                <select className="block w-full rounded-md border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 sm:text-sm py-2 px-3">
                  <option>Метрические (GB, MB)</option>
                  <option>Бинарные (GiB, MiB)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Действия */}
        <div className="bg-white dark:bg-zinc-800 shadow rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
              Действия
            </h3>
            <div className="space-y-3">
              <button className="w-full sm:w-auto px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm font-medium">
                Сохранить изменения
              </button>
              <button className="w-full sm:w-auto sm:ml-3 px-4 py-2 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-600 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors text-sm font-medium">
                Сбросить настройки
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

