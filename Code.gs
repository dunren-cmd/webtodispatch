// ========================================
// 任務交辦系統 - Google Apps Script 後端
// 用於接收前端 React 應用程式資料並儲存到 Supabase
// ========================================

// Supabase 配置（請替換為你的 Supabase 專案資訊）
const SUPABASE_URL = "http://192.168.62.101:54321"; // 本地 Supabase API 服務（端口 54321）
const SUPABASE_ANON_KEY = "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"; // 你的 Supabase Anon Key
const SUPABASE_TABLE_TASKS = "tasks"; // 任務表名稱
const SUPABASE_TABLE_USERS = "users"; // 用戶表名稱

// Google Chat Webhook 配置（請替換為實際的 Webhook URL）
// 如何取得 Webhook URL：
// 1. 在 Google Chat 中建立一個空間（Space）
// 2. 點擊空間設定 → 整合 → 新增 Webhook
// 3. 複製 Webhook URL 並設定到下方
const GOOGLE_CHAT_WEBHOOK_URL = ""; // 請填入您的 Google Chat Webhook URL

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
 * 優先順序：
 * 1. 指令碼屬性（PropertiesService）- 推薦使用
 * 2. 常數定義（SUPABASE_URL, SUPABASE_ANON_KEY）
 * 
 * 設定指令碼屬性：
 * 1. 在 Google Apps Script 編輯器中
 * 2. 點擊「專案設定」（齒輪圖示）
 * 3. 點擊「指令碼屬性」標籤
 * 4. 新增屬性：
 *    - SUPABASE_URL: http://你的IP:54321
 *    - SUPABASE_ANON_KEY: 你的Supabase_ANON_KEY
 */
