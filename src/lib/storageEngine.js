/**
 * storageEngine.js - High-performance Local-First Data Storage for ApexCoach
 * 
 * Supports:
 * - 100% Client-side operation on Firebase Hosting (Free Plan)
 * - Persistent storage across sessions via localStorage
 * - JSON Export / Import for full data backup
 * - Seed data initialization for immediate testing
 * - Drop-in replacement for the Base44 / Cloudflare backend
 */

const STORAGE_KEY = 'apex_local_database_v1';
const PROFILE_KEY = 'apex_coach_profile_v1';

// Default Trainer Profile
export const DEFAULT_COACH_PROFILE = {
  id: 'trainer_pro_01',
  role: 'trainer',
  user_type: 'trainer',
  full_name: 'Coach Alex - Personal Trainer',
  email: 'coach@apextraining.dev',
  phone: '0988 123 456',
  business_name: 'Apex Fitness & Performance Studio',
  bio: 'Chuyên gia huấn luyện thể hình & phục hồi vận động.',
  currency: 'VND',
  created_date: new Date().toISOString(),
  updated_date: new Date().toISOString()
};

// Seed sample data for an immediate, rich experience
const SEED_DATA = {
  Client: [
    {
      id: 'client_01',
      full_name: 'Nguyễn Văn Minh',
      email: 'minh.nguyen@example.com',
      phone: '0901 234 567',
      gender: 'male',
      age: 28,
      height: 175,
      weight: 78,
      status: 'active',
      fitness_goal: 'Giảm mỡ & Tăng cơ (Body Recomposition)',
      medical_conditions: 'Hơi mỏi khớp gối khi squat sâu',
      notes: 'Lịch tập ưu tiên sáng Thứ 2 - 4 - 6',
      created_date: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_date: new Date().toISOString()
    },
    {
      id: 'client_02',
      full_name: 'Trần Thị Thu Hà',
      email: 'thuha.tran@example.com',
      phone: '0912 345 678',
      gender: 'female',
      age: 25,
      height: 162,
      weight: 54,
      status: 'active',
      fitness_goal: 'Săn chắc cơ thể, tăng vòng 3',
      medical_conditions: 'Không có',
      notes: 'Thích tập Glutes và Core, kiêng đường tinh luyện',
      created_date: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_date: new Date().toISOString()
    },
    {
      id: 'client_03',
      full_name: 'Lê Hoàng Nam',
      email: 'hoangnam@example.com',
      phone: '0933 456 789',
      gender: 'male',
      age: 34,
      height: 170,
      weight: 85,
      status: 'active',
      fitness_goal: 'Giảm 10kg mỡ thừa, cải thiện sức bền tim mạch',
      medical_conditions: 'Huyết áp hơi cao, tránh nín thở khi tập nặng',
      notes: 'Dân văn phòng ít vận động',
      created_date: new Date(Date.now() - 45 * 86400000).toISOString(),
      updated_date: new Date().toISOString()
    }
  ],
  WorkoutPlan: [
    {
      id: 'workout_01',
      name: 'Chương Trình Push - Pull - Legs (4 Tuần)',
      description: 'Giáo án toàn diện 3 ngày/tuần tập trung tăng cơ bắp và phát triển sức mạnh căn bản.',
      client_id: 'client_01',
      trainer_id: 'trainer_pro_01',
      difficulty: 'intermediate',
      duration_weeks: 4,
      days_per_week: 3,
      status: 'active',
      daily_exercises: {
        "1": [
          { name: "Barbell Bench Press (Đẩy ngực ngang)", sets: 4, reps: "8-10", target_rir: 2, rest_seconds: 90, notes: "Khóa chặt bả vai, kiểm soát tạ đi xuống 2 giây" },
          { name: "Incline Dumbbell Press (Đẩy ngực dốc lên)", sets: 3, reps: "10-12", target_rir: 1, rest_seconds: 60, notes: "Cảm nhận ngực trên căng hết cỡ" },
          { name: "Dumbbell Lateral Raise (Dang tạ vai bên)", sets: 4, reps: "12-15", target_rir: 0, rest_seconds: 45, notes: "Khuỷu tay dẫn đường, không văng người" },
          { name: "Triceps Rope Pushdown (Kéo dây tay sau)", sets: 3, reps: "12-15", target_rir: 1, rest_seconds: 60, notes: "Khóa chặt cùi chỏ sát thân người" }
        ],
        "2": [
          { name: "Barbell Deadlift / RDL (Kéo lưng đùi sau)", sets: 3, reps: "6-8", target_rir: 2, rest_seconds: 120, notes: "Giữ lưng thẳng, siết mông khi đứng thẳng" },
          { name: "Lat Pulldown (Kéo xô máy)", sets: 4, reps: "10-12", target_rir: 1, rest_seconds: 75, notes: "Kéo thanh đòn về ngang xương quai xanh" },
          { name: "Seated Cable Row (Kéo xô ngang)", sets: 3, reps: "10-12", target_rir: 1, rest_seconds: 60, notes: "Ưỡn ngực ép 2 bả vai vào nhau" },
          { name: "Barbell Bicep Curl (Cuốn tay trước)", sets: 3, reps: "10-12", target_rir: 1, rest_seconds: 60, notes: "Không dùng quán tính của lưng" }
        ],
        "3": [
          { name: "Barbell Back Squat (Gánh đùi sau/trước)", sets: 4, reps: "8-10", target_rir: 2, rest_seconds: 120, notes: "Đầu gối hướng theo mũi chân, gồng bụng chặt" },
          { name: "Leg Press (Đạp đùi máy)", sets: 3, reps: "12-15", target_rir: 1, rest_seconds: 90, notes: "Không khóa khớp gối khi đạp lên" },
          { name: "Lying Leg Curl (Cuốn đùi sau)", sets: 3, reps: "12-15", target_rir: 0, rest_seconds: 60, notes: "Kiểm soát khi hạ tạ" },
          { name: "Standing Calf Raise (Nhón bắp chuối)", sets: 4, reps: "15-20", target_rir: 0, rest_seconds: 45, notes: "Dừng 1 giây ở đỉnh để co cơ tối đa" }
        ]
      },
      created_date: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_date: new Date().toISOString()
    },
    {
      id: 'workout_02',
      name: 'Giáo Án Tăng Size Mông & Siết Eo Cho Nữ (4 Tuần)',
      description: 'Chương trình tập trung thân dưới (Glutes/Hamstrings) và siết cơ bụng cho học viên nữ.',
      client_id: 'client_02',
      trainer_id: 'trainer_pro_01',
      difficulty: 'beginner',
      duration_weeks: 4,
      days_per_week: 3,
      status: 'active',
      daily_exercises: {
        "1": [
          { name: "Barbell Hip Thrust (Nâng mông với tạ đòn)", sets: 4, reps: "10-12", target_rir: 1, rest_seconds: 90, notes: "Gập cằm nhìn về trước, siết chặt đỉnh mông 1 giây" },
          { name: "Romanian Deadlift với tạ Dumbbell", sets: 3, reps: "10-12", target_rir: 2, rest_seconds: 60, notes: "Đẩy hông ra sau tối đa, cảm nhận đùi sau căng" },
          { name: "Bulgarian Split Squat", sets: 3, reps: "10-12 / bên", target_rir: 1, rest_seconds: 60, notes: "Nghiêng nhẹ thân người về trước để ăn vào mông" }
        ],
        "2": [
          { name: "Lat Pulldown máy hẹp tay", sets: 3, reps: "12", target_rir: 1, rest_seconds: 60, notes: "Giữ form lưng đẹp, eo thon" },
          { name: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", target_rir: 1, rest_seconds: 60, notes: "Phát triển bờ vai tròn tạo cảm giác eo nhỏ" },
          { name: "Plank & Hanging Knee Raise", sets: 3, reps: "45 giây / 15 reps", target_rir: 0, rest_seconds: 45, notes: "Gồng chắc cơ core" }
        ]
      },
      created_date: new Date(Date.now() - 20 * 86400000).toISOString(),
      updated_date: new Date().toISOString()
    }
  ],
  MealPlan: [
    {
      id: 'meal_01',
      name: 'Thực Đơn Tăng Cơ Giảm Mỡ 2200 Calo',
      description: 'Phân bổ calo và macro cân bằng, giàu protein từ ức gà, bò, cá hồi và carb hấp thu chậm.',
      client_id: 'client_01',
      trainer_id: 'trainer_pro_01',
      calories_target: 2200,
      protein_target_g: 165,
      carbs_target_g: 220,
      fat_target_g: 65,
      status: 'active',
      daily_meals: {
        "1": {
          breakfast: {
            foods: [
              { name: "Yến mạch nấu sữa tươi không đường", amount: "60g yến mạch + 200ml sữa", calories: 340, protein: 16, carbs: 54, fat: 6 },
              { name: "Trứng gà luộc / ốp la lòng đào", amount: "2 quả", calories: 145, protein: 13, carbs: 1, fat: 10 },
              { name: "1 Quả chuối tiêu", amount: "1 quả vừa", calories: 105, protein: 1, carbs: 27, fat: 0 }
            ]
          },
          lunch: {
            foods: [
              { name: "Cơm gạo lứt / Cơm trắng", amount: "1.5 chén (200g)", calories: 260, protein: 6, carbs: 58, fat: 1 },
              { name: "Ức gà áp chảo sốt tiêu đen", amount: "180g", calories: 290, protein: 55, carbs: 4, fat: 5 },
              { name: "Bông cải xanh & cà rốt luộc", amount: "150g", calories: 60, protein: 3, carbs: 12, fat: 0 }
            ]
          },
          snack: {
            foods: [
              { name: "Whey Protein Isolate pha nước mát", amount: "1 scoop (30g)", calories: 120, protein: 25, carbs: 2, fat: 1 },
              { name: "Hạnh nhân nướng mộc", amount: "15 hạt (15g)", calories: 90, protein: 3, carbs: 3, fat: 8 }
            ]
          },
          dinner: {
            foods: [
              { name: "Khoai lang luộc / nướng", amount: "1 củ vừa (180g)", calories: 160, protein: 3, carbs: 37, fat: 0 },
              { name: "Cá hồi áp chảo hoặc Thịt thăn bò xào", amount: "160g", calories: 320, protein: 38, carbs: 0, fat: 18 },
              { name: "Canh rau cải nấu tôm hoặc rau bina", amount: "1 tô", calories: 75, protein: 6, carbs: 8, fat: 2 }
            ]
          }
        }
      },
      created_date: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_date: new Date().toISOString()
    }
  ],
  Progress: [
    {
      id: 'prog_01',
      client_id: 'client_01',
      date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
      weight: 80.5,
      body_fat: 22.0,
      chest: 98,
      waist: 86,
      hips: 99,
      arms: 34,
      thighs: 58,
      notes: 'Bắt đầu lộ trình tập luyện.',
      created_date: new Date(Date.now() - 14 * 86400000).toISOString()
    },
    {
      id: 'prog_02',
      client_id: 'client_01',
      date: new Date().toISOString().split('T')[0],
      weight: 78.0,
      body_fat: 19.5,
      chest: 100,
      waist: 83,
      hips: 98,
      arms: 35.5,
      thighs: 57.5,
      notes: 'Vòng eo giảm 3cm, cơ ngực và tay nở nang rõ rệt.',
      created_date: new Date().toISOString()
    }
  ],
  FitnessTemplate: [
    {
      id: 'tpl_01',
      name: 'Full Body 3 Ngày - Nhập Môn Gym',
      category: 'Hypertrophy',
      difficulty: 'beginner',
      description: 'Lộ trình căn bản làm quen tạ đơn và máy tập cho người mới.',
      created_date: new Date().toISOString()
    },
    {
      id: 'tpl_02',
      name: 'Upper / Lower 4 Ngày - Trung Cấp',
      category: 'Strength',
      difficulty: 'intermediate',
      description: 'Phân bổ trên dưới giúp tối ưu phục hồi và tăng tải liên tục.',
      created_date: new Date().toISOString()
    }
  ],
  MealPlanTemplate: [
    {
      id: 'mtpl_01',
      name: 'Thực đơn Low-Carb Giảm Cân Cấp Tốc',
      calories_target: 1800,
      protein_target_g: 160,
      carbs_target_g: 100,
      fat_target_g: 70,
      created_date: new Date().toISOString()
    }
  ],
  CalorieLog: [
    {
      id: 'cal_log_01',
      client_id: 'client_01',
      trainer_id: 'trainer_pro_01',
      log_name: 'Nhật Ký Calo Tuần 1 (Tăng Cơ & Siết Mỡ)',
      week_start: new Date().toISOString().split('T')[0],
      trainer_notes: 'Tuân thủ rất tốt, tỷ lệ calo từ chất béo đạt mức an toàn 24% (< 30%).',
      entries: [
        { day_of_week: 'monday', food_item: 'Yến mạch + Sữa chua Hy Lạp + Chuối', calories: 420, fat_grams: 8 },
        { day_of_week: 'monday', food_item: 'Cơm gạo lứt + Ức gà nướng + Súp lơ', calories: 580, fat_grams: 12 },
        { day_of_week: 'monday', food_item: 'Khoai lang + Cá hồi áp chảo + Canh rong biển', calories: 650, fat_grams: 22 },
        { day_of_week: 'tuesday', food_item: 'Trứng ốp la + Bánh mì ngũ cốc', calories: 380, fat_grams: 14 },
        { day_of_week: 'tuesday', food_item: 'Bò xào măng tây + Cơm trắng', calories: 610, fat_grams: 16 }
      ],
      created_date: new Date().toISOString()
    }
  ]
};

class StorageEngine {
  constructor() {
    this.memoryCache = null;
    this.listeners = new Map(); // entity_type -> Set<callback>
  }

  // Load all tables into memory cache
  getDatabase() {
    if (this.memoryCache) return this.memoryCache;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.memoryCache = JSON.parse(raw);
        return this.memoryCache;
      }
    } catch (e) {
      console.warn('[StorageEngine] Error parsing storage, falling back to seed data', e);
    }

    // Initialize with seed data
    this.memoryCache = JSON.parse(JSON.stringify(SEED_DATA));
    this.saveDatabase();
    return this.memoryCache;
  }

  saveDatabase() {
    try {
      if (this.memoryCache) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memoryCache));
      }
    } catch (e) {
      console.error('[StorageEngine] Storage quota exceeded or error saving:', e);
    }
  }

  // Trainer Profile
  getCoachProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) return { ...DEFAULT_COACH_PROFILE, ...JSON.parse(raw) };
    } catch (e) {}
    return { ...DEFAULT_COACH_PROFILE };
  }

  saveCoachProfile(profile) {
    try {
      const current = this.getCoachProfile();
      const updated = { ...current, ...profile, updated_date: new Date().toISOString() };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return DEFAULT_COACH_PROFILE;
    }
  }

  // Entity Operations
  getTable(type) {
    const db = this.getDatabase();
    if (!db[type]) db[type] = [];
    return db[type];
  }

  notify(type) {
    const subs = this.listeners.get(type);
    if (subs) subs.forEach(cb => { try { cb(); } catch (err) {} });
  }

  subscribe(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);
    return () => this.listeners.get(type)?.delete(callback);
  }

  list(type, sort, limit) {
    const items = [...this.getTable(type)];
    return this.applySortAndLimit(items, sort, limit);
  }

  filter(type, filterObj = {}, sort, limit) {
    const items = this.getTable(type);
    const filtered = items.filter(item => {
      for (const [key, value] of Object.entries(filterObj)) {
        if (value === undefined) continue;
        if (item[key] !== value) return false;
      }
      return true;
    });
    return this.applySortAndLimit(filtered, sort, limit);
  }

  get(type, id) {
    const items = this.getTable(type);
    const item = items.find(it => String(it.id) === String(id));
    if (!item) {
      throw new Error(`Record ${type} #${id} not found`);
    }
    return JSON.parse(JSON.stringify(item));
  }

  create(type, data) {
    const table = this.getTable(type);
    const id = data.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newRecord = {
      ...data,
      id,
      created_date: data.created_date || now,
      updated_date: now
    };
    table.unshift(newRecord);
    this.saveDatabase();
    this.notify(type);
    return JSON.parse(JSON.stringify(newRecord));
  }

  bulkCreate(type, items) {
    if (!Array.isArray(items)) return [];
    const results = items.map(item => this.create(type, item));
    return results;
  }

  update(type, id, updates) {
    const table = this.getTable(type);
    const index = table.findIndex(it => String(it.id) === String(id));
    if (index === -1) {
      throw new Error(`Record ${type} #${id} not found to update`);
    }
    const updatedRecord = {
      ...table[index],
      ...updates,
      id: table[index].id, // Prevent overwriting ID
      updated_date: new Date().toISOString()
    };
    table[index] = updatedRecord;
    this.saveDatabase();
    this.notify(type);
    return JSON.parse(JSON.stringify(updatedRecord));
  }

  delete(type, id) {
    const table = this.getTable(type);
    const index = table.findIndex(it => String(it.id) === String(id));
    if (index !== -1) {
      const removed = table.splice(index, 1)[0];
      this.saveDatabase();
      this.notify(type);
      return removed;
    }
    return { success: true };
  }

  applySortAndLimit(items, sort, limit) {
    let result = [...items];
    if (sort) {
      const isDesc = sort.startsWith('-');
      const field = isDesc ? sort.substring(1) : sort;
      result.sort((a, b) => {
        const valA = a[field] ?? '';
        const valB = b[field] ?? '';
        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
    }
    if (limit && Number(limit) > 0) {
      result = result.slice(0, Number(limit));
    }
    return JSON.parse(JSON.stringify(result));
  }

  // Backup & Restore
  exportDatabase() {
    const db = this.getDatabase();
    const profile = this.getCoachProfile();
    return JSON.stringify({
      version: '1.0',
      exported_at: new Date().toISOString(),
      profile,
      data: db
    }, null, 2);
  }

  importDatabase(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data || typeof parsed.data !== 'object') {
        throw new Error('Dữ liệu không đúng định dạng sao lưu.');
      }
      this.memoryCache = parsed.data;
      this.saveDatabase();
      if (parsed.profile) {
        this.saveCoachProfile(parsed.profile);
      }
      // Notify all
      this.listeners.forEach((_, type) => this.notify(type));
      return { success: true };
    } catch (e) {
      console.error('[StorageEngine] Import error:', e);
      throw new Error(e.message || 'Lỗi khi nhập tệp sao lưu');
    }
  }

  resetToDefault() {
    this.memoryCache = JSON.parse(JSON.stringify(SEED_DATA));
    this.saveDatabase();
    this.saveCoachProfile(DEFAULT_COACH_PROFILE);
    this.listeners.forEach((_, type) => this.notify(type));
  }
}

export const storageEngine = new StorageEngine();
export default storageEngine;
