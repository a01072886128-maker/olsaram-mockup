import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { AlertTriangle, Shield, TrendingUp, X, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const mockSuspiciousReservations = [
  {
    id: 1,
    name: '010-****-1234',
    riskScore: 95,
    riskLevel: 'high',
    reasons: [
      '공공기관 이름 사칭 의심',
      '단체 예약 후 선결제 요구 패턴',
      '같은 번호로 5곳 동시 예약',
    ],
    partySize: 20,
    requestedDate: '2025-11-10',
    status: 'blocked',
  },
  {
    id: 2,
    name: '이**',
    riskScore: 72,
    riskLevel: 'medium',
    reasons: ['최근 3회 연속 노쇼 이력', '예약 후 30분 내 취소 반복'],
    partySize: 4,
    requestedDate: '2025-11-06',
    status: 'warning',
  },
  {
    id: 3,
    name: '박**',
    riskScore: 45,
    riskLevel: 'low',
    reasons: ['신규 가입자 (가입 3일)', '카드 등록 없음'],
    partySize: 2,
    requestedDate: '2025-11-05',
    status: 'monitoring',
  },
];

const mockStats = {
  blockedThisMonth: 8,
  savedAmount: 1200000,
  detectionRate: 98.5,
  falsePositive: 1.2,
};

const riskStyles = {
  high: {
    container: 'border-red-200 bg-red-50',
    badge: 'bg-red-600 text-white',
  },
  medium: {
    container: 'border-orange-200 bg-orange-50',
    badge: 'bg-kt-warning text-white',
  },
  low: {
    container: 'border-yellow-200 bg-yellow-50',
    badge: 'bg-yellow-500 text-white',
  },
};

const riskLabels = {
  high: '높음',
  medium: '중간',
  low: '낮음',
};

function FraudDetection() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - 프로페셔널 스타일 */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="container mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/" className="text-2xl font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer">
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
                className="text-base text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                예약 관리
              </Link>
              <Link
                to="/owner/fraud-detection"
                className="text-base text-slate-900 font-semibold border-b-2 border-blue-600 pb-[26px] cursor-pointer"
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
            <Button variant="ghost" className="text-base">
              홍대 중국집
            </Button>
            <Button variant="outline" className="text-base" onClick={handleLogout}>
              <LogOut className="w-5 h-5 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* 타이틀 - 이모지 제거 */}
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-slate-900">AI 사기 탐지 시스템</h2>
          <p className="text-slate-600">실시간으로 의심 예약을 분석하고 자동으로 차단합니다</p>
        </div>

        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-900">
            <strong>주의!</strong> 오늘 2건의 사기 의심 예약이 자동 차단되었습니다.
          </AlertDescription>
        </Alert>

        {/* 통계 카드 - 프로페셔널 색상 */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">이번 달 차단</CardTitle>
              <Shield className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{mockStats.blockedThisMonth}건</div>
              <p className="mt-1 text-xs text-slate-500">전월 대비 -20%</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">절감 금액</CardTitle>
              <TrendingUp className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {(mockStats.savedAmount / 10000).toFixed(0)}만원
              </div>
              <p className="mt-1 text-xs text-slate-500">예상 피해액 기준</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">탐지율</CardTitle>
              <Shield className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{mockStats.detectionRate}%</div>
              <p className="mt-1 text-xs text-green-600">업계 평균 대비 +15%</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">오탐률</CardTitle>
              <AlertTriangle className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{mockStats.falsePositive}%</div>
              <p className="mt-1 text-xs text-slate-500">매우 낮은 수준</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>의심 예약 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSuspiciousReservations.map((reservation) => {
                const style = riskStyles[reservation.riskLevel] ?? {};

                return (
                  <div
                    key={reservation.id}
                    className={`rounded-lg border-2 p-4 ${style.container ?? ''}`}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-lg font-semibold">{reservation.name}</span>
                          <Badge className={style.badge}>{riskLabels[reservation.riskLevel] ?? '정보 없음'}</Badge>
                          <span className="text-sm text-slate-600">위험도: {reservation.riskScore}점</span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {reservation.requestedDate} · {reservation.partySize}명 예약 시도
                        </p>
                      </div>
                      {reservation.status === 'blocked' && (
                        <Badge variant="outline" className="bg-slate-100">
                          자동 차단됨
                        </Badge>
                      )}
                    </div>

                    <div className="mb-3">
                      <p className="mb-2 text-sm font-medium text-slate-700">의심 사유:</p>
                      <ul className="space-y-1">
                        {reservation.reasons.map((reason, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                            <span>•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {reservation.status !== 'blocked' && (
                        <>
                          <Button size="sm" variant="destructive" className="gap-1">
                            <X className="h-4 w-4" />
                            차단하기
                          </Button>
                          <Button size="sm" variant="outline">
                            허용하기
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        상세 보기
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default FraudDetection;
