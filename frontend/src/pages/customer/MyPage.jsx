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
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Gift, Clock, MapPin } from "lucide-react";

import Modal from "../../components/Modal";
import Navbar from "../../components/Navbar";
import { useState, useEffect } from "react";

function CustomerMyPage() {
  const [modalType, setModalType] = useState(null);
  const closeModal = () => setModalType(null);

  // ⭐ 로그인 유저 정보(localStorage)
  const loginUser = JSON.parse(localStorage.getItem("user"));
  const customerId = loginUser?.customerId;

  // ⭐ 프로필 정보 (수정 가능하도록 state 분리)
  const [profile, setProfile] = useState(loginUser);

  // ⭐ 예약 리스트
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // -------------------- 결제 수단 관리 State --------------------
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [alias, setAlias] = useState("");

  // 카드번호 자동 "-" 삽입
  const handleCardNumberChange = (e) => {
    let v = e.target.value.replace(/[^0-9]/g, "");
    if (v.length > 16) v = v.slice(0, 16);
    let f = v.replace(/(.{4})/g, "$1-");
    if (f.endsWith("-")) f = f.slice(0, -1);
    setCardNumber(f);
  };

  // 유효기간 자동 "/"
  const handleExpiryChange = (e) => {
    let v = e.target.value.replace(/[^0-9]/g, "");
    if (v.length > 4) v = v.slice(0, 4);
    if (v.length >= 3) v = v.replace(/(\d{2})(\d{1,2})/, "$1/$2");
    setExpiry(v);
  };

  // 카드 등록
  const handleRegister = () => {
    if (cardNumber.length < 19 || expiry.length < 5 || cvc.length < 3) {
      alert("결제 정보를 정확히 입력하세요.");
      return;
    }

    const payload = { cardNumber, expiry, cvc, alias };
    console.log("📦 등록된 카드:", payload);

    alert("카드가 등록되었습니다!");
    closeModal();
  };

  // ⭐ 예약 리스트 불러오기
  useEffect(() => {
    if (!customerId) return;

    async function loadReservations() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/reservations/member/${customerId}`
        );

        const reservationData = await res.json();

        const withBusiness = await Promise.all(
          reservationData.map(async (item) => {
            try {
              const bizRes = await fetch(
                `http://localhost:8080/api/business/${item.businessId}`
              );
              const biz = await bizRes.json();
              return { ...item, businessName: biz.businessName };
            } catch {
              return { ...item, businessName: `가게 #${item.businessId}` };
            }
          })
        );

        setReservations(withBusiness);
      } catch (err) {
        console.error("예약 로딩 오류:", err);
      } finally {
        setLoading(false);
      }
    }

    loadReservations();
  }, [customerId]);

  if (!profile) {
    return (
      <div className="h-screen flex items-center justify-center text-xl text-red-600">
        로그인 정보가 없습니다.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-xl text-slate-500">
        불러오는 중...
      </div>
    );
  }

  const points = profile.rewardPoints ?? 0;
  const trustScore = profile.trustScore ?? 0;
  const noShowCount = profile.noShowCount ?? 0;
  const totalVisits = profile.reservationCount ?? 0;

  const nextLevel = 50000;
  const progressValue = (points / nextLevel) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userType="customer" />

      <main className="container mx-auto px-6 py-8">
        {/* ---------------- 프로필 카드 ---------------- */}
        <Card className="mb-8 border-slate-200">
          <CardContent className="p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <Avatar className="h-24 w-24 bg-blue-100">
                <AvatarFallback className="text-3xl text-blue-700 font-semibold">
                  {profile.name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-slate-900">
                    {profile.name}
                  </h2>
                  <Badge className="bg-blue-600 text-white">일반</Badge>
                </div>

                <p className="mb-4 text-slate-600">{profile.phone}</p>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <div className="text-sm text-slate-500">신뢰 점수</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {trustScore}점
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-500">총 방문</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {totalVisits}회
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-500">노쇼</div>
                    <div className="text-2xl font-bold text-green-600">
                      {noShowCount}회
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-500">포인트</div>
                    <div className="text-2xl font-bold text-green-600">
                      {points.toLocaleString()}P
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-slate-100 p-4">
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                <span>다음 등급까지</span>
                <span className="text-slate-500">
                  {nextLevel - points}P 남음
                </span>
              </div>
              <Progress value={progressValue} />
            </div>
          </CardContent>
        </Card>

        {/* ---------------- Tabs ---------------- */}
        <Tabs defaultValue="history">
          <TabsList className="mb-6 bg-white border">
            <TabsTrigger value="history">예약 내역</TabsTrigger>
            <TabsTrigger value="rewards">리워드</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
          </TabsList>

          {/* ---------------- 예약 내역 ---------------- */}
          <TabsContent value="history" className="space-y-4">
            {reservations.length === 0 && (
              <p className="text-center text-slate-500">
                예약 내역이 없습니다.
              </p>
            )}

            {reservations.map((r) => {
              const d = new Date(r.reservationTime);
              const date = d.toLocaleDateString("ko-KR");
              const time = d.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <Card key={r.id} className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">
                            {r.businessName}
                          </h3>
                          <Badge
                            variant="outline"
                            className="border-green-200 bg-green-50 text-green-700"
                          >
                            {r.status}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span>
                              {date} {time}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span>{r.people}명 방문</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-600">
                              결제 상태: {r.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 md:flex-col">
                        <Button variant="outline" size="sm">
                          다시 예약하기
                        </Button>
                        <Button variant="ghost" size="sm">
                          리뷰 작성
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* ---------------- 리워드 ---------------- */}
          <TabsContent value="rewards" className="space-y-4">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="text-slate-900">보유 포인트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-4xl font-bold text-slate-900">
                  {points.toLocaleString()}P
                </div>
                <p className="mb-4 text-sm text-slate-600">
                  1P = 1원으로 전 가맹점에서 사용 가능합니다.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  포인트 사용하기
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------------- 설정 ---------------- */}
          <TabsContent value="settings">
            <Card className="border-slate-200">
              <CardContent className="space-y-3 p-6">
                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-300"
                  onClick={() => setModalType("profile")}
                >
                  개인정보 수정
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-300"
                  onClick={() => setModalType("alert")}
                >
                  알림 설정
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-300"
                  onClick={() => setModalType("payment")}
                >
                  결제 수단 관리
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => setModalType("withdraw")}
                >
                  회원 탈퇴
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* ---------------- 개인정보 수정 모달 ---------------- */}
      <Modal
        isOpen={modalType === "profile"}
        onClose={closeModal}
        title="개인정보 수정"
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm text-slate-700">이름</span>
            <input
              type="text"
              className="mt-1 w-full border rounded-lg p-2"
              value={profile.name}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-700">전화번호</span>
            <input
              type="text"
              className="mt-1 w-full border rounded-lg p-2"
              value={profile.phone}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-700">비밀번호 변경 (선택)</span>
            <input
              type="password"
              className="mt-1 w-full border rounded-lg p-2"
              placeholder="새 비밀번호 입력 (선택)"
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
            />
          </label>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={async () => {
              const updateBody = {
                name: profile.name,
                phone: profile.phone,
              };

              if (profile.newPassword) {
                updateBody.password = profile.newPassword;
              }

              try {
                const res = await fetch(
                  `http://localhost:8080/api/members/${customerId}`,
                  {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updateBody),
                  }
                );

                if (!res.ok) {
                  alert("수정 실패!");
                  return;
                }

                const updated = await res.json();

                // localStorage도 수정
                const newUser = { ...loginUser, ...updated };
                localStorage.setItem("user", JSON.stringify(newUser));
                setProfile(newUser);

                alert("수정 완료되었습니다!");
                closeModal();
              } catch (err) {
                console.error(err);
                alert("오류 발생");
              }
            }}
          >
            저장하기
          </Button>
        </div>
      </Modal>

      {/* ---------------- 알림 설정 모달 ---------------- */}
      <Modal
        isOpen={modalType === "alert"}
        onClose={closeModal}
        title="알림 설정"
      >
        <p className="text-slate-700">알림 설정 모달 내용입니다.</p>
      </Modal>

      {/* ---------------- 결제 수단 관리 모달 ---------------- */}
      <Modal
        isOpen={modalType === "payment"}
        onClose={closeModal}
        title="결제 수단 관리"
      >
        <div className="space-y-4">
          {/* 카드 번호 */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              카드 번호
            </label>
            <input
              type="text"
              maxLength={19}
              placeholder="1234-5678-1234-5678"
              className="mt-1 w-full border rounded-lg p-2"
              value={cardNumber}
              onChange={handleCardNumberChange}
            />
          </div>

          {/* 유효기간 + CVC */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">
                유효기간 (MM/YY)
              </label>
              <input
                type="text"
                maxLength={5}
                placeholder="12/26"
                className="mt-1 w-full border rounded-lg p-2"
                value={expiry}
                onChange={handleExpiryChange}
              />
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">CVC</label>
              <input
                type="text"
                maxLength={3}
                placeholder="123"
                className="mt-1 w-full border rounded-lg p-2"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>
          </div>

          {/* 카드 별칭 */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              카드 별칭 (선택)
            </label>
            <input
              type="text"
              placeholder="내 카드, 회사 카드 등"
              className="mt-1 w-full border rounded-lg p-2"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
            />
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
            onClick={handleRegister}
          >
            카드 등록하기
          </Button>
        </div>
      </Modal>

      {/* ---------------- 회원 탈퇴 ---------------- */}
      <Modal
        isOpen={modalType === "withdraw"}
        onClose={closeModal}
        title="회원 탈퇴"
      >
        <p className="text-slate-700">정말로 탈퇴하시겠습니까?</p>
      </Modal>
    </div>
  );
}

export default CustomerMyPage;
