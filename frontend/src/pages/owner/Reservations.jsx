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
  Zap,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { reservationAPI } from "../../services/reservations";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "../../components/Layout";

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

const formatCurrency = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return "-";
  return `${num.toLocaleString("ko-KR")}원`;
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return "-";
  return `${num.toFixed(2)}%`;
};

const parseRiskPercent = (reservation) => {
  const raw = reservation?.riskPercent ?? reservation?.risk_percent;
  const num = Number(raw);
  if (Number.isNaN(num)) return null;
  return normalizeNoShowPercentage(num);
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
        label: "💳 결제완료",
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
   위험도 색상 코드
------------------------------------------------------------- */
const normalizeScore = (value) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return 100;
  return Math.max(0, Math.min(100, parsed));
};

// 단일 위험도 소스: customerData.trustScore를 100 - trustScore로 계산
const getDerivedRiskPercent = (reservation) => {
  // DB의 customer.trustScore를 우선 사용
  const trust = reservation?.customerData?.trustScore ?? reservation?.trustScore;
  if (trust !== undefined && trust !== null) {
    return normalizeNoShowPercentage(100 - normalizeScore(trust));
  }

  const rawScore = reservation?.riskScore;
  if (rawScore !== undefined && rawScore !== null) {
    const score = normalizeScore(rawScore);
    return normalizeNoShowPercentage(100 - score);
  }

  const parsed = parseRiskPercent(reservation);
  if (parsed !== null) return normalizeNoShowPercentage(parsed);

  return 0;
};

const getReservationTrustScore = (reservation) => {
  if (!reservation) return 100;
  const risk = getDerivedRiskPercent(reservation);
  return normalizeScore(100 - risk);
};

// 위험도 퍼센트 기반으로 레벨 계산
const getRiskLevelFromRiskPercent = (riskPercent) => {
  const normalized = normalizeNoShowPercentage(riskPercent);
  if (normalized <= 30) return "LOW";
  if (normalized <= 50) return "MEDIUM";
  return "HIGH";
};

const normalizeNoShowPercentage = (value) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return 0;
  return Math.max(0, Math.min(100, parsed));
};

const getNoShowRiskLevel = (percentage) => {
  const normalized = normalizeNoShowPercentage(percentage);
  if (normalized <= 30) return "LOW";
  if (normalized <= 50) return "MEDIUM";
  return "HIGH";
};

const getRiskColor = (level) => {
  switch (level) {
    case "LOW":
      return "#10B981"; // 녹색
    case "MEDIUM":
      return "#F59E0B"; // 주황색
    case "HIGH":
      return "#EF4444"; // 빨강색
    default:
      return "#6B7280"; // 회색
  }
};

const getRiskLabel = (level) => {
  switch (level) {
    case "LOW":
      return "안전";
    case "MEDIUM":
      return "주의";
    case "HIGH":
      return "위험";
    default:
      return "알 수 없음";
  }
};

