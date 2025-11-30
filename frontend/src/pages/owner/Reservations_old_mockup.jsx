import { useEffect, useMemo, useState, useCallback } from "react";
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
  MapPin,
  CheckCircle2,
  XCircle,
  Shield,
  Phone,
  Star,
  UserX,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { reservationAPI } from "../../services/reservations";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";

/* -------------------------------------------------------------
   노쇼 위험도 계산 로직
------------------------------------------------------------- */

const calculateRiskScore = (customerData, reservation) => {
  let score = 100;

  if (!customerData) return score;

  const noshowCount = customerData.noShowCount || 0;
  const noshowPenalty = Math.min(noshowCount * 15, 50);
  score -= noshowPenalty;

  const totalReservations = customerData.reservationCount || 0;
  if (totalReservations > 0) {
    const noshowRate = noshowCount / totalReservations;
    if (noshowRate > 0.5) score -= 20;
    else if (noshowRate > 0.3) score -= 15;
    else if (noshowRate > 0.1) score -= 10;
  }

  const lastMinuteCancels = customerData.lastMinuteCancels || 0;
  if (lastMinuteCancels >= 3) score -= 15;
  else if (lastMinuteCancels >= 2) score -= 10;
  else if (lastMinuteCancels >= 1) score -= 5;

  const hasPrepaid = reservation?.paymentStatus === "PAID";
  if (hasPrepaid) {
    score += 10;
  } else {
    score -= 5;
  }

  const accountAgeDays = customerData.accountAgeDays || 0;
  if (accountAgeDays < 7 && totalReservations === 0) {
    score -= 10;
  }

  const partySize = reservation?.people || 0;
  if (partySize >= 8 && totalReservations === 0) {
    score -= 10;
  }

  if (noshowCount === 0 && totalReservations >= 10) {
    score += 15;
  } else if (noshowCount === 0 && totalReservations >= 5) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
};

const getRiskLevel = (score) => {
  if (score >= 70) {
    return {
      level: "SAFE",
      colorCode: "#10B981",
      label: "안전",
    };
  } else if (score >= 40) {
    return {
      level: "CAUTION",
      colorCode: "#F59E0B",
      label: "주의",
    };
  } else {
    return {
      level: "DANGER",
      colorCode: "#EF4444",
      label: "위험",
    };
  }
};

const analyzeSuspiciousPatterns = (customerData, reservation) => {
  const patterns = [];

  if (!customerData) return patterns;

  const noshowCount = customerData.noShowCount || 0;
  const totalReservations = customerData.reservationCount || 0;
  const lastMinuteCancels = customerData.lastMinuteCancels || 0;
  const accountAgeDays = customerData.accountAgeDays || 0;
  const partySize = reservation?.people || 0;

  if (noshowCount > 0) {
    patterns.push(`타 가게 노쇼 이력 ${noshowCount}회 발견`);
  }

  if (accountAgeDays < 7) {
    patterns.push(`가입 ${accountAgeDays}일차 신규 고객`);
  }

  if (totalReservations === 0) {
    patterns.push("예약 이력 없음 (첫 예약)");
  }

  if (lastMinuteCancels > 0) {
    patterns.push(`최근 직전 취소 ${lastMinuteCancels}회`);
  }

  if (partySize >= 8 && totalReservations === 0) {
    patterns.push(`첫 예약인데 ${partySize}인 대규모 예약`);
  }

  if (totalReservations > 0) {
    const noshowRate = noshowCount / totalReservations;
    if (noshowRate > 0.3) {
      patterns.push(`노쇼 비율 ${(noshowRate * 100).toFixed(0)}%로 높음`);
    }
  }

  return patterns;
};

const getAutoActions = (riskLevel, reservation) => {
  const actions = [];
  const hasPrepaid = reservation?.paymentStatus === "PAID";

  if (hasPrepaid) {
    const depositAmount = reservation?.depositAmount || 5000;
    actions.push(`예약금 ${depositAmount.toLocaleString()}원 선결제 완료`);
  }

  if (riskLevel === "DANGER") {
    actions.push("신분증 인증 요청 발송됨");
    actions.push("예약 1시간 전 재확인 알림 예약됨");
  }

  return actions;
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
   결제 상태 뱃지
------------------------------------------------------------- */
const getPaymentBadge = (paymentStatus) => {
  if (!paymentStatus) return null;
  const status = paymentStatus.toUpperCase();

  switch (status) {
    case "PAID":
      return {
        label: "💳 결제상태: PAID",
        className: "bg-emerald-50 text-emerald-700 px-3 py-1 rounded text-sm font-medium",
      };
    case "UNPAID":
      return {
        label: "미결제",
        className: "bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm font-medium",
      };
    case "PENDING":
      return {
        label: "결제 대기",
        className: "bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm font-medium",
      };
    case "REFUND":
    case "REFUNDED":
      return {
        label: "환불 완료",
        className: "bg-purple-50 text-purple-700 px-3 py-1 rounded text-sm font-medium",
      };
    default:
      return {
        label: paymentStatus,
        className: "bg-gray-50 text-gray-600 px-3 py-1 rounded text-sm font-medium",
      };
  }
};

/* -------------------------------------------------------------
   요약 통계 컴포넌트
------------------------------------------------------------- */
const RiskSummary = ({ reservations, customerDataMap }) => {
  const summary = useMemo(() => {
    let safe = 0,
      caution = 0,
      danger = 0;

    reservations.forEach((r) => {
      const customerData = customerDataMap[r.memberId] || {};
      const score = calculateRiskScore(customerData, r);
      const level = getRiskLevel(score).level;

      if (level === "SAFE") safe++;
      else if (level === "CAUTION") caution++;
      else danger++;
    });

    return { total: reservations.length, safe, caution, danger };
  }, [reservations, customerDataMap]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📊 오늘 예약 요약
      </h3>
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{summary.total}건</div>
          <div className="text-sm text-gray-500 mt-1">총 예약</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: "#10B981" }}>
            🟢 {summary.safe}건
          </div>
          <div className="text-sm text-gray-500 mt-1">안전</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: "#F59E0B" }}>
            🟡 {summary.caution}건
          </div>
          <div className="text-sm text-gray-500 mt-1">주의</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: "#EF4444" }}>
            🔴 {summary.danger}건
          </div>
          <div className="text-sm text-gray-500 mt-1">위험</div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   예약 카드 컴포넌트 (미니멀 디자인)
