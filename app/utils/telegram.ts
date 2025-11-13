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

    // Пробуем разные способы доступа к данным пользователя
    const userData = tg.initDataUnsafe?.user || tg.initData?.user;
    
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
    console.error('Error getting Telegram user:', error);
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

