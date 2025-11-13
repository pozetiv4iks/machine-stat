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
      initData: typeof tg.initData === 'string' ? 'string' : !!tg.initData,
      initDataUnsafe: !!tg.initDataUnsafe,
      initDataRaw: typeof tg.initData === 'string' ? tg.initData.substring(0, 100) : undefined,
    });

    // Пробуем разные способы доступа к данным пользователя
    let userData = null;
    
    // Способ 1: initDataUnsafe.user
    if (tg.initDataUnsafe?.user) {
      userData = tg.initDataUnsafe.user;
      console.log('[Telegram] Found user in initDataUnsafe:', userData);
    }
    
    // Способ 2: initData.user (если initDataUnsafe не сработал)
    if (!userData && tg.initData?.user) {
      userData = tg.initData.user;
      console.log('[Telegram] Found user in initData:', userData);
    }
    
    // Способ 3: Прямой доступ к user
    if (!userData && tg.user) {
      userData = tg.user;
      console.log('[Telegram] Found user directly:', userData);
    }

    // Способ 4: Парсим initData строку, если она есть
    if (!userData && tg.initData && typeof tg.initData === 'string') {
      try {
        // initData может быть в формате query string
        const params = new URLSearchParams(tg.initData);
        const userParam = params.get('user');
        if (userParam) {
          userData = JSON.parse(decodeURIComponent(userParam));
          console.log('[Telegram] Parsed user from initData string (query param):', userData);
        } else {
          // Может быть просто JSON строка
          try {
            userData = JSON.parse(tg.initData);
            if (userData.user) {
              userData = userData.user;
            }
            console.log('[Telegram] Parsed user from initData string (JSON):', userData);
          } catch (e2) {
            console.log('[Telegram] Failed to parse initData as JSON:', e2);
          }
        }
      } catch (e) {
        console.log('[Telegram] Failed to parse initData string:', e);
      }
    }
    
    if (userData && userData.id) {
      const result = {
        id: userData.id,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        language_code: userData.language_code,
        is_premium: userData.is_premium,
      };
      console.log('[Telegram] Returning user data:', result);
      return result;
    }

    console.log('[Telegram] No user data found');
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

