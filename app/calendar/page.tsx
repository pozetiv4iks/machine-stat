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
  monthRef?: React.RefObject<HTMLDivElement | null>;
  onDateClick: (date: Date) => void;
  getDepartmentsForDate: (date: Date) => any[];
}

function CalendarMonth({ year, month, monthName, today, monthRef, onDateClick, getDepartmentsForDate }: CalendarMonthProps) {
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

  // Получаем начало текущей недели (понедельник)
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Понедельник
    return new Date(d.setDate(diff));
  };

  // Получаем конец текущей недели (воскресенье)
  const getEndOfWeek = (date: Date) => {
    const start = getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Воскресенье
    return end;
  };

  // Проверяем, находится ли день в текущей неделе
  const isInCurrentWeek = (day: number | null) => {
    if (day === null) return false;
    const date = new Date(year, month, day);
    const weekStart = getStartOfWeek(today);
    const weekEnd = getEndOfWeek(today);
    
    // Сбрасываем время для корректного сравнения
    weekStart.setHours(0, 0, 0, 0);
    weekEnd.setHours(23, 59, 59, 999);
    date.setHours(0, 0, 0, 0);
    
    return date >= weekStart && date <= weekEnd;
  };

  // Проверяем заполненность дня
  const getDayStatus = (day: number | null) => {
    if (day === null || !isInCurrentWeek(day)) return null;
    
    const date = new Date(year, month, day);
    const departments = getDepartmentsForDate(date);
    
    // Проверяем, есть ли хотя бы одна встреча
    const hasMeeting = departments.some(dept => dept.meeting && dept.meeting.trim() !== "" && dept.meeting !== "Не назначена");
    if (hasMeeting) return "meeting"; // Есть встреча - фиолетовый
    
    // Проверяем, сколько отделов заполнено (поле inspector)
    const filledCount = departments.filter(dept => dept.inspector && dept.inspector.trim() !== "").length;
    const totalCount = departments.length;
    
    if (filledCount === 0) return "empty"; // Не заполнены
    if (filledCount === totalCount) return "full"; // Все заполнены
    return "partial"; // Частично заполнены
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

            const dayStatus = getDayStatus(day);
            const inCurrentWeek = isInCurrentWeek(day);

            return (
              <div
                key={index}
                onClick={handleClick}
                className={`aspect-square flex items-center justify-center text-lg font-medium transition-colors relative ${
                  day === null
                    ? "text-transparent"
                    : inCurrentWeek && dayStatus === "meeting"
                    ? "text-white"
                    : inCurrentWeek && dayStatus === "full"
                    ? "text-white"
                    : inCurrentWeek && dayStatus === "partial"
                    ? "text-black"
                    : inCurrentWeek && dayStatus === "empty"
                    ? "text-black"
                    : isWeekend(day)
                    ? "text-red-600"
                    : "text-black"
                } ${
                  day !== null && !inCurrentWeek
                    ? "hover:bg-gray-100 cursor-pointer rounded-lg"
                    : ""
                } ${
                  inCurrentWeek && (dayStatus === "full" || dayStatus === "partial" || dayStatus === "empty" || dayStatus === "meeting")
                    ? "cursor-pointer"
                    : ""
                }`}
              >
                <span className="relative z-10">{day}</span>
                {inCurrentWeek && dayStatus === "meeting" && (
                  <div className="absolute inset-0 bg-purple-500 rounded-full pointer-events-none" />
                )}
                {inCurrentWeek && dayStatus === "full" && (
                  <div className="absolute inset-0 bg-green-500 rounded-full pointer-events-none" />
                )}
                {inCurrentWeek && dayStatus === "partial" && (
                  <div className="absolute inset-0 bg-yellow-400 rounded-full pointer-events-none" />
                )}
                {inCurrentWeek && dayStatus === "empty" && (
                  <div className="absolute inset-0 border-2 border-gray-400 rounded-full pointer-events-none" />
                )}
                {isToday(day) && !inCurrentWeek && (
                  <div className="absolute inset-0 border-2 border-red-600 rounded-full pointer-events-none" />
                )}
                {isToday(day) && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-1 bg-green-500 rounded-full pointer-events-none z-10" style={{ bottom: '-7px' }} />
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
  const [refreshKey, setRefreshKey] = useState(0);

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

    // Иначе возвращаем дефолтные данные (пустые)
    return [
      {
        check: "Ежедневная проверка",
        inspector: "",
        meeting: "",
      },
      {
        check: "Ежедневная проверка",
        inspector: "",
        meeting: "",
      },
      {
        check: "Ежедневная проверка",
        inspector: "",
        meeting: "",
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
      // Обновляем календарь для перерисовки статусов дней
      setRefreshKey((prev) => prev + 1);
      
      // Создаем отчеты для отделов с назначенными проверяющими и чеклистами
      const { createReport, getChecklistById, getUsers } = await import("@/assets/api");
      const users = await getUsers();
      
      for (let i = 0; i < departments.length; i++) {
        const dept = departments[i];
        if (dept.inspector && dept.checklist_id) {
          // Находим ID проверяющего по имени
          const inspector = users.find(u => 
            u.full_name === dept.inspector || u.username === dept.inspector
          );
          
          if (inspector) {
            // Получаем чеклист
            const checklist = await getChecklistById(dept.checklist_id);
            
            // Создаем элементы отчета на основе чеклиста
            const reportItems = (checklist.items || []).map((item, index) => ({
              id: index + 1,
              checklist_item_id: item.id,
              text: item.text,
              completed: false,
              description: item.description,
              reference_image: item.reference_image,
            }));
            
            // Проверяем, существует ли уже отчет
            const { getReports } = await import("@/assets/api");
            const existingReports = await getReports(inspector.id);
            const existingReport = existingReports.find(r => 
              r.date === dateKey && 
              r.checklist_id === dept.checklist_id &&
              r.department_index === i
            );
            
            if (!existingReport) {
              // Создаем новый отчет
              await createReport({
                date: dateKey,
                inspector_id: inspector.id,
                checklist_id: dept.checklist_id,
                department_index: i,
                items: reportItems,
                status: "Не начато",
              });
            }
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20 relative overflow-hidden">
      {/* Мягкие размытые зеленые области на заднем плане */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Верхний левый угол */}
        <div
          className="absolute rounded-full bg-[#DBEDAE]"
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
          className="absolute rounded-full bg-[#DBEDAE]"
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

      <div className="px-4 pt-16 pb-16 relative z-10 max-w-4xl mx-auto">
        {/* Заголовок года */}
        <h1 className="text-3xl font-bold text-black mb-12 text-center">
          {currentYear}
        </h1>

        {/* Все месяцы года */}
        <div className="space-y-8" key={refreshKey}>
          {monthNames.map((monthName, index) => (
            <CalendarMonth
              key={index}
              year={currentYear}
              month={index}
              monthName={monthName}
              today={today}
              monthRef={index === currentMonth ? currentMonthRef : undefined}
              onDateClick={handleDateClick}
              getDepartmentsForDate={getDepartmentsForDate}
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

