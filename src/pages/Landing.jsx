/**
 * Landing 페이지
 *
 * 올사람 플랫폼의 메인 랜딩 페이지
 * - 히어로 섹션
 * - 주요 기능 소개
 * - CTA 버튼
 */

import { Link } from 'react-router-dom';
import { Shield, DollarSign, Users, Brain, Calendar, Gift } from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Card from '../components/Card';

const Landing = () => {
  // 주요 기능 데이터
  const features = [
    {
      icon: <Brain size={32} />,
      title: 'AI 사기 탐지',
      description: '동시 다발 예약, 허위 정보 등 사기 패턴을 실시간으로 감지하여 노쇼를 예방합니다.',
      color: 'from-primary-purple to-dark-purple'
    },
    {
      icon: <DollarSign size={32} />,
      title: '예약금 0원',
      description: '카드 등록만으로 신뢰를 보증. 노쇼 시 자동 결제로 부담 없이 시작하세요.',
      color: 'from-primary-green to-dark-green'
    },
    {
      icon: <Users size={32} />,
      title: '실시간 대기자 매칭',
      description: '취소 발생 시 자동으로 대기자에게 알림. 빈자리 없는 효율적인 운영.',
      color: 'from-light-purple to-primary-purple'
    }
  ];

  // 사장님 혜택
  const ownerBenefits = [
    '노쇼율 평균 67% 감소',
    '월 평균 매출 증대 120만원',
    '예약 관리 시간 50% 단축',
    '공유 블랙리스트 무료 이용'
  ];

  // 고객 혜택
  const customerBenefits = [
    '신뢰 등급별 할인 혜택',
    '예약금 0원 간편 예약',
    '음성 AI로 30초 예약',
    '친구와 공유 예약 가능'
  ];

  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar />

      {/* 히어로 섹션 */}
      <section className="relative bg-gradient-to-br from-primary-green via-primary-purple to-dark-purple text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              약속을 지키는 사람들,
              <br />
              <span className="text-light-green">올사람</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
              AI 기반 노쇼 방지 시스템으로<br className="md:hidden" />
              소상공인과 고객 모두가 행복한 예약 문화를 만듭니다
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/owner/dashboard">
                <Button variant="outline" size="lg" className="bg-white text-primary-green hover:bg-gray-50 border-0 min-w-[200px]">
                  <Shield className="inline mr-2" size={20} />
                  사장님 시작하기
                </Button>
              </Link>
              <Link to="/customer/search">
                <Button size="lg" className="bg-primary-green hover:bg-dark-green min-w-[200px]">
                  <Gift className="inline mr-2" size={20} />
                  고객 앱 다운로드
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            왜 올사람일까요?
          </h2>
          <p className="text-lg text-text-secondary">
            혁신적인 기술로 노쇼 문제를 해결합니다
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} hover className="text-center">
              <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">
                {feature.title}
              </h3>
              <p className="text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* 사장님/고객 혜택 섹션 */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* 사장님 혜택 */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-green to-dark-green rounded-lg flex items-center justify-center mr-4">
                  <Shield className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-text-primary">
                  사장님 혜택
                </h3>
              </div>
              <ul className="space-y-4">
                {ownerBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-6 h-6 bg-primary-green rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-text-primary text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link to="/owner/dashboard">
                <Button variant="primary" className="mt-8 w-full sm:w-auto">
                  지금 시작하기
                </Button>
              </Link>
            </div>

            {/* 고객 혜택 */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-purple to-dark-purple rounded-lg flex items-center justify-center mr-4">
                  <Gift className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-text-primary">
                  고객 혜택
                </h3>
              </div>
              <ul className="space-y-4">
                {customerBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-6 h-6 bg-primary-purple rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-text-primary text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link to="/customer/search">
                <Button variant="secondary" className="mt-8 w-full sm:w-auto">
                  앱 다운로드
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-primary-green to-primary-purple rounded-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-12">올사람과 함께한 성과</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">2,547</div>
              <div className="text-gray-100">등록 가게</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">67%</div>
              <div className="text-gray-100">노쇼율 감소</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15만+</div>
              <div className="text-gray-100">신뢰 고객</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.8/5.0</div>
              <div className="text-gray-100">사장님 만족도</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            설치 비용 무료, 월 이용료 무료<br />
            노쇼가 발생했을 때만 수수료 5%
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/owner/dashboard">
              <Button variant="primary" size="lg" className="min-w-[200px]">
                사장님 시작하기
              </Button>
            </Link>
            <Link to="/customer/search">
              <Button variant="secondary" size="lg" className="min-w-[200px]">
                고객 앱 다운로드
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">올사람</h4>
              <p className="text-sm">
                약속을 지키는 사람들의<br />
                신뢰 예약 플랫폼
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">사장님</h4>
              <ul className="space-y-2 text-sm">
                <li>대시보드</li>
                <li>AI 사기탐지</li>
                <li>예약관리</li>
                <li>커뮤니티</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">고객</h4>
              <ul className="space-y-2 text-sm">
                <li>맛집 찾기</li>
                <li>음성 예약</li>
                <li>리워드</li>
                <li>이용 가이드</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">고객센터</h4>
              <ul className="space-y-2 text-sm">
                <li>공지사항</li>
                <li>FAQ</li>
                <li>1:1 문의</li>
                <li>이용약관</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            <p>© 2025 올사람. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
