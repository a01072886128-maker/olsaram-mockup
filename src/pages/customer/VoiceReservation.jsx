/**
 * AI 음성 예약 페이지 (준비 중)
 */

import { Mic } from 'lucide-react';
import Navbar from '../../components/Navbar';
import ComingSoon from '../../components/ComingSoon';

const VoiceReservation = () => {
  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar userType="customer" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ComingSoon
          title="AI 음성 예약"
          description="말씀만 하시면 AI가 자동으로 예약을 완료해드립니다. 30초면 충분합니다!"
          icon={<Mic className="text-white" size={48} />}
        />
      </div>
    </div>
  );
};

export default VoiceReservation;
