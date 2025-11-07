import { useEffect, useState } from 'react';
import { Breadcrumb } from '../../components/ui/breadcrumb.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Switch } from '../../components/ui/switch.jsx';
import { Checkbox } from '../../components/ui/checkbox.jsx';
import { Select } from '../../components/ui/select.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { useToast } from '../../components/ui/toast.jsx';
import { getSettlementHistory, getZeroDepositSettings, saveZeroDepositSettings } from '../../mocks/admin.js';
import { formatCurrency } from '../../lib/utils.js';
import { CalendarCheck, Wallet, ArrowRight, Shield } from 'lucide-react';

const policyCheckboxes = [
  { key: 'requireVerification', label: '본인 인증 필수' },
  { key: 'preventDuplicate', label: '중복 예약 제한' },
  { key: 'sameDayLimit', label: '당일 예약 제한' },
];

const cancellationOptions = [
  { value: '24h', label: '이용 24시간 전까지 무료 취소' },
  { value: '6h', label: '이용 6시간 전까지 무료 취소' },
  { value: 'same_day', label: '당일 취소 불가' },
];

const historyColumns = [
  { key: 'orderId', header: '주문 ID' },
  { key: 'reservationId', header: '예약 ID' },
  { key: 'customer', header: '고객' },
  { key: 'visitDate', header: '이용일' },
  {
    key: 'amount',
    header: '확정 금액',
    render: (row) => formatCurrency(row.amount),
  },
  { key: 'method', header: '수단' },
  {
    key: 'status',
    header: '상태',
    render: (row) => (
      <Badge
        className={
          row.status === '완료'
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }
      >
        {row.status}
      </Badge>
    ),
  },
  { key: 'processedAt', header: '처리 시각' },
];

function AdminZeroDeposit() {
  const [settings, setSettings] = useState({
    enabled: false,
    requireVerification: false,
    preventDuplicate: false,
    sameDayLimit: false,
    cancellationWindow: '24h',
    penaltyEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const { toast } = useToast();

  useEffect(() => {
    getZeroDepositSettings()
      .then((result) => setSettings(result))
      .catch((error) =>
        toast({
          title: '정책 정보를 불러오지 못했습니다',
          description: error.message,
          variant: 'destructive',
        })
      )
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    setHistoryLoading(true);
    getSettlementHistory(page, pageSize)
      .then((result) => {
        setHistory(result.data);
        setHistoryTotal(result.total);
      })
      .catch((error) =>
        toast({
          title: '정산 이력을 불러오지 못했습니다',
          description: error.message,
          variant: 'destructive',
        })
      )
      .finally(() => setHistoryLoading(false));
  }, [page, toast]);

  const handleSave = () => {
    setSaving(true);
    saveZeroDepositSettings(settings)
      .then(() =>
        toast({
          title: '저장이 완료되었습니다',
          description: '예약금 0원 정책이 업데이트되었습니다.',
        })
      )
      .catch((error) =>
        toast({
          title: '저장에 실패했습니다',
          description: error.message,
          variant: 'destructive',
        })
      )
      .finally(() => setSaving(false));
  };

  const totalPages = Math.ceil(historyTotal / pageSize);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold text-[#0066CC]">올사람 관리자</h1>
          <Breadcrumb
            items={[
              { label: 'Admin', href: '/admin' },
              { label: '예약금 0원 결제 시스템' },
            ]}
          />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>예약금 0원 정책</CardTitle>
              <p className="text-sm text-slate-500">
                고객 편의를 높이되 노쇼 리스크를 최소화하도록 정책을 설정하세요.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">예약금 0원 활성화</span>
                <Switch
                  checked={settings.enabled}
                  onChange={(checked) => setSettings((prev) => ({ ...prev, enabled: checked }))}
                  disabled={loading}
                />
              </div>

              <div className="space-y-3">
                {policyCheckboxes.map((checkbox) => (
                  <label key={checkbox.key} className="flex items-center gap-3 text-sm text-slate-700">
                    <Checkbox
                      checked={settings[checkbox.key]}
                      onChange={(checked) =>
                        setSettings((prev) => ({ ...prev, [checkbox.key]: checked }))
                      }
                      disabled={loading}
                    />
                    {checkbox.label}
                  </label>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="cancellationWindow">
                  취소 정책
                </label>
                <Select
                  id="cancellationWindow"
                  value={settings.cancellationWindow}
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, cancellationWindow: event.target.value }))
                  }
                  disabled={loading}
                >
                  {cancellationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">노쇼 페널티 자동 연동</span>
                <Switch
                  checked={settings.penaltyEnabled}
                  onChange={(checked) =>
                    setSettings((prev) => ({ ...prev, penaltyEnabled: checked }))
                  }
                  disabled={loading}
                />
              </div>

              <Button className="w-full" onClick={handleSave} disabled={saving || loading}>
                {saving ? '저장 중...' : '저장'}
              </Button>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>결제 · 정산 흐름</CardTitle>
              <p className="text-sm text-slate-500">
                예약부터 정산까지 0원 정책이 적용되는 시나리오입니다.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <CalendarCheck className="h-8 w-8 text-[#0066CC]" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">예약 접수</p>
                    <p className="text-xs text-slate-500">0원으로 예약을 생성하고 인증을 진행합니다.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ArrowRight className="h-6 w-6 text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">이용 완료</p>
                    <p className="text-xs text-slate-500">매장 이용 완료 후 실제 이용 금액을 확정합니다.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary-green" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">노쇼 감시</p>
                    <p className="text-xs text-slate-500">페널티 연동 시, 노쇼 고객을 자동 차단합니다.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Wallet className="h-8 w-8 text-slate-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">차액 정산</p>
                    <p className="text-xs text-slate-500">최종 이용 금액으로 정산하고 정산 이력에 반영합니다.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>최근 정산 이력</CardTitle>
            <p className="text-sm text-slate-500">예약금 0원 정책과 연결된 정산 내역입니다.</p>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex h-32 items-center justify-center text-sm text-slate-500">
                데이터를 불러오는 중입니다...
              </div>
            ) : (
              <DataTable columns={historyColumns} data={history} />
            )}

            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>
                총 {historyTotal}건 중 {(page - 1) * pageSize + 1}-
                {Math.min(page * pageSize, historyTotal)} 표시
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  이전
                </Button>
                <span className="text-slate-600">
                  {page} / {Math.max(totalPages, 1)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages || totalPages === 0}
                >
                  다음
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default AdminZeroDeposit;
