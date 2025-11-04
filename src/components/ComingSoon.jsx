/**
 * ComingSoon 컴포넌트
 *
 * 아직 구현되지 않은 페이지를 위한 "준비 중" 화면
 *
 * @param {string} title - 페이지 제목
 * @param {string} description - 페이지 설명
 * @param {ReactNode} icon - 아이콘
 */

import { Link } from 'react-router-dom';
import { ArrowLeft, Wrench } from 'lucide-react';
import Button from './Button';

const ComingSoon = ({ title, description, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        {/* 아이콘 */}
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-green to-primary-purple rounded-2xl flex items-center justify-center">
          {icon || <Wrench className="text-white" size={48} />}
        </div>

        {/* 제목 */}
        <h1 className="text-3xl font-bold text-text-primary mb-4">
          {title || '준비 중입니다'}
        </h1>

        {/* 설명 */}
        <p className="text-lg text-text-secondary mb-8 leading-relaxed">
          {description || '이 기능은 현재 개발 중입니다. 곧 만나보실 수 있습니다!'}
        </p>

        {/* Phase 안내 */}
        <div className="bg-gradient-to-r from-light-green to-light-purple bg-opacity-10 rounded-lg p-4 mb-8">
          <p className="text-sm text-text-secondary">
            <span className="font-semibold text-primary-purple">Phase 2</span>에서 구현 예정입니다
          </p>
        </div>

        {/* 돌아가기 버튼 */}
        <Link to="/">
          <Button variant="primary">
            <ArrowLeft className="mr-2" size={18} />
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;
