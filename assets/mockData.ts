import { User, Checklist, ChartData } from './api';

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

export const mockChecklists: Checklist[] = [
  {
    id: 1,
    title: "Ежедневная проверка оборудования",
    description: "Проверка работоспособности основного оборудования",
    status: "Выполнено",
    created_at: "2024-01-15T08:00:00Z",
    updated_at: "2024-01-15T18:00:00Z",
    items: [
      { id: 1, text: "Проверка температуры", completed: true },
      { id: 2, text: "Проверка давления", completed: true },
      { id: 3, text: "Осмотр на утечки", completed: true },
      { id: 4, text: "Проверка смазки", completed: true },
    ],
  },
  {
    id: 2,
    title: "Еженедельная проверка безопасности",
    description: "Комплексная проверка систем безопасности",
    status: "В процессе",
    created_at: "2024-01-16T09:00:00Z",
    updated_at: "2024-01-16T14:30:00Z",
    items: [
      { id: 5, text: "Проверка огнетушителей", completed: true },
      { id: 6, text: "Проверка аварийных выходов", completed: true },
      { id: 7, text: "Проверка сигнализации", completed: false },
      { id: 8, text: "Проверка освещения", completed: false },
    ],
  },
  {
    id: 3,
    title: "Месячная проверка качества",
    description: "Контроль качества продукции и оборудования",
    status: "Не начато",
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-20T10:00:00Z",
    items: [
      { id: 9, text: "Проверка качества продукции", completed: false },
      { id: 10, text: "Калибровка оборудования", completed: false },
      { id: 11, text: "Проверка документации", completed: false },
      { id: 12, text: "Аудит процессов", completed: false },
    ],
  },
  {
    id: 4,
    title: "Ежедневная уборка производственных помещений",
    description: "Поддержание чистоты на рабочем месте",
    status: "Выполнено",
    created_at: "2024-01-21T07:00:00Z",
    updated_at: "2024-01-21T19:00:00Z",
    items: [
      { id: 13, text: "Уборка полов", completed: true },
      { id: 14, text: "Очистка оборудования", completed: true },
      { id: 15, text: "Вынос мусора", completed: true },
    ],
  },
];

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