------------------------------------------------------------- */
const ReservationCard = ({
  reservation,
  customerData,
  onAction,
  actionLoadingId,
}) => {
  const [expanded, setExpanded] = useState(false);

  const riskScore = calculateRiskScore(customerData, reservation);
  const risk = getRiskLevel(riskScore);
  const patterns = analyzeSuspiciousPatterns(customerData, reservation);

  const paymentBadge = getPaymentBadge(reservation.paymentStatus);

  const isConfirmed = reservation.status?.toUpperCase() === "CONFIRMED";
  const isCancelled = reservation.status?.toUpperCase() === "CANCELLED";
  const isVIP = riskScore >= 90;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 신호등 아이콘 (작고 깔끔하게) */}
          <div
            className={`w-3 h-3 rounded-full ${risk.level === "DANGER" ? "animate-pulse-subtle" : ""}`}
            style={{ backgroundColor: risk.colorCode }}
          />

          {/* 고객 이름 */}
          <span className="text-lg font-medium text-gray-900">
            {reservation.customerName ?? `회원 ${reservation.memberId}`}
          </span>

          {/* VIP 뱃지 */}
          {isVIP && (
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded flex items-center gap-1">
              <Star className="w-3 h-3" /> VIP
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {paymentBadge && (
            <span className={paymentBadge.className}>{paymentBadge.label}</span>
          )}
          <button
            className="text-gray-400 hover:text-gray-600 text-sm"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            [펼치기 {expanded ? "▲" : "▼"}]
          </button>
        </div>
      </div>

      {/* 예약 정보 한 줄 (항상 보임) */}
      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {formatDate(reservation.reservationTime)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {formatTime(reservation.reservationTime)}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {reservation.people || 0}명
        </span>
        <span style={{ color: risk.colorCode }} className="font-medium">
          위험도: {riskScore}점
        </span>
      </div>

      {/* 상세 정보 (펼쳤을 때만) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-gray-100">
              {/* 가게 정보 */}
              {reservation.businessName && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{reservation.businessName}</span>
                  {reservation.businessAddress && (
                    <span className="text-gray-400">- {reservation.businessAddress}</span>
                  )}
                </div>
              )}

              {/* 고객 이력 정보 */}
              {customerData && (
                <div className="mb-3 p-3 bg-gray-50 rounded">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" /> 고객 이력
                  </h4>
                  <div className="grid grid-cols-4 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <UserX className="w-4 h-4 text-red-500" />
                      <span>노쇼: {customerData.noShowCount || 0}회</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>방문: {customerData.reservationCount || 0}회</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span>신뢰점수: {customerData.trustScore || 100}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>가입: {customerData.accountAgeDays || 0}일차</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 위험 요소 (위험/주의 등급만) */}
              {risk.level !== "SAFE" && patterns.length > 0 && (
                <div className="mb-3 p-3 bg-gray-50 rounded">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    {risk.level === "DANGER" ? "🚨 위험 요소" : "⚠️ 주의 요소"}
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {patterns.map((pattern, idx) => (
                      <li key={idx}>{pattern}</li>
                    ))}
                  </ul>
                </div>
              )}


              {/* 액션 버튼 */}
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 bg-blue-500 text-white hover:bg-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `tel:${customerData?.phone || ""}`;
                  }}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  📞 전화하기
                </Button>

                {!isConfirmed && !isCancelled && (
                  <>
                    <Button
                      className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                      disabled={actionLoadingId === reservation.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction(reservation.id, { status: "CONFIRMED" });
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      체크 완료
                    </Button>

                    {risk.level === "DANGER" && (
                      <Button
                        variant="outline"
                        className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                        disabled={actionLoadingId === reservation.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction(reservation.id, {
                            status: "CANCELLED",
                            paymentStatus: "REFUND",
                          });
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        ❌ 예약취소
                      </Button>
                    )}
                  </>
                )}

                <Button
                  variant="outline"
                  className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert("신뢰 고객으로 등록되었습니다.");
                  }}
                >
                  <Star className="w-4 h-4 mr-2" />
                  ⭐ 신뢰고객
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* -------------------------------------------------------------
   메인 컴포넌트
------------------------------------------------------------- */
function Reservations() {
  const { user } = useAuth();
  const ownerId = user?.ownerId;

  const [reservations, setReservations] = useState([]);
  const [customerDataMap, setCustomerDataMap] = useState({});
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

        const reservationList = Array.isArray(data) ? data : [];
        setReservations(reservationList);

        const customerMap = {};
        reservationList.forEach((r) => {
          if (r.memberId && !customerMap[r.memberId]) {
            const randomNoShow = Math.floor(Math.random() * 5);
            const randomReservations = Math.floor(Math.random() * 20);
            const randomDays = Math.floor(Math.random() * 365);

            customerMap[r.memberId] = {
              customerId: r.memberId,
              name: r.customerName,
              phone: r.customerPhone || "010-0000-0000",
              noShowCount: randomNoShow,
              reservationCount: randomReservations,
              lastMinuteCancels: Math.floor(Math.random() * 3),
              accountAgeDays: randomDays,
              trustScore: 100 - randomNoShow * 10,
            };
          }
        });
        setCustomerDataMap(customerMap);
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

  /* ---------------- 시간순 정렬 (위험도 높은 것 우선) ---------------- */
  const sortByTimeAndRisk = useCallback(
    (items) => {
      return [...items].sort((a, b) => {
        // 1차: 시간순
        const timeA = new Date(a.reservationTime).getTime();
        const timeB = new Date(b.reservationTime).getTime();

        if (timeA !== timeB) {
          return timeA - timeB; // 오래된 순 (과거 → 미래)
        }

        // 2차: 같은 시간이면 위험도 높은 순
        const scoreA = calculateRiskScore(customerDataMap[a.memberId], a);
        const scoreB = calculateRiskScore(customerDataMap[b.memberId], b);
        return scoreA - scoreB; // 낮은 점수(위험)가 먼저
      });
    },
    [customerDataMap]
  );

  /* ---------------- 예약 카드 렌더 ---------------- */
  const renderReservations = (items, emptyMessage) => {
    const filtered = filterByDate(items);
    const sorted = sortByTimeAndRisk(filtered);

    if (loading) {
      return (
        <div className="text-center py-12 text-gray-500">
          예약 데이터를 불러오는 중입니다...
        </div>
      );
    }

    if (error) {
      return <div className="text-center py-12 text-red-500">{error}</div>;
    }

    if (!sorted.length) {
      return (
        <div className="text-center py-12 text-gray-500">{emptyMessage}</div>
      );
    }

    return (
      <div>
        <div className="text-sm text-gray-500 mb-4">
          {formatTime(sorted[0]?.reservationTime)}부터 시간순 정렬 ▼
        </div>
        {sorted.map((r) => (
          <ReservationCard
            key={r.id}
            reservation={r}
            customerData={customerDataMap[r.memberId]}
            onAction={handleReservationAction}
            actionLoadingId={actionLoadingId}
          />
        ))}
      </div>
    );
  };

  /* ---------------- 렌더 ---------------- */
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userType="owner" />

      {/* 메인 */}
      <main className="container mx-auto px-8 py-10">
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              예약 관리
              <Badge variant="outline" className="text-sm font-normal">
                노쇼 위험도 통합
              </Badge>
            </h2>
            <p className="text-base text-gray-600 mt-1">
              예약 현황과 노쇼 위험도를 한눈에 확인하세요.
            </p>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex gap-3 items-center">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded-md text-sm"
              />
            </div>
            <Button
              variant="ghost"
              className="mt-1 text-sm text-gray-500"
              onClick={() => setSelectedDate("")}
            >
              필터 초기화
            </Button>
          </div>
        </div>

        {/* 요약 통계 */}
        <RiskSummary
          reservations={filterByDate(reservations)}
          customerDataMap={customerDataMap}
        />

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

          <TabsContent value="all" className="mt-8">
            {renderReservations(reservations, "등록된 예약이 없습니다.")}
          </TabsContent>

          <TabsContent value="today" className="mt-8">
            {renderReservations(categorized.today, "오늘 예약이 없습니다.")}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-8">
            {renderReservations(categorized.upcoming, "예정된 예약이 없습니다.")}
          </TabsContent>

          <TabsContent value="past" className="mt-8">
            {renderReservations(categorized.past, "지난 예약이 없습니다.")}
          </TabsContent>

          <TabsContent value="cancelled" className="mt-8">
            {renderReservations(categorized.cancelled, "취소된 예약이 없습니다.")}
          </TabsContent>
        </Tabs>
      </main>

      {/* 스타일 */}
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s infinite;
        }
      `}</style>
    </div>
  );
}

export default Reservations;
