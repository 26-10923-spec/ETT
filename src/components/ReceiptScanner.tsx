import React, { useState, useRef, useMemo } from 'react';
import { Upload, Camera, FileText, Check, AlertTriangle, Sparkles, AlertCircle, X, HelpCircle, Plus, Trash2, RotateCcw } from 'lucide-react';
import { ReceiptAnalysisResult } from '../types';

interface ReceiptScannerProps {
  onAnalysisSuccess: (result: ReceiptAnalysisResult) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (err: string | null) => void;
  onClose: () => void;
  analysisHistory: ReceiptAnalysisResult[];
}

interface SampleReceiptConfig {
  id: string;
  name: string;
  store: string;
  date: string;
  desc: string;
  badge: 'Drought Risk' | 'Perfect Forest' | 'Flood Risk' | 'Medium Carbon';
  badgeColor: string;
  items: Array<{ name: string; qty: number; price: string }>;
  authNum: string;
}

export const ReceiptScanner: React.FC<ReceiptScannerProps> = ({
  onAnalysisSuccess,
  isLoading,
  setIsLoading,
  error,
  setError,
  onClose,
  analysisHistory,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States for Review & Edit step
  const [analyzedResult, setAnalyzedResult] = useState<ReceiptAnalysisResult | null>(null);
  const [storeName, setStoreName] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [approvalNumber, setApprovalNumber] = useState('');
  const [editItems, setEditItems] = useState<Array<{ id: string; name: string; category: 'Red' | 'Yellow' | 'Green' }>>([]);

  const samples: SampleReceiptConfig[] = [
    {
      id: 'drought-beef',
      name: '🥩 한우 갈비 파티',
      store: '초고배출 숯불 한우 정육식당',
      date: '2026-07-14 19:30',
      desc: '소고기, 가공 치즈 등 탄소 고배출로 대지를 메마르게 하는 가뭄 유발 영수증',
      badge: 'Drought Risk',
      badgeColor: 'bg-amber-500 text-white border-2 border-black',
      authNum: '39482710',
      items: [
        { name: '한우 등심 (수입산)', qty: 2, price: '85,000원' },
        { name: '치즈 모듬 퐁듀 (스위스산)', qty: 1, price: '24,000원' },
        { name: '초콜릿 디저트 세트', qty: 1, price: '12,000원' },
        { name: '수입 아메리카노 커피', qty: 2, price: '9,000원' },
      ],
    },
    {
      id: 'sunny-local',
      name: '🥗 친환경 유기농 식탁',
      store: '충북 로컬푸드 유기농 마켓',
      date: '2026-07-14 13:15',
      desc: '국산 사과, 국산 두부 등 온실가스를 저감하고 숲을 가꾸는 100점 영수증',
      badge: 'Perfect Forest',
      badgeColor: 'bg-emerald-400 text-black border-2 border-black',
      authNum: '88172930',
      items: [
        { name: '충북 사과 (국내산 로컬푸드)', qty: 1, price: '8,500원' },
        { name: '충북 유기농 토마토 (로컬)', qty: 1, price: '6,200원' },
        { name: '국산 유기농 두부 1모', qty: 1, price: '3,500원' },
        { name: '유기농 감자 및 완두콩 모듬', qty: 1, price: '7,800원' },
        { name: '다회용 캔버스 에코백', qty: 1, price: '5,000원' },
      ],
    },
    {
      id: 'flood-plastic',
      name: '☕ 일회용품 배달 폭탄',
      store: '딜리버리 플라스틱 카페 대구점',
      date: '2026-07-14 12:40',
      desc: '배달 삼겹살, 플라스틱 일회용 컵 과다 소비로 홍수를 유발하는 영수증',
      badge: 'Flood Risk',
      badgeColor: 'bg-sky-400 text-black border-2 border-black',
      authNum: '44910283',
      items: [
        { name: '배달 삼겹살 세트 (수입산)', qty: 1, price: '29,000원' },
        { name: '플라스틱 일회용 컵 아이스 아메리카노', qty: 3, price: '13,500원' },
        { name: '일회용 플라스틱 용기 & 나무젓가락 포장', qty: 1, price: '1,500원' },
        { name: '멕시코산 수입 아보카도', qty: 2, price: '6,000원' },
      ],
    },
    {
      id: 'cloudy-chicken',
      name: '🍗 불금 치맥 야식',
      store: '신선 대구 통닭 호프',
      date: '2026-07-14 21:05',
      desc: '국산 치킨과 아보카도가 섞여 대기에 보통의 탄소를 배출하는 중간급 영수증',
      badge: 'Medium Carbon',
      badgeColor: 'bg-slate-300 text-black border-2 border-black',
      authNum: '33819204',
      items: [
        { name: '국산 프라이드 치킨', qty: 1, price: '21,000원' },
        { name: '멕시코산 아보카도 샐러드', qty: 1, price: '9,500원' },
        { name: '필리핀산 수입 바나나', qty: 1, price: '4,500원' },
        { name: '국내산 수제 생맥주 1000cc', qty: 1, price: '8,000원' },
      ],
    },
  ];

  const generateReceiptImageBase64 = (sample: SampleReceiptConfig): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 580;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 400, 580);

    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 5;
    ctx.strokeRect(10, 10, 380, 560);

    ctx.fillStyle = '#111827';
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px "Courier New", Courier, monospace';
    ctx.fillText('ECO TOWN RECEIPT', 200, 45);
    ctx.font = 'bold 15px "Courier New", Courier, monospace';
    ctx.fillText(sample.store, 200, 75);

    ctx.fillText('- - - - - - - - - - - - - - - - -', 200, 100);

    ctx.textAlign = 'left';
    ctx.font = '12px "Courier New", Courier, monospace';
    ctx.fillText(`일시: ${sample.date}`, 30, 125);
    ctx.fillText(`승인: ${sample.authNum}`, 30, 145);
    ctx.fillText(`구분: ${sample.badge}`, 30, 165);

    ctx.textAlign = 'center';
    ctx.fillText('- - - - - - - - - - - - - - - - -', 200, 195);

    ctx.textAlign = 'left';
    ctx.font = 'bold 13px "Courier New", Courier, monospace';
    ctx.fillText('품목명', 30, 220);
    ctx.textAlign = 'right';
    ctx.fillText('수량', 280, 220);
    ctx.fillText('금액', 370, 220);

    let currentY = 250;
    ctx.font = '12px "Courier New", Courier, monospace';
    sample.items.forEach((item) => {
      ctx.textAlign = 'left';
      ctx.fillText(item.name.substring(0, 16), 30, currentY);
      ctx.textAlign = 'right';
      ctx.fillText(String(item.qty), 280, currentY);
      ctx.fillText(item.price, 370, currentY);
      currentY += 28;
    });

    ctx.textAlign = 'center';
    ctx.fillText('- - - - - - - - - - - - - - - - -', 200, currentY);
    currentY += 25;

    ctx.textAlign = 'left';
    ctx.font = 'bold 15px "Courier New", Courier, monospace';
    ctx.fillText('합계:', 30, currentY);
    ctx.textAlign = 'right';
    ctx.fillText(`${(sample.items.length * 11500).toLocaleString()}원`, 370, currentY);

    return canvas.toDataURL('image/jpeg');
  };

  const submitReceipt = async (base64Image: string, filename: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image, filename }),
      });

      if (!response.ok) {
        throw new Error('영수증 서버 분석 중 에러가 발생했습니다.');
      }

      const data: ReceiptAnalysisResult = await response.json();
      
      // Instead of submitting immediately, open the Review & Edit form
      setAnalyzedResult(data);
      setStoreName(data.metadata.store_name);
      setTransactionDate(data.metadata.transaction_date);
      setApprovalNumber(data.metadata.approval_number);
      setEditItems(
        (data.analyzed_items || []).map((item, idx) => ({
          id: `item_${idx}_${Date.now()}`,
          name: item.name,
          category: item.category,
        }))
      );
    } catch (err: any) {
      setError(err.message || '영수증을 정상적으로 해독하지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleClick = (sample: SampleReceiptConfig) => {
    const base64 = generateReceiptImageBase64(sample);
    setPreviewUrl(base64);
    submitReceipt(base64, `sample_${sample.id}.jpg`);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 지원합니다.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreviewUrl(base64);
      submitReceipt(base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Live item modifications
  const handleAddItem = () => {
    const newItem = {
      id: `item_new_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: '',
      category: 'Green' as const,
    };
    setEditItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setEditItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, field: 'name' | 'category', value: string) => {
    setEditItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Dynamic live score calculator based on current form states
  const liveCalculatedResult = useMemo(() => {
    let score = 100;
    let points = 0;
    let hasPlastic = false;
    let hasMeat = false;

    const analyzed_items = editItems.map((item) => {
      let scoreImpact = 0;
      let pointImpact = 0;
      const nameLower = item.name.toLowerCase();

      if (item.category === 'Green') {
        if (/사과|배|딸기|토마토|감자|상추|시금치|농산물|로컬/i.test(nameLower)) {
          scoreImpact = 20;
          pointImpact = 500;
        } else if (/두부/i.test(nameLower)) {
          scoreImpact = 10;
          pointImpact = 300;
        } else {
          scoreImpact = 15;
          pointImpact = 400; // custom green fallback
        }
      } else if (item.category === 'Yellow') {
        if (/돼지|삼겹살|목살|베이컨/i.test(nameLower)) {
          scoreImpact = -10;
          pointImpact = -200;
          hasMeat = true;
        } else if (/닭|치킨|오리/i.test(nameLower)) {
          scoreImpact = -10;
          pointImpact = -200;
          hasMeat = true;
        } else {
          scoreImpact = -10;
          pointImpact = -200; // custom yellow fallback
        }
      } else if (item.category === 'Red') {
        if (/소고기|쇠고기|한우|등심|갈비|안심|불고기|육회|치즈|초콜릿/i.test(nameLower)) {
          scoreImpact = -25;
          pointImpact = -500;
          hasMeat = true;
        } else if (/비닐|봉투|종이컵|물티슈|일회용|플라스틱|컵/i.test(nameLower)) {
          scoreImpact = -15;
          pointImpact = -300;
          hasPlastic = true;
        } else {
          scoreImpact = -20;
          pointImpact = -400; // custom red fallback
        }
      }

      score += scoreImpact;
      points += pointImpact;

      return {
        name: item.name.trim() || '미확인 품목',
        category: item.category,
        score_impact: scoreImpact,
      };
    });

    const final_score = Math.min(100, Math.max(0, score));
    let disaster_trigger = false;
    let disaster_type: 'None' | 'Drought' | 'Flood' = 'None';

    if (final_score < 40) {
      disaster_trigger = true;
      if (hasPlastic && !hasMeat) {
        disaster_type = 'Flood';
      } else {
        disaster_type = 'Drought';
      }
    }

    const current_environment = final_score >= 80 ? 'Forest' : final_score >= 40 ? 'Developing' : 'Wasteland';
    const weather = final_score >= 80 ? 'Sunny' : final_score >= 40 ? 'Cloudy' : 'Disaster';

    let status_message = '마을이 평화롭고 안전한 상태입니다.';
    if (final_score >= 80) {
      status_message = '마을이 안전합니다! 상점에서 나무와 집을 사서 황무지를 숲으로 꾸밀 수 있는 완벽한 타이밍입니다!';
    } else if (final_score >= 40) {
      status_message = '마을에 서서히 먹구름이 끼고 있습니다. 환경 보호 실천이 필요합니다.';
    } else {
      status_message = '탄소 과다 배출로 기후 재해가 감지되었습니다! 마을 영토가 메마르고 있습니다. 저탄소 생활을 실천해 복구하세요!';
    }

    return {
      metadata: {
        store_name: storeName.trim() || '알 수 없는 마트',
        transaction_date: transactionDate || new Date().toISOString().replace('T', ' ').substring(0, 16),
        approval_number: approvalNumber.trim() || 'UNKNOWN',
      },
      analyzed_items,
      scoring: {
        final_score,
        points_earned_or_lost: points,
      },
      game_village_status: {
        current_environment,
        weather,
        active_disaster: disaster_type,
        disaster_visual_effect_trigger: disaster_trigger,
        shop_available: true,
        status_message,
      },
      recommendations: final_score >= 80 ? [
        '최고의 에코 빌리저이십니다! 로컬 푸드 위주의 소비 습관을 계속 유지해 주세요.',
        '주변에 다정한 저탄소 식습관 팁을 공유해 주시면 큰 도움이 됩니다!',
      ] : [
        '비닐봉투와 일회용 컵 대신 다회용 에코백과 텀블러를 상시 지참하면 온실가스 배출을 크게 차감할 수 있습니다!',
        '탄소 배출이 높은 육류 소비를 국산 두부나 제철 친환경 로컬 농산물로 대체해 보세요.',
      ],
    };
  }, [storeName, transactionDate, approvalNumber, editItems]);

  // Prevent duplicates validation check!
  const isDuplicateReceipt = useMemo(() => {
    const currentApproval = approvalNumber.trim();
    const currentStore = storeName.trim().toLowerCase();

    // 1. Check by Store Name and Approval Number (if it is valid and not UNKNOWN)
    if (currentApproval && currentApproval !== 'UNKNOWN') {
      const matchApproval = analysisHistory.some((history) => {
        const historyApproval = (history.metadata.approval_number || '').trim();
        const historyStore = (history.metadata.store_name || '').trim().toLowerCase();
        return (
          historyApproval !== 'UNKNOWN' &&
          historyApproval === currentApproval &&
          historyStore === currentStore
        );
      });
      if (matchApproval) return true;
    }

    // 2. Fallback Content-Based Check: Check if there's a receipt with the same store name and exact same item names
    return analysisHistory.some((history) => {
      const historyStore = (history.metadata.store_name || '').trim().toLowerCase();
      if (historyStore !== currentStore) return false;

      // Extract item names
      const historyItemNames = (history.analyzed_items || [])
        .map((i) => i.name.trim().toLowerCase())
        .sort()
        .join(',');
      const currentItemNames = editItems
        .map((i) => i.name.trim().toLowerCase())
        .sort()
        .join(',');

      return historyItemNames === currentItemNames && historyItemNames.length > 0;
    });
  }, [approvalNumber, storeName, editItems, analysisHistory]);

  const handleFinalSubmit = () => {
    if (isDuplicateReceipt) return; // double-check guard
    onAnalysisSuccess(liveCalculatedResult);
  };

  const handleResetScanner = () => {
    setAnalyzedResult(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-white border-[4px] border-black rounded-[2rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      
      {/* 1. Header Area */}
      <div className="bg-[#FDA4AF] border-b-[4px] border-black px-6 py-5 flex justify-between items-center">
        <div className="flex items-center space-x-2.5">
          <span className="text-2xl">📸</span>
          <h3 className="font-game font-black text-lg text-slate-900">
            {analyzedResult ? '영수증 인증 정보 검토 및 수정' : '영수증 촬영 & 탄소 분석'}
          </h3>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white border-[2.5px] border-black hover:bg-rose-100 flex items-center justify-center font-bold text-slate-800 shadow-sm transition active:scale-95 cursor-pointer"
        >
          <X className="w-5 h-5" strokeWidth={3} />
        </button>
      </div>

      {/* 2. Review & Edit Screen Content (Step 2) */}
      {analyzedResult ? (
        <div className="p-6 space-y-5 max-h-[520px] overflow-y-auto font-game">
          
          {analyzedResult.is_fallback ? (
            <div className="bg-amber-50 border-[2.5px] border-amber-500 p-4 rounded-2xl flex items-start space-x-3 text-xs leading-relaxed shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
              <div>
                <p className="font-black text-amber-950">⚠️ 제미나이 AI 가상 시뮬레이션 판독 작동 중</p>
                <p className="text-amber-800 font-bold mt-1">
                  현재 제미나이 AI API의 일일 무료 요청 제한(Quota)으로 인해 임시 스마트 시뮬레이션 판독이 적용되었습니다. 
                  <span className="text-rose-600 underline ml-1 font-black">실제 영수증의 마트명과 품목이 다르다면 하단 정보창을 클릭하여 원하는 품목으로 직접 자유롭게 추가/수정해 보세요!</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border-[2.5px] border-black p-4 rounded-2xl flex items-start space-x-3 text-xs leading-relaxed shadow-sm">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-black text-slate-900">🔍 제미나이 AI 스캔 가이드</p>
                <p className="text-slate-600 font-bold mt-1">
                  제미나이 AI가 영수증 정보를 판독하여 분석한 결과입니다. 실제 영수증 정보와 다를 경우 아래에서 마트명과 품목을 직접 클릭하여 자유롭게 수정해 보세요.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left Panel: Preview image & Core Score summary */}
            <div className="md:col-span-5 flex flex-col space-y-4">
              <div className="border-[3.5px] border-black rounded-2xl overflow-hidden p-1.5 bg-slate-50 shadow-sm flex items-center justify-center h-44">
                {previewUrl ? (
                  <img src={previewUrl} alt="Receipt Preview" className="max-h-full max-w-full object-contain rounded-lg" />
                ) : (
                  <div className="text-center text-slate-400 py-6">
                    <FileText className="w-10 h-10 mx-auto opacity-45 mb-1" />
                    <span className="text-[10px]">영수증 원본 없음</span>
                  </div>
                )}
              </div>

              {/* LIVE SCORE BILL BOARD */}
              <div className="bg-slate-900 text-white border-[3.5px] border-black rounded-2xl p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center space-y-2">
                <p className="text-[9.5px] text-slate-400 uppercase tracking-wider font-extrabold">실시간 에코 빌리지 판정</p>
                
                <div className="flex justify-around items-center py-1">
                  <div>
                    <span className="text-[9px] text-slate-400 block">탄소 점수</span>
                    <span className={`text-2xl font-black ${
                      liveCalculatedResult.scoring.final_score >= 80 ? 'text-emerald-400' : liveCalculatedResult.scoring.final_score >= 40 ? 'text-amber-300' : 'text-rose-400'
                    }`}>
                      {liveCalculatedResult.scoring.final_score}점
                    </span>
                  </div>
                  <div className="h-8 w-[2px] bg-slate-700" />
                  <div>
                    <span className="text-[9px] text-slate-400 block">포인트 적립</span>
                    <span className={`text-2xl font-black ${
                      liveCalculatedResult.scoring.points_earned_or_lost >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {liveCalculatedResult.scoring.points_earned_or_lost >= 0 ? `+${liveCalculatedResult.scoring.points_earned_or_lost}` : liveCalculatedResult.scoring.points_earned_or_lost}P
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-2 flex items-center justify-center space-x-1.5">
                  <span className="text-xs">날씨:</span>
                  <span className={`text-[10.5px] font-black px-2 py-0.5 rounded border border-white/20 ${
                    liveCalculatedResult.game_village_status.weather === 'Sunny' ? 'bg-emerald-950 text-emerald-400' : liveCalculatedResult.game_village_status.weather === 'Cloudy' ? 'bg-amber-950 text-amber-300' : 'bg-rose-950 text-rose-400'
                  }`}>
                    {liveCalculatedResult.game_village_status.weather === 'Sunny' ? '☀️ 맑음' : liveCalculatedResult.game_village_status.weather === 'Cloudy' ? '☁️ 흐림' : '⚠️ 재해발생'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Panel: Receipt Information Form */}
            <div className="md:col-span-7 space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500">마트/가맹점 이름</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2.5 bg-slate-50 border-[2.5px] border-black rounded-xl focus:outline-none"
                    placeholder="마트명 직접 수정"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500">승인번호 (중복체크용)</label>
                  <input
                    type="text"
                    value={approvalNumber}
                    onChange={(e) => setApprovalNumber(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2.5 bg-slate-50 border-[2.5px] border-black rounded-xl focus:outline-none"
                    placeholder="승인번호 (숫자)"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-500">결제일시</label>
                <input
                  type="text"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2.5 bg-slate-50 border-[2.5px] border-black rounded-xl focus:outline-none"
                  placeholder="YYYY-MM-DD HH:MM"
                />
              </div>

              {/* ITEMS DYNAMIC EDIT LIST */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-700">🛒 구매 품목 목록 ({editItems.length})</span>
                  <button
                    onClick={handleAddItem}
                    className="py-1 px-2 text-[10px] font-black bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-black rounded-lg transition active:scale-95 flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" strokeWidth={3} />
                    <span>품목 직접 추가</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {editItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2 bg-slate-50 border-[2px] border-black rounded-xl p-1.5">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        placeholder="품목명 (예: 사과, 소고기)"
                        className="flex-1 text-xs font-bold px-2 py-1 bg-white border border-slate-300 rounded focus:outline-none"
                      />

                      <select
                        value={item.category}
                        onChange={(e) => handleItemChange(item.id, 'category', e.target.value as any)}
                        className={`text-[10px] font-black px-1.5 py-1 rounded border-2 border-black focus:outline-none ${
                          item.category === 'Green' ? 'bg-emerald-300' : item.category === 'Yellow' ? 'bg-amber-300' : 'bg-rose-400'
                        }`}
                      >
                        <option value="Green">Green (저탄소)</option>
                        <option value="Yellow">Yellow (중탄소)</option>
                        <option value="Red">Red (고탄소)</option>
                      </select>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 hover:bg-rose-100 text-rose-600 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {editItems.length === 0 && (
                    <div className="text-center text-[10px] text-slate-400 py-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
                      등록된 품목이 없습니다. 품목을 직접 추가해 보세요.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* DUPLICATE WARNING */}
          {isDuplicateReceipt && (
            <div className="bg-amber-50 border-[3px] border-black rounded-2xl p-4 flex items-start space-x-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5 animate-bounce" strokeWidth={2.5} />
              <div>
                <p className="text-xs font-black text-amber-950">🚫 동일한 중복 영수증 등록 감지</p>
                <p className="text-[10.5px] font-bold text-amber-900 leading-relaxed mt-1">
                  이 영수증(<span className="font-black text-slate-900">{storeName} - {approvalNumber}</span>)은 이미 등록된 이력이 있습니다. 중복 탄소 포인트 적립 및 중복 랭킹 참여를 방지하기 위해 등록이 차단됩니다. 다른 새로운 영수증을 이용해 주세요.
                </p>
              </div>
            </div>
          )}

          {/* Footer Action buttons */}
          <div className="flex space-x-3 border-t-2 border-slate-100 pt-4 mt-1">
            <button
              onClick={handleResetScanner}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3.5 rounded-2xl font-black text-xs border-[3px] border-black transition active:scale-95 cursor-pointer flex items-center justify-center space-x-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <RotateCcw className="w-4.5 h-4.5" />
              <span>다시 촬영/업로드</span>
            </button>
            <button
              onClick={handleFinalSubmit}
              disabled={isDuplicateReceipt}
              className={`flex-1 py-3.5 rounded-2xl font-black text-xs border-[3px] border-black transition flex items-center justify-center space-x-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                isDuplicateReceipt
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60 shadow-none'
                  : 'bg-[#86EFAC] hover:bg-emerald-400 text-slate-900 cursor-pointer active:scale-95'
              }`}
            >
              <Check className="w-4.5 h-4.5" strokeWidth={3} />
              <span>최종 검증 완료 및 포인트 받기</span>
            </button>
          </div>
        </div>
      ) : (
        /* 3. Upload & File scan trigger (Step 1) */
        <div className="p-6 space-y-5 max-h-[460px] overflow-y-auto">
          <p className="text-xs font-bold text-slate-500 font-game leading-relaxed">
            실제 영수증 사진을 업로드하거나 아래의 **체험용 영수증 카드**를 클릭하여 탄소를 판독해 포인트를 적립하세요!
          </p>

          {/* Drag Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-[3.5px] border-dashed rounded-2xl p-6.5 text-center cursor-pointer transition ${dragActive ? 'border-emerald-500 bg-emerald-50 scale-[1.01]' : 'border-black hover:bg-slate-50'}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
            />

            {isLoading ? (
              <div className="space-y-4 py-4 relative overflow-hidden">
                <div className="absolute left-0 right-0 h-1 bg-emerald-400 opacity-80 animate-[bounce_1.5s_infinite] shadow-[0_0_8px_#10b981]" />
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto animate-spin border-2 border-black">
                  <Sparkles className="w-6 h-6 text-black" strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                  <p className="font-game font-bold text-slate-800">제미나이 AI가 탄소를 판독하는 중...</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-game">
                    식재료 배출 가스 지수를 실시간 추정 계산하고 있습니다.
                  </p>
                </div>
              </div>
            ) : previewUrl ? (
              <div className="space-y-3">
                <div className="relative max-w-[120px] mx-auto border-[2.5px] border-black rounded-xl overflow-hidden shadow-sm bg-white p-1">
                  <img src={previewUrl} alt="Preview" className="w-full h-auto object-contain rounded-lg" />
                  <div className="absolute top-1 right-1 bg-emerald-400 border-2 border-black text-black rounded-full p-0.5">
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-800 font-game">영수증 해독 완료!</p>
              </div>
            ) : (
              <div className="space-y-2 py-2">
                <div className="w-12 h-12 bg-slate-100 border-[2.5px] border-black rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5 text-black" strokeWidth={2.5} />
                </div>
                <div className="space-y-1 font-game">
                  <p className="text-sm font-bold text-slate-800">영수증 사진 드래그 앤 드롭 또는 클릭</p>
                  <p className="text-[11px] text-slate-400">카메라 스캔, 스크린샷 이미지 모두 지원합니다</p>
                </div>
              </div>
            )}
          </div>

          {/* Error notice */}
          {error && (
            <div className="bg-red-50 border-[2.5px] border-black rounded-xl p-3 text-xs font-game flex items-start space-x-2 text-red-900 shadow-sm">
              <AlertCircle className="w-4.5 h-4.5 text-red-500 mt-0.5 shrink-0" strokeWidth={2.5} />
              <div>
                <p className="font-black">분석 실패</p>
                <p className="text-red-700 leading-relaxed mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* 3. Demo cards */}
          <div className="space-y-2.5">
            <h4 className="font-game font-bold text-sm text-slate-800 flex items-center space-x-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>데모용 간편 영수증 카드</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-game">
              {samples.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => !isLoading && handleSampleClick(sample)}
                  disabled={isLoading}
                  className="text-left p-3.5 bg-white border-[2.5px] border-black rounded-2xl hover:bg-slate-50 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex justify-between items-center w-full mb-1">
                    <span className="font-game font-bold text-xs text-slate-900">{sample.name}</span>
                    <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded ${sample.badgeColor}`}>
                      {sample.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{sample.store}</p>
                  <p className="text-[10.5px] text-slate-600 leading-relaxed mt-1.5">
                    {sample.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
