/**
 * 예약 관리 페이지
 *
 * 모든 예약을 한눈에 확인하고 관리
 * - 날짜/상태 필터
 * - 예약 승인/거절
 * - 문자 발송
 * - 대기자 관리
 */

import { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Eye,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

const Reservations = () => {
  const [dateFilter, setDateFilter] = useState('today');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // 더미 데이터
  const mockReservations = [
    {
      id: 1,
      customer: {
        name: "김민수",
        trustLevel: "단골",
        stars: 5,
        totalVisits: 18,
        noShowCount: 0
      },
      date: "2025-11-05",
      time: "19:00",
      partySize: 4,
      status: "confirmed",
      cardRegistered: true,
      depositAmount: 0,
      menu: "런치 세트 A"
    },
    {
      id: 2,
      customer: {
        name: "이지현",
        trustLevel: "새싹",
        stars: 1,
        totalVisits: 0,
        noShowCount: 0,
        isNewCustomer: true
      },
      date: "2025-11-05",
      time: "19:30",
      partySize: 2,
      status: "pending",
      cardRegistered: true,
      depositAmount: 0,
      menu: "디너 코스 B"
    },
    {
      id: 3,
      customer: {
        name: "박준호",
        trustLevel: "손님",
        stars: 3,
        totalVisits: 5,
        noShowCount: 1
      },
      date: "2025-11-05",
      time: "20:00",
      partySize: 6,
      status: "cancelled",
      cancelledAt: "1시간 전",
      cardRegistered: true,
      waitlistNotified: true,
      waitlistCount: 3,
      menu: "특선 코스"
    },
    {
      id: 4,
      customer: {
        name: "최수진",
        trustLevel: "단골",
        stars: 5,
        totalVisits: 12,
        noShowCount: 0
      },
      date: "2025-11-05",
      time: "18:00",
      partySize: 3,
      status: "confirmed",
      cardRegistered: true,
      depositAmount: 0,
      menu: "일반 메뉴"
    }
  ];

  // 필터링된 예약 목록
  const filteredReservations = mockReservations.filter(reservation => {
    if (statusFilter !== 'all' && reservation.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // 신뢰 등급별 색상
  const trustLevelColors = {
    '단골': 'text-yellow-500',
    '손님': 'text-primary-green',
    '새싹': 'text-light-green'
  };

  // 상태별 스타일
  const statusStyles = {
    confirmed: {
      icon: <CheckCircle size={20} className="text-primary-green" />,
      text: '확정',
      textColor: 'text-primary-green',
      bg: 'bg-green-50'
    },
    pending: {
      icon: <AlertCircle size={20} className="text-yellow-600" />,
      text: '대기 중',
      textColor: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
    cancelled: {
      icon: <XCircle size={20} className="text-red-500" />,
      text: '취소됨',
      textColor: 'text-red-500',
      bg: 'bg-red-50'
    },
    noshow: {
      icon: <XCircle size={20} className="text-gray-500" />,
      text: '노쇼',
      textColor: 'text-gray-500',
      bg: 'bg-gray-50'
    }
  };

  // 예약 승인
  const handleApprove = (reservation) => {
    setToast({
      show: true,
      message: `${reservation.customer.name}님의 예약이 승인되었습니다.`,
      type: 'success'
    });
  };

  // 예약 거절
  const handleReject = (reservation) => {
    setToast({
      show: true,
      message: `${reservation.customer.name}님의 예약이 거절되었습니다.`,
      type: 'info'
    });
  };

  // 문자 발송
  const handleSendMessage = (reservation) => {
    setToast({
      show: true,
      message: `${reservation.customer.name}님께 문자가 발송되었습니다.`,
      type: 'success'
    });
  };

  // 상세보기
  const handleShowDetail = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar userType="owner" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-green to-primary-purple rounded-lg flex items-center justify-center mr-4">
              <Calendar className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                📅 예약 현황
              </h1>
              <p className="text-text-secondary mt-1">
                모든 예약을 한눈에 확인하고 관리하세요
              </p>
            </div>
          </div>

          {/* 필터 */}
          <Card>
            <div className="flex flex-col md:flex-row gap-4">
              {/* 날짜 필터 */}
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary mb-2">날짜</p>
                <div className="flex gap-2">
                  {['today', 'week', 'month', 'all'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setDateFilter(filter)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        dateFilter === filter
                          ? 'bg-primary-green text-white'
                          : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                      }`}
                    >
                      {filter === 'today' && '오늘'}
                      {filter === 'week' && '이번주'}
                      {filter === 'month' && '이번달'}
                      {filter === 'all' && '전체'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 상태 필터 */}
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary mb-2">상태</p>
                <div className="flex gap-2">
                  {['all', 'confirmed', 'pending', 'cancelled'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        statusFilter === filter
                          ? 'bg-primary-purple text-white'
                          : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                      }`}
                    >
                      {filter === 'all' && '전체'}
                      {filter === 'confirmed' && '확정'}
                      {filter === 'pending' && '대기'}
                      {filter === 'cancelled' && '취소'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 예약 목록 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">
              예약 목록 ({filteredReservations.length}건)
            </h2>
          </div>

          {filteredReservations.map((reservation) => (
            <Card key={reservation.id} hover className={statusStyles[reservation.status].bg}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  {/* 고객 정보 */}
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="text-primary-green" size={24} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-text-primary">
                          {reservation.customer.name}
                        </span>
                        <span className={`text-sm ${trustLevelColors[reservation.customer.trustLevel]}`}>
                          {reservation.customer.trustLevel} {'⭐'.repeat(reservation.customer.stars)}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary">
                        {reservation.customer.isNewCustomer ? (
                          '신규 고객 (첫 방문) 🌱'
                        ) : (
                          `총 ${reservation.customer.totalVisits}회 방문, 노쇼 ${reservation.customer.noShowCount}회`
                        )}
                      </p>
                    </div>
                  </div>

                  {/* 예약 정보 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="flex items-center text-sm text-text-secondary">
                      <Clock size={16} className="mr-2" />
                      {reservation.time}
                    </div>
                    <div className="flex items-center text-sm text-text-secondary">
                      <Users size={16} className="mr-2" />
                      {reservation.partySize}명
                    </div>
                    <div className="flex items-center text-sm text-text-secondary">
                      <CreditCard size={16} className="mr-2" />
                      {reservation.cardRegistered ? '카드 등록 완료' : '미등록'}
                    </div>
                    <div className="flex items-center text-sm font-semibold">
                      {statusStyles[reservation.status].icon}
                      <span className={`ml-2 ${statusStyles[reservation.status].textColor}`}>
                        {statusStyles[reservation.status].text}
                      </span>
                    </div>
                  </div>

                  {/* 메뉴 */}
                  <div className="bg-white rounded-lg p-3 mb-3">
                    <p className="text-sm text-text-secondary">
                      메뉴: {reservation.menu}
                    </p>
                  </div>

                  {/* 취소 시 대기자 정보 */}
                  {reservation.status === 'cancelled' && reservation.waitlistNotified && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <RefreshCw className="text-primary-purple mr-2" size={18} />
                        <span className="text-sm font-semibold text-primary-purple">
                          대기자 매칭: 자동 알림 발송됨 ({reservation.waitlistCount}명 대기 중)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="flex flex-col gap-2 md:min-w-[150px]">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShowDetail(reservation)}
                    className="w-full"
                  >
                    <Eye size={16} className="mr-1" />
                    예약 상세
                  </Button>

                  {reservation.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(reservation)}
                        className="w-full"
                      >
                        <CheckCircle size={16} className="mr-1" />
                        승인
                      </Button>
                      <Button
                        size="sm"
                        className="w-full bg-red-500 hover:bg-red-600"
                        onClick={() => handleReject(reservation)}
                      >
                        <XCircle size={16} className="mr-1" />
                        거절
                      </Button>
                    </>
                  )}

                  {reservation.status === 'confirmed' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSendMessage(reservation)}
                      className="w-full"
                    >
                      <MessageSquare size={16} className="mr-1" />
                      문자 발송
                    </Button>
                  )}

                  {reservation.status === 'cancelled' && reservation.waitlistNotified && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full"
                    >
                      <RefreshCw size={16} className="mr-1" />
                      대기자 확인
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {filteredReservations.length === 0 && (
            <Card className="text-center py-12">
              <Calendar className="mx-auto mb-4 text-text-secondary" size={48} />
              <p className="text-text-secondary text-lg">
                해당 조건의 예약이 없습니다.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* 상세보기 모달 */}
      {selectedReservation && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="예약 상세 정보"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-text-primary mb-2">고객 정보</p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-text-secondary">
                  이름: {selectedReservation.customer.name}
                </p>
                <p className="text-sm text-text-secondary">
                  신뢰 등급: {selectedReservation.customer.trustLevel} {'⭐'.repeat(selectedReservation.customer.stars)}
                </p>
                <p className="text-sm text-text-secondary">
                  방문 횟수: {selectedReservation.customer.totalVisits}회
                </p>
                <p className="text-sm text-text-secondary">
                  노쇼 횟수: {selectedReservation.customer.noShowCount}회
                </p>
              </div>
            </div>

            <div>
              <p className="font-semibold text-text-primary mb-2">예약 정보</p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-text-secondary">날짜: {selectedReservation.date}</p>
                <p className="text-sm text-text-secondary">시간: {selectedReservation.time}</p>
                <p className="text-sm text-text-secondary">인원: {selectedReservation.partySize}명</p>
                <p className="text-sm text-text-secondary">메뉴: {selectedReservation.menu}</p>
                <p className="text-sm text-text-secondary">
                  결제 카드: {selectedReservation.cardRegistered ? '등록 완료' : '미등록'}
                </p>
              </div>
            </div>

            <div>
              <p className="font-semibold text-text-primary mb-2">상태</p>
              <div className="flex items-center">
                {statusStyles[selectedReservation.status].icon}
                <span className={`ml-2 font-semibold ${statusStyles[selectedReservation.status].textColor}`}>
                  {statusStyles[selectedReservation.status].text}
                </span>
              </div>
            </div>

            {selectedReservation.status === 'cancelled' && (
              <div>
                <p className="font-semibold text-text-primary mb-2">취소 정보</p>
                <p className="text-sm text-text-secondary">
                  취소 시간: {selectedReservation.cancelledAt}
                </p>
                {selectedReservation.waitlistNotified && (
                  <p className="text-sm text-primary-purple mt-2">
                    ✅ 대기자 {selectedReservation.waitlistCount}명에게 자동 알림 발송됨
                  </p>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

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

export default Reservations;
