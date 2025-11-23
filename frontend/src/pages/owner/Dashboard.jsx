import { Link } from "react-router-dom";
import {
  Calendar,
  AlertTriangle,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import StatCard from "../../components/StatCard";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  // 🔥 로그인된 사장님 ID
  const ownerId = user?.ownerId;

  const [todayReservations, setTodayReservations] = useState([]);

  // ------------------------------------------------------
  // 🔥 오늘 예약 불러오기 + 30초마다 자동 새로고침
  // ------------------------------------------------------
  useEffect(() => {
    if (!ownerId) return;

    const fetchReservations = () => {
      axios
        .get(`http://localhost:8080/api/owners/${ownerId}/reservations`)
        .then((res) => {
          // 오늘 날짜 기준 필터링
          const today = new Date().toISOString().slice(0, 10);

          const mapped = res.data
            .filter((r) => r.reservationTime.startsWith(today))
            .map((item) => ({
              id: item.id,
              customerName: item.customerName || "고객",
              trustLevel: "단골",
              stars: 3,
              time: item.reservationTime.substring(11, 16),
              partySize: item.people,
              status: item.status === "CONFIRMED" ? "confirmed" : "pending",
              menu: item.menu || "메뉴 정보 없음",
              paymentStatus: item.paymentStatus,
            }));

          setTodayReservations(mapped);
        })
        .catch((err) => console.error("예약 데이터를 불러오는 중 오류:", err));
    };

    // 초기 로드
    fetchReservations();

    // 30초마다 자동 새로고침
    const interval = setInterval(fetchReservations, 30 * 1000);

    return () => clearInterval(interval);
  }, [ownerId]);

  // ⭐ 신뢰등급 색상
  const trustLevelColors = {
    단골: "text-yellow-500",
    우수: "text-primary-green",
    새싹: "text-light-green",
  };

  // ⭐ 통계 카드는 UI 유지
  const stats = [
    {
      icon: <Calendar />,
      title: "오늘 예약",
      value: `${todayReservations.length}건`,
      change: "+12% 전일 대비",
      changeType: "positive",
    },
    {
      icon: <AlertTriangle />,
      title: "이번 달 노쇼율",
      value: "3.2%",
      change: "-2.1% 전월 대비",
      changeType: "positive",
    },
    {
      icon: <DollarSign />,
      title: "이번 달 예상 매출",
      value: "₩8.2M",
      change: "+15.3% 전월 대비",
      changeType: "positive",
    },
    {
      icon: <Users />,
      title: "신뢰 고객 비율",
      value: "78%",
      change: "+5% 전월 대비",
      changeType: "positive",
    },
  ];

  // ------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userType="owner" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* 환영 메시지 */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-text-primary">
            안녕하세요, {user?.name || "사장님"}님
          </h2>
          <p className="text-text-secondary">
            오늘도 노쇼 걱정 없는 하루 되세요!
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 오늘의 예약 */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-text-primary flex items-center">
                    <Calendar className="mr-2 text-primary-green" size={24} />
                    오늘의 예약
                  </h2>

                  {/* 🔥 전체보기 버튼 — 예약관리 페이지와 데이터 공유됨 */}
                  <Link to="/owner/reservations">
                    <Button size="sm" variant="outline">
                      전체보기
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {todayReservations.length === 0 ? (
                    <p className="text-center text-text-secondary">
                      오늘 예약 내역이 아직 없습니다.
                    </p>
                  ) : (
                    todayReservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className="border border-border-color rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-bold text-text-primary text-lg">
                                {reservation.customerName}
                              </span>
                              <span
                                className={`text-sm ${
                                  trustLevelColors[reservation.trustLevel]
                                }`}
                              >
                                {reservation.trustLevel}{" "}
                                {"⭐".repeat(reservation.stars)}
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
                            {reservation.status === "confirmed" ? (
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
                            <div className="mt-2">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  reservation.paymentStatus === "PAID"
                                    ? "bg-green-100 text-green-700"
                                    : reservation.paymentStatus === "PENDING"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : reservation.paymentStatus === "REFUND"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-gray-200 text-gray-700"
                                }`}
                              >
                                결제 상태:{" "}
                                {reservation.paymentStatus || "UNPAID"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* 우측 패널 */}
          <div className="space-y-6">
            <Card>
              <div className="p-6">
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

                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-bold text-text-primary mb-4">
                  이번 주 성과
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-secondary">
                        신뢰 고객 비율
                      </span>
                      <span className="font-semibold text-primary-green">
                        78%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-green h-2 rounded-full"
                        style={{ width: "78%" }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-secondary">예약 달성률</span>
                      <span className="font-semibold text-primary-purple">
                        92%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-purple h-2 rounded-full"
                        style={{ width: "92%" }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-secondary">노쇼 방지율</span>
                      <span className="font-semibold text-dark-green">
                        96.8%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-dark-green h-2 rounded-full"
                        style={{ width: "96.8%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
