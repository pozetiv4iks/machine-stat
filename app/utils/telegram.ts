/**
 * Утилиты для работы с Telegram Web App
 */

export interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  is_premium?: boolean;
}

/**
 * Получает данные пользователя из Telegram Web App
 */
export function getTelegramUser(): TelegramUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) {
      return null;
    }

    // Инициализируем WebApp
    if (tg.ready && typeof tg.ready === 'function') {
      tg.ready();
    }

    // Получаем данные пользователя
    const userData = tg.initDataUnsafe?.user;
    
    if (userData && userData.id) {
      return {
        id: userData.id,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        language_code: userData.language_code,
        is_premium: userData.is_premium,
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Получает userName из данных Telegram пользователя
 */
export function getTelegramUserName(): string | null {
  const user = getTelegramUser();
  if (!user) {
    return null;
  }

  return user.username 
    ? `@${user.username}` 
    : `@id${user.id}`;
}

/**
 * Получает Telegram Web App объект
 */
export function getTelegramWebApp(): any {
  if (typeof window === 'undefined') {
    return null;
  }

  return (window as any).Telegram?.WebApp || null;
}

/**
 * Проверяет, доступен ли Telegram Web App и есть ли данные пользователя
 */
export function isTelegramWebAppAvailable(): boolean {
  return getTelegramUser() !== null;
}

/**
 * Ожидает готовности Telegram Web App и возвращает данные пользователя
 */
export function waitForTelegramUser(timeout: number = 5000): Promise<TelegramUser | null> {
  return new Promise((resolve) => {
    // Проверяем сразу
    const user = getTelegramUser();
    if (user) {
      resolve(user);
      return;
    }

    // Если не найдено, ждем появления объекта Telegram
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      const user = getTelegramUser();
      if (user) {
        clearInterval(checkInterval);
        resolve(user);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        resolve(null);
      }
    }, 50);
  });
}

