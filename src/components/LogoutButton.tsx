import React from 'react';

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      // 1) 브라우저 로컬 저장소 비우기
      localStorage.removeItem('user_game_points');
      localStorage.removeItem('game_progress_history');
      sessionStorage.clear();

      // 2) 백엔드에 로그아웃 API 요청 (credentials 필수!)
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
      });

      // 3) 로그아웃 완료 후 메인 페이지('/')로 이동하여 화면 갱신
      window.location.href = '/';
    } catch (error) {
      console.error('클라이언트 로그아웃 에러:', error);
      window.location.href = '/';
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`
        px-5 py-3 bg-rose-500 hover:bg-rose-600 active:scale-95 
        text-white font-extrabold text-sm rounded-2xl 
        shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black 
        transition-all cursor-pointer flex items-center space-x-2
      `}
    >
      <span>🔴 안전하게 로그아웃</span>
    </button>
  );
}
