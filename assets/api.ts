const API_BASE_URL = 'https://miran-hackathon.onrender.com';
// Используем Next.js API route как прокси для обхода CORS
const USE_API_PROXY = true; // Использовать прокси через Next.js API routes
const USE_MOCK_DATA = false; // Принудительное использование моковых данных (если true, API не вызывается)
const USE_API_FIRST = true; // Сначала пытаться использовать API, при ошибке - моковые данные
const USE_LOCAL_STORAGE = true; // Использовать localStorage для хранения данных

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
  telegram_id?: string; // Может быть в ответе API
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
    telegram_id: apiUser.telegram_id,
    first_name: apiUser.first_name,
    last_name: apiUser.last_name,
    user_name: apiUser.user_name,
  };
}

function adaptUserToAPI(user: Partial<User>): Partial<UserResponse> {
  const baseData: any = {
    user_name: user.user_name || user.username || '',
    role: user.role || '',
  };
  
  // If user has first_name and last_name, use them
  if (user.first_name && user.last_name) {
    baseData.first_name = user.first_name;
    baseData.last_name = user.last_name;
  } else if (user.full_name) {
    // Otherwise, try to split full_name
    const parts = user.full_name.trim().split(/\s+/);
    baseData.first_name = parts[0] || '';
    baseData.last_name = parts.slice(1).join(' ') || '';
  } else {
    // Fallback
    baseData.first_name = user.first_name || '';
    baseData.last_name = user.last_name || '';
  }
  
  // Добавляем telegram_id, если он есть и не пустой
  if (user.telegram_id && user.telegram_id.trim()) {
    baseData.telegram_id = user.telegram_id.trim();
  }
  
  return baseData;
}

// Helper function to get mock users
function getMockUsers(): User[] {
  return [...mockUsers];
}

