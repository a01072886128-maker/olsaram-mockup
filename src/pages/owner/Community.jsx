/**
 * 소상공인 커뮤니티 페이지 (준비 중)
 */

import { MessageSquare } from 'lucide-react';
import Navbar from '../../components/Navbar';
import ComingSoon from '../../components/ComingSoon';

const Community = () => {
  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar userType="owner" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ComingSoon
          title="소상공인 커뮤니티"
          description="다른 사장님들과 노쇼 정보를 공유하고, 운영 노하우를 나눌 수 있는 공간입니다."
          icon={<MessageSquare className="text-white" size={48} />}
        />
      </div>
    </div>
  );
};

export default Community;
