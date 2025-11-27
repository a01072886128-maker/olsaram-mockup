import { Link } from "react-router-dom";
import {
  Calendar,
  AlertTriangle,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import StatCard from "../../components/StatCard";
import Card from "../../components/Card";
import Button from "../../components/Button";
import PageLayout from "../../components/Layout";
import { useAuth } from "../../contexts/AuthContext";
import { reservationAPI } from "../../services/reservations";

const Dashboard = () => {
  const { user } = useAuth();

  // 🔥 로그인된 사장님 ID
  const ownerId = user?.ownerId;

  const [reservations, setReservations] = useState([]);
  const [todayReservations, setTodayReservations] = useState([]);
  const [noShowRates, setNoShowRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!ownerId) return;
    try {
      setLoading(true);
      setError(null);
      const [resv, noShow] = await Promise.all([
        reservationAPI.getOwnerReservations(ownerId),
        reservationAPI.getOwnerNoShowRates(ownerId).catch(() => []),
      ]);

      const todayKey = new Date().toISOString().slice(0, 10);
      const mappedToday = resv
        .filter((r) => r.reservationTime?.startsWith(todayKey))
        .map((item) => ({
          id: item.id,
          customerName: item.customerName || "고객",
          trustLevel: item.trustLevel || "일반",
          stars: item.rating || 3,
          time: item.reservationTime?.substring(11, 16) || "-",
          partySize: item.people,
          status: item.status?.toUpperCase() === "CONFIRMED" ? "confirmed" : "pending",
          menu: item.menu || "메뉴 정보 없음",
          paymentStatus: item.paymentStatus || "UNPAID",
        }));

      setReservations(resv || []);
      setTodayReservations(mappedToday);
      setNoShowRates(noShow || []);
    } catch (err) {
      console.error("대시보드 데이터 불러오기 오류:", err);
      setError("데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ⭐ 신뢰등급 색상
  const trustLevelColors = {
    단골: "text-yellow-500",
    우수: "text-primary-green",
    새싹: "text-light-green",
  };

  // ⭐ 통계 카드는 UI 유지
  const stats = useMemo(() => {
    const confirmedCount = reservations.filter((r) => r.status?.toUpperCase() === "CONFIRMED").length;
    const pendingCount = reservations.filter((r) => r.status?.toUpperCase() === "PENDING").length;
    const cancelledCount = reservations.filter((r) => r.status?.toUpperCase() === "CANCELLED").length;

    const now = new Date();
    const in7days = new Date();
    in7days.setDate(now.getDate() + 7);
    const upcoming7 = reservations.filter((r) => {
      const t = r.reservationTime ? new Date(r.reservationTime) : null;
      if (!t || Number.isNaN(t.getTime())) return false;
      return t >= now && t <= in7days;
    }).length;

    const noShowPct = Number(noShowRates[0]?.noShowPercentage) || 0;
    const visitRate = Math.max(0, 100 - (noShowPct || 0));

    return [
      {
        icon: <Calendar />,
        title: "오늘 예약",
        value: `${todayReservations.length}건`,
        change: `확정 ${confirmedCount} · 대기 ${pendingCount}`,
        changeType: "neutral",
      },
      {
        icon: <AlertTriangle />,
        title: "최근 노쇼율",
        value: `${noShowPct.toFixed(1)}%`,
        change: `예상 방문율 ${visitRate.toFixed(1)}%`,
        changeType: "neutral",
      },
      {
        icon: <Users />,
        title: "7일 내 예정",
        value: `${upcoming7}건`,
        change: `취소 ${cancelledCount}`,
        changeType: "neutral",
      },
      {
        icon: <Clock />,
        title: "전체 예약",
        value: `${reservations.length}건`,
        change: `진행 중 ${reservations.length - cancelledCount}건`,
        changeType: "neutral",
      },
    ];
  }, [reservations, todayReservations.length, noShowRates]);

  // ------------------------------------------------------

  if (!ownerId) {
    return (
      <PageLayout userType="owner">
        <p className="text-center text-slate-500 py-12">로그인 후 이용해주세요.</p>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout userType="owner">
        <div className="flex items-center justify-center py-12 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          대시보드 로딩 중...
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout userType="owner">
        <p className="text-center text-red-500 py-12">{error}</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout userType="owner">
      <div className="space-y-10">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-text-primary">
            안녕하세요, {user?.name || "사장님"}님
          </h2>
          <p className="text-text-secondary">
            오늘 예약과 노쇼/취소 현황을 실시간으로 확인하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="p-6">
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
                                  trustLevelColors[reservation.trustLevel] || "text-slate-500"
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

                          <div className="text-right">
                            {reservation.status === "confirmed" ? (
                              <div className="flex items-center justify-end text-primary-green text-sm font-semibold">
                                <CheckCircle size={16} className="mr-1" />
                                확정
                              </div>
                            ) : (
                              <div className="flex items-center justify-end text-yellow-600 text-sm font-semibold">
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
                                결제 상태: {reservation.paymentStatus || "UNPAID"}
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

          <div className="space-y-6">
            <Card>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-text-primary">
                    노쇼/취소 현황
                  </h3>
                  <Link to="/owner/reservations">
                    <Button size="sm" variant="outline">자세히</Button>
                  </Link>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>최근 노쇼율</span>
                    <span className="font-semibold text-primary-green">
                      {(noShowRates[0]?.noShowPercentage ?? 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>취소 건수</span>
                    <span className="font-semibold text-slate-900">
                      {reservations.filter((r) => r.status?.toUpperCase() === "CANCELLED").length}건
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 space-y-6">
                <h3 className="text-lg font-bold text-text-primary">빠른 액션</h3>
                <div className="flex flex-col gap-5">
                  <Link to="/owner/reservations" className="block">
                    <button className="w-full bg-primary-green hover:bg-dark-green text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                      <Calendar className="mr-2" size={20} />
                      예약 관리로 이동
                    </button>
                  </Link>
                  <Link to="/owner/menu-ocr" className="block">
                    <button className="w-full bg-primary-purple hover:bg-dark-purple text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                      메뉴 등록 (OCR)
                    </button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
