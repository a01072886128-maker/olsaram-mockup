import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Calendar,
  Clock,
  Users,
  MessageSquare,
  MapPin,
  LogOut,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { reservationAPI } from '../../services/reservations';

const getStatusBadge = (status) => {
  const normalized = (status || '').toLowerCase();

  if (normalized.includes('confirm')) {
    return {
      label: '확정',
      className: 'bg-green-50 text-green-700 border-green-200',
    };
  }

  if (normalized.includes('cancel')) {
    return {
      label: '취소',
      className: 'bg-rose-50 text-rose-700 border-rose-200',
    };
  }

  if (normalized.includes('wait') || normalized.includes('pending')) {
    return {
      label: '대기중',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }

  return {
    label: status || '상태 미정',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  };
};

const getPaymentBadge = (paymentStatus) => {
  if (!paymentStatus) {
    return null;
  }

  const normalized = paymentStatus.toLowerCase();

  if (normalized.includes('paid') || normalized.includes('complete')) {
    return {
      label: '결제 완료',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }

  if (normalized.includes('pending')) {
    return {
      label: '결제 대기',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }

  if (normalized.includes('fail')) {
    return {
      label: '결제 실패',
      className: 'bg-rose-50 text-rose-700 border-rose-200',
    };
  }

  return {
    label: paymentStatus,
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  };
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const formatTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getDateKey = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function Reservations() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (!user?.ownerId) {
      setReservations([]);
      setError('사장님 정보를 확인할 수 없습니다. 다시 로그인 해주세요.');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchReservations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await reservationAPI.getOwnerReservations(user.ownerId);
        if (!isMounted) return;
        setReservations(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message || '예약 정보를 불러오지 못했습니다.');
        setReservations([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchReservations();

    return () => {
      isMounted = false;
    };
  }, [user?.ownerId]);

  const handleReservationAction = async (reservationId, updates) => {
    if (!reservationId) {
      return;
    }

    setActionLoadingId(reservationId);
    try {
      const updated = await reservationAPI.updateReservationStatus(reservationId, updates);
      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === reservationId
            ? {
                ...reservation,
                status: updated.status,
                paymentStatus: updated.paymentStatus,
              }
            : reservation
        )
      );
    } catch (err) {
      console.error(err);
      alert(err?.message || '예약 상태를 변경하지 못했습니다.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const categorizedReservations = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    return reservations.reduce(
      (acc, reservation) => {
        const reservationDate = reservation?.reservationTime
          ? new Date(reservation.reservationTime)
          : null;
        const status = (reservation?.status || '').toLowerCase();
        const isCancelled = status.includes('cancel');

        if (isCancelled) {
          acc.cancelled.push(reservation);
          return acc;
        }

        if (!reservationDate || Number.isNaN(reservationDate.getTime())) {
          acc.upcoming.push(reservation);
          return acc;
        }

        if (reservationDate < startOfToday) {
          acc.past.push(reservation);
        } else if (reservationDate > endOfToday) {
          acc.upcoming.push(reservation);
        } else {
          acc.today.push(reservation);
        }

        return acc;
      },
      { today: [], upcoming: [], past: [], cancelled: [] }
    );
  }, [reservations]);

  const todayReservations = categorizedReservations.today;
  const upcomingReservations = categorizedReservations.upcoming;
  const pastReservations = categorizedReservations.past;
  const cancelledReservations = categorizedReservations.cancelled;
  const allReservations = reservations;
  const [activeTab, setActiveTab] = useState('all');

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const filterBySelectedDate = (items) => {
    if (!selectedDate) {
      return items;
    }

    return items.filter((reservation) => {
      const dateKey = getDateKey(reservation.reservationTime);
      return dateKey === selectedDate;
    });
  };

  const groupByBusiness = (items) => {
    const grouped = items.reduce((acc, reservation) => {
      const businessKey = reservation.businessId ?? 'unknown';
      if (!acc[businessKey]) {
        acc[businessKey] = {
          businessId: reservation.businessId,
          businessName: reservation.businessName || '미등록 사업장',
          businessAddress: reservation.businessAddress || '',
          reservations: [],
        };
      }
      acc[businessKey].reservations.push(reservation);
      return acc;
    }, {});

    return Object.values(grouped);
  };

  const getFilteredCount = (items) => filterBySelectedDate(items).length;
  const allCount = getFilteredCount(allReservations);
  const todayCount = getFilteredCount(todayReservations);
  const upcomingCount = getFilteredCount(upcomingReservations);
  const pastCount = getFilteredCount(pastReservations);
  const cancelledCount = getFilteredCount(cancelledReservations);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const clearDateFilter = () => {
    setSelectedDate('');
  };

  const renderReservations = (items, emptyMessage) => {
    const filteredItems = filterBySelectedDate(items);

    if (loading) {
      return (
        <div className="text-center text-slate-500 py-12">
          예약 데이터를 불러오는 중입니다...
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-rose-500 py-12">
          {error}
        </div>
      );
    }

    if (!filteredItems.length) {
      return (
        <div className="text-center text-slate-500 py-12">
          {emptyMessage}
        </div>
      );
    }

    const grouped = groupByBusiness(filteredItems);

    return grouped.map((group) => (
      <div
        key={group.businessId ?? group.businessName}
        className="bg-white border border-emerald-100 rounded-3xl shadow-md overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-emerald-100/70 bg-emerald-50/70 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">사업장</p>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-2xl font-semibold text-slate-900">{group.businessName}</h3>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {group.reservations.length}건
              </Badge>
            </div>
            {group.businessAddress ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{group.businessAddress}</span>
              </div>
            ) : (
              <p className="text-sm text-slate-400 mt-1">등록된 주소가 없습니다.</p>
            )}
          </div>
          <div className="text-sm text-slate-500 md:text-right">
            <p>현재 필터에 해당하는 예약</p>
            <p className="text-base font-semibold text-slate-900">
              {group.reservations.length.toLocaleString()}건
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4 bg-gradient-to-b from-emerald-50/50 to-white">
          {group.reservations.map((reservation, index) => {
            const statusBadge = getStatusBadge(reservation.status);
            const paymentBadge = getPaymentBadge(reservation.paymentStatus);
            const isConfirmed = (reservation.status || '').toLowerCase().includes('confirm');
            const isCancelled = (reservation.status || '').toLowerCase().includes('cancel');

            return (
              <div
                key={reservation.id ?? `${group.businessId}-${index}`}
                className="p-6 space-y-5 bg-white rounded-2xl border border-emerald-100 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest">
                      <span>예약 #{reservation.id ?? '-'}</span>
                    </div>
                    <h4 className="text-2xl font-semibold text-slate-900">
                      {reservation.customerName ?? `회원 ${reservation.memberId ?? '-'}`}
                    </h4>
                    <p className="text-sm text-slate-500">
                      {formatDate(reservation.reservationTime)} · {formatTime(reservation.reservationTime)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${statusBadge.className} text-sm px-3 py-1`}>
                      {statusBadge.label}
                    </Badge>
                    {paymentBadge && (
                      <Badge
                        variant="outline"
                        className={`${paymentBadge.className} text-sm px-3 py-1`}
                      >
                        {paymentBadge.label}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/70">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">예약 날짜</p>
                      <p className="font-semibold text-slate-900">
                        {formatDate(reservation.reservationTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/70">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">예약 시간</p>
                      <p className="font-semibold text-slate-900">
                        {formatTime(reservation.reservationTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/70">
                    <Users className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">고객 이름</p>
                      <p className="font-semibold text-slate-900">
                        {reservation.customerName ?? '미등록 고객'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  {reservation.paymentStatus && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                      결제: <span className="font-semibold text-slate-900">{paymentBadge?.label || reservation.paymentStatus}</span>
                    </span>
                  )}
                </div>

                {!isConfirmed && !isCancelled && (
                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-base h-11 sm:flex-1 sm:max-w-xs"
                      disabled={actionLoadingId === reservation.id}
                      onClick={() =>
                        handleReservationAction(reservation.id, {
                          status: 'CONFIRMED',
                        })
                      }
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      체크 완료
                    </Button>
                    <Button
                      variant="outline"
                      className="border-rose-300 text-rose-600 hover:bg-rose-50 text-base h-11 sm:flex-1 sm:max-w-xs"
                      disabled={actionLoadingId === reservation.id}
                      onClick={() =>
                        handleReservationAction(reservation.id, {
                          status: 'CANCELLED',
                          paymentStatus: 'REFUNDED',
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link
              to="/"
              className="text-2xl font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
            >
              올사람
            </Link>
            <nav className="hidden md:flex gap-10">
              <Link
                to="/owner/dashboard"
                className="text-base text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                대시보드
              </Link>
              <Link
                to="/owner/reservations"
                className="text-base text-slate-900 font-semibold border-b-2 border-blue-600 pb-[26px] cursor-pointer"
              >
                예약 관리
              </Link>
              <Link
                to="/owner/fraud-detection"
                className="text-base text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                사기 탐지
              </Link>
              <Link
                to="/owner/menu-ocr"
                className="text-base text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                메뉴 관리
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-slate-700 text-base">
              <MessageSquare className="w-5 h-5 mr-2" />
              알림
            </Button>
            <Button variant="ghost" className="text-base">
              {user?.name || '내 매장'}
            </Button>
            <Button variant="outline" className="text-base" onClick={handleLogout}>
              <LogOut className="w-5 h-5 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 py-10">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">예약 관리</h2>
            <p className="text-lg text-slate-600">
              전체 예약 현황을 확인하고 날짜별로 빠르게 조회하세요.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end md:translate-y-20">
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                예약 날짜 선택
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="border border-slate-300 rounded-md px-3 py-2 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="h-10 flex items-center justify-end">
              <Button
                variant="ghost"
                className={`text-sm text-slate-600 transition-opacity duration-200 ${
                  selectedDate ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={clearDateFilter}
              >
                필터 초기화
              </Button>
            </div>
            <p className="text-xs text-slate-500 text-right">
              {selectedDate ? `${selectedDate} 기준으로 필터링 중입니다.` : '필터가 적용되지 않았습니다.'}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-white border h-12">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 text-base px-6"
            >
              전체 ({allCount}건)
            </TabsTrigger>
            <TabsTrigger
              value="today"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 text-base px-6"
            >
              오늘 ({todayCount}건)
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 text-base px-6"
            >
              예정 ({upcomingCount}건)
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 text-base px-6"
            >
              지난 예약 ({pastCount}건)
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 text-base px-6"
            >
              취소 내역 ({cancelledCount}건)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-8 space-y-6">
            {renderReservations(allReservations, '등록된 예약이 없습니다.')}
          </TabsContent>
          <TabsContent value="today" className="mt-8 space-y-6">
            {renderReservations(todayReservations, '오늘 예약이 없습니다.')}
          </TabsContent>
          <TabsContent value="upcoming" className="mt-8 space-y-6">
            {renderReservations(upcomingReservations, '예정된 예약이 없습니다.')}
          </TabsContent>
          <TabsContent value="past" className="mt-8 space-y-6">
            {renderReservations(pastReservations, '지난 예약 기록이 없습니다.')}
          </TabsContent>
          <TabsContent value="cancelled" className="mt-8 space-y-6">
            {renderReservations(cancelledReservations, '취소된 예약이 없습니다.')}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default Reservations;
