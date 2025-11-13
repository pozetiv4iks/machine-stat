'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { waitForUserInitialization } from './TelegramUserInitializer';

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Получаем данные пользователя из Telegram Web App или sessionStorage
    const getUserInfo = () => {
      if (typeof window === 'undefined') return;

      try {
        // Приоритет: сначала пробуем получить из Telegram Web App (самый актуальный источник)
        const tg = (window as any).Telegram?.WebApp;
        
        // Проверяем наличие Telegram Web App
        if (tg) {
          // Пробуем разные способы доступа к данным
          const userData = tg.initDataUnsafe?.user || tg.initData?.user;
          
          if (userData) {
            const tgUserName = userData.username 
              ? `@${userData.username}` 
              : `@id${userData.id}`;
            
            if (tgUserName) {
              setUserName(tgUserName);
            }
            if (userData.id) {
              setUserId(userData.id.toString());
            }
            
            // Если получили данные из Telegram, выходим
            if (tgUserName || userData.id) {
              return;
            }
          }
        }

        // Если Telegram Web App недоступен, пробуем получить из sessionStorage
        const storedUserName = sessionStorage.getItem('current_user_name');
        const storedUserId = sessionStorage.getItem('current_user_id');

        if (storedUserName) {
          setUserName(storedUserName);
        }
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Error getting user info:', error);
        // В случае ошибки пробуем получить из sessionStorage
        const storedUserName = sessionStorage.getItem('current_user_name');
        const storedUserId = sessionStorage.getItem('current_user_id');
        if (storedUserName) setUserName(storedUserName);
        if (storedUserId) setUserId(storedUserId);
      }
    };

    // Получаем информацию о пользователе
    getUserInfo();

    // Периодически проверяем обновление данных (на случай, если они появятся позже)
    const checkInterval = setInterval(() => {
      getUserInfo();
    }, 500);

    // Логотип появляется сразу
    setShowLogo(true);
    
    // Текст появляется через 0.5 секунды
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 500);

    // Ждем инициализации пользователя, затем скрываем экран
    const initAndHide = async () => {
      try {
        // Ждем минимум 1 секунду для показа логотипа и текста
        await Promise.all([
          waitForUserInitialization(),
          new Promise(resolve => setTimeout(resolve, 1000))
        ]);
        
        // После инициализации обновляем данные пользователя
        getUserInfo();
      } catch (error) {
        console.error("Error waiting for user initialization:", error);
      } finally {
        // Начинаем исчезновение
        setIsFading(true);
        
        // Скрываем экран через 0.5 секунды после начала исчезновения
        setTimeout(() => {
          setIsVisible(false);
        }, 500);
      }
    };

    initAndHide();

    return () => {
      clearTimeout(textTimer);
      clearInterval(checkInterval);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-500 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Размытые зеленые круги на фоне */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#E1F5C6] rounded-full blur-3xl opacity-40 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#E1F5C6] rounded-full blur-3xl opacity-40 translate-x-1/2 translate-y-1/2" />
      
      <div className="relative z-10 flex items-center">
        {/* Логотип */}
        <div 
          className={`transition-all duration-700 -mr-2 ${
            showLogo 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-90'
          }`}
        >
          <Image 
            src="/logo.png" 
            alt="Logo" 
            width={200} 
            height={200}
            className="object-contain"
            priority
          />
        </div>

        {/* Текст */}
        <h1 
          className={`text-4xl font-bold text-gray-800 transition-all duration-700 ${
            showText 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 -translate-x-4'
          }`}
        >
          Miran MiniApp
        </h1>
      </div>

      {/* Информация о пользователе внизу */}
      {(userName || userId) && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-sm text-gray-600 space-y-1">
            {userName && (
              <div className="font-medium">
                Логин: <span className="text-gray-800">{userName}</span>
              </div>
            )}
            {userId && (
              <div className="font-medium">
                ID: <span className="text-gray-800">{userId}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

