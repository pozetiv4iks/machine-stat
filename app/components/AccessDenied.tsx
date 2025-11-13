"use client";

import { useEffect, useState } from 'react';

export default function AccessDenied() {
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Получаем данные пользователя из sessionStorage или Telegram Web App
    const getUserInfo = () => {
      if (typeof window === 'undefined') return;

      // Сначала пробуем получить из sessionStorage
      const storedUserName = sessionStorage.getItem('current_user_name');
      const storedUserId = sessionStorage.getItem('current_user_id');

      if (storedUserName) {
        setUserName(storedUserName);
      }
      if (storedUserId) {
        setUserId(storedUserId);
      }

      // Если нет в sessionStorage, пробуем получить из Telegram Web App
      if (!storedUserName || !storedUserId) {
        const tg = (window as any).Telegram?.WebApp;
        if (tg?.initDataUnsafe?.user) {
          const telegramUser = tg.initDataUnsafe.user;
          const tgUserName = telegramUser.username 
            ? `@${telegramUser.username}` 
            : `@id${telegramUser.id}`;
          
          if (!storedUserName) {
            setUserName(tgUserName);
          }
          if (!storedUserId && telegramUser.id) {
            setUserId(telegramUser.id.toString());
          }
        }
      }
    };

    getUserInfo();
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
      {/* Размытые зеленые круги на фоне */}
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

      <div className="relative z-10 text-center px-4">
        <div className="mb-8">
          <svg
            className="w-24 h-24 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Простите, у вас нет доступа
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Обратитесь к администратору для получения доступа к приложению
        </p>
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

