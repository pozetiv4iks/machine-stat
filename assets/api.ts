const API_BASE_URL = 'https://miran-hackathon.onrender.com';
const USE_MOCK_DATA = false; // Принудительное использование моковых данных (если true, API не вызывается)
const USE_API_FIRST = true; // Сначала пытаться использовать API, при ошибке - моковые данные

import { 
  mockUsers, 
  mockChecklists, 
  mockChartDataWeek, 
  mockChartDataMonth, 
  mockChartDataYear,
  mockChats,
  mockMessages,
  mockReports,
  mockRoles
} from './mockData';

// API Response interfaces (matching the actual API)
export interface UserResponse {
  id?: number | null;
  first_name: string;
  last_name: string;
  user_name: string;
  role: string;
}

export interface UserAccessResponse {
  has_access: boolean;
  message: string;
  user: UserResponse | null;
}

// Internal User interface (for app compatibility)
export interface User {
  id: number;
  username?: string;
  full_name?: string;
  role?: string;
  telegram_id?: string;
  created_at?: string;
  // API fields
  first_name?: string;
  last_name?: string;
  user_name?: string;
}

// API Response interfaces (matching the actual API)
export interface ChecklistResponse {
  id: number;
  name: string;
  description: string[]; // Array of strings in API
}

// Internal Checklist interface (for app compatibility)
export interface Checklist {
  id: number;
  title?: string;
  name?: string; // API field
  description?: string | string[]; // Can be string or array
  items?: ChecklistItem[];
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChecklistItem {
  id: number;
  text: string;
  completed: boolean;
  description?: string;
  reference_image?: string; // URL или base64 строка для эталонного фото
}

export interface ChartData {
  date: string;
  value: number;
  label?: string;
}

export interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  text: string;
  created_at: string;
}

export interface Chat {
  id: number;
  user1_id: number;
  user2_id: number;
  last_message?: Message;
  unread_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ReportItem {
  id: number;
  checklist_item_id: number;
  text: string;
  completed: boolean;
  description?: string;
  reference_image?: string; // Эталонное фото из чеклиста
  report_photo?: string; // Фото, приложенное проверяющим
}

export interface Report {
  id: number;
  date: string;
  inspector_id: number;
  checklist_id: number;
  department_index: number;
  items: ReportItem[];
  status: string; // "Не начато", "В процессе", "Завершено"
  score?: number; // Баллы (количество выполненных пунктов)
  created_at: string;
  updated_at: string;
}

// API Response interfaces (matching the actual API)
export interface RoleResponse {
  name: string;
  description?: string | null;
}

export interface DepartmentResponse {
  id: number;
  name: string;
  description?: string | null;
}

// Internal Role interface (for app compatibility)
export interface Role {
  id?: number;
  name: string;
  type?: "role" | "department"; // "role" для ролей, "department" для отделов
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Internal Department interface
export interface Department {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Adapter functions to convert between API format and internal format
function adaptUserFromAPI(apiUser: UserResponse): User {
  return {
    id: apiUser.id || 0,
    username: apiUser.user_name,
    full_name: `${apiUser.first_name} ${apiUser.last_name}`.trim(),
    role: apiUser.role,
    first_name: apiUser.first_name,
    last_name: apiUser.last_name,
    user_name: apiUser.user_name,
  };
}

function adaptUserToAPI(user: Partial<User>): Partial<UserResponse> {
  // If user has first_name and last_name, use them
  if (user.first_name && user.last_name) {
    return {
      first_name: user.first_name,
      last_name: user.last_name,
      user_name: user.user_name || user.username || '',
      role: user.role || '',
    };
  }
  // Otherwise, try to split full_name
  if (user.full_name) {
    const parts = user.full_name.trim().split(/\s+/);
    const first = parts[0] || '';
    const last = parts.slice(1).join(' ') || '';
    return {
      first_name: first,
      last_name: last,
      user_name: user.user_name || user.username || '',
      role: user.role || '',
    };
  }
  // Fallback
  return {
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    user_name: user.user_name || user.username || '',
    role: user.role || '',
  };
}

// Helper function to get mock users
function getMockUsers(): User[] {
  return [...mockUsers];
}

// Users API
export async function getUsers(): Promise<User[]> {
  if (USE_MOCK_DATA) {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 500));
    return getMockUsers();
  }

  if (USE_API_FIRST) {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

      const data: UserResponse[] = await response.json();
      return Array.isArray(data) ? data.map(adaptUserFromAPI) : [];
  } catch (error) {
      console.warn('API request failed, using mock data:', error);
      // При ошибке используем моковые данные
      await new Promise(resolve => setTimeout(resolve, 300));
      return getMockUsers();
    }
  }

