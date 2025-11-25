/**
 * Navbar 컴포넌트
 *
 * 전체 애플리케이션의 네비게이션 바
 * 로고, 메뉴, CTA 버튼 포함
 *
 * @param {string} userType - 사용자 타입 (owner, customer, null)
 */

import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const Navbar = ({ userType = null }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
    setMobileMenuOpen(false);
  };

  // 현재 경로가 활성화된 메뉴인지 확인
  const isActive = (path) => location.pathname === path;

  console.log("### DEBUG userType =", userType);

  return (
    <nav className="bg-white border-b border-border-color sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-green to-primary-purple rounded-lg flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-green to-primary-purple bg-clip-text text-transparent">
              올사람
            </span>
          </Link>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex items-center space-x-8">
            {userType === "owner" && (
              <>
                <Link
                  to="/owner/dashboard"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive("/owner/dashboard")
                      ? "text-primary-green font-semibold"
                      : "text-text-secondary hover:text-primary-green"
                  }`}
                >
                  대시보드
                </Link>
                <Link
                  to="/owner/my-businesses"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive("/owner/my-businesses")
                      ? "text-primary-green font-semibold"
                      : "text-text-secondary hover:text-primary-green"
                  }`}
                >
                  내 가게
                </Link>
                <Link
                  to="/owner/reservations"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive("/owner/reservations")
                      ? "text-primary-green font-semibold"
                      : "text-text-secondary hover:text-primary-green"
                  }`}
                >
                  예약 관리
                </Link>
                <Link
                  to="/owner/menu-ocr"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive("/owner/menu-ocr")
                      ? "text-primary-green font-semibold"
                      : "text-text-secondary hover:text-primary-green"
                  }`}
                >
                  메뉴 관리
                </Link>
                <Link
                  to="/owner/community"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive("/owner/community")
                      ? "text-primary-green font-semibold"
                      : "text-text-secondary hover:text-primary-green"
                  }`}
                >
                  커뮤니티
                </Link>
                <Link
                  to="/owner/my-page"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive("/owner/my-page")
                      ? "text-primary-green font-semibold"
                      : "text-text-secondary hover:text-primary-green"
                  }`}
                >
                  마이페이지
                </Link>
                <Link
                  to="/owner/register-business"
                  className="px-4 py-2 bg-primary-green text-white font-semibold rounded-lg hover:bg-dark-green transition-colors"
                >
                  가게 등록하기
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-text-secondary hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut size={20} />
                  <span>로그아웃</span>
                </button>
              </>
            )}

            {userType === "customer" && (
              <>
                <Link
                  to="/customer/nearby"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive("/customer/nearby")
                      ? "text-primary-green font-semibold"
                      : "text-text-secondary hover:text-primary-green"
                  }`}
                >
                  <Home size={20} />
                  <span>내 주변 맛집</span>
                </Link>


                <Link
                  to="/customer/community"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive("/customer/community")
                      ? "text-primary-green font-semibold"
                      : "text-text-secondary hover:text-primary-green"
                  }`}
                >
                  게시판
                </Link>

                <Link
                  to="/customer/my-page"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive("/customer/my-page")
                      ? "text-primary-green font-semibold"
                      : "text-text-secondary hover:text-primary-green"
                  }`}
                >
                  마이페이지
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-text-secondary hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut size={20} />
                  <span>로그아웃</span>
                </button>
              </>
            )}

            {!userType && (
              <div className="flex items-center space-x-4">
                <Link
                  to="/auth/login"
                  className="px-4 py-2 text-primary-green font-semibold hover:bg-light-green hover:bg-opacity-10 rounded-lg transition-colors"
                >
                  사장님 로그인
                </Link>
                <Link
                  to="/customer/search"
                  className="px-4 py-2 bg-primary-green text-white font-semibold rounded-lg hover:bg-dark-green transition-colors shadow-sm"
                >
                  고객 시작하기
                </Link>
              </div>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border-color">
            {userType === "owner" && (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/owner/dashboard"
                  className="px-4 py-2 rounded-lg text-text-secondary hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  대시보드
                </Link>
                <Link
                  to="/owner/fraud-detection"
                  className="px-4 py-2 rounded-lg text-text-secondary hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  AI 사기탐지
                </Link>
                <Link
                  to="/owner/reservations"
                  className="px-4 py-2 rounded-lg text-text-secondary hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  예약관리
                </Link>
                <Link
                  to="/owner/my-page"
                  className="px-4 py-2 rounded-lg text-text-secondary hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  마이페이지
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-text-secondary hover:bg-red-50 hover:text-red-600 w-full text-left"
                >
                  <LogOut size={20} />
                  <span>로그아웃</span>
                </button>
              </div>
            )}

            {userType === "customer" && (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/customer/nearby"
                  className="px-4 py-2 rounded-lg text-text-secondary hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  내 주변 맛집
                </Link>
                <Link
                  to="/customer/community"
                  className="px-4 py-2 rounded-lg text-text-secondary hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  게시판
                </Link>

                <Link
                  to="/customer/my-page"
                  className="px-4 py-2 rounded-lg text-text-secondary hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  마이페이지
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-text-secondary hover:bg-red-50 hover:text-red-600 w-full text-left"
                >
                  <LogOut size={20} />
                  <span>로그아웃</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
