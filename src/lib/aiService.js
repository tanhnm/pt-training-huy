/**
 * aiService.js - Intelligent Personal Trainer AI Engine for ApexCoach
 * 
 * Powered by Google Gemini API (gemini-2.5-flash / gemini-3.8-flash) & Antigravity principles.
 * Features:
 * - Natural Language text-to-action: create clients, workouts, meal plans, progress logs, sessions.
 * - Native Function Calling / Tool Calling with Google Gemini REST endpoint.
 * - Built-in High-Accuracy Local NLP Fallback: works 100% offline or when no API key is provided!
 * - Automatic persistence to storageEngine with reactive state updates.
 */

import { storageEngine } from './storageEngine';

const GEMINI_API_KEY_STORAGE = 'apex_gemini_api_key';
const GEMINI_MODEL_STORAGE = 'apex_gemini_model';
const DEFAULT_MODEL = 'gemini-2.5-flash';

// Get current configured Gemini API Key
export function getGeminiApiKey() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(GEMINI_API_KEY_STORAGE) || import.meta.env.VITE_GEMINI_API_KEY || '';
}

// Save Gemini API Key
export function setGeminiApiKey(key) {
  if (typeof window === 'undefined') return;
  if (!key) {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE);
  } else {
    localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
  }
}

// Get active model
export function getGeminiModel() {
  if (typeof window === 'undefined') return DEFAULT_MODEL;
  return localStorage.getItem(GEMINI_MODEL_STORAGE) || DEFAULT_MODEL;
}

// Save active model
export function setGeminiModel(model) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GEMINI_MODEL_STORAGE, model);
}

/**
 * Common exercise catalog for workout plan generation with strict English names
 */
