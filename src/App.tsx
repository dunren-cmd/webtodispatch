import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  Mic, 
  Bot, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  BarChart3, 
  Upload, 
  Image as ImageIcon,
  Activity,
  Stethoscope,
  HeartPulse,
  Briefcase,
  Link as LinkIcon,
  ExternalLink,
  FolderOpen,
  X
} from 'lucide-react';
import { 
  createTask, 
  updateTaskStatus, 
  updateTaskResponse, 
  addEvidence, 
  deleteEvidence, 
  getTasks, 
  getUsers,
  createUser,
  analyzeTaskWithAIGet,
  type Task,
  type User,
  type Evidence
} from '../api';

// --- Constants ---

const ROLES = [
  { id: 'medical_admin', name: '醫務專員', icon: Briefcase, color: 'bg-blue-100 text-blue-700' },
  { id: 'nurse', name: '護理師', icon: HeartPulse, color: 'bg-pink-100 text-pink-700' },
  { id: 'ward_ops', name: '病房業務', icon: Activity, color: 'bg-green-100 text-green-700' },
  { id: 'social_worker', name: '社工師', icon: Users, color: 'bg-orange-100 text-orange-700' },
  { id: 'ot', name: '職能治療師', icon: Stethoscope, color: 'bg-purple-100 text-purple-700' },
];

// --- Utility Functions ---

const getStatusColor = (task: Task) => {
  const today = new Date().toISOString().split('T')[0];
  if (task.status === 'done') return 'bg-emerald-50 text-emerald-900 border-emerald-200';
  if (task.dates.final < today && task.status !== 'done') return 'bg-red-50 text-red-900 border-red-200';
  if (task.status === 'in_progress') return 'bg-blue-50 text-blue-900 border-blue-200';
  return 'bg-gray-50 text-gray-800 border-gray-200'; // Pending
};

const getStatusLabel = (task: Task) => {
  const today = new Date().toISOString().split('T')[0];
  if (task.status === 'done') return '已完成';
  if (task.dates.final < today && task.status !== 'done') return '已逾期';
  if (task.status === 'in_progress') return '進行中';
  return '待處理';
};

// --- Components ---

