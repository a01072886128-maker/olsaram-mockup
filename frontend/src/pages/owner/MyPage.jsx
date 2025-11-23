import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Progress } from "../../components/ui/progress";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";

import { Star, MapPin, Store } from "lucide-react";
import { useState } from "react";
import Modal from "../../components/Modal";
import { Link } from "react-router-dom";

// ---------------- Mock 사업자 데이터 ----------------
const ownerProfile = {
  ownerName: "홍대 중국집 사장님",
  phone: "010-5678-1234",
  trustTemp: 84,
  totalReviews: 126,
  noShowRate: 3.2,
  avgRating: 4.7,
};

// ---------------- Mock 가게 리스트 ----------------
const mockStores = [
  {
    id: 1,
    name: "홍대 중국집",
    location: "서울 마포구",
    rating: 4.8,
    reviews: 85,
    noShowRate: 2.5,
    trustTemp: 88,
  },
  {
    id: 2,
    name: "이태원 마라탕",
    location: "서울 용산구",
    rating: 4.5,
    reviews: 41,
    noShowRate: 4.1,
    trustTemp: 79,
  },
];

function OwnerMyPage() {
  const [modalType, setModalType] = useState(null);
  const closeModal = () => setModalType(null);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ------------------------------ 상단 고정 Header ------------------------------ */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-8 h-20 flex items-center justify-between">
          {/* 로고 */}
          <Link
            to="/owner/dashboard"
            className="text-2xl font-bold text-green-700 cursor-pointer flex items-center gap-2"
          >
            <Store className="text-green-600" />
            올사람 사장님
          </Link>

          {/* 메뉴 */}
          <div className="flex gap-6">
            <Link
              to="/owner/dashboard"
              className="text-slate-700 text-base hover:text-green-600"
            >
              대시보드
            </Link>

            <Link
              to="/owner/reservations"
              className="text-slate-700 text-base hover:text-green-600"
            >
              예약 관리
            </Link>

            <Link
              to="/owner/my-page"
              className="text-green-600 font-bold border-b-2 border-green-600 text-base"
            >
              마이페이지
            </Link>
          </div>
        </div>
      </header>

      {/* ------------------------------ Main ------------------------------ */}
      <main className="container mx-auto px-6 py-8">
        {/* 프로필 카드 */}
        <Card className="mb-8 border-slate-200">
          <CardContent className="p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <Avatar className="h-24 w-24 bg-green-100">
                <AvatarFallback className="text-3xl text-green-700 font-semibold">
                  {ownerProfile.ownerName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-bold text-slate-900">
                    {ownerProfile.ownerName}
                  </h2>
                  <Badge className="bg-green-600 text-white">사업자</Badge>
                </div>

                <p className="mb-4 text-slate-600">{ownerProfile.phone}</p>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <div className="text-sm text-slate-500">가게 온도</div>
                    <div className="text-2xl font-bold text-green-600">
                      {ownerProfile.trustTemp}°
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-500">리뷰 수</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {ownerProfile.totalReviews}개
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-500">노쇼 발생률</div>
                    <div className="text-2xl font-bold text-red-500">
                      {ownerProfile.noShowRate}%
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-500">평균 평점</div>
                    <div className="text-2xl font-bold text-yellow-500 flex items-center gap-1">
                      <Star size={20} className="fill-yellow-400" />
                      {ownerProfile.avgRating}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 온도 Progress Bar */}
            <div className="mt-6 rounded-lg bg-green-50 p-4">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span>가게 신뢰 지수</span>
                <span className="text-green-700">
                  {ownerProfile.trustTemp}°
                </span>
              </div>
              <Progress value={ownerProfile.trustTemp} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* ------------------------------ TABS ------------------------------ */}
        <Tabs defaultValue="stores">
          <TabsList className="mb-6 bg-white border">
            <TabsTrigger value="stores">내 가게</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
          </TabsList>

          {/* 내 가게 리스트 */}
          <TabsContent value="stores" className="space-y-4">
            {mockStores.map((store) => (
              <Card key={store.id} className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold">{store.name}</h3>
                        <Badge className="bg-green-100 text-green-700">
                          {store.rating}★
                        </Badge>
                      </div>

                      <p className="text-sm text-slate-600 flex items-center gap-1 mb-2">
                        <MapPin size={16} className="text-slate-400" />
                        {store.location}
                      </p>

                      <div className="flex gap-6 text-sm">
                        <span>리뷰 {store.reviews}개</span>
                        <span>노쇼 {store.noShowRate}%</span>
                        <span className="text-green-600 font-bold">
                          온도 {store.trustTemp}°
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        가게 관리
                      </Button>
                      <Button variant="ghost" size="sm">
                        통계 보기
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* 설정 탭 */}
          <TabsContent value="settings">
            <Card className="border-slate-200">
              <CardContent className="p-6 space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setModalType("edit")}
                >
                  사업자 정보 수정
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setModalType("alert")}
                >
                  알림 설정
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => setModalType("withdraw")}
                >
                  회원 탈퇴
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* 모달 */}
      <Modal
        isOpen={modalType === "edit"}
        onClose={closeModal}
        title="사업자 정보 수정"
      >
        <p>사업자 정보 수정 모달입니다.</p>
      </Modal>

      <Modal
        isOpen={modalType === "alert"}
        onClose={closeModal}
        title="알림 설정"
      >
        <p>알림 설정 모달입니다.</p>
      </Modal>

      <Modal
        isOpen={modalType === "withdraw"}
        onClose={closeModal}
        title="회원 탈퇴"
      >
        <p>정말로 탈퇴하시겠습니까?</p>
      </Modal>
    </div>
  );
}

export default OwnerMyPage;
