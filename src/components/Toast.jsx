/**
 * Toast 알림 컴포넌트
 *
 * 화면 상단에 표시되는 알림 메시지
 *
 * @param {boolean} show - 표시 여부
 * @param {string} message - 알림 메시지
 * @param {string} type - 알림 타입 (success, error, info)
 * @param {function} onClose - 닫기 함수
 */

import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

const Toast = ({ show, message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const typeStyles = {
    success: {
      bg: 'bg-primary-green',
      icon: <CheckCircle size={20} />,
    },
    error: {
      bg: 'bg-red-500',
      icon: <XCircle size={20} />,
    },
    info: {
      bg: 'bg-primary-purple',
      icon: <Info size={20} />,
    },
  };

  const { bg, icon } = typeStyles[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bg} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}>
        {icon}
        <span className="flex-1 font-medium">{message}</span>
        <button
          onClick={onClose}
          className="hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
