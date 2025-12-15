// ========================================
// 任務交辦系統 - Google Apps Script 後端
// 用於接收前端 React 應用程式資料並儲存到 Supabase
// ========================================

// Supabase 配置（請替換為你的 Supabase 專案資訊）
const SUPABASE_URL = "http://192.168.68.75:54321"; // 本地 Supabase API 服務（端口 54321）
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY"; // 你的 Supabase Anon Key
const SUPABASE_TABLE_TASKS = "tasks"; // 任務表名稱
const SUPABASE_TABLE_USERS = "users"; // 用戶表名稱

// ========================================
// 處理 POST 請求（接收前端資料）
// ========================================
function doPost(e) {
  Logger.log('========================================');
  Logger.log('🚀 doPost 函數開始執行');
  Logger.log('時間：' + new Date().toISOString());
  Logger.log('收到的事件物件：' + JSON.stringify(e ? Object.keys(e) : 'e is undefined'));
  Logger.log('========================================');
  
  try {
    // 檢查事件物件是否存在
    if (!e) {
      Logger.log('❌ 錯誤：事件物件 e 為 undefined');
      return createResponse({
        success: false,
        error: '事件物件不存在'
      });
    }
    
    if (!e.postData) {
      Logger.log('❌ 錯誤：e.postData 為 undefined');
      Logger.log('e 的內容：' + JSON.stringify(e));
      return createResponse({
        success: false,
        error: '缺少 POST 資料物件'
      });
    }
    
    if (!e.postData.contents) {
      Logger.log('❌ 錯誤：e.postData.contents 為 undefined');
      Logger.log('e.postData 的內容：' + JSON.stringify(e.postData));
      return createResponse({
        success: false,
        error: '缺少 POST 資料內容'
      });
    }
    
    // 解析 POST 資料
    const postData = JSON.parse(e.postData.contents);
    Logger.log('📋 收到資料：' + JSON.stringify(postData));
    
    // 判斷請求類型
    const action = postData.action;
    
    if (action === 'createTask') {
      // 建立新任務
      const result = saveTask(postData.task);
      return createResponse(result);
    } else if (action === 'createUser') {
      // 建立新員工
      const result = saveUser(postData.user);
      return createResponse(result);
    } else if (action === 'analyzeTaskWithAI') {
      // 使用 Gemini AI 分析任務描述
      const result = analyzeTaskWithAI(postData.description);
      return createResponse(result);
    } else if (action === 'updateTaskStatus') {
      // 更新任務狀態
      const result = updateTaskStatus(postData.taskId, postData.status);
      return createResponse(result);
    } else if (action === 'updateTaskResponse') {
      // 更新承辦人回覆
      const result = updateTaskResponse(postData.taskId, postData.response);
      return createResponse(result);
    } else if (action === 'addEvidence') {
      // 新增佐證資料
      const result = addEvidence(postData.taskId, postData.evidence);
      return createResponse(result);
    } else if (action === 'deleteEvidence') {
      // 刪除佐證資料
      const result = deleteEvidence(postData.taskId, postData.evidenceId);
      return createResponse(result);
    } else {
      // 預設為建立任務（向後相容）
      const result = saveTask(postData);
      return createResponse(result);
    }
    
  } catch (error) {
    Logger.log('❌ 錯誤：' + error.toString());
    Logger.log('錯誤堆疊：' + error.stack);
    return createResponse({
      success: false,
      error: error.toString()
    });
  }
}

