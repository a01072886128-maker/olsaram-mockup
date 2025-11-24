/**
 * Landing 페이지 - NoShow Guard 스타일
 *
 * 풀스크린 레스토랑 배경과 보라색 브랜딩
 * 깔끔하고 프로페셔널한 디자인
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  CheckCircle,
  Shield,
  Zap,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

// 카운트업 애니메이션 훅
function useCountUp(end, duration = 2000, inView) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, inView]);

  return count;
}

// Fade In 컴포넌트
function FadeIn({ children, delay = 0 }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <Motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </Motion.div>
  );
}

function Landing() {
  const navigate = useNavigate();

  const [statsRef, statsInView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });
  const [performanceRef, performanceInView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  // 통계 카운트업
  const noShowAmount = useCountUp(1.8, 2000, statsInView);
  const detectionRate = useCountUp(98, 2000, performanceInView);
  const reduction = useCountUp(80, 2000, performanceInView);
  const storeCount = useCountUp(1000, 2000, performanceInView);

  return (
    <div className="min-h-screen">
      {/* 네비게이션 - 고정 */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">올사람</h1>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.clear();
                window.location.href = "/auth/login";
              }}
            >
              로그인
            </Button>
            <Button
              size="sm"
              className="bg-primary-green hover:bg-dark-green text-white"
            >
              무료 시작
            </Button>
          </div>
        </div>
      </header>

      {/* 섹션 1: Hero - 풀스크린 */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-lime-50 pt-16">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <span className="inline-block px-4 py-2 bg-primary-green/10 text-primary-green text-base font-semibold rounded-full mb-6">
              소상공인을 위한 약속지킴 플랫폼
            </span>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight text-text-primary">
              약속을 지키는 사람들,
              <br />
              <span className="text-primary-green">올사람</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.4}>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
              AI 기반 노쇼사기 탐지로 피해를 예방하고
              <br />
              신뢰 있는 예약 문화를 만듭니다
            </p>
          </FadeIn>

          <FadeIn delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="text-lg px-10 h-16 bg-primary-green hover:bg-dark-green text-white"
                onClick={() => {
                  localStorage.clear();
                  navigate("/auth/login");
                }}
              >
                사장님 시작하기 →
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 h-16 border-2 border-primary-green text-primary-green hover:bg-primary-green/10"
                onClick={() => {
                  localStorage.clear();
                  navigate("/auth/customer-login");
                }}
              >
                고객님 시작하기→
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={0.8}>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary-green" />
                <span>설치비 0원</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary-green" />
                <span>수수료 0원</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary-green" />
                <span>3분 만에 시작</span>
              </div>
            </div>
          </FadeIn>

          {/* 스크롤 유도 */}
          <Motion.div
            className="mt-20"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <div className="text-gray-400 text-2xl">↓</div>
          </Motion.div>
        </div>
      </section>

      {/* 섹션 2: 문제 제시 - 통계 */}
      <section
        ref={statsRef}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100"
      >
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-5xl font-bold mb-6 text-text-primary">
              지금 이 순간에도
            </h2>
            <p className="text-xl text-gray-600 mb-20">
              수많은 소상공인들이 예약 불이행과 사기성 예약으로 어려움을 겪고
              있습니다.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <FadeIn delay={0.2}>
              <div className="text-center">
                <div className="text-6xl font-bold text-primary-green mb-4">
                  {noShowAmount.toFixed(1)}조 원
                </div>
                <div className="text-lg text-gray-600 mb-2">
                  연간 노쇼로 인한 경제적 손실
                </div>
                <div className="text-sm text-gray-500">
                  작은 가게일수록 더 큰 타격
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="text-center">
                <div className="text-6xl font-bold text-primary-green mb-4">
                  0.7%
                </div>
                <div className="text-lg text-gray-600 mb-2">실제 검거율</div>
                <div className="text-sm text-gray-500">
                  피해가 발생해도 해결은 거의 불가능
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.6}>
              <div className="text-center">
                <div className="text-6xl font-bold text-red-600 mb-4">
                  2,892건
                </div>
                <div className="text-lg text-gray-600 mb-2">
                  올해 신고된 사기성 예약
                </div>
                <div className="text-sm text-gray-500">
                  더욱 교묘하게 증가하는 추세
                </div>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.8}>
            <div className="mt-20 p-8 bg-red-50 rounded-2xl max-w-3xl mx-auto">
              <p className="text-xl text-red-900 font-semibold">
                "예약금을 받으면 손님이 줄어들까봐,
                <br />또 안 받자니 피해가 너무 커요. 정말 답이 없습니다..."
              </p>
              <p className="text-sm text-red-700 mt-4">
                - 금남로 중국집 사장님
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 섹션 3: 솔루션 - 좌우 분할 */}
      <section className="min-h-screen flex items-center justify-center bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <FadeIn>
              <div>
                <span className="inline-block px-3 py-1 bg-primary-green/10 text-primary-green text-sm font-semibold rounded-full mb-6">
                  AI Solution
                </span>
                <h2 className="text-5xl font-bold mb-6 text-text-primary">
                  AI가
                  <br />
                  자동으로 해결합니다
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  복잡한 설정 없이, 어려운 기술 없이
                  <br />
                  올사람이 소상공인을 위한 약속을 지켜나갑니다
                </p>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-green/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-primary-green" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1 text-text-primary">
                        사기 예약 위험도 알림
                      </h3>
                      <p className="text-gray-600">
                        AI가 예약 패턴을 분석해 의심스러운 예약을 사전에
                        사장님께 알려드립니다
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-green/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-primary-green" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1 text-text-primary">
                        예약 리마인드 자동 전송
                      </h3>
                      <p className="text-gray-600">
                        예약 시간 전에 고객에게 자동 메시지를 발송해 노쇼 발생을
                        크게 줄입니다.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-green/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-primary-green" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1 text-text-primary">
                        예약금 0원 시스템
                      </h3>
                      <p className="text-gray-600">
                        카드 등록만으로 예약 완료, 실제 노쇼 시에만 자동
                        청구됩니다
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="relative">
                {/* 폰 목업 */}
                <Motion.div
                  className="relative mx-auto"
                  style={{ width: "320px" }}
                  animate={{ y: [0, -20, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                >
                  <div className="bg-slate-900 rounded-[3rem] p-3 shadow-2xl">
                    <div className="bg-white rounded-[2.5rem] overflow-hidden">
                      <div className="aspect-[9/19.5] bg-gradient-to-br from-emerald-50 to-slate-50 p-6">
                        {/* 대시보드 내용 */}
                        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
                          <div className="text-xs text-gray-500 mb-3">
                            실시간 대시보드
                          </div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs">오늘 예약</span>
                            <span className="text-2xl font-bold">12건</span>
                          </div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs">노쇼율</span>
                            <span className="text-2xl font-bold text-primary-green">
                              3%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <Motion.div
                              className="h-full bg-primary-green"
                              initial={{ width: 0 }}
                              animate={{ width: "97%" }}
                              transition={{ duration: 1.5, delay: 0.5 }}
                            />
                          </div>
                        </div>

                        <div className="bg-white rounded-xl shadow p-3 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-primary-green/10"></div>
                            <div>
                              <div className="text-xs font-semibold">
                                김민수님
                              </div>
                              <div className="text-xs text-gray-500">
                                예약 확정
                              </div>
                            </div>
                            <div className="ml-auto">
                              <span className="text-xs bg-primary-green/10 text-primary-green px-2 py-1 rounded">
                                신뢰
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* AI 탐지 알림 */}
                        <Motion.div
                          className="bg-red-50 border border-red-200 rounded-lg p-3"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1, duration: 0.3 }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="text-red-600 text-xl">🚨</div>
                            <div>
                              <div className="text-xs font-semibold text-red-900">
                                사기 의심 차단
                              </div>
                              <div className="text-xs text-red-700">
                                AI가 자동 처리
                              </div>
                            </div>
                          </div>
                        </Motion.div>
                      </div>
                    </div>
                  </div>
                </Motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 섹션 4: 핵심 기능 - 4열 카드 */}
      <section
        id="features"
        className="py-32 bg-gradient-to-br from-slate-50 to-white"
      >
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-20">
              <h2 className="text-5xl font-bold mb-6 text-text-primary">
                올사람의 핵심 기능
              </h2>
              <p className="text-xl text-gray-600">
                소상공인과 고객 모두를 위한 혁신적인 솔루션
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[
              {
                icon: <Shield className="w-8 h-8" />,
                title: "AI 사기 예약 위험도 알림",
                description:
                  "AI 분석으로 의심 예약을 미리 안내해 안전한 운영을 지원합니다.",
                delay: 0,
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "예약 리마인드 자동 전송",
                description:
                  "고객에게 자동 안내 메시지를 발송해 노쇼를 예방합니다.",
                delay: 0.1,
              },
              {
                icon: <CheckCircle className="w-8 h-8" />,
                title: "예약금 0원",
                description: "카드 등록만으로 예약 완료, 노쇼 시에만 자동 청구",
                delay: 0.2,
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "신뢰 리워드",
                description: "예약 이행 시 포인트 적립, 신뢰 등급별 혜택 제공",
                delay: 0.3,
              },
            ].map((feature, i) => (
              <FadeIn key={i} delay={feature.delay}>
                <Motion.div
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="h-full"
                >
                  <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-slate-200">
                    <div className="p-6">
                      <div className="w-16 h-16 rounded-xl bg-primary-green/10 flex items-center justify-center text-primary-green mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold text-text-primary mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </Card>
                </Motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 섹션 5: 성과 */}
      <section
        ref={performanceRef}
        className="py-32 bg-primary-green text-white"
      >
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-5xl font-bold mb-6">올사람이 만들어갈 변화</h2>
            <p className="text-xl opacity-90 mb-20">
              소상공인을 위하는 노쇼방지 플랫폼 올사람이 가져올 기대 효과 입니다{" "}
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <FadeIn delay={0.2}>
              <div>
                <div className="text-6xl font-bold mb-4">{reduction}%↓</div>
                <div className="text-lg opacity-90">예상 노쇼율 감소</div>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div>
                <div className="text-6xl font-bold mb-4">{detectionRate}%</div>
                <div className="text-lg opacity-90">
                  AI위험도 분석 목표 정확도
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.6}>
              <div>
                <div className="text-6xl font-bold mb-4">
                  {storeCount.toLocaleString()}+
                </div>
                <div className="text-lg opacity-90">
                  예상 누적 이용 매장/사용자 수
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 섹션 6: 최종 CTA */}
      <section className="py-32 bg-gradient-to-br from-emerald-50 to-lime-50">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-5xl font-bold mb-6 text-text-primary">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              설치 없이 바로 사용할 수 있습니다. 사장님께 필요한 기능만 간단하게
              담았습니다.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="text-lg px-12 h-16 bg-primary-green hover:bg-dark-green text-white"
                onClick={() => {
                  localStorage.clear();
                  navigate("/auth/login");
                }}
              >
                무료로 시작하기 →
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-12 h-16 border-2 border-primary-green text-primary-green hover:bg-primary-green/10"
              >
                상담 문의하기
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={0.5}>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div>✓ 설치 없이 바로 사용 가능</div>
              <div>✓ 복잡한 설정 필요 없음</div>
              <div>✓ 언제든 해지 가능 </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">올사람</h3>
          <p className="text-slate-400 mb-6">약속을 지키는 사람들</p>
          <div className="text-sm text-slate-500">
            © 2025 올사람. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
