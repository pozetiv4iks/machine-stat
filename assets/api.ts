const API_BASE_URL = 'https://miran-hackathon.onrender.com';
const USE_MOCK_DATA = true; // Переключение между моковыми данными и реальным API

import { 
  mockUsers, 
  mockChecklists, 
  mockChartDataWeek, 
  mockChartDataMonth, 
  mockChartDataYear,
  mockChats,
  mockMessages,
  mockReports
} from './mockData';

export interface User {
  id: number;
  username?: string;
  full_name?: string;
  role?: string;
  telegram_id?: string;
  created_at?: string;
}

export interface Checklist {
  id: number;
  title?: string;
  description?: string;
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

// Users API
export async function getUsers(): Promise<User[]> {
  if (USE_MOCK_DATA) {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockUsers];
  }

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

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching users:', error);
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

  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
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

  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
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

  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user:', error);
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

  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Checklists API
export async function getChecklists(): Promise<Checklist[]> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockChecklists];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/checklists`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch checklists: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching checklists:', error);
    throw error;
  }
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

    return await response.json();
  } catch (error) {
    console.error('Error fetching checklist:', error);
    throw error;
  }
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

  try {
    const response = await fetch(`${API_BASE_URL}/checklists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checklistData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create checklist: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating checklist:', error);
    throw error;
  }
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

  try {
    const response = await fetch(`${API_BASE_URL}/checklists/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checklistData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update checklist: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating checklist:', error);
    throw error;
  }
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
  } catch (error) {
    console.error('Error deleting checklist:', error);
    throw error;
  }
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
    console.error('Error fetching chart data:', error);
    throw error;
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
    console.error('Error fetching chats:', error);
    throw error;
  }
}

export async function getChatMessages(chatId: number): Promise<Message[]> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockMessages.filter(msg => msg.chat_id === chatId);
  }

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
    console.error('Error fetching messages:', error);
    throw error;
  }
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
    console.error('Error sending message:', error);
    throw error;
  }
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
    console.error('Error fetching reports:', error);
    throw error;
  }
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
    console.error('Error fetching report:', error);
    throw error;
  }
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
    console.error('Error creating report:', error);
    throw error;
  }
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
    console.error('Error updating report:', error);
    throw error;
  }
}

