import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Cloud, Droplets, Flame, RotateCcw, Coins, Edit2 } from 'lucide-react';
import { DecorationItem, GameVillageStatus } from '../types';

interface VillageCanvasProps {
  status: GameVillageStatus;
  items: DecorationItem[];
  onPlaceItem: (x: number, y: number) => void;
  onUpdateItemPosition: (id: string, x: number, y: number) => void;
  onRemoveItem: (id: string) => void;
  selectedItemToPlace: string | null;
  onCancelPlacement: () => void;
  points: number;
  villageName: string;
  onRenameVillage: (name: string) => void;
  onOpenShop: () => void;
  onOpenScan: () => void;
  onOpenDetail: () => void;
  weatherTransition?: {
    from: 'Drought' | 'Cloudy' | 'Sunny';
    to: 'Drought' | 'Cloudy' | 'Sunny';
    oldPoints: number;
    newPoints: number;
  } | null;
  onWeatherTransitionComplete?: () => void;
}

export const VillageCanvas: React.FC<VillageCanvasProps> = ({
  status,
  items,
  onPlaceItem,
  onUpdateItemPosition,
  onRemoveItem,
  selectedItemToPlace,
  onCancelPlacement,
  points,
  villageName,
  onRenameVillage,
  onOpenShop,
  onOpenScan,
  onOpenDetail,
  weatherTransition,
  onWeatherTransitionComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState(villageName);

  // Editing & Repositioning States
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [movingItemId, setMovingItemId] = useState<string | null>(null);

  // Drag-to-move States
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number; itemX: number; itemY: number } | null>(null);
  const hasDragged = useRef(false);

  // Drag Handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, item: DecorationItem) => {
    // If in placement mode or click-to-move mode, don't drag
    if (selectedItemToPlace || movingItemId) return;

    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragStartPos.current = {
      x: clientX,
      y: clientY,
      itemX: item.x,
      itemY: item.y
    };
    setDraggedItemId(item.id);
    hasDragged.current = false;
  };

  React.useEffect(() => {
    if (!draggedItemId) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragStartPos.current || !containerRef.current) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - dragStartPos.current.x;
      const deltaY = clientY - dragStartPos.current.y;

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        hasDragged.current = true;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const deltaXPct = (deltaX / rect.width) * 100;
      const deltaYPct = (deltaY / rect.height) * 100;

      let newX = dragStartPos.current.itemX + deltaXPct;
      let newY = dragStartPos.current.itemY + deltaYPct;

      // Bound check (x: 5~95, y: 15~85)
      if (newX < 5) newX = 5;
      if (newX > 95) newX = 95;
      if (newY < 15) newY = 15;
      if (newY > 85) newY = 85;

      onUpdateItemPosition(draggedItemId, newX, newY);
    };

    const handleEnd = () => {
      setDraggedItemId(null);
      setTimeout(() => {
        dragStartPos.current = null;
      }, 50);
    };

    window.addEventListener('mousemove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [draggedItemId, onUpdateItemPosition]);

  // Handle canvas click to place selected item, move an item, or deselect
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    // Do not trigger actions if clicking on buttons or specific control elements
    const target = e.target as HTMLElement;
    if (target.closest('.no-placement-click')) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Boundary check
    if (x >= 5 && x <= 95 && y >= 15 && y <= 85) {
      if (movingItemId) {
        onUpdateItemPosition(movingItemId, x, y);
        setMovingItemId(null);
      } else if (selectedItemToPlace) {
        onPlaceItem(x, y);
      } else {
        // Clicking on empty space deselects the current item
        setSelectedItemId(null);
      }
    }
  };

  const submitRename = () => {
    if (tempName.trim()) {
      onRenameVillage(tempName);
      setIsRenaming(false);
    }
  };

  // Weather Transitions Timeline and State Machine
  const [transitionPhase, setTransitionPhase] = useState<'none' | 'intro' | 'animating' | 'outro'>('none');
  const [transitionMsg, setTransitionMsg] = useState('');

  React.useEffect(() => {
    if (!weatherTransition) {
      setTransitionPhase('none');
      return;
    }

    const { from, to } = weatherTransition;
    let msg = '';
    
    if (from === 'Drought' && to === 'Cloudy') {
      msg = '메마른 대지에 습기가 차오르며 먹구름이 서서히 밀려옵니다... ☁️';
    } else if (from === 'Cloudy' && to === 'Sunny') {
      msg = '가득 찬 먹구름 사이로 정화의 단비가 시원하게 내린 뒤 맑게 개어납니다! 🌧️➡️☀️';
    } else if (from === 'Sunny' && to === 'Cloudy') {
      msg = '맑던 에코 하늘에 차가운 먹구름이 밀려오며 점차 어두워집니다... ☁️';
    } else if (from === 'Cloudy' && to === 'Drought') {
      msg = '강수가 완전히 그치고 극심한 열기가 발생하여 가뭄이 다시 작열합니다! ⚠️';
    } else if (from === 'Drought' && to === 'Sunny') {
      msg = '먹구름이 몰려와 세찬 정화의 비를 뿌려 대지를 적신 뒤 눈부신 햇살이 돋아납니다! 🌱';
    } else if (from === 'Sunny' && to === 'Drought') {
      msg = '맑은 하늘 위로 갑작스러운 고온 건조 기후가 지속되더니 메마른 황무지 가뭄이 덮칩니다! 🚨';
    } else {
      msg = `날씨 시스템이 변화하고 있습니다: ${from} ➡️ ${to}`;
    }

    setTransitionMsg(msg);
    setTransitionPhase('intro');

    // Timeline phases:
    // 0 ~ 1.5s: Intro announcement banner is displayed
    // 1.5 ~ 4.5s: Live background transition & custom visual weather effects (clouds sliding / rain falling / heatwave)
    // 4.5 ~ 5.5s: Outro fade-out phase
    // 5.5s: Trigger actual update
    const t1 = setTimeout(() => {
      setTransitionPhase('animating');
    }, 1500);

    const t2 = setTimeout(() => {
      setTransitionPhase('outro');
    }, 4500);

    const t3 = setTimeout(() => {
      if (onWeatherTransitionComplete) {
        onWeatherTransitionComplete();
      }
    }, 5500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [weatherTransition, onWeatherTransitionComplete]);

  // Point-based Weather Determination
  const getActiveWeather = (pts: number): 'Drought' | 'Cloudy' | 'Sunny' => {
    if (pts < 500) return 'Drought';
    if (pts < 1000) return 'Cloudy';
    return 'Sunny';
  };

  // Determine current active visual weather to display
  let currentDisplayWeather: 'Drought' | 'Cloudy' | 'Sunny' = 'Sunny';
  if (weatherTransition) {
    if (transitionPhase === 'intro') {
      currentDisplayWeather = weatherTransition.from;
    } else {
      currentDisplayWeather = weatherTransition.to;
    }
  } else {
    currentDisplayWeather = getActiveWeather(points);
  }

  const isDrought = currentDisplayWeather === 'Drought';
  const isCloudy = currentDisplayWeather === 'Cloudy';
  const isSunny = currentDisplayWeather === 'Sunny';
  const isFlood = false; // Point-based system has 3 clear tiers: Drought, Cloudy, Sunny

  // Determine ground & background style to match retro pixel-game and climate
  let bgGradient = 'bg-[#BAE6FD]'; // Base sky blue
  let groundBg = 'bg-[#BBF7D0]'; // Beautiful green
  let groundBorder = 'border-[#15803D]';

  if (isDrought) {
    bgGradient = 'bg-[#FEF08A]'; // Golden dry sky
    groundBg = 'bg-[#F59E0B]'; // Dried orange soil
    groundBorder = 'border-amber-950';
  } else if (isCloudy) {
    bgGradient = 'bg-[#94A3B8]'; // Muted grey sky
    groundBg = 'bg-[#CBD5E1]'; // Greyish grass
    groundBorder = 'border-slate-800';
  }

  // Draw custom high-fidelity hand-crafted vector models as requested!
  const renderTreeModel = (filterClass: string) => {
    return (
      <div className={`relative flex flex-col items-center group ${filterClass}`}>
        {/* Ambient shadow beneath the trunk */}
        <div className="w-10 h-3 bg-black/15 rounded-full blur-[1px] absolute bottom-[-2px] z-0" />
        
        <svg width="62" height="74" viewBox="0 0 62 74" className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)] relative z-10 transition-transform duration-200 group-hover:scale-105 active:scale-95">
          {/* Trunk */}
          <path d="M27,45 L35,45 L36,70 L26,70 Z" fill="#78350F" stroke="#111827" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M31,50 L31,64" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Leaves - Outer Layer (Darker Green) */}
          <path d="M13,46 C4,46 2,35 10,27 C4,18 12,8 23,12 C29,2 44,2 48,12 C58,10 58,23 52,29 C58,38 50,46 41,44 C36,50 18,50 13,46 Z" fill="#047857" stroke="#111827" strokeWidth="3.5" strokeLinejoin="round" />
          
          {/* Leaves - Mid Layer (Emerald Green) */}
          <path d="M16,41 C11,41 9,32 15,25 C11,17 19,9 27,13 C33,5 44,7 46,15 C54,13 54,23 48,28 C52,34 46,42 38,40 C34,44 20,44 16,41 Z" fill="#10B981" stroke="#111827" strokeWidth="3" strokeLinejoin="round" />
          
          {/* Leaves - Inner Highlights (Light Mint Green) */}
          <path d="M23,25 C21,20 29,13 36,17 C40,13 44,17 42,23 C46,24 44,31 38,29 C36,33 25,33 23,25 Z" fill="#34D399" />
          
          {/* Little Eco-friendly red/yellow fruits */}
          <circle cx="20" cy="22" r="3" fill="#EF4444" stroke="#111827" strokeWidth="1.2" />
          <circle cx="42" cy="27" r="3" fill="#EF4444" stroke="#111827" strokeWidth="1.2" />
          <circle cx="32" cy="34" r="2.5" fill="#FBBF24" stroke="#111827" strokeWidth="1.2" />
        </svg>
      </div>
    );
  };

  const renderHouseModel = (filterClass: string) => {
    return (
      <div className={`relative flex flex-col items-center group ${filterClass}`}>
        {/* House Ground Shadow */}
        <div className="w-16 h-3.5 bg-black/15 rounded-full blur-[1px] absolute bottom-[-2px] z-0" />
        
        <svg width="70" height="70" viewBox="0 0 70 70" className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)] relative z-10 transition-transform duration-200 group-hover:scale-105 active:scale-95">
          {/* Chimney */}
          <rect x="44" y="11" width="9" height="18" fill="#D1D5DB" stroke="#111827" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M42,11 L55,11" stroke="#111827" strokeWidth="3.5" strokeLinecap="round" />
          
          {/* Smoke plume */}
          <path d="M47,4 C46,1 50,0 51,2" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" fill="none" className="animate-pulse" />
          
          {/* Main House Wall Base */}
          <rect x="14" y="32" width="42" height="30" fill="#FEF3C7" stroke="#111827" strokeWidth="3.5" strokeLinejoin="round" />
          {/* Siding lines for wood details */}
          <line x1="14" y1="42" x2="56" y2="42" stroke="#D97706" strokeWidth="1.5" strokeDasharray="3,3" />
          <line x1="14" y1="52" x2="56" y2="52" stroke="#D97706" strokeWidth="1.5" strokeDasharray="3,3" />
          
          {/* Triangular Roof */}
          <polygon points="9,34 35,11 61,34" fill="#F87171" stroke="#111827" strokeWidth="3.5" strokeLinejoin="round" />
          <polygon points="15,30 35,15 55,30" fill="#EF4444" />
          
          {/* Attic Window */}
          <circle cx="35" cy="23" r="5" fill="#93C5FD" stroke="#111827" strokeWidth="2.5" />
          <line x1="35" y1="18" x2="35" y2="28" stroke="#111827" strokeWidth="1.5" />
          <line x1="30" y1="23" x2="40" y2="23" stroke="#111827" strokeWidth="1.5" />
          
          {/* Cozy Front Door */}
          <path d="M21,62 L21,45 C21,42 27,42 27,45 L27,62 Z" fill="#78350F" stroke="#111827" strokeWidth="2.8" />
          <circle cx="23" cy="54" r="1.2" fill="#FBBF24" />
          
          {/* Glowing window (eco energy style!) */}
          <rect x="38" y="43" width="11" height="11" fill="#FEF08A" stroke="#111827" strokeWidth="2.8" strokeLinejoin="round" />
          <line x1="43.5" y1="43" x2="43.5" y2="54" stroke="#111827" strokeWidth="1.5" />
          <line x1="38" y1="48.5" x2="49" y2="48.5" stroke="#111827" strokeWidth="1.5" />
          
          {/* Cute solar panel representing Eco Power */}
          <rect x="17" y="20" width="10" height="7" fill="#1E3A8A" stroke="#111827" strokeWidth="2.2" transform="rotate(-15, 17, 20)" />
          <line x1="20" y1="21" x2="25" y2="26" stroke="#3B82F6" strokeWidth="1" />
        </svg>
      </div>
    );
  };

  const renderFenceModel = (filterClass: string) => {
    return (
      <div className={`relative flex flex-col items-center group ${filterClass}`}>
        <div className="w-12 h-2 bg-black/15 rounded-full blur-[1px] absolute bottom-[-1px] z-0" />
        
        <svg width="50" height="36" viewBox="0 0 50 36" className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.12)] relative z-10 transition-transform duration-200 group-hover:scale-105">
          {/* Horizontal support bars */}
          <rect x="2" y="13" width="46" height="4" fill="#B45309" stroke="#111827" strokeWidth="2.5" />
          <rect x="2" y="24" width="46" height="4" fill="#B45309" stroke="#111827" strokeWidth="2.5" />
          
          {/* Wood pickets */}
          <polygon points="5,7 10,2 15,7 15,34 5,34" fill="#F5EBE6" stroke="#111827" strokeWidth="2.5" strokeLinejoin="round" />
          <polygon points="20,7 25,2 30,7 30,34 20,34" fill="#F5EBE6" stroke="#111827" strokeWidth="2.5" strokeLinejoin="round" />
          <polygon points="35,7 40,2 45,7 45,34 35,34" fill="#F5EBE6" stroke="#111827" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      </div>
    );
  };

  const renderMailboxModel = (filterClass: string) => {
    return (
      <div className={`relative flex flex-col items-center group ${filterClass}`}>
        <div className="w-8 h-2 bg-black/15 rounded-full blur-[1px] absolute bottom-[-1px] z-0" />
        <svg width="40" height="45" viewBox="0 0 45 50" className="drop-shadow-[0_3px_3px_rgba(0,0,0,0.15)] relative z-10 transition-transform duration-200 group-hover:scale-105">
          <rect x="20" y="25" width="5" height="23" fill="#78350F" stroke="#111827" strokeWidth="2.5" />
          <path d="M10,25 L35,25 L35,14 C35,7 30,7 22.5,7 C15,7 10,7 10,14 Z" fill="#EF4444" stroke="#111827" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M10,14 L35,14" stroke="#111827" strokeWidth="2" />
          <path d="M34,16 L34,10 L38,10 L38,13 L34,13" fill="#F59E0B" stroke="#111827" strokeWidth="1.5" strokeLinejoin="round" />
          <line x1="34" y1="16" x2="34" y2="20" stroke="#111827" strokeWidth="2" />
          <circle cx="14" cy="20" r="1.5" fill="#FBBF24" stroke="#111827" strokeWidth="1" />
        </svg>
      </div>
    );
  };

  const renderApartmentModel = (filterClass: string) => {
    return (
      <div className={`relative flex flex-col items-center group ${filterClass}`}>
        <div className="w-16 h-3 bg-black/15 rounded-full blur-[1px] absolute bottom-[-1px] z-0" />
        <svg width="60" height="70" viewBox="0 0 80 95" className="drop-shadow-[0_5px_5px_rgba(0,0,0,0.15)] relative z-10 transition-transform duration-200 group-hover:scale-105">
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
      </div>
    );
  };

  const renderSmallHouseModel = (filterClass: string) => {
    return (
      <div className={`relative flex flex-col items-center group ${filterClass}`}>
        <div className="w-12 h-2 bg-black/15 rounded-full blur-[1px] absolute bottom-[-1px] z-0" />
        <svg width="48" height="48" viewBox="0 0 55 55" className="drop-shadow-[0_3.5px_3.5px_rgba(0,0,0,0.15)] relative z-10 transition-transform duration-200 group-hover:scale-105">
          <rect x="10" y="24" width="35" height="26" fill="#FEE2E2" stroke="#111827" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="6,26 27.5,7 49,26" fill="#059669" stroke="#111827" strokeWidth="3" strokeLinejoin="round" />
          <rect x="16" y="36" width="10" height="14" fill="#B45309" stroke="#111827" strokeWidth="2" />
          <circle cx="34" cy="35" r="4.5" fill="#FEF08A" stroke="#111827" strokeWidth="2" />
        </svg>
      </div>
    );
  };

  const renderLargeHouseModel = (filterClass: string) => {
    return (
      <div className={`relative flex flex-col items-center group ${filterClass}`}>
        <div className="w-16 h-3 bg-black/15 rounded-full blur-[1px] absolute bottom-[-1px] z-0" />
        <svg width="65" height="60" viewBox="0 0 85 80" className="drop-shadow-[0_4.5px_4.5px_rgba(0,0,0,0.15)] relative z-10 transition-transform duration-200 group-hover:scale-105">
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
      </div>
    );
  };

  const renderPondModel = (filterClass: string) => {
    return (
      <div className={`relative flex flex-col items-center group ${filterClass}`}>
        <svg width="60" height="42" viewBox="0 0 70 45" className="drop-shadow-[0_2.5px_2.5px_rgba(0,0,0,0.12)] relative z-10 transition-transform duration-200 group-hover:scale-105">
          <ellipse cx="35" cy="22" rx="32" ry="18" fill="#D1D5DB" stroke="#111827" strokeWidth="3" />
          <ellipse cx="34" cy="22" rx="28" ry="14" fill="#2563EB" stroke="#111827" strokeWidth="2.5" />
          <ellipse cx="22" cy="20" rx="4" ry="2" fill="#059669" />
          <ellipse cx="44" cy="24" rx="5" ry="2.5" fill="#059669" />
        </svg>
      </div>
    );
  };

  const renderFountainModel = (filterClass: string) => {
    return (
      <div className={`relative flex flex-col items-center group ${filterClass}`}>
        <div className="w-14 h-2 bg-black/15 rounded-full blur-[1px] absolute bottom-[-1px] z-0" />
        <svg width="55" height="58" viewBox="0 0 55 60" className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)] relative z-10 transition-transform duration-200 group-hover:scale-105">
          <ellipse cx="27.5" cy="46" rx="22" ry="8" fill="#94A3B8" stroke="#111827" strokeWidth="3" />
          <ellipse cx="27.5" cy="44" rx="18" ry="5" fill="#38BDF8" />
          <rect x="24" y="22" width="7" height="24" fill="#64748B" stroke="#111827" strokeWidth="3" />
          <ellipse cx="27.5" cy="24" rx="12" ry="4.5" fill="#94A3B8" stroke="#111827" strokeWidth="2.5" />
          <ellipse cx="27.5" cy="23" rx="9" ry="2.5" fill="#38BDF8" />
        </svg>
      </div>
    );
  };

  const renderFlowerModel = (filterClass: string) => {
    return (
      <div className={`relative flex flex-col items-center group ${filterClass}`}>
        <svg width="40" height="35" viewBox="0 0 40 35" className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.12)] relative z-10 transition-transform duration-200 group-hover:scale-105">
          <ellipse cx="20" cy="28" rx="15" ry="4" fill="#78350F" opacity="0.4" />
          <path d="M10,26 L10,14" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="10" cy="12" r="4.5" fill="#EF4444" stroke="#111827" strokeWidth="1.5" />
          <circle cx="10" cy="12" r="1.5" fill="#FBBF24" />
          <path d="M20,28 L20,10" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="20" cy="8" r="5" fill="#FBBF24" stroke="#111827" strokeWidth="1.5" />
          <circle cx="20" cy="8" r="1.8" fill="#F97316" />
          <path d="M30,26 L30,16" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="30" cy="14" r="4" fill="#A855F7" stroke="#111827" strokeWidth="1.5" />
          <circle cx="30" cy="14" r="1.2" fill="#FBBF24" />
        </svg>
      </div>
    );
  };

  const renderGrassModel = (filterClass: string) => {
    return (
      <div className={`relative flex flex-col items-center group ${filterClass}`}>
        <svg width="35" height="25" viewBox="0 0 35 25" className="drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.1)] relative z-10 transition-transform duration-200 group-hover:scale-105">
          <path d="M10,22 L6,10 M10,22 L10,6 M10,22 L14,10" stroke="#10B981" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M24,22 L20,12 M24,22 L24,8 M24,22 L28,12" stroke="#059669" strokeWidth="3.2" strokeLinecap="round" />
        </svg>
      </div>
    );
  };

  const renderItemIcon = (item: DecorationItem) => {
    let filterClass = '';

    if (isDrought) {
      filterClass = 'saturate-50 sepia brightness-90';
    } else if (isFlood) {
      filterClass = 'brightness-75 contrast-125';
    }

    if (item.type === 'tree') return renderTreeModel(filterClass);
    if (item.type === 'house') return renderHouseModel(filterClass);
    if (item.type === 'fence') return renderFenceModel(filterClass);
    if (item.type === 'mailbox') return renderMailboxModel(filterClass);
    if (item.type === 'apartment') return renderApartmentModel(filterClass);
    if (item.type === 'small_house') return renderSmallHouseModel(filterClass);
    if (item.type === 'large_house') return renderLargeHouseModel(filterClass);
    if (item.type === 'pond') return renderPondModel(filterClass);
    if (item.type === 'fountain') return renderFountainModel(filterClass);
    if (item.type === 'flower') return renderFlowerModel(filterClass);
    if (item.type === 'grass') return renderGrassModel(filterClass);

    return null;
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-[#BAE6FD]/80 rounded-3xl border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">
      {/* 1. Header with Retro pixel elements */}
      <div className="bg-white border-b-[4px] border-black px-5 py-4 flex justify-between items-center z-20">
        {/* Point Display */}
        <div className="no-placement-click flex items-center space-x-2 bg-[#BBF7D0] border-[3.5px] border-black px-4 py-1.5 rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <Coins className="w-5 h-5 text-black fill-amber-300" strokeWidth={2.5} />
          <span className="font-game font-bold text-base text-slate-900">
            점수: {points.toLocaleString()} P
          </span>
        </div>

        {/* Climate Weather Indicator */}
        <div className="no-placement-click flex items-center space-x-2">
          <div className={`border-[3px] border-black px-3.5 py-1.5 rounded-xl font-game text-xs font-bold shadow-sm ${isSunny ? 'bg-emerald-300' : isCloudy ? 'bg-amber-300' : 'bg-red-400 animate-pulse'}`}>
            {isSunny ? '☀️ 맑음' : isCloudy ? '☁️ 흐림' : isDrought ? '🔥 가뭄' : '🌧️ 홍수'}
          </div>
        </div>
      </div>

      {/* 2. Interactive Map Playboard (Dedicated full screen gameplay) */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        className={`relative flex-1 min-h-[420px] md:min-h-[500px] ${bgGradient} transition-colors duration-1000 overflow-hidden cursor-crosshair`}
      >
        {/* Placement Mode Active Banner */}
        {selectedItemToPlace && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 bg-[#FEF08A] border-[3.5px] border-black px-5 py-2.5 rounded-2xl text-xs font-bold font-game flex items-center space-x-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce">
            <span className="text-black">
              👉 지도를 클릭해 [{
                selectedItemToPlace === 'tree' ? '나무' :
                selectedItemToPlace === 'house' ? '친환경 집' :
                selectedItemToPlace === 'fence' ? '울타리' :
                selectedItemToPlace === 'mailbox' ? '친환경 우체통' :
                selectedItemToPlace === 'apartment' ? '친환경 아파트' :
                selectedItemToPlace === 'small_house' ? '작은 주택' :
                selectedItemToPlace === 'large_house' ? '풍력&태양광 저택' :
                selectedItemToPlace === 'pond' ? '생태 연못' :
                selectedItemToPlace === 'fountain' ? '태양광 분수' :
                selectedItemToPlace === 'flower' ? '야생화 꽃밭' :
                selectedItemToPlace === 'grass' ? '천연 잔디밭' : '소품'
              }]를 세워보세요!
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancelPlacement();
              }}
              className="bg-rose-400 hover:bg-rose-500 text-black border-2 border-black px-2 py-0.5 rounded-lg font-bold transition cursor-pointer"
            >
              취소
            </button>
          </div>
        )}

        {/* Moving Mode Active Banner */}
        {movingItemId && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 bg-[#93C5FD] border-[3.5px] border-black px-5 py-2.5 rounded-2xl text-xs font-bold font-game flex items-center space-x-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce">
            <span className="text-black">
              🚚 [이동 모드] 지도의 빈 구역을 클릭해 새 위치를 정해 주세요!
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMovingItemId(null);
              }}
              className="bg-rose-400 hover:bg-rose-500 text-black border-2 border-black px-2 py-0.5 rounded-lg font-bold transition cursor-pointer"
            >
              취소
            </button>
          </div>
        )}

        {/* -------------------- CLIMATE TRANSITION SPECIAL ANIMATION OVERLAYS -------------------- */}
        
        {/* 1. SLIDING CLOUDS: Drought ➡️ Cloudy / Sunny ➡️ Cloudy */}
        {transitionPhase === 'animating' && (weatherTransition?.to === 'Cloudy' || (weatherTransition?.to === 'Drought' && weatherTransition?.from === 'Sunny')) && (
          <div className="absolute inset-x-0 top-0 h-48 overflow-hidden pointer-events-none z-30 flex justify-between">
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: '0%', opacity: 0.95 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
              className="w-[55%] h-full bg-[#334155] rounded-r-[60px] relative border-b-4 border-r-4 border-black"
            >
              {/* Internal decorative cloud bumps */}
              <div className="absolute w-28 h-28 bg-[#1e293b] rounded-full -top-6 -right-6 border-4 border-black" />
              <div className="absolute w-20 h-20 bg-[#475569] rounded-full bottom-2 right-12 border-2 border-black" />
            </motion.div>
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: '0%', opacity: 0.95 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
              className="w-[55%] h-full bg-[#334155] rounded-l-[60px] relative border-b-4 border-l-4 border-black"
            >
              <div className="absolute w-28 h-28 bg-[#1e293b] rounded-full -top-6 -left-6 border-4 border-black" />
              <div className="absolute w-20 h-20 bg-[#475569] rounded-full bottom-2 left-12 border-2 border-black" />
            </motion.div>
          </div>
        )}

        {/* 2. RAIN SHOWERS: Cloudy ➡️ Sunny / Drought ➡️ Sunny */}
        {transitionPhase === 'animating' && weatherTransition?.to === 'Sunny' && (weatherTransition?.from === 'Cloudy' || weatherTransition?.from === 'Drought') && (
          <div className="absolute inset-0 pointer-events-none z-30 bg-slate-900/15">
            {/* 40 dynamic falling raindrops */}
            {[...Array(40)].map((_, i) => {
              const left = (i * 2.5) + (Math.random() * 2);
              const duration = 0.5 + Math.random() * 0.4;
              const delay = Math.random() * 0.5;
              return (
                <motion.div
                  key={i}
                  initial={{ y: -60, opacity: 0 }}
                  animate={{ y: 550, opacity: [0, 1, 1, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: duration,
                    delay: delay,
                    ease: 'linear',
                  }}
                  style={{
                    position: 'absolute',
                    left: `${left}%`,
                    top: 0,
                    width: '2.5px',
                    height: '28px',
                    backgroundColor: '#38bdf8',
                    borderRadius: '2px',
                    border: '0.5px solid black',
                  }}
                />
              );
            })}
          </div>
        )}

        {/* 3. HEATWAVE GLOW: Cloudy ➡️ Drought / Sunny ➡️ Drought */}
        {transitionPhase === 'animating' && weatherTransition?.to === 'Drought' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.45, 0.2, 0.5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 bg-gradient-to-t from-orange-600/40 via-amber-500/20 to-red-500/10 pointer-events-none z-20"
          />
        )}

        {/* 4. RPG WEATHER CHANGE BANNER SCREEN OVERLAY */}
        <AnimatePresence>
          {transitionPhase !== 'none' && (
            <div className="absolute inset-0 bg-black/35 z-40 flex items-center justify-center p-6 pointer-events-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -50 }}
                transition={{ type: 'spring', damping: 20, stiffness: 120 }}
                className="bg-white border-[4px] border-black p-6 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center max-w-md w-full relative overflow-hidden"
              >
                {/* Visual Sun/Cloud decorative elements on popup */}
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-amber-200 border-4 border-black rounded-full opacity-20" />
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-blue-200 border-4 border-black rounded-full opacity-20" />

                <div className="flex flex-col items-center space-y-4 relative z-10">
                  <span className="bg-[#A78BFA] text-black border-2 border-black font-game font-black text-[10px] px-3.5 py-1 rounded-full uppercase tracking-widest animate-pulse">
                    🚨 에코 빌리지 기후 변화 감지 🚨
                  </span>
                  
                  <h4 className="font-game font-black text-lg text-slate-950 leading-snug">
                    마을 기후 시스템 대전환 중
                  </h4>

                  <p className="font-game font-bold text-slate-700 text-xs md:text-sm leading-relaxed px-2 bg-slate-50 border-2 border-dashed border-slate-200 py-3.5 rounded-2xl">
                    {transitionMsg}
                  </p>

                  {/* Tiny progress dots */}
                  <div className="flex items-center space-x-2.5 pt-1.5">
                    <div className="w-3 h-3 bg-red-400 border-[2px] border-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-3 h-3 bg-yellow-400 border-[2px] border-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-3 h-3 bg-emerald-400 border-[2px] border-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------------------------------------- */}

        {/* Clouds / Sparkles Overlay */}
        <div className="absolute top-3 inset-x-0 flex justify-between px-6 opacity-80 pointer-events-none select-none z-10">
          <div className="w-16 h-10 bg-white border-2 border-black rounded-full relative">
            <div className="absolute w-8 h-8 bg-white border-t-2 border-l-2 border-black rounded-full top-[-10px] left-3" />
            <div className="absolute w-10 h-10 bg-white border-t-2 border-r-2 border-black rounded-full top-[-14px] right-2" />
          </div>
          <div className="w-20 h-12 bg-white border-2 border-black rounded-full relative hidden sm:block">
            <div className="absolute w-10 h-10 bg-white border-t-2 border-l-2 border-black rounded-full top-[-12px] left-4" />
            <div className="absolute w-12 h-12 bg-white border-t-2 border-r-2 border-black rounded-full top-[-16px] right-3" />
          </div>
        </div>

        {/* Drought cracks visual */}
        {isDrought && (
          <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
            <svg className="absolute inset-0 w-full h-full text-amber-950/45" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,150 L120,180 L250,150 L380,210 L520,170 L640,240 L800,190" stroke="currentColor" strokeWidth="4.5" fill="none" />
              <path d="M50,380 L180,340 L340,410 L490,360 L620,420 L800,380" stroke="currentColor" strokeWidth="4.5" fill="none" />
              <path d="M220,50 L260,220 L210,390 L240,550" stroke="currentColor" strokeWidth="3" fill="none" />
              <path d="M580,20 L550,230 L590,410 L560,560" stroke="currentColor" strokeWidth="3" fill="none" />
            </svg>
          </div>
        )}

        {/* Flood storm overlay */}
        {isFlood && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute inset-0 opacity-40 bg-[linear-gradient(170deg,transparent_45%,#38bdf8_50%,transparent_55%)] [background-size:25px_120px] animate-[pulse_1s_infinite]">
              <svg className="w-full h-full text-sky-400" xmlns="http://www.w3.org/2000/svg">
                <line x1="20%" y1="0" x2="15%" y2="100%" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6,18" />
                <line x1="60%" y1="0" x2="55%" y2="100%" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6,18" />
                <line x1="85%" y1="0" x2="80%" y2="100%" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6,18" />
              </svg>
            </div>
            <div className="absolute bottom-0 inset-x-0 h-1/3 bg-blue-600/70 border-t-4 border-black animate-pulse flex items-center justify-center">
              <span className="text-white font-game font-bold text-sm tracking-widest bg-black/60 px-4 py-1.5 rounded-full">
                🚨 마을 수해 경고 상황!
              </span>
            </div>
          </div>
        )}

        {/* Circular central grass field for placing items */}
        <div className="absolute inset-x-8 bottom-4 top-14 flex items-center justify-center z-0">
          <div className={`w-11/12 h-[80%] rounded-[100px] border-[5px] border-dashed border-black/30 ${groundBg} flex items-center justify-center relative transition-colors duration-1000`}>
            {/* Inner Pathway boundary */}
            <div className="absolute inset-4 rounded-[85px] border-[3.5px] border-black/15 pointer-events-none" />
          </div>
        </div>

        {/* Placed Items Icons and Interaction Triggers */}
        <div className="absolute inset-0 z-10">
          {items.map((item) => (
            <div
              key={item.id}
              onMouseDown={(e) => handleDragStart(e, item)}
              onTouchStart={(e) => handleDragStart(e, item)}
              onClick={(e) => {
                e.stopPropagation();
                if (selectedItemToPlace || movingItemId) return;
                if (hasDragged.current) return;
                setSelectedItemId(selectedItemId === item.id ? null : item.id);
              }}
              style={{
                position: 'absolute',
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: 'translate(-50%, -85%)',
              }}
              className="pointer-events-auto cursor-pointer relative select-none"
            >
              {/* Selection Border Glow */}
              {selectedItemId === item.id && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-18 h-18 border-[3.5px] border-dashed border-amber-400 rounded-full animate-[spin_8s_linear_infinite] z-0" />
              )}

              {/* Render item graphic */}
              <div className="relative z-10">
                {renderItemIcon(item)}
              </div>

              {/* Floating Comic Control Popover on selection */}
              <AnimatePresence>
                {selectedItemId === item.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{
                      position: 'absolute',
                      top: '-15px',
                      left: '50%',
                      transform: 'translate(-50%, -100%)',
                    }}
                    className="z-50 bg-white border-[3.5px] border-black rounded-2xl p-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-2 whitespace-nowrap"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMovingItemId(item.id);
                        setSelectedItemId(null);
                      }}
                      className="bg-[#93C5FD] hover:bg-blue-400 border-2 border-black text-black px-2.5 py-1 rounded-lg text-[11px] font-game font-bold transition active:scale-95 cursor-pointer flex items-center space-x-1"
                    >
                      <span>🚚 이동</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(item.id);
                        setSelectedItemId(null);
                      }}
                      className="bg-[#FCA5A5] hover:bg-rose-400 border-2 border-black text-black px-2.5 py-1 rounded-lg text-[11px] font-game font-bold transition active:scale-95 cursor-pointer flex items-center space-x-1"
                    >
                      <span>❌ 회수</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItemId(null);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 border-2 border-black text-black w-6 h-6 flex items-center justify-center rounded-lg text-[11px] font-game font-bold transition active:scale-95 cursor-pointer"
                    >
                      <span>✕</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Wood Signpost displaying the 에코 빌리지 명칭 */}
        <div className="no-placement-click absolute bottom-24 right-10 z-20 flex flex-col items-center">
          {isRenaming ? (
            <div className="bg-white border-3 border-black p-2 rounded-xl shadow-md flex items-center space-x-1.5">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                maxLength={12}
                className="w-24 px-2 py-0.5 text-xs font-bold border-2 border-black rounded-lg focus:outline-none font-game"
              />
              <button
                onClick={submitRename}
                className="bg-emerald-400 text-black border-2 border-black text-[10px] px-2 py-0.5 rounded-lg font-bold font-game cursor-pointer"
              >
                확인
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsRenaming(true)}
              className="bg-[#FEF08A] hover:bg-[#FDE047] border-[3.5px] border-black px-4 py-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center space-x-1.5 transition active:scale-95"
            >
              <span className="font-game font-bold text-sm text-slate-900">
                🏡 {villageName}
              </span>
              <Edit2 className="w-3.5 h-3.5 text-slate-700" />
            </div>
          )}
          {/* Wood sign support stick */}
          <div className="w-3.5 h-10 bg-amber-800 border-x-[3.5px] border-b-[3.5px] border-black mt-[-2px]" />
        </div>
      </div>

      {/* 3. Daily News Bulletin Ticker Alert */}
      <div className={`no-placement-click border-t-[3.5px] border-black px-5 py-4 flex items-start space-x-3 transition-colors duration-1000 ${isSunny ? 'bg-[#ECFDF5]' : isCloudy ? 'bg-[#F8FAFC]' : 'bg-[#FFFBEB]'}`}>
        <div className="bg-white border-[2.5px] border-black p-1.5 rounded-xl shrink-0">
          {isSunny && <Sun className="w-5 h-5 text-emerald-600 animate-spin-slow" />}
          {isCloudy && <Cloud className="w-5 h-5 text-slate-600" />}
          {isDrought && <Flame className="w-5 h-5 text-amber-600 animate-pulse" />}
          {isFlood && <Droplets className="w-5 h-5 text-sky-600 animate-bounce" />}
        </div>
        <div className="flex-1 space-y-0.5">
          <p className="font-game font-bold text-[10px] text-slate-400 uppercase tracking-wide">기후 리포트 특보</p>
          <p className="text-xs leading-relaxed font-bold text-slate-800 font-game">
            {isDrought && '마을 대지가 쩍쩍 갈라져 가뭄이 심해지고 있습니다! 영수증을 분석해 에코 포인트를 쌓으세요! (현재 가뭄 상황 ⚠️)'}
            {isCloudy && '마을 하늘에 어둑어둑한 먹구름이 끼어있습니다. 친환경 실천으로 맑은 날씨로 정화할 수 있습니다! (현재 먹구름 상황 ☁️)'}
            {isSunny && '하늘이 무척 푸르고 맑은 완벽한 에코 빌리지 상태입니다! 숲을 계속 채워나가세요! (현재 맑은 날씨 ☀️)'}
          </p>
        </div>
      </div>

      {/* 4. Large Controller Dock Buttons */}
      <div className="no-placement-click bg-white border-t-[4px] border-black p-4 grid grid-cols-3 gap-3.5 z-20">
        <button
          onClick={onOpenShop}
          className="bg-[#FEF08A] hover:bg-yellow-300 text-black py-4 rounded-2xl font-game font-bold text-sm flex flex-col items-center justify-center space-y-1.5 comic-button cursor-pointer"
        >
          <span className="text-2xl">🏪</span>
          <span>에코 상점</span>
        </button>

        <button
          onClick={onOpenScan}
          className="bg-[#FCA5A5] hover:bg-red-400 text-black py-4 rounded-2xl font-game font-bold text-sm flex flex-col items-center justify-center space-y-1.5 comic-button cursor-pointer"
        >
          <span className="text-2xl">📸</span>
          <span>영수증 촬영</span>
        </button>

        <button
          onClick={onOpenDetail}
          className="bg-[#93C5FD] hover:bg-blue-400 text-black py-4 rounded-2xl font-game font-bold text-sm flex flex-col items-center justify-center space-y-1.5 comic-button cursor-pointer"
        >
          <span className="text-2xl">📊</span>
          <span>카테고리 점수</span>
        </button>
      </div>
    </div>
  );
};
