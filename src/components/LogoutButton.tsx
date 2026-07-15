import React from 'react';

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      // 1) 브라우저에 임시 저장된 게임 포인트 및 히스토리 완전 삭제
      localStorage.removeItem('user_game_points');
      localStorage.removeItem('game_progress_history');
      sessionStorage.clear();

      // 2) 백엔드(Express) 서버에 로그아웃 요청하기 (api/server.ts에 추가한 API 호출)
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // 3) 로그아웃 완료 후 로그인 페이지로 강제 이동 및 화면 초기화
      window.location.href = '/login';
    } catch (error) {
      console.error('클라이언트 로그아웃 처리 중 에러:', error);
      // 혹시나 에러가 나더라도 안전하게 로그인 화면으로 이동시킵니다.
      window.location.href = '/login';
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-5 py-3 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black transition-all cursor-pointer flex items-center space-x-2"
    >
      <span>🔴 안전하게 로그아웃</span>
    </button>
  );
}