// Users API
export async function getUsers(): Promise<User[]> {
  // Если используем localStorage, загружаем оттуда
  if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
    try {
      const { getUsersFromStorage, initializeStorageFromMocks } = await import('../app/utils/localStorage');
      initializeStorageFromMocks();
      const users = getUsersFromStorage();
      if (users.length > 0) {
        console.log('[API] Loaded users from localStorage:', users.length);
        return users;
      }
    } catch (error) {
      console.error('[API] Error loading from localStorage:', error);
    }
  }

  if (USE_MOCK_DATA) {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 500));
    const users = getMockUsers();
    // Сохраняем в localStorage
    if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
      try {
        const { saveUsersToStorage } = await import('../app/utils/localStorage');
        saveUsersToStorage(users);
      } catch (error) {
        console.error('[API] Error saving to localStorage:', error);
      }
    }
    return users;
  }

  // Используем прокси через Next.js API route для обхода CORS
  const url = USE_API_PROXY ? '/api/users' : `${API_BASE_URL}/users`;
  console.log('[API] Fetching users from:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Отключаем кеширование для получения актуальных данных
      cache: 'no-store',
    });

    console.log('[API] Response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: await response.text() };
      }
      console.error('[API] Error response:', errorData);
      throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
    }

    const data: UserResponse[] = await response.json();
    console.log('[API] Received users:', data.length, 'items');
    console.log('[API] Users data:', data);
    
    const adaptedUsers = Array.isArray(data) ? data.map(adaptUserFromAPI) : [];
    console.log('[API] Adapted users:', adaptedUsers);
    
    // Сохраняем в localStorage
    if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
      try {
        const { saveUsersToStorage } = await import('../app/utils/localStorage');
        saveUsersToStorage(adaptedUsers);
      } catch (error) {
        console.error('[API] Error saving to localStorage:', error);
      }
    }
    
    return adaptedUsers;
  } catch (error) {
    console.error('[API] Fetch error:', error);
    // Пробуем прямой запрос к API, если прокси не сработал
    if (USE_API_PROXY && error instanceof TypeError && error.message.includes('fetch')) {
      console.log('[API] Proxy failed, trying direct API call...');
      const directUrl = `${API_BASE_URL}/users`;
      const directResponse = await fetch(directUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!directResponse.ok) {
        throw new Error(`Failed to fetch users: ${directResponse.status} ${directResponse.statusText}`);
      }
      
      const data: UserResponse[] = await directResponse.json();
      const adaptedUsers = Array.isArray(data) ? data.map(adaptUserFromAPI) : [];
      
      // Сохраняем в localStorage
      if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
        try {
          const { saveUsersToStorage } = await import('../app/utils/localStorage');
          saveUsersToStorage(adaptedUsers);
        } catch (error) {
          console.error('[API] Error saving to localStorage:', error);
        }
      }
      
      return adaptedUsers;
    }
    throw error;
  }
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
      const url = `${API_BASE_URL}/users/check-access?user_name=${encodeURIComponent(userName)}`;
      console.log('[API] Checking user access:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('[API] check-access response status:', response.status, response.statusText);

      if (!response.ok) {
        // Если 404 или другой ошибка, возвращаем has_access: false
        if (response.status === 404) {
          console.log('[API] User not found (404)');
          return {
            has_access: false,
            message: "User not found",
            user: null,
          };
        }
        const errorText = await response.text();
        console.error('[API] check-access error:', errorText);
        throw new Error(`Failed to check user access: ${response.status} ${response.statusText}`);
      }

      const data: UserAccessResponse = await response.json();
      console.log('[API] check-access response:', data);
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
      const url = `${API_BASE_URL}/users/${encodeURIComponent(userName)}`;
      console.log('[API] Getting user by username:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('[API] getUserByUsername response status:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('[API] User not found (404)');
          throw new Error(`User with username ${userName} not found`);
        }
        const errorText = await response.text();
        console.error('[API] getUserByUsername error:', errorText);
        throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
      }

      const data: UserResponse = await response.json();
      console.log('[API] getUserByUsername response:', data);
      const adapted = adaptUserFromAPI(data);
      console.log('[API] Adapted user:', adapted);
      return adapted;
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

  // Используем прокси через Next.js API route
  const url = USE_API_PROXY ? '/api/users' : `${API_BASE_URL}/users`;
  
  try {
    const apiData = adaptUserToAPI(userData);
    console.log('[API] Creating user:', url);
    console.log('[API] Request data:', apiData);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
      cache: 'no-store',
    });

    console.log('[API] createUser response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: await response.text() };
      }
      console.error('[API] createUser error:', errorData);
      throw new Error(`Failed to create user: ${response.status} ${response.statusText}`);
    }

    const data: UserResponse = await response.json();
    console.log('[API] createUser response:', data);
    const newUser = adaptUserFromAPI(data);
    
    // Сохраняем в localStorage
    if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
      try {
        const { addUserToStorage } = await import('../app/utils/localStorage');
        addUserToStorage(newUser);
      } catch (error) {
        console.error('[API] Error saving to localStorage:', error);
      }
    }
    
    return newUser;
  } catch (error) {
    console.error('[API] Create user error:', error);
    throw error;
  }
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
  
  if (!userName) {
    throw new Error(`Cannot update user: user_name not found for user id ${id}`);
  }

  // Используем прокси через Next.js API route
  const url = USE_API_PROXY 
    ? `/api/users/${encodeURIComponent(userName)}`
    : `${API_BASE_URL}/users/${encodeURIComponent(userName)}`;
  
  try {
    const apiData = adaptUserToAPI(userData);
    console.log('[API] Updating user:', url);
    console.log('[API] Request data:', apiData);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
      cache: 'no-store',
    });

    console.log('[API] updateUser response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: await response.text() };
      }
      console.error('[API] updateUser error:', errorData);
      throw new Error(`Failed to update user: ${response.status} ${response.statusText}`);
    }

    const data: UserResponse = await response.json();
    console.log('[API] updateUser response:', data);
    const updatedUser = adaptUserFromAPI(data);
    
    // Сохраняем в localStorage
    if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
      try {
        const { addUserToStorage } = await import('../app/utils/localStorage');
        addUserToStorage(updatedUser);
      } catch (error) {
        console.error('[API] Error saving to localStorage:', error);
      }
    }
    
    return updatedUser;
  } catch (error) {
    console.error('[API] Update user error:', error);
    throw error;
  }
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

  // Используем прокси через Next.js API route
  const url = USE_API_PROXY 
    ? `/api/users/${encodeURIComponent(userName)}`
    : `${API_BASE_URL}/users/${encodeURIComponent(userName)}`;
  
  try {
    const apiData = adaptUserToAPI({ ...userData, user_name: userName, username: userName });
    console.log('[API] Updating user by username:', url);
    console.log('[API] Request data:', apiData);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
      cache: 'no-store',
    });

    console.log('[API] updateUserByUsername response status:', response.status, response.statusText);

    if (!response.ok) {
      if (response.status === 404) {
        console.log('[API] User not found (404)');
        throw new Error(`User with username ${userName} not found`);
      }
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: await response.text() };
      }
      console.error('[API] updateUserByUsername error:', errorData);
      throw new Error(`Failed to update user: ${response.status} ${response.statusText}`);
    }

    const data: UserResponse = await response.json();
    console.log('[API] updateUserByUsername response:', data);
    const adapted = adaptUserFromAPI(data);
    console.log('[API] Adapted updated user:', adapted);
    return adapted;
  } catch (error) {
    console.error('[API] Update user by username error:', error);
    throw error;
  }
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
  if (!userName) {
    throw new Error(`Cannot delete user: user_name not found for user id ${id}`);
  }

  // Используем прокси через Next.js API route
  const url = USE_API_PROXY 
    ? `/api/users/${encodeURIComponent(userName)}`
    : `${API_BASE_URL}/users/${encodeURIComponent(userName)}`;
  
  try {
    console.log('[API] Deleting user:', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    console.log('[API] deleteUser response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: await response.text() };
      }
      console.error('[API] deleteUser error:', errorData);
      throw new Error(`Failed to delete user: ${response.status} ${response.statusText}`);
    }
    
    console.log('[API] User deleted successfully');
    
    // Удаляем из localStorage
    if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
      try {
        const { removeUserFromStorage } = await import('../app/utils/localStorage');
        removeUserFromStorage(id);
      } catch (error) {
        console.error('[API] Error removing from localStorage:', error);
      }
    }
    
    return; // Успешно удалено через API
  } catch (error) {
    console.error('[API] Delete user error:', error);
    throw error;
  }
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
  // Если используем localStorage, загружаем оттуда
  if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
    try {
      const { getChecklistsFromStorage, initializeStorageFromMocks } = await import('../app/utils/localStorage');
      initializeStorageFromMocks();
      const checklists = getChecklistsFromStorage();
      if (checklists.length > 0) {
        console.log('[API] Loaded checklists from localStorage:', checklists.length);
        return checklists;
      }
    } catch (error) {
      console.error('[API] Error loading checklists from localStorage:', error);
    }
  }

  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const checklists = [...mockChecklists];
    // Сохраняем в localStorage
    if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
      try {
        const { saveChecklistsToStorage } = await import('../app/utils/localStorage');
        saveChecklistsToStorage(checklists);
      } catch (error) {
        console.error('[API] Error saving checklists to localStorage:', error);
      }
    }
    return checklists;
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
      const checklists = Array.isArray(data) ? data.map(adaptChecklistFromAPI) : [];
      
      // Сохраняем в localStorage
      if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
        try {
          const { saveChecklistsToStorage } = await import('../app/utils/localStorage');
          saveChecklistsToStorage(checklists);
        } catch (error) {
          console.error('[API] Error saving checklists to localStorage:', error);
        }
      }
      
      return checklists;
  } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      const checklists = [...mockChecklists];
      
      // Сохраняем в localStorage
      if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
        try {
          const { saveChecklistsToStorage } = await import('../app/utils/localStorage');
          saveChecklistsToStorage(checklists);
        } catch (error) {
          console.error('[API] Error saving checklists to localStorage:', error);
        }
      }
      
      return checklists;
  }
  }

  await new Promise(resolve => setTimeout(resolve, 500));
  const checklists = [...mockChecklists];
  
  // Сохраняем в localStorage
  if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
    try {
      const { saveChecklistsToStorage } = await import('../app/utils/localStorage');
      saveChecklistsToStorage(checklists);
    } catch (error) {
      console.error('[API] Error saving checklists to localStorage:', error);
    }
  }
  
  return checklists;
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
  // Если используем localStorage, создаем там
  if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
    try {
      const { getChecklistsFromStorage, addChecklistToStorage, initializeStorageFromMocks } = await import('../app/utils/localStorage');
      initializeStorageFromMocks();
      const checklists = getChecklistsFromStorage();
      const newId = checklists.length > 0 ? Math.max(...checklists.map(c => c.id), 0) + 1 : 1;
      const newChecklist: Checklist = {
        id: newId,
        title: checklistData.title || "",
        description: checklistData.description || "",
        items: checklistData.items || [],
        status: checklistData.status || "Не начато",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      addChecklistToStorage(newChecklist);
      console.log('[API] Created checklist in localStorage:', newChecklist.id);
      return { ...newChecklist };
    } catch (error) {
      console.error('[API] Error creating checklist in localStorage:', error);
    }
  }

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
    
    // Сохраняем в localStorage
    if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
      try {
        const { addChecklistToStorage } = await import('../app/utils/localStorage');
        addChecklistToStorage(newChecklist);
      } catch (error) {
        console.error('[API] Error saving checklist to localStorage:', error);
      }
    }
    
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
      const newChecklist = adaptChecklistFromAPI(data);
      
      // Сохраняем в localStorage
      if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
        try {
          const { addChecklistToStorage } = await import('../app/utils/localStorage');
          addChecklistToStorage(newChecklist);
        } catch (error) {
          console.error('[API] Error saving checklist to localStorage:', error);
        }
      }
      
      return newChecklist;
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
      
      // Сохраняем в localStorage
      if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
        try {
          const { addChecklistToStorage } = await import('../app/utils/localStorage');
          addChecklistToStorage(newChecklist);
        } catch (error) {
          console.error('[API] Error saving checklist to localStorage:', error);
        }
      }
      
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
  
  // Сохраняем в localStorage
  if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
    try {
      const { addChecklistToStorage } = await import('../app/utils/localStorage');
      addChecklistToStorage(newChecklist);
    } catch (error) {
      console.error('[API] Error saving checklist to localStorage:', error);
    }
  }
  
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
  // Если используем localStorage, обновляем там
  if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
    try {
      const { getChecklistsFromStorage, addChecklistToStorage, initializeStorageFromMocks } = await import('../app/utils/localStorage');
      initializeStorageFromMocks();
      const checklists = getChecklistsFromStorage();
      const checklistIndex = checklists.findIndex(c => c.id === id);
      if (checklistIndex === -1) {
        throw new Error(`Checklist with id ${id} not found`);
      }
      const updatedChecklist = {
        ...checklists[checklistIndex],
        ...checklistData,
        updated_at: new Date().toISOString(),
      };
      addChecklistToStorage(updatedChecklist);
      console.log('[API] Updated checklist in localStorage:', id);
      return { ...updatedChecklist };
    } catch (error) {
      console.error('[API] Error updating checklist in localStorage:', error);
    }
  }

  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const checklistIndex = mockChecklists.findIndex(c => c.id === id);
    if (checklistIndex === -1) {
      throw new Error(`Checklist with id ${id} not found`);
    }
    const updatedChecklist = {
      ...mockChecklists[checklistIndex],
      ...checklistData,
      updated_at: new Date().toISOString(),
    };
    mockChecklists[checklistIndex] = updatedChecklist;
    
    // Сохраняем в localStorage
    if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
      try {
        const { addChecklistToStorage } = await import('../app/utils/localStorage');
        addChecklistToStorage(updatedChecklist);
      } catch (error) {
        console.error('[API] Error saving checklist to localStorage:', error);
      }
    }
    
    return { ...updatedChecklist };
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
  // Если используем localStorage, удаляем оттуда
  if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
    try {
      const { removeChecklistFromStorage } = await import('../app/utils/localStorage');
      removeChecklistFromStorage(id);
      console.log('[API] Deleted checklist from localStorage:', id);
      return;
    } catch (error) {
      console.error('[API] Error deleting checklist from localStorage:', error);
    }
  }

  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const checklistIndex = mockChecklists.findIndex(c => c.id === id);
    if (checklistIndex === -1) {
      throw new Error(`Checklist with id ${id} not found`);
    }
    mockChecklists.splice(checklistIndex, 1);
    
    // Удаляем из localStorage
    if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
      try {
        const { removeChecklistFromStorage } = await import('../app/utils/localStorage');
        removeChecklistFromStorage(id);
      } catch (error) {
        console.error('[API] Error removing checklist from localStorage:', error);
      }
    }
    
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
  // Если используем localStorage, загружаем оттуда
  if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
    try {
      const { getReportsFromStorage, initializeStorageFromMocks } = await import('../app/utils/localStorage');
      initializeStorageFromMocks();
      let reports = getReportsFromStorage();
      if (inspectorId) {
        reports = reports.filter(report => report.inspector_id === inspectorId);
      }
      if (reports.length > 0) {
        console.log('[API] Loaded reports from localStorage:', reports.length);
        return reports;
      }
    } catch (error) {
      console.error('[API] Error loading reports from localStorage:', error);
    }
  }

  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 400));
    let reports = [...mockReports];
    if (inspectorId) {
      reports = reports.filter(report => report.inspector_id === inspectorId);
    }
    
    // Сохраняем в localStorage
    if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
      try {
        const { saveReportsToStorage } = await import('../app/utils/localStorage');
        saveReportsToStorage(reports);
      } catch (error) {
        console.error('[API] Error saving reports to localStorage:', error);
      }
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
      const reports = Array.isArray(data) ? data : [];
      
      // Сохраняем в localStorage
      if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
        try {
          const { saveReportsToStorage } = await import('../app/utils/localStorage');
          saveReportsToStorage(reports);
        } catch (error) {
          console.error('[API] Error saving reports to localStorage:', error);
        }
      }
      
      return reports;
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      let reports = [...mockReports];
      if (inspectorId) {
        reports = reports.filter(report => report.inspector_id === inspectorId);
      }
      
      // Сохраняем в localStorage
      if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
        try {
          const { saveReportsToStorage } = await import('../app/utils/localStorage');
          saveReportsToStorage(reports);
        } catch (error) {
          console.error('[API] Error saving reports to localStorage:', error);
        }
      }
      
      return reports;
    }
  }

  await new Promise(resolve => setTimeout(resolve, 400));
  let reports = [...mockReports];
  if (inspectorId) {
    reports = reports.filter(report => report.inspector_id === inspectorId);
  }
  
  // Сохраняем в localStorage
  if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
    try {
      const { saveReportsToStorage } = await import('../app/utils/localStorage');
      saveReportsToStorage(reports);
    } catch (error) {
      console.error('[API] Error saving reports to localStorage:', error);
    }
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
  // Если используем localStorage, создаем там
  if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
    try {
      const { getReportsFromStorage, addReportToStorage, initializeStorageFromMocks } = await import('../app/utils/localStorage');
      initializeStorageFromMocks();
      const reports = getReportsFromStorage();
      const newId = reports.length > 0 ? Math.max(...reports.map(r => r.id), 0) + 1 : 1;
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
      addReportToStorage(newReport);
      console.log('[API] Created report in localStorage:', newReport.id);
      return { ...newReport };
    } catch (error) {
      console.error('[API] Error creating report in localStorage:', error);
    }
  }

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
    
    // Сохраняем в localStorage
    if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
      try {
        const { addReportToStorage } = await import('../app/utils/localStorage');
        addReportToStorage(newReport);
      } catch (error) {
        console.error('[API] Error saving report to localStorage:', error);
      }
    }
    
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

      const newReport = await response.json();
      
      // Сохраняем в localStorage
      if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
        try {
          const { addReportToStorage } = await import('../app/utils/localStorage');
          addReportToStorage(newReport);
        } catch (error) {
          console.error('[API] Error saving report to localStorage:', error);
        }
      }
      
      return newReport;
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
      
      // Сохраняем в localStorage
      if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
        try {
          const { addReportToStorage } = await import('../app/utils/localStorage');
          addReportToStorage(newReport);
        } catch (error) {
          console.error('[API] Error saving report to localStorage:', error);
        }
      }
      
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
  
  // Сохраняем в localStorage
  if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
    try {
      const { addReportToStorage } = await import('../app/utils/localStorage');
      addReportToStorage(newReport);
    } catch (error) {
      console.error('[API] Error saving report to localStorage:', error);
    }
  }
  
  return { ...newReport };
}

