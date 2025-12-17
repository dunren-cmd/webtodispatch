// ========================================
// API 服務 - 用於與 Supabase 後端通訊
// ========================================

// Supabase 配置
// 注意：這些值應該從環境變數或配置檔案讀取，這裡為了簡化直接寫在程式碼中
// 在生產環境中，建議使用環境變數
const SUPABASE_URL = 'http://192.168.68.75:54321'; // 本地 Supabase API 服務（端口 54321）
const SUPABASE_ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'; // 從 supabase status 取得的 Publishable key

// Supabase REST API 基礎 URL
const API_BASE_URL = `${SUPABASE_URL}/rest/v1`;

// ========================================
// 型別定義
// ========================================

export interface Task {
  id: number;
  title: string;
  description: string;
  assignerId: number | null;
  assigneeId: number | null;
  collaboratorIds: number[];
  roleCategory: string;
  dates: {
    plan: string;
    interim: string;
    final: string;
  };
  status: 'pending' | 'in_progress' | 'done' | 'overdue';
  assigneeResponse?: string;
  evidence?: Evidence[];
}

export interface Evidence {
  id: string;
  type: 'stat' | 'image' | 'link';
  label?: string;
  value?: string;
  sub?: string;
  trend?: string;
  name?: string;
  url?: string;
}

export interface User {
  id: number;
  name: string;
  role: string;
  level: number; // 層級：1-5，第1層為最高
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  taskId?: number;
  row?: number;
}

// ========================================
// Supabase API 輔助函數
// ========================================

/**
 * 取得 Supabase API Key（從 localStorage 或使用預設值）
 */
function getSupabaseKey(): string {
  // 嘗試從 localStorage 讀取
  const storedKey = localStorage.getItem('supabase_anon_key');
  if (storedKey) {
    return storedKey;
  }
  
  // 如果沒有，使用預設值（需要手動設定）
  if (SUPABASE_ANON_KEY) {
    return SUPABASE_ANON_KEY;
  }
  
  // 提示用戶設定
  console.warn('⚠️ Supabase API Key 未設定！請執行以下步驟：');
  console.warn('1. 執行 supabase status 取得 Publishable key');
  console.warn('2. 在瀏覽器 Console 中執行：localStorage.setItem("supabase_anon_key", "你的Publishable key")');
  console.warn('3. 或直接編輯 api.ts 設定 SUPABASE_ANON_KEY');
  console.warn('');
  console.warn('注意：Supabase CLI 新版本使用 "Publishable key" 而不是 "anon key"');
  
  return '';
}

/**
 * 建立 Supabase API 請求標頭
 */