function getSupabaseConfig() {
  try {
    const url = PropertiesService.getScriptProperties().getProperty('SUPABASE_URL');
    const key = PropertiesService.getScriptProperties().getProperty('SUPABASE_ANON_KEY');
    
    if (url && key) {
      Logger.log('✅ 從指令碼屬性讀取 Supabase 配置');
      return { url: url, key: key };
    }
    
    // 如果指令碼屬性中沒有，使用常數（需要用戶設定）
    if (SUPABASE_URL && SUPABASE_URL !== "YOUR_SUPABASE_URL" && 
        SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY") {
      Logger.log('⚠️ 使用常數定義的 Supabase 配置（建議改用指令碼屬性）');
      return { url: SUPABASE_URL, key: SUPABASE_ANON_KEY };
    }
    
    Logger.log('⚠️ 找不到 Supabase 配置');
    Logger.log('💡 請設定指令碼屬性或修改 Code.gs 中的常數');
    Logger.log('   指令碼屬性：SUPABASE_URL, SUPABASE_ANON_KEY');
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
  Logger.log('📋 收到的任務資料：' + JSON.stringify(taskData));
  
  try {
    // 支援兩種命名方式：assigneeId (駝峰) 或 assignee_id (底線)
    const assignerId = taskData.assignerId || taskData.assigner_id || null;
    const assigneeId = taskData.assigneeId || taskData.assignee_id || null;
    
    Logger.log(`🔍 解析後的 ID - 交辦人：${assignerId}，承辦人：${assigneeId}`);
    
    // 取得人員姓名
    const assignerName = getUserName(assignerId);
    const assigneeName = getUserName(assigneeId);
    
    Logger.log(`👤 人員姓名 - 交辦人：${assignerName}，承辦人：${assigneeName}`);
    
    // 準備要寫入的資料
    const timestamp = new Date().toISOString();
    const taskId = taskData.id || Date.now();
    
    const insertData = {
      id: taskId,
      timestamp: timestamp,
      title: taskData.title || '',
      description: taskData.description || '',
      assigner_id: assignerId,
      assigner_name: assignerName,
      assignee_id: assigneeId,
      assignee_name: assigneeName,
      collaborator_ids: taskData.collaboratorIds || taskData.collaborator_ids || [],
      role_category: taskData.roleCategory || taskData.role_category || '',
      plan_date: taskData.dates?.plan || taskData.plan_date || null,
      interim_date: taskData.dates?.interim || taskData.interim_date || null,
      final_date: taskData.dates?.final || taskData.final_date || null,
      status: taskData.status || 'pending',
      assignee_response: taskData.assigneeResponse || taskData.assignee_response || '',
      evidence: taskData.evidence || []
    };
    
    // 插入資料到 Supabase
    const result = supabaseRequest('POST', SUPABASE_TABLE_TASKS, insertData);
    
    Logger.log('✅ 任務已成功儲存到 Supabase');
    
    // 發送 Chat 通知給被指派人（交給誰）
    if (assigneeId) {
      Logger.log(`📧 準備發送 Chat 通知給承辦人 ID：${assigneeId}`);
      try {
        const assigneeEmail = getUserEmail(assigneeId);
        Logger.log(`📧 承辦人 email：${assigneeEmail || '未找到'}`);
        if (assigneeEmail) {
          const taskUrl = `http://192.168.62.101:3050?task=${taskId}`;
          const chatUrl = `${taskUrl}&chat=true`;
          
          // 構建通知訊息內容
          let message = `📋 您有新的任務被指派\n\n`;
          message += `任務標題：${taskData.title}\n`;
          if (taskData.description) {
            message += `\n任務說明：\n${taskData.description}\n`;
          }
          if (taskData.dates?.final) {
            const finalDate = new Date(taskData.dates.final);
            message += `\n⏰ 最終期限：${finalDate.toLocaleDateString('zh-TW')}\n`;
          }
          message += `\n交辦人：${assignerName}\n`;
          message += `\n請登入系統查看任務詳情並開始處理。`;
          
          // 發送 Google Chat 通知到個人（通過 email），並附加日曆事件
          // 這會發送 email，Google Chat 會自動同步顯示（如果用戶設定了 email 通知）
          const chatResult = sendChatNotificationToPerson(
            assigneeEmail,
            assigneeName,
            assignerName,
            message,
            taskData.title,
            chatUrl,
            taskData.dates // 傳入日期資訊用於創建日曆事件
          );
          
          if (chatResult.success) {
            Logger.log(`✅ Google Chat 通知已發送到個人（交給誰：${assigneeName}）`);
            Logger.log(`📧 通知方式：${chatResult.method || 'email'}`);
            if (chatResult.calendarSent) {
              Logger.log(`📅 日曆事件已附加到 email`);
            }
          } else {
            Logger.log(`⚠️ Google Chat 通知發送失敗：${chatResult.error}`);
            Logger.log(`💡 嘗試使用 Email 備用方案...`);
            // 如果 Chat 失敗，嘗試使用 Email 作為備用
            try {
              sendChatNotificationEmail(
                assigneeEmail,
                assigneeName,
                assignerName,
                message,
                taskData.title,
                chatUrl
              );
              Logger.log(`✅ Email 備用通知已發送`);
            } catch (emailError) {
              Logger.log(`⚠️ Email 備用通知也失敗：${emailError.toString()}`);
            }
          }
        } else {
          Logger.log(`⚠️ 找不到被指派人 ${assigneeId} 的 email，跳過 Chat 通知`);
          Logger.log(`💡 提示：請確認用戶 ID ${assigneeId} 在 users 表中存在，且 mail 欄位有設定 email`);
        }
      } catch (emailError) {
        // 發送通知失敗不影響任務建立
        Logger.log(`⚠️ 發送 Chat 通知失敗，但不影響任務建立：${emailError.toString()}`);
        Logger.log(`錯誤詳情：${emailError.stack || emailError}`);
      }
    } else {
      Logger.log(`⚠️ 任務沒有指定承辦人（assigneeId），跳過 Chat 通知`);
    }
    
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
// Email 通知功能
// ========================================

/**
 * 從 users 表取得用戶 email
 * @param {number} userId - 用戶 ID（對應到 users.id）
 * @returns {string|null} 用戶 email，找不到則返回 null
 */
function getUserEmail(userId) {
  if (!userId) {
    Logger.log(`⚠️ getUserEmail: userId 為空`);
    return null;
  }
  
  Logger.log(`🔍 開始查詢用戶 ID ${userId} 的 email...`);
  
  try {
    // 直接從 users 表取得 email（合併後 mail 欄位已存在於 users 表）
    const userFilter = `id=eq.${userId}`;
    Logger.log(`📋 查詢 users 表，filter: ${userFilter}`);
    const userResult = supabaseRequest('GET', SUPABASE_TABLE_USERS, null, userFilter);
    
    Logger.log(`📋 users 表查詢結果：${JSON.stringify(userResult)}`);
    
    if (!userResult || userResult.length === 0) {
      Logger.log(`⚠️ 找不到用戶 ID：${userId}`);
      return null;
    }
    
    const user = userResult[0];
    Logger.log(`📋 找到用戶資料：${JSON.stringify(user)}`);
    
    // 優先使用 mail 欄位（合併後的 email）
    if (user.mail) {
      Logger.log(`✅ 找到用戶 ${userId} 的 email：${user.mail}`);
      return user.mail;
    }
    
    // 也檢查 email 欄位（有些表可能使用 email 而不是 mail）
    if (user.email) {
      Logger.log(`✅ 找到用戶 ${userId} 的 email（從 email 欄位）：${user.email}`);
      return user.email;
    }
    
    Logger.log(`⚠️ 找不到用戶 ${userId} 的 email（已檢查 users.mail, users.email）`);
    return null;
  } catch (error) {
    Logger.log(`❌ 取得用戶 email 失敗：${error.toString()}`);
    Logger.log(`錯誤堆疊：${error.stack || ''}`);
    return null;
  }
}

/**
 * 發送任務指派通知
 * @param {string} assigneeEmail - 被指派人的 email
 * @param {string} assigneeName - 被指派人的姓名
 * @param {string} taskTitle - 任務標題
 * @param {string} taskDescription - 任務描述
 * @param {string} assignerName - 交辦人姓名
 * @param {string} taskUrl - 任務連結
 */
function sendTaskAssignmentEmail(assigneeEmail, assigneeName, taskTitle, taskDescription, assignerName, taskUrl) {
  try {
    const subject = `📋 新任務指派：${taskTitle}`;
    const htmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4f46e5;">📋 您有新的任務指派</h2>
            <p>親愛的 <strong>${assigneeName}</strong>，</p>
            <p><strong>${assignerName}</strong> 指派了一個新任務給您：</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">${taskTitle}</h3>
              <p style="margin-bottom: 0;">${taskDescription || '無詳細說明'}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${taskUrl}" 
                 style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                查看任務詳情
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              這是系統自動發送的通知郵件，請勿直接回覆。<br>
              如有問題，請登入系統查看任務詳情。
            </p>
          </div>
        </body>
      </html>
    `;
    
    MailApp.sendEmail({
      to: assigneeEmail,
      subject: subject,
      htmlBody: htmlBody
    });
    
    Logger.log(`✅ 任務指派通知已發送到：${assigneeEmail}`);
    return { success: true };
  } catch (error) {
    Logger.log(`❌ 發送 email 失敗：${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * 生成 iCal 格式的日曆事件文件
 * @param {string} title - 事件標題
 * @param {string} description - 事件描述
 * @param {Date} startDate - 開始日期
 * @param {Date} endDate - 結束日期（可選，如果沒有則使用開始日期+1小時）
 * @param {string} location - 地點（可選）
 * @param {string} url - 相關連結
 * @returns {string} iCal 格式的字串
 */
function generateICalFile(title, description, startDate, endDate, location, url) {
  const now = new Date();
  const uid = `task-${Date.now()}@${Session.getActiveUser().getEmail().split('@')[1]}`;
  
  // 如果沒有結束日期，設為開始日期+1小時
  if (!endDate) {
    endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
  }
  
  // 格式化日期為 iCal 格式 (YYYYMMDDTHHMMSSZ)
  function formatDate(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }
  
  // 轉義特殊字元
  function escapeText(text) {
    return String(text || '').replace(/\\/g, '\\\\')
                            .replace(/;/g, '\\;')
                            .replace(/,/g, '\\,')
                            .replace(/\n/g, '\\n');
  }
  
  let ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Task Dispatch System//Google Apps Script//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDate(now)}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${escapeText(title)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(location || '')}`,
    `URL:${escapeText(url || '')}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    `DESCRIPTION:提醒：${escapeText(title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  
  return ical;
}

/**
 * 發送 Google Chat 通知到個人（通過 email），並附加日曆事件
 * 使用 Google Chat API 直接發送到用戶的個人 Chat
 * @param {string} recipientEmail - 接收者的 email（必須是 Google Workspace email）
 * @param {string} recipientName - 接收者的姓名
 * @param {string} senderName - 發送者的姓名
 * @param {string} message - 訊息內容
 * @param {string} taskTitle - 任務標題
 * @param {string} chatUrl - 任務連結
 * @param {Object} dates - 日期物件 {plan, interim, final}
 */
function sendChatNotificationToPerson(recipientEmail, recipientName, senderName, message, taskTitle, chatUrl, dates) {
  try {
    // 使用 Google Chat API 發送到個人
    // 注意：這需要 OAuth 2.0 授權和 Google Chat API 啟用
    
    // 方法 1：使用 Google Chat API（需要設定 OAuth）
    // 這需要先在 Google Cloud Console 啟用 Google Chat API
    // 並設定 OAuth 2.0 憑證
    
    // 方法 2：發送 email，Google Chat 會自動同步（如果用戶設定了 email 通知）
    // 這是最簡單的方式，不需要額外設定
    
    Logger.log(`📧 準備發送 Chat 通知到個人：${recipientEmail}`);
    
    // 構建 email 內容，使用特殊格式讓 Google Chat 能夠識別
    const emailSubject = `💬 [Chat] ${taskTitle}`;
    const emailBody = `
📋 新任務指派通知

${recipientName}，您有新的任務被指派！

任務標題：${taskTitle}
交辦人：${senderName}

任務說明：
${message}

查看任務：${chatUrl}

---
這是來自任務交辦系統的自動通知
    `.trim();
    
    // 準備 email 附件（日曆事件）
    const attachments = [];
    let calendarSent = false;
    
    // 如果有最終期限，創建日曆事件
    if (dates && dates.final) {
      try {
        const finalDate = new Date(dates.final);
        // 設定為當天的開始時間（00:00）
        finalDate.setHours(0, 0, 0, 0);
        const endDate = new Date(finalDate);
        endDate.setHours(23, 59, 59); // 設為當天結束時間
        
        const calendarDescription = `任務：${taskTitle}\n\n交辦人：${senderName}\n\n${message}\n\n查看詳情：${chatUrl}`;
        const icalContent = generateICalFile(
          `📋 ${taskTitle}`,
          calendarDescription,
          finalDate,
          endDate,
          '',
          chatUrl
        );
        
        // 創建 Blob 作為附件
        const icalBlob = Utilities.newBlob(icalContent, 'text/calendar', 'task.ics');
        attachments.push(icalBlob);
        calendarSent = true;
        Logger.log(`📅 已生成日曆事件文件（最終期限：${dates.final}）`);
      } catch (calError) {
        Logger.log(`⚠️ 生成日曆事件失敗：${calError.toString()}`);
      }
    }
    
    // 如果有計畫日期，也創建一個日曆事件
    if (dates && dates.plan && dates.plan !== dates.final) {
      try {
        const planDate = new Date(dates.plan);
        planDate.setHours(9, 0, 0, 0); // 設為早上9點
        const planEndDate = new Date(planDate);
        planEndDate.setHours(10, 0, 0, 0); // 1小時後
        
        const planDescription = `計畫執行：${taskTitle}\n\n交辦人：${senderName}\n\n${message}\n\n查看詳情：${chatUrl}`;
        const planIcalContent = generateICalFile(
          `📅 計畫：${taskTitle}`,
          planDescription,
          planDate,
          planEndDate,
          '',
          chatUrl
        );
        
        const planIcalBlob = Utilities.newBlob(planIcalContent, 'text/calendar', 'plan.ics');
        attachments.push(planIcalBlob);
        Logger.log(`📅 已生成計畫日期日曆事件（計畫日期：${dates.plan}）`);
      } catch (planError) {
        Logger.log(`⚠️ 生成計畫日期日曆事件失敗：${planError.toString()}`);
      }
    }
    
    // 構建 HTML 內容，包含日曆提示
    let htmlContent = `
      <div style="font-family: Arial, 'Microsoft JhengHei', sans-serif;">
        <h2 style="color: #4f46e5;">📋 新任務指派通知</h2>
        <p><strong>${recipientName}</strong>，您有新的任務被指派！</p>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>任務標題：</strong>${taskTitle}</p>
          <p><strong>交辦人：</strong>${senderName}</p>
          ${dates && dates.final ? `<p><strong>⏰ 最終期限：</strong>${new Date(dates.final).toLocaleDateString('zh-TW')}</p>` : ''}
          ${dates && dates.plan ? `<p><strong>📅 計畫日期：</strong>${new Date(dates.plan).toLocaleDateString('zh-TW')}</p>` : ''}
        </div>
        
        <div style="margin: 20px 0;">
          <p><strong>任務說明：</strong></p>
          <p style="white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        
        ${calendarSent ? `
        <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4f46e5;">
          <p style="margin: 0; color: #1e40af;">
            📅 <strong>日曆事件已附加</strong>：請查看附件中的 .ics 文件，雙擊即可添加到 Google 日曆
          </p>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${chatUrl}" 
             style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            💬 查看任務並回覆
          </a>
        </div>
      </div>
    `;
    
    // 發送 email（Google Chat 會自動同步顯示）
    try {
      const emailOptions = {
        to: recipientEmail,
        subject: emailSubject,
        body: emailBody,
        htmlBody: htmlContent
      };
      
      // 如果有日曆附件，添加到 email
      if (attachments.length > 0) {
        emailOptions.attachments = attachments;
      }
      
      MailApp.sendEmail(emailOptions);
      
      Logger.log(`✅ Email 已發送到 ${recipientEmail}，Google Chat 會自動同步顯示`);
      if (calendarSent) {
        Logger.log(`📅 日曆事件已附加（${attachments.length} 個 .ics 文件）`);
      }
      return { success: true, method: 'email', calendarSent: calendarSent };
    } catch (emailError) {
      Logger.log(`⚠️ Email 發送失敗：${emailError.toString()}`);
      return { success: false, error: emailError.toString() };
    }
  } catch (error) {
    Logger.log(`❌ 發送 Chat 通知失敗：${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * 發送 Google Chat 通知（使用 Webhook，發送到空間）
 * @param {string} recipientEmail - 接收者的 email（用於識別，實際發送到 Chat Webhook）
 * @param {string} recipientName - 接收者的姓名
 * @param {string} senderName - 發送者的姓名
 * @param {string} message - 訊息內容
 * @param {string} taskTitle - 任務標題
 * @param {string} chatUrl - 任務連結
 */
function sendChatNotification(recipientEmail, recipientName, senderName, message, taskTitle, chatUrl) {
  try {
    // 檢查是否設定了 Webhook URL
    if (!GOOGLE_CHAT_WEBHOOK_URL || GOOGLE_CHAT_WEBHOOK_URL === "") {
      Logger.log('⚠️ Google Chat Webhook URL 未設定');
      Logger.log('💡 請在 Code.gs 頂部設定 GOOGLE_CHAT_WEBHOOK_URL 變數');
      Logger.log('💡 取得 Webhook URL：Google Chat → 空間設定 → 整合 → 新增 Webhook');
      return { success: false, error: 'Google Chat Webhook URL 未設定' };
    }
    
    // 構建 Google Chat 卡片訊息格式
    const chatMessage = {
      "cards": [
        {
          "header": {
            "title": `📋 新任務指派：${taskTitle}`,
            "subtitle": `來自 ${senderName}`,
            "imageUrl": "https://fonts.gstatic.com/s/i/productlogos/gmail_2020/v1/192px.svg",
            "imageStyle": "AVATAR"
          },
          "sections": [
            {
              "widgets": [
                {
                  "textParagraph": {
                    "text": `<b>${recipientName}</b>，您有新的任務被指派！`
                  }
                }
              ]
            },
            {
              "widgets": [
                {
                  "keyValue": {
                    "topLabel": "任務標題",
                    "content": taskTitle
                  }
                },
                {
                  "keyValue": {
                    "topLabel": "交辦人",
                    "content": senderName
                  }
                }
              ]
            },
            {
              "widgets": [
                {
                  "textParagraph": {
                    "text": `<b>任務說明：</b><br/>${message.replace(/\n/g, '<br/>')}`
                  }
                }
              ]
            },
            {
              "widgets": [
                {
                  "buttons": [
                    {
                      "textButton": {
                        "text": "💬 查看任務並回覆",
                        "onClick": {
                          "openLink": {
                            "url": chatUrl
                          }
                        }
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
    
    // 發送到 Google Chat Webhook
    const options = {
      'method': 'post',
      'contentType': 'application/json',
      'payload': JSON.stringify(chatMessage),
      'muteHttpExceptions': true
    };
    
    const response = UrlFetchApp.fetch(GOOGLE_CHAT_WEBHOOK_URL, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode === 200) {
      Logger.log(`✅ Google Chat 通知已發送成功`);
      Logger.log(`📧 接收者：${recipientName} (${recipientEmail})`);
      return { success: true };
    } else {
      Logger.log(`❌ Google Chat 通知發送失敗，狀態碼：${responseCode}`);
      Logger.log(`回應內容：${responseText}`);
      return { success: false, error: `HTTP ${responseCode}: ${responseText}` };
    }
  } catch (error) {
    Logger.log(`❌ 發送 Google Chat 通知失敗：${error.toString()}`);
    Logger.log(`錯誤堆疊：${error.stack || ''}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * 發送聊天訊息通知（Email 版本，保留作為備用）
 * @param {string} recipientEmail - 接收者的 email
 * @param {string} recipientName - 接收者的姓名
 * @param {string} senderName - 發送者的姓名
 * @param {string} message - 訊息內容
 * @param {string} taskTitle - 任務標題
 * @param {string} chatUrl - 聊天連結
 */
function sendChatNotificationEmail(recipientEmail, recipientName, senderName, message, taskTitle, chatUrl) {
  try {
    // 檢查是否有 Email 發送權限
    try {
      // 嘗試取得當前用戶的 email 來測試權限
      Session.getActiveUser().getEmail();
    } catch (permError) {
      Logger.log('⚠️ 尚未授權 Email 發送權限');
      Logger.log('💡 請執行 requestEmailAuthorization() 函數來完成授權');
      throw new Error('需要授權 Email 發送權限。請執行 requestEmailAuthorization() 函數。');
    }
    
    const subject = `📋 新任務指派：${taskTitle}`;
    // 將訊息中的換行符轉換為 HTML 換行
    const formattedMessage = message.replace(/\n/g, '<br>');
    
    const htmlBody = `
      <html>
        <body style="font-family: Arial, 'Microsoft JhengHei', sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4f46e5; border-bottom: 3px solid #4f46e5; padding-bottom: 10px;">📋 您有新的任務指派</h2>
            <p style="font-size: 16px;">親愛的 <strong style="color: #1f2937;">${recipientName}</strong>，</p>
            <p style="font-size: 16px;"><strong style="color: #4f46e5;">${senderName}</strong> 指派了一個新任務給您：</p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4f46e5; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="margin-top: 0; color: #1f2937; font-size: 18px;">${taskTitle}</h3>
              <div style="color: #4b5563; line-height: 1.8;">
                ${formattedMessage}
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${chatUrl}" 
                 style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);">
                💬 查看任務並回覆
              </a>
            </div>
            
            <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                💡 <strong>提示：</strong>點擊上方按鈕可直接進入任務頁面，您可以在聊天區回覆任務進度或提出問題。
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              這是系統自動發送的通知郵件，請勿直接回覆。<br>
              如有問題，請登入系統查看任務詳情。
            </p>
          </div>
        </body>
      </html>
    `;
    
    MailApp.sendEmail({
      to: recipientEmail,
      subject: subject,
      htmlBody: htmlBody
    });
    
    Logger.log(`✅ Chat 通知已發送到：${recipientEmail}`);
    return { success: true };
  } catch (error) {
    Logger.log(`❌ 發送 email 失敗：${error.toString()}`);
    return { success: false, error: error.toString() };
  }
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
 * 測試發送 Chat 通知 Email 到 chimi951@gmail.com（模擬任務交接）
 */
function testSendEmailToChimi() {
  Logger.log('🧪 開始測試：模擬任務交接後發送 Chat 通知到 chimi951@gmail.com');
  
  try {
    // 模擬任務交接的訊息
    const taskTitle = '測試任務：系統功能驗證';
    const taskDescription = '這是一個測試任務，用來驗證任務交接後的 Chat 通知功能。當任務發布後，系統會自動發送通知 email 給被指派人。';
    const assignerName = '系統管理員';
    const assigneeName = '測試用戶';
    const message = `您有新的任務「${taskTitle}」被指派。\n\n${taskDescription}\n\n請登入系統查看任務詳情並開始處理。`;
    const chatUrl = 'http://192.168.62.101:3050?task=999999&chat=true';
    
    const result = sendChatNotificationToPerson(
      'chimi951@gmail.com',        // recipientEmail
      assigneeName,                 // recipientName
      assignerName,                 // senderName
      message,                      // message
      taskTitle,                    // taskTitle
      chatUrl                       // chatUrl
    );
    
    if (result.success) {
      Logger.log('✅ 測試 Chat 通知 email 發送成功！');
      Logger.log('📧 收件人：chimi951@gmail.com');
      Logger.log('📋 任務標題：' + taskTitle);
      Logger.log('請檢查 chimi951@gmail.com 的收件匣');
    } else {
      Logger.log('❌ 測試 email 發送失敗：' + result.error);
    }
    
    return result;
  } catch (error) {
    Logger.log('❌ 測試失敗：' + error.toString());
    Logger.log('錯誤堆疊：' + error.stack);
    
    // 如果是授權錯誤，提供提示
    if (error.toString().includes('權限') || error.toString().includes('permission')) {
      Logger.log('💡 提示：首次使用需要授權，請執行 requestAuthorization() 函數');
    }
    
    return { success: false, error: error.toString() };
  }
}

/**
 * 測試完整的任務交接流程（建立任務 + 發送通知）
 */
function testTaskAssignmentWithNotification() {
  Logger.log('🧪 測試完整任務交接流程');
  
  try {
    // 建立一個測試任務
    const testTask = {
      id: Date.now(),
      title: '測試任務：驗證通知功能',
      description: '這是一個測試任務，用來驗證任務交接後會自動發送 Chat 通知。',
      assignerId: 1,
      assigneeId: 2, // 假設這是需要通知的用戶 ID
      collaboratorIds: [],
      roleCategory: 'nurse',
      dates: {
        plan: new Date().toISOString().split('T')[0],
        interim: '',
        final: ''
      },
      status: 'pending',
      evidence: []
    };
    
    // 儲存任務（這會觸發通知）
    const saveResult = saveTask(testTask);
    
    if (saveResult.success) {
      Logger.log('✅ 任務已建立，ID：' + saveResult.taskId);
      Logger.log('📧 系統應該已自動發送 Chat 通知給被指派人');
    } else {
      Logger.log('❌ 任務建立失敗');
    }
    
    return saveResult;
  } catch (error) {
    Logger.log('❌ 測試失敗：' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * 測試取得用戶 email（通過 ID）
 */
function testGetUserEmail() {
  Logger.log('🧪 測試取得用戶 email');
  
  // 測試不同的用戶 ID
  const testUserIds = [1, 2, 3];
  
  testUserIds.forEach(userId => {
    const email = getUserEmail(userId);
    Logger.log(`用戶 ID ${userId} 的 email：${email || '未找到'}`);
  });
}

/**
 * 觸發 Email 發送權限授權（執行此函數會要求授權）
 * 這是首次使用 MailApp.sendEmail 時必須執行的函數
 */
function requestEmailAuthorization() {
  Logger.log('🔐 開始請求 Email 發送權限...');
  Logger.log('📧 這將觸發 Google Apps Script 的授權流程');
  
  try {
    // 嘗試發送一封測試 email 來觸發授權請求
    // 這會彈出授權對話框
    MailApp.sendEmail({
      to: Session.getActiveUser().getEmail(), // 發送給自己
      subject: '📧 Email 權限測試',
      body: '這是一封測試郵件，用於觸發 Google Apps Script 的 Email 發送權限。\n\n如果您收到這封郵件，表示權限已成功授權！',
      htmlBody: '<p>這是一封測試郵件，用於觸發 Google Apps Script 的 Email 發送權限。</p><p>如果您收到這封郵件，表示權限已成功授權！</p>'
    });
    
    Logger.log('✅ Email 權限授權成功！');
    Logger.log('📧 測試郵件已發送到：' + Session.getActiveUser().getEmail());
    Logger.log('現在可以正常使用 Chat 通知功能了！');
    
    return {
      success: true,
      message: 'Email 權限授權成功'
    };
  } catch (error) {
    Logger.log('❌ 授權過程發生錯誤：' + error.toString());
    
    if (error.toString().includes('permission') || error.toString().includes('權限')) {
      Logger.log('');
      Logger.log('📋 請按照以下步驟完成授權：');
      Logger.log('1. 在 Google Apps Script 編輯器中，點擊上方的「檢閱權限」按鈕');
      Logger.log('2. 選擇您的 Google 帳號');
      Logger.log('3. 點擊「進階」');
      Logger.log('4. 點擊「前往 [專案名稱]（不安全）」');
      Logger.log('5. 點擊「允許」');
      Logger.log('6. 授權完成後，再次執行此函數或直接使用 Chat 通知功能');
    }
    
    throw error;
  }
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

