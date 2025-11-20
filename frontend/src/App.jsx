/**
 * App.jsx - 메인 애플리케이션 컴포넌트
 *
 * React Router를 사용한 라우팅 설정
 * 모든 페이지 경로를 정의하고 렌더링
 */

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";

// 페이지 컴포넌트 import
import Landing from "./pages/Landing";
import OwnerLogin from "./pages/auth/OwnerLogin";
import CustomerLogin from "./pages/auth/CustomerLogin";
import Register from "./pages/auth/Register";

// 사장님 페이지
import OwnerDashboard from "./pages/owner/Dashboard";
import FraudDetection from "./pages/owner/FraudDetection";
import Reservations from "./pages/owner/Reservations";
import MenuOCR from "./pages/owner/MenuOCR";
import Community from "./pages/owner/Community";
import RegisterBusiness from "./pages/owner/RegisterBusiness";
import OwnerMyPage from "./pages/owner/MyPage.jsx";

// 관리자 페이지
import AdminFraudDetection from "./pages/admin/FraudDetection";
import AdminZeroDeposit from "./pages/admin/ZeroDeposit";
import AdminMenuOCR from "./pages/admin/MenuOCR";

// 고객 페이지
import CustomerSearch from "./pages/customer/Search";
import VoiceReservation from "./pages/customer/VoiceReservation";
import GroupReservation from "./pages/customer/GroupReservation";
import CustomerMyPage from "./pages/customer/MyPage.jsx";
import NearbyStores from "./pages/customer/NearbyStores";
import CustomerCommunity from "./pages/customer/Community.jsx";

// ⭐⭐⭐ NEW: 가게 상세 페이지 + 예약 입력 페이지 ⭐⭐⭐
import StoreDetail from "./pages/customer/StoreDetail";
import StoreReserve from "./pages/customer/StoreReserve"; // ⭐ 추가됨

function RequireOwnerAuth({ children }) {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-text-secondary">
        인증 정보를 확인하고 있습니다...
      </div>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function RequireCustomerAuth({ children }) {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-text-secondary">
        인증 정보를 확인하고 있습니다...
      </div>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to="/auth/customer-login" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* 랜딩 페이지 */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth/login" element={<OwnerLogin />} />
        <Route path="/auth/customer-login" element={<CustomerLogin />} />
        <Route path="/auth/register" element={<Register />} />

        {/* 사장님 페이지 */}
        <Route
          path="/owner/dashboard"
          element={
            <RequireOwnerAuth>
              <OwnerDashboard />
            </RequireOwnerAuth>
          }
        />
        <Route
          path="/owner/fraud-detection"
          element={
            <RequireOwnerAuth>
              <FraudDetection />
            </RequireOwnerAuth>
          }
        />
        <Route
          path="/owner/reservations"
          element={
            <RequireOwnerAuth>
              <Reservations />
            </RequireOwnerAuth>
          }
        />
        <Route
          path="/owner/menu-ocr"
          element={
            <RequireOwnerAuth>
              <MenuOCR />
            </RequireOwnerAuth>
          }
        />
        <Route
          path="/owner/community"
          element={
            <RequireOwnerAuth>
              <Community />
            </RequireOwnerAuth>
          }
        />
        <Route
          path="/owner/register-business"
          element={
            <RequireOwnerAuth>
              <RegisterBusiness />
            </RequireOwnerAuth>
          }
        />
        <Route
          path="/owner/my-page"
          element={
            <RequireOwnerAuth>
              <OwnerMyPage />
            </RequireOwnerAuth>
          }
        />

        {/* 관리자 페이지 */}
        <Route
          path="/admin/fraud-detection"
          element={<AdminFraudDetection />}
        />
        <Route path="/admin/zero-deposit" element={<AdminZeroDeposit />} />
        <Route path="/admin/menu-ocr" element={<AdminMenuOCR />} />

        {/* 고객 페이지 */}
        <Route
          path="/customer/search"
          element={
            <RequireCustomerAuth>
              <CustomerSearch />
            </RequireCustomerAuth>
          }
        />
        <Route
          path="/customer/nearby"
          element={
            <RequireCustomerAuth>
              <NearbyStores />
            </RequireCustomerAuth>
          }
        />
        <Route
          path="/customer/voice-reservation"
          element={
            <RequireCustomerAuth>
              <VoiceReservation />
            </RequireCustomerAuth>
          }
        />
        <Route
          path="/customer/group-reservation"
          element={
            <RequireCustomerAuth>
              <GroupReservation />
            </RequireCustomerAuth>
          }
        />
        <Route
          path="/customer/my-page"
          element={
            <RequireCustomerAuth>
              <CustomerMyPage />
            </RequireCustomerAuth>
          }
        />
        <Route
          path="/customer/community"
          element={
            <RequireCustomerAuth>
              <CustomerCommunity />
            </RequireCustomerAuth>
          }
        />

        {/* ⭐⭐⭐ NEW: 고객 가게 상세 페이지 ⭐⭐⭐ */}
        <Route
          path="/customer/store/:storeId"
          element={
            <RequireCustomerAuth>
              <StoreDetail />
            </RequireCustomerAuth>
          }
        />

        {/* ⭐⭐⭐ NEW: 고객 예약 입력 페이지 ⭐⭐⭐ */}
        <Route
          path="/customer/store/:storeId/reserve"
          element={
            <RequireCustomerAuth>
              <StoreReserve />
            </RequireCustomerAuth>
          }
        />

        {/* 404 페이지 */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </Router>
  );
}

export default App;
