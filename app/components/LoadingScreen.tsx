'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { waitForUserInitialization } from './TelegramUserInitializer';

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
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
      
      <div className="relative z-10 flex items-center gap-4">
        {/* Логотип */}
        <div 
          className={`transition-all duration-700 ${
            showLogo 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-90'
          }`}
        >
          <Image 
            src="/sdamdf.png" 
            alt="Logo" 
            width={60} 
            height={60}
            className="object-contain"
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
    </div>
  );
}

