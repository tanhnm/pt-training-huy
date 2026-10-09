// Drop-in replacement for the Base44 SDK client.
// Powered by client-side storageEngine with full offline / Firebase Hosting support.
import { storageEngine } from '@/lib/storageEngine';
import { callGeminiApi } from '@/lib/aiService';

const TOKEN_KEY = 'apex_access_token';

export const getToken = () => {
  return 'apex_trainer_active_token';
};

export const setToken = (t) => {
  // Handled locally
};

// Common exercises catalog for instant search offline / static hosting
const COMMON_EXERCISES = [
  { name: "Barbell Bench Press", target_muscle: "Chest", equipment: "Barbell", body_part: "Chest" },
  { name: "Incline Dumbbell Press", target_muscle: "Upper Chest", equipment: "Dumbbell", body_part: "Chest" },
  { name: "Chest Fly / Cable Crossover", target_muscle: "Chest", equipment: "Cable", body_part: "Chest" },
  { name: "Barbell Back Squat", target_muscle: "Quadriceps", equipment: "Barbell", body_part: "Legs" },
  { name: "Front Squat", target_muscle: "Quadriceps", equipment: "Barbell", body_part: "Legs" },
  { name: "Leg Press", target_muscle: "Legs", equipment: "Machine", body_part: "Legs" },
  { name: "Romanian Deadlift (RDL)", target_muscle: "Hamstrings", equipment: "Barbell", body_part: "Legs" },
  { name: "Conventional Deadlift", target_muscle: "Back & Hamstrings", equipment: "Barbell", body_part: "Back" },
  { name: "Barbell Bent Over Row", target_muscle: "Upper Back", equipment: "Barbell", body_part: "Back" },
  { name: "Lat Pulldown", target_muscle: "Lats", equipment: "Cable", body_part: "Back" },
  { name: "Seated Cable Row", target_muscle: "Lats / Rhomboids", equipment: "Cable", body_part: "Back" },
  { name: "Pull-ups / Chin-ups", target_muscle: "Lats", equipment: "Bodyweight", body_part: "Back" },
  { name: "Overhead Shoulder Press (OHP)", target_muscle: "Deltoids", equipment: "Barbell", body_part: "Shoulders" },
  { name: "Dumbbell Lateral Raise", target_muscle: "Lateral Deltoids", equipment: "Dumbbell", body_part: "Shoulders" },
  { name: "Face Pull", target_muscle: "Rear Deltoids", equipment: "Cable", body_part: "Shoulders" },
  { name: "Barbell Bicep Curl", target_muscle: "Biceps", equipment: "Barbell", body_part: "Arms" },
  { name: "Dumbbell Hammer Curl", target_muscle: "Brachialis & Biceps", equipment: "Dumbbell", body_part: "Arms" },
  { name: "Triceps Rope Pushdown", target_muscle: "Triceps", equipment: "Cable", body_part: "Arms" },
  { name: "Skull Crushers (Lying Triceps Ext)", target_muscle: "Triceps", equipment: "EZ Bar", body_part: "Arms" },
  { name: "Barbell Hip Thrust", target_muscle: "Glutes", equipment: "Barbell", body_part: "Glutes" },
  { name: "Bulgarian Split Squat", target_muscle: "Glutes & Quads", equipment: "Dumbbell", body_part: "Legs" },
  { name: "Plank & Core Hollow Hold", target_muscle: "Abs / Core", equipment: "Bodyweight", body_part: "Core" },
  { name: "Hanging Leg Raise", target_muscle: "Lower Abs", equipment: "Bodyweight", body_part: "Core" }
];

const COMMON_FOODS = [
  { name: "Ức gà không da (nấu chín)", calories: 165, protein: 31, carbs: 0, fat: 3.6, serving_size: "100g" },
  { name: "Thịt thăn bò nạc", calories: 217, protein: 26, carbs: 0, fat: 12, serving_size: "100g" },
  { name: "Cá hồi tươi áp chảo", calories: 206, protein: 22, carbs: 0, fat: 12, serving_size: "100g" },
  { name: "Trứng gà ta", calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, serving_size: "1 quả vừa" },
  { name: "Cơm trắng", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, serving_size: "100g" },
  { name: "Cơm gạo lứt", calories: 111, protein: 2.6, carbs: 23, fat: 0.9, serving_size: "100g" },
  { name: "Yến mạch nguyên cán", calories: 379, protein: 13.2, carbs: 67.7, fat: 6.5, serving_size: "100g" },
  { name: "Khoai lang luộc", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, serving_size: "100g" },
  { name: "Bông cải xanh (Broccoli)", calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, serving_size: "100g" },
  { name: "Chuối tiêu", calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, serving_size: "100g" },
  { name: "Bơ đậu phộng nguyên chất", calories: 588, protein: 25, carbs: 20, fat: 50, serving_size: "100g" },
  { name: "Whey Protein Isolate", calories: 120, protein: 25, carbs: 2, fat: 1, serving_size: "1 muỗng (30g)" }
];

// One entity accessor mapping to storageEngine
function makeEntity(type) {
  return {
    list: async (sort, limit) => storageEngine.list(type, sort, limit),
    filter: async (filter, sort, limit) => storageEngine.filter(type, filter, sort, limit),
    get: async (id) => storageEngine.get(type, id),
    create: async (data) => storageEngine.create(type, data),
    bulkCreate: async (arr) => storageEngine.bulkCreate(type, arr),
    update: async (id, data) => storageEngine.update(type, id, data),
    delete: async (id) => storageEngine.delete(type, id),
    subscribe: (callback) => storageEngine.subscribe(type, callback),
  };
}

