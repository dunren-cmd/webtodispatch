// ========================================
// 任務交辦系統 - Google Apps Script 後端
// 用於接收前端 React 應用程式資料並儲存到 Google Sheets
// ========================================

// Google Sheets ID（請替換為你的試算表 ID）
const SPREADSHEET_ID = "1Y_DdF0sGFjSqCi9SPelZlkF6Mz32q5O0XNjdPOaq-c8";
const TASKS_SHEET_NAME = "交辦紀錄";
const USERS_SHEET_NAME = "人員管理_交辦";

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
// 儲存任務到 Google Sheets
// ========================================
function saveTask(taskData) {
  Logger.log('📊 開始儲存任務到 Google Sheets...');
  
  try {
    // 開啟試算表
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(TASKS_SHEET_NAME);
    
    // 如果工作表不存在，則創建它
    if (!sheet) {
      sheet = ss.insertSheet(TASKS_SHEET_NAME);
      // 設定標題列
      const headers = [
        '時間戳記',           // A欄
        '任務ID',            // B欄
        '任務標題',           // C欄
        '任務描述',           // D欄
        '交辦人ID',          // E欄
        '交辦人姓名',         // F欄
        '承辦人ID',          // G欄
        '承辦人姓名',         // H欄
        '協作者IDs',         // I欄（JSON 陣列）
        '職類歸屬',          // J欄
        '計畫日期',          // K欄
        '期中日期',          // L欄
        '最終日期',          // M欄
        '狀態',             // N欄
        '承辦人回覆',         // O欄
        '佐證資料'           // P欄（JSON 陣列）
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      // 設定標題列格式
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#2563eb')
        .setFontColor('white');
    }
    
    // 取得人員姓名
    const assignerName = getUserName(taskData.assignerId);
    const assigneeName = getUserName(taskData.assigneeId);
    
    // 準備要寫入的資料
    const timestamp = new Date();
    const taskId = taskData.id || Date.now();
    
    const rowData = [
      timestamp,                                    // 時間戳記
      taskId,                                       // 任務ID
      taskData.title || '',                        // 任務標題
      taskData.description || '',                  // 任務描述
      taskData.assignerId || '',                   // 交辦人ID
      assignerName,                                // 交辦人姓名
      taskData.assigneeId || '',                   // 承辦人ID
      assigneeName,                                // 承辦人姓名
      JSON.stringify(taskData.collaboratorIds || []), // 協作者IDs（JSON）
      taskData.roleCategory || '',                 // 職類歸屬
      taskData.dates?.plan || '',                  // 計畫日期
      taskData.dates?.interim || '',               // 期中日期
      taskData.dates?.final || '',                 // 最終日期
      taskData.status || 'pending',                // 狀態
      taskData.assigneeResponse || '',             // 承辦人回覆
      JSON.stringify(taskData.evidence || [])     // 佐證資料（JSON）
    ];
    
    // 寫入資料
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, rowData.length).setValues([rowData]);
    
    Logger.log('✅ 任務已成功儲存到第 ' + (lastRow + 1) + ' 列');
    
    return { 
      success: true, 
      taskId: taskId,
      row: lastRow + 1 
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
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(TASKS_SHEET_NAME);
    
    if (!sheet) {
      throw new Error('找不到工作表：' + TASKS_SHEET_NAME);
    }
    
    // 找到任務所在的行
    const lastRow = sheet.getLastRow();
    const taskIdColumn = 2; // B欄是任務ID
    
    for (let i = 2; i <= lastRow; i++) {
      const cellValue = sheet.getRange(i, taskIdColumn).getValue();
      if (cellValue == taskId) {
        // 更新狀態（N欄，第14欄）
        sheet.getRange(i, 14).setValue(status);
        Logger.log('✅ 任務狀態已更新');
        return { success: true, taskId: taskId, status: status };
      }
    }
    
    throw new Error('找不到任務 ID：' + taskId);
    
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
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(TASKS_SHEET_NAME);
    
    if (!sheet) {
      throw new Error('找不到工作表：' + TASKS_SHEET_NAME);
    }
    
    // 找到任務所在的行
    const lastRow = sheet.getLastRow();
    const taskIdColumn = 2; // B欄是任務ID
    
    for (let i = 2; i <= lastRow; i++) {
      const cellValue = sheet.getRange(i, taskIdColumn).getValue();
      if (cellValue == taskId) {
        // 更新承辦人回覆（O欄，第15欄）
        sheet.getRange(i, 15).setValue(response);
        // 同時更新狀態為 in_progress（如果還是 pending）
        const currentStatus = sheet.getRange(i, 14).getValue();
        if (currentStatus === 'pending') {
          sheet.getRange(i, 14).setValue('in_progress');
        }
        Logger.log('✅ 承辦人回覆已更新');
        return { success: true, taskId: taskId };
      }
    }
    
    throw new Error('找不到任務 ID：' + taskId);
    
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
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(TASKS_SHEET_NAME);
    
    if (!sheet) {
      throw new Error('找不到工作表：' + TASKS_SHEET_NAME);
    }
    
    // 找到任務所在的行
    const lastRow = sheet.getLastRow();
    const taskIdColumn = 2; // B欄是任務ID
    const evidenceColumn = 16; // P欄是佐證資料
    
    for (let i = 2; i <= lastRow; i++) {
      const cellValue = sheet.getRange(i, taskIdColumn).getValue();
      if (cellValue == taskId) {
        // 取得現有的佐證資料
        const evidenceJson = sheet.getRange(i, evidenceColumn).getValue();
        let evidenceArray = [];
        if (evidenceJson) {
          try {
            evidenceArray = JSON.parse(evidenceJson);
          } catch (e) {
            Logger.log('⚠️ 解析現有佐證資料失敗，使用空陣列');
          }
        }
        
        // 新增佐證資料
        evidenceArray.push(evidence);
        
        // 寫回
        sheet.getRange(i, evidenceColumn).setValue(JSON.stringify(evidenceArray));
        Logger.log('✅ 佐證資料已新增');
        return { success: true, taskId: taskId, evidence: evidence };
      }
    }
    
    throw new Error('找不到任務 ID：' + taskId);
    
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
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(TASKS_SHEET_NAME);
    
    if (!sheet) {
      throw new Error('找不到工作表：' + TASKS_SHEET_NAME);
    }
    
    // 找到任務所在的行
    const lastRow = sheet.getLastRow();
    const taskIdColumn = 2; // B欄是任務ID
    const evidenceColumn = 16; // P欄是佐證資料
    
    for (let i = 2; i <= lastRow; i++) {
      const cellValue = sheet.getRange(i, taskIdColumn).getValue();
      if (cellValue == taskId) {
        // 取得現有的佐證資料
        const evidenceJson = sheet.getRange(i, evidenceColumn).getValue();
        let evidenceArray = [];
        if (evidenceJson) {
          try {
            evidenceArray = JSON.parse(evidenceJson);
          } catch (e) {
            Logger.log('⚠️ 解析現有佐證資料失敗');
            throw new Error('無法解析佐證資料');
          }
        }
        
        // 刪除指定的佐證資料
        evidenceArray = evidenceArray.filter(e => e.id !== evidenceId);
        
        // 寫回
        sheet.getRange(i, evidenceColumn).setValue(JSON.stringify(evidenceArray));
        Logger.log('✅ 佐證資料已刪除');
        return { success: true, taskId: taskId, evidenceId: evidenceId };
      }
    }
    
    throw new Error('找不到任務 ID：' + taskId);
    
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
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(TASKS_SHEET_NAME);
    
    if (!sheet) {
      return { success: true, data: [] };
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, data: [] };
    }
    
    // 讀取所有資料（跳過標題列）
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 16);
    const values = dataRange.getValues();
    
    // 轉換為任務物件陣列
    const tasks = values.map((row, index) => {
      // 解析 JSON 欄位
      let collaboratorIds = [];
      let evidence = [];
      
      try {
        if (row[8]) collaboratorIds = JSON.parse(row[8]);
      } catch (e) {
        Logger.log('⚠️ 解析協作者IDs失敗：' + row[8]);
      }
      
      try {
        if (row[15]) evidence = JSON.parse(row[15]);
      } catch (e) {
        Logger.log('⚠️ 解析佐證資料失敗：' + row[15]);
      }
      
      return {
        id: row[1] || (index + 2),
        title: row[2] || '',
        description: row[3] || '',
        assignerId: row[4] || null,
        assigneeId: row[6] || null,
        collaboratorIds: collaboratorIds,
        roleCategory: row[9] || '',
        dates: {
          plan: row[10] ? (row[10] instanceof Date ? row[10].toISOString().split('T')[0] : row[10]) : '',
          interim: row[11] ? (row[11] instanceof Date ? row[11].toISOString().split('T')[0] : row[11]) : '',
          final: row[12] ? (row[12] instanceof Date ? row[12].toISOString().split('T')[0] : row[12]) : ''
        },
        status: row[13] || 'pending',
        assigneeResponse: row[14] || '',
        evidence: evidence
      };
    });
    
    // 根據職類過濾
    let filteredTasks = tasks;
    if (roleCategory && roleCategory !== 'all') {
      filteredTasks = tasks.filter(t => t.roleCategory === roleCategory);
    }
    
    Logger.log('✅ 查詢完成，總筆數：' + filteredTasks.length);
    
    return {
      success: true,
      data: filteredTasks
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
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(TASKS_SHEET_NAME);
    
    if (!sheet) {
      return { success: false, error: '找不到工作表' };
    }
    
    const lastRow = sheet.getLastRow();
    const taskIdColumn = 2; // B欄是任務ID
    
    for (let i = 2; i <= lastRow; i++) {
      const cellValue = sheet.getRange(i, taskIdColumn).getValue();
      if (cellValue == taskId) {
        // 讀取整行資料
        const row = sheet.getRange(i, 1, 1, 16).getValues()[0];
        
        // 解析 JSON 欄位
        let collaboratorIds = [];
        let evidence = [];
        
        try {
          if (row[8]) collaboratorIds = JSON.parse(row[8]);
        } catch (e) {}
        
        try {
          if (row[15]) evidence = JSON.parse(row[15]);
        } catch (e) {}
        
        const task = {
          id: row[1] || taskId,
          title: row[2] || '',
          description: row[3] || '',
          assignerId: row[4] || null,
          assigneeId: row[6] || null,
          collaboratorIds: collaboratorIds,
          roleCategory: row[9] || '',
          dates: {
            plan: row[10] ? (row[10] instanceof Date ? row[10].toISOString().split('T')[0] : row[10]) : '',
            interim: row[11] ? (row[11] instanceof Date ? row[11].toISOString().split('T')[0] : row[11]) : '',
            final: row[12] ? (row[12] instanceof Date ? row[12].toISOString().split('T')[0] : row[12]) : ''
          },
          status: row[13] || 'pending',
          assigneeResponse: row[14] || '',
          evidence: evidence
        };
        
        return { success: true, data: task };
      }
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
// 儲存員工資料到 Google Sheets
// ========================================
function saveUser(userData) {
  Logger.log('📊 開始儲存員工資料到 Google Sheets...');
  
  try {
    // 開啟試算表
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(USERS_SHEET_NAME);
    
    // 如果工作表不存在，則創建它
    if (!sheet) {
      sheet = ss.insertSheet(USERS_SHEET_NAME);
      // 設定標題列
      const headers = [
        '時間戳記',           // A欄
        '人員ID',            // B欄
        '姓名',              // C欄
        '角色',              // D欄
        '頭像'               // E欄
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      // 設定標題列格式
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#2563eb')
        .setFontColor('white');
    }
    
    // 準備要寫入的資料
    const timestamp = new Date();
    const userId = userData.id || Date.now();
    
    const rowData = [
      timestamp,                    // 時間戳記
      userId,                       // 人員ID
      userData.name || '',          // 姓名
      userData.role || '',          // 角色
      userData.avatar || '👤'      // 頭像
    ];
    
    // 寫入資料
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, rowData.length).setValues([rowData]);
    
    Logger.log('✅ 員工資料已成功儲存到第 ' + (lastRow + 1) + ' 列');
    
    return { 
      success: true, 
      userId: userId,
      row: lastRow + 1 
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
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(USERS_SHEET_NAME);
    
    // 如果工作表不存在，返回預設人員列表
    if (!sheet) {
      Logger.log('⚠️ 找不到人員管理_交辦工作表，返回預設列表');
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
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, data: [] };
    }
    
    // 讀取所有資料（假設欄位：時間戳記、人員ID、姓名、角色、頭像）
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 5);
    const values = dataRange.getValues();
    
    const users = values.map((row, index) => {
      return {
        id: row[1] || (index + 1),
        name: row[2] || '',
        role: row[3] || '',
        avatar: row[4] || '👤'
      };
    });
    
    Logger.log('✅ 取得人員列表，總數：' + users.length);
    
    return {
      success: true,
      data: users
    };
    
  } catch (error) {
    Logger.log('❌ 取得人員列表時發生錯誤：' + error.toString());
    return {
      success: false,
      error: error.toString(),
      data: []
    };
  }
}

// ========================================
// 取得人員姓名（根據 ID）
// ========================================
function getUserName(userId) {
  if (!userId) return '未指派';
  
  // 先從人員管理_交辦工作表查詢
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(USERS_SHEET_NAME);
    
    if (sheet) {
      const lastRow = sheet.getLastRow();
      const userIdColumn = 2; // 假設 B欄是人員ID
      const nameColumn = 3; // 假設 C欄是姓名
      
      for (let i = 2; i <= lastRow; i++) {
        const cellValue = sheet.getRange(i, userIdColumn).getValue();
        if (cellValue == userId) {
          return sheet.getRange(i, nameColumn).getValue() || userId;
        }
      }
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
 * 測試基本設定 - 檢查試算表和工作表
 */
function testBasicSetup() {
  try {
    Logger.log('========================================');
    Logger.log('🔍 開始檢查基本設定...');
    Logger.log('========================================');
    
    // 檢查試算表 ID
    Logger.log('試算表 ID：' + SPREADSHEET_ID);
    Logger.log('任務工作表名稱：' + TASKS_SHEET_NAME);
    Logger.log('人員工作表名稱：' + USERS_SHEET_NAME);
    
    // 嘗試開啟試算表
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('✅ 成功開啟試算表：' + ss.getName());
    
    // 列出所有工作表
    const sheets = ss.getSheets();
    Logger.log('試算表中的工作表：');
    sheets.forEach(function(sheet) {
      Logger.log('  - ' + sheet.getName());
    });
    
    // 檢查任務工作表
    let taskSheet = ss.getSheetByName(TASKS_SHEET_NAME);
    if (taskSheet) {
      Logger.log('✅ 找到任務工作表：「' + TASKS_SHEET_NAME + '」');
      Logger.log('   資料列數：' + taskSheet.getLastRow());
    } else {
      Logger.log('⚠️ 找不到任務工作表：「' + TASKS_SHEET_NAME + '」');
      Logger.log('   程式會在首次建立任務時自動建立');
    }
    
    // 檢查人員工作表
    let userSheet = ss.getSheetByName(USERS_SHEET_NAME);
    if (userSheet) {
      Logger.log('✅ 找到人員工作表：「' + USERS_SHEET_NAME + '」');
      Logger.log('   資料列數：' + userSheet.getLastRow());
    } else {
      Logger.log('⚠️ 找不到人員工作表：「' + USERS_SHEET_NAME + '」');
      Logger.log('   程式會在首次建立員工時自動建立');
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

