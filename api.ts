// ========================================
// API 服務 - 用於與 Supabase 後端通訊
// ========================================

// Supabase 配置
// 從環境變數讀取，如果沒有則使用預設值（向後相容）
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://192.168.68.75:54321';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

// Supabase REST API 基礎 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${SUPABASE_URL}/rest/v1`;

// 開發模式下顯示配置資訊
if (import.meta.env.DEV) {
  console.log('🔧 環境配置：');
  console.log('  SUPABASE_URL:', SUPABASE_URL);
  console.log('  SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : '未設定');
  console.log('  API_BASE_URL:', API_BASE_URL);
}

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

export interface Role {
  id: string;
  name: string;
  icon_name?: string;
  color?: string;
  level?: number;
  webhook?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
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
 * 刪除員工資料
 */
export async function deleteUser(userId: number): Promise<ApiResponse<void>> {
  try {
    console.log('🗑️ 準備刪除員工 ID：', userId);

    const response = await fetch(`${API_BASE_URL}/users?id=eq.${userId}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 刪除員工失敗：', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    // DELETE 請求成功時通常返回空內容或 204 狀態碼
    const responseText = await response.text();
    console.log('✅ 員工已成功刪除，回應：', responseText || '無內容（成功）');

    return {
      success: true
    };
  } catch (error) {
    console.error('❌ 刪除員工時發生錯誤：', error);
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
    
    console.log('📥 從 Supabase 取得的原始用戶資料：', users);
    console.log('📊 用戶數量：', users.length);
    
    const processedUsers = users.map((user: any) => {
      // 處理 level 欄位：確保是數字類型，null/undefined 設為 4，5 改為 4
      let userLevel: number;
      if (user.level === null || user.level === undefined) {
        userLevel = 4; // 預設為員工層級
      } else {
        const levelNum = typeof user.level === 'string' ? parseInt(user.level, 10) : Number(user.level);
        userLevel = levelNum === 5 ? 4 : (isNaN(levelNum) ? 4 : levelNum);
      }
      
      const processedUser = {
        id: user.id,
        name: user.name || '',
        role: user.role || '',
        level: userLevel
      };
      
      console.log(`👤 處理用戶 ${user.id} (${user.name}): level=${user.level} -> ${userLevel}`);
      
      return processedUser;
    });
    
    console.log('✅ 處理後的用戶資料：', processedUsers);
    console.log('📊 層級統計：', processedUsers.reduce((acc: any, user: User) => {
      acc[user.level] = (acc[user.level] || 0) + 1;
      return acc;
    }, {}));
    
    return {
      success: true,
      data: processedUsers
    };
  } catch (error) {
    console.error('❌ 取得人員列表時發生錯誤：', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      data: []
    };
  }
}

/**
 * 從 Supabase roles 表取得完整的角色資料（包括 webhook）
 */
export async function getRolesFromSupabase(): Promise<ApiResponse<Role[]>> {
  try {
    console.log('🔄 開始從 Supabase roles 表取得角色資料...');
    
    const url = `${API_BASE_URL}/roles?order=name.asc`;
    console.log('📤 請求 URL：', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Supabase API 錯誤：', response.status, errorText);
      // 如果 roles 表不存在，返回空陣列而不是錯誤
      if (response.status === 404 || response.status === 400) {
        console.warn('⚠️ roles 表可能尚未創建，返回空陣列');
        return {
          success: true,
          data: []
        };
      }
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    const roles = Array.isArray(result) ? result : [];
    
    console.log('✅ 從 Supabase roles 表取得的角色資料：', roles);
    console.log('📊 角色數量：', roles.length);
    
    return {
      success: true,
      data: roles
    };
  } catch (error) {
    console.error('❌ 取得角色資料時發生錯誤：', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      data: []
    };
  }
}

/**
 * 儲存角色到 Supabase roles 表
 */
export async function saveRoleToSupabase(role: Role): Promise<ApiResponse<Role>> {
  try {
    console.log('💾 準備儲存角色到 Supabase：', role);

    const roleData = {
      id: role.id,
      name: role.name,
      icon_name: role.icon_name || 'Briefcase',
      color: role.color || 'bg-blue-100 text-blue-700',
      level: role.level || 4,
      webhook: role.webhook || null,
      is_default: role.is_default || false
    };

    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(roleData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    const savedRole = Array.isArray(result) ? result[0] : result;

    console.log('✅ 角色已成功儲存到 Supabase');
    return {
      success: true,
      data: savedRole
    };
  } catch (error) {
    console.error('❌ 儲存角色時發生錯誤：', error);
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 更新 Supabase roles 表中的角色
 */
export async function updateRoleInSupabase(role: Role): Promise<ApiResponse<Role>> {
  try {
    console.log('🔄 準備更新角色到 Supabase：', role);

    const roleData: any = {
      name: role.name,
      icon_name: role.icon_name || 'Briefcase',
      color: role.color || 'bg-blue-100 text-blue-700',
      level: role.level || 4,
      is_default: role.is_default || false
    };

    // 只有當 webhook 有值時才更新（允許設為 null）
    if (role.webhook !== undefined) {
      roleData.webhook = role.webhook || null;
    }

    const response = await fetch(`${API_BASE_URL}/roles?id=eq.${role.id}`, {
      method: 'PATCH',
      headers: createHeaders(),
      body: JSON.stringify(roleData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    const updatedRole = Array.isArray(result) ? result[0] : result;

    console.log('✅ 角色已成功更新到 Supabase');
    return {
      success: true,
      data: updatedRole
    };
  } catch (error) {
    console.error('❌ 更新角色時發生錯誤：', error);
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 取得不重複的角色列表（從 users 表，向後相容）
 * 資料來源：Supabase 的 users 表中的 role 欄位
 * 功能：自動移除重複的角色，過濾掉空值
 */
export async function getRoles(): Promise<ApiResponse<string[]>> {
  try {
    console.log('🔄 開始從 Supabase 取得角色列表...');
    console.log('📋 查詢來源：users 表的 role 欄位');
    
    // 使用 PostgREST 的 select 參數，只獲取 role 欄位
    // 這樣可以大幅減少資料傳輸量
    const url = `${API_BASE_URL}/users?select=role`;
    console.log('📤 請求 URL：', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Supabase API 錯誤：', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    const roles = Array.isArray(result) ? result : [];
    
    console.log('📥 從 Supabase 取得的原始角色資料：', roles);
    console.log('📊 原始資料筆數：', roles.length);
    
    // 提取 role 值，過濾掉空值、null、undefined
    const roleValues = roles
      .map((item: any) => item.role)
      .filter((role: string | null | undefined) => {
        // 過濾掉 null、undefined、空字串、空白字串
        return role != null && role !== '' && role.trim() !== '';
      });
    
    console.log('📋 過濾後的 role 值：', roleValues);
    console.log('📊 過濾後筆數：', roleValues.length);
    
    // 使用 Set 移除重複的角色
    const uniqueRoles = Array.from(new Set(roleValues)) as string[];
    
    // 按字母順序排序（可選，讓列表更整齊）
    uniqueRoles.sort((a, b) => a.localeCompare(b, 'zh-TW'));
    
    console.log('✅ 去重後的不重複角色：', uniqueRoles);
    console.log('📊 最終角色數量：', uniqueRoles.length);
    
    return {
      success: true,
      data: uniqueRoles
    };
  } catch (error) {
    console.error('❌ 取得角色列表時發生錯誤：', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      data: []
    };
  }
}
