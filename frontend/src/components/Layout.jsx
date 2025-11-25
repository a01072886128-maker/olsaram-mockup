import Navbar from "./Navbar";

/**
 * 통일된 페이지 레이아웃: 좌우 패딩, 최대 폭, 배경, 공통 Navbar
 */
export function PageLayout({ children, userType, hideNavbar = false, className = "" }) {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      {!hideNavbar && <Navbar userType={userType} />}
      <div className={`mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-10 py-10 ${className}`}>
        {children}
      </div>
    </div>
  );
}

export default PageLayout;
