"use client";

import React, { useEffect, useRef, useState } from "react";
import DateDetailsModal from "../components/DateDetailsModal";

const monthNames = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface CalendarMonthProps {
  year: number;
  month: number;
  monthName: string;
  today: Date;
  monthRef?: React.RefObject<HTMLDivElement>;
  onDateClick: (date: Date) => void;
}

function CalendarMonth({ year, month, monthName, today, monthRef, onDateClick }: CalendarMonthProps) {
  // Получаем первый день месяца и количество дней
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();
  // Преобразуем воскресенье (0) в 6 для нашей недели, начинающейся с понедельника
  const startingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

  // Создаем массив дней для календаря
  const days = [];
  
  // Добавляем пустые ячейки для дней до начала месяца
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  
  // Добавляем все дни месяца
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  // Определяем, является ли день выходным (суббота или воскресенье)
  const isWeekend = (day: number | null) => {
    if (day === null) return false;
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 = воскресенье, 6 = суббота
  };

  // Определяем, является ли день сегодняшним днем
  const isToday = (day: number | null) => {
    if (day === null) return false;
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    );
  };


  return (
    <div ref={monthRef} className="mb-12">
      {/* Заголовок месяца */}
      <h2 className="text-2xl font-bold text-black mb-6 text-center">
        {monthName}
      </h2>

      {/* Календарь */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Дни недели */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Дни месяца */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const handleClick = () => {
              if (day !== null) {
                const date = new Date(year, month, day);
                onDateClick(date);
              }
            };

            return (
              <div
                key={index}
                onClick={handleClick}
                className={`aspect-square flex items-center justify-center text-lg font-medium rounded-lg transition-colors relative ${
                  day === null
                    ? "text-transparent"
                    : isWeekend(day)
                    ? "text-red-600"
                    : "text-black"
                } ${
                  day !== null
                    ? "hover:bg-gray-100 cursor-pointer"
                    : ""
                }`}
              >
                {day}
                {isToday(day) && (
                  <div className="absolute inset-0 border-2 border-red-600 rounded-full pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentMonthRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Прокручиваем к текущему месяцу при монтировании
  useEffect(() => {
    if (currentMonthRef.current) {
      setTimeout(() => {
        currentMonthRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, []);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const [departmentsData, setDepartmentsData] = useState<{ [key: string]: any[] }>({});

  // Моковые данные для отделов (в реальном приложении это будет из API)
  const getDepartmentsForDate = (date: Date) => {
    const dateKey = date.toISOString().split("T")[0];
    
    // Если есть сохраненные данные для этой даты, используем их
    if (departmentsData[dateKey]) {
      return departmentsData[dateKey];
    }

    // Иначе возвращаем дефолтные данные
    return [
      {
        check: "Ежедневная проверка",
        inspector: "Иван Иванов",
        meeting: "Не назначена",
      },
      {
        check: "Ежедневная проверка",
        inspector: "Мария Петрова",
        meeting: "Сергей Волков",
      },
      {
        check: "Ежедневная проверка",
        inspector: "Петр Сидоров",
        meeting: "Не назначена",
      },
    ];
  };

  const handleSaveDepartments = async (departments: any[]) => {
    if (selectedDate) {
      const dateKey = selectedDate.toISOString().split("T")[0];
      setDepartmentsData((prev) => ({
        ...prev,
        [dateKey]: departments,
      }));
      // Здесь можно добавить вызов API для сохранения данных
      // await saveDateDepartments(selectedDate, departments);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20 relative overflow-hidden">
      {/* Мягкие размытые зеленые области на заднем плане */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Верхний левый угол */}
        <div
          className="absolute rounded-full bg-[#E1F5C6]"
          style={{
            width: "700px",
            height: "700px",
            filter: "blur(100px)",
            opacity: 0.4,
            top: "-250px",
            left: "-250px",
          }}
        />
        {/* Нижний правый угол */}
        <div
          className="absolute rounded-full bg-[#E1F5C6]"
          style={{
            width: "700px",
            height: "700px",
            filter: "blur(100px)",
            opacity: 0.4,
            bottom: "-250px",
            right: "-250px",
          }}
        />
      </div>

      <div className="px-12 pt-16 pb-16 relative z-10 max-w-4xl mx-auto">
        {/* Заголовок года */}
        <h1 className="text-3xl font-bold text-black mb-12 text-center">
          {currentYear}
        </h1>

        {/* Все месяцы года */}
        <div className="space-y-8">
          {monthNames.map((monthName, index) => (
            <CalendarMonth
              key={index}
              year={currentYear}
              month={index}
              monthName={monthName}
              today={today}
              monthRef={index === currentMonth ? currentMonthRef : undefined}
              onDateClick={handleDateClick}
            />
          ))}
        </div>
      </div>

      {/* Модальное окно с подробностями даты */}
      <DateDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        date={selectedDate}
        departments={selectedDate ? getDepartmentsForDate(selectedDate) : []}
        onSave={handleSaveDepartments}
      />
    </div>
  );
}