function createHeaders(): HeadersInit {
  const key = getSupabaseKey();
  return {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
}

/**
 * 轉換 Supabase 任務資料格式為前端格式
 */
function transformTaskFromSupabase(task: any): Task {
  return {
    id: task.id,
    title: task.title || '',
    description: task.description || '',
    assignerId: task.assigner_id || null,
    assigneeId: task.assignee_id || null,
    collaboratorIds: task.collaborator_ids || [],
    roleCategory: task.role_category || '',
    dates: {
      plan: task.plan_date || '',
      interim: task.interim_date || '',
      final: task.final_date || ''
    },
    status: task.status || 'pending',
    assigneeResponse: task.assignee_response || '',
    evidence: task.evidence || []
  };
}

/**
 * 轉換前端任務資料格式為 Supabase 格式
 */
function transformTaskToSupabase(task: Partial<Task>): any {
  return {
    id: task.id || Date.now(),
    title: task.title || '',
    description: task.description || '',
    assigner_id: task.assignerId || null,
    assignee_id: task.assigneeId || null,
    collaborator_ids: task.collaboratorIds || [],
    role_category: task.roleCategory || '',
    plan_date: task.dates?.plan || null,
    interim_date: task.dates?.interim || null,
    final_date: task.dates?.final || null,
    status: task.status || 'pending',
    assignee_response: task.assigneeResponse || '',
    evidence: task.evidence || []
  };
}

// ========================================
// API 函數
// ========================================

/**
 * 建立新任務
 */
export async function createTask(task: Omit<Task, 'id'>): Promise<ApiResponse<Task>> {
  try {
    const taskData = transformTaskToSupabase({
      ...task,
      id: Date.now()
    });

    console.log('準備發送任務資料到 Supabase：', taskData);

    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    const createdTask = Array.isArray(result) ? result[0] : result;
    
    return {
      success: true,
      data: transformTaskFromSupabase(createdTask),
      taskId: createdTask.id
    };

  } catch (error) {
    console.error('建立任務時發生錯誤：', error);
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 更新任務狀態
 */
export async function updateTaskStatus(
  taskId: number,
  status: 'pending' | 'in_progress' | 'done' | 'overdue'
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks?id=eq.${taskId}`, {
      method: 'PATCH',
      headers: createHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('更新任務狀態時發生錯誤：', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    };
  }
}

/**
 * 更新承辦人回覆
 */
export async function updateTaskResponse(
  taskId: number,
  response: string
): Promise<ApiResponse> {
  try {
    const updateData: any = { assignee_response: response };
    
    // 如果狀態還是 pending，同時更新為 in_progress
    // 先取得當前任務狀態
    const currentTask = await getTask(taskId);
    if (currentTask.success && currentTask.data && currentTask.data.status === 'pending') {
      updateData.status = 'in_progress';
    }

    const apiResponse = await fetch(`${API_BASE_URL}/tasks?id=eq.${taskId}`, {
      method: 'PATCH',
      headers: createHeaders(),
      body: JSON.stringify(updateData),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`HTTP error! status: ${apiResponse.status}, message: ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('更新承辦人回覆時發生錯誤：', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    };
  }
}

/**
 * 新增佐證資料
 */
export async function addEvidence(
  taskId: number,
  evidence: Evidence
): Promise<ApiResponse<Evidence>> {
  try {
    // 先取得當前任務
    const currentTask = await getTask(taskId);
    if (!currentTask.success || !currentTask.data) {
      throw new Error('找不到任務');
    }

    // 取得現有的佐證資料
    const evidenceArray = currentTask.data.evidence || [];
    evidenceArray.push(evidence);

    // 更新任務的佐證資料
    const response = await fetch(`${API_BASE_URL}/tasks?id=eq.${taskId}`, {
      method: 'PATCH',
      headers: createHeaders(),
      body: JSON.stringify({ evidence: evidenceArray }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return { success: true, data: evidence };
  } catch (error) {
    console.error('新增佐證資料時發生錯誤：', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    };
  }
}

/**
 * 刪除佐證資料
 */
export async function deleteEvidence(
  taskId: number,
  evidenceId: string
): Promise<ApiResponse> {
  try {
    // 先取得當前任務
    const currentTask = await getTask(taskId);
    if (!currentTask.success || !currentTask.data) {
      throw new Error('找不到任務');
    }

    // 取得現有的佐證資料並過濾掉要刪除的
    const evidenceArray = (currentTask.data.evidence || []).filter(
      (e: Evidence) => e.id !== evidenceId
    );

    // 更新任務的佐證資料
    const response = await fetch(`${API_BASE_URL}/tasks?id=eq.${taskId}`, {
      method: 'PATCH',
      headers: createHeaders(),
      body: JSON.stringify({ evidence: evidenceArray }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('刪除佐證資料時發生錯誤：', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    };
  }
}

/**
 * 取得任務列表
 */
export async function getTasks(roleCategory: string = 'all'): Promise<ApiResponse<Task[]>> {
  try {
    let url = `${API_BASE_URL}/tasks`;
    
    // 如果指定了職類，添加過濾條件
    if (roleCategory && roleCategory !== 'all') {
      url += `?role_category=eq.${roleCategory}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    const tasks = Array.isArray(result) ? result : [];
    
    return {
      success: true,
      data: tasks.map(transformTaskFromSupabase)
    };
  } catch (error) {
    console.error('取得任務列表時發生錯誤：', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      data: []
    };
  }
}

/**
 * 取得單一任務
 */
export async function getTask(taskId: number): Promise<ApiResponse<Task>> {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks?id=eq.${taskId}`, {
      method: 'GET',
      headers: createHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    
    if (!result || (Array.isArray(result) && result.length === 0)) {
      return {
        success: false,
        error: '找不到任務'
      };
    }

    const task = Array.isArray(result) ? result[0] : result;
    
    return {
      success: true,
      data: transformTaskFromSupabase(task)
    };
  } catch (error) {
    console.error('取得任務時發生錯誤：', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    };
  }
}

/**
 * 建立新員工
 */
export async function createUser(user: Omit<User, 'id'>): Promise<ApiResponse<User>> {
  try {
    // 確保層級不會是 5（統一改為 4）
    const userLevel = user.level === 5 ? 4 : (user.level || 4);
    
    const userData = {
      id: Date.now(),
      name: user.name || '',
      role: user.role || '',
      level: userLevel // 預設為員工（層級 4）
    };

    console.log('準備發送員工資料到 Supabase：', userData);

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    const createdUser = Array.isArray(result) ? result[0] : result;

    return {
      success: true,
      data: {
        id: createdUser.id,
        name: createdUser.name,
        role: createdUser.role,
        level: createdUser.level || 5
      }
    };

  } catch (error) {
    console.error('建立員工時發生錯誤：', error);
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 更新員工資料
 */
export async function updateUser(user: User): Promise<ApiResponse<User>> {
  try {
    // 確保層級不會是 5（統一改為 4）
    const userLevel = user.level === 5 ? 4 : (user.level || 4);
    
    const userData = {
      name: user.name || '',
      role: user.role || '',
      level: userLevel
    };

    console.log('準備更新員工資料到 Supabase：', userData);

    const response = await fetch(`${API_BASE_URL}/users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: createHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    const updatedUser = Array.isArray(result) ? result[0] : result;

    return {
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        role: updatedUser.role,
        level: updatedUser.level || 5
      }
    };

  } catch (error) {
    console.error('更新員工時發生錯誤：', error);
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 使用 Gemini AI 分析任務描述
 * 注意：這個功能需要透過 Google Apps Script，因為需要 Gemini API Key
 * 如果 Google Apps Script 已設定，可以透過它來調用
 */
export async function analyzeTaskWithAI(description: string): Promise<ApiResponse<{ description: string }>> {
  try {
    // 如果 Google Apps Script URL 可用，使用它
    // 否則返回提示訊息
    const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbzpdPkr96-Kc36TAYU3poKqOw2Do6GpXi6AMgJWgUDft9uD8EBoGyw4-VRJOgiiMAqZKw/exec';
    
    const encodedDescription = encodeURIComponent(description);
    const params = new URLSearchParams({
      action: 'analyzeTaskWithAI',
      description: encodedDescription
    });

    const response = await fetch(`${googleScriptUrl}?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<{ description: string }> = await response.json();
    return result;
  } catch (error) {
    console.error('AI 分析時發生錯誤：', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    };
  }
}

/**
 * 使用 Gemini AI 分析任務描述（使用 GET 方式）
 */
export async function analyzeTaskWithAIGet(description: string): Promise<ApiResponse<{ description: string }>> {
  return analyzeTaskWithAI(description);
}

/**
 * 取得人員列表
 */
export async function getUsers(): Promise<ApiResponse<User[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: createHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    const users = Array.isArray(result) ? result : [];
    
    return {
      success: true,
      data: users.map((user: any) => {
        // 確保層級不會是 5（統一改為 4）
        const userLevel = user.level === 5 ? 4 : (user.level || 4);
        return {
          id: user.id,
          name: user.name || '',
          role: user.role || '',
          level: userLevel
        };
      })
    };
  } catch (error) {
    console.error('取得人員列表時發生錯誤：', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      data: []
    };
  }
}

/**
 * 取得不重複的角色列表（使用 SQL 查詢，效能較佳）
 * 只獲取 role 欄位，減少資料傳輸量
 */
export async function getRoles(): Promise<ApiResponse<string[]>> {
  try {
    // 使用 PostgREST 的 select 參數，只獲取 role 欄位
    // 這樣可以大幅減少資料傳輸量
    const response = await fetch(`${API_BASE_URL}/users?select=role`, {
      method: 'GET',
      headers: createHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    const roles = Array.isArray(result) ? result : [];
    
    // 提取不重複的 role 值，過濾掉空值
    const uniqueRoles = Array.from(
      new Set(
        roles
          .map((item: any) => item.role)
          .filter((role: string | null | undefined) => role != null && role !== '')
      )
    ) as string[];
    
    return {
      success: true,
      data: uniqueRoles
    };
  } catch (error) {
    console.error('取得角色列表時發生錯誤：', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      data: []
    };
  }
}
