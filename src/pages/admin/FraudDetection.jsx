import { useCallback, useEffect, useMemo, useState } from 'react';
import { ShieldAlert, AlertTriangle, Ban, RefreshCcw } from 'lucide-react';
import { Breadcrumb } from '../../components/ui/breadcrumb.jsx';
import { StatCard } from '../../components/admin/StatCard.jsx';
import { FilterBar } from '../../components/admin/FilterBar.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Drawer } from '../../components/ui/drawer.jsx';
import { Progress } from '../../components/ui/progress.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Textarea } from '../../components/ui/textarea.jsx';
import { Tooltip } from '../../components/ui/tooltip.jsx';
import { useToast } from '../../components/ui/toast.jsx';
import { getReservationDetail, getSuspiciousReservations, updateDecision } from '../../mocks/admin.js';

const riskBadgeStyles = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-orange-100 text-orange-700',
  low: 'bg-yellow-100 text-yellow-700',
};

const statusMap = {
  under_review: { label: '검토중', className: 'bg-blue-100 text-blue-700' },
  blocked: { label: '차단', className: 'bg-red-100 text-red-700' },
  allowed: { label: '허용', className: 'bg-green-100 text-green-700' },
  waitlist: { label: '대기자 연결', className: 'bg-purple-100 text-purple-700' },
};

