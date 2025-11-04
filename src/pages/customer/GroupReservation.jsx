/**
 * 공유 예약 페이지 (준비 중)
 */

import { Users } from 'lucide-react';
import Navbar from '../../components/Navbar';
import ComingSoon from '../../components/ComingSoon';

const GroupReservation = () => {
  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar userType="customer" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ComingSoon
          title="공유 예약"
          description="친구들과 함께 예약하고 각자 메뉴를 선택할 수 있습니다. 링크만 공유하면 끝!"
          icon={<Users className="text-white" size={48} />}
        />
      </div>
    </div>
  );
};

export default GroupReservation;
