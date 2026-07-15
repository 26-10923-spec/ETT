import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, RotateCcw, HelpCircle, Info, Sparkles, AlertCircle, Trees, Sun, Flame, Droplets, LogIn, Lock, User, LogOut, Settings } from 'lucide-react';
import { ReceiptAnalysisResult, DecorationItem } from './types';
import { VillageCanvas } from './components/VillageCanvas';
import { ReceiptScanner } from './components/ReceiptScanner';
import { EcoShop } from './components/EcoShop';
import { AnalysisDetail } from './components/AnalysisDetail';
import { SettingsScreen } from './components/SettingsScreen';

const getWeatherType = (pts: number): 'Drought' | 'Cloudy' | 'Sunny' => {
  if (pts < 500) return 'Drought';
  if (pts < 1000) return 'Cloudy';
  return 'Sunny';
};

// Initial default Wasteland state for first-time onboarding
const initialResult: ReceiptAnalysisResult = {
  metadata: {
    store_name: '미제출 대기 상태 (황무지)',
    transaction_date: '2026-07-14 21:30',
    approval_number: 'PENDING'
  },
  analyzed_items: [],
  scoring: {
    final_score: 30, // Default low score to trigger Drought initially
    points_earned_or_lost: 0
  },
  game_village_status: {
    current_environment: 'Wasteland',
    weather: 'Disaster',
    active_disaster: 'Drought',
    disaster_visual_effect_trigger: true,
    shop_available: true,
    status_message: '어서 오세요! 우리 에코 빌리지는 대지가 메마른 [황무지 가뭄 재해] 상태입니다. 아래의 [영수증 촬영] 탭을 눌러 친환경 로컬푸드 영수증을 인증해 비를 내리고 나무를 상점에서 구매해 초록 숲을 채워보세요!'
  },
  recommendations: [
    '소고기, 치즈 등 탄소 Red 등급 축산 소비를 줄이고 국산 사과, 토마토 등 저탄소 로컬푸드를 소비해 점수를 높이세요!',
    'Green 등급 친환경 품목 1개 구매 시 +500P가 적립되며 상점에서 나무와 오두막을 살 수 있습니다.'
  ]
};