const columns = [
  {
    key: 'id',
    header: '예약 ID',
    render: (row) => <span className="font-mono text-xs text-slate-700">{row.id}</span>,
  },
  {
    key: 'customer',
    header: '고객',
  },
  {
    key: 'datetime',
    header: '일시',
  },
  {
    key: 'partySize',
    header: '인원',
    render: (row) => `${row.partySize}명`,
  },
  {
    key: 'channel',
    header: '채널',
    render: (row) => {
      const channels = { app: '앱', phone: '전화', web: '웹' };
      return channels[row.channel] ?? row.channel;
    },
  },
  {
    key: 'riskLevel',
    header: '위험도',
    render: (row) => (
      <Badge className={riskBadgeStyles[row.riskLevel] ?? ''}>
        {row.riskLevel === 'high' ? '높음' : row.riskLevel === 'medium' ? '중간' : '낮음'}
      </Badge>
    ),
  },
  {
    key: 'signals',
    header: '신호',
    render: (row) => (
      <div className="flex flex-wrap gap-1">
        {row.signals.map((signal) => (
          <Badge key={signal} variant="secondary" className="bg-slate-100 text-slate-700">
            {signal}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    key: 'status',
    header: '상태',
    render: (row) => {
      const status = statusMap[row.status] ?? { label: row.status, className: '' };
      return <Badge className={status.className}>{status.label}</Badge>;
    },
  },
];

function AdminFraudDetection() {
  const [timeRange, setTimeRange] = useState('today');
  const [riskLevel, setRiskLevel] = useState('all');
  const [channel, setChannel] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    suspiciousToday: 0,
    highRiskRatio: 0,
    blockedCount: 0,
    retryCount: 0,
  });
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [memo, setMemo] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSuspiciousReservations({
        timeRange,
        riskLevel,
        channel,
        keyword,
      });
      setData(response.data);
      setStats(response.stats);
    } catch (error) {
      toast({
        title: '데이터 조회 실패',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [timeRange, riskLevel, channel, keyword, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!selectedId) return;
    setDetailLoading(true);
    getReservationDetail(selectedId)
      .then((result) => {
        setDetail(result);
        setMemo(result.notes ?? '');
      })
      .catch((error) => {
        toast({
          title: '상세 정보를 불러오지 못했습니다',
          description: error.message,
          variant: 'destructive',
        });
      })
      .finally(() => setDetailLoading(false));
  }, [selectedId, toast]);

  const handleDecision = async (decision) => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      const updated = await updateDecision(selectedId, decision, memo);
      setData((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      toast({
        title: '처리 완료',
        description:
          decision === 'block'
            ? '해당 예약을 차단했습니다.'
            : decision === 'allow'
            ? '예약을 허용했습니다.'
            : '대기자에게 연결했습니다.',
      });
      setDetail(updated);
    } catch (error) {
      toast({
        title: '처리 실패',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const resetFilters = () => {
    setTimeRange('today');
    setRiskLevel('all');
    setChannel('all');
    setKeyword('');
  };

  const tableColumns = useMemo(
    () => [
      ...columns,
      {
        key: 'actions',
        header: '자세히',
        render: (row) => (
          <Button size="sm" variant="outline" onClick={() => setSelectedId(row.id)}>
            상세보기
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold text-[#0066CC]">올사람 관리자</h1>
          <Breadcrumb
            items={[
              { label: 'Admin', href: '/admin' },
              { label: 'AI 노쇼 사기 의심 탐지' },
            ]}
          />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="오늘 의심 감지"
            value={`${stats.suspiciousToday}건`}
            description="실시간 감지 기준"
            icon={<ShieldAlert className="h-5 w-5 text-[#0066CC]" />}
          />
          <StatCard
            title="고위험 비율"
            value={`${stats.highRiskRatio}%`}
            description="전체 의심 대비"
            icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
          />
          <StatCard
            title="차단 완료"
            value={`${stats.blockedCount}건`}
            description="지난 24시간"
            icon={<Ban className="h-5 w-5 text-red-500" />}
          />
          <StatCard
            title="재시도 감지"
            value={`${stats.retryCount}건`}
            description="결제 재시도 포함"
            icon={<RefreshCcw className="h-5 w-5 text-slate-500" />}
          />
        </div>

        <FilterBar
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          riskLevel={riskLevel}
          onRiskLevelChange={setRiskLevel}
          channel={channel}
          onChannelChange={setChannel}
          keyword={keyword}
          onKeywordChange={setKeyword}
          onReset={resetFilters}
        />

        <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">의심 예약 리스트</h2>
              <p className="text-sm text-slate-500">
                필터 조건에 따라 AI가 탐지한 의심 예약 목록입니다.
              </p>
            </div>
            <Tooltip content="목록을 새로고침합니다">
              <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                새로고침
              </Button>
            </Tooltip>
          </div>
          {loading ? (
            <div className="flex h-32 items-center justify-center text-slate-500">
              데이터를 불러오는 중입니다...
            </div>
          ) : (
            <DataTable columns={tableColumns} data={data} />
          )}
        </div>
      </main>

      <Drawer
        open={Boolean(selectedId)}
        onClose={() => {
          setSelectedId(null);
          setDetail(null);
          setMemo('');
        }}
        title={selectedId}
        description="AI 의심 예약 상세 정보"
      >
        {detailLoading && (
          <div className="py-10 text-center text-sm text-slate-500">
            상세 정보를 불러오는 중입니다...
          </div>
        )}

        {!detailLoading && detail && (
          <div className="space-y-6">
            <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">AI 점수</p>
                  <p className="text-2xl font-semibold text-slate-900">{detail.score}점</p>
                </div>
                <Badge className={riskBadgeStyles[detail.riskLevel] ?? ''}>
                  {detail.riskLevel === 'high'
                    ? '높음'
                    : detail.riskLevel === 'medium'
                    ? '중간'
                    : '낮음'}
                </Badge>
              </div>
              <Progress value={detail.score} className="mt-4" />
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold text-slate-800">트리거 신호</h3>
              <ul className="space-y-2">
                {detail.triggers.map((trigger) => (
                  <li
                    key={trigger}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  >
                    {trigger}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold text-slate-800">과거 이력</h3>
              <div className="space-y-3 border-l-2 border-slate-200 pl-4">
                {detail.history.map((item) => (
                  <div key={`${item.date}-${item.event}`}>
                    <p className="text-xs text-slate-500">{item.date}</p>
                    <p className="text-sm text-slate-700">{item.event}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold text-slate-800">메모</h3>
              <Textarea
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
                placeholder="처리 메모를 입력하세요."
              />
            </section>

            <section className="flex flex-col gap-2 border-t pt-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  className="flex-1 bg-[#EF4444] hover:bg-[#dc2626]"
                  onClick={() => handleDecision('block')}
                  disabled={actionLoading}
                >
                  차단
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => handleDecision('allow')}
                  disabled={actionLoading}
                >
                  허용
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => handleDecision('waitlist')}
                disabled={actionLoading}
              >
                대기자 연결
              </Button>
            </section>
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default AdminFraudDetection;