const UserSelector = ({ label, users, selectedId, onSelect, multiple = false, selectedIds = [] }: {
  label: string;
  users: User[];
  selectedId?: number | null;
  onSelect: (id: number | number[]) => void;
  multiple?: boolean;
  selectedIds?: number[];
}) => {
  const handleSelect = (id: number) => {
    if (multiple) {
      if (selectedIds.includes(id)) {
        onSelect(selectedIds.filter(uid => uid !== id));
      } else {
        onSelect([...selectedIds, id]);
      }
    } else {
      onSelect(id);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      {users.length === 0 ? (
        <div className="text-sm text-slate-400 italic p-2 bg-slate-50 rounded border border-slate-200">
          目前沒有員工資料，請先到「員工管理」新增員工
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {users.map(user => {
            const isSelected = multiple ? selectedIds.includes(user.id) : selectedId === user.id;
            return (
                <button
                    key={user.id}
                    onClick={() => handleSelect(user.id)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-full border transition-all ${
                    isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    <span className="text-lg">{user.avatar}</span>
                    <span className="text-sm font-medium">{user.name}</span>
                    {isSelected && <CheckCircle size={14} className="ml-1" />}
                </button>
            )
        })}
        </div>
      )}
    </div>
  );
};

const EvidenceDisplay = ({ evidence, onDelete }: { evidence: Evidence; onDelete?: () => void }) => {
    if (!evidence) return null;

    if (evidence.type === 'stat') {
        return (
            <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-center justify-center min-w-[120px] shadow-sm relative group">
                {onDelete && <button onClick={onDelete} className="absolute top-1 right-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>}
                <div className="text-xs text-slate-500 mb-1">{evidence.label}</div>
                <div className="text-2xl font-bold text-indigo-600 flex items-baseline">
                    {evidence.value}
                    {evidence.sub && <span className="text-xs text-slate-400 ml-1 font-normal">{evidence.sub}</span>}
                </div>
                {evidence.trend && <div className="text-xs text-emerald-500 flex items-center mt-1">▲ 較上月成長</div>}
            </div>
        );
    }

    if (evidence.type === 'link') {
        return (
            <a href={evidence.url} target="_blank" rel="noreferrer" className="flex items-center bg-blue-50 border border-blue-100 rounded-lg p-3 text-blue-700 hover:bg-blue-100 transition-colors relative group min-w-[200px]">
                {onDelete && (
                    <button 
                        onClick={(e) => { e.preventDefault(); onDelete(); }} 
                        className="absolute top-1 right-1 text-blue-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                        <X size={14}/>
                    </button>
                )}
                <div className="bg-white p-2 rounded-full mr-3 shadow-sm">
                    {evidence.name?.includes('Folder') || evidence.name?.includes('資料夾') ? <FolderOpen size={20} className="text-blue-500"/> : <LinkIcon size={20} className="text-blue-500"/>}
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="text-xs text-blue-400 font-bold mb-0.5">Google Drive / 連結</div>
                    <div className="text-sm font-medium truncate w-full">{evidence.name}</div>
                </div>
                <ExternalLink size={14} className="ml-2 opacity-50"/>
            </a>
        );
    }

    if (evidence.type === 'image') {
        return (
            <div className="relative group rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                <img src={evidence.url} alt={evidence.name} className="h-24 w-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all pointer-events-none"/>
                {onDelete && (
                    <button 
                        onClick={onDelete} 
                        className="absolute top-1 right-1 bg-white rounded-full p-1 text-slate-400 hover:text-red-500 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={14}/>
                    </button>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 px-2 py-1 text-xs truncate border-t">
                    {evidence.name}
                </div>
            </div>
        );
    }
    return null;
};

const TaskCard = ({ task, users, onUpdateStatus, onUpdateResponse, onAddEvidence, onDeleteEvidence }: {
  task: Task;
  users: User[];
  onUpdateStatus: (taskId: number, status: Task['status']) => void;
  onUpdateResponse: (taskId: number, response: string) => void;
  onAddEvidence: (taskId: number, type: 'stat' | 'image' | 'link') => void;
  onDeleteEvidence: (taskId: number, evidenceId: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [responseEdit, setResponseEdit] = useState(task.assigneeResponse || '');
  const [isEditingResponse, setIsEditingResponse] = useState(false);

  const assigner = users.find(u => u.id === task.assignerId);
  const assignee = users.find(u => u.id === task.assigneeId);

  const handleSaveResponse = () => {
    onUpdateResponse(task.id, responseEdit);
    setIsEditingResponse(false);
  };

  return (
    <div className={`mb-4 rounded-xl border-l-4 shadow-sm bg-white transition-all ${getStatusColor(task)}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded border font-bold ${getStatusColor(task).replace('bg-white', '')}`}>
                    {getStatusLabel(task)}
                </span>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {ROLES.find(r => r.id === task.roleCategory)?.name || '未分類'}
                </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">{task.title}</h3>
          </div>
          <button className="text-slate-400 hover:text-slate-600 ml-2">
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>

        {/* Quick People View */}
        <div className="flex items-center space-x-4 text-sm text-slate-600 mb-4 bg-white bg-opacity-50 p-2 rounded-lg border border-slate-100">
          <div className="flex items-center" title="交辦人">
            <span className="text-xs text-slate-400 mr-1">交辦:</span>
            <span>{assigner?.avatar} {assigner?.name}</span>
          </div>
          <div className="w-px h-4 bg-slate-300"></div>
          <div className="flex items-center" title="承辦人">
            <span className="text-xs text-slate-400 mr-1">承辦:</span>
            <span>{assignee?.avatar} {assignee?.name}</span>
          </div>
        </div>

        {/* Dates Preview (Always visible) */}
        <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
            <div className="bg-white p-2 rounded border border-slate-100 text-center">
                <div className="text-slate-400 mb-0.5 text-[10px]">計畫</div>
                <div className="font-semibold text-slate-700">{task.dates.plan}</div>
            </div>
            <div className="bg-white p-2 rounded border border-orange-100 text-center">
                <div className="text-slate-400 mb-0.5 text-[10px]">期中</div>
                <div className="font-semibold text-orange-600">{task.dates.interim}</div>
            </div>
            <div className="bg-white p-2 rounded border border-red-100 text-center">
                <div className="text-slate-400 mb-0.5 text-[10px]">最終</div>
                <div className="font-semibold text-red-600">{task.dates.final}</div>
            </div>
        </div>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="mt-4 border-t pt-4 space-y-6 animate-fade-in">
            
            {/* 1. Task Description */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 mb-2 flex items-center uppercase tracking-wider">
                    <Bot size={14} className="mr-1 text-indigo-500"/> 任務說明 (AI 生成)
                </h4>
                <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed pl-1">
                    {task.description}
                </div>
            </div>

            {/* 2. Assignee Response */}
            <div>
                <h4 className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between uppercase tracking-wider">
                    <span className="flex items-center">
                        <Users size={14} className="mr-1 text-emerald-600"/> 
                        承辦人回覆
                    </span>
                    {!isEditingResponse && (
                        <button 
                            onClick={() => setIsEditingResponse(true)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            編輯內容
                        </button>
                    )}
                </h4>
                
                {isEditingResponse ? (
                    <div className="space-y-2">
                        <textarea 
                            className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
                            rows={3}
                            value={responseEdit}
                            onChange={(e) => setResponseEdit(e.target.value)}
                            placeholder="請輸入辦理步驟..."
                        />
                        <div className="flex justify-end space-x-2">
                            <button 
                                onClick={() => setIsEditingResponse(false)}
                                className="px-3 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded"
                            >
                                取消
                            </button>
                            <button 
                                onClick={handleSaveResponse}
                                className="px-3 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            >
                                儲存
                            </button>
                        </div>
                    </div>
                ) : (
                    <div 
                        className="bg-white border border-slate-200 p-3 rounded-lg text-sm text-slate-600 min-h-[50px] cursor-pointer hover:border-emerald-300 transition-colors"
                        onClick={() => setIsEditingResponse(true)}
                    >
                        {task.assigneeResponse || <span className="text-slate-400 italic">點擊此處輸入執行步驟...</span>}
                    </div>
                )}
            </div>

            {/* 3. Evidence & Stats */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center justify-between uppercase tracking-wider">
                    <span className="flex items-center">
                        <BarChart3 size={16} className="mr-1.5 text-blue-600"/> 
                        任務成果與佐證 (圖片/數據/連結)
                    </span>
                </h4>

                {/* Action Buttons to Add Evidence */}
                <div className="flex space-x-2 mb-4">
                    <button 
                        onClick={() => onAddEvidence(task.id, 'stat')}
                        className="flex-1 bg-white border border-slate-200 text-slate-600 py-1.5 px-2 rounded hover:bg-slate-50 hover:text-indigo-600 transition-colors text-xs flex items-center justify-center font-medium"
                    >
                        <Activity size={14} className="mr-1"/> + 統計數據
                    </button>
                    <button 
                        onClick={() => onAddEvidence(task.id, 'image')}
                        className="flex-1 bg-white border border-slate-200 text-slate-600 py-1.5 px-2 rounded hover:bg-slate-50 hover:text-indigo-600 transition-colors text-xs flex items-center justify-center font-medium"
                    >
                        <ImageIcon size={14} className="mr-1"/> + 上傳圖片
                    </button>
                    <button 
                        onClick={() => onAddEvidence(task.id, 'link')}
                        className="flex-1 bg-white border border-slate-200 text-slate-600 py-1.5 px-2 rounded hover:bg-slate-50 hover:text-indigo-600 transition-colors text-xs flex items-center justify-center font-medium"
                    >
                        <LinkIcon size={14} className="mr-1"/> + Drive 連結
                    </button>
                </div>
                
                {/* Evidence Grid Display */}
                <div className="flex flex-wrap gap-3">
                    {task.evidence && task.evidence.length > 0 ? (
                        task.evidence.map((ev) => (
                            <EvidenceDisplay 
                                key={ev.id} 
                                evidence={ev} 
                                onDelete={() => onDeleteEvidence(task.id, ev.id)}
                            />
                        ))
                    ) : (
                        <div className="w-full text-center text-xs text-slate-400 py-4 border-2 border-dashed border-slate-200 rounded-lg">
                            尚無佐證資料，請點擊上方按鈕新增
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-2">
                {task.status !== 'done' && (
                    <button 
                        onClick={() => onUpdateStatus(task.id, 'done')}
                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center shadow-md transform active:scale-95 transition-all"
                    >
                        <CheckCircle size={16} className="mr-2"/> 
                        確認任務完成
                    </button>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CreateTaskForm = ({ users, onCancel, onCreate }: {
  users: User[];
  onCancel: () => void;
  onCreate: (task: Omit<Task, 'id'>) => void;
}) => {
    const [formData, setFormData] = useState({
        title: '',
        rawDescription: '',
        aiDescription: '',
        assignerId: null as number | null,
        assigneeId: null as number | null,
        collaboratorIds: [] as number[],
        roleCategory: 'medical_admin',
        dates: { plan: '', interim: '', final: '' }
    });
    
    const [isListening, setIsListening] = useState(false);
    const [isProcessingAI, setIsProcessingAI] = useState(false);

    const simulateVoiceInput = () => {
        setIsListening(true);
        setTimeout(() => {
            setIsListening(false);
            setFormData(prev => ({
                ...prev,
                rawDescription: '請幫我請李專員去規劃一下這個季度的病房滿意度調查，然後記得要跟護理長還有社工一起討論，大概下個月中要給我結果，中間要先回報一次。'
            }));
        }, 1500);
    };

    const processWithAI = async () => {
        if (!formData.rawDescription) {
            alert('請先輸入任務描述');
            return;
        }
        
        setIsProcessingAI(true);
        
        try {
            const result = await analyzeTaskWithAIGet(formData.rawDescription);
            
            if (result.success && result.data) {
                setFormData(prev => ({
                    ...prev,
                    aiDescription: result.data.description
                }));
            } else {
                alert('AI 分析失敗：' + (result.error || '未知錯誤'));
            }
        } catch (error) {
            console.error('AI 分析時發生錯誤：', error);
            alert('AI 分析時發生錯誤，請稍後再試');
        } finally {
            setIsProcessingAI(false);
        }
    };

    const handleSubmit = () => {
        if (!formData.title || !formData.assigneeId || !formData.dates.final) {
            alert('請填寫完整資訊 (標題、承辦人、最終期限)');
            return;
        }
        onCreate({
            title: formData.title,
            description: formData.aiDescription || formData.rawDescription,
            assignerId: formData.assignerId,
            assigneeId: formData.assigneeId,
            collaboratorIds: formData.collaboratorIds,
            roleCategory: formData.roleCategory,
            dates: formData.dates,
            status: 'pending',
            evidence: []
        });
    };
    
    return (
        <div className="bg-white rounded-xl shadow-lg border p-6 animate-fade-in">
        <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center">
            <Plus className="mr-2" /> 新增交辦任務
        </h2>

        {/* Roles Selection */}
        <UserSelector 
            label="1. 誰交辦？ (交辦人)" 
            users={users} 
            selectedId={formData.assignerId}
            onSelect={(id) => setFormData({...formData, assignerId: id as number})}
        />
        
        <UserSelector 
            label="2. 交給誰？ (承辦人)" 
            users={users} 
            selectedId={formData.assigneeId}
            onSelect={(id) => setFormData({...formData, assigneeId: id as number})}
        />

        <UserSelector 
            label="3. 誰協助？ (協作者)" 
            users={users} 
            selectedIds={formData.collaboratorIds}
            onSelect={(ids) => setFormData({...formData, collaboratorIds: ids as number[]})}
            multiple={true}
        />

        <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">職類歸屬</label>
            <div className="flex flex-wrap gap-2">
                {ROLES.map(role => (
                    <button
                        key={role.id}
                        onClick={() => setFormData({...formData, roleCategory: role.id})}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            formData.roleCategory === role.id 
                            ? 'bg-slate-800 text-white' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {role.name}
                    </button>
                ))}
            </div>
        </div>

        {/* AI Voice Input */}
        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-2">4. 任務描述 (AI 語音輔助)</label>
            <div className="relative mb-3">
                <textarea 
                    className="w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-indigo-500 h-24"
                    placeholder="點擊麥克風開始口述任務..."
                    value={formData.rawDescription}
                    onChange={(e) => setFormData({...formData, rawDescription: e.target.value})}
                />
                <button 
                    onClick={simulateVoiceInput}
                    className={`absolute right-3 top-3 p-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                >
                    <Mic size={20} />
                </button>
            </div>
            
            <button 
                onClick={processWithAI}
                disabled={!formData.rawDescription || isProcessingAI}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50"
            >
                {isProcessingAI ? 'AI 分析中...' : <><Bot className="mr-2" size={18}/> 串接 AI 形成結構化工作任務</>}
            </button>

            {formData.aiDescription && (
                <div className="mt-3 bg-white p-3 rounded border border-indigo-100">
                    <div className="text-xs text-indigo-500 font-bold mb-1">AI 產出結果：</div>
                    <textarea 
                        className="w-full text-sm text-slate-700 border-none focus:ring-0 p-0 resize-none h-24"
                        value={formData.aiDescription}
                        onChange={(e) => setFormData({...formData, aiDescription: e.target.value})}
                    />
                </div>
            )}
        </div>

        {/* Basic Info */}
        <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">任務標題</label>
            <input 
                type="text" 
                className="w-full p-2 border rounded-lg"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="例如：Q3 職安回報"
            />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">計畫執行規劃日期</label>
                <input 
                    type="date" 
                    className="w-full p-2 border rounded"
                    value={formData.dates.plan}
                    onChange={(e) => setFormData({...formData, dates: { ...formData.dates, plan: e.target.value }})}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-orange-600 mb-1">期中回報日期</label>
                <input 
                    type="date" 
                    className="w-full p-2 border rounded border-orange-200"
                    value={formData.dates.interim}
                    onChange={(e) => setFormData({...formData, dates: { ...formData.dates, interim: e.target.value }})}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-red-600 mb-1">最終結果回報日期</label>
                <input 
                    type="date" 
                    className="w-full p-2 border rounded border-red-200"
                    value={formData.dates.final}
                    onChange={(e) => setFormData({...formData, dates: { ...formData.dates, final: e.target.value }})}
                />
            </div>
        </div>

        <div className="flex space-x-3">
            <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200">
                取消
            </button>
            <button onClick={handleSubmit} className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg">
                確認交辦
            </button>
        </div>
    </div>
    );
};

// --- Main Application ---

// --- Employee Management Component ---

const CreateUserForm = ({ roles, onCancel, onCreate }: {
  roles: typeof ROLES;
  onCancel: () => void;
  onCreate: (user: Omit<User, 'id'>) => void;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'medical_admin',
    avatar: '👤'
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.role) {
      alert('請填寫完整資訊 (姓名、角色)');
      return;
    }
    onCreate({
      name: formData.name,
      role: formData.role,
      avatar: formData.avatar
    });
  };

  // 常用頭像選項
  const avatarOptions = ['👤', '👨‍⚕️', '👩‍⚕️', '🧑‍💼', '👨‍💼', '👩‍💼', '🧘', '👨‍🔬', '👩‍🔬', '👨‍🏫', '👩‍🏫'];

  return (
    <div className="bg-white rounded-xl shadow-lg border p-6 animate-fade-in">
      <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center">
        <Users className="mr-2" /> 新增員工資料
      </h2>

      {/* 姓名 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">姓名 *</label>
        <input 
          type="text" 
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="請輸入員工姓名"
        />
      </div>

      {/* 角色 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">角色 *</label>
        <div className="flex flex-wrap gap-2">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => setFormData({...formData, role: role.id})}
              className={`px-3 py-2 text-sm rounded-full transition-colors flex items-center ${
                formData.role === role.id 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <role.icon size={14} className="mr-2"/>
              {role.name}
            </button>
          ))}
        </div>
      </div>

      {/* 頭像 */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-slate-700 mb-2">頭像</label>
        <div className="flex flex-wrap gap-3">
          {avatarOptions.map(avatar => (
            <button
              key={avatar}
              onClick={() => setFormData({...formData, avatar})}
              className={`text-3xl p-3 rounded-lg border-2 transition-all ${
                formData.avatar === avatar
                ? 'border-indigo-500 bg-indigo-50 scale-110'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {avatar}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <label className="block text-xs text-slate-500 mb-1">或自訂 Emoji</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded-lg text-2xl text-center"
            value={formData.avatar}
            onChange={(e) => setFormData({...formData, avatar: e.target.value})}
            placeholder="👤"
            maxLength={2}
          />
        </div>
      </div>

      <div className="flex space-x-3">
        <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200">
          取消
        </button>
        <button onClick={handleSubmit} className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg">
          確認新增
        </button>
      </div>
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [view, setView] = useState<'dashboard' | 'create' | 'users' | 'create-user'>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [stats, setStats] = useState({ total: 0, done: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);

  // 載入任務列表
  const loadTasks = async () => {
    const result = await getTasks(selectedRole);
    if (result.success && result.data) {
      setTasks(result.data);
    }
  };

  // 載入人員列表
  const loadUsers = async () => {
    try {
      const result = await getUsers();
      if (result.success && result.data && result.data.length > 0) {
        setUsers(result.data);
        console.log('✅ 成功載入員工資料：', result.data.length, '人');
      } else {
        // 如果 API 失敗或沒有資料，使用預設人員
        console.warn('⚠️ API 載入失敗或沒有資料，使用預設人員');
        setUsers([
          { id: 1, name: '陳主任', role: 'medical_admin', avatar: '👨‍⚕️' },
          { id: 2, name: '林護理長', role: 'nurse', avatar: '👩‍⚕️' },
          { id: 3, name: '張社工', role: 'social_worker', avatar: '🧑‍💼' },
          { id: 4, name: '王治療師', role: 'ot', avatar: '🧘' },
          { id: 5, name: '李專員', role: 'ward_ops', avatar: '👨‍💼' },
          { id: 6, name: '吳協調員', role: 'medical_admin', avatar: '👩‍💼' },
        ]);
      }
    } catch (error) {
      console.error('❌ 載入員工資料時發生錯誤：', error);
      // 發生錯誤時也使用預設人員
      setUsers([
        { id: 1, name: '陳主任', role: 'medical_admin', avatar: '👨‍⚕️' },
        { id: 2, name: '林護理長', role: 'nurse', avatar: '👩‍⚕️' },
        { id: 3, name: '張社工', role: 'social_worker', avatar: '🧑‍💼' },
        { id: 4, name: '王治療師', role: 'ot', avatar: '🧘' },
        { id: 5, name: '李專員', role: 'ward_ops', avatar: '👨‍💼' },
        { id: 6, name: '吳協調員', role: 'medical_admin', avatar: '👩‍💼' },
      ]);
    }
  };

  // 初始載入
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadUsers(), loadTasks()]);
      setLoading(false);
    };
    init();
  }, []);

  // 當 selectedRole 改變時重新載入任務
  useEffect(() => {
    loadTasks();
  }, [selectedRole]);

  // 計算統計資料
  useEffect(() => {
    const roleTasks = selectedRole === 'all' 
        ? tasks 
        : tasks.filter(t => t.roleCategory === selectedRole);
    
    const today = new Date().toISOString().split('T')[0];
    const done = roleTasks.filter(t => t.status === 'done').length;
    const overdue = roleTasks.filter(t => t.status !== 'done' && t.dates.final < today).length;
    
    setStats({
        total: roleTasks.length,
        done,
        overdue
    });
  }, [tasks, selectedRole]);

  const handleCreateTask = async (newTaskData: Omit<Task, 'id'>) => {
    try {
      const result = await createTask(newTaskData);
      if (result.success) {
        // 等待一下讓後端處理完成
        await new Promise(resolve => setTimeout(resolve, 500));
        // 重新載入任務列表以確認資料已儲存
        await loadTasks();
        setView('dashboard');
        alert('任務已成功建立！');
      } else {
        alert('建立任務失敗：' + (result.error || '未知錯誤'));
      }
    } catch (error) {
      console.error('建立任務時發生錯誤：', error);
      // 即使發生錯誤，也嘗試重新載入（可能已經成功）
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadTasks();
      alert('任務可能已建立，請檢查任務列表確認');
    }
  };

  const handleUpdateStatus = async (taskId: number, status: Task['status']) => {
    try {
      const result = await updateTaskStatus(taskId, status);
      // 等待一下讓後端處理完成
      await new Promise(resolve => setTimeout(resolve, 300));
      // 重新載入任務列表
      await loadTasks();
    } catch (error) {
      console.error('更新狀態時發生錯誤：', error);
      // 即使發生錯誤，也嘗試重新載入
      await new Promise(resolve => setTimeout(resolve, 300));
      await loadTasks();
    }
  };

  const handleUpdateResponse = async (taskId: number, response: string) => {
    try {
      const result = await updateTaskResponse(taskId, response);
      // 等待一下讓後端處理完成
      await new Promise(resolve => setTimeout(resolve, 300));
      // 重新載入任務列表
      await loadTasks();
    } catch (error) {
      console.error('更新回覆時發生錯誤：', error);
      // 即使發生錯誤，也嘗試重新載入
      await new Promise(resolve => setTimeout(resolve, 300));
      await loadTasks();
    }
  };

  const handleDeleteEvidence = async (taskId: number, evidenceId: string) => {
    try {
      const result = await deleteEvidence(taskId, evidenceId);
      // 等待一下讓後端處理完成
      await new Promise(resolve => setTimeout(resolve, 300));
      // 重新載入任務列表
      await loadTasks();
    } catch (error) {
      console.error('刪除佐證時發生錯誤：', error);
      // 即使發生錯誤，也嘗試重新載入
      await new Promise(resolve => setTimeout(resolve, 300));
      await loadTasks();
    }
  };

  const handleCreateUser = async (userData: Omit<User, 'id'>) => {
    try {
      const result = await createUser(userData);
      if (result.success) {
        // 等待一下讓後端處理完成
        await new Promise(resolve => setTimeout(resolve, 500));
        // 重新載入員工列表以確認資料已儲存
        await loadUsers();
        setView('users');
        alert('員工資料已成功新增！');
      } else {
        alert('新增員工失敗：' + (result.error || '未知錯誤'));
      }
    } catch (error) {
      console.error('新增員工時發生錯誤：', error);
      // 即使發生錯誤，也嘗試重新載入（可能已經成功）
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadUsers();
      alert('員工資料可能已新增，請檢查員工列表確認');
    }
  };

  const handleAddEvidence = async (taskId: number, type: 'stat' | 'image' | 'link') => {
    let newEvidence: Evidence | null = null;
    const id = Date.now().toString();

    if (type === 'stat') {
        const val = prompt('請輸入統計數值 (例如: 85%)', '90%');
        const label = prompt('請輸入數值標籤 (例如: 完成率)', '達成率');
        if (val && label) {
            newEvidence = { id, type: 'stat', label, value: val };
        }
    } else if (type === 'link') {
        const url = prompt('請輸入 Google Drive 連結', 'https://drive.google.com/...');
        const name = prompt('請輸入資料夾名稱', '專案佐證資料夾');
        if (url && name) {
            newEvidence = { id, type: 'link', name, url };
        }
    } else if (type === 'image') {
        // Simulating upload
        newEvidence = { 
            id, 
            type: 'image', 
            name: '上傳圖片.jpg', 
            url: 'https://via.placeholder.com/300x200?text=Uploaded+Image' 
        };
        alert('已模擬圖片上傳');
    }

    if (newEvidence) {
        try {
          const result = await addEvidence(taskId, newEvidence);
          // 等待一下讓後端處理完成
          await new Promise(resolve => setTimeout(resolve, 300));
          // 重新載入任務列表
          await loadTasks();
        } catch (error) {
          console.error('新增佐證時發生錯誤：', error);
          // 即使發生錯誤，也嘗試重新載入
          await new Promise(resolve => setTimeout(resolve, 300));
          await loadTasks();
        }
    }
  };

  const filteredTasks = useMemo(() => {
    if (selectedRole === 'all') return tasks;
    return tasks.filter(t => t.roleCategory === selectedRole);
  }, [tasks, selectedRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-slate-600 mb-2">載入中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* Top Header */}
      <header className="bg-gradient-to-r from-indigo-700 to-indigo-600 text-white sticky top-0 z-20 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
                <h1 className="text-xl font-bold flex items-center">
                    <Activity className="mr-2" /> 
                    任務交辦暨統計儀表板
                </h1>
                <p className="text-xs text-indigo-200 mt-1">智慧化成果管理系統</p>
            </div>
            <div className="flex space-x-2">
              <button 
                  onClick={() => setView('users')}
                  className="bg-white text-indigo-700 px-4 py-2 rounded-full font-bold shadow-md hover:bg-indigo-50 transition-colors flex items-center transform hover:scale-105 active:scale-95"
              >
                  <Users size={18} className="mr-1"/> 員工管理
              </button>
              <button 
                  onClick={() => setView(view === 'dashboard' ? 'create' : 'dashboard')}
                  className="bg-white text-indigo-700 px-4 py-2 rounded-full font-bold shadow-md hover:bg-indigo-50 transition-colors flex items-center transform hover:scale-105 active:scale-95"
              >
                  {view === 'dashboard' ? <><Plus size={18} className="mr-1"/> 交辦任務</> : '返回總表'}
              </button>
            </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        
        {view === 'create' ? (
            <CreateTaskForm 
                users={users} 
                onCancel={() => setView('dashboard')}
                onCreate={handleCreateTask}
            />
        ) : view === 'users' ? (
            <div className="animate-fade-in">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">員工管理</h2>
                <button
                  onClick={() => setView('create-user')}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center"
                >
                  <Plus size={18} className="mr-1"/> 新增員工
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-slate-400">
                    <Users size={48} className="mx-auto mb-2 opacity-50"/>
                    <p>目前沒有員工資料</p>
                    <button
                      onClick={() => setView('create-user')}
                      className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                      新增第一位員工
                    </button>
                  </div>
                ) : (
                  users.map(user => (
                    <div key={user.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3">
                        <div className="text-4xl">{user.avatar}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-800">{user.name}</h3>
                          <p className="text-sm text-slate-500">
                            {ROLES.find(r => r.id === user.role)?.name || user.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
        ) : view === 'create-user' ? (
            <CreateUserForm 
              roles={ROLES}
              onCancel={() => setView('users')}
              onCreate={handleCreateUser}
            />
        ) : (
            <div className="animate-fade-in">
                
                {/* Stats Dashboard */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                        <div className="text-3xl font-bold text-slate-700">{stats.total}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide">總任務數</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                        <div className="text-3xl font-bold text-emerald-600">{Math.round((stats.done / stats.total || 0) * 100)}%</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide">完成率</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
                        {stats.overdue > 0 && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping m-2"></div>}
                        <div className={`text-3xl font-bold ${stats.overdue > 0 ? 'text-red-600' : 'text-slate-700'}`}>{stats.overdue}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide">逾期/警示</div>
                    </div>
                </div>

                {/* Role Filter Tabs */}
                <div className="flex overflow-x-auto space-x-2 mb-6 pb-2 no-scrollbar">
                    <button 
                        onClick={() => setSelectedRole('all')}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedRole === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 shadow-sm'}`}
                    >
                        總覽
                    </button>
                    {ROLES.map(role => (
                        <button
                            key={role.id}
                            onClick={() => setSelectedRole(role.id)}
                            className={`flex-shrink-0 flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                selectedRole === role.id 
                                ? role.color.replace('bg-', 'bg-').replace('text-', 'text-white bg-opacity-100 bg-') 
                                : 'bg-white text-slate-600 shadow-sm'
                            } ${selectedRole === role.id ? 'ring-2 ring-offset-1 ring-slate-300' : ''}`}
                        >
                            <role.icon size={14} className="mr-2"/>
                            {role.name}
                        </button>
                    ))}
                </div>

                {/* Task List */}
                <div className="space-y-4">
                    {filteredTasks.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <FileText size={48} className="mx-auto mb-2 opacity-50"/>
                            <p>目前該分類沒有任務</p>
                        </div>
                    ) : (
                        filteredTasks.map(task => (
                            <TaskCard 
                                key={task.id} 
                                task={task} 
                                users={users}
                                onUpdateStatus={handleUpdateStatus}
                                onUpdateResponse={handleUpdateResponse}
                                onAddEvidence={handleAddEvidence}
                                onDeleteEvidence={handleDeleteEvidence}
                            />
                        ))
                    )}
                </div>
            </div>
        )}
      </main>
    </div>
  );
}