// ========================================
// 處理 GET 請求（查詢資料）
// ========================================
function doGet(e) {
  Logger.log('========================================');
  Logger.log('🚀 doGet 函數開始執行');
  Logger.log('時間：' + new Date().toISOString());
  Logger.log('收到的事件物件：' + (e ? JSON.stringify(Object.keys(e)) : 'e is undefined'));
  Logger.log('========================================');
  
  try {
    // 檢查事件物件是否存在
    if (!e) {
      Logger.log('❌ 錯誤：事件物件 e 為 undefined');
      return createResponse({
        success: false,
        error: '事件物件不存在'
      });
    }
    
    // 檢查 parameter 是否存在
    if (!e.parameter) {
      Logger.log('❌ 錯誤：e.parameter 為 undefined');
      Logger.log('e 的內容：' + JSON.stringify(e));
      // 如果沒有參數，返回預設回應
      return createResponse({
        message: '任務交辦系統 API 服務運行中',
        timestamp: new Date().toISOString(),
        note: '沒有提供 action 參數'
      });
    }
    
    const action = e.parameter.action;
    Logger.log('收到的 action：' + action);
    
    if (action === 'getTasks') {
      // 查詢任務列表
      const roleCategory = e.parameter.roleCategory || 'all';
      Logger.log('查詢任務列表，職類：' + roleCategory);
      const result = getTasks(roleCategory);
      return createResponse(result);
    } else if (action === 'getUsers') {
      // 取得人員列表
      Logger.log('取得人員列表');
      const result = getUsers();
      return createResponse(result);
    } else if (action === 'getTask') {
      // 取得單一任務
      const taskId = parseInt(e.parameter.taskId);
      Logger.log('查詢任務：' + taskId);
      const result = getTask(taskId);
      return createResponse(result);
    } else if (action === 'analyzeTaskWithAI') {
      // 使用 Gemini AI 分析任務描述
      const description = e.parameter.description ? decodeURIComponent(e.parameter.description) : '';
      Logger.log('收到 AI 分析請求，描述長度：' + description.length);
      const result = analyzeTaskWithAI(description);
      return createResponse(result);
    }
    
    // 預設回應（沒有 action 參數時）
    Logger.log('沒有指定 action，返回預設回應');
    return createResponse({
      message: '任務交辦系統 API 服務運行中',
      timestamp: new Date().toISOString(),
      availableActions: ['getTasks', 'getUsers', 'getTask']
    });
  } catch (error) {
    Logger.log('❌ doGet 錯誤：' + error.toString());
    Logger.log('錯誤堆疊：' + error.stack);
    return createResponse({
      success: false,
      error: error.toString()
    });
  }
}

// ========================================
// Supabase API 輔助函數
// ========================================

/**
 * 執行 Supabase REST API 請求
 * @param {string} method - HTTP 方法 (GET, POST, PATCH, DELETE)
 * @param {string} table - 表格名稱
 * @param {object} data - 請求資料（可選）
 * @param {string} filter - 查詢過濾條件（可選，例如：id=eq.1）
 * @returns {object} API 回應資料
 */
