import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Calendar,
  Clock,
  Users,
  MessageSquare,
  MapPin,
  LogOut,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { reservationAPI } from "../../services/reservations";

/* -------------------------------------------------------------
   예약 상태 뱃지 (대시보드 스타일 적용)
------------------------------------------------------------- */
const getStatusBadge = (status) => {
  if (!status)
    return {
      label: "상태 미정",
      className: "text-slate-700 font-semibold",
    };

  const s = status.toUpperCase();

  switch (s) {
    case "CONFIRMED":
      return {
        label: "확정",
        className: "text-green-700 font-semibold flex items-center gap-1",
        icon: <CheckCircle2 className="w-4 h-4" />,
      };

    case "CANCELLED":
      return {
        label: "취소",
        className: "text-rose-700 font-semibold flex items-center gap-1",
        icon: <XCircle className="w-4 h-4" />,
      };

    case "PENDING":
    case "WAITING":
      return {
        label: "대기중",
        className: "text-blue-700 font-semibold",
      };

    default:
      return {
        label: status,
        className: "text-slate-600 font-semibold",
      };
  }
};

/* -------------------------------------------------------------
   결제 상태 뱃지 (대시보드 스타일로 변경)
------------------------------------------------------------- */
const getPaymentBadge = (paymentStatus) => {
  if (!paymentStatus) return null;

  const status = paymentStatus.toUpperCase();

  switch (status) {
    case "PAID":
      return {
        label: "결제 상태: PAID",
        className:
          "bg-green-100 text-green-700 px-2 py-1 rounded-md text-sm font-medium",
      };

    case "UNPAID":
      return {
        label: "미결제",
        className:
          "bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-sm font-medium",
      };

    case "PENDING":
      return {
        label: "결제 대기",
        className:
          "bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-sm font-medium",
      };

    case "REFUND":
    case "REFUNDED":
      return {
        label: "환불 완료",
        className:
          "bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-sm font-medium",
      };

    default:
      return {
        label: paymentStatus,
        className:
          "bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-sm font-medium",
      };
  }
};

/* -------------------------------------------------------------
   날짜/시간 포맷
------------------------------------------------------------- */
const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDateKey = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
};

