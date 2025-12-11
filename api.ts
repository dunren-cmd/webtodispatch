// ========================================
// API 服務 - 用於與 Google Apps Script 後端通訊
// ========================================

// Google Apps Script Web App URL（請替換為你的 Web App URL）
const API_URL = 'https://script.google.com/macros/s/AKfycbzpdPkr96-Kc36TAYU3poKqOw2Do6GpXi6AMgJWgUDft9uD8EBoGyw4-VRJOgiiMAqZKw/exec';

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
  avatar: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  taskId?: number;
  row?: number;
}

// ========================================
// API 函數
// ========================================

/**
 * 建立新任務
 */
export async function createTask(task: Omit<Task, 'id'>): Promise<ApiResponse<Task>> {
  try {
    const taskData = {
      action: 'createTask',
      task: {
        ...task,
        id: Date.now() // 前端生成 ID
      }
    };

    console.log('準備發送任務資料：', taskData);

    // Google Apps Script Web App 的特殊處理
    // 移除 Content-Type header 以避免 CORS preflight 問題
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors', // 使用 no-cors 模式避免 CORS 問題
      cache: 'no-cache',
      redirect: 'follow',
      body: JSON.stringify(taskData),
    });

    // 注意：no-cors 模式下無法讀取回應，所以我們假設成功
    // 實際的驗證需要透過重新載入任務列表來確認
    console.log('請求已發送（no-cors 模式）');
    
    // 返回成功回應，實際驗證透過重新載入資料
    return {
      success: true,
      taskId: Date.now()
    };

  } catch (error) {
    console.error('建立任務時發生錯誤：', error);
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    
    // 檢查是否為 CORS 或網路錯誤
    if (errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('CORS')) {
      return {
        success: false,
        error: '無法連接到伺服器。請確認：\n1. Google Apps Script Web App 已正確部署\n2. 部署時選擇「具有存取權的使用者：任何人」\n3. 重新部署 Web App（每次修改 Code.gs 後都需要重新部署）\n4. 檢查瀏覽器 Console 的詳細錯誤訊息',
      };
    }
    
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
    // Google Apps Script Web App 的特殊處理
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      redirect: 'follow',
      body: JSON.stringify({
        action: 'updateTaskStatus',
        taskId: taskId,
        status: status
      }),
    });
    
    // no-cors 模式下無法讀取回應
    return { success: true };

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse = await response.json();
    return result;
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
    // Google Apps Script Web App 的特殊處理
    const response_data = await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      redirect: 'follow',
      body: JSON.stringify({
        action: 'updateTaskResponse',
        taskId: taskId,
        response: response
      }),
    });
    
    // no-cors 模式下無法讀取回應
    return { success: true };

    if (!response_data.ok) {
      throw new Error(`HTTP error! status: ${response_data.status}`);
    }

    const result: ApiResponse = await response_data.json();
    return result;
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
    // Google Apps Script Web App 的特殊處理
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      redirect: 'follow',
      body: JSON.stringify({
        action: 'addEvidence',
        taskId: taskId,
        evidence: evidence
      }),
    });
    
    // no-cors 模式下無法讀取回應
    return { success: true, evidence: evidence };

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Evidence> = await response.json();
    return result;
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
    // Google Apps Script Web App 的特殊處理
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      redirect: 'follow',
      body: JSON.stringify({
        action: 'deleteEvidence',
        taskId: taskId,
        evidenceId: evidenceId
      }),
    });
    
    // no-cors 模式下無法讀取回應
    return { success: true };

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse = await response.json();
    return result;
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
    const params = new URLSearchParams({
      action: 'getTasks',
      roleCategory: roleCategory
    });

    const response = await fetch(`${API_URL}?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Task[]> = await response.json();
    return result;
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
    const params = new URLSearchParams({
      action: 'getTask',
      taskId: taskId.toString()
    });

    const response = await fetch(`${API_URL}?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Task> = await response.json();
    return result;
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
    const userData = {
      action: 'createUser',
      user: {
        ...user,
        id: Date.now() // 前端生成 ID
      }
    };

    console.log('準備發送員工資料：', userData);

    // Google Apps Script Web App 的特殊處理
    // 移除 Content-Type header 以避免 CORS preflight 問題
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors', // 使用 no-cors 模式避免 CORS 問題
      cache: 'no-cache',
      redirect: 'follow',
      body: JSON.stringify(userData),
    });

    // 注意：no-cors 模式下無法讀取回應，所以我們假設成功
    // 實際的驗證需要透過重新載入員工列表來確認
    console.log('請求已發送（no-cors 模式）');
    
    // 返回成功回應，實際驗證透過重新載入資料
    return {
      success: true,
      userId: Date.now()
    };

  } catch (error) {
    console.error('建立員工時發生錯誤：', error);
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    
    if (errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('CORS')) {
      return {
        success: false,
        error: '無法連接到伺服器。請確認 Web App 已正確部署並選擇「任何人」可以存取',
      };
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 使用 Gemini AI 分析任務描述
 */
export async function analyzeTaskWithAI(description: string): Promise<ApiResponse<{ description: string }>> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      redirect: 'follow',
      body: JSON.stringify({
        action: 'analyzeTaskWithAI',
        description: description
      }),
    });

    // no-cors 模式下無法讀取回應，需要改用 GET 方式或等待後重新查詢
    // 這裡我們返回一個標記，讓前端知道請求已發送
    console.log('AI 分析請求已發送');
    
    // 由於 no-cors 限制，我們需要改用其他方式
    // 暫時返回成功，實際結果需要透過其他方式取得
    return {
      success: true,
      data: { description: 'AI 分析中，請稍候...' }
    };
  } catch (error) {
    console.error('AI 分析時發生錯誤：', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    };
  }
}

/**
 * 使用 Gemini AI 分析任務描述（使用 GET 方式，透過 doGet 處理）
 */
export async function analyzeTaskWithAIGet(description: string): Promise<ApiResponse<{ description: string }>> {
  try {
    // 使用 GET 方式，將描述編碼在 URL 中
    const encodedDescription = encodeURIComponent(description);
    const params = new URLSearchParams({
      action: 'analyzeTaskWithAI',
      description: encodedDescription
    });

    const response = await fetch(`${API_URL}?${params.toString()}`, {
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
 * 取得人員列表
 */
export async function getUsers(): Promise<ApiResponse<User[]>> {
  try {
    const params = new URLSearchParams({
      action: 'getUsers'
    });

    const response = await fetch(`${API_URL}?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<User[]> = await response.json();
    return result;
  } catch (error) {
    console.error('取得人員列表時發生錯誤：', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      data: []
    };
  }
}