const EXERCISE_DATABASE = {
  push: [
    { name: "Barbell Bench Press", sets: 4, reps: "8-10", rest_seconds: 90, rir: 2, notes: "Khóa chặt bả vai, kiểm soát thanh đòn" },
    { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest_seconds: 75, rir: 1, notes: "Góc ghế 30 độ, siết ngực trên" },
    { name: "Dumbbell Lateral Raise", sets: 4, reps: "12-15", rest_seconds: 45, rir: 0, notes: "Khuỷu tay dẫn đường, không vung người" },
    { name: "Overhead Dumbbell Shoulder Press", sets: 3, reps: "10-12", rest_seconds: 60, rir: 1, notes: "Lưng thẳng, gồng chắc cơ bụng" },
    { name: "Triceps Rope Pushdown", sets: 3, reps: "12-15", rest_seconds: 60, rir: 1, notes: "Khóa cùi chỏ sát sườn" }
  ],
  pull: [
    { name: "Barbell Deadlift / RDL", sets: 3, reps: "6-8", rest_seconds: 120, rir: 2, notes: "Giữ lưng thẳng, siết mông khi đứng lên" },
    { name: "Lat Pulldown", sets: 4, reps: "10-12", rest_seconds: 75, rir: 1, notes: "Kéo về xương quai xanh, ép xô" },
    { name: "Barbell Bent Over Row", sets: 3, reps: "8-10", rest_seconds: 90, rir: 2, notes: "Gập người 45 độ, kéo tạ về rốn" },
    { name: "Face Pull", sets: 3, reps: "15", rest_seconds: 45, rir: 0, notes: "Tập trung vai sau và cơ cầu vai" },
    { name: "Barbell Bicep Curl", sets: 3, reps: "10-12", rest_seconds: 60, rir: 1, notes: "Cô lập tay trước, không đung đưa" }
  ],
  legs: [
    { name: "Barbell Back Squat", sets: 4, reps: "8-10", rest_seconds: 120, rir: 2, notes: "Hít sâu gồng bụng, đầu gối mở theo mũi chân" },
    { name: "Romanian Deadlift (RDL)", sets: 3, reps: "10-12", rest_seconds: 90, rir: 2, notes: "Đẩy hông ra sau, cảm nhận đùi sau căng" },
    { name: "Leg Press", sets: 3, reps: "12-15", rest_seconds: 90, rir: 1, notes: "Không khóa khớp gối ở đỉnh động tác" },
    { name: "Lying Leg Curl", sets: 3, reps: "12-15", rest_seconds: 60, rir: 1, notes: "Kiểm soát khi hạ tạ" },
    { name: "Standing Calf Raise", sets: 4, reps: "15-20", rest_seconds: 45, rir: 0, notes: "Dừng 1 giây ở đỉnh để co cơ tối đa" }
  ],
  fullbody: [
    { name: "Barbell Back Squat", sets: 3, reps: "8-10", rest_seconds: 90, rir: 2, notes: "Xuống sâu có kiểm soát" },
    { name: "Barbell Bench Press", sets: 3, reps: "8-10", rest_seconds: 90, rir: 2, notes: "Hạ tạ chạm nhẹ ngực" },
    { name: "Lat Pulldown", sets: 3, reps: "10-12", rest_seconds: 75, rir: 1, notes: "Kéo mở ngực" },
    { name: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", rest_seconds: 60, rir: 1, notes: "Gồng core chắc" },
    { name: "Plank Hold", sets: 3, reps: "45-60s", rest_seconds: 45, rir: 0, notes: "Thẳng thân người từ gót đến đầu" }
  ]
};

// Tool Actions Executor: directly creates real data in storageEngine
export const actionExecutors = {
  create_client: (args) => {
    const coach = storageEngine.getCoachProfile();
    const newClient = {
      full_name: args.full_name || "Học viên mới",
      email: args.email || `${args.full_name?.toLowerCase().replace(/\s+/g, '') || 'client'}${Date.now().toString().slice(-4)}@example.com`,
      phone: args.phone || "09" + Math.floor(10000000 + Math.random() * 90000000),
      gender: args.gender || "male",
      age: Number(args.age) || 25,
      weight: Number(args.starting_weight) || 70,
      target_weight: Number(args.target_weight) || (args.starting_weight ? Number(args.starting_weight) - 5 : 65),
      fitness_goal: args.fitness_goal || "Giảm mỡ & Tăng cơ (Body Recomposition)",
      medical_conditions: args.medical_conditions || "Không có",
      notes: args.notes || "Tạo tự động bởi ApexCoach AI",
      status: "active"
    };
    const created = storageEngine.create('Client', newClient);
    return {
      type: 'client',
      item: created,
      summary: `Đã tạo học viên: ${created.full_name} (${created.age} tuổi · Mục tiêu: ${created.fitness_goal})`
    };
  },

  create_workout_plan: (args) => {
    const coach = storageEngine.getCoachProfile();
    let clientId = args.client_id;
    let clientName = args.client_name;

    // Auto-resolve client by name if client_id is not given
    if (!clientId && clientName) {
      const allClients = storageEngine.list('Client');
      const found = allClients.find(c => c.full_name?.toLowerCase().includes(clientName.toLowerCase()));
      if (found) {
        clientId = found.id;
        clientName = found.full_name;
      }
    }

    // Default to the first client if still missing
    if (!clientId) {
      const allClients = storageEngine.list('Client');
      if (allClients.length > 0) {
        clientId = allClients[0].id;
        clientName = allClients[0].full_name;
      }
    }

    // Build daily exercises map
    const dailyExercises = {};
    if (args.days && Array.isArray(args.days) && args.days.length > 0) {
      args.days.forEach((day, index) => {
        const dayKey = String(day.day_number || index + 1);
        dailyExercises[dayKey] = (day.exercises || []).map(ex => ({
          name: ex.name,
          sets: Number(ex.sets) || 3,
          reps: String(ex.reps || "10-12"),
          target_rir: Number(ex.rir ?? 1),
          rest_seconds: Number(ex.rest_seconds) || 60,
          notes: ex.notes || ""
        }));
      });
    } else {
      // Fallback default routine
      dailyExercises["1"] = EXERCISE_DATABASE.push;
      dailyExercises["2"] = EXERCISE_DATABASE.pull;
      dailyExercises["3"] = EXERCISE_DATABASE.legs;
    }

    const newPlan = {
      name: args.name || `Giáo Án Tăng Cơ - ${clientName || 'Học Viên'}`,
      description: args.description || `Giáo án cá nhân hóa thiết kế bởi AI dành cho ${clientName || 'học viên'}`,
      client_id: clientId || '',
      trainer_id: coach?.id || 'trainer_pro_01',
      difficulty: args.difficulty || 'intermediate',
      duration_weeks: Number(args.duration_weeks) || 4,
      days_per_week: Object.keys(dailyExercises).length,
      status: 'active',
      daily_exercises: dailyExercises
    };

    const created = storageEngine.create('WorkoutPlan', newPlan);
    return {
      type: 'workout_plan',
      item: created,
      summary: `Đã tạo giáo án tập: ${created.name} (${created.days_per_week} buổi/tuần · Gán cho: ${clientName || 'Học viên'})`
    };
  },

  create_meal_plan: (args) => {
    const coach = storageEngine.getCoachProfile();
    let clientId = args.client_id;
    let clientName = args.client_name;

    if (!clientId && clientName) {
      const allClients = storageEngine.list('Client');
      const found = allClients.find(c => c.full_name?.toLowerCase().includes(clientName.toLowerCase()));
      if (found) {
        clientId = found.id;
        clientName = found.full_name;
      }
    }

    if (!clientId) {
      const allClients = storageEngine.list('Client');
      if (allClients.length > 0) {
        clientId = allClients[0].id;
        clientName = allClients[0].full_name;
      }
    }

    const calories = Number(args.daily_calories) || 2000;
    const protein = Number(args.protein_g) || Math.round(calories * 0.3 / 4);
    const carbs = Number(args.carbs_g) || Math.round(calories * 0.45 / 4);
    const fat = Number(args.fat_g) || Math.round(calories * 0.25 / 9);

    const dailyMeals = {};
    if (args.meals && Array.isArray(args.meals) && args.meals.length > 0) {
      const dayOneMeals = {};
      args.meals.forEach(m => {
        const typeKey = m.meal_type || 'lunch';
        dayOneMeals[typeKey] = {
          foods: (m.foods || []).map(f => ({
            name: f.name,
            amount: f.portion || '1 phần',
            calories: Number(f.calories) || Math.round(calories / args.meals.length / (m.foods.length || 1)),
            protein: Number(f.protein) || Math.round(protein / args.meals.length / (m.foods.length || 1)),
            carbs: Number(f.carbs) || Math.round(carbs / args.meals.length / (m.foods.length || 1)),
            fat: Number(f.fat) || Math.round(fat / args.meals.length / (m.foods.length || 1))
          }))
        };
      });
      dailyMeals["1"] = dayOneMeals;
    } else {
      dailyMeals["1"] = {
        breakfast: {
          foods: [
            { name: "Yến mạch nấu sữa tươi không đường", amount: "60g yến mạch + 200ml sữa", calories: 340, protein: 16, carbs: 54, fat: 6 },
            { name: "Trứng gà luộc", amount: "2 quả", calories: 145, protein: 13, carbs: 1, fat: 10 }
          ]
        },
        lunch: {
          foods: [
            { name: "Cơm gạo lứt / Cơm trắng", amount: "1.5 chén (200g)", calories: 260, protein: 6, carbs: 58, fat: 1 },
            { name: "Ức gà áp chảo", amount: "180g", calories: 290, protein: 55, carbs: 4, fat: 5 },
            { name: "Bông cải xanh luộc", amount: "150g", calories: 60, protein: 3, carbs: 12, fat: 0 }
          ]
        },
        snack: {
          foods: [
            { name: "Whey Protein Isolate", amount: "1 muỗng (30g)", calories: 120, protein: 25, carbs: 2, fat: 1 },
            { name: "1 Quả chuối tiêu", amount: "1 quả", calories: 95, protein: 1, carbs: 23, fat: 0 }
          ]
        },
        dinner: {
          foods: [
            { name: "Khoai lang luộc", amount: "1 củ vừa (180g)", calories: 160, protein: 3, carbs: 37, fat: 0 },
            { name: "Thịt thăn bò / Cá hồi", amount: "160g", calories: 310, protein: 36, carbs: 0, fat: 16 },
            { name: "Canh rau củ quả", amount: "1 tô", calories: 70, protein: 4, carbs: 6, fat: 2 }
          ]
        }
      };
    }

    const newPlan = {
      name: args.name || `Thực Đơn Dinh Dưỡng ${calories} Calo - ${clientName || 'Học Viên'}`,
      description: args.description || `Thực đơn cân bằng calo và macro chuẩn dành cho ${clientName || 'học viên'}`,
      client_id: clientId || '',
      trainer_id: coach?.id || 'trainer_pro_01',
      calories_target: calories,
      protein_target_g: protein,
      carbs_target_g: carbs,
      fat_target_g: fat,
      status: 'active',
      daily_meals: dailyMeals
    };

    const created = storageEngine.create('MealPlan', newPlan);
    return {
      type: 'meal_plan',
      item: created,
      summary: `Đã tạo thực đơn: ${created.name} (${calories} kcal · ${protein}g Đạm · Gán cho: ${clientName || 'Học viên'})`
    };
  },

  log_progress: (args) => {
    let clientId = args.client_id;
    let clientName = args.client_name;

    if (!clientId && clientName) {
      const allClients = storageEngine.list('Client');
      const found = allClients.find(c => c.full_name?.toLowerCase().includes(clientName.toLowerCase()));
      if (found) {
        clientId = found.id;
        clientName = found.full_name;
      }
    }

    if (!clientId) {
      const allClients = storageEngine.list('Client');
      if (allClients.length > 0) {
        clientId = allClients[0].id;
        clientName = allClients[0].full_name;
      }
    }

    const newProg = {
      client_id: clientId,
      date: args.date || new Date().toISOString().split('T')[0],
      weight: Number(args.weight) || 70,
      body_fat: args.body_fat_percentage ? Number(args.body_fat_percentage) : null,
      chest: args.chest ? Number(args.chest) : null,
      waist: args.waist ? Number(args.waist) : null,
      hips: args.hips ? Number(args.hips) : null,
      arms: args.arms ? Number(args.arms) : null,
      thighs: args.thighs ? Number(args.thighs) : null,
      notes: args.notes || 'Ghi nhận tiến độ qua ApexCoach AI'
    };

    const created = storageEngine.create('Progress', newProg);
    return {
      type: 'progress',
      item: created,
      summary: `Đã ghi nhận chỉ số: Cân nặng ${created.weight}kg${created.body_fat ? ` · ${created.body_fat}% mỡ` : ''} cho ${clientName || 'Học viên'}`
    };
  },

  book_session: (args) => {
    const coach = storageEngine.getCoachProfile();
    let clientId = args.client_id;
    let clientName = args.client_name;

    if (!clientId && clientName) {
      const allClients = storageEngine.list('Client');
      const found = allClients.find(c => c.full_name?.toLowerCase().includes(clientName.toLowerCase()));
      if (found) {
        clientId = found.id;
        clientName = found.full_name;
      }
    }

    if (!clientId) {
      const allClients = storageEngine.list('Client');
      if (allClients.length > 0) {
        clientId = allClients[0].id;
        clientName = allClients[0].full_name;
      }
    }

    const newSession = {
      trainer_id: coach?.id || 'trainer_pro_01',
      client_id: clientId,
      client_name: clientName || 'Học viên',
      date: args.date || new Date().toISOString().split('T')[0],
      start_time: args.start_time || "09:00",
      end_time: args.end_time || "10:00",
      type: args.type || "personal_training",
      status: "scheduled",
      notes: args.notes || "Lên lịch tự động bởi AI"
    };

    const created = storageEngine.create('Session', newSession);
    return {
      type: 'session',
      item: created,
      summary: `Đã lên lịch tập: ${created.date} lúc ${created.start_time}-${created.end_time} cho ${created.client_name}`
    };
  }
};

/**
 * High-Accuracy Local Fallback Parser
 * When no Gemini API key is configured or offline, this parses Vietnamese natural language and executes the exact same tools!
 */
export function executeLocalNLP(userPrompt, selectedClient = null) {
  const prompt = userPrompt.trim();
  const lower = prompt.toLowerCase();
  const createdItems = [];
  let replyText = "";

  // 1. Detect: CREATE CLIENT ("tạo học viên", "thêm học viên", "học viên mới")
  const isCreateClient = /tạo\s+(học\s+viên|khách|client)|thêm\s+(học\s+viên|khách|client)/i.test(lower);
  let createdClientObj = null;

  if (isCreateClient) {
    // Extract name
    let extractedName = "Học viên mới";
    const nameMatch = prompt.match(/(?:tên\s+là|tên:|học viên)\s+([A-ZÀ-Ỹa-zà-ỹ\s]{2,25}?)(?=[,\.\-\d]|tuổi|nam|nữ|nặng|muốn|$)/i);
    if (nameMatch && nameMatch[1].trim()) {
      extractedName = nameMatch[1].trim();
    }

    // Extract age
    const ageMatch = prompt.match(/(\d{1,2})\s*tuổi/i);
    const age = ageMatch ? parseInt(ageMatch[1], 10) : 26;

    // Extract gender
    const gender = /nữ|chị|cô|bà|female/i.test(prompt) ? "female" : "male";

    // Extract weight
    const weightMatch = prompt.match(/(\d{2,3}(?:\.\d)?)\s*kg/i);
    const weight = weightMatch ? parseFloat(weightMatch[1]) : (gender === 'female' ? 54 : 72);

    // Extract goal
    let goal = "Giảm mỡ & Săn chắc cơ thể";
    if (/tăng cơ|hypertrophy|bulk/i.test(prompt)) goal = "Tăng cơ bắp & Cải thiện sức mạnh";
    else if (/giảm cân|giảm mỡ|siết|cut/i.test(prompt)) goal = "Giảm mỡ thừa & Thon gọn vóc dáng";
    else if (/sức mạnh|power|1rm/i.test(prompt)) goal = "Phát triển sức mạnh tối đa";

    const clientRes = actionExecutors.create_client({
      full_name: extractedName,
      age,
      gender,
      starting_weight: weight,
      fitness_goal: goal
    });
    createdClientObj = clientRes.item;
    createdItems.push(clientRes);
  }

  const targetClient = createdClientObj || selectedClient;
  const targetClientName = targetClient?.full_name || "Học viên";
  const targetClientId = targetClient?.id || "";

  // 2. Detect: CREATE WORKOUT PLAN ("tạo giáo án", "lên giáo án", "bài tập", "lịch tập", "combo")
  const isCreateWorkout = /giáo\s*án|bài\s*tập|lịch\s*tập|workout|combo|trọn\s*gói/i.test(lower);
  if (isCreateWorkout) {
    // Detect number of days
    let daysCount = 3;
    const daysMatch = prompt.match(/(\d)\s*(?:ngày|buổi)/i);
    if (daysMatch) daysCount = parseInt(daysMatch[1], 10);
    else if (/4\s*buổi|upper\s*lower/i.test(lower)) daysCount = 4;
    else if (/5\s*buổi/i.test(lower)) daysCount = 5;

    // Determine split
    const daysList = [];
    if (daysCount === 4) {
      daysList.push({ day_number: 1, title: "Buổi 1: Thân Trên (Upper Body)", exercises: EXERCISE_DATABASE.push });
      daysList.push({ day_number: 2, title: "Buổi 2: Thân Dưới (Lower Body)", exercises: EXERCISE_DATABASE.legs });
      daysList.push({ day_number: 3, title: "Buổi 3: Lưng & Kéo (Pull Focus)", exercises: EXERCISE_DATABASE.pull });
      daysList.push({ day_number: 4, title: "Buổi 4: Đẩy & Vai (Push Focus)", exercises: EXERCISE_DATABASE.push });
    } else {
      daysList.push({ day_number: 1, title: "Buổi 1: Đẩy - Ngực & Tay Sau (Push)", exercises: EXERCISE_DATABASE.push });
      daysList.push({ day_number: 2, title: "Buổi 2: Kéo - Lưng & Tay Trước (Pull)", exercises: EXERCISE_DATABASE.pull });
      daysList.push({ day_number: 3, title: "Buổi 3: Chân & Mông Đùi (Legs)", exercises: EXERCISE_DATABASE.legs });
    }

    const workoutRes = actionExecutors.create_workout_plan({
      name: `Giáo Án Tăng Cơ ${daysCount} Buổi - ${targetClientName}`,
      client_id: targetClientId,
      client_name: targetClientName,
      days_per_week: daysCount,
      difficulty: 'intermediate',
      days: daysList
    });
    createdItems.push(workoutRes);
  }

  // 3. Detect: CREATE MEAL PLAN ("thực đơn", "dinh dưỡng", "ăn uống", "calo", "combo", "trọn gói")
  const isCreateMeal = /thực\s*đơn|dinh\s*dưỡng|calo|ăn\s*uống|meal|nutrition|combo|trọn\s*gói/i.test(lower);
  if (isCreateMeal) {
    // Extract calories
    const calMatch = prompt.match(/(\d{4})\s*(?:calo|kcal)/i);
    const calories = calMatch ? parseInt(calMatch[1], 10) : 2000;

    const mealRes = actionExecutors.create_meal_plan({
      name: `Thực Đơn Dinh Dưỡng ${calories} kcal - ${targetClientName}`,
      client_id: targetClientId,
      client_name: targetClientName,
      daily_calories: calories
    });
    createdItems.push(mealRes);
  }

  // 4. Detect: LOG PROGRESS ("cân nặng", "đo chỉ số", "tiến độ", "kg", "mỡ")
  const isProgress = !isCreateClient && /(?:cân\s*nặng|đo\s*chỉ\s*số|hôm\s*nay\s*cân|giảm\s*còn|tăng\s*lên)\s*(\d{2,3}(?:\.\d)?)\s*kg/i.test(prompt);
  if (isProgress) {
    const weightMatch = prompt.match(/(\d{2,3}(?:\.\d)?)\s*kg/i);
    const fatMatch = prompt.match(/(\d{1,2}(?:\.\d)?)\s*%\s*mỡ/i);
    const weight = weightMatch ? parseFloat(weightMatch[1]) : 70;
    const bodyFat = fatMatch ? parseFloat(fatMatch[1]) : null;

    const progRes = actionExecutors.log_progress({
      client_id: targetClientId,
      client_name: targetClientName,
      weight,
      body_fat_percentage: bodyFat
    });
    createdItems.push(progRes);
  }

  // 5. Detect: BOOK SESSION ("lịch tập", "đặt lịch", "hẹn tập", "buổi tập")
  const isSession = /(?:đặt\s*lịch|hẹn\s*tập|buổi\s*tập\s*lúc|lịch\s*tập\s*lúc)/i.test(lower);
  if (isSession) {
    const timeMatch = prompt.match(/(\d{1,2})(?:h|:00|\s*giờ)/i);
    const startHour = timeMatch ? parseInt(timeMatch[1], 10).toString().padStart(2, '0') : "09";
    const endHour = timeMatch ? (parseInt(timeMatch[1], 10) + 1).toString().padStart(2, '0') : "10";

    const sessionRes = actionExecutors.book_session({
      client_id: targetClientId,
      client_name: targetClientName,
      date: new Date().toISOString().split('T')[0],
      start_time: `${startHour}:00`,
      end_time: `${endHour}:00`
    });
    createdItems.push(sessionRes);
  }

  // Compose friendly response
  if (createdItems.length > 0) {
    replyText = `Chào Coach! Tôi đã tự động tạo và lưu trữ thành công **${createdItems.length} mục dữ liệu** mới vào hệ thống:\n\n`;
    createdItems.forEach(item => {
      replyText += `• **${item.summary}**\n`;
    });
    replyText += `\nCác thông tin đã sẵn sàng! Bạn có thể nhấn vào các thẻ bên dưới để xem chi tiết hoặc **Xuất PDF ngay để gửi cho học viên qua Zalo**!`;
  } else {
    replyText = `Chào Coach! Tôi là Trợ Lý AI ApexCoach. Tôi có thể giúp bạn tự động tạo mọi thứ chỉ với 1 tin nhắn:\n\n` +
      `• **Tạo học viên mới**: *"Tạo học viên Nguyễn Văn A 25 tuổi, 75kg, mục tiêu giảm mỡ"*\n` +
      `• **Tạo giáo án tập**: *"Tạo giáo án 4 buổi Push Pull Legs cho Nguyễn Văn A"*\n` +
      `• **Tạo thực đơn dinh dưỡng**: *"Lên thực đơn 2000 calo giàu đạm cho Nguyễn Văn A"*\n` +
      `• **Tạo trọn gói**: *"Tạo học viên Mai Linh 24 tuổi, nữ và tạo luôn giáo án 3 buổi + thực đơn 1600 calo"*\n` +
      `• **Ghi nhận cân nặng**: *"Hôm nay Nam cân được 72kg, 18% mỡ"*\n\n` +
      `Hãy nhắn cho tôi yêu cầu của bạn nhé!`;
  }

  return {
    content: replyText,
    createdItems
  };
}

/**
 * Call Google Gemini API with native Function Calling tools
 */
export async function callGeminiApi({ prompt, history = [], selectedClient = null, userProfile = null }) {
  const apiKey = getGeminiApiKey();
  const model = getGeminiModel();

  // If no API key configured, seamlessly fall back to local high-accuracy NLP!
  if (!apiKey) {
    return executeLocalNLP(prompt, selectedClient);
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemInstruction = `Bạn là Trợ Lý Huấn Luyện AI Toàn Năng (ApexCoach AI) dành riêng cho Huấn Luyện Viên Thể Hình Cá Nhân (PT) tại Việt Nam.
Tác phong: Nhanh nhẹn, chuyên nghiệp, thông thái, am hiểu sâu về thể hình, dinh dưỡng và huấn luyện 1-1.

QUY TẮC CỐT LÕI:
1. Khi HLV yêu cầu tạo học viên, giáo án, thực đơn, đo chỉ số, hoặc đặt lịch: BẠN BẮT BUỘC PHẢI GỌI CÔNG CỤ (tool_calls) ĐỂ LƯU VÀO HỆ THỐNG.
2. TÊN BÀI TẬP THỂ HÌNH BẮT BUỘC GIỮ NGUYÊN TIẾNG ANH CHUẨN: Bench Press, Incline Dumbbell Press, Barbell Squat, Romanian Deadlift, Lat Pulldown, Barbell Row, Bicep Curl, Tricep Pushdown, Cable Fly, Pull-ups, Push-ups, Plank, Overhead Press, Hip Thrust, v.v.
3. Giáo án tập phải phân bổ Sets (hiệp), Reps (số lần), Rest (thời gian nghỉ giây: 60s-120s), và RIR (1-2).
4. Thực đơn phải tính toán hợp lý: Calo (kcal), Đạm (Protein), Carb, Chất béo (Fat).
5. Nếu HLV bảo tạo trọn gói (học viên + giáo án + thực đơn), hãy gọi lần lượt các công cụ để hoàn thiện đầy đủ.
6. Sau khi tạo, hãy phản hồi bằng tiếng Việt thân thiện, tóm tắt các điểm nổi bật và chúc HLV một buổi tập hiệu quả.`;

  // Gemini Tool Declarations
  const tools = [
    {
      functionDeclarations: [
        {
          name: "create_client",
          description: "Tạo một học viên mới trong hệ thống của PT",
          parameters: {
            type: "OBJECT",
            properties: {
              full_name: { type: "STRING", description: "Họ và tên của học viên" },
              gender: { type: "STRING", enum: ["male", "female", "other"], description: "Giới tính" },
              age: { type: "INTEGER", description: "Tuổi" },
              starting_weight: { type: "NUMBER", description: "Cân nặng ban đầu (kg)" },
              target_weight: { type: "NUMBER", description: "Cân nặng mục tiêu (kg)" },
              fitness_goal: { type: "STRING", description: "Mục tiêu tập luyện" },
              phone: { type: "STRING", description: "Số điện thoại" },
              notes: { type: "STRING", description: "Ghi chú thêm" }
            },
            required: ["full_name"]
          }
        },
        {
          name: "create_workout_plan",
          description: "Tạo giáo án tập luyện hoàn chỉnh (các bài tập BẮT BUỘC dùng tên tiếng Anh)",
          parameters: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING", description: "Tên giáo án" },
              client_name: { type: "STRING", description: "Tên học viên" },
              difficulty: { type: "STRING", enum: ["beginner", "intermediate", "advanced"] },
              days_per_week: { type: "INTEGER", description: "Số buổi tập mỗi tuần" },
              days: {
                type: "ARRAY",
                description: "Danh sách các buổi tập",
                items: {
                  type: "OBJECT",
                  properties: {
                    day_number: { type: "INTEGER" },
                    title: { type: "STRING", description: "Tên buổi tập (ví dụ: Buổi 1: Ngực & Tay Sau)" },
                    exercises: {
                      type: "ARRAY",
                      items: {
                        type: "OBJECT",
                        properties: {
                          name: { type: "STRING", description: "Tên bài tập tiếng Anh: Bench Press, Barbell Squat, Lat Pulldown..." },
                          sets: { type: "INTEGER" },
                          reps: { type: "STRING" },
                          rest_seconds: { type: "INTEGER" },
                          rir: { type: "INTEGER" },
                          notes: { type: "STRING" }
                        },
                        required: ["name", "sets", "reps"]
                      }
                    }
                  },
                  required: ["day_number", "title", "exercises"]
                }
              }
            },
            required: ["name", "days"]
          }
        },
        {
          name: "create_meal_plan",
          description: "Tạo thực đơn ăn uống với calo, macro và các bữa ăn",
          parameters: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING", description: "Tên thực đơn" },
              client_name: { type: "STRING", description: "Tên học viên" },
              daily_calories: { type: "NUMBER", description: "Tổng lượng calo mỗi ngày (kcal)" },
              protein_g: { type: "NUMBER", description: "Lượng đạm mỗi ngày (gram)" },
              carbs_g: { type: "NUMBER", description: "Lượng tinh bột mỗi ngày (gram)" },
              fat_g: { type: "NUMBER", description: "Lượng chất béo mỗi ngày (gram)" },
              meals: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    meal_type: { type: "STRING", enum: ["breakfast", "lunch", "dinner", "snack"] },
                    title: { type: "STRING", description: "Tên bữa ăn" },
                    foods: {
                      type: "ARRAY",
                      items: {
                        type: "OBJECT",
                        properties: {
                          name: { type: "STRING" },
                          portion: { type: "STRING" },
                          calories: { type: "NUMBER" },
                          protein: { type: "NUMBER" },
                          carbs: { type: "NUMBER" },
                          fat: { type: "NUMBER" }
                        },
                        required: ["name", "portion"]
                      }
                    }
                  },
                  required: ["meal_type", "title", "foods"]
                }
              }
            },
            required: ["name", "daily_calories", "meals"]
          }
        },
        {
          name: "log_progress",
          description: "Ghi nhận chỉ số đo lường hoặc cân nặng cho học viên",
          parameters: {
            type: "OBJECT",
            properties: {
              client_name: { type: "STRING" },
              weight: { type: "NUMBER" },
              body_fat_percentage: { type: "NUMBER" },
              chest: { type: "NUMBER" },
              waist: { type: "NUMBER" },
              hips: { type: "NUMBER" },
              arms: { type: "NUMBER" },
              thighs: { type: "NUMBER" }
            },
            required: ["weight"]
          }
        },
        {
          name: "book_session",
          description: "Đặt lịch tập hoặc hẹn giờ cho học viên",
          parameters: {
            type: "OBJECT",
            properties: {
              client_name: { type: "STRING" },
              date: { type: "STRING" },
              start_time: { type: "STRING" },
              end_time: { type: "STRING" },
              type: { type: "STRING" },
              notes: { type: "STRING" }
            },
            required: ["date", "start_time"]
          }
        }
      ]
    }
  ];

  // Build message history
  const contents = [];
  history.slice(-6).forEach(msg => {
    if (msg.role === 'user') {
      contents.push({ role: 'user', parts: [{ text: msg.content }] });
    } else if (msg.role === 'assistant' || msg.role === 'model') {
      contents.push({ role: 'model', parts: [{ text: msg.content }] });
    }
  });

  // Current turn prompt with context
  let contextAugmentedPrompt = prompt;
  if (selectedClient) {
    contextAugmentedPrompt = `[Ngữ cảnh: Đang làm việc với học viên ${selectedClient.full_name}, ID: ${selectedClient.id}, Mục tiêu: ${selectedClient.fitness_goal}]\n${prompt}`;
  }
  contents.push({ role: 'user', parts: [{ text: contextAugmentedPrompt }] });

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        tools,
        generationConfig: {
          temperature: 0.3
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('[aiService] Gemini API returned error:', errorData);
      // Fallback to Local NLP so the user is NEVER blocked
      return executeLocalNLP(prompt, selectedClient);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (!candidate) {
      return executeLocalNLP(prompt, selectedClient);
    }

    const parts = candidate.content?.parts || [];
    const createdItems = [];
    let textResponse = "";

    // Execute any function calls requested by Gemini
    for (const part of parts) {
      if (part.text) {
        textResponse += part.text;
      }
      if (part.functionCall) {
        const { name, args } = part.functionCall;
        if (actionExecutors[name]) {
          try {
            const res = actionExecutors[name](args);
            createdItems.push(res);
          } catch (execErr) {
            console.error(`[aiService] Error executing tool ${name}:`, execErr);
          }
        }
      }
    }

    if (!textResponse && createdItems.length > 0) {
      textResponse = `Đã tự động khởi tạo thành công theo yêu cầu của Coach:\n` +
        createdItems.map(i => `• ${i.summary}`).join('\n') +
        `\n\nBạn có thể nhấn vào các thẻ bên dưới để xem hoặc xuất file PDF gửi học viên ngay!`;
    }

    // If Gemini only answered text without triggering tool calls on a creation request,
    // trigger our Local NLP to ensure data is ACTUALLY created in storage!
    const creationIntent = /tạo|lên giáo án|thêm học viên|thực đơn|ghi nhận|đặt lịch/i.test(prompt);
    if (creationIntent && createdItems.length === 0) {
      const localFallback = executeLocalNLP(prompt, selectedClient);
      if (localFallback.createdItems.length > 0) {
        return {
          content: textResponse || localFallback.content,
          createdItems: localFallback.createdItems
        };
      }
    }

    return {
      content: textResponse || "Đã xử lý thành công yêu cầu của bạn!",
      createdItems
    };

  } catch (netErr) {
    console.error('[aiService] Gemini API network error, using local fallback:', netErr);
    return executeLocalNLP(prompt, selectedClient);
  }
}