/* -------------------------------------------------------------
   노쇼율 요약 컴포넌트
------------------------------------------------------------- */
const NoShowSummary = ({ noShowRates, loading }) => {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="text-center text-gray-500">노쇼율 통계를 불러오는 중...</div>
      </div>
    );
  }

  if (!noShowRates || noShowRates.length === 0) {
    return null;
  }

  // 첫 번째 가게의 노쇼율 (한 사장님이 여러 가게를 가진 경우 추후 확장)
  const rate = noShowRates[0];
  const noShowPct = normalizeNoShowPercentage(rate.noShowPercentage);
  const completedCount = rate.completedCount ?? 0;
  const totalReservations = rate.totalReservations ?? 0;
  const completedRate = totalReservations
    ? Math.min(100, (completedCount / totalReservations) * 100)
    : 0;
  const visitRate = Math.max(0, 100 - noShowPct);
  const riskLevel = getNoShowRiskLevel(noShowPct);
  const riskColor = getRiskColor(riskLevel);
  const riskLabelText = getRiskLabel(riskLevel);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: riskColor }}
          />
          <h3 className="text-lg font-semibold text-gray-900">
            📊 {rate.businessName ?? "가게"} - 노쇼율 통계
          </h3>
        </div>
        <span
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border"
          style={{ borderColor: riskColor, color: riskColor }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: riskColor }}
          />
          {riskLabelText}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="text-center bg-white rounded-lg p-4">
          <div className="text-4xl font-bold text-red-600">
            {noShowPct.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 mt-1">노쇼율</div>
        </div>
        <div className="text-center bg-white rounded-lg p-4">
          <div className="text-4xl font-bold text-emerald-600">
            {completedRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 mt-1">완료율</div>
        </div>
        <div className="text-center bg-white rounded-lg p-4">
          <div className="text-4xl font-bold text-blue-600">
            {visitRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 mt-1">예상 방문율</div>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-4">
        총 예약 {totalReservations.toLocaleString("ko-KR")}건 기준 · 노쇼율 {noShowPct.toFixed(1)}%은{" "}
        {riskLabelText} 단계(0~30% 안전, 30~50% 주의, 50% 이상 위험)입니다.
      </p>
    </div>
  );
};

/* -------------------------------------------------------------
   예약 카드 컴포넌트
------------------------------------------------------------- */
const ReservationCard = ({
  reservation,
  onAction,
  actionLoadingId,
}) => {
  const [expanded, setExpanded] = useState(false);

  const customerData = reservation.customerData || {};
  const suspiciousPatterns = reservation.suspiciousPatterns || [];
  const autoActions = reservation.autoActions || [];

  // 위험도는 customer.trustScore를 100 - trustScore로 계산한 값으로 통일
  const riskPercentValue = getDerivedRiskPercent(reservation);
  const riskLevel = getRiskLevelFromRiskPercent(riskPercentValue);
  const riskColor = getRiskColor(riskLevel);
  const riskLabelText = getRiskLabel(riskLevel);
  const trustScore = getReservationTrustScore(reservation); // VIP 판단용으로만 사용

  const baseFeeAmount = reservation.baseFeeAmount ?? 0;
  const appliedFeePercent = reservation.appliedFeePercent ?? 0;
  const paymentAmount = reservation.paymentAmount;

  const paymentBadge = getPaymentBadge(reservation.paymentStatus);

  const isConfirmed = reservation.status?.toUpperCase() === "CONFIRMED";
  const isCancelled = reservation.status?.toUpperCase() === "CANCELED";
  const isVIP = trustScore >= 90;

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
          {/* 신호등 아이콘 */}
          <div
            className={`w-3 h-3 rounded-full ${riskLevel === "HIGH" ? "animate-pulse-subtle" : ""}`}
            style={{ backgroundColor: riskColor }}
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
        <span style={{ color: riskColor }} className="font-medium">
          위험도: {(riskPercentValue ?? 0).toFixed(1)}% ({riskLabelText})
        </span>
        {paymentAmount != null && (
          <span className="flex items-center gap-1 text-emerald-700">
            <CreditCard className="w-4 h-4" />
            {formatCurrency(paymentAmount)} ({(riskPercentValue ?? 0).toFixed?.(1)}% → {formatPercent(appliedFeePercent)})
          </span>
        )}
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
              {customerData && customerData.customerId && (
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
                      <span>신뢰점수: {trustScore}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>가입: {customerData.accountAgeDays || 0}일차</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 위험 요소 (위험/주의 등급만) */}
              {riskLevel !== "LOW" && suspiciousPatterns.length > 0 && (
                <div className="mb-3 p-3 bg-gray-50 rounded">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    {riskLevel === "HIGH" ? "🚨 위험 요소" : "⚠️ 주의 요소"}
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {suspiciousPatterns.map((pattern, idx) => (
                      <li key={idx}>{pattern}</li>
                    ))}
                  </ul>
                </div>
              )}

              {paymentAmount != null && (
                <div className="mb-3 p-3 bg-emerald-50 rounded">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> 위험도 기반 예약 수수료
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-emerald-800">
                    <div>기본 금액(1인): {formatCurrency(baseFeeAmount)}</div>
                    <div>위험도: {(riskPercentValue ?? 0).toFixed?.(1)}%</div>
                    <div>적용 수수료율: {formatPercent(appliedFeePercent)}</div>
                    <div>결제 금액: {formatCurrency(paymentAmount)}</div>
                  </div>
                </div>
              )}

              {/* 자동 조치 사항 */}
              {autoActions.length > 0 && (
                <div className="mb-3 p-3 bg-blue-50 rounded">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" /> ⚙️ 자동 조치
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {autoActions.map((action, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex gap-2 pt-2 flex-wrap">
                <Button
                  className="flex-1 bg-blue-500 text-white hover:bg-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `tel:${reservation.customerPhone || ""}`;
                  }}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  전화하기
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
                      예약확정
                    </Button>

                    {riskLevel === "HIGH" && (
                      <Button
                        variant="outline"
                        className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                        disabled={actionLoadingId === reservation.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction(reservation.id, {
                            status: "CANCELED",
                            paymentStatus: "REFUND",
                          });
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        예약취소
                      </Button>
                    )}
                  </>
                )}

                {/* ⭐ 노쇼 처리 버튼 (확정된 예약만) */}
                {isConfirmed && (
                  <>
                    <Button
                      className="flex-1 bg-green-600 text-white hover:bg-green-700"
                      disabled={actionLoadingId === reservation.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("고객이 정상 방문했습니까?")) {
                          onAction(reservation.id, { status: "COMPLETED" });
                        }
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      방문완료
                    </Button>

                    <Button
                      variant="outline"
                      className="flex-1 text-orange-600 border-orange-300 hover:bg-orange-50"
                      disabled={actionLoadingId === reservation.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("고객이 예약 시간에 나타나지 않았습니까? 노쇼로 처리하면 고객의 신뢰도가 감소합니다.")) {
                          onAction(reservation.id, { status: "NO_SHOW" });
                        }
                      }}
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      노쇼처리
                    </Button>
                  </>
                )}
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
  const [noShowRates, setNoShowRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noShowLoading, setNoShowLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  /* ---------------- 예약 불러오기 (위험도 포함 → 실패 시 기본) ---------------- */
  const loadReservations = useCallback(async () => {
    if (!ownerId) {
      setReservations([]);
      setError("사장님 정보를 확인할 수 없습니다.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const data = await reservationAPI.getOwnerReservationsWithRisk(ownerId);
      const reservationList = Array.isArray(data) ? data : [];
      setReservations(reservationList);
    } catch (err) {
      setError(err?.message || "예약 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  /* ---------------- 노쇼율 불러오기 ---------------- */
  useEffect(() => {
    if (!ownerId) {
      setNoShowLoading(false);
      return;
    }

    let alive = true;

    const loadNoShowRates = async () => {
      setNoShowLoading(true);

      try {
        // ⭐ 백엔드에서 노쇼율 조회
        const data = await reservationAPI.getOwnerNoShowRates(ownerId);

        if (!alive) return;

        const rateList = Array.isArray(data) ? data : [];
        setNoShowRates(rateList);
      } catch (err) {
        console.error("노쇼율 조회 실패:", err);
      } finally {
        if (alive) setNoShowLoading(false);
      }
    };

    loadNoShowRates();

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

      // ⭐ 노쇼 또는 완료 처리 시 전체 데이터 새로고침 (통계 업데이트 반영)
      if (updates.status === "NO_SHOW" || updates.status === "COMPLETED") {
        try {
          await loadReservations();
          try {
            const noShowData = await reservationAPI.getOwnerNoShowRates(ownerId);
            setNoShowRates(Array.isArray(noShowData) ? noShowData : []);
          } catch (refreshError) {
            console.error("노쇼율 조회 실패:", refreshError);
          }
        } catch (refreshError) {
          console.error("예약 정보 새로고침 실패:", refreshError);
        }

        if (updates.status === "NO_SHOW") {
          alert("노쇼처리 되었습니다.");
        } else if (updates.status === "COMPLETED") {
          alert("방문완료 처리되었습니다.");
        }
      } else {
        // 일반 상태 변경은 로컬 업데이트만
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
      }
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
          return timeA - timeB;
        }

        // 2차: 위험도 높은 순 (위험도 퍼센트가 높을수록 위험)
        const riskA = getDerivedRiskPercent(a);
        const riskB = getDerivedRiskPercent(b);
        return riskB - riskA; // 내림차순 (위험도 높은 것 먼저)
      });
    },
    []
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
            onAction={handleReservationAction}
            actionLoadingId={actionLoadingId}
          />
        ))}
      </div>
    );
  };

  /* ---------------- 렌더 ---------------- */
  return (
    <PageLayout userType="owner">
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            예약 관리
            <Badge variant="outline" className="text-sm font-normal">
              실시간 노쇼 위험도 분석
            </Badge>
          </h2>
          <p className="text-base text-gray-600 mt-1">
            예약 현황과 노쇼 위험도를 한눈에 확인하세요. (DB 기반 실제 데이터)
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

      <NoShowSummary noShowRates={noShowRates} loading={noShowLoading} />

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

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .animate-pulse-subtle { animation: pulse-subtle 2s infinite; }
      `}</style>
    </PageLayout>
  );
}

export default Reservations;
