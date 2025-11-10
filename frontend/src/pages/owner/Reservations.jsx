import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import {
  Calendar,
  Clock,
  Users,
  Phone,
  MessageSquare,
  MapPin,
  DollarSign,
  FileText,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const mockDetailedReservations = [
  {
    id: 1,
    customerName: '김민수',
    customerInitial: '김',
    phone: '010-1234-5678',
    date: '2025-11-05',
    time: '18:00',
    partySize: 4,
    status: 'confirmed',
    statusText: '확정',
    trustScore: 95,
    trustLevel: '플래티넘',
    visitCount: 12,
    menu: '짜장면 2, 짬뽕 2',
    totalAmount: 34000,
    specialRequest: '아이 의자 필요합니다',
    tableNumber: '3번 테이블',
  },
  {
    id: 2,
    customerName: '이지현',
    customerInitial: '이',
    phone: '010-2345-6789',
    date: '2025-11-05',
    time: '19:00',
    partySize: 2,
    status: 'confirmed',
    statusText: '확정',
    trustScore: 88,
    trustLevel: '골드',
    visitCount: 5,
    menu: '탕수육(소) 1',
    totalAmount: 15000,
    specialRequest: '없음',
    tableNumber: '7번 테이블',
  },
  {
    id: 3,
    customerName: '박준호',
    customerInitial: '박',
    phone: '010-3456-7890',
    date: '2025-11-05',
    time: '19:30',
    partySize: 6,
    status: 'pending',
    statusText: '대기중',
    trustScore: 72,
    trustLevel: '실버',
    visitCount: 2,
    menu: '사전 주문 없음',
    totalAmount: 0,
    specialRequest: '없음',
    tableNumber: '미배정',
  },
];

function Reservations() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - 프로페셔널 스타일 */}
      <header className="bg-white border-b sticky top-0 z-50">
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
              홍대 중국집
            </Button>
            <Button variant="outline" className="text-base" onClick={handleLogout}>
              <LogOut className="w-5 h-5 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 py-10">
        {/* 타이틀 섹션 - 이모지 제거 */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              예약 관리
            </h2>
            <p className="text-lg text-slate-600">
              오늘의 예약을 확인하고 관리하세요
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="border-slate-300 text-base h-11 px-5">
              <Calendar className="w-5 h-5 mr-2" />
              날짜 선택
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-base h-11 px-5">
              <Clock className="w-5 h-5 mr-2" />
              타임 블록
            </Button>
          </div>
        </div>

        {/* 탭 - 더 깔끔하게 */}
        <Tabs defaultValue="today" className="mb-8">
          <TabsList className="bg-white border h-12">
            <TabsTrigger value="today" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 text-base px-6">
              오늘 (12건)
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 text-base px-6">
              예정 (28건)
            </TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 text-base px-6">
              지난 예약
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 text-base px-6">
              취소 내역
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-8 space-y-6">
            {mockDetailedReservations.map((reservation) => (
              <Card key={reservation.id} className="border-slate-200">
                <CardContent className="p-8">
                  <div className="flex items-start gap-8">
                    {/* 왼쪽: 고객 정보 */}
                    <div className="flex-shrink-0">
                      <Avatar className="w-16 h-16 bg-blue-100">
                        <AvatarFallback className="text-blue-700 font-semibold text-xl">
                          {reservation.customerInitial}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* 중앙: 상세 정보 */}
                    <div className="flex-1">
                      {/* 이름 & 상태 */}
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-xl font-bold text-slate-900">
                          {reservation.customerName}
                        </h3>
                        <Badge
                          variant={reservation.status === 'confirmed' ? 'default' : 'secondary'}
                          className={`text-sm px-3 py-1 ${reservation.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {reservation.statusText}
                        </Badge>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-sm px-3 py-1">
                          {reservation.trustLevel}
                        </Badge>
                      </div>

                      {/* 연락처 */}
                      <div className="flex items-center gap-3 mb-5 text-base text-slate-600">
                        <Phone className="w-5 h-5" />
                        <span>{reservation.phone}</span>
                        <Separator orientation="vertical" className="h-5 mx-2" />
                        <span>신뢰 점수: {reservation.trustScore}점</span>
                        <Separator orientation="vertical" className="h-5 mx-2" />
                        <span>방문 {reservation.visitCount}회</span>
                      </div>

                      {/* 예약 상세 정보 - 아이콘만 사용 */}
                      <div className="grid grid-cols-2 gap-x-10 gap-y-4 mb-5">
                        <div className="flex items-center gap-3 text-base">
                          <Calendar className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-600">날짜:</span>
                          <span className="font-medium text-slate-900">{reservation.date}</span>
                        </div>
                        <div className="flex items-center gap-3 text-base">
                          <Clock className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-600">시간:</span>
                          <span className="font-medium text-slate-900">{reservation.time}</span>
                        </div>
                        <div className="flex items-center gap-3 text-base">
                          <Users className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-600">인원:</span>
                          <span className="font-medium text-slate-900">{reservation.partySize}명</span>
                        </div>
                        <div className="flex items-center gap-3 text-base">
                          <MapPin className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-600">테이블:</span>
                          <span className="font-medium text-slate-900">{reservation.tableNumber}</span>
                        </div>
                      </div>

                      <Separator className="my-5" />

                      {/* 주문 정보 */}
                      <div className="mb-4">
                        <div className="flex items-center gap-3 text-base font-medium text-slate-700 mb-3">
                          <FileText className="w-5 h-5" />
                          사전 주문
                        </div>
                        <p className="text-base text-slate-600 pl-8">{reservation.menu}</p>
                        {reservation.totalAmount > 0 && (
                          <div className="flex items-center gap-3 mt-3 pl-8">
                            <DollarSign className="w-5 h-5 text-slate-400" />
                            <span className="text-base text-slate-600">예상 금액:</span>
                            <span className="text-base font-semibold text-slate-900">
                              {reservation.totalAmount.toLocaleString()}원
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 요청사항 */}
                      {reservation.specialRequest !== '없음' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="text-sm font-medium text-amber-900 mb-2">
                            요청사항
                          </div>
                          <p className="text-base text-amber-800">{reservation.specialRequest}</p>
                        </div>
                      )}
                    </div>

                    {/* 오른쪽: 액션 버튼 */}
                    <div className="flex flex-col gap-3 flex-shrink-0 w-44">
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-base h-11"
                      >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        알림 보내기
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-slate-300 text-base h-11"
                      >
                        예약 수정
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-slate-300 text-base h-11"
                      >
                        테이블 변경
                      </Button>
                      {reservation.status === 'confirmed' && (
                        <Button
                          variant="outline"
                          className="w-full border-green-300 text-green-700 hover:bg-green-50 text-base h-11"
                        >
                          방문 완료
                        </Button>
                      )}
                      <Separator className="my-2" />
                      <Button
                        variant="outline"
                        className="w-full border-red-300 text-red-700 hover:bg-red-50 text-base h-11"
                      >
                        예약 취소
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6 text-center text-slate-500">
            예정된 예약 데이터는 추후 연동됩니다.
          </TabsContent>
          <TabsContent value="past" className="mt-6 text-center text-slate-500">
            지난 예약 데이터는 추후 연동됩니다.
          </TabsContent>
          <TabsContent value="cancelled" className="mt-6 text-center text-slate-500">
            취소 내역 데이터는 추후 연동됩니다.
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default Reservations;
