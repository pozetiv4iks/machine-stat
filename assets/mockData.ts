import { User, Checklist, ChartData, Chat, Message, Report } from './api';

export const mockUsers: User[] = [
  {
    id: 1,
    username: "ivan_ivanov",
    full_name: "Иван Иванов",
    role: "супер админ",
    telegram_id: "@ivan_ivanov",
    created_at: "2024-01-10T10:00:00Z",
  },
  {
    id: 2,
    username: "maria_petrova",
    full_name: "Мария Петрова",
    role: "админ",
    telegram_id: "@maria_petrova",
    created_at: "2024-01-12T14:30:00Z",
  },
  {
    id: 3,
    username: "petr_sidorov",
    full_name: "Петр Сидоров",
    role: "менеджмент",
    telegram_id: "@petr_sidorov",
    created_at: "2024-01-08T09:15:00Z",
  },
  {
    id: 4,
    username: "anna_kozlova",
    full_name: "Анна Козлова",
    role: "начальник отдела 1",
    telegram_id: "@anna_kozlova",
    created_at: "2024-01-15T11:20:00Z",
  },
  {
    id: 5,
    username: "sergey_volkov",
    full_name: "Сергей Волков",
    role: "начальник отдела 2",
    telegram_id: "@sergey_volkov",
    created_at: "2024-01-20T16:45:00Z",
  },
  {
    id: 6,
    username: "elena_smirnova",
    full_name: "Елена Смирнова",
    role: "проверяющий",
    telegram_id: "@elena_smirnova",
    created_at: "2024-01-18T13:00:00Z",
  },
];

export const mockChecklists: Checklist[] = [];

export const mockChartDataWeek: ChartData[] = [
  { date: "2024-01-15", value: 4, label: "Пн" },
  { date: "2024-01-16", value: 5, label: "Вт" },
  { date: "2024-01-17", value: 3, label: "Ср" },
  { date: "2024-01-18", value: 6, label: "Чт" },
  { date: "2024-01-19", value: 4, label: "Пт" },
  { date: "2024-01-20", value: 2, label: "Сб" },
  { date: "2024-01-21", value: 3, label: "Вс" },
];

export const mockChartDataMonth: ChartData[] = [
  { date: "2024-01-01", value: 5, label: "Неделя 1" },
  { date: "2024-01-08", value: 6, label: "Неделя 2" },
  { date: "2024-01-15", value: 4, label: "Неделя 3" },
  { date: "2024-01-22", value: 5, label: "Неделя 4" },
];

export const mockChartDataYear: ChartData[] = [
  { date: "2024-01", value: 5, label: "Янв" },
  { date: "2024-02", value: 6, label: "Фев" },
  { date: "2024-03", value: 4, label: "Мар" },
  { date: "2024-04", value: 5, label: "Апр" },
  { date: "2024-05", value: 6, label: "Май" },
  { date: "2024-06", value: 4, label: "Июн" },
  { date: "2024-07", value: 5, label: "Июл" },
  { date: "2024-08", value: 6, label: "Авг" },
  { date: "2024-09", value: 4, label: "Сен" },
  { date: "2024-10", value: 5, label: "Окт" },
  { date: "2024-11", value: 6, label: "Ноя" },
  { date: "2024-12", value: 4, label: "Дек" },
];

export const mockMessages: Message[] = [
  {
    id: 1,
    chat_id: 1,
    sender_id: 1,
    text: "Привет! Как дела?",
    created_at: "2024-01-22T10:00:00Z",
  },
  {
    id: 2,
    chat_id: 1,
    sender_id: 2,
    text: "Привет! Всё отлично, спасибо!",
    created_at: "2024-01-22T10:05:00Z",
  },
  {
    id: 3,
    chat_id: 1,
    sender_id: 1,
    text: "Отлично! Можешь помочь с проверкой оборудования?",
    created_at: "2024-01-22T10:10:00Z",
  },
  {
    id: 4,
    chat_id: 2,
    sender_id: 3,
    text: "Добрый день! Нужна помощь с чеклистом",
    created_at: "2024-01-22T11:00:00Z",
  },
  {
    id: 5,
    chat_id: 2,
    sender_id: 1,
    text: "Конечно, чем могу помочь?",
    created_at: "2024-01-22T11:05:00Z",
  },
  {
    id: 6,
    chat_id: 3,
    sender_id: 4,
    text: "Здравствуйте! Когда будет готов отчёт?",
    created_at: "2024-01-22T12:00:00Z",
  },
  {
    id: 7,
    chat_id: 3,
    sender_id: 1,
    text: "Отчёт будет готов к концу недели",
    created_at: "2024-01-22T12:15:00Z",
  },
];

export const mockChats: Chat[] = [
  {
    id: 1,
    user1_id: 1,
    user2_id: 2,
    last_message: mockMessages[2],
    unread_count: 0,
    created_at: "2024-01-20T09:00:00Z",
    updated_at: "2024-01-22T10:10:00Z",
  },
  {
    id: 2,
    user1_id: 1,
    user2_id: 3,
    last_message: mockMessages[4],
    unread_count: 1,
    created_at: "2024-01-21T10:00:00Z",
    updated_at: "2024-01-22T11:05:00Z",
  },
  {
    id: 3,
    user1_id: 1,
    user2_id: 4,
    last_message: mockMessages[6],
    unread_count: 0,
    created_at: "2024-01-19T08:00:00Z",
    updated_at: "2024-01-22T12:15:00Z",
  },
  {
    id: 4,
    user1_id: 1,
    user2_id: 5,
    last_message: undefined,
    unread_count: 0,
    created_at: "2024-01-18T14:00:00Z",
    updated_at: "2024-01-18T14:00:00Z",
  },
];

export const mockReports: Report[] = [];