function supabaseRequest(method, table, data = null, filter = '') {
  try {
    const config = getSupabaseConfig();
    if (!config) {
      throw new Error('Supabase 配置未設定，請設定 SUPABASE_URL 和 SUPABASE_ANON_KEY');
    }
    
    const url = `${config.url}/rest/v1/${table}${filter ? '?' + filter : ''}`;
    
    const options = {
      method: method,
      headers: {
        'apikey': config.key,
        'Authorization': `Bearer ${config.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation' // 返回插入/更新的資料
      },
      muteHttpExceptions: true
    };
    
    if (data && (method === 'POST' || method === 'PATCH')) {
      options.payload = JSON.stringify(data);
    }
    
    Logger.log(`📤 Supabase 請求：${method} ${url}`);
    if (data) {
      Logger.log(`📋 請求資料：${JSON.stringify(data)}`);
    }
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    Logger.log(`📥 Supabase 回應狀態碼：${responseCode}`);
    
    if (responseCode >= 200 && responseCode < 300) {
      // 成功回應
      if (responseText) {
        try {
          return JSON.parse(responseText);
        } catch (e) {
          return [];
        }
      }
      return [];
    } else {
      Logger.log(`❌ Supabase API 錯誤：${responseCode} - ${responseText}`);
      throw new Error(`Supabase API 錯誤：${responseCode} - ${responseText}`);
    }
  } catch (error) {
    Logger.log(`❌ Supabase 請求失敗：${error.toString()}`);
    throw error;
  }
}

/**
 * 從指令碼屬性讀取 Supabase 配置
 */
function getSupabaseConfig() {
  try {
    const url = PropertiesService.getScriptProperties().getProperty('SUPABASE_URL');
    const key = PropertiesService.getScriptProperties().getProperty('SUPABASE_ANON_KEY');
    
    if (url && key) {
      return { url: url, key: key };
    }
    
    // 如果指令碼屬性中沒有，使用常數（需要用戶設定）
    if (SUPABASE_URL !== "YOUR_SUPABASE_URL" && SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY") {
      return { url: SUPABASE_URL, key: SUPABASE_ANON_KEY };
    }
    
    Logger.log('⚠️ 找不到 Supabase 配置，請設定 SUPABASE_URL 和 SUPABASE_ANON_KEY');
    return null;
  } catch (error) {
    Logger.log('❌ 讀取 Supabase 配置時發生錯誤：' + error.toString());
    return null;
  }
}

// ========================================
// 建立回應（JSON 格式，包含 CORS headers）
// ========================================
function createResponse(data) {
  // Google Apps Script 的 ContentService 會自動處理 CORS
  // 但我們需要確保回應格式正確
  const output = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // 注意：Google Apps Script 的 Web App 部署設定中
  // 「具有存取權的使用者」必須選擇「任何人」
  // 這樣才能正確處理 CORS
  return output;
}

// ========================================
// 儲存任務到 Supabase
// ========================================
function saveTask(taskData) {
  Logger.log('📊 開始儲存任務到 Supabase...');
  
  try {
    // 取得人員姓名
    const assignerName = getUserName(taskData.assignerId);
    const assigneeName = getUserName(taskData.assigneeId);
    
    // 準備要寫入的資料
    const timestamp = new Date().toISOString();
    const taskId = taskData.id || Date.now();
    
    const insertData = {
      id: taskId,
      timestamp: timestamp,
      title: taskData.title || '',
      description: taskData.description || '',
      assigner_id: taskData.assignerId || null,
      assigner_name: assignerName,
      assignee_id: taskData.assigneeId || null,
      assignee_name: assigneeName,
      collaborator_ids: taskData.collaboratorIds || [],
      role_category: taskData.roleCategory || '',
      plan_date: taskData.dates?.plan || null,
      interim_date: taskData.dates?.interim || null,
      final_date: taskData.dates?.final || null,
      status: taskData.status || 'pending',
      assignee_response: taskData.assigneeResponse || '',
      evidence: taskData.evidence || []
    };
    
    // 插入資料到 Supabase
    const result = supabaseRequest('POST', SUPABASE_TABLE_TASKS, insertData);
    
    Logger.log('✅ 任務已成功儲存到 Supabase');
    
    return { 
      success: true, 
      taskId: taskId,
      data: result.length > 0 ? result[0] : insertData
    };
    
  } catch (error) {
    Logger.log('❌ 儲存任務時發生錯誤：' + error.toString());
    throw error;
  }
}

// ========================================
// 更新任務狀態
// ========================================
function updateTaskStatus(taskId, status) {
  Logger.log('🔄 更新任務狀態：' + taskId + ' -> ' + status);
  
  try {
    const updateData = {
      status: status
    };
    
    const filter = `id=eq.${taskId}`;
    const result = supabaseRequest('PATCH', SUPABASE_TABLE_TASKS, updateData, filter);
    
    if (result && result.length > 0) {
      Logger.log('✅ 任務狀態已更新');
      return { success: true, taskId: taskId, status: status, data: result[0] };
    } else {
      throw new Error('找不到任務 ID：' + taskId);
    }
    
  } catch (error) {
    Logger.log('❌ 更新任務狀態時發生錯誤：' + error.toString());
    throw error;
  }
}

// ========================================
// 更新承辦人回覆
// ========================================
function updateTaskResponse(taskId, response) {
  Logger.log('💬 更新承辦人回覆：' + taskId);
  
  try {
    // 先取得當前任務狀態
    const currentTask = getTask(taskId);
    let updateData = {
      assignee_response: response
    };
    
    // 如果狀態還是 pending，同時更新為 in_progress
    if (currentTask.success && currentTask.data && currentTask.data.status === 'pending') {
      updateData.status = 'in_progress';
    }
    
    const filter = `id=eq.${taskId}`;
    const result = supabaseRequest('PATCH', SUPABASE_TABLE_TASKS, updateData, filter);
    
    if (result && result.length > 0) {
      Logger.log('✅ 承辦人回覆已更新');
      return { success: true, taskId: taskId, data: result[0] };
    } else {
      throw new Error('找不到任務 ID：' + taskId);
    }
    
  } catch (error) {
    Logger.log('❌ 更新承辦人回覆時發生錯誤：' + error.toString());
    throw error;
  }
}

// ========================================
// 新增佐證資料
// ========================================
function addEvidence(taskId, evidence) {
  Logger.log('📎 新增佐證資料：' + taskId);
  
  try {
    // 先取得當前任務
    const currentTask = getTask(taskId);
    if (!currentTask.success || !currentTask.data) {
      throw new Error('找不到任務 ID：' + taskId);
    }
    
    // 取得現有的佐證資料
    let evidenceArray = currentTask.data.evidence || [];
    if (!Array.isArray(evidenceArray)) {
      evidenceArray = [];
    }
    
    // 新增佐證資料
    evidenceArray.push(evidence);
    
    // 更新任務
    const updateData = {
      evidence: evidenceArray
    };
    
    const filter = `id=eq.${taskId}`;
    const result = supabaseRequest('PATCH', SUPABASE_TABLE_TASKS, updateData, filter);
    
    if (result && result.length > 0) {
      Logger.log('✅ 佐證資料已新增');
      return { success: true, taskId: taskId, evidence: evidence, data: result[0] };
    } else {
      throw new Error('更新失敗');
    }
    
  } catch (error) {
    Logger.log('❌ 新增佐證資料時發生錯誤：' + error.toString());
    throw error;
  }
}

// ========================================
// 刪除佐證資料
// ========================================
function deleteEvidence(taskId, evidenceId) {
  Logger.log('🗑️ 刪除佐證資料：' + taskId + ' -> ' + evidenceId);
  
  try {
    // 先取得當前任務
    const currentTask = getTask(taskId);
    if (!currentTask.success || !currentTask.data) {
      throw new Error('找不到任務 ID：' + taskId);
    }
    
    // 取得現有的佐證資料
    let evidenceArray = currentTask.data.evidence || [];
    if (!Array.isArray(evidenceArray)) {
      evidenceArray = [];
    }
    
    // 刪除指定的佐證資料
    evidenceArray = evidenceArray.filter(e => e.id !== evidenceId);
    
    // 更新任務
    const updateData = {
      evidence: evidenceArray
    };
    
    const filter = `id=eq.${taskId}`;
    const result = supabaseRequest('PATCH', SUPABASE_TABLE_TASKS, updateData, filter);
    
    if (result && result.length > 0) {
      Logger.log('✅ 佐證資料已刪除');
      return { success: true, taskId: taskId, evidenceId: evidenceId, data: result[0] };
    } else {
      throw new Error('更新失敗');
    }
    
  } catch (error) {
    Logger.log('❌ 刪除佐證資料時發生錯誤：' + error.toString());
    throw error;
  }
}

// ========================================
// 查詢任務列表
// ========================================
function getTasks(roleCategory) {
  Logger.log('📋 查詢任務列表，職類：' + roleCategory);
  
  try {
    // 建立過濾條件
    let filter = '';
    if (roleCategory && roleCategory !== 'all') {
      filter = `role_category=eq.${roleCategory}`;
    }
    
    // 查詢 Supabase
    const result = supabaseRequest('GET', SUPABASE_TABLE_TASKS, null, filter);
    
    // 轉換資料格式以符合前端期望
    const tasks = result.map(task => {
      return {
        id: task.id,
        title: task.title || '',
        description: task.description || '',
        assignerId: task.assigner_id || null,
        assigneeId: task.assignee_id || null,
        collaboratorIds: task.collaborator_ids || [],
        roleCategory: task.role_category || '',
        dates: {
          plan: task.plan_date ? (task.plan_date instanceof Date ? task.plan_date.toISOString().split('T')[0] : task.plan_date.split('T')[0]) : '',
          interim: task.interim_date ? (task.interim_date instanceof Date ? task.interim_date.toISOString().split('T')[0] : task.interim_date.split('T')[0]) : '',
          final: task.final_date ? (task.final_date instanceof Date ? task.final_date.toISOString().split('T')[0] : task.final_date.split('T')[0]) : ''
        },
        status: task.status || 'pending',
        assigneeResponse: task.assignee_response || '',
        evidence: task.evidence || []
      };
    });
    
    Logger.log('✅ 查詢完成，總筆數：' + tasks.length);
    
    return {
      success: true,
      data: tasks
    };
    
  } catch (error) {
    Logger.log('❌ 查詢任務時發生錯誤：' + error.toString());
    return {
      success: false,
      error: error.toString(),
      data: []
    };
  }
}

// ========================================
// 取得單一任務
// ========================================
function getTask(taskId) {
  Logger.log('📋 查詢任務：' + taskId);
  
  try {
    const filter = `id=eq.${taskId}`;
    const result = supabaseRequest('GET', SUPABASE_TABLE_TASKS, null, filter);
    
    if (result && result.length > 0) {
      const task = result[0];
      
      // 轉換資料格式以符合前端期望
      const formattedTask = {
        id: task.id,
        title: task.title || '',
        description: task.description || '',
        assignerId: task.assigner_id || null,
        assigneeId: task.assignee_id || null,
        collaboratorIds: task.collaborator_ids || [],
        roleCategory: task.role_category || '',
        dates: {
          plan: task.plan_date ? (task.plan_date instanceof Date ? task.plan_date.toISOString().split('T')[0] : task.plan_date.split('T')[0]) : '',
          interim: task.interim_date ? (task.interim_date instanceof Date ? task.interim_date.toISOString().split('T')[0] : task.interim_date.split('T')[0]) : '',
          final: task.final_date ? (task.final_date instanceof Date ? task.final_date.toISOString().split('T')[0] : task.final_date.split('T')[0]) : ''
        },
        status: task.status || 'pending',
        assigneeResponse: task.assignee_response || '',
        evidence: task.evidence || []
      };
      
      return { success: true, data: formattedTask };
    }
    
    return { success: false, error: '找不到任務' };
    
  } catch (error) {
    Logger.log('❌ 查詢任務時發生錯誤：' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ========================================
// 儲存員工資料到 Supabase
// ========================================
function saveUser(userData) {
  Logger.log('📊 開始儲存員工資料到 Supabase...');
  
  try {
    // 準備要寫入的資料
    const timestamp = new Date().toISOString();
    const userId = userData.id || Date.now();
    
    const insertData = {
      id: userId,
      timestamp: timestamp,
      name: userData.name || '',
      role: userData.role || '',
      avatar: userData.avatar || '👤'
    };
    
    // 插入資料到 Supabase
    const result = supabaseRequest('POST', SUPABASE_TABLE_USERS, insertData);
    
    Logger.log('✅ 員工資料已成功儲存到 Supabase');
    
    return { 
      success: true, 
      userId: userId,
      data: result.length > 0 ? result[0] : insertData
    };
    
  } catch (error) {
    Logger.log('❌ 儲存員工資料時發生錯誤：' + error.toString());
    throw error;
  }
}

// ========================================
// 從指令碼屬性讀取 Gemini API Key
// ========================================
function getGeminiApiKey() {
  try {
    // 從指令碼屬性讀取 API Key
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    
    if (apiKey && apiKey.toString().startsWith('AIza')) {
      Logger.log('✅ 成功從指令碼屬性讀取 Gemini API Key');
      return apiKey.toString();
    }
    
    Logger.log('⚠️ 找不到 Gemini API Key，請確認指令碼屬性中已設定 GEMINI_API_KEY');
    Logger.log('設定步驟：');
    Logger.log('1. 在 Google Apps Script 編輯器中');
    Logger.log('2. 點擊「專案設定」（齒輪圖示）');
    Logger.log('3. 點擊「指令碼屬性」標籤');
    Logger.log('4. 新增屬性：名稱 = GEMINI_API_KEY，值 = 你的 API Key');
    
    return null;
  } catch (error) {
    Logger.log('❌ 讀取 Gemini API Key 時發生錯誤：' + error.toString());
    return null;
  }
}

// ========================================
// 使用 Gemini 2.5 Pro 分析任務描述
// ========================================
function analyzeTaskWithAI(description) {
  Logger.log('🤖 開始使用 Gemini AI 分析任務描述...');
  
  try {
    if (!description || description.trim() === '') {
      return {
        success: false,
        error: '任務描述為空'
      };
    }
    
    // 取得 API Key
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return {
        success: false,
        error: '找不到 Gemini API Key，請確認試算表中已設定 GEMINI_API_KEY'
      };
    }
    
    // 準備提示詞
    const prompt = `請將以下任務描述轉換為結構化的工作任務說明，使用繁體中文回答：

任務描述：
${description}

請以以下格式輸出：
1. 任務目標
2. 執行步驟（分點列出）
3. 注意事項（如果有）

請確保輸出清晰、具體、可執行。`;

    // 調用 Gemini API (使用 Gemini 2.5 Pro)
    // 如果 Gemini 2.5 Pro 不可用，可以改用 gemini-2.0-flash-exp 或 gemini-1.5-pro
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
    
    // 注意：如果要使用 Gemini 2.5 Pro，請將模型名稱改為：
    // gemini-2.5-pro (如果可用)
    // 或 gemini-1.5-pro (穩定版本)
    
    const payload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    Logger.log('📤 發送請求到 Gemini API...');
    const response = UrlFetchApp.fetch(apiUrl, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    Logger.log('📥 回應狀態碼：' + responseCode);
    
    if (responseCode !== 200) {
      Logger.log('❌ API 回應錯誤：' + responseText);
      return {
        success: false,
        error: `Gemini API 錯誤：${responseCode} - ${responseText}`
      };
    }
    
    // 解析回應
    const responseData = JSON.parse(responseText);
    
    if (!responseData.candidates || !responseData.candidates[0] || !responseData.candidates[0].content) {
      Logger.log('❌ API 回應格式錯誤：' + JSON.stringify(responseData));
      return {
        success: false,
        error: 'API 回應格式錯誤'
      };
    }
    
    const aiResponse = responseData.candidates[0].content.parts[0].text;
    
    Logger.log('✅ AI 分析完成');
    Logger.log('AI 回應：' + aiResponse.substring(0, 200) + '...');
    
    return {
      success: true,
      description: aiResponse
    };
    
  } catch (error) {
    Logger.log('❌ AI 分析時發生錯誤：' + error.toString());
    Logger.log('錯誤堆疊：' + error.stack);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ========================================
// 取得人員列表
// ========================================
function getUsers() {
  Logger.log('👥 取得人員列表');
  
  try {
    // 查詢 Supabase
    const result = supabaseRequest('GET', SUPABASE_TABLE_USERS);
    
    // 轉換資料格式
    const users = result.map(user => {
      return {
        id: user.id,
        name: user.name || '',
        role: user.role || '',
        avatar: user.avatar || '👤'
      };
    });
    
    // 如果沒有資料，返回預設人員列表
    if (users.length === 0) {
      Logger.log('⚠️ Supabase 中沒有人員資料，返回預設列表');
      return {
        success: true,
        data: [
          { id: 1, name: '陳主任', role: 'medical_admin', avatar: '👨‍⚕️' },
          { id: 2, name: '林護理長', role: 'nurse', avatar: '👩‍⚕️' },
          { id: 3, name: '張社工', role: 'social_worker', avatar: '🧑‍💼' },
          { id: 4, name: '王治療師', role: 'ot', avatar: '🧘' },
          { id: 5, name: '李專員', role: 'ward_ops', avatar: '👨‍💼' },
          { id: 6, name: '吳協調員', role: 'medical_admin', avatar: '👩‍💼' }
        ]
      };
    }
    
    Logger.log('✅ 取得人員列表，總數：' + users.length);
    
    return {
      success: true,
      data: users
    };
    
  } catch (error) {
    Logger.log('❌ 取得人員列表時發生錯誤：' + error.toString());
    // 發生錯誤時返回預設列表
    return {
      success: true,
      data: [
        { id: 1, name: '陳主任', role: 'medical_admin', avatar: '👨‍⚕️' },
        { id: 2, name: '林護理長', role: 'nurse', avatar: '👩‍⚕️' },
        { id: 3, name: '張社工', role: 'social_worker', avatar: '🧑‍💼' },
        { id: 4, name: '王治療師', role: 'ot', avatar: '🧘' },
        { id: 5, name: '李專員', role: 'ward_ops', avatar: '👨‍💼' },
        { id: 6, name: '吳協調員', role: 'medical_admin', avatar: '👩‍💼' }
      ]
    };
  }
}

// ========================================
// 取得人員姓名（根據 ID）
// ========================================
function getUserName(userId) {
  if (!userId) return '未指派';
  
  // 從 Supabase 查詢
  try {
    const filter = `id=eq.${userId}`;
    const result = supabaseRequest('GET', SUPABASE_TABLE_USERS, null, filter);
    
    if (result && result.length > 0) {
      return result[0].name || userId;
    }
  } catch (e) {
    Logger.log('⚠️ 查詢人員姓名失敗：' + e.toString());
  }
  
  // 如果找不到，返回預設對應表
  const defaultMap = {
    1: '陳主任',
    2: '林護理長',
    3: '張社工',
    4: '王治療師',
    5: '李專員',
    6: '吳協調員'
  };
  
  return defaultMap[userId] || userId || '未指派';
}

// ========================================
// 測試函數
// ========================================

/**
 * 測試 doPost - 建立任務
 */
function testSaveTask() {
  const testData = {
    id: Date.now(),
    title: '測試任務',
    description: '這是一個測試任務',
    assignerId: 1,
    assigneeId: 2,
    collaboratorIds: [3, 4],
    roleCategory: 'nurse',
    dates: {
      plan: '2024-01-01',
      interim: '2024-01-15',
      final: '2024-01-30'
    },
    status: 'pending',
    evidence: []
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        action: 'createTask',
        task: testData
      })
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log('測試結果：' + result.getContent());
}

/**
 * 測試 doPost - 建立員工
 */
function testSaveUser() {
  const testUserData = {
    id: Date.now(),
    name: '測試員工',
    role: 'nurse',
    avatar: '👩‍⚕️'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        action: 'createUser',
        user: testUserData
      })
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log('測試結果：' + result.getContent());
}

/**
 * 測試 doGet - 取得任務列表
 */
function testGetTasks() {
  const mockEvent = {
    parameter: {
      action: 'getTasks',
      roleCategory: 'all'
    }
  };
  
  const result = doGet(mockEvent);
  Logger.log('測試結果：' + result.getContent());
}

/**
 * 測試 doGet - 取得人員列表
 */
function testGetUsers() {
  const mockEvent = {
    parameter: {
      action: 'getUsers'
    }
  };
  
  const result = doGet(mockEvent);
  Logger.log('測試結果：' + result.getContent());
}

/**
 * 測試 doGet - 預設回應（沒有參數）
 */
function testGetDefault() {
  const mockEvent = {
    parameter: {}
  };
  
  const result = doGet(mockEvent);
  Logger.log('測試結果：' + result.getContent());
}

/**
 * 測試基本設定 - 檢查 Supabase 連接
 */
function testBasicSetup() {
  try {
    Logger.log('========================================');
    Logger.log('🔍 開始檢查基本設定...');
    Logger.log('========================================');
    
    // 檢查 Supabase 配置
    const config = getSupabaseConfig();
    if (config) {
      Logger.log('✅ Supabase URL：' + config.url);
      Logger.log('✅ Supabase Key：' + (config.key ? config.key.substring(0, 20) + '...' : '未設定'));
    } else {
      Logger.log('⚠️ Supabase 配置未設定');
      Logger.log('請在指令碼屬性中設定：');
      Logger.log('  - SUPABASE_URL');
      Logger.log('  - SUPABASE_ANON_KEY');
    }
    
    Logger.log('任務表名稱：' + SUPABASE_TABLE_TASKS);
    Logger.log('用戶表名稱：' + SUPABASE_TABLE_USERS);
    
    // 測試 Supabase 連接
    try {
      const testResult = supabaseRequest('GET', SUPABASE_TABLE_TASKS, null, 'limit=1');
      Logger.log('✅ Supabase 連接成功');
      Logger.log('   任務表查詢成功，返回 ' + testResult.length + ' 筆資料');
    } catch (e) {
      Logger.log('⚠️ Supabase 連接測試失敗：' + e.toString());
      Logger.log('   請確認 Supabase URL 和 API Key 設定正確');
    }
    
    Logger.log('========================================');
    Logger.log('✅ 基本設定檢查完成');
    Logger.log('========================================');
    
  } catch (error) {
    Logger.log('❌ 檢查失敗：' + error.toString());
    Logger.log('錯誤堆疊：' + error.stack);
  }
}

/**
 * 測試 Gemini AI 分析功能
 */
function testGeminiAPI() {
  const testDescription = '請幫我規劃下個月的員工訓練課程，需要包含新進人員培訓和主管管理課程，時間安排在週五下午';
  
  const mockEvent = {
    parameter: {
      action: 'analyzeTaskWithAI',
      description: testDescription
    }
  };
  
  const result = doGet(mockEvent);
  Logger.log('測試結果：' + result.getContent());
}

/**
 * 觸發權限授權（執行此函數會要求授權）
 */
function requestAuthorization() {
  Logger.log('🔐 開始請求授權...');
  
  try {
    // 嘗試調用一個簡單的外部 API 來觸發授權請求
    const testUrl = 'https://www.google.com';
    const response = UrlFetchApp.fetch(testUrl, {
      method: 'get',
      muteHttpExceptions: true
    });
    
    Logger.log('✅ 授權成功！狀態碼：' + response.getResponseCode());
    Logger.log('現在可以正常使用 Gemini API 了');
    
    return {
      success: true,
      message: '授權成功'
    };
  } catch (error) {
    Logger.log('❌ 授權失敗：' + error.toString());
    Logger.log('請按照以下步驟授權：');
    Logger.log('1. 在編輯器中執行此函數');
    Logger.log('2. 點擊「檢閱權限」');
    Logger.log('3. 選擇 Google 帳號');
    Logger.log('4. 點擊「進階」→「前往 [專案名稱]（不安全）」');
    Logger.log('5. 點擊「允許」');
    
    throw error;
  }
}

