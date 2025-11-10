import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Gift, Clock, MapPin } from 'lucide-react';

const mockUserProfile = {
  name: '김민수',
  phone: '010-1234-5678',
  trustScore: 95,
  trustLevel: '플래티넘',
  totalVisits: 47,
  noShowCount: 0,
  points: 28500,
  nextLevelPoints: 50000,
};

const mockReservationHistory = [
  {
    id: 1,
    restaurant: '신라면옥 홍대점',
    date: '2025-11-01',
    time: '18:00',
    partySize: 4,
    status: 'completed',
    statusText: '방문 완료',
    pointsEarned: 1500,
  },
  {
    id: 2,
    restaurant: '강남 스테이크',
    date: '2025-10-28',
    time: '19:30',
    partySize: 2,
    status: 'completed',
    statusText: '방문 완료',
    pointsEarned: 3000,
  },
  {
    id: 3,
    restaurant: '이태원 돈까스',
    date: '2025-10-25',
    time: '12:00',
    partySize: 1,
    status: 'completed',
    statusText: '방문 완료',
    pointsEarned: 800,
  },
];

const mockRewards = [
  {
    id: 1,
    title: '5,000원 할인 쿠폰',
    description: '전 가맹점 사용 가능',
    expiryDate: '2025-12-31',
    available: true,
  },
  {
    id: 2,
    title: '10% 할인 쿠폰',
    description: '프리미엄 레스토랑 전용',
    expiryDate: '2025-11-30',
    available: true,
  },
  {
    id: 3,
    title: '무료 음료 쿠폰',
    description: '신라면옥 전점 사용 가능',
    expiryDate: '2025-11-15',
    available: false,
  },
];

function CustomerMyPage() {
  const progressValue =
    (mockUserProfile.points / mockUserProfile.nextLevelPoints) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - 프로페셔널 스타일 */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-8 h-20 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer">
            올사람
          </a>
          <div className="flex gap-4">
            <Button variant="ghost" className="text-slate-700 text-base">
              맛집 탐색
            </Button>
            <Button variant="ghost" className="text-slate-700 text-base">
              내 예약
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* 프로필 카드 - 프로페셔널 스타일 */}
        <Card className="mb-8 border-slate-200">
          <CardContent className="p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <Avatar className="h-24 w-24 bg-blue-100">
                <AvatarFallback className="text-3xl text-blue-700 font-semibold">
                  {mockUserProfile.name[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-bold text-slate-900">{mockUserProfile.name}</h2>
                  <Badge className="bg-blue-600 text-white">
                    {mockUserProfile.trustLevel}
                  </Badge>
                </div>
                <p className="mb-4 text-slate-600">{mockUserProfile.phone}</p>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <div className="text-sm text-slate-500">신뢰 점수</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {mockUserProfile.trustScore}점
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">총 방문</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {mockUserProfile.totalVisits}회
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">노쇼</div>
                    <div className="text-2xl font-bold text-green-600">
                      {mockUserProfile.noShowCount}회
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">포인트</div>
                    <div className="text-2xl font-bold text-green-600">
                      {mockUserProfile.points.toLocaleString()}P
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-slate-100 p-4">
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                <span>다음 등급까지</span>
                <span className="text-slate-500">
                  {mockUserProfile.nextLevelPoints - mockUserProfile.points}P 남음
                </span>
              </div>
              <Progress value={progressValue} />
            </div>
          </CardContent>
        </Card>

        {/* 탭 - 프로페셔널 스타일 */}
        <Tabs defaultValue="history">
          <TabsList className="mb-6 bg-white border">
            <TabsTrigger value="history" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              예약 내역
            </TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              리워드
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              설정
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            {mockReservationHistory.map((reservation) => (
              <Card key={reservation.id} className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {reservation.restaurant}
                        </h3>
                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                          {reservation.statusText}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span>
                            {reservation.date} {reservation.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span>{reservation.partySize}명 방문</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-600">
                            +{reservation.pointsEarned}P 적립
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 md:flex-col">
                      <Button variant="outline" size="sm" className="border-slate-300">
                        다시 예약하기
                      </Button>
                      <Button variant="ghost" size="sm" className="text-slate-600">
                        리뷰 작성
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="text-slate-900">보유 포인트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-4xl font-bold text-slate-900">
                  {mockUserProfile.points.toLocaleString()}P
                </div>
                <p className="mb-4 text-sm text-slate-600">
                  1P = 1원으로 전 가맹점에서 사용 가능합니다.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">포인트 사용하기</Button>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {mockRewards.map((reward) => (
                <Card key={reward.id} className={`border-slate-200 ${!reward.available ? 'opacity-50' : ''}`}>
                  <CardContent className="p-6">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                        <Gift className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="mb-1 text-base font-semibold text-slate-900">{reward.title}</h3>
                        <p className="text-sm text-slate-600">{reward.description}</p>
                        <p className="mt-1 text-xs text-slate-500">만료일: {reward.expiryDate}</p>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="sm"
                      disabled={!reward.available}
                    >
                      {reward.available ? '사용하기' : '사용 완료'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border-slate-200">
              <CardContent className="space-y-3 p-6">
                <Button variant="outline" className="w-full justify-start border-slate-300">
                  개인정보 수정
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-300">
                  알림 설정
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-300">
                  결제 수단 관리
                </Button>
                <Button variant="outline" className="w-full justify-start border-red-300 text-red-600 hover:bg-red-50">
                  회원 탈퇴
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default CustomerMyPage;