  // Fallback на моковые данные
  await new Promise(resolve => setTimeout(resolve, 500));
  return getMockUsers();
}

export async function getUserById(id: number): Promise<User> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return { ...user };
  }

  // Note: API uses user_name as identifier, but we'll try to find by id first
  // This is a limitation - we need user_name to fetch from API
  // Fallback на моковые данные
  console.warn('getUserById requires user_name in real API, using mock data');
  await new Promise(resolve => setTimeout(resolve, 300));
  const user = mockUsers.find(u => u.id === id);
  if (!user) {
    throw new Error(`User with id ${id} not found`);
  }
  return { ...user };
}

// Check user access (for Telegram Mini App)
export async function checkUserAccess(userName: string): Promise<UserAccessResponse> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = mockUsers.find(u => u.username === userName || u.user_name === userName);
    return {
      has_access: !!user,
      message: user ? "User found" : "User not found",
      user: user ? {
        id: user.id,
        first_name: user.first_name || user.full_name?.split(' ')[0] || '',
        last_name: user.last_name || user.full_name?.split(' ').slice(1).join(' ') || '',
        user_name: user.user_name || user.username || '',
        role: user.role || '',
      } : null,
    };
  }

  if (USE_API_FIRST) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/check-access?user_name=${encodeURIComponent(userName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check user access: ${response.statusText}`);
      }

      const data: UserAccessResponse = await response.json();
      return data;
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      const user = mockUsers.find(u => u.username === userName || u.user_name === userName);
      return {
        has_access: !!user,
        message: user ? "User found" : "User not found",
        user: user ? {
          id: user.id,
          first_name: user.first_name || user.full_name?.split(' ')[0] || '',
          last_name: user.last_name || user.full_name?.split(' ').slice(1).join(' ') || '',
          user_name: user.user_name || user.username || '',
          role: user.role || '',
        } : null,
      };
    }
  }

  // Fallback на моковые данные
  await new Promise(resolve => setTimeout(resolve, 300));
  const user = mockUsers.find(u => u.username === userName || u.user_name === userName);
  return {
    has_access: !!user,
    message: user ? "User found" : "User not found",
    user: user ? {
      id: user.id,
      first_name: user.first_name || user.full_name?.split(' ')[0] || '',
      last_name: user.last_name || user.full_name?.split(' ').slice(1).join(' ') || '',
      user_name: user.user_name || user.username || '',
      role: user.role || '',
    } : null,
  };
}

export async function getUserByUsername(userName: string): Promise<User> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = mockUsers.find(u => u.username === userName || u.user_name === userName);
    if (!user) {
      throw new Error(`User with username ${userName} not found`);
    }
    return { ...user };
  }

  if (USE_API_FIRST) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userName)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

      const data: UserResponse = await response.json();
      return adaptUserFromAPI(data);
  } catch (error) {
      console.warn('API request failed, using mock data:', error);
      // При ошибке используем моковые данные
      await new Promise(resolve => setTimeout(resolve, 300));
      const user = mockUsers.find(u => u.username === userName || u.user_name === userName);
      if (!user) {
        throw new Error(`User with username ${userName} not found`);
      }
      return { ...user };
    }
  }

  // Fallback на моковые данные
  await new Promise(resolve => setTimeout(resolve, 300));
  const user = mockUsers.find(u => u.username === userName || u.user_name === userName);
  if (!user) {
    throw new Error(`User with username ${userName} not found`);
  }
  return { ...user };
}

export async function createUser(userData: Partial<User>): Promise<User> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Генерируем новый ID
    const newId = Math.max(...mockUsers.map(u => u.id), 0) + 1;
    const newUser: User = {
      id: newId,
      username: userData.username || "",
      full_name: userData.full_name || "",
      role: userData.role || "",
      telegram_id: userData.telegram_id || "",
      created_at: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return { ...newUser };
  }

  if (USE_API_FIRST) {
  try {
      const apiData = adaptUserToAPI(userData);
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
        body: JSON.stringify(apiData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }

      const data: UserResponse = await response.json();
      return adaptUserFromAPI(data);
  } catch (error) {
      console.warn('API request failed, using mock data:', error);
      // При ошибке используем моковые данные
      await new Promise(resolve => setTimeout(resolve, 300));
      const newId = Math.max(...mockUsers.map(u => u.id), 0) + 1;
      const newUser: User = {
        id: newId,
        username: userData.username || "",
        full_name: userData.full_name || "",
        role: userData.role || "",
        telegram_id: userData.telegram_id || "",
        created_at: new Date().toISOString(),
      };
      mockUsers.push(newUser);
      return { ...newUser };
    }
  }

  // Fallback на моковые данные
  await new Promise(resolve => setTimeout(resolve, 300));
  const newId = Math.max(...mockUsers.map(u => u.id), 0) + 1;
  const newUser: User = {
    id: newId,
    username: userData.username || "",
    full_name: userData.full_name || "",
    role: userData.role || "",
    telegram_id: userData.telegram_id || "",
    created_at: new Date().toISOString(),
  };
  mockUsers.push(newUser);
  return { ...newUser };
}

export async function updateUser(id: number, userData: Partial<User>): Promise<User> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error(`User with id ${id} not found`);
    }
    // Обновляем моковые данные
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
    return { ...mockUsers[userIndex] };
  }

  // API uses user_name as identifier, so we need it
  // First try to get user_name from userData, then from existing user
  let userName = userData.user_name || userData.username;
  
  if (!userName) {
    // Try to get user by id to find user_name
    const users = await getUsers();
    const existingUser = users.find(u => u.id === id);
    if (existingUser) {
      userName = existingUser.user_name || existingUser.username;
    }
  }
  
  if (USE_API_FIRST && userName) {
    try {
      const apiData = adaptUserToAPI(userData);
      const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userName)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      const data: UserResponse = await response.json();
      return adaptUserFromAPI(data);
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      // При ошибке используем моковые данные
    }
  }

  // Fallback на моковые данные
  await new Promise(resolve => setTimeout(resolve, 300));
  const userIndex = mockUsers.findIndex(u => u.id === id);
  if (userIndex === -1) {
    throw new Error(`User with id ${id} not found`);
  }
  mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
  return { ...mockUsers[userIndex] };
}

// Initialize or update user from Telegram Mini App
export async function initializeUserFromTelegram(): Promise<User | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Get Telegram Web App data
    const tg = (window as any).Telegram?.WebApp;
    if (!tg?.initDataUnsafe?.user) {
      console.warn('Telegram Web App user data not available');
      return null;
    }

    const telegramUser = tg.initDataUnsafe.user;
    const userName = telegramUser.username 
      ? `@${telegramUser.username}` 
      : `@id${telegramUser.id}`;

    // Check user access
    const accessResponse = await checkUserAccess(userName);
    
    if (!accessResponse.has_access || !accessResponse.user) {
      console.warn('User does not have access:', accessResponse.message);
      return null;
    }

    // Prepare user data from Telegram
    const telegramUserData: Partial<User> = {
      user_name: userName,
      username: userName,
      first_name: telegramUser.first_name || '',
      last_name: telegramUser.last_name || '',
      full_name: [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' '),
      telegram_id: userName,
    };

    // Update user with Telegram data via PUT /users/{user_name}
    const updatedUser = await updateUserByUsername(userName, telegramUserData);
    
    return updatedUser;
  } catch (error) {
    console.error('Error initializing user from Telegram:', error);
    return null;
  }
}

// Update user by username (for Telegram Mini App)
export async function updateUserByUsername(userName: string, userData: Partial<User>): Promise<User> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const userIndex = mockUsers.findIndex(u => u.username === userName || u.user_name === userName);
    if (userIndex === -1) {
      throw new Error(`User with username ${userName} not found`);
    }
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
    return { ...mockUsers[userIndex] };
  }

  if (USE_API_FIRST) {
    try {
      const apiData = adaptUserToAPI({ ...userData, user_name: userName, username: userName });
      const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userName)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      const data: UserResponse = await response.json();
      return adaptUserFromAPI(data);
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      const userIndex = mockUsers.findIndex(u => u.username === userName || u.user_name === userName);
      if (userIndex === -1) {
        throw new Error(`User with username ${userName} not found`);
      }
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
      return { ...mockUsers[userIndex] };
    }
  }

  // Fallback на моковые данные
  await new Promise(resolve => setTimeout(resolve, 300));
  const userIndex = mockUsers.findIndex(u => u.username === userName || u.user_name === userName);
  if (userIndex === -1) {
    throw new Error(`User with username ${userName} not found`);
  }
  mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
  return { ...mockUsers[userIndex] };
}

export async function deleteUser(id: number): Promise<void> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error(`User with id ${id} not found`);
    }
    // Удаляем пользователя из моковых данных
    mockUsers.splice(userIndex, 1);
    return;
  }

  // API uses user_name as identifier, so we need to get user first
  const users = await getUsers();
  const user = users.find(u => u.id === id);
  if (!user) {
    throw new Error(`User with id ${id} not found`);
  }

  const userName = user.user_name || user.username;
  
  if (USE_API_FIRST && userName) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userName)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }
      return; // Успешно удалено через API
  } catch (error) {
      console.warn('API request failed, using mock data:', error);
      // При ошибке используем моковые данные
    }
  }

  // Fallback на моковые данные
  await new Promise(resolve => setTimeout(resolve, 300));
  const userIndex = mockUsers.findIndex(u => u.id === id);
  if (userIndex === -1) {
    throw new Error(`User with id ${id} not found`);
  }
  mockUsers.splice(userIndex, 1);
}

// Adapter functions for Checklists
function adaptChecklistFromAPI(apiChecklist: ChecklistResponse): Checklist {
  // API возвращает description как массив строк, нужно преобразовать в items
  const items: ChecklistItem[] = apiChecklist.description.map((desc, index) => {
    // Пытаемся распарсить описание, если оно содержит JSON с дополнительными полями
    try {
      const parsed = JSON.parse(desc);
      return {
        id: index + 1,
        text: parsed.text || desc,
        completed: false,
        description: parsed.description,
        reference_image: parsed.reference_image,
      };
    } catch {
      // Если не JSON, просто используем как текст
      return {
        id: index + 1,
        text: desc,
        completed: false,
      };
    }
  });

  return {
    id: apiChecklist.id,
    name: apiChecklist.name,
    title: apiChecklist.name, // Для совместимости
    description: apiChecklist.description.join('\n'), // Для совместимости
    items: items,
  };
}

function adaptChecklistToAPI(checklist: Partial<Checklist>): Partial<ChecklistResponse> {
  // Преобразуем items в массив строк description
  let description: string[] = [];
  
  if (checklist.items && checklist.items.length > 0) {
    description = checklist.items.map(item => {
      // Если есть дополнительные поля, сохраняем как JSON
      if (item.description || item.reference_image) {
        return JSON.stringify({
          text: item.text,
          description: item.description,
          reference_image: item.reference_image,
        });
      }
      return item.text;
    });
  } else if (checklist.description) {
    // Если description строка, разбиваем по строкам
    if (typeof checklist.description === 'string') {
      description = checklist.description.split('\n').filter(Boolean);
    } else if (Array.isArray(checklist.description)) {
      description = checklist.description;
    }
  }

  return {
    name: checklist.name || checklist.title || '',
    description: description,
  };
}

// Checklists API
export async function getChecklists(): Promise<Checklist[]> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockChecklists];
  }

  if (USE_API_FIRST) {
  try {
      const response = await fetch(`${API_BASE_URL}/checklists/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch checklists: ${response.statusText}`);
    }

      const data: ChecklistResponse[] = await response.json();
      return Array.isArray(data) ? data.map(adaptChecklistFromAPI) : [];
  } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      return [...mockChecklists];
  }
  }

  await new Promise(resolve => setTimeout(resolve, 500));
  return [...mockChecklists];
}

export async function getChecklistById(id: number): Promise<Checklist> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const checklist = mockChecklists.find(c => c.id === id);
    if (!checklist) {
      throw new Error(`Checklist with id ${id} not found`);
    }
    return { ...checklist };
  }

  if (USE_API_FIRST) {
  try {
    const response = await fetch(`${API_BASE_URL}/checklists/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch checklist: ${response.statusText}`);
    }

      const data: ChecklistResponse = await response.json();
      return adaptChecklistFromAPI(data);
  } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      const checklist = mockChecklists.find(c => c.id === id);
      if (!checklist) {
        throw new Error(`Checklist with id ${id} not found`);
      }
      return { ...checklist };
    }
  }

  await new Promise(resolve => setTimeout(resolve, 300));
  const checklist = mockChecklists.find(c => c.id === id);
  if (!checklist) {
    throw new Error(`Checklist with id ${id} not found`);
  }
  return { ...checklist };
}

export async function createChecklist(checklistData: Partial<Checklist>): Promise<Checklist> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newId = Math.max(...mockChecklists.map(c => c.id), 0) + 1;
    const newChecklist: Checklist = {
      id: newId,
      title: checklistData.title || "",
      description: checklistData.description || "",
      items: checklistData.items || [],
      status: checklistData.status || "Не начато",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockChecklists.push(newChecklist);
    return { ...newChecklist };
  }

  if (USE_API_FIRST) {
    try {
      const apiData = adaptChecklistToAPI(checklistData);
      const response = await fetch(`${API_BASE_URL}/checklists/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
        body: JSON.stringify(apiData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create checklist: ${response.statusText}`);
    }

      const data: ChecklistResponse = await response.json();
      return adaptChecklistFromAPI(data);
  } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      const newId = Math.max(...mockChecklists.map(c => c.id), 0) + 1;
      const newChecklist: Checklist = {
        id: newId,
        title: checklistData.title || "",
        description: checklistData.description || "",
        items: checklistData.items || [],
        status: checklistData.status || "Не начато",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockChecklists.push(newChecklist);
      return { ...newChecklist };
    }
  }

  await new Promise(resolve => setTimeout(resolve, 300));
  const newId = Math.max(...mockChecklists.map(c => c.id), 0) + 1;
  const newChecklist: Checklist = {
    id: newId,
    title: checklistData.title || "",
    description: checklistData.description || "",
    items: checklistData.items || [],
    status: checklistData.status || "Не начато",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockChecklists.push(newChecklist);
  return { ...newChecklist };
}

// Функция для конвертации файла изображения в base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export async function updateChecklist(id: number, checklistData: Partial<Checklist>): Promise<Checklist> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const checklistIndex = mockChecklists.findIndex(c => c.id === id);
    if (checklistIndex === -1) {
      throw new Error(`Checklist with id ${id} not found`);
    }
    mockChecklists[checklistIndex] = {
      ...mockChecklists[checklistIndex],
      ...checklistData,
      updated_at: new Date().toISOString(),
    };
    return { ...mockChecklists[checklistIndex] };
  }

  if (USE_API_FIRST) {
    try {
      const apiData = adaptChecklistToAPI(checklistData);
    const response = await fetch(`${API_BASE_URL}/checklists/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
        body: JSON.stringify(apiData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update checklist: ${response.statusText}`);
    }

      const data: ChecklistResponse = await response.json();
      return adaptChecklistFromAPI(data);
  } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      const checklistIndex = mockChecklists.findIndex(c => c.id === id);
      if (checklistIndex === -1) {
        throw new Error(`Checklist with id ${id} not found`);
      }
      mockChecklists[checklistIndex] = {
        ...mockChecklists[checklistIndex],
        ...checklistData,
        updated_at: new Date().toISOString(),
      };
      return { ...mockChecklists[checklistIndex] };
    }
  }

  await new Promise(resolve => setTimeout(resolve, 300));
  const checklistIndex = mockChecklists.findIndex(c => c.id === id);
  if (checklistIndex === -1) {
    throw new Error(`Checklist with id ${id} not found`);
  }
  mockChecklists[checklistIndex] = {
    ...mockChecklists[checklistIndex],
    ...checklistData,
    updated_at: new Date().toISOString(),
  };
  return { ...mockChecklists[checklistIndex] };
}

export async function deleteChecklist(id: number): Promise<void> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const checklistIndex = mockChecklists.findIndex(c => c.id === id);
    if (checklistIndex === -1) {
      throw new Error(`Checklist with id ${id} not found`);
    }
    mockChecklists.splice(checklistIndex, 1);
    return;
  }

  if (USE_API_FIRST) {
    try {
      const response = await fetch(`${API_BASE_URL}/checklists/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete checklist: ${response.statusText}`);
      }
      return; // Успешно удалено через API
  } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      const checklistIndex = mockChecklists.findIndex(c => c.id === id);
      if (checklistIndex === -1) {
        throw new Error(`Checklist with id ${id} not found`);
      }
      mockChecklists.splice(checklistIndex, 1);
      return;
    }
  }

  await new Promise(resolve => setTimeout(resolve, 300));
  const checklistIndex = mockChecklists.findIndex(c => c.id === id);
  if (checklistIndex === -1) {
    throw new Error(`Checklist with id ${id} not found`);
  }
  mockChecklists.splice(checklistIndex, 1);
}

// Chart/Statistics API
export async function getChartData(period?: string): Promise<ChartData[]> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    switch (period) {
      case 'week':
        return [...mockChartDataWeek];
      case 'month':
        return [...mockChartDataMonth];
      case 'year':
        return [...mockChartDataYear];
      default:
        return [...mockChartDataWeek];
    }
  }

  if (USE_API_FIRST) {
  try {
    const url = period 
      ? `${API_BASE_URL}/statistics?period=${period}`
      : `${API_BASE_URL}/statistics`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch chart data: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      switch (period) {
        case 'week':
          return [...mockChartDataWeek];
        case 'month':
          return [...mockChartDataMonth];
        case 'year':
          return [...mockChartDataYear];
        default:
          return [...mockChartDataWeek];
      }
    }
  }

  await new Promise(resolve => setTimeout(resolve, 400));
  switch (period) {
    case 'week':
      return [...mockChartDataWeek];
    case 'month':
      return [...mockChartDataMonth];
    case 'year':
      return [...mockChartDataYear];
    default:
      return [...mockChartDataWeek];
  }
}

// Chats API
export async function getChats(userId?: number): Promise<Chat[]> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 400));
    let chats = [...mockChats];
    if (userId) {
      chats = chats.filter(chat => chat.user1_id === userId || chat.user2_id === userId);
    }
    return chats;
  }

  if (USE_API_FIRST) {
    try {
      const url = userId 
        ? `${API_BASE_URL}/chats?user_id=${userId}`
        : `${API_BASE_URL}/chats`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch chats: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      let chats = [...mockChats];
      if (userId) {
        chats = chats.filter(chat => chat.user1_id === userId || chat.user2_id === userId);
      }
      return chats;
    }
  }

  await new Promise(resolve => setTimeout(resolve, 400));
  let chats = [...mockChats];
  if (userId) {
    chats = chats.filter(chat => chat.user1_id === userId || chat.user2_id === userId);
  }
  return chats;
}

export async function getChatMessages(chatId: number): Promise<Message[]> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockMessages.filter(msg => msg.chat_id === chatId);
  }

  if (USE_API_FIRST) {
    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockMessages.filter(msg => msg.chat_id === chatId);
    }
  }

  await new Promise(resolve => setTimeout(resolve, 300));
  return mockMessages.filter(msg => msg.chat_id === chatId);
}

export async function sendMessage(chatId: number, senderId: number, text: string): Promise<Message> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newId = Math.max(...mockMessages.map(m => m.id), 0) + 1;
    const newMessage: Message = {
      id: newId,
      chat_id: chatId,
      sender_id: senderId,
      text,
      created_at: new Date().toISOString(),
    };
    mockMessages.push(newMessage);
    return { ...newMessage };
  }

  if (USE_API_FIRST) {
    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sender_id: senderId, text }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      const newId = Math.max(...mockMessages.map(m => m.id), 0) + 1;
      const newMessage: Message = {
        id: newId,
        chat_id: chatId,
        sender_id: senderId,
        text,
        created_at: new Date().toISOString(),
      };
      mockMessages.push(newMessage);
      return { ...newMessage };
    }
  }

  await new Promise(resolve => setTimeout(resolve, 300));
  const newId = Math.max(...mockMessages.map(m => m.id), 0) + 1;
  const newMessage: Message = {
    id: newId,
    chat_id: chatId,
    sender_id: senderId,
    text,
    created_at: new Date().toISOString(),
  };
  mockMessages.push(newMessage);
  return { ...newMessage };
}

// Reports API
export async function getReports(inspectorId?: number): Promise<Report[]> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 400));
    let reports = [...mockReports];
    if (inspectorId) {
      reports = reports.filter(report => report.inspector_id === inspectorId);
    }
    return reports;
  }

  if (USE_API_FIRST) {
    try {
      const url = inspectorId 
        ? `${API_BASE_URL}/reports?inspector_id=${inspectorId}`
        : `${API_BASE_URL}/reports`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      let reports = [...mockReports];
      if (inspectorId) {
        reports = reports.filter(report => report.inspector_id === inspectorId);
      }
      return reports;
    }
  }

  await new Promise(resolve => setTimeout(resolve, 400));
  let reports = [...mockReports];
  if (inspectorId) {
    reports = reports.filter(report => report.inspector_id === inspectorId);
  }
  return reports;
}

export async function getReportById(id: number): Promise<Report> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const report = mockReports.find(r => r.id === id);
    if (!report) {
      throw new Error(`Report with id ${id} not found`);
    }
    return { ...report };
  }

  if (USE_API_FIRST) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      const report = mockReports.find(r => r.id === id);
      if (!report) {
        throw new Error(`Report with id ${id} not found`);
      }
      return { ...report };
    }
  }

  await new Promise(resolve => setTimeout(resolve, 300));
  const report = mockReports.find(r => r.id === id);
  if (!report) {
    throw new Error(`Report with id ${id} not found`);
  }
  return { ...report };
}

export async function createReport(reportData: Partial<Report>): Promise<Report> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newId = Math.max(...mockReports.map(r => r.id), 0) + 1;
    const newReport: Report = {
      id: newId,
      date: reportData.date || new Date().toISOString().split('T')[0],
      inspector_id: reportData.inspector_id || 0,
      checklist_id: reportData.checklist_id || 0,
      department_index: reportData.department_index || 0,
      items: reportData.items || [],
      status: reportData.status || "Не начато",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockReports.push(newReport);
    return { ...newReport };
  }

  if (USE_API_FIRST) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create report: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      const newId = Math.max(...mockReports.map(r => r.id), 0) + 1;
      const newReport: Report = {
        id: newId,
        date: reportData.date || new Date().toISOString().split('T')[0],
        inspector_id: reportData.inspector_id || 0,
        checklist_id: reportData.checklist_id || 0,
        department_index: reportData.department_index || 0,
        items: reportData.items || [],
        status: reportData.status || "Не начато",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockReports.push(newReport);
      return { ...newReport };
    }
  }

  await new Promise(resolve => setTimeout(resolve, 300));
  const newId = Math.max(...mockReports.map(r => r.id), 0) + 1;
  const newReport: Report = {
    id: newId,
    date: reportData.date || new Date().toISOString().split('T')[0],
    inspector_id: reportData.inspector_id || 0,
    checklist_id: reportData.checklist_id || 0,
    department_index: reportData.department_index || 0,
    items: reportData.items || [],
    status: reportData.status || "Не начато",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockReports.push(newReport);
  return { ...newReport };
}

export async function updateReport(id: number, reportData: Partial<Report>): Promise<Report> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const reportIndex = mockReports.findIndex(r => r.id === id);
    if (reportIndex === -1) {
      throw new Error(`Report with id ${id} not found`);
    }
    mockReports[reportIndex] = {
      ...mockReports[reportIndex],
      ...reportData,
      updated_at: new Date().toISOString(),
    };
    return { ...mockReports[reportIndex] };
  }

  if (USE_API_FIRST) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update report: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      const reportIndex = mockReports.findIndex(r => r.id === id);
      if (reportIndex === -1) {
        throw new Error(`Report with id ${id} not found`);
      }
      mockReports[reportIndex] = {
        ...mockReports[reportIndex],
        ...reportData,
        updated_at: new Date().toISOString(),
      };
      return { ...mockReports[reportIndex] };
    }
  }

  await new Promise(resolve => setTimeout(resolve, 300));
  const reportIndex = mockReports.findIndex(r => r.id === id);
  if (reportIndex === -1) {
    throw new Error(`Report with id ${id} not found`);
  }
  mockReports[reportIndex] = {
    ...mockReports[reportIndex],
    ...reportData,
    updated_at: new Date().toISOString(),
  };
  return { ...mockReports[reportIndex] };
}

// Adapter functions for Roles
function adaptRoleFromAPI(apiRole: RoleResponse, type?: "role" | "department"): Role {
  return {
    name: apiRole.name,
    description: apiRole.description || undefined,
    type: type,
  };
}

function adaptRoleToAPI(role: Partial<Role>): Partial<RoleResponse> {
  return {
    name: role.name || '',
    description: role.description || null,
  };
}

// Roles API
export async function getRoles(type?: "role" | "department"): Promise<Role[]> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    let roles = [...mockRoles];
    if (type) {
      roles = roles.filter(r => r.type === type);
    }
    return roles;
  }

  if (USE_API_FIRST) {
    try {
      // API имеет отдельные endpoints для roles и departments
      const url = type === "department" 
        ? `${API_BASE_URL}/departments/`
        : `${API_BASE_URL}/roles/`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${type || 'roles'}: ${response.statusText}`);
      }

      const data: (RoleResponse | DepartmentResponse)[] = await response.json();
      return data.map(item => {
        if ('id' in item) {
          // DepartmentResponse
          return {
            id: item.id,
            name: item.name,
            description: item.description || undefined,
            type: 'department' as const,
          };
        } else {
          // RoleResponse
          return adaptRoleFromAPI(item, type || 'role');
        }
      });
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      let roles = [...mockRoles];
      if (type) {
        roles = roles.filter(r => r.type === type);
      }
      return roles;
    }
  }

  await new Promise(resolve => setTimeout(resolve, 300));
  let roles = [...mockRoles];
  if (type) {
    roles = roles.filter(r => r.type === type);
  }
  return roles;
}

