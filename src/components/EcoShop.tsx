import React, { useState } from 'react';
import { Coins, Trees, Home, X, HelpCircle, Check, Hammer, TreePine } from 'lucide-react';
import { ShopItem } from '../types';

interface EcoShopProps {
  points: number;
  onSelectItemToPlace: (type: string) => void;
  activePlacementType: string | null;
  onClose: () => void;
}

export const EcoShop: React.FC<EcoShopProps> = ({
  points,
  onSelectItemToPlace,
  activePlacementType,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'building' | 'nature'>('all');

  const shopItems: ShopItem[] = [
    {
      type: 'tree',
      name: '아기 초록 나무',
      cost: 500,
      icon: 'tree',
      description: 'CO2를 흡수하고 마을을 다시 살기 좋은 기후로 복원시킵니다.',
    },
    {
      type: 'house',
      name: '아늑한 오두막',
      cost: 1000,
      icon: 'house',
      description: '황무지를 이겨내고 정착할 수 있는 친환경 태양광 주택입니다.',
    },
    {
      type: 'fence',
      name: '울타리 가드',
      cost: 300,
      icon: 'fence',
      description: '마을 외곽과 자연 구역을 기분 좋게 나눌 울타리입니다.',
    },
    {
      type: 'mailbox',
      name: '친환경 빨간 우체통',
      cost: 200,
      icon: 'mailbox',
      description: '마을 입구에 아기자기함을 전해줄 귀여운 미니 우체통입니다.',
    },
    {
      type: 'apartment',
      name: '친환경 아파트',
      cost: 2500,
      icon: 'apartment',
      description: '태양광 패널과 녹색 발코니를 품은 제로에너지 공동체 주거빌딩.',
    },
    {
      type: 'small_house',
      name: '아담한 작은 집',
      cost: 800,
      icon: 'small_house',
      description: '에너지 등급 1등급의 앙증맞은 녹색 지붕 친환경 오두막집.',
    },
    {
      type: 'large_house',
      name: '풍력&태양광 저택',
      cost: 1800,
      icon: 'large_house',
      description: '소형 풍력발전 설비와 태양광 전지판을 갖춘 넓은 2층 고급 주택.',
    },
    {
      type: 'pond',
      name: '생태 녹색 연못',
      cost: 1200,
      icon: 'pond',
      description: '자연 여과 시스템과 푸른 수련 패드가 있는 힐링 생태 수역.',
    },
    {
      type: 'fountain',
      name: '태양광 솔라 분수',
      cost: 1500,
      icon: 'fountain',
      description: '전기 소모 없이 햇빛 발전량으로만 예쁘게 작동하는 야외 분수대.',
    },
    {
      type: 'flower',
      name: '오색 야생화 꽃밭',
      cost: 150,
      icon: 'flower',
      description: '나비와 벌들을 환영하는 알록달록 무지개 빛 야생화 정원.',
    },
    {
      type: 'grass',
      name: '푸른 천연 잔디밭',
      cost: 100,
      icon: 'grass',
      description: '마을의 토양 유실을 방지하고 상쾌한 녹색 광장을 꾸밀 잔디 매트.',
    },
  ];

  // Filter based on selected tabs (Building vs Nature)
  const filteredItems = shopItems.filter((item) => {
    if (activeTab === 'building') {
      return ['house', 'fence', 'mailbox', 'apartment', 'small_house', 'large_house'].includes(item.type);
    }
    if (activeTab === 'nature') {
      return ['tree', 'pond', 'fountain', 'flower', 'grass'].includes(item.type);
    }
    return true; // all
  });

  return (
    <div className="relative w-full max-w-xl mx-auto bg-[#F8FAFC] border-[4px] border-black rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      {/* 1. Playful Striped Candy Awning Header (Image 3) */}
      <div className="relative h-14 bg-[#F87171] border-b-[4px] border-black flex items-center justify-between px-4 overflow-hidden">
        {/* Awning stripes simulation */}
        <div className="absolute inset-0 flex pointer-events-none opacity-20">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-full ${i % 2 === 0 ? 'bg-black' : 'bg-transparent'}`}
              style={{ transform: 'skewX(-20deg)' }}
            />
          ))}
        </div>

        {/* Center Shop Nameplate */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#FFFBEB] border-[3px] border-black px-8 py-1 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] z-10">
          <span className="font-game font-bold text-lg text-slate-900">상점</span>
        </div>

        {/* Top Right point display & Close button */}
        <div className="flex items-center space-x-2 ml-auto z-10">
          <div className="bg-[#BBF7D0] border-[2.5px] border-black px-2.5 py-1 rounded-full text-xs font-bold text-slate-900 flex items-center space-x-1">
            <Coins className="w-3.5 h-3.5 fill-amber-300 text-black" />
            <span className="font-game">{points.toLocaleString()} P</span>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white border-[2.5px] border-black hover:bg-rose-100 flex items-center justify-center font-bold text-slate-800 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <X className="w-4.5 h-4.5" strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* 2. Shop Navigation Tabs (Image 3) */}
      <div className="bg-white border-b-[3.5px] border-black p-3.5 flex space-x-2">
        {(['all', 'building', 'nature'] as const).map((tab) => {
          const tabLabels = { all: '전체', building: '건물', nature: '자연' };
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl font-game font-bold text-sm border-[3px] border-black shadow-xs transition active:translate-y-0.5 cursor-pointer ${isActive ? 'bg-[#93C5FD] hover:bg-blue-300 text-black shadow-none' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}
            >
              {tabLabels[tab]}
            </button>
          );
        })}
      </div>

      {/* 3. Items Catalog Grid (Image 3) */}
      <div className="p-5 max-h-[380px] overflow-y-auto space-y-4">
        <p className="text-xs font-bold text-slate-500 font-game leading-relaxed">
          💡 에코 포인트를 지불하여 친환경 소품을 영토에 배치하세요! 구매 후 배치 모드에서 지도를 클릭하면 소품이 설치됩니다.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const canAfford = points >= item.cost;
            const isSelected = activePlacementType === item.type;

            return (
              <div
                key={item.type}
                className={`bg-white border-[3px] border-black rounded-2xl p-3 flex flex-col justify-between items-center text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${isSelected ? 'ring-4 ring-emerald-400 bg-emerald-50' : ''}`}
              >
                {/* Visual Icon Illustration box (Large outline border as requested) */}
                <div className="w-20 h-20 bg-slate-50 border-[3px] border-black rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden mb-2.5">
                  <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:10px_10px]" />
                  {item.type === 'tree' && (
                    <svg width="46" height="52" viewBox="0 0 62 74" className="z-10 drop-shadow-sm">
                      {/* Trunk */}
                      <path d="M27,45 L35,45 L36,70 L26,70 Z" fill="#78350F" stroke="#111827" strokeWidth="3.5" strokeLinejoin="round" />
                      {/* Leaves */}
                      <path d="M13,46 C4,46 2,35 10,27 C4,18 12,8 23,12 C29,2 44,2 48,12 C58,10 58,23 52,29 C58,38 50,46 41,44 C36,50 18,50 13,46 Z" fill="#10B981" stroke="#111827" strokeWidth="3.5" strokeLinejoin="round" />
                      <path d="M23,25 C21,20 29,13 36,17 C40,13 44,17 42,23 C46,24 44,31 38,29 C36,33 25,33 23,25 Z" fill="#34D399" />
                      <circle cx="20" cy="22" r="3" fill="#EF4444" stroke="#111827" strokeWidth="1.2" />
                    </svg>
                  )}
                  {item.type === 'house' && (
                    <svg width="50" height="50" viewBox="0 0 70 70" className="z-10 drop-shadow-sm">
                      {/* House Wall Base */}
                      <rect x="14" y="32" width="42" height="30" fill="#FEF3C7" stroke="#111827" strokeWidth="3.5" strokeLinejoin="round" />
                      {/* Triangular Roof */}
                      <polygon points="9,34 35,11 61,34" fill="#F87171" stroke="#111827" strokeWidth="3.5" strokeLinejoin="round" />
                      <polygon points="15,30 35,15 55,30" fill="#EF4444" />
                      {/* Front Door */}
                      <path d="M21,62 L21,45 C21,42 27,42 27,45 L27,62 Z" fill="#78350F" stroke="#111827" strokeWidth="2.8" />
                      {/* Solar Panel */}
                      <rect x="17" y="20" width="10" height="7" fill="#1E3A8A" stroke="#111827" strokeWidth="2.2" transform="rotate(-15, 17, 20)" />
                    </svg>
                  )}
                  {item.type === 'fence' && (
                    <svg width="42" height="32" viewBox="0 0 50 36" className="z-10">
                      {/* Horizontal support bars */}
                      <rect x="2" y="13" width="46" height="4" fill="#B45309" stroke="#111827" strokeWidth="2.5" />
                      <rect x="2" y="24" width="46" height="4" fill="#B45309" stroke="#111827" strokeWidth="2.5" />
                      {/* Wood pickets */}
                      <polygon points="5,7 10,2 15,7 15,34 5,34" fill="#F5EBE6" stroke="#111827" strokeWidth="2.5" strokeLinejoin="round" />
                      <polygon points="20,7 25,2 30,7 30,34 20,34" fill="#F5EBE6" stroke="#111827" strokeWidth="2.5" strokeLinejoin="round" />
                      <polygon points="35,7 40,2 45,7 45,34 35,34" fill="#F5EBE6" stroke="#111827" strokeWidth="2.5" strokeLinejoin="round" />
                    </svg>
                  )}
                  {item.type === 'mailbox' && (
                    <svg width="40" height="45" viewBox="0 0 45 50" className="z-10 drop-shadow-sm">
                      <rect x="20" y="25" width="5" height="23" fill="#78350F" stroke="#111827" strokeWidth="2.5" />
                      <path d="M10,25 L35,25 L35,14 C35,7 30,7 22.5,7 C15,7 10,7 10,14 Z" fill="#EF4444" stroke="#111827" strokeWidth="2.5" strokeLinejoin="round" />
                      <path d="M10,14 L35,14" stroke="#111827" strokeWidth="2" />
                      <path d="M34,16 L34,10 L38,10 L38,13 L34,13" fill="#F59E0B" stroke="#111827" strokeWidth="1.5" strokeLinejoin="round" />
                      <line x1="34" y1="16" x2="34" y2="20" stroke="#111827" strokeWidth="2" />
                      <circle cx="14" cy="20" r="1.5" fill="#FBBF24" stroke="#111827" strokeWidth="1" />
                    </svg>
                  )}
                  {item.type === 'apartment' && (
                    <svg width="48" height="56" viewBox="0 0 80 95" className="z-10 drop-shadow-sm">
                      <rect x="12" y="15" width="56" height="75" fill="#E2E8F0" stroke="#111827" strokeWidth="3.5" strokeLinejoin="round" />
                      <rect x="16" y="5" width="48" height="10" fill="#1E3A8A" stroke="#111827" strokeWidth="3" />
                      <line x1="28" y1="5" x2="28" y2="15" stroke="#3B82F6" strokeWidth="1.5" />
                      <line x1="40" y1="5" x2="40" y2="15" stroke="#3B82F6" strokeWidth="1.5" />
                      <line x1="52" y1="5" x2="52" y2="15" stroke="#3B82F6" strokeWidth="1.5" />
                      <rect x="18" y="22" width="10" height="10" fill="#93C5FD" stroke="#111827" strokeWidth="2" />
                      <rect x="35" y="22" width="10" height="10" fill="#93C5FD" stroke="#111827" strokeWidth="2" />
                      <rect x="52" y="22" width="10" height="10" fill="#93C5FD" stroke="#111827" strokeWidth="2" />
                      <rect x="18" y="40" width="10" height="10" fill="#93C5FD" stroke="#111827" strokeWidth="2" />
                      <rect x="35" y="40" width="10" height="10" fill="#93C5FD" stroke="#111827" strokeWidth="2" />
                      <rect x="52" y="40" width="10" height="10" fill="#93C5FD" stroke="#111827" strokeWidth="2" />
                      <rect x="15" y="47" width="16" height="5" fill="#10B981" stroke="#111827" strokeWidth="2" />
                      <rect x="49" y="47" width="16" height="5" fill="#10B981" stroke="#111827" strokeWidth="2" />
                      <rect x="18" y="58" width="10" height="10" fill="#93C5FD" stroke="#111827" strokeWidth="2" />
                      <rect x="35" y="58" width="10" height="10" fill="#93C5FD" stroke="#111827" strokeWidth="2" />
                      <rect x="52" y="58" width="10" height="10" fill="#93C5FD" stroke="#111827" strokeWidth="2" />
                      <rect x="32" y="76" width="16" height="14" fill="#78350F" stroke="#111827" strokeWidth="2.5" />
                    </svg>
                  )}
                  {item.type === 'small_house' && (
                    <svg width="46" height="46" viewBox="0 0 55 55" className="z-10 drop-shadow-sm">
                      <rect x="10" y="24" width="35" height="26" fill="#FEE2E2" stroke="#111827" strokeWidth="3" strokeLinejoin="round" />
                      <polygon points="6,26 27.5,7 49,26" fill="#059669" stroke="#111827" strokeWidth="3" strokeLinejoin="round" />
                      <rect x="16" y="36" width="10" height="14" fill="#B45309" stroke="#111827" strokeWidth="2" />
                      <circle cx="34" cy="35" r="4.5" fill="#FEF08A" stroke="#111827" strokeWidth="2" />
                    </svg>
                  )}
                  {item.type === 'large_house' && (
                    <svg width="52" height="48" viewBox="0 0 85 80" className="z-10 drop-shadow-sm">
                      <rect x="8" y="32" width="30" height="42" fill="#FAF5FF" stroke="#111827" strokeWidth="3.2" strokeLinejoin="round" />
                      <rect x="38" y="24" width="38" height="50" fill="#F5F3FF" stroke="#111827" strokeWidth="3.2" strokeLinejoin="round" />
                      <polygon points="4,34 23,15 42,34" fill="#312E81" stroke="#111827" strokeWidth="3" strokeLinejoin="round" />
                      <polygon points="34,26 57,6 80,26" fill="#1E1B4B" stroke="#111827" strokeWidth="3" strokeLinejoin="round" />
                      <rect x="14" y="40" width="8" height="10" fill="#FEF08A" stroke="#111827" strokeWidth="2" />
                      <rect x="44" y="34" width="10" height="12" fill="#FEF08A" stroke="#111827" strokeWidth="2" />
                      <rect x="60" y="34" width="10" height="12" fill="#FEF08A" stroke="#111827" strokeWidth="2" />
                      <rect x="60" y="54" width="10" height="12" fill="#FEF08A" stroke="#111827" strokeWidth="2" />
                      <rect x="18" y="56" width="12" height="18" fill="#78350F" stroke="#111827" strokeWidth="2.5" />
                    </svg>
                  )}
                  {item.type === 'pond' && (
                    <svg width="48" height="34" viewBox="0 0 70 45" className="z-10 drop-shadow-sm">
                      <ellipse cx="35" cy="22" rx="32" ry="18" fill="#D1D5DB" stroke="#111827" strokeWidth="3" />
                      <ellipse cx="34" cy="22" rx="28" ry="14" fill="#2563EB" stroke="#111827" strokeWidth="2.5" />
                      <ellipse cx="22" cy="20" rx="4" ry="2" fill="#059669" />
                      <ellipse cx="44" cy="24" rx="5" ry="2.5" fill="#059669" />
                    </svg>
                  )}
                  {item.type === 'fountain' && (
                    <svg width="45" height="48" viewBox="0 0 55 60" className="z-10 drop-shadow-sm">
                      <ellipse cx="27.5" cy="46" rx="22" ry="8" fill="#94A3B8" stroke="#111827" strokeWidth="3" />
                      <ellipse cx="27.5" cy="44" rx="18" ry="5" fill="#38BDF8" />
                      <rect x="24" y="22" width="7" height="24" fill="#64748B" stroke="#111827" strokeWidth="3" />
                      <ellipse cx="27.5" cy="24" rx="12" ry="4.5" fill="#94A3B8" stroke="#111827" strokeWidth="2.5" />
                      <ellipse cx="27.5" cy="23" rx="9" ry="2.5" fill="#38BDF8" />
                    </svg>
                  )}
                  {item.type === 'flower' && (
                    <svg width="42" height="38" viewBox="0 0 40 35" className="z-10 drop-shadow-sm">
                      <ellipse cx="20" cy="28" rx="15" ry="4" fill="#78350F" opacity="0.4" />
                      <path d="M10,26 L10,14" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="10" cy="12" r="4.5" fill="#EF4444" stroke="#111827" strokeWidth="1.5" />
                      <path d="M20,28 L20,10" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="20" cy="8" r="5" fill="#FBBF24" stroke="#111827" strokeWidth="1.5" />
                      <path d="M30,26 L30,16" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="30" cy="14" r="4" fill="#A855F7" stroke="#111827" strokeWidth="1.5" />
                    </svg>
                  )}
                  {item.type === 'grass' && (
                    <svg width="40" height="30" viewBox="0 0 35 25" className="z-10 drop-shadow-sm">
                      <path d="M10,22 L6,10 M10,22 L10,6 M10,22 L14,10" stroke="#10B981" strokeWidth="3.2" strokeLinecap="round" />
                      <path d="M24,22 L20,12 M24,22 L24,8 M24,22 L28,12" stroke="#059669" strokeWidth="3.2" strokeLinecap="round" />
                    </svg>
                  )}
                </div>

                {/* Info Text */}
                <div className="space-y-1 mb-2">
                  <h4 className="font-game font-black text-xs text-slate-800 leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-tight line-clamp-1">
                    {item.description}
                  </p>
                </div>

                {/* Price Display / Buy Button Action */}
                <button
                  onClick={() => onSelectItemToPlace(item.type)}
                  disabled={!canAfford && !isSelected}
                  className={`w-full py-1.5 rounded-xl text-xs font-game font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition active:translate-y-0.5 flex items-center justify-center space-x-1 cursor-pointer ${isSelected ? 'bg-emerald-400 hover:bg-emerald-500 text-black' : canAfford ? 'bg-[#FED7AA] hover:bg-[#FDBA74] text-slate-900' : 'bg-slate-200 text-slate-400 border-slate-400 cursor-not-allowed shadow-none'}`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      <span>배치 중</span>
                    </>
                  ) : (
                    <>
                      <span>🍃 {item.cost}P</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
