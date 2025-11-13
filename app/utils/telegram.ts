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
 * Использует Telegram.WebApp.initDataUnsafe.user согласно документации Telegram Mini App
 */
export function getTelegramUser(): TelegramUser | null {
  if (typeof window === 'undefined') {
    console.log('[Telegram] window is undefined');
    return null;
  }

  try {
    // Проверяем наличие Telegram объекта
    const telegram = (window as any).Telegram;
    if (!telegram) {
      console.log('[Telegram] Telegram object not found');
      return null;
    }

    const tg = telegram.WebApp;
    if (!tg) {
      console.log('[Telegram] WebApp not found');
      return null;
    }

    // Инициализируем WebApp, если еще не инициализирован
    if (tg.ready && typeof tg.ready === 'function') {
      tg.ready();
    }

    console.log('[Telegram] WebApp found:', {
      version: tg.version,
      platform: tg.platform,
      initDataUnsafe: !!tg.initDataUnsafe,
      hasUser: !!tg.initDataUnsafe?.user,
    });

    // Основной способ получения данных пользователя согласно документации Telegram Mini App
    // Telegram.WebApp.initDataUnsafe.user содержит id и username
    const userData = tg.initDataUnsafe?.user;
    
    if (userData && userData.id) {
      const result = {
        id: userData.id,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        language_code: userData.language_code,
        is_premium: userData.is_premium,
      };
      console.log('[Telegram] User data from initDataUnsafe.user:', {
        id: result.id,
        username: result.username,
        first_name: result.first_name,
      });
      return result;
    }

    // Если основной способ не сработал, пробуем альтернативные
    console.log('[Telegram] initDataUnsafe.user not found, trying alternatives...');
    
    // Альтернативный способ 1: initData.user
    if (tg.initData?.user) {
      const altUserData = tg.initData.user;
      if (altUserData && altUserData.id) {
        console.log('[Telegram] Found user in initData.user:', altUserData);
        return {
          id: altUserData.id,
          username: altUserData.username,
          first_name: altUserData.first_name,
          last_name: altUserData.last_name,
          language_code: altUserData.language_code,
          is_premium: altUserData.is_premium,
        };
      }
    }

    // Альтернативный способ 2: Парсим initData строку, если она есть
    if (tg.initData && typeof tg.initData === 'string') {
      try {
        const params = new URLSearchParams(tg.initData);
        const userParam = params.get('user');
        if (userParam) {
          const parsedUser = JSON.parse(decodeURIComponent(userParam));
          if (parsedUser && parsedUser.id) {
            console.log('[Telegram] Parsed user from initData string:', parsedUser);
            return {
              id: parsedUser.id,
              username: parsedUser.username,
              first_name: parsedUser.first_name,
              last_name: parsedUser.last_name,
              language_code: parsedUser.language_code,
              is_premium: parsedUser.is_premium,
            };
          }
        }
      } catch (e) {
        console.log('[Telegram] Failed to parse initData string:', e);
      }
    }

    console.log('[Telegram] No user data found in any source');
    return null;
  } catch (error) {
    console.error('[Telegram] Error getting Telegram user:', error);
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
    const startTime = Date.now();
    
    const checkUser = () => {
      const user = getTelegramUser();
      if (user) {
        resolve(user);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        console.log('[Telegram] Timeout waiting for user data');
        resolve(null);
        return;
      }
      
      setTimeout(checkUser, 100);
    };
    
    checkUser();
  });
}

