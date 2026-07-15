import React from 'react';

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      // 1) 로컬 저장소 비우기
      localStorage.removeItem('user_game_points');
      localStorage.removeItem('game_progress_history');
      sessionStorage.clear();

      // 2) 백엔드에 로그아웃 요청 (credentials 옵션 추가!)
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 👈 로컬 환경에서 쿠키를 안전하게 지우기 위해 필수입니다!
      });

      // 3) 로그인 페이지로 이동
      window.location.href = '/login';
    } catch (error) {
      console.error('클라이언트 로그아웃 에러:', error);
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