export async function createRole(roleData: Partial<Role>): Promise<Role> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newId = Math.max(...mockRoles.map(r => r.id || 0), 0) + 1;
    const newRole: Role = {
      id: newId,
      name: roleData.name || "",
      type: roleData.type || "role",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockRoles.push(newRole);
    return { ...newRole };
  }

  if (USE_API_FIRST) {
    try {
      const apiData = adaptRoleToAPI(roleData);
      const url = roleData.type === "department"
        ? `${API_BASE_URL}/departments/`
        : `${API_BASE_URL}/roles/`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create ${roleData.type || 'role'}: ${response.statusText}`);
      }

      const data: RoleResponse | DepartmentResponse = await response.json();
      if ('id' in data) {
        return {
          id: data.id,
          name: data.name,
          description: data.description || undefined,
          type: 'department' as const,
        };
      } else {
        return adaptRoleFromAPI(data, roleData.type || 'role');
      }
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      const newId = Math.max(...mockRoles.map(r => r.id || 0), 0) + 1;
      const newRole: Role = {
        id: newId,
        name: roleData.name || "",
        type: roleData.type || "role",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockRoles.push(newRole);
      return { ...newRole };
    }
  }

  await new Promise(resolve => setTimeout(resolve, 300));
  const newId = Math.max(...mockRoles.map(r => r.id || 0), 0) + 1;
  const newRole: Role = {
    id: newId,
    name: roleData.name || "",
    type: roleData.type || "role",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockRoles.push(newRole);
  return { ...newRole };
}

export async function updateRole(id: number, roleData: Partial<Role>): Promise<Role> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const roleIndex = mockRoles.findIndex(r => r.id === id);
    if (roleIndex === -1) {
      throw new Error(`Role with id ${id} not found`);
    }
    mockRoles[roleIndex] = {
      ...mockRoles[roleIndex],
      ...roleData,
      updated_at: new Date().toISOString(),
    };
    return { ...mockRoles[roleIndex] };
  }

  // API uses name as identifier for roles, id for departments
  const role = mockRoles.find(r => r.id === id);
  const roleName = roleData.name || role?.name;
  const roleType = roleData.type || role?.type || 'role';

  if (USE_API_FIRST && roleName) {
    try {
      const apiData = adaptRoleToAPI(roleData);
      const url = roleType === "department"
        ? `${API_BASE_URL}/departments/${id}`
        : `${API_BASE_URL}/roles/${encodeURIComponent(roleName)}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${roleType}: ${response.statusText}`);
      }

      const data: RoleResponse | DepartmentResponse = await response.json();
      if ('id' in data) {
        return {
          id: data.id,
          name: data.name,
          description: data.description || undefined,
          type: 'department' as const,
        };
      } else {
        return adaptRoleFromAPI(data, roleType);
      }
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      const roleIndex = mockRoles.findIndex(r => r.id === id);
      if (roleIndex === -1) {
        throw new Error(`Role with id ${id} not found`);
      }
      mockRoles[roleIndex] = {
        ...mockRoles[roleIndex],
        ...roleData,
        updated_at: new Date().toISOString(),
      };
      return { ...mockRoles[roleIndex] };
    }
  }

  await new Promise(resolve => setTimeout(resolve, 300));
  const roleIndex = mockRoles.findIndex(r => r.id === id);
  if (roleIndex === -1) {
    throw new Error(`Role with id ${id} not found`);
  }
  mockRoles[roleIndex] = {
    ...mockRoles[roleIndex],
    ...roleData,
    updated_at: new Date().toISOString(),
  };
  return { ...mockRoles[roleIndex] };
}

export async function deleteRole(id: number): Promise<void> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const roleIndex = mockRoles.findIndex(r => r.id === id);
    if (roleIndex === -1) {
      throw new Error(`Role with id ${id} not found`);
    }
    mockRoles.splice(roleIndex, 1);
    return;
  }

  const role = mockRoles.find(r => r.id === id);
  if (!role) {
    throw new Error(`Role with id ${id} not found`);
  }

  const roleName = role.name;
  const roleType = role.type || 'role';

  if (USE_API_FIRST && roleName) {
    try {
      const url = roleType === "department"
        ? `${API_BASE_URL}/departments/${id}`
        : `${API_BASE_URL}/roles/${encodeURIComponent(roleName)}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${roleType}: ${response.statusText}`);
      }
      return; // Успешно удалено через API
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      const roleIndex = mockRoles.findIndex(r => r.id === id);
      if (roleIndex === -1) {
        throw new Error(`Role with id ${id} not found`);
      }
      mockRoles.splice(roleIndex, 1);
      return;
    }
  }

  await new Promise(resolve => setTimeout(resolve, 300));
  const roleIndex = mockRoles.findIndex(r => r.id === id);
  if (roleIndex === -1) {
    throw new Error(`Role with id ${id} not found`);
  }
  mockRoles.splice(roleIndex, 1);
}

