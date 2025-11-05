/**
 * App.jsx - 메인 애플리케이션 컴포넌트
 *
 * React Router를 사용한 라우팅 설정
 * 모든 페이지 경로를 정의하고 렌더링
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 페이지 컴포넌트 import
import Landing from './pages/Landing';

// 사장님 페이지
import OwnerDashboard from './pages/owner/Dashboard';
import FraudDetection from './pages/owner/FraudDetection';
import Reservations from './pages/owner/Reservations';
import MenuOCR from './pages/owner/MenuOCR';
import Community from './pages/owner/Community';

// 관리자 페이지
import AdminFraudDetection from './pages/admin/FraudDetection';
import AdminZeroDeposit from './pages/admin/ZeroDeposit';
import AdminMenuOCR from './pages/admin/MenuOCR';

// 고객 페이지
import CustomerSearch from './pages/customer/Search';
import VoiceReservation from './pages/customer/VoiceReservation';
import GroupReservation from './pages/customer/GroupReservation';
import CustomerMyPage from './pages/customer/MyPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* 랜딩 페이지 */}
        <Route path="/" element={<Landing />} />

        {/* 사장님 페이지 */}
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/fraud-detection" element={<FraudDetection />} />
        <Route path="/owner/reservations" element={<Reservations />} />
        <Route path="/owner/menu-ocr" element={<MenuOCR />} />
        <Route path="/owner/community" element={<Community />} />

        {/* 관리자 페이지 */}
        <Route path="/admin/fraud-detection" element={<AdminFraudDetection />} />
        <Route path="/admin/zero-deposit" element={<AdminZeroDeposit />} />
        <Route path="/admin/menu-ocr" element={<AdminMenuOCR />} />

        {/* 고객 페이지 */}
        <Route path="/customer/search" element={<CustomerSearch />} />
        <Route path="/customer/voice-reservation" element={<VoiceReservation />} />
        <Route path="/customer/group-reservation" element={<GroupReservation />} />
        <Route path="/customer/mypage" element={<CustomerMyPage />} />

        {/* 404 페이지 (없을 경우 랜딩으로 리다이렉트) */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </Router>
  );
}

export default App;
