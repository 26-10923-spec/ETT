import React from 'react';
import { X, User, RotateCcw, LogOut, Award, ClipboardList, Settings, Trees } from 'lucide-react';
import LogoutButton from './LogoutButton';

interface SettingsScreenProps {
  userId: string;
  villageName: string;
  receiptCount: number;
  points: number;
  placedItemsCount: number;
  onResetVillage: () => void;
  onLogout: () => void;
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userId,
  villageName,
  receiptCount,
  points,
  placedItemsCount,
  onResetVillage,
  onLogout,
  onClose,
}) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto bg-white border-[4px] border-black rounded-[2rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      {/* Header Area */}
      <div className="bg-[#A78BFA] border-b-[4px] border-black px-6 py-5 flex justify-between items-center">
        <div className="flex items-center space-x-2.5">
          <Settings className="w-6 h-6 text-black animate-[spin_8s_linear_infinite]" strokeWidth={2.5} />
          <h3 className="font-game font-black text-lg text-slate-900">
            마을 환경 설정 (Settings)
          </h3>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white border-[2.5px] border-black hover:bg-violet-100 flex items-center justify-center font-bold text-slate-800 shadow-sm transition active:scale-95 cursor-pointer"
        >
          <X className="w-5 h-5" strokeWidth={3} />
        </button>
      </div>

      {/* Settings Options Content */}
      <div className="p-6 space-y-6 font-game">
        
        {/* User Card */}
        <div className="bg-slate-50 border-[3.5px] border-black p-5 rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-5">
          <div className="w-16 h-16 bg-[#C4B5FD] border-[3px] border-black rounded-full flex items-center justify-center shadow-inner relative overflow-hidden">
            <User className="w-10 h-10 text-black mt-2" strokeWidth={2.5} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-lg font-black text-slate-900 flex items-center justify-center md:justify-start space-x-1.5">
              <span>🏡</span>
              <span>{villageName}</span>
            </h4>
            <p className="text-xs font-bold text-slate-500 mt-1">
              에코 빌리저 계정: <span className="text-black bg-[#E9D5FF] px-1.5 py-0.5 rounded border border-black">{userId}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start text-[11px] font-extrabold text-slate-600">
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>에코 히어로 등급</span>
              </span>
              <span className="bg-violet-100 text-violet-800 border border-violet-300 px-2.5 py-1 rounded-full flex items-center space-x-1">
                <Trees className="w-3.5 h-3.5 text-violet-600" />
                <span>설치된 소품: {placedItemsCount}개</span>
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#ECFDF5] border-[3px] border-black rounded-2xl p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-300 border-2 border-black flex items-center justify-center shrink-0">
              <ClipboardList className="w-6 h-6 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase">영수증 스캔 횟수</p>
              <p className="text-lg font-black text-emerald-700">{receiptCount}회 완료</p>
            </div>
          </div>

          <div className="bg-[#FEF08A] border-[3px] border-black rounded-2xl p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-yellow-300 border-2 border-black flex items-center justify-center shrink-0">
              <span className="text-xl">🪙</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase">현재 보유 포인트</p>
              <p className="text-lg font-black text-amber-700">{points.toLocaleString()} P</p>
            </div>
          </div>
        </div>

        {/* Action Center Title */}
        <div className="border-t-2 border-dashed border-slate-200 pt-4">
          <h5 className="font-black text-xs text-slate-500 uppercase tracking-widest mb-3">🛠️ 시스템 관리</h5>
          
          <div className="space-y-3">
            {/* Reset Button */}
            <button
              onClick={onResetVillage}
              className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 border-[3px] border-black rounded-2xl p-4 font-black text-sm flex items-center justify-between shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              <div className="flex items-center space-x-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-amber-200 border-2 border-black flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5 text-black" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 text-xs">마을 및 포인트 초기화</p>
                  <p className="text-[10px] text-slate-500">배치된 가구 및 나무를 회수하고 포인트를 2,000P로 재설정합니다.</p>
                </div>
              </div>
              <span className="text-xs bg-amber-200 border border-black px-2 py-0.5 rounded font-extrabold text-black">실행</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="w-full bg-rose-50 hover:bg-rose-100 text-rose-900 border-[3px] border-black rounded-2xl p-4 font-black text-sm flex items-center justify-between shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              <div className="flex items-center space-x-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-rose-200 border-2 border-black flex items-center justify-center shrink-0">
                  <LogOut className="w-5 h-5 text-black" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 text-xs">안전 로그아웃</p>
                  <p className="text-[10px] text-slate-500">로그인 세션을 안전하게 종료하고 첫 온보딩 화면으로 돌아갑니다.</p>
                </div>
              </div>
              <span className="text-xs bg-rose-200 border border-black px-2 py-0.5 rounded font-extrabold text-black">종료</span>
            </button>
          </div>
        </div>

        {/* Closing Notice */}
        <div className="text-center text-[10px] text-slate-400 pt-2 font-bold leading-relaxed">
          ♻️ ECO TOWN v1.2.5 — 대구화원고등학교 에코 타운 기후 살리기 프로젝트 <br />
          소중한 영수증 스캔 데이터는 로컬 브라우저에 안전하게 보관되어 있습니다.
        </div>
      </div>
    </div>
  );
};
<div className="mt-4 flex justify-center">
  <LogoutButton />
</div>
