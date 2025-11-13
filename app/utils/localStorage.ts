// Утилита для работы с localStorage
// Все данные сохраняются в localStorage для сохранения при обновлении страницы

import { User, Checklist, Report, Role, ChartData } from '@/assets/api';

const STORAGE_KEYS = {
  USERS: 'app_users',
  CHECKLISTS: 'app_checklists',
  REPORTS: 'app_reports',
  ROLES: 'app_roles',
  CURRENT_ROLE: 'app_current_role',
  CHART_DATA_WEEK: 'app_chart_data_week',
  CHART_DATA_MONTH: 'app_chart_data_month',
  CHART_DATA_YEAR: 'app_chart_data_year',
};

// Users
export function saveUsersToStorage(users: User[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users to localStorage:', error);
  }
}

export function getUsersFromStorage(): User[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading users from localStorage:', error);
    return [];
  }
}

export function addUserToStorage(user: User): void {
  const users = getUsersFromStorage();
  const existingIndex = users.findIndex(u => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  saveUsersToStorage(users);
}

export function removeUserFromStorage(userId: number): void {
  const users = getUsersFromStorage();
  const filtered = users.filter(u => u.id !== userId);
  saveUsersToStorage(filtered);
}

// Checklists
export function saveChecklistsToStorage(checklists: Checklist[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(checklists));
  } catch (error) {
    console.error('Error saving checklists to localStorage:', error);
  }
}

export function getChecklistsFromStorage(): Checklist[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHECKLISTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading checklists from localStorage:', error);
    return [];
  }
}

export function addChecklistToStorage(checklist: Checklist): void {
  const checklists = getChecklistsFromStorage();
  const existingIndex = checklists.findIndex(c => c.id === checklist.id);
  if (existingIndex >= 0) {
    checklists[existingIndex] = checklist;
  } else {
    checklists.push(checklist);
  }
  saveChecklistsToStorage(checklists);
}

export function removeChecklistFromStorage(checklistId: number): void {
  const checklists = getChecklistsFromStorage();
  const filtered = checklists.filter(c => c.id !== checklistId);
  saveChecklistsToStorage(filtered);
}

// Reports
export function saveReportsToStorage(reports: Report[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  } catch (error) {
    console.error('Error saving reports to localStorage:', error);
  }
}

export function getReportsFromStorage(): Report[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading reports from localStorage:', error);
    return [];
  }
}

export function addReportToStorage(report: Report): void {
  const reports = getReportsFromStorage();
  const existingIndex = reports.findIndex(r => r.id === report.id);
  if (existingIndex >= 0) {
    reports[existingIndex] = report;
  } else {
    reports.push(report);
  }
  saveReportsToStorage(reports);
}

export function removeReportFromStorage(reportId: number): void {
  const reports = getReportsFromStorage();
  const filtered = reports.filter(r => r.id !== reportId);
  saveReportsToStorage(filtered);
}

// Roles
export function saveRolesToStorage(roles: Role[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
  } catch (error) {
    console.error('Error saving roles to localStorage:', error);
  }
}

export function getRolesFromStorage(): Role[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ROLES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading roles from localStorage:', error);
    return [];
  }
}

// Current Role (для переключения между интерфейсами)
export function setCurrentRole(role: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, role);
    sessionStorage.setItem('current_user_role', role);
  } catch (error) {
    console.error('Error saving current role:', error);
  }
}

export function getCurrentRole(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE) || sessionStorage.getItem('current_user_role');
  } catch (error) {
    console.error('Error reading current role:', error);
    return null;
  }
}

// Chart Data
export function saveChartDataToStorage(period: string, data: ChartData[]): void {
  if (typeof window === 'undefined') return;
  try {
    const key = period === 'week' ? STORAGE_KEYS.CHART_DATA_WEEK :
                period === 'month' ? STORAGE_KEYS.CHART_DATA_MONTH :
                STORAGE_KEYS.CHART_DATA_YEAR;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving chart data to localStorage:', error);
  }
}

export function getChartDataFromStorage(period: string): ChartData[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = period === 'week' ? STORAGE_KEYS.CHART_DATA_WEEK :
                period === 'month' ? STORAGE_KEYS.CHART_DATA_MONTH :
                STORAGE_KEYS.CHART_DATA_YEAR;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading chart data from localStorage:', error);
    return [];
  }
}

// Инициализация данных из моков, если localStorage пуст
export function initializeStorageFromMocks(): void {
  if (typeof window === 'undefined') return;
  
  // Инициализируем только если данных нет
  if (getUsersFromStorage().length === 0) {
    const { mockUsers } = require('@/assets/mockData');
    saveUsersToStorage(mockUsers);
  }
  
  if (getChecklistsFromStorage().length === 0) {
    const { mockChecklists } = require('@/assets/mockData');
    saveChecklistsToStorage(mockChecklists);
  }
  
  if (getReportsFromStorage().length === 0) {
    const { mockReports } = require('@/assets/mockData');
    saveReportsToStorage(mockReports);
  }
  
  if (getRolesFromStorage().length === 0) {
    const { mockRoles } = require('@/assets/mockData');
    saveRolesToStorage(mockRoles);
  }
  
  // Инициализируем данные графиков
  if (getChartDataFromStorage('week').length === 0) {
    const { mockChartDataWeek } = require('@/assets/mockData');
    saveChartDataToStorage('week', mockChartDataWeek);
  }
  
  if (getChartDataFromStorage('month').length === 0) {
    const { mockChartDataMonth } = require('@/assets/mockData');
    saveChartDataToStorage('month', mockChartDataMonth);
  }
  
  if (getChartDataFromStorage('year').length === 0) {
    const { mockChartDataYear } = require('@/assets/mockData');
    saveChartDataToStorage('year', mockChartDataYear);
  }
  
  // Устанавливаем роль по умолчанию, если не установлена
  if (!getCurrentRole()) {
    setCurrentRole('супер админ');
  }
}

