/**
 * 공유 예약 페이지
 *
 * 친구들과 함께 예약하고 각자 메뉴를 선택하는 기능
 * - 참여자 목록 및 메뉴 선택
 * - 금액 정산 미리보기
 * - 초대 링크 공유
 */

import { useState } from 'react';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Copy,
  Check,
  DollarSign,
  Utensils,
  Share2,
  MessageCircle
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

const GroupReservation = () => {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // 더미 공유 예약 데이터
  const mockGroupReservation = {
    id: "abc123",
    restaurant: {
      name: "신라면옥",
      location: "홍대점",
      tableCapacity: 6
    },
    date: "2025-11-05",
    time: "19:00",
    organizer: {
      id: 1,
      name: "김민수",
      isOrganizer: true
    },
    participants: [
      {
        id: 1,
        name: "김민수",
        isConfirmed: true,
        orders: [
          { menu: "짜장면", quantity: 1, price: 8000 }
        ],
        totalAmount: 8000
      },
      {
        id: 2,
        name: "이지현",
        isConfirmed: true,
        orders: [
          { menu: "짬뽕", quantity: 1, price: 9000 },
          { menu: "군만두", quantity: 1, price: 6000 }
        ],
        totalAmount: 15000
      },
      {
        id: 3,
        name: "박준호",
        isConfirmed: true,
        orders: [
          { menu: "탕수육(소)", quantity: 1, price: 15000 }
        ],
        totalAmount: 15000
      }
    ],
    availableSeats: 3,
    summary: {
      totalAmount: 38000,
      averagePerPerson: 12667,
      confirmedCount: 3,
      maxCapacity: 6
    }
  };

  const [reservation] = useState(mockGroupReservation);
  const inviteLink = `https://olsaram.com/group/${reservation.id}`;

  // 링크 복사
  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setToast({ show: true, message: '링크가 클립보드에 복사되었습니다!', type: 'success' });
  };

  // 카카오톡 공유 (UI만)
  const handleKakaoShare = () => {
    setToast({ show: true, message: '카카오톡 공유 기능은 준비 중입니다', type: 'info' });
  };

  // 문자 공유 (UI만)
  const handleSMSShare = () => {
    setToast({ show: true, message: '문자 공유 기능은 준비 중입니다', type: 'info' });
  };

  // 예약 확정
  const handleConfirmReservation = () => {
    setIsConfirmModalOpen(false);
    setToast({ show: true, message: '예약이 확정되었습니다! 🎉', type: 'success' });
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
  };

  // 시간 포맷팅
  const formatTime = (timeString) => {
    const [hour, minute] = timeString.split(':');
    const h = parseInt(hour);
    const period = h >= 12 ? '오후' : '오전';
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${period} ${displayHour}:${minute}`;
  };

  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar userType="customer" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center">
            <Users className="mr-3 text-primary-purple" size={32} />
            공유 예약
          </h1>
          <p className="text-text-secondary">
            함께 가는 친구들을 초대하고 각자 메뉴를 선택해보세요!
          </p>
        </div>

        {/* 예약 정보 */}
        <Card className="mb-6 bg-gradient-to-r from-primary-green to-primary-purple text-white">
          <div className="flex items-center mb-4">
            <MapPin size={24} className="mr-2" />
            <h2 className="text-2xl font-bold">📍 예약 정보</h2>
          </div>
          <div className="space-y-2 text-lg">
            <div className="flex items-center">
              <span className="font-semibold w-20">가게:</span>
              <span>{reservation.restaurant.name} ({reservation.restaurant.location})</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold w-20">날짜:</span>
              <span>{formatDate(reservation.date)}</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold w-20">시간:</span>
              <span>{formatTime(reservation.time)}</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold w-20">테이블:</span>
              <span>{reservation.restaurant.tableCapacity}인석</span>
            </div>
          </div>
        </Card>

        {/* 참여자 현황 */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary flex items-center">
              <Users className="mr-2 text-primary-purple" size={24} />
              참여자 현황 ({reservation.summary.confirmedCount}/{reservation.summary.maxCapacity}명)
            </h2>
            <Button
              size="sm"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <Plus size={18} className="mr-1" />
              친구 초대
            </Button>
          </div>

          {/* 참여자 목록 */}
          <div className="space-y-4">
            {reservation.participants.map(participant => (
              <div
                key={participant.id}
                className="border border-border-color rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-green to-primary-purple rounded-full flex items-center justify-center text-white font-bold">
                      {participant.name[0]}
                    </div>
                    <div>
                      <span className="font-bold text-text-primary text-lg">
                        {participant.name}
                        {participant.id === reservation.organizer.id && (
                          <span className="ml-2 px-2 py-1 bg-primary-purple text-white text-xs rounded">
                            주최자
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-primary-green">
                    <Check size={20} className="mr-1" />
                    <span className="font-semibold">확정</span>
                  </div>
                </div>

                {/* 선택 메뉴 */}
                <div className="bg-gray-50 rounded-lg p-3 mb-2">
                  <h4 className="font-semibold text-text-primary mb-2 flex items-center">
                    <Utensils size={16} className="mr-1" />
                    선택 메뉴:
                  </h4>
                  <div className="space-y-1">
                    {participant.orders.map((order, index) => (
                      <div key={index} className="flex items-center justify-between text-text-secondary">
                        <span>• {order.menu} {order.quantity}개</span>
                        <span className="font-semibold">{order.price.toLocaleString()}원</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 예상 금액 */}
                <div className="flex items-center justify-between pt-2 border-t border-border-color">
                  <span className="text-text-secondary">예상 금액:</span>
                  <span className="font-bold text-primary-green text-lg">
                    {participant.totalAmount.toLocaleString()}원
                  </span>
                </div>
              </div>
            ))}

            {/* 빈 자리 */}
            {reservation.availableSeats > 0 && (
              <div className="border-2 border-dashed border-border-color rounded-lg p-4 text-center hover:border-primary-purple transition-colors cursor-pointer"
                onClick={() => setIsInviteModalOpen(true)}
              >
                <Plus size={32} className="mx-auto mb-2 text-text-secondary" />
                <p className="font-semibold text-text-secondary">친구 초대하기</p>
                <p className="text-sm text-text-secondary mt-1">
                  남은 자리: {reservation.availableSeats}석
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* 금액 정산 미리보기 */}
        <Card className="mb-6 bg-light-green bg-opacity-10">
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center">
            <DollarSign className="mr-2 text-primary-green" size={24} />
            💰 금액 정산 미리보기
          </h2>

          <div className="space-y-4">
            {/* 총 금액 */}
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-text-primary">총 주문 금액:</span>
              <span className="font-bold text-2xl text-primary-green">
                {reservation.summary.totalAmount.toLocaleString()}원
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">1인당 평균:</span>
              <span className="font-semibold text-text-primary">
                {reservation.summary.averagePerPerson.toLocaleString()}원
              </span>
            </div>

            {/* 개인별 금액 */}
            <div className="border-t border-border-color pt-4">
              <h3 className="font-semibold text-text-primary mb-3">개인별 금액:</h3>
              <div className="space-y-2">
                {reservation.participants.map(participant => {
                  const difference = participant.totalAmount - reservation.summary.averagePerPerson;
                  return (
                    <div key={participant.id} className="flex items-center justify-between">
                      <span className="text-text-secondary">• {participant.name}:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-text-primary">
                          {participant.totalAmount.toLocaleString()}원
                        </span>
                        {difference > 0 && (
                          <span className="text-xs text-red-600">
                            (+{Math.abs(difference).toLocaleString()}원 초과)
                          </span>
                        )}
                        {difference < 0 && (
                          <span className="text-xs text-blue-600">
                            (-{Math.abs(difference).toLocaleString()}원 절약)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-white rounded-lg p-3 border border-primary-green">
              <p className="text-sm text-text-secondary flex items-center">
                <span className="mr-2">💡</span>
                초과 금액은 개별 결제됩니다
              </p>
            </div>
          </div>
        </Card>

        {/* 공유 및 확정 */}
        <Card>
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center">
            <Share2 className="mr-2 text-primary-purple" size={24} />
            초대 링크 공유
          </h2>

          {/* 링크 복사 */}
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 p-3 border border-border-color rounded-lg bg-gray-50 text-text-secondary"
              />
              <Button onClick={handleCopyLink}>
                <Copy size={20} className="mr-2" />
                복사
              </Button>
            </div>
          </div>

          {/* 공유 버튼 */}
          <div className="flex items-center space-x-3 mb-6">
            <Button
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black"
              onClick={handleKakaoShare}
            >
              <MessageCircle size={20} className="mr-2" />
              카카오톡으로 초대
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleSMSShare}
            >
              <MessageCircle size={20} className="mr-2" />
              문자로 초대
            </Button>
          </div>

          {/* 예약 확정 버튼 */}
          <Button
            className="w-full py-4 text-lg"
            onClick={() => setIsConfirmModalOpen(true)}
          >
            <Check size={24} className="mr-2" />
            예약 확정하기
          </Button>
        </Card>
      </div>

      {/* 초대 모달 */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="친구 초대하기"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            아래 링크를 복사하여 친구들에게 공유하세요!
          </p>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-text-secondary mb-2">초대 링크:</p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 p-2 border border-border-color rounded bg-white text-sm"
              />
              <Button size="sm" onClick={handleCopyLink}>
                <Copy size={16} className="mr-1" />
                복사
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
              onClick={handleKakaoShare}
            >
              <MessageCircle size={20} className="mr-2" />
              카카오톡으로 공유
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSMSShare}
            >
              <MessageCircle size={20} className="mr-2" />
              문자로 공유
            </Button>
          </div>
        </div>
      </Modal>

      {/* 예약 확정 확인 모달 */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="예약 확정"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-text-primary">
            총 <span className="font-bold text-primary-green">{reservation.summary.confirmedCount}명</span>의 예약을 확정하시겠습니까?
          </p>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">총 주문 금액:</span>
                <span className="font-bold">{reservation.summary.totalAmount.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">참여 인원:</span>
                <span className="font-bold">{reservation.summary.confirmedCount}명</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">예약 날짜:</span>
                <span className="font-bold">{formatDate(reservation.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">예약 시간:</span>
                <span className="font-bold">{formatTime(reservation.time)}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              취소
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirmReservation}
            >
              확정하기
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

export default GroupReservation;
