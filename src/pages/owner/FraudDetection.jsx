/**
 * AI 노쇼 사기 의심 탐지 페이지
 *
 * 실시간으로 의심 예약을 감지하고 관리
 * - 위험도별 알림
 * - 상세 정보 모달
 * - 블랙리스트 관리
 */

import { useState } from 'react';
import { Shield, AlertTriangle, Ban, Eye, UserX, Activity } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

const FraudDetection = () => {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // 더미 데이터
  const mockFraudAlerts = [
    {
      id: 1,
      phone: "010-****-5678",
      riskLevel: "high",
      riskScore: 87,
      reasons: [
        "동시 다발 예약 (5곳)",
        "신규 가입 후 즉시 예약 (가입 10분 전)",
        "사칭 의심 키워드 (\"소방관\", \"공공기관\" 언급)",
        "고액 단체 예약 (15만원 이상)"
      ],
      reservation: {
        date: "11월 10일",
        time: "오후 7시",
        partySize: 12,
        estimatedAmount: "150,000원"
      },
      timestamp: "2분 전"
    },
    {
      id: 2,
      phone: "010-****-1234",
      riskLevel: "medium",
      riskScore: 62,
      reasons: [
        "짧은 시간 내 여러 가게 예약 (3곳, 30분 내)",
        "IP 주소 의심 (해외 IP)"
      ],
      reservation: {
        date: "11월 8일",
        time: "오후 8시",
        partySize: 4,
        estimatedAmount: "60,000원"
      },
      timestamp: "15분 전"
    },
    {
      id: 3,
      phone: "010-****-7890",
      riskLevel: "low",
      riskScore: 35,
      reasons: [
        "예약 변경 2회",
        "새로운 결제 카드 등록"
      ],
      reservation: {
        date: "11월 7일",
        time: "오후 6시 30분",
        partySize: 2,
        estimatedAmount: "30,000원"
      },
      timestamp: "1시간 전"
    }
  ];

  const mockBlacklist = [
    { phone: "010-****-9876", reports: 3, isHighRisk: false },
    { phone: "010-****-4321", reports: 5, isHighRisk: true }
  ];

  // 위험도별 스타일
  const riskLevelStyles = {
    high: {
      badge: 'bg-red-100 text-red-700 border-red-300',
      text: '높음',
      icon: 'text-red-500',
      border: 'border-red-200'
    },
    medium: {
      badge: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      text: '중간',
      icon: 'text-yellow-500',
      border: 'border-yellow-200'
    },
    low: {
      badge: 'bg-green-100 text-green-700 border-green-300',
      text: '낮음',
      icon: 'text-green-500',
      border: 'border-green-200'
    }
  };

  // 상세보기
  const handleShowDetail = (alert) => {
    setSelectedAlert(alert);
    setShowDetailModal(true);
  };

  // 블랙리스트 등록 확인
  const handleBlacklistConfirm = (alert) => {
    setSelectedAlert(alert);
    setConfirmAction('blacklist');
    setShowConfirmModal(true);
  };

  // 예약 거부 확인
  const handleRejectConfirm = (alert) => {
    setSelectedAlert(alert);
    setConfirmAction('reject');
    setShowConfirmModal(true);
  };

  // 액션 실행
  const executeAction = () => {
    setShowConfirmModal(false);

    if (confirmAction === 'blacklist') {
      setToast({
        show: true,
        message: `${selectedAlert.phone} 번호가 블랙리스트에 등록되었습니다.`,
        type: 'success'
      });
    } else if (confirmAction === 'reject') {
      setToast({
        show: true,
        message: '예약이 거부되었습니다.',
        type: 'success'
      });
    }
  };

  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar userType="owner" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center mr-4">
              <Shield className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                🚨 AI 사기 패턴 탐지 시스템
              </h1>
              <p className="text-text-secondary mt-1">
                실시간으로 의심 예약을 감지하고 있습니다
              </p>
            </div>
          </div>

          {/* 실시간 모니터링 상태 */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="text-primary-green mr-3 animate-pulse" size={24} />
                <div>
                  <p className="font-semibold text-text-primary">실시간 모니터링 중...</p>
                  <p className="text-sm text-text-secondary">AI가 24시간 예약 패턴을 분석합니다</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-green">{mockFraudAlerts.length}</p>
                <p className="text-sm text-text-secondary">의심 건</p>
              </div>
            </div>
          </Card>
        </div>

        {/* 의심 예약 목록 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center">
            <AlertTriangle className="mr-2 text-orange-500" size={24} />
            의심 예약 목록
          </h2>

          <div className="space-y-4">
            {mockFraudAlerts.map((alert) => (
              <Card key={alert.id} className={`border-2 ${riskLevelStyles[alert.riskLevel].border}`}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    {/* 전화번호와 위험도 */}
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className={riskLevelStyles[alert.riskLevel].icon} size={24} />
                      <span className="text-xl font-bold text-text-primary">{alert.phone}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${riskLevelStyles[alert.riskLevel].badge}`}>
                        위험도: {riskLevelStyles[alert.riskLevel].text} ({alert.riskScore}%)
                      </span>
                      <span className="text-sm text-text-secondary">{alert.timestamp}</span>
                    </div>

                    {/* 감지된 패턴 */}
                    <div className="mb-3">
                      <p className="font-semibold text-text-primary mb-2">감지된 의심 패턴:</p>
                      <ul className="space-y-1">
                        {alert.reasons.map((reason, idx) => (
                          <li key={idx} className="text-sm text-text-secondary flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 예약 정보 */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-semibold text-text-primary mb-1">예약 정보:</p>
                      <p className="text-sm text-text-secondary">
                        📅 {alert.reservation.date} {alert.reservation.time} / 인원: {alert.reservation.partySize}명
                        {alert.reservation.estimatedAmount && (
                          <> / 예상 금액: {alert.reservation.estimatedAmount}</>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex flex-col gap-2 md:min-w-[150px]">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShowDetail(alert)}
                      className="w-full"
                    >
                      <Eye size={16} className="mr-1" />
                      상세보기
                    </Button>
                    <Button
                      size="sm"
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      onClick={() => handleRejectConfirm(alert)}
                    >
                      <Ban size={16} className="mr-1" />
                      예약 거부
                    </Button>
                    <Button
                      size="sm"
                      className="w-full bg-red-500 hover:bg-red-600"
                      onClick={() => handleBlacklistConfirm(alert)}
                    >
                      <UserX size={16} className="mr-1" />
                      블랙리스트
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 공유 블랙리스트 */}
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center">
            <UserX className="mr-2 text-red-500" size={24} />
            공유 블랙리스트
          </h2>
          <Card>
            <p className="text-text-secondary mb-4">
              다른 사장님들이 신고한 노쇼 고객 목록입니다
            </p>
            <div className="space-y-3">
              {mockBlacklist.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <UserX className="text-red-500 mr-3" size={20} />
                    <span className="font-semibold text-text-primary">{item.phone}</span>
                    {item.isHighRisk && (
                      <span className="ml-2 text-red-500 text-xl">🔥</span>
                    )}
                  </div>
                  <span className="text-sm text-text-secondary">
                    신고 {item.reports}건
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* 상세보기 모달 */}
      {selectedAlert && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="예약 상세 정보"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-text-primary mb-2">전화번호</p>
              <p className="text-text-secondary">{selectedAlert.phone}</p>
            </div>
            <div>
              <p className="font-semibold text-text-primary mb-2">위험도</p>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${riskLevelStyles[selectedAlert.riskLevel].badge}`}>
                {riskLevelStyles[selectedAlert.riskLevel].text} ({selectedAlert.riskScore}%)
              </span>
            </div>
            <div>
              <p className="font-semibold text-text-primary mb-2">예약 정보</p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-text-secondary">날짜: {selectedAlert.reservation.date}</p>
                <p className="text-sm text-text-secondary">시간: {selectedAlert.reservation.time}</p>
                <p className="text-sm text-text-secondary">인원: {selectedAlert.reservation.partySize}명</p>
                <p className="text-sm text-text-secondary">예상 금액: {selectedAlert.reservation.estimatedAmount}</p>
              </div>
            </div>
            <div>
              <p className="font-semibold text-text-primary mb-2">의심 패턴</p>
              <ul className="space-y-2">
                {selectedAlert.reasons.map((reason, idx) => (
                  <li key={idx} className="text-sm text-text-secondary flex items-start">
                    <AlertTriangle size={16} className="text-red-500 mr-2 mt-0.5" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Modal>
      )}

      {/* 확인 모달 */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={confirmAction === 'blacklist' ? '블랙리스트 등록' : '예약 거부'}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            {confirmAction === 'blacklist'
              ? '이 번호를 블랙리스트에 등록하시겠습니까?'
              : '이 예약을 거부하시겠습니까?'}
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={executeAction}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              확인
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast 알림 */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default FraudDetection;
