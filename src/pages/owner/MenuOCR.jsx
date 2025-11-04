/**
 * 메뉴 OCR 관리 페이지 (준비 중)
 */

import { Camera } from 'lucide-react';
import Navbar from '../../components/Navbar';
import ComingSoon from '../../components/ComingSoon';

const MenuOCR = () => {
  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar userType="owner" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ComingSoon
          title="메뉴판 자동 등록"
          description="메뉴판 사진만 찍으면 AI가 자동으로 메뉴와 가격을 인식하여 등록해드립니다."
          icon={<Camera className="text-white" size={48} />}
        />
      </div>
    </div>
  );
};

export default MenuOCR;
