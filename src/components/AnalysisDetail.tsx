import React from 'react';
import { Calendar, Store, CreditCard, Sparkles, Check, X, Coins, Layers } from 'lucide-react';
import { ReceiptAnalysisResult } from '../types';

interface AnalysisDetailProps {
  result: ReceiptAnalysisResult;
  onClose: () => void;
}

export const AnalysisDetail: React.FC<AnalysisDetailProps> = ({ result, onClose }) => {
  const { metadata, analyzed_items, scoring, recommendations } = result;

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Red':
        return {
          bg: 'bg-red-100 text-black border-red-400',
          badge: 'bg-red-400 text-black border-2 border-black',
          desc: '초고배출 육류 및 기호 식품 (메탄가스 대량 발생)',
        };
      case 'Yellow':
        return {
          bg: 'bg-amber-100 text-black border-amber-400',
          badge: 'bg-amber-400 text-black border-2 border-black',
          desc: '중간배출 가공류 / 수입 원료 혼합 식품',
        };
      case 'Green':
        return {
          bg: 'bg-emerald-100 text-black border-emerald-400',
          badge: 'bg-emerald-400 text-black border-2 border-black',
          desc: '저배출 청정 친환경 로컬푸드 작물',
        };
      default:
        return {
          bg: 'bg-slate-100 text-black border-slate-300',
          badge: 'bg-slate-300 text-black border-2 border-black',
          desc: '일반 소모품 또는 가공 규격 외 자재',
        };
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto bg-white border-[4px] border-black rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      {/* 1. Playful Comic Header */}
      <div className="bg-[#93C5FD] border-b-[4px] border-black px-5 py-4.5 flex justify-between items-center">
        <div className="flex items-center space-x-2.5">
          <span className="text-xl">📊</span>
          <h3 className="font-game font-bold text-lg text-slate-900">영수증 탄소 분석 & 카테고리별 통계</h3>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white border-[2.5px] border-black hover:bg-rose-100 flex items-center justify-center font-bold text-slate-800 shadow-sm transition active:scale-95 cursor-pointer"
        >
          <X className="w-4.5 h-4.5" strokeWidth={3} />
        </button>
      </div>

      {/* 2. Interactive Analysis Boards */}
      <div className="p-6 space-y-5 max-h-[460px] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          {/* Circular Score display bubble */}
          <div className="border-[3px] border-black bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] font-black text-slate-400 font-game uppercase tracking-wider mb-2">
              탄소 복원 지수
            </span>
            
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="#e2e8f0" strokeWidth="6" fill="transparent" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="#111827"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 * (1 - Math.min(100, Math.max(0, scoring.final_score)) / 100)}
                />
              </svg>
              <div className="flex flex-col items-center justify-center">
                <span className="text-2xl font-black font-game text-slate-900">
                  {scoring.final_score}
                </span>
                <span className="text-[9px] text-slate-400 font-bold">/100점</span>
              </div>
            </div>

            <div className="mt-2.5 text-[11px] font-game font-bold">
              {scoring.final_score >= 80 ? '🌳 울창한 녹색림' : scoring.final_score >= 40 ? '☁️ 대기 위기 경고' : '⚠️ 기후 재해 발생'}
            </div>
          </div>

          {/* Eco point dynamic card */}
          <div className="border-[3px] border-black bg-[#FEF08A] rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] font-black text-slate-500 font-game uppercase tracking-wider mb-2">
              영수증 포인트 보상
            </span>
            
            <div className="w-12 h-12 bg-white border-[2.5px] border-black rounded-full flex items-center justify-center shadow-inner mb-2">
              <Coins className="w-6 h-6 text-black fill-amber-300 animate-bounce" />
            </div>

            <div className="font-game">
              <p className="text-xl font-black text-slate-900">
                {scoring.points_earned_or_lost > 0 ? `+${scoring.points_earned_or_lost}` : scoring.points_earned_or_lost} P
              </p>
              <p className="text-[9px] text-slate-500 font-bold mt-1 leading-tight">
                Green +300~500P / Yellow -200P / Red -300~500P
              </p>
            </div>
          </div>
        </div>

        {/* Store Stamp metadata panel */}
        <div className="border-[3px] border-black bg-[#FFFBEB] p-4.5 rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-2.5 font-game text-xs text-slate-800">
          <p className="font-bold text-[10px] text-slate-400 tracking-wider">🧾 가맹 영수증 정보</p>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">가맹점:</span>
              <span className="font-black text-slate-900">{metadata.store_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">거래 일시:</span>
              <span className="font-mono text-slate-900 font-bold">{metadata.transaction_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">승인 번호:</span>
              <span className="bg-slate-200 border border-black px-1.5 py-0.2 rounded font-mono font-bold text-[10px]">
                {metadata.approval_number}
              </span>
            </div>
          </div>
        </div>

        {/* Categorized detailed items logs */}
        <div className="space-y-3">
          <h4 className="font-game font-bold text-sm text-slate-800 flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-blue-500" />
            <span>기후 품목별 판독 등급</span>
          </h4>

          {analyzed_items.length === 0 ? (
            <div className="text-center py-6 border-[2.5px] border-dashed border-black/35 rounded-2xl text-xs font-game text-slate-400">
              분석된 품목이 아직 없습니다. 영수증을 제출해 주세요!
            </div>
          ) : (
            <div className="space-y-2.5">
              {analyzed_items.map((item, index) => {
                const styles = getCategoryStyles(item.category);
                return (
                  <div
                    key={index}
                    className={`border-[2.5px] border-black rounded-xl p-3 flex items-center justify-between shadow-sm font-game ${styles.bg}`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-sm text-slate-900">{item.name}</span>
                        <span className={`text-[8.5px] font-black px-1.5 py-0.2 rounded ${styles.badge}`}>
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 leading-tight">{styles.desc}</p>
                    </div>

                    <div className="font-game font-bold text-xs shrink-0 flex items-center space-x-1">
                      <span className={item.score_impact > 0 ? 'text-emerald-700' : 'text-rose-600'}>
                        {item.score_impact > 0 ? `+${item.score_impact}` : item.score_impact}점
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Green Suggestion list */}
        {recommendations.length > 0 && (
          <div className="border-[3px] border-black bg-emerald-50 text-emerald-950 rounded-2xl p-4.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-2.5">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4.5 h-4.5 text-emerald-600 fill-emerald-100 animate-pulse" />
              <h4 className="font-game font-bold text-sm text-emerald-900">AI 기후 수호 제안</h4>
            </div>

            <div className="space-y-2 font-game">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="text-emerald-600 font-black mt-0.5">✓</span>
                  <p className="text-[11.5px] text-emerald-900/90 leading-relaxed font-bold">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
