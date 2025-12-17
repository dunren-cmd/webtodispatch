# 角色管理：從 users.role 提取不重複的角色

## 🎯 功能說明

角色管理現在會自動從 `users` 表的 `role` 欄位中提取**不重複**的值來顯示角色。

---

## 🔄 運作方式

### 1. 自動提取角色

當 `users` 資料載入後，系統會：
- 從所有 `users` 記錄中提取 `role` 欄位的值
- 過濾掉重複的值（使用 `Set`）
- 過濾掉空值（`null`、`undefined`、空字串）

### 2. 角色優先順序

1. **預設角色**（`DEFAULT_ROLES`）：如果 `role` 值在預設角色中，使用預設的圖示、顏色、名稱
2. **自訂角色**（localStorage）：如果 `role` 值在自訂角色中，使用自訂的設定
3. **動態角色**：如果 `role` 值不在上述兩者中，自動創建新角色（使用預設圖示和顏色）

### 3. 自動更新

當 `users` 資料更新時，角色列表會自動重新計算，確保顯示所有不重複的角色。

---

## 📝 程式碼說明

### 新增的函數

```typescript
// 從 users 中提取不重複的角色
const extractRolesFromUsers = (users: User[]): Role[] => {
  // 取得所有不重複的 role 值
  const uniqueRoles = Array.from(new Set(users.map(u => u.role).filter(Boolean)));
  
  return uniqueRoles.map(roleId => {
    // 先檢查是否在預設角色中
    const defaultRole = DEFAULT_ROLES.find(r => r.id === roleId);
    if (defaultRole) {
      return defaultRole;
    }
    
    // 檢查是否在自訂角色中
    const customRoles = loadCustomRoles();
    const customRole = customRoles.find(r => r.id === roleId);
    if (customRole) {
      return customRole;
    }
    
    // 如果都不存在，創建一個新的角色（使用預設圖示和顏色）
    return {
      id: roleId,
      name: roleId, // 如果沒有名稱，使用 ID 作為名稱
      icon: Briefcase, // 預設圖示
      color: 'bg-gray-100 text-gray-700', // 預設顏色
      isDefault: false
    };
  });
};
```

### 修改的函數

```typescript
// 取得所有角色（預設 + 自訂 + 從 users 提取的）
const getAllRoles = (users: User[] = []): Role[] => {
  const customRoles = loadCustomRoles();
  const userRoles = extractRolesFromUsers(users);
  
  // 合併所有角色，避免重複（以 id 為準）
  const roleMap = new Map<string, Role>();
  
  // 先加入預設角色
  DEFAULT_ROLES.forEach(role => roleMap.set(role.id, role));
  
  // 再加入自訂角色（不會覆蓋預設角色）
  customRoles.forEach(role => {
    if (!roleMap.has(role.id)) {
      roleMap.set(role.id, role);
    }
  });
  
  // 最後加入從 users 提取的角色（不會覆蓋已存在的）
  userRoles.forEach(role => {
    if (!roleMap.has(role.id)) {
      roleMap.set(role.id, role);
    }
  });
  
  return Array.from(roleMap.values());
};
```

### 自動更新機制

```typescript
// 當 users 更新時，重新載入角色（從 users.role 提取不重複的角色）
useEffect(() => {
  setRoles(getAllRoles(users));
}, [users]);
```

---

## 💡 範例

### 假設 users 表中有以下資料：

| id | name | role |
|----|------|------|
| 1 | 張三 | `medical_admin` |
| 2 | 李四 | `nurse` |
| 3 | 王五 | `ward_ops` |
| 4 | 趙六 | `主任` |
| 5 | 錢七 | `medical_admin` |

### 提取結果：

系統會提取以下**不重複**的角色：
- `medical_admin`（預設角色，使用預設圖示和名稱）
- `nurse`（預設角色，使用預設圖示和名稱）
- `ward_ops`（預設角色，使用預設圖示和名稱）
- `主任`（動態角色，使用預設圖示，名稱顯示為「主任」）

---

## ✅ 優點

1. **自動同步**：角色列表會自動反映 `users` 表中的實際角色
2. **不重複**：自動過濾重複的角色值
3. **向後相容**：保留預設角色和自訂角色的功能
4. **動態擴展**：新的角色值會自動出現在角色管理中

---

## ⚠️ 注意事項

1. **角色名稱**：如果角色不在預設或自訂列表中，名稱會顯示為 `role` 的值（例如：`主任`）
2. **圖示和顏色**：動態創建的角色使用預設的圖示和顏色
3. **編輯功能**：可以通過「新增角色」功能為動態角色設定名稱、圖示、顏色

---

## 🔍 查看 SQL 查詢

如果想在 Supabase 中查看所有不重複的角色，可以使用：

```sql
SELECT DISTINCT role 
FROM users 
WHERE role IS NOT NULL 
ORDER BY role;
```

這會顯示 `users` 表中所有不重複的 `role` 值。
