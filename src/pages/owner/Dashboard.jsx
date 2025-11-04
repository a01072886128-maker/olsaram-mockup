/**
 * 사장님 대시보드
 *
 * 업주용 메인 대시보드
 * - 주요 통계 (오늘 예약, 노쇼율, 예상 매출, 신뢰 고객 비율)
 * - AI 사기 의심 알림
 * - 오늘의 예약 목록
 * - 빠른 액션 버튼
 */

import { Link } from 'react-router-dom';
import {
  Calendar,
  AlertTriangle,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Shield
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Button from '../../components/Button';

const Dashboard = () => {
  // 더미 통계 데이터
  const stats = [
    {
      icon: <Calendar />,
      title: '오늘 예약',
      value: '24건',
      change: '+12% 전일 대비',
      changeType: 'positive'
    },
    {
      icon: <AlertTriangle />,
      title: '이번 달 노쇼율',
      value: '3.2%',
      change: '-2.1% 전월 대비',
      changeType: 'positive'
    },
    {
      icon: <DollarSign />,
      title: '이번 달 예상 매출',
      value: '₩8.2M',
      change: '+15.3% 전월 대비',
      changeType: 'positive'
    },
    {
      icon: <Users />,
      title: '신뢰 고객 비율',
      value: '78%',
      change: '+5% 전월 대비',
      changeType: 'positive'
    }
  ];

  // 더미 AI 알림 데이터
  const fraudAlerts = [
    {
      id: 1,
      phone: '010-****-5678',
      riskLevel: 'high',
      riskScore: 87,
      time: '2분 전',
      reasons: ['동시 다발 예약 (5곳)', '신규 가입 (가입 10분 전)']
    },
    {
      id: 2,
      phone: '010-****-9012',
      riskLevel: 'medium',
      riskScore: 65,
      time: '15분 전',
      reasons: ['과거 노쇼 이력 1회', '예약 패턴 이상']
    }
  ];

  // 더미 예약 데이터
  const todayReservations = [
    {
      id: 1,
      customerName: '김민수',
      trustLevel: '단골',
      stars: 5,
      time: '11:30',
      partySize: 2,
      status: 'confirmed',
      menu: '런치 세트 A'
    },
    {
      id: 2,
      customerName: '이지현',
      trustLevel: '새싹',
      stars: 1,
      time: '12:00',
      partySize: 4,
      status: 'confirmed',
      menu: '특선 코스'
    },
    {
      id: 3,
      customerName: '박준호',
      trustLevel: '우수',
      stars: 3,
      time: '12:30',
      partySize: 3,
      status: 'pending',
      menu: '일반 메뉴'
    },
    {
      id: 4,
      customerName: '최수진',
      trustLevel: '단골',
      stars: 5,
      time: '18:00',
      partySize: 6,
      status: 'confirmed',
      menu: '디너 코스 B'
    }
  ];

  // 신뢰 등급별 색상
  const trustLevelColors = {
    '단골': 'text-yellow-500',
    '우수': 'text-primary-green',
    '새싹': 'text-light-green'
  };

  // 위험도별 색상
  const riskLevelColors = {
    high: 'bg-red-100 text-red-700 border-red-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    low: 'bg-green-100 text-green-700 border-green-300'
  };

  const riskLevelText = {
    high: '높음',
    medium: '중간',
    low: '낮음'
  };

  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar userType="owner" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            대시보드
          </h1>
          <p className="text-text-secondary">
            오늘도 좋은 하루 되세요! 📊
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* AI 사기 의심 알림 */}
        {fraudAlerts.length > 0 && (
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                    <Shield className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">
                      🚨 AI 사기 의심 알림
                    </h3>
                    <p className="text-sm text-text-secondary">
                      실시간으로 감지된 의심 예약입니다
                    </p>
                  </div>
                </div>
                <Link to="/owner/fraud-detection">
                  <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                    전체보기
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {fraudAlerts.map(alert => (
                  <div key={alert.id} className="bg-white rounded-lg p-4 border border-red-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-bold text-text-primary">{alert.phone}</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold border ${riskLevelColors[alert.riskLevel]}`}>
                            위험도: {riskLevelText[alert.riskLevel]} ({alert.riskScore}%)
                          </span>
                        </div>
                        <span className="text-xs text-text-secondary">{alert.time}</span>
                      </div>
                    </div>
                    <ul className="space-y-1">
                      {alert.reasons.map((reason, idx) => (
                        <li key={idx} className="text-sm text-text-secondary flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 오늘의 예약 */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-text-primary flex items-center">
                  <Calendar className="mr-2 text-primary-green" size={24} />
                  오늘의 예약
                </h2>
                <Link to="/owner/reservations">
                  <Button size="sm" variant="outline">
                    전체보기
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {todayReservations.map(reservation => (
                  <div
                    key={reservation.id}
                    className="border border-border-color rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-bold text-text-primary text-lg">
                            {reservation.customerName}
                          </span>
                          <span className={`text-sm ${trustLevelColors[reservation.trustLevel]}`}>
                            {reservation.trustLevel} {'⭐'.repeat(reservation.stars)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-text-secondary">
                          <span className="flex items-center">
                            <Clock size={16} className="mr-1" />
                            {reservation.time}
                          </span>
                          <span className="flex items-center">
                            <Users size={16} className="mr-1" />
                            {reservation.partySize}명
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary mt-1">
                          메뉴: {reservation.menu}
                        </p>
                      </div>
                      <div>
                        {reservation.status === 'confirmed' ? (
                          <div className="flex items-center text-primary-green text-sm font-semibold">
                            <CheckCircle size={16} className="mr-1" />
                            확정
                          </div>
                        ) : (
                          <div className="flex items-center text-yellow-600 text-sm font-semibold">
                            <AlertCircle size={16} className="mr-1" />
                            대기
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 빠른 액션 */}
          <div>
            <Card>
              <h2 className="text-xl font-bold text-text-primary mb-6">
                빠른 액션
              </h2>
              <div className="space-y-3">
                <Link to="/owner/reservations">
                  <button className="w-full bg-primary-green hover:bg-dark-green text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                    <Calendar className="mr-2" size={20} />
                    예약 추가하기
                  </button>
                </Link>
                <Link to="/owner/menu-ocr">
                  <button className="w-full bg-primary-purple hover:bg-dark-purple text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                    <TrendingUp className="mr-2" size={20} />
                    메뉴 등록 (OCR)
                  </button>
                </Link>
                <Link to="/owner/fraud-detection">
                  <button className="w-full border-2 border-primary-green text-primary-green hover:bg-primary-green hover:text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                    <Shield className="mr-2" size={20} />
                    사기 패턴 확인
                  </button>
                </Link>
                <Link to="/owner/community">
                  <button className="w-full border-2 border-text-secondary text-text-secondary hover:bg-gray-50 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                    <Users className="mr-2" size={20} />
                    커뮤니티
                  </button>
                </Link>
              </div>
            </Card>

            {/* 이번 주 성과 */}
            <Card className="mt-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">
                이번 주 성과
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">신뢰 고객 비율</span>
                    <span className="font-semibold text-primary-green">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-green h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">예약 달성률</span>
                    <span className="font-semibold text-primary-purple">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-purple h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">노쇼 방지율</span>
                    <span className="font-semibold text-dark-green">96.8%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-dark-green h-2 rounded-full" style={{ width: '96.8%' }}></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