const entities = new Proxy(
  {},
  {
    get: (cache, prop) => {
      if (typeof prop !== 'string') return undefined;
      if (!cache[prop]) cache[prop] = makeEntity(prop);
      return cache[prop];
    },
  }
);

const auth = {
  async me() {
    return storageEngine.getCoachProfile();
  },
  async updateMe(data) {
    return storageEngine.saveCoachProfile(data);
  },
  async login(email, password) {
    return storageEngine.getCoachProfile();
  },
  async register(payload) {
    return storageEngine.getCoachProfile();
  },
  async isAuthenticated() {
    return true;
  },
  async deleteMe() {
    storageEngine.resetToDefault();
    return { success: true };
  },
  async exportMyData() {
    return storageEngine.exportDatabase();
  },
  logout(redirectUrl) {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  },
  redirectToLogin(nextUrl) {
    // No login redirect needed in Trainer Pro standalone mode
  },
  setToken,
};

const functions = {
  invoke: async (name, payload = {}) => {
    switch (name) {
      case 'searchExercises': {
        const query = (payload.query || payload.search || '').toLowerCase();
        const filtered = COMMON_EXERCISES.filter(ex => 
          ex.name.toLowerCase().includes(query) || 
          ex.target_muscle.toLowerCase().includes(query) ||
          ex.body_part.toLowerCase().includes(query)
        );
        return { data: filtered.length > 0 ? filtered : COMMON_EXERCISES, status: 200 };
      }
      case 'searchFoods': {
        const query = (payload.query || '').toLowerCase();
        const filtered = COMMON_FOODS.filter(f => f.name.toLowerCase().includes(query));
        return { data: filtered.length > 0 ? filtered : COMMON_FOODS, status: 200 };
      }
      case 'getAppLogo': {
        return { data: { logoUrl: null }, status: 200 };
      }
      case 'coachBriefing': {
        return {
          data: {
            summary: "Chào Coach! Chúc bạn một ngày huấn luyện năng lượng và hiệu quả.",
            highlights: ["Kiểm tra bài tập cho học viên", "Xuất PDF lịch tuần mới", "Đo chỉ số định kỳ"],
            actionItems: []
          },
          status: 200
        };
      }
      case 'webPush': {
        return { data: { success: true }, status: 200 };
      }
      case 'sendInviteEmail':
      case 'sendResourceEmail': {
        return { data: { success: true, message: "Email simulation successful" }, status: 200 };
      }
      default:
        return { data: { success: true }, status: 200 };
    }
  },
};

const integrations = {
  Core: {
    async UploadFile({ file }) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ file_url: reader.result, name: file.name });
        };
        reader.readAsDataURL(file);
      });
    },
    async InvokeLLM(payload) {
      return {
        text: `Gợi ý từ Trợ lý AI Huấn Luyện:\nĐối với mục tiêu này, hãy ưu tiên các bài tập phức hợp (Compound Movements), duy trì thặng dư hoặc thâm hụt calo vừa phải (300-500 kcal), và đảm bảo mức protein từ 1.6 - 2.2g/kg trọng lượng cơ thể.`
      };
    },
    async SendEmail() {
      return { success: true, stubbed: true };
    },
  },
};

const appLogs = {
  logUserInApp: async () => ({ success: true }),
};

const agentSubscribers = new Map();

const agents = {
  listConversations: async () => {
    return storageEngine.list('AgentConversation', '-updated_date', 50);
  },
  createConversation: async ({ agent_name, metadata } = {}) => {
    return storageEngine.create('AgentConversation', {
      agent_name: agent_name || 'trainer_assistant',
      metadata: metadata || {},
      messages: []
    });
  },
  addMessage: async (conversation, message) => {
    const convoId = conversation.id;
    const current = storageEngine.get('AgentConversation', convoId) || { messages: [] };
    const messages = [...(current.messages || []), { ...message, ts: new Date().toISOString() }];
    
    // Call Gemini AI or intelligent local NLP engine
    if (message.role === 'user') {
      let selectedClient = null;
      if (conversation.metadata?.client_id) {
        selectedClient = storageEngine.get('Client', conversation.metadata.client_id);
      }

      try {
        const aiResult = await callGeminiApi({
          prompt: message.content,
          history: current.messages || [],
          selectedClient
        });

        const aiReply = {
          role: 'assistant',
          content: aiResult.content,
          createdItems: aiResult.createdItems || [],
          ts: new Date().toISOString()
        };
        messages.push(aiReply);
      } catch (err) {
        console.error('[base44Client] Error in AI message processing:', err);
        messages.push({
          role: 'assistant',
          content: `Có lỗi xảy ra khi xử lý tin nhắn: ${err.message || 'Không thể kết nối'}. Vui lòng thử lại!`,
          ts: new Date().toISOString()
        });
      }
    }
    
    const updated = storageEngine.update('AgentConversation', convoId, { messages });
    const subs = agentSubscribers.get(convoId);
    if (subs) subs.forEach(cb => cb(updated));
    return updated;
  },
  subscribeToConversation: (conversationId, callback) => {
    if (!agentSubscribers.has(conversationId)) agentSubscribers.set(conversationId, new Set());
    agentSubscribers.get(conversationId).add(callback);
    return () => agentSubscribers.get(conversationId)?.delete(callback);
  },
};

export const base44 = { entities, auth, functions, integrations, appLogs, agents };
export default base44;