export default function App() {
  // Login & Nickname States matching Image 1
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('eco_logged_in') === 'true';
  });
  const [userId, setUserId] = useState<string>(() => {
    return localStorage.getItem('eco_user_id') || 'ECO_HERO';
  });
  const [password, setPassword] = useState<string>('');
  const [villageName, setVillageName] = useState<string>(() => {
    return localStorage.getItem('eco_village_name') || '민수의 에코 타운';
  });

  // Real Sign Up States
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(false);
  const [signUpId, setSignUpId] = useState<string>('');
  const [signUpPassword, setSignUpPassword] = useState<string>('');
  const [signUpVillageName, setSignUpVillageName] = useState<string>('');

  // Game States
  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem('eco_points');
    return saved ? parseInt(saved, 10) : 2000; // Provide initial 2000P for testing ease
  });

  const [placedItems, setPlacedItems] = useState<DecorationItem[]>(() => {
    const saved = localStorage.getItem('eco_placed_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [lastAnalysisResult, setLastAnalysisResult] = useState<ReceiptAnalysisResult>(() => {
    const saved = localStorage.getItem('eco_last_analysis');
    return saved ? JSON.parse(saved) : initialResult;
  });

  const [analysisHistory, setAnalysisHistory] = useState<ReceiptAnalysisResult[]>(() => {
    const saved = localStorage.getItem('eco_analysis_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeSidebarTab, setActiveSidebarTab] = useState<'guide' | 'history'>('guide');

   // Panel View States for satisfy "한 화면에 다 안나오게..."
  // 'none' means standard Map view is fully focused.
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'shop' | 'scan' | 'detail' | 'settings'>('none');
  const [weatherTransition, setWeatherTransition] = useState<{
    from: 'Drought' | 'Cloudy' | 'Sunny';
    to: 'Drought' | 'Cloudy' | 'Sunny';
    oldPoints: number;
    newPoints: number;
    result: ReceiptAnalysisResult;
  } | null>(null);
  const [selectedItemToPlace, setSelectedItemToPlace] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state with LocalStorage
  useEffect(() => {
    localStorage.setItem('eco_points', String(points));
  }, [points]);

  useEffect(() => {
    localStorage.setItem('eco_analysis_history', JSON.stringify(analysisHistory));
  }, [analysisHistory]);

  useEffect(() => {
    localStorage.setItem('eco_placed_items', JSON.stringify(placedItems));
  }, [placedItems]);

  useEffect(() => {
    localStorage.setItem('eco_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('eco_user_id', userId);
  }, [userId]);

  useEffect(() => {
    localStorage.setItem('eco_village_name', villageName);
  }, [villageName]);

  useEffect(() => {
    localStorage.setItem('eco_last_analysis', JSON.stringify(lastAnalysisResult));
  }, [lastAnalysisResult]);

  // Seed default account (ECO_HERO / 1234) on mount if none exist
  useEffect(() => {
    const usersStr = localStorage.getItem('eco_registered_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    
    if (!users['ECO_HERO']) {
      users['ECO_HERO'] = {
        userId: 'ECO_HERO',
        password: '1234',
        villageName: '대구화원고 에코 타운',
        points: 2000,
        placedItems: [],
        lastAnalysisResult: initialResult,
        analysisHistory: [],
      };
      localStorage.setItem('eco_registered_users', JSON.stringify(users));
    }
  }, []);

  // Sync current user states back to registered database dynamically
  useEffect(() => {
    if (isLoggedIn && userId) {
      const usersStr = localStorage.getItem('eco_registered_users');
      const users: Record<string, any> = usersStr ? JSON.parse(usersStr) : {};
      
      const existingUser = users[userId];
      users[userId] = {
        userId,
        password: existingUser?.password || password || '1234', // keep original password
        villageName,
        points,
        placedItems,
        lastAnalysisResult,
        analysisHistory,
      };
      localStorage.setItem('eco_registered_users', JSON.stringify(users));
    }
  }, [isLoggedIn, userId, villageName, points, placedItems, lastAnalysisResult, analysisHistory]);

  // Handle Real Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = userId.trim();
    const cleanPassword = password.trim();

    if (!cleanId) {
      alert('아이디를 입력해 주세요!');
      return;
    }
    if (!cleanPassword) {
      alert('비밀번호를 입력해 주세요!');
      return;
    }

    const usersStr = localStorage.getItem('eco_registered_users');
    const users: Record<string, any> = usersStr ? JSON.parse(usersStr) : {};

    const user = users[cleanId];
    if (!user) {
      alert('가입되지 않은 아이디입니다. 먼저 회원가입을 완료해 주세요!');
      return;
    }

    if (user.password !== cleanPassword) {
      alert('비밀번호가 올바르지 않습니다!');
      return;
    }

    // Load user profile
    setUserId(user.userId);
    setPassword(user.password);
    setVillageName(user.villageName || `${user.userId}의 에코 타운`);
    setPoints(user.points !== undefined ? user.points : 2000);
    setPlacedItems(user.placedItems || []);
    setLastAnalysisResult(user.lastAnalysisResult || initialResult);
    setAnalysisHistory(user.analysisHistory || []);
    setIsLoggedIn(true);
    
    alert(`👋 어서 오세요, ${user.userId}님! 에코 타운에 성공적으로 로그인되었습니다.`);
  };

  // Handle Real Sign Up
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = signUpId.trim();
    const cleanPassword = signUpPassword.trim();
    const cleanVillageName = signUpVillageName.trim() || `${cleanId}의 에코 타운`;

    if (!cleanId) {
      alert('아이디를 입력해 주세요!');
      return;
    }
    if (!cleanPassword) {
      alert('비밀번호를 입력해 주세요!');
      return;
    }

    const usersStr = localStorage.getItem('eco_registered_users');
    const users: Record<string, any> = usersStr ? JSON.parse(usersStr) : {};

    if (users[cleanId]) {
      alert('이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요!');
      return;
    }

    // Register user
    const newUser = {
      userId: cleanId,
      password: cleanPassword,
      villageName: cleanVillageName,
      points: 2000,
      placedItems: [],
      lastAnalysisResult: initialResult,
      analysisHistory: [],
    };
    users[cleanId] = newUser;
    localStorage.setItem('eco_registered_users', JSON.stringify(users));

    alert('🎉 회원가입이 완료되었습니다! 가입하신 에코 빌리저 계정으로 자동 로그인합니다.');

    // Automatically log in newly created user
    setUserId(cleanId);
    setPassword(cleanPassword);
    setVillageName(cleanVillageName);
    setPoints(2000);
    setPlacedItems([]);
    setLastAnalysisResult(initialResult);
    setAnalysisHistory([]);
    setIsLoggedIn(true);

    // Reset signup inputs
    setSignUpId('');
    setSignUpPassword('');
    setSignUpVillageName('');
    setIsSignUpMode(false);
  };

  // Reset village back to empty sandbox (Excellent debugging utility)
  const handleResetVillage = () => {
    if (window.confirm('정말 영토 상태와 누적 에코 포인트를 처음 상태로 리셋하시겠습니까? (배치한 나무와 집이 전부 회수됩니다)')) {
      setPoints(2000);
      setPlacedItems([]);
      setLastAnalysisResult(initialResult);
      setAnalysisHistory([]);
      localStorage.removeItem('eco_analysis_history');
      setSelectedItemToPlace(null);
      setError(null);
      setActiveOverlay('none');
    }
  };

  // Select Item from shop to place
  const handleSelectItemToPlace = (type: string) => {
    const costs: Record<string, number> = {
      tree: 500,
      house: 1000,
      fence: 300,
      mailbox: 200,
      apartment: 2500,
      small_house: 800,
      large_house: 1800,
      pond: 1200,
      fountain: 1500,
      flower: 150,
      grass: 100,
    };
    const cost = costs[type] || 0;

    if (points < cost) {
      alert(`보유한 에코 포인트가 부족합니다! 영수증을 인증해 포인트를 적립하세요. (필요: ${cost}P / 보유: ${points}P)`);
      return;
    }

    setSelectedItemToPlace(type);
    setActiveOverlay('none'); // Close shop overlay to let the user place it on map!
  };

  // Place the selected item on canvas coordinates (x, y)
  const handlePlaceItem = (x: number, y: number) => {
    if (!selectedItemToPlace) return;

    const costs: Record<string, number> = {
      tree: 500,
      house: 1000,
      fence: 300,
      mailbox: 200,
      apartment: 2500,
      small_house: 800,
      large_house: 1800,
      pond: 1200,
      fountain: 1500,
      flower: 150,
      grass: 100,
    };
    const cost = costs[selectedItemToPlace] || 0;

    if (points < cost) {
      alert('에코 포인트가 부족합니다!');
      setSelectedItemToPlace(null);
      return;
    }

    const scales: Record<string, number> = {
      tree: 1.05,
      house: 1.1,
      fence: 0.95,
      mailbox: 0.85,
      apartment: 1.35,
      small_house: 1.0,
      large_house: 1.25,
      pond: 1.15,
      fountain: 1.15,
      flower: 0.8,
      grass: 0.85,
    };

    const newItem: DecorationItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: selectedItemToPlace,
      x: x,
      y: y,
      scale: scales[selectedItemToPlace] || 1.0
    };

    setPlacedItems((prev) => [...prev, newItem]);
    setPoints((prev) => prev - cost);
    setSelectedItemToPlace(null);
  };

  // Cancel pending item placement
  const handleCancelPlacement = () => {
    setSelectedItemToPlace(null);
  };

  // Reposition placed item on canvas
  const handleUpdateItemPosition = (id: string, x: number, y: number) => {
    setPlacedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, x, y } : item))
    );
  };

  // Remove placed item from canvas (with point refund!)
  const handleRemoveItem = (id: string) => {
    const itemToRemove = placedItems.find((item) => item.id === id);
    if (!itemToRemove) return;

    const costs: Record<string, number> = {
      tree: 500,
      house: 1000,
      fence: 300,
      mailbox: 200,
      apartment: 2500,
      small_house: 800,
      large_house: 1800,
      pond: 1200,
      fountain: 1500,
      flower: 150,
      grass: 100,
    };
    const refund = costs[itemToRemove.type] || 0;

    setPlacedItems((prev) => prev.filter((item) => item.id !== id));
    setPoints((prev) => prev + refund);
  };

  // Callback on receipt Gemini API success
  const handleAnalysisSuccess = (result: ReceiptAnalysisResult) => {
    const oldWeather = getWeatherType(points);
    const ptsChange = result.scoring.points_earned_or_lost || 0;
    const nextPoints = Math.max(0, points + ptsChange);
    const newWeather = getWeatherType(nextPoints);

    if (oldWeather !== newWeather) {
      setWeatherTransition({
        from: oldWeather,
        to: newWeather,
        oldPoints: points,
        newPoints: nextPoints,
        result: result,
      });
      setActiveOverlay('none'); // Close any scanner overlays so they see the map transition!
    } else {
      setLastAnalysisResult(result);
      setAnalysisHistory((prev) => [result, ...prev]);
      setPoints(nextPoints);
      setActiveOverlay('detail');
    }
  };

  const handleWeatherTransitionComplete = () => {
    if (!weatherTransition) return;
    const { newPoints, result } = weatherTransition;
    setLastAnalysisResult(result);
    setAnalysisHistory((prev) => [result, ...prev]);
    setPoints(newPoints);
    setWeatherTransition(null);
    setActiveOverlay('detail'); // Automatically open detail sheet on complete
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword('');
    setActiveOverlay('none');
  };

  // Statistics calculations
  const receiptCount = analysisHistory.length;
  const averageScore = receiptCount > 0
    ? Math.round(analysisHistory.reduce((sum, item) => sum + item.scoring.final_score, 0) / receiptCount)
    : 0;
  const greenItemCount = analysisHistory.reduce(
    (sum, item) => sum + (item.analyzed_items ? item.analyzed_items.filter((i) => i.category === 'Green').length : 0),
    0
  );
  const yellowItemCount = analysisHistory.reduce(
    (sum, item) => sum + (item.analyzed_items ? item.analyzed_items.filter((i) => i.category === 'Yellow').length : 0),
    0
  );
  const redItemCount = analysisHistory.reduce(
    (sum, item) => sum + (item.analyzed_items ? item.analyzed_items.filter((i) => i.category === 'Red').length : 0),
    0
  );
  
  const totalItems = greenItemCount + yellowItemCount + redItemCount;
  const greenPct = totalItems > 0 ? Math.round((greenItemCount / totalItems) * 100) : 0;
  const yellowPct = totalItems > 0 ? Math.round((yellowItemCount / totalItems) * 100) : 0;
  const redPct = totalItems > 0 ? 100 - greenPct - yellowPct : 0;

  // Derive status message based on points
  let current_status_message = lastAnalysisResult.game_village_status.status_message;
  const current_env = points >= 1000 ? 'Forest' : points >= 500 ? 'Developing' : 'Wasteland';
  const current_weather = points >= 1000 ? 'Sunny' : points >= 500 ? 'Cloudy' : 'Disaster';
  const current_active_disaster = points < 500 ? 'Drought' : 'None';

  if (points < 500) {
    current_status_message = '마을 대지가 쩍쩍 갈라져 가뭄이 심해지고 있습니다! 영수증을 분석해 에코 포인트를 쌓으세요! (현재 가뭄 상황 ⚠️)';
  } else if (points < 1000) {
    current_status_message = '마을 하늘에 어둑어둑한 먹구름이 끼어있습니다. 친환경 실천으로 맑은 날씨로 정화할 수 있습니다! (현재 먹구름 상황 ☁️)';
  } else {
    current_status_message = '하늘이 무척 푸르고 맑은 완벽한 에코 빌리지 상태입니다! 숲을 계속 채워나가세요! (현재 맑은 날씨 ☀️)';
  }

  const derivedVillageStatus = {
    ...lastAnalysisResult.game_village_status,
    current_environment: current_env,
    weather: current_weather,
    active_disaster: current_active_disaster,
    status_message: current_status_message,
  };

  return (
    <div className="min-h-screen bg-sky-100 text-slate-800 flex flex-col font-sans select-none pb-12">
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          /* ================= IMAGE 1: ECO TOWN HAND-DRAWN LOGIN PAGE ================= */
          <motion.div
            key="login_page"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex-1 flex items-center justify-center p-4 min-h-screen bg-[#7DD3FC] relative overflow-hidden"
          >
            {/* Background Clouds */}
            <div className="absolute top-10 left-10 w-24 h-12 bg-white rounded-full opacity-80 border-2 border-black pointer-events-none">
              <div className="absolute w-12 h-12 bg-white rounded-full top-[-16px] left-4 border-t-2 border-black" />
            </div>
            <div className="absolute top-24 right-16 w-32 h-16 bg-white rounded-full opacity-80 border-2 border-black pointer-events-none hidden sm:block">
              <div className="absolute w-16 h-16 bg-white rounded-full top-[-20px] left-6 border-t-2 border-black" />
            </div>

            <div className="w-full max-w-md bg-white border-[4px] border-black rounded-[2.5rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative z-10 my-8">
              {/* Logo (ECO TWON accent) */}
              <div className="space-y-1 mb-8">
                <div className="relative inline-block">
                  <h1 className="text-6xl font-black text-emerald-500 font-game tracking-tight flex items-center justify-center select-none stroke-black">
                    ECO
                    <span className="text-emerald-400 text-4xl ml-2">🌱</span>
                  </h1>
                  {/* Small hand-drawn leaf ornament */}
                  <div className="absolute top-[-12px] right-[-14px] transform rotate-12">
                    <span className="text-3xl text-emerald-600">🍃</span>
                  </div>
                </div>
                <p className="text-2xl font-bold font-game text-slate-800 tracking-widest uppercase">
                  TOWN
                </p>
                <div className="w-16 h-1 bg-black mx-auto rounded-full mt-2" />
              </div>

              {/* Form Card (Conditional Login / Sign Up Mode) */}
              {isSignUpMode ? (
                <form onSubmit={handleSignUpSubmit} className="space-y-4 text-left">
                  {/* ID input */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-game font-bold text-slate-700 ml-1">
                      새로운 아이디 입력
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-5 h-5 text-black" strokeWidth={2.5} />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="새로 사용할 아이디"
                        value={signUpId}
                        onChange={(e) => setSignUpId(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 text-sm md:text-base font-game font-bold text-slate-900 placeholder-slate-400 bg-white border-[3px] border-black rounded-2xl focus:outline-none focus:ring-0 shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Password input */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-game font-bold text-slate-700 ml-1">
                      비밀번호 입력
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-5 h-5 text-black" strokeWidth={2.5} />
                      </div>
                      <input
                        type="password"
                        required
                        placeholder="새 비밀번호"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 text-sm md:text-base font-game font-bold text-slate-900 placeholder-slate-400 bg-white border-[3px] border-black rounded-2xl focus:outline-none focus:ring-0 shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Village Name input */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-game font-bold text-slate-700 ml-1 flex justify-between">
                      <span>🏡 마을 이름 설정</span>
                      <span className="text-[10px] text-slate-400 font-extrabold">(선택 사항)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <span className="text-lg">🏡</span>
                      </div>
                      <input
                        type="text"
                        placeholder={signUpId ? `${signUpId}의 에코 타운` : "기본: [아이디]의 에코 타운"}
                        value={signUpVillageName}
                        onChange={(e) => setSignUpVillageName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 text-sm md:text-base font-game font-bold text-slate-900 placeholder-slate-400 bg-white border-[3px] border-black rounded-2xl focus:outline-none focus:ring-0 shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Submit button (Purple accent for Sign Up) */}
                  <button
                    type="submit"
                    className="w-full bg-[#C4B5FD] hover:bg-[#A78BFA] text-black py-3.5 rounded-2xl font-game font-extrabold text-base md:text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] border-[3px] border-black transition active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-center flex items-center justify-center space-x-2 mt-2"
                  >
                    <Sparkles className="w-5 h-5 text-black" strokeWidth={2.5} />
                    <span>회원가입 완료 및 가입</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                  {/* ID input */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-game font-bold text-slate-700 ml-1">
                      아이디 입력
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-5 h-5 text-black" strokeWidth={2.5} />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="아이디를 입력해 주세요 (예: ECO_HERO)"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 text-sm md:text-base font-game font-bold text-slate-900 placeholder-slate-400 bg-white border-[3px] border-black rounded-2xl focus:outline-none focus:ring-0 shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Password input */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-game font-bold text-slate-700 ml-1">
                      비밀번호 입력
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-5 h-5 text-black" strokeWidth={2.5} />
                      </div>
                      <input
                        type="password"
                        required
                        placeholder="비밀번호를 입력해 주세요 (기본: 1234)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 text-sm md:text-base font-game font-bold text-slate-900 placeholder-slate-400 bg-white border-[3px] border-black rounded-2xl focus:outline-none focus:ring-0 shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Submit button (Green theme matching login mockup) */}
                  <button
                    type="submit"
                    className="w-full bg-[#86EFAC] hover:bg-emerald-400 text-black py-3.5 rounded-2xl font-game font-extrabold text-base md:text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] border-[3px] border-black transition active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-center flex items-center justify-center space-x-2 mt-2"
                  >
                    <LogIn className="w-5 h-5 text-black" strokeWidth={2.5} />
                    <span>에코 타운 로그인</span>
                  </button>
                </form>
              )}

              {/* Mode Toggle Link */}
              <div className="mt-6 text-xs md:text-sm font-game font-bold text-slate-600 border-t border-dashed border-slate-200 pt-4">
                {isSignUpMode ? (
                  <span>
                    이미 계정이 있으신가요?{' '}
                    <span
                      onClick={() => setIsSignUpMode(false)}
                      className="text-violet-700 hover:text-violet-950 underline cursor-pointer"
                    >
                      로그인하러 가기
                    </span>
                  </span>
                ) : (
                  <span>
                    계정이 없으신가요?{' '}
                    <span
                      onClick={() => {
                        setIsSignUpMode(true);
                        setSignUpId('');
                        setSignUpPassword('');
                        setSignUpVillageName('');
                      }}
                      className="text-emerald-700 hover:text-emerald-950 underline cursor-pointer"
                    >
                      무료 회원가입 하기
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Grass Hills & Fences Decoration matching Image 1 bottom */}
            <div className="absolute bottom-0 inset-x-0 h-28 bg-[#86EFAC] border-t-[4px] border-black z-0 flex items-end justify-between px-10">
              <div className="flex items-end space-x-[-4px] pb-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-4 h-12 bg-white border-[2.5px] border-black border-b-0 rounded-t-sm" />
                ))}
              </div>
              <div className="text-3xl text-emerald-800 pb-2 select-none animate-bounce">
                🌸🌱🌻
              </div>
              <div className="flex items-end space-x-[-4px] pb-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-4 h-12 bg-white border-[2.5px] border-black border-b-0 rounded-t-sm" />
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ================= IMAGE 2 & 3: GAME MAP BOARD WITH SLIDEOUT/POPUP MODALS ================= */
          <motion.div
            key="game_board"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full max-w-4xl mx-auto px-4 py-8 flex-1 flex flex-col justify-center space-y-5"
          >
            {/* Top Toolbar */}
            <div className="flex justify-between items-center bg-white border-[3.5px] border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🏡</span>
                <div>
                  <h2 className="font-game font-black text-base text-slate-900 leading-tight">
                    {villageName}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-bold">에코 히어로: {userId}</p>
                </div>
              </div>

              {/* Control buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveOverlay('settings')}
                  className="bg-slate-100 hover:bg-slate-200 border-[2.5px] border-black p-2 rounded-xl text-slate-800 transition active:scale-95 cursor-pointer flex items-center space-x-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-game font-black text-xs"
                  title="환경 설정"
                >
                  <Settings className="w-5 h-5 text-black animate-[spin_10s_linear_infinite]" strokeWidth={2.5} />
                  <span>설정</span>
                </button>
              </div>
            </div>

            {/* Layout Box */}
            <AnimatePresence mode="wait">
              {activeOverlay === 'none' ? (
                /* ================= 1. STANDARD MAIN GAMEPLAY MAP & GUIDE SIDEBAR ================= */
                <motion.div
                  key="map_view"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full"
                >
                  {/* Left Column: Interactive Village canvas (Wider 8-column layout for immersive play) */}
                  <div className="lg:col-span-8 flex flex-col">
                    <VillageCanvas
                      status={derivedVillageStatus}
                      items={placedItems}
                      onPlaceItem={handlePlaceItem}
                      onUpdateItemPosition={handleUpdateItemPosition}
                      onRemoveItem={handleRemoveItem}
                      selectedItemToPlace={selectedItemToPlace}
                      onCancelPlacement={handleCancelPlacement}
                      points={points}
                      villageName={villageName}
                      onRenameVillage={setVillageName}
                      onOpenShop={() => {
                        setSelectedItemToPlace(null);
                        setActiveOverlay('shop');
                      }}
                      onOpenScan={() => {
                        setSelectedItemToPlace(null);
                        setActiveOverlay('scan');
                      }}
                      onOpenDetail={() => {
                        setSelectedItemToPlace(null);
                        setActiveOverlay('detail');
                      }}
                      weatherTransition={weatherTransition}
                      onWeatherTransitionComplete={handleWeatherTransitionComplete}
                    />
                  </div>

                  {/* Right Column: Tabbed Mini Board & History Log */}
                  <div className="lg:col-span-4 flex flex-col">
                    <div className="bg-white border-[3.5px] border-black rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
                      {/* Tabs Navigation */}
                      <div className="grid grid-cols-2 gap-2 border-b-2 border-slate-200 pb-3">
                        <button
                          onClick={() => setActiveSidebarTab('guide')}
                          className={`py-2 px-1 rounded-xl text-xs font-game font-extrabold border-[2.5px] border-black transition active:scale-95 cursor-pointer flex items-center justify-center space-x-1 ${
                            activeSidebarTab === 'guide'
                              ? 'bg-[#86EFAC] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                              : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <span>🏆</span>
                          <span>공략 가이드</span>
                        </button>
                        <button
                          onClick={() => setActiveSidebarTab('history')}
                          className={`py-2 px-1 rounded-xl text-xs font-game font-extrabold border-[2.5px] border-black transition active:scale-95 cursor-pointer flex items-center justify-center space-x-1 ${
                            activeSidebarTab === 'history'
                              ? 'bg-[#93C5FD] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                              : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <span>📊</span>
                          <span>기록 ({receiptCount})</span>
                        </button>
                      </div>

                      {activeSidebarTab === 'guide' ? (
                        /* TAB 1: GUIDELINES */
                        <div className="space-y-4.5">
                          <div className="flex items-center space-x-2 text-[#4ADE80]">
                            <span className="text-xl">🏆</span>
                            <h4 className="font-game font-bold text-sm text-slate-900">친환경 에코 빌리지 공략법</h4>
                          </div>
                          
                          <div className="space-y-3 font-game text-[11px] text-slate-600 leading-relaxed">
                            <div className="flex items-start space-x-2">
                              <span className="bg-red-400 text-black font-black text-[8px] px-1.5 py-0.5 rounded border border-black shrink-0">고탄소 RED</span>
                              <p className="font-bold text-slate-800 leading-tight">소고기, 치즈, 초콜릿 (-25점 / 가뭄 유발 요인)</p>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="bg-amber-300 text-black font-black text-[8px] px-1.5 py-0.5 rounded border border-black shrink-0">중탄소 YEL</span>
                              <p className="font-bold text-slate-800 leading-tight">돼지고기, 달걀, 쌀 (-10점)</p>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="bg-emerald-400 text-black font-black text-[8px] px-1.5 py-0.5 rounded border border-black shrink-0">저탄소 GRN</span>
                              <p className="font-bold text-slate-800 leading-tight">국산 사과, 배추, 토마토 (+20점 / 맑은날 복구)</p>
                            </div>
                          </div>

                          <div className="border-t-2 border-dashed border-slate-200 pt-3 text-[10.5px] text-slate-500 leading-relaxed font-game">
                            📌 **팁**: 하단의 [영수증 촬영]을 클릭해 모의 영수증을 분석하거나 실생활 사진을 올리세요. 획득한 포인트로 [에코 상점]을 열어 영토를 숲과 오두막으로 채워 기후 변동을 극복하십시오!
                          </div>
                        </div>
                      ) : (
                        /* TAB 2: RECEIPT HISTORY LOG & STATS */
                        <div className="space-y-4">
                          {/* Aggregate stats header */}
                          <div className="grid grid-cols-4 gap-1.5 bg-slate-50 border-2 border-black rounded-2xl p-2 text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <div>
                              <p className="text-[8px] text-slate-400 font-game font-bold">인증 횟수</p>
                              <p className="text-xs font-black font-game text-slate-900">{receiptCount}회</p>
                            </div>
                            <div>
                              <p className="text-[8px] text-slate-400 font-game font-bold">평균 점수</p>
                              <p className={`text-xs font-black font-game ${
                                averageScore >= 80 ? 'text-emerald-600' : averageScore >= 40 ? 'text-amber-500' : 'text-rose-500'
                              }`}>{averageScore}점</p>
                            </div>
                            <div>
                              <p className="text-[8px] text-slate-400 font-game font-bold">Green</p>
                              <p className="text-xs font-black font-game text-emerald-600">+{greenItemCount}개</p>
                            </div>
                            <div>
                              <p className="text-[8px] text-slate-400 font-game font-bold">Red</p>
                              <p className="text-xs font-black font-game text-rose-500">-{redItemCount}개</p>
                            </div>
                          </div>

                          {/* Dynamic visual carbon ratio breakdown */}
                          {totalItems > 0 && (
                            <div className="bg-slate-50 border-2 border-black rounded-2xl p-3 text-center space-y-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              <p className="text-[9.5px] text-slate-500 font-extrabold uppercase font-game">📊 품목 탄소 성분비</p>
                              <div className="h-4.5 w-full rounded-lg border-2 border-black overflow-hidden flex font-game font-black text-[9px] text-black">
                                {greenItemCount > 0 && (
                                  <div style={{ width: `${greenPct}%` }} className="bg-emerald-400 flex items-center justify-center border-r border-black" title={`Green: ${greenItemCount}개 (${greenPct}%)`}>
                                    {greenPct >= 15 && `G ${greenPct}%`}
                                  </div>
                                )}
                                {yellowItemCount > 0 && (
                                  <div style={{ width: `${yellowPct}%` }} className="bg-amber-300 flex items-center justify-center border-r border-black" title={`Yellow: ${yellowItemCount}개 (${yellowPct}%)`}>
                                    {yellowPct >= 15 && `Y ${yellowPct}%`}
                                  </div>
                                )}
                                {redItemCount > 0 && (
                                  <div style={{ width: `${redPct}%` }} className="bg-rose-400 flex items-center justify-center" title={`Red: ${redItemCount}개 (${redPct}%)`}>
                                    {redPct >= 15 && `R ${redPct}%`}
                                  </div>
                                )}
                              </div>
                              <div className="flex justify-between items-center text-[8px] font-extrabold text-slate-600 px-0.5 font-game">
                                <span className="flex items-center space-x-0.5">
                                  <span className="w-1.5 h-1.5 rounded-sm bg-emerald-400 border border-black inline-block" />
                                  <span>저탄소 {greenItemCount}개</span>
                                </span>
                                <span className="flex items-center space-x-0.5">
                                  <span className="w-1.5 h-1.5 rounded-sm bg-amber-300 border border-black inline-block" />
                                  <span>중탄소 {yellowItemCount}개</span>
                                </span>
                                <span className="flex items-center space-x-0.5">
                                  <span className="w-1.5 h-1.5 rounded-sm bg-rose-400 border border-black inline-block" />
                                  <span>고탄소 {redItemCount}개</span>
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Historical logs list */}
                          <div className="space-y-2">
                            <h4 className="font-game font-black text-xs text-slate-900 flex items-center space-x-1">
                              <span>📸</span>
                              <span>인증된 영수증 내역 ({receiptCount})</span>
                            </h4>

                            {receiptCount === 0 ? (
                              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center text-slate-400 font-game text-[10px] leading-relaxed">
                                아직 분석한 영수증이 없습니다.<br />
                                아래 <span className="font-extrabold text-emerald-600">하단의 [영수증 촬영]</span> 버튼을 눌러 첫 번째 영수증을 인증해보세요! 🌱
                              </div>
                            ) : (
                              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                {analysisHistory.map((hist, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => {
                                      setLastAnalysisResult(hist);
                                      setActiveOverlay('detail');
                                    }}
                                    className="border-[2px] border-black bg-slate-50 hover:bg-slate-100 rounded-xl p-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition active:translate-y-0.5 active:shadow-none flex items-center justify-between"
                                    title="상세 분석 보기"
                                  >
                                    <div className="flex-1 min-w-0 pr-2">
                                      <h5 className="font-game font-black text-[11px] text-slate-900 truncate">
                                        {hist.metadata.store_name}
                                      </h5>
                                      <p className="text-[8.5px] text-slate-400 font-bold">
                                        {hist.metadata.transaction_date}
                                      </p>
                                    </div>
                                    
                                    <div className="flex flex-col items-end shrink-0">
                                      <span className={`text-[9px] font-black font-game px-1.5 py-0.5 rounded border border-black ${
                                        hist.scoring.final_score >= 80 ? 'bg-emerald-400' : hist.scoring.final_score >= 40 ? 'bg-amber-300' : 'bg-red-400'
                                      }`}>
                                        {hist.scoring.final_score}점
                                      </span>
                                      <span className={`text-[8.5px] font-bold mt-1 ${
                                        hist.scoring.points_earned_or_lost >= 0 ? 'text-emerald-700' : 'text-rose-600'
                                      }`}>
                                        {hist.scoring.points_earned_or_lost >= 0 ? `+${hist.scoring.points_earned_or_lost}` : hist.scoring.points_earned_or_lost}P
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* ================= 2. FULL-SCREEN IMMERSIVE OVERLAY MODULES ================= */
                <motion.div
                  key="overlay_view"
                  initial={{ opacity: 0, y: 15, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.99 }}
                  className="w-full max-w-2xl md:max-w-3xl mx-auto py-2"
                >
                  {activeOverlay === 'shop' && (
                    <EcoShop
                      points={points}
                      onSelectItemToPlace={handleSelectItemToPlace}
                      activePlacementType={selectedItemToPlace}
                      onClose={() => setActiveOverlay('none')}
                    />
                  )}

                  {activeOverlay === 'scan' && (
                    <ReceiptScanner
                      onAnalysisSuccess={handleAnalysisSuccess}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                      error={error}
                      setError={setError}
                      onClose={() => setActiveOverlay('none')}
                      analysisHistory={analysisHistory}
                    />
                  )}

                  {activeOverlay === 'detail' && (
                    <AnalysisDetail
                      result={lastAnalysisResult}
                      onClose={() => setActiveOverlay('none')}
                    />
                  )}

                  {activeOverlay === 'settings' && (
                    <SettingsScreen
                      userId={userId}
                      villageName={villageName}
                      receiptCount={receiptCount}
                      points={points}
                      placedItemsCount={placedItems.length}
                      onResetVillage={handleResetVillage}
                      onLogout={handleLogout}
                      onClose={() => setActiveOverlay('none')}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
