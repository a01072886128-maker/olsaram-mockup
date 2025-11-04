/**
 * 마이페이지 - 리워드 페이지
 *
 * 고객의 신뢰 등급, 포인트, 미션, 예약 이력 관리
 * - 프로필 카드
 * - 보유 포인트
 * - 미션 진행도
 * - 예약 이력
 */

import { useState } from 'react';
import {
  Gift,
  Star,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Ticket,
  CheckCircle
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const MyPage = () => {
  const [showCouponsModal, setShowCouponsModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);

  // 더미 데이터
  const mockUserProfile = {
    name: "김민수",
    trustLevel: "단골",
    stars: 5,
    attendanceRate: 94.5,
    completedReservations: 18,
    totalReservations: 19,
    nextLevel: "단짝",
    reservationsToNextLevel: 2
  };

  const mockPoints = {
    balance: 12500,
    history: [
      { date: "11/02", amount: 500, reason: "예약 이행" },
      { date: "11/01", amount: 300, reason: "예약 이행" },
      { date: "11/01", amount: 200, reason: "리뷰 작성 보너스" }
    ]
  };

  const mockMissions = [
    {
      id: 1,
      title: "중식당 3곳 방문",
      progress: 2,
      total: 3,
      reward: "10,000원 쿠폰",
      status: "in_progress",
      icon: "🎯"
    },
    {
      id: 2,
      title: "새로운 동네 식당 5곳",
      progress: 1,
      total: 5,
      reward: "\"탐험가\" 뱃지",
      status: "available",
      icon: "🗺️"
    },
    {
      id: 3,
      title: "혼밥 3회 도전",
      progress: 0,
      total: 3,
      reward: "혼밥 전용 5% 할인 쿠폰",
      status: "available",
      icon: "🍽️"
    }
  ];

  const mockReservationHistory = [
    {
      id: 1,
      date: "11/02",
      restaurant: "신라면옥",
      category: "중식",
      partySize: 4,
      status: "completed",
      pointsEarned: 500
    },
    {
      id: 2,
      date: "11/01",
      restaurant: "카페봄날",
      category: "카페",
      partySize: 1,
      isSolo: true,
      status: "completed",
      pointsEarned: 300,
      bonusPoints: 200,
      bonusReason: "리뷰 작성 보너스"
    },
    {
      id: 3,
      date: "10/30",
      restaurant: "이태원 초밥",
      category: "일식",
      partySize: 2,
      status: "completed",
      pointsEarned: 800
    }
  ];

  const mockCoupons = [
    { id: 1, name: "5,000원 할인 쿠폰", expiry: "2025-12-31", discount: 5000 },
    { id: 2, name: "첫 방문 10% 할인", expiry: "2025-12-31", discount: "10%" },
    { id: 3, name: "중식당 전용 3,000원", expiry: "2025-11-30", discount: 3000 }
  ];

  // 진행도 계산
  const getProgressPercentage = (progress, total) => {
    return (progress / total) * 100;
  };

  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar userType="customer" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-purple to-dark-purple rounded-lg flex items-center justify-center mr-4">
              <Gift className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                🎁 나의 리워드
              </h1>
              <p className="text-text-secondary mt-1">
                약속을 지킬수록 더 많은 혜택을 받으세요!
              </p>
            </div>
          </div>
        </div>

        {/* 프로필 카드 */}
        <Card className="bg-gradient-to-br from-primary-green to-primary-purple text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <Star className="text-primary-purple" size={40} fill="currentColor" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">👤 {mockUserProfile.name}님</h2>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-semibold">
                    신뢰 등급: {mockUserProfile.trustLevel}
                  </span>
                  <span className="text-xl">
                    {'⭐'.repeat(mockUserProfile.stars)}
                  </span>
                </div>
                <p className="text-sm opacity-90">
                  출석률: {mockUserProfile.attendanceRate}%
                  ({mockUserProfile.completedReservations}회 이행 / {mockUserProfile.totalReservations}회 예약)
                </p>
              </div>
            </div>
            <div className="text-center bg-white bg-opacity-20 rounded-lg p-4">
              <TrendingUp className="mx-auto mb-2" size={32} />
              <p className="text-sm mb-1">다음 등급까지</p>
              <p className="text-2xl font-bold">{mockUserProfile.reservationsToNextLevel}회 남음</p>
              <p className="text-sm mt-1">→ {mockUserProfile.nextLevel} 🏆</p>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 왼쪽: 포인트 & 미션 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 보유 포인트 */}
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-text-secondary font-semibold mb-2">💰 보유 포인트</p>
                  <p className="text-5xl font-bold text-primary-green">{mockPoints.balance.toLocaleString()}원</p>
                </div>
                <Award className="text-primary-green" size={64} />
              </div>
              <Button variant="primary" className="w-full md:w-auto">
                <Gift className="mr-2" size={18} />
                포인트 사용하기
              </Button>
            </Card>

            {/* 이달의 미션 */}
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center">
                <Target className="mr-2 text-primary-purple" size={28} />
                이달의 미션
              </h2>

              <div className="space-y-4">
                {mockMissions.map((mission) => (
                  <Card key={mission.id} hover>
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{mission.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-text-primary mb-2">
                          {mission.title}
                        </h3>

                        {/* 진행도 바 */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-text-secondary mb-1">
                            <span>진행도</span>
                            <span className="font-semibold">
                              {mission.progress}/{mission.total}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-primary-green to-primary-purple h-3 rounded-full transition-all duration-500"
                              style={{ width: `${getProgressPercentage(mission.progress, mission.total)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm">
                            <Gift className="text-primary-purple mr-2" size={16} />
                            <span className="text-text-secondary">보상: </span>
                            <span className="font-semibold text-text-primary ml-1">
                              {mission.reward}
                            </span>
                          </div>
                          {mission.status === 'in_progress' ? (
                            <span className="px-3 py-1 bg-primary-green text-white text-sm font-semibold rounded-full">
                              진행 중
                            </span>
                          ) : (
                            <Button size="sm" variant="outline">
                              시작하기
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽: 예약 이력 & 빠른 액션 */}
          <div className="space-y-8">
            {/* 빠른 액션 */}
            <Card>
              <h3 className="text-lg font-bold text-text-primary mb-4">빠른 액션</h3>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowCouponsModal(true)}
                >
                  <Ticket className="mr-2" size={18} />
                  쿠폰함 ({mockCoupons.length}개)
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowLevelModal(true)}
                >
                  <Award className="mr-2" size={18} />
                  등급 상세보기
                </Button>
              </div>
            </Card>

            {/* 예약 이력 */}
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center">
                <Calendar className="mr-2 text-primary-green" size={24} />
                예약 이력
              </h2>

              <div className="space-y-3">
                {mockReservationHistory.map((history) => (
                  <Card key={history.id} className="bg-gray-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="text-primary-green" size={18} />
                          <span className="font-bold text-text-primary">
                            {history.date}
                          </span>
                          <span className="font-semibold text-text-primary">
                            {history.restaurant}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary mb-2">
                          {history.category} / {history.partySize}명
                          {history.isSolo && ' (혼밥)'}
                        </p>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-primary-green">
                            +{history.pointsEarned}P 적립
                          </p>
                          {history.bonusPoints && (
                            <p className="text-sm font-semibold text-primary-purple">
                              +{history.bonusPoints}P {history.bonusReason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-text-secondary">
                        완료 ✅
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 쿠폰함 모달 */}
      <Modal
        isOpen={showCouponsModal}
        onClose={() => setShowCouponsModal(false)}
        title="쿠폰함"
        size="md"
      >
        <div className="space-y-3">
          {mockCoupons.map((coupon) => (
            <div key={coupon.id} className="border-2 border-dashed border-primary-green rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-bold text-text-primary mb-1">{coupon.name}</h4>
                  <p className="text-sm text-text-secondary">
                    유효기간: {coupon.expiry}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-green">
                    {typeof coupon.discount === 'number'
                      ? `${coupon.discount.toLocaleString()}원`
                      : coupon.discount}
                  </p>
                </div>
              </div>
              <Button size="sm" className="w-full mt-3">
                사용하기
              </Button>
            </div>
          ))}
        </div>
      </Modal>

      {/* 등급 상세 모달 */}
      <Modal
        isOpen={showLevelModal}
        onClose={() => setShowLevelModal(false)}
        title="신뢰 등급 안내"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🏆</span>
              <h4 className="text-lg font-bold text-text-primary">단짝 (최고 등급)</h4>
            </div>
            <p className="text-sm text-text-secondary">
              • 예약 20회 이상 이행<br />
              • 출석률 95% 이상<br />
              • 혜택: 모든 가게 15% 할인, 우선 예약권
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-primary-green">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⭐⭐⭐⭐⭐</span>
              <h4 className="text-lg font-bold text-text-primary">단골 (현재 등급)</h4>
            </div>
            <p className="text-sm text-text-secondary">
              • 예약 15회 이상 이행<br />
              • 출석률 90% 이상<br />
              • 혜택: 대부분 가게 10% 할인
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⭐⭐⭐</span>
              <h4 className="text-lg font-bold text-text-primary">손님</h4>
            </div>
            <p className="text-sm text-text-secondary">
              • 예약 5회 이상 이행<br />
              • 출석률 80% 이상<br />
              • 혜택: 일부 가게 5% 할인
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🌱</span>
              <h4 className="text-lg font-bold text-text-primary">새싹</h4>
            </div>
            <p className="text-sm text-text-secondary">
              • 신규 가입 고객<br />
              • 혜택: 첫 방문 쿠폰 제공
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyPage;
