/**
 * AI 음성 예약 페이지
 *
 * 음성으로 예약을 생성하는 기능
 * - 음성 녹음 시뮬레이션
 * - AI 음성 인식 및 분석
 * - 예약 정보 자동 추출
 * - 수정 및 확정
 */

import { useState, useEffect } from 'react';
import {
  Mic,
  Square,
  RotateCcw,
  Check,
  MapPin,
  Calendar,
  Clock,
  Users,
  Utensils,
  Edit2,
  Lightbulb
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

const VoiceReservation = () => {
  const [voiceState, setVoiceState] = useState('idle'); // idle, recording, processing, result
  const [parsedData, setParsedData] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [waveAnimation, setWaveAnimation] = useState([]);

  // 더미 음성 입력
  const mockVoiceInput = "신라면옥에 오늘 저녁 7시 4명 예약하고 짜장면 2개 주문해줘";

  // 더미 파싱 결과
  const mockParsedReservation = {
    restaurant: {
      name: "신라면옥",
      location: "홍대점",
      confidence: 95
    },
    date: "2025-11-05",
    dateText: "오늘",
    time: "19:00",
    timeText: "저녁 7시",
    partySize: 4,
    preOrders: [
      {
        menu: "짜장면",
        quantity: 2,
        price: 8000,
        totalPrice: 16000
      }
    ],
    totalAmount: 16000
  };

  // 음성 파형 애니메이션
  useEffect(() => {
    if (voiceState === 'recording') {
      const interval = setInterval(() => {
        setWaveAnimation(Array.from({ length: 20 }, () => Math.random() * 100));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [voiceState]);

  // 음성 녹음 시작
  const handleStartRecording = () => {
    setVoiceState('recording');
    setToast({ show: true, message: '음성 녹음을 시작합니다...', type: 'info' });

    // 5초 후 자동 종료
    setTimeout(() => {
      handleStopRecording();
    }, 5000);
  };

  // 음성 녹음 중지
  const handleStopRecording = () => {
    setVoiceState('processing');
    setToast({ show: true, message: 'AI가 음성을 분석하고 있습니다...', type: 'info' });

    // 3초 처리 후 결과
    setTimeout(() => {
      setVoiceState('result');
      setParsedData(mockParsedReservation);
      setToast({ show: true, message: '음성 인식 완료!', type: 'success' });
    }, 3000);
  };

  // 다시 녹음
  const handleRetry = () => {
    setVoiceState('idle');
    setParsedData(null);
    setWaveAnimation([]);
  };

  // 예약 완료
  const handleConfirmReservation = () => {
    setToast({ show: true, message: '예약이 완료되었습니다! 🎉', type: 'success' });
    setTimeout(() => {
      handleRetry();
    }, 2000);
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
            <Mic className="mr-3 text-primary-purple" size={32} />
            음성 예약
          </h1>
          <p className="text-text-secondary">
            말씀만 하시면 예약이 완료됩니다!
          </p>
        </div>

        {/* 대기 상태 */}
        {voiceState === 'idle' && (
          <>
            <Card className="mb-8">
              <div className="text-center py-12">
                <div className="mb-8">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary-green to-primary-purple rounded-full flex items-center justify-center animate-pulse">
                    <Mic className="text-white" size={64} />
                  </div>
                </div>

                <Button
                  className="py-4 px-8 text-lg"
                  onClick={handleStartRecording}
                >
                  <Mic size={24} className="mr-2" />
                  음성 녹음 시작하기
                </Button>
              </div>
            </Card>

            {/* 음성 예약 팁 */}
            <Card className="bg-light-green bg-opacity-10">
              <h3 className="font-bold text-text-primary mb-4 flex items-center">
                <Lightbulb className="mr-2 text-primary-green" size={24} />
                💡 음성 예약 팁:
              </h3>
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-text-primary font-semibold mb-2">
                  "신라면옥에 오늘 저녁 7시 4명 예약하고 짜장면 2개 주문해줘"
                </p>
                <p className="text-sm text-text-secondary">
                  이렇게 한 번에 말씀해주세요!
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-text-primary mb-2">📋 예약 예시:</h4>
                <div className="space-y-2 text-sm">
                  <div className="bg-white rounded-lg p-3">
                    <span className="font-semibold text-primary-green">1️⃣</span> "홍대 중국집에 내일 점심 12시 2명 예약"
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <span className="font-semibold text-primary-green">2️⃣</span> "강남역 근처 일식집 이번 주 금요일 저녁 7시 4명"
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <span className="font-semibold text-primary-green">3️⃣</span> "이태원 카페 오후 3시 혼자"
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* 녹음 중 상태 */}
        {voiceState === 'recording' && (
          <Card>
            <div className="text-center py-12">
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center animate-pulse">
                  <Mic className="text-white" size={64} />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-text-primary mb-4">
                🎤 듣고 있습니다...
              </h2>

              {/* 음성 파형 애니메이션 */}
              <div className="flex items-center justify-center space-x-1 h-32 mb-8">
                {waveAnimation.map((height, index) => (
                  <div
                    key={index}
                    className="w-2 bg-gradient-to-t from-primary-green to-primary-purple rounded-full transition-all duration-100"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={handleStopRecording}
              >
                <Square size={20} className="mr-2" />
                녹음 중지
              </Button>
            </div>
          </Card>
        )}

        {/* 처리 중 상태 */}
        {voiceState === 'processing' && (
          <Card>
            <div className="text-center py-12">
              <div className="mb-8">
                <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-primary-purple mx-auto"></div>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                AI가 음성을 분석하고 있습니다...
              </h2>
              <p className="text-text-secondary">
                잠시만 기다려주세요 (약 3초 소요)
              </p>
            </div>
          </Card>
        )}

        {/* 결과 상태 */}
        {voiceState === 'result' && parsedData && (
          <>
            <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-primary-green">
              <div className="flex items-center mb-4">
                <Check className="mr-2 text-primary-green" size={24} />
                <h2 className="text-xl font-bold text-text-primary">✅ 음성 인식 완료!</h2>
              </div>

              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-text-secondary mb-2">📝 인식된 내용:</p>
                <p className="text-lg font-semibold text-text-primary">
                  "{mockVoiceInput}"
                </p>
              </div>
            </Card>

            <Card className="mb-6">
              <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center">
                <Mic className="mr-2 text-primary-purple" size={24} />
                🤖 AI 분석 결과:
              </h2>

              <div className="space-y-4">
                {/* 예약 정보 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-text-primary flex items-center">
                      <Check className="mr-2 text-primary-green" size={20} />
                      ✅ 예약 정보:
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {/* 가게 */}
                    <div className="border border-border-color rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <MapPin className="text-primary-green" size={20} />
                          <div>
                            <p className="text-sm text-text-secondary">가게</p>
                            <p className="font-bold text-text-primary text-lg">
                              {parsedData.restaurant.name} ({parsedData.restaurant.location})
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Edit2 size={16} className="mr-1" />
                          수정
                        </Button>
                      </div>
                    </div>

                    {/* 날짜 */}
                    <div className="border border-border-color rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Calendar className="text-primary-green" size={20} />
                          <div>
                            <p className="text-sm text-text-secondary">날짜</p>
                            <p className="font-bold text-text-primary text-lg">
                              {formatDate(parsedData.date)} ({parsedData.dateText})
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Edit2 size={16} className="mr-1" />
                          수정
                        </Button>
                      </div>
                    </div>

                    {/* 시간 */}
                    <div className="border border-border-color rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Clock className="text-primary-green" size={20} />
                          <div>
                            <p className="text-sm text-text-secondary">시간</p>
                            <p className="font-bold text-text-primary text-lg">
                              {formatTime(parsedData.time)} ({parsedData.timeText})
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Edit2 size={16} className="mr-1" />
                          수정
                        </Button>
                      </div>
                    </div>

                    {/* 인원 */}
                    <div className="border border-border-color rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Users className="text-primary-green" size={20} />
                          <div>
                            <p className="text-sm text-text-secondary">인원</p>
                            <p className="font-bold text-text-primary text-lg">
                              {parsedData.partySize}명
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Edit2 size={16} className="mr-1" />
                          수정
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 사전 주문 */}
                {parsedData.preOrders.length > 0 && (
                  <div className="border-t border-border-color pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-text-primary flex items-center">
                        <Check className="mr-2 text-primary-green" size={20} />
                        ✅ 사전 주문:
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {parsedData.preOrders.map((order, index) => (
                        <div
                          key={index}
                          className="border border-border-color rounded-lg p-4 bg-light-green bg-opacity-10"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Utensils className="text-primary-green" size={20} />
                              <div>
                                <p className="font-bold text-text-primary">
                                  {order.menu} {order.quantity}개
                                </p>
                                <p className="text-sm text-text-secondary">
                                  개당 {order.price.toLocaleString()}원
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary-green text-lg">
                                {order.totalPrice.toLocaleString()}원
                              </p>
                              <div className="flex items-center space-x-1 mt-1">
                                <Button size="sm" variant="outline">
                                  <Edit2 size={14} className="mr-1" />
                                  수정
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 bg-white rounded-lg p-4 border border-primary-green">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-text-primary">예상 총액:</span>
                        <span className="font-bold text-2xl text-primary-green">
                          {parsedData.totalAmount.toLocaleString()}원
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mt-2 flex items-center">
                        <span className="mr-1">💡</span>
                        현장에서 추가 주문 가능합니다
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* 버튼 */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleRetry}
              >
                <RotateCcw size={20} className="mr-2" />
                다시 녹음하기
              </Button>
              <Button
                className="flex-1 py-4 text-lg"
                onClick={handleConfirmReservation}
              >
                <Check size={24} className="mr-2" />
                수정 완료 후 예약하기
              </Button>
            </div>
          </>
        )}
      </div>

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

export default VoiceReservation;