/* -------------------------------------------------------------
   메인 컴포넌트
------------------------------------------------------------- */
function Reservations() {
  const { user, logout } = useAuth();
  const ownerId = user?.ownerId;

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  const [activeTab, setActiveTab] = useState("all");

  /* ---------------- 예약 불러오기 ---------------- */
  useEffect(() => {
    if (!ownerId) {
      setReservations([]);
      setError("사장님 정보를 확인할 수 없습니다.");
      setLoading(false);
      return;
    }

    let alive = true;

    const load = async () => {
      setLoading(true);

      try {
        const data = await reservationAPI.getOwnerReservations(ownerId);

        if (!alive) return;

        setReservations(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "예약 정보를 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [ownerId]);

  /* ---------------- 예약 상태 변경 ---------------- */
  const handleReservationAction = async (reservationId, updates) => {
    if (!reservationId) return;

    setActionLoadingId(reservationId);

    try {
      const updated = await reservationAPI.updateReservationStatus(
        reservationId,
        updates
      );

      setReservations((prev) =>
        prev.map((r) =>
          r.id === reservationId
            ? {
                ...r,
                status: updated.status,
                paymentStatus: updated.paymentStatus,
              }
            : r
        )
      );
    } catch (err) {
      alert(err?.message || "예약 상태 변경 실패");
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ---------------- 날짜별 분류 ---------------- */
  const categorized = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return reservations.reduce(
      (acc, r) => {
        const d = new Date(r.reservationTime);

        if ((r.status || "").toLowerCase().includes("cancel")) {
          acc.cancelled.push(r);
        } else if (d < start) {
          acc.past.push(r);
        } else if (d > end) {
          acc.upcoming.push(r);
        } else {
          acc.today.push(r);
        }

        return acc;
      },
      { today: [], upcoming: [], past: [], cancelled: [] }
    );
  }, [reservations]);

  const filterByDate = (items) => {
    if (!selectedDate) return items;
    return items.filter((r) => getDateKey(r.reservationTime) === selectedDate);
  };

  const groupByBusiness = (items) => {
    const result = items.reduce((acc, r) => {
      const key = r.businessId ?? "unknown";

      if (!acc[key]) {
        acc[key] = {
          businessId: r.businessId,
          businessName: r.businessName || "미등록 사업장",
          businessAddress: r.businessAddress || "",
          reservations: [],
        };
      }

      acc[key].reservations.push(r);
      return acc;
    }, {});

    return Object.values(result);
  };

  /* ---------------- 예약 카드 렌더 ---------------- */
  const renderReservations = (items, emptyMessage) => {
    const filtered = filterByDate(items);

    if (loading)
      return (
        <div className="text-center py-12 text-slate-500">
          예약 데이터를 불러오는 중입니다...
        </div>
      );

    if (error)
      return <div className="text-center py-12 text-rose-500">{error}</div>;

    if (!filtered.length)
      return (
        <div className="text-center py-12 text-slate-500">{emptyMessage}</div>
      );

    const grouped = groupByBusiness(filtered);

    return grouped.map((g) => (
      <div
        key={g.businessId}
        className="bg-white rounded-3xl shadow-md border border-emerald-100 overflow-hidden"
      >
        {/* 상단 가게 정보 */}
        <div className="px-6 py-5 bg-emerald-50 border-b border-emerald-100 flex justify-between">
          <div>
            <h3 className="text-2xl font-semibold">{g.businessName}</h3>
            {g.businessAddress && (
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {g.businessAddress}
              </p>
            )}
          </div>
          <Badge variant="secondary">{g.reservations.length}건</Badge>
        </div>

        {/* 예약 목록 카드 */}
        <div className="p-6 space-y-4">
          {g.reservations.map((r) => {
            const statusBadge =
              activeTab === "upcoming"
                ? {
                    label: "예정",
                    className: "text-blue-700 font-semibold",
                  }
                : getStatusBadge(r.status);

            const paymentBadge = getPaymentBadge(r.paymentStatus);

            const isConfirmed = r.status?.toUpperCase() === "CONFIRMED";
            const isCancelled = r.status?.toUpperCase() === "CANCELLED";

            return (
              <div
                key={r.id}
                className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm hover:shadow-lg transition"
              >
                {/* 기본 정보 */}
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-xl font-semibold">
                      {r.customerName ?? `회원 ${r.memberId}`}
                    </h4>
                    <p className="text-sm text-slate-500">
                      {formatDate(r.reservationTime)} ·{" "}
                      {formatTime(r.reservationTime)}
                    </p>
                  </div>

                  <div className="flex gap-2 items-center">
                    <div className={statusBadge.className}>
                      {statusBadge.icon}
                      {statusBadge.label}
                    </div>
                    {paymentBadge && (
                      <div className={paymentBadge.className}>
                        {paymentBadge.label}
                      </div>
                    )}
                  </div>
                </div>

                {/* 상세 정보 */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-emerald-100 p-3 rounded-xl flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500">예약 날짜</p>
                      <p className="font-semibold">
                        {formatDate(r.reservationTime)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-100 p-3 rounded-xl flex items-center gap-3">
                    <Clock className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500">예약 시간</p>
                      <p className="font-semibold">
                        {formatTime(r.reservationTime)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-100 p-3 rounded-xl flex items-center gap-3">
                    <Users className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500">고객 이름</p>
                      <p className="font-semibold">
                        {r.customerName ?? "미등록 고객"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 버튼 영역 */}
                {!isConfirmed && !isCancelled && (
                  <div className="flex justify-end gap-3 mt-6">
                    <Button
                      className="bg-emerald-600 text-white min-w-[110px] h-10 rounded-full flex items-center justify-center"
                      disabled={actionLoadingId === r.id}
                      onClick={() =>
                        handleReservationAction(r.id, { status: "CONFIRMED" })
                      }
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      체크 완료
                    </Button>

                    <Button
                      variant="outline"
                      className="text-rose-600 border-rose-400 min-w-[110px] h-10 rounded-full"
                      disabled={actionLoadingId === r.id}
                      onClick={() =>
                        handleReservationAction(r.id, {
                          status: "CANCELLED",
                          paymentStatus: "REFUND",
                        })
                      }
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      예약 취소
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ));
  };

  /* ---------------- 렌더 ---------------- */
  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-12">
            <Link to="/" className="text-2xl font-bold">
              올사람
            </Link>
            <nav className="hidden md:flex gap-10">
              <Link to="/owner/dashboard">대시보드</Link>
              <Link
                to="/owner/reservations"
                className="font-semibold border-b-2 border-blue-600 pb-[26px]"
              >
                예약 관리
              </Link>
              <Link to="/owner/fraud-detection">사기 탐지</Link>
              <Link to="/owner/menu-ocr">메뉴 관리</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost">
              <MessageSquare className="w-5 h-5 mr-2" />
              알림
            </Button>
            <Button variant="ghost">{user?.name || "내 매장"}</Button>
            <Button variant="outline" onClick={logout}>
              <LogOut className="w-5 h-5 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="container mx-auto px-8 py-10">
        <div className="flex justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold">예약 관리</h2>
            <p className="text-lg text-slate-600">
              전체 예약 현황을 확인하고 날짜별로 빠르게 조회하세요.
            </p>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex gap-3 items-center">
              <Calendar className="w-4 h-4" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border px-3 py-2 rounded-md"
              />
            </div>
            <Button variant="ghost" onClick={() => setSelectedDate("")}>
              필터 초기화
            </Button>
          </div>
        </div>

        {/* 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="border h-12 bg-white">
            <TabsTrigger value="all">
              전체 ({filterByDate(reservations).length}건)
            </TabsTrigger>
            <TabsTrigger value="today">
              오늘 ({filterByDate(categorized.today).length}건)
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              예정 ({filterByDate(categorized.upcoming).length}건)
            </TabsTrigger>
            <TabsTrigger value="past">
              지난 예약 ({filterByDate(categorized.past).length}건)
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              취소 ({filterByDate(categorized.cancelled).length}건)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-8 space-y-6">
            {renderReservations(reservations, "등록된 예약이 없습니다.")}
          </TabsContent>

          <TabsContent value="today" className="mt-8 space-y-6">
            {renderReservations(categorized.today, "오늘 예약이 없습니다.")}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-8 space-y-6">
            {renderReservations(
              categorized.upcoming,
              "예정된 예약이 없습니다."
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-8 space-y-6">
            {renderReservations(categorized.past, "지난 예약이 없습니다.")}
          </TabsContent>

          <TabsContent value="cancelled" className="mt-8 space-y-6">
            {renderReservations(
              categorized.cancelled,
              "취소된 예약이 없습니다."
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default Reservations;