export async function updateReport(id: number, reportData: Partial<Report>): Promise<Report> {
  // Если используем localStorage, обновляем там
  if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
    try {
      const { getReportsFromStorage, addReportToStorage, initializeStorageFromMocks } = await import('../app/utils/localStorage');
      initializeStorageFromMocks();
      const reports = getReportsFromStorage();
      const reportIndex = reports.findIndex(r => r.id === id);
      if (reportIndex === -1) {
        throw new Error(`Report with id ${id} not found`);
      }
      const updatedReport = {
        ...reports[reportIndex],
        ...reportData,
        updated_at: new Date().toISOString(),
      };
      addReportToStorage(updatedReport);
      console.log('[API] Updated report in localStorage:', id);
      return { ...updatedReport };
    } catch (error) {
      console.error('[API] Error updating report in localStorage:', error);
    }
  }

  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const reportIndex = mockReports.findIndex(r => r.id === id);
    if (reportIndex === -1) {
      throw new Error(`Report with id ${id} not found`);
    }
    const updatedReport = {
      ...mockReports[reportIndex],
      ...reportData,
      updated_at: new Date().toISOString(),
    };
    mockReports[reportIndex] = updatedReport;
    
    // Сохраняем в localStorage
    if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
      try {
        const { addReportToStorage } = await import('../app/utils/localStorage');
        addReportToStorage(updatedReport);
      } catch (error) {
        console.error('[API] Error saving report to localStorage:', error);
      }
    }
    
    return { ...updatedReport };
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

      const updatedReport = await response.json();
      
      // Сохраняем в localStorage
      if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
        try {
          const { addReportToStorage } = await import('../app/utils/localStorage');
          addReportToStorage(updatedReport);
        } catch (error) {
          console.error('[API] Error saving report to localStorage:', error);
        }
      }
      
      return updatedReport;
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      const reportIndex = mockReports.findIndex(r => r.id === id);
      if (reportIndex === -1) {
        throw new Error(`Report with id ${id} not found`);
      }
      const updatedReport = {
        ...mockReports[reportIndex],
        ...reportData,
        updated_at: new Date().toISOString(),
      };
      mockReports[reportIndex] = updatedReport;
      
      // Сохраняем в localStorage
      if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
        try {
          const { addReportToStorage } = await import('../app/utils/localStorage');
          addReportToStorage(updatedReport);
        } catch (error) {
          console.error('[API] Error saving report to localStorage:', error);
        }
      }
      
      return { ...updatedReport };
    }
  }

  await new Promise(resolve => setTimeout(resolve, 300));
  const reportIndex = mockReports.findIndex(r => r.id === id);
  if (reportIndex === -1) {
    throw new Error(`Report with id ${id} not found`);
  }
  const updatedReport = {
    ...mockReports[reportIndex],
    ...reportData,
    updated_at: new Date().toISOString(),
  };
  mockReports[reportIndex] = updatedReport;
  
  // Сохраняем в localStorage
  if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
    try {
      const { addReportToStorage } = await import('../app/utils/localStorage');
      addReportToStorage(updatedReport);
    } catch (error) {
      console.error('[API] Error saving report to localStorage:', error);
    }
  }
  
  return { ...updatedReport };
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
  // Если используем localStorage, загружаем оттуда
  if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
    try {
      const { getRolesFromStorage, initializeStorageFromMocks } = await import('../app/utils/localStorage');
      initializeStorageFromMocks();
      let roles = getRolesFromStorage();
      if (type) {
        roles = roles.filter(r => r.type === type);
      }
      if (roles.length > 0) {
        console.log('[API] Loaded roles from localStorage:', roles.length);
        return roles;
      }
    } catch (error) {
      console.error('[API] Error loading roles from localStorage:', error);
    }
  }

  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    let roles = [...mockRoles];
    if (type) {
      roles = roles.filter(r => r.type === type);
    }
    
    // Сохраняем в localStorage
    if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
      try {
        const { saveRolesToStorage } = await import('../app/utils/localStorage');
        saveRolesToStorage(roles);
      } catch (error) {
        console.error('[API] Error saving roles to localStorage:', error);
      }
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
      const roles = data.map(item => {
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
      
      // Сохраняем в localStorage
      if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
        try {
          const { saveRolesToStorage } = await import('../app/utils/localStorage');
          saveRolesToStorage(roles);
        } catch (error) {
          console.error('[API] Error saving roles to localStorage:', error);
        }
      }
      
      return roles;
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      let roles = [...mockRoles];
      if (type) {
        roles = roles.filter(r => r.type === type);
      }
      
      // Сохраняем в localStorage
      if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
        try {
          const { saveRolesToStorage } = await import('../app/utils/localStorage');
          saveRolesToStorage(roles);
        } catch (error) {
          console.error('[API] Error saving roles to localStorage:', error);
        }
      }
      
      return roles;
    }
  }

  await new Promise(resolve => setTimeout(resolve, 300));
  let roles = [...mockRoles];
  if (type) {
    roles = roles.filter(r => r.type === type);
  }
  
  // Сохраняем в localStorage
  if (USE_LOCAL_STORAGE && typeof window !== 'undefined') {
    try {
      const { saveRolesToStorage } = await import('../app/utils/localStorage');
      saveRolesToStorage(roles);
    } catch (error) {
      console.error('[API] Error saving roles to localStorage:', error);
    }
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

