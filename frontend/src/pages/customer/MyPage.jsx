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

  const loginUser = JSON.parse(localStorage.getItem("user"));
  const customerId = loginUser?.customerId;

  const [profile, setProfile] = useState(loginUser);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [alias, setAlias] = useState("");

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

  const handleCardNumberChange = (e) => {
    let v = e.target.value.replace(/[^0-9]/g, "");
    if (v.length > 16) v = v.slice(0, 16);
    let f = v.replace(/(.{4})/g, "$1-");
    if (f.endsWith("-")) f = f.slice(0, -1);
    setCardNumber(f);
  };

  const handleExpiryChange = (e) => {
    let v = e.target.value.replace(/[^0-9]/g, "");
    if (v.length > 4) v = v.slice(0, 4);
    if (v.length >= 3) v = v.replace(/(\d{2})(\d{1,2})/, "$1/$2");
    setExpiry(v);
  };

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

      <main className="container mx-auto px-6 py-12 space-y-10">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-primary-green/20 blur-3xl" />
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            <div className="flex items-center justify-center rounded-3xl bg-white/10 p-3 shadow-inner">
              <Avatar className="h-28 w-28 bg-white">
                <AvatarFallback className="text-3xl text-slate-900 font-semibold">
                  {profile.name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <h1 className="text-4xl font-semibold tracking-tight">{profile.name}</h1>
                <Badge className="bg-emerald-400 text-slate-900">일반 회원</Badge>
              </div>
              <p className="text-sm uppercase tracking-[0.4em] text-emerald-200">
                #{customerId ?? "ID 없음"}
              </p>
              <p className="text-base text-slate-200">{profile.phone}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="rounded-2xl bg-white/10 px-4 py-2">
                  신뢰 점수: <strong className="text-white">{trustScore}점</strong>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-2">
                  총 방문: <strong className="text-white">{totalVisits}회</strong>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-2">
                  노쇼 횟수: <strong className="text-white">{noShowCount}회</strong>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-2">
                  포인트: <strong className="text-white">{points.toLocaleString()}P</strong>
                </div>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-3 self-stretch rounded-3xl bg-white/10 p-4">
              <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-emerald-200">
                다음 등급까지
                <span className="text-white">{nextLevel - points}P 남음</span>
              </div>
              <Progress value={progressValue} className="h-2 rounded-full bg-white/30" />
              <div className="text-xs text-white/80">
                노쇼 없는 예약 습관이 쌓이면 보다 풍성한 리워드와 혜택이 기다립니다.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <Card className="border-slate-200 shadow-lg">
            <CardContent className="space-y-2 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">예정된 예약</p>
              <p className="text-3xl font-semibold text-text-primary">
                {reservations.filter((r) => new Date(r.reservationTime) > new Date()).length}건
              </p>
              <p className="text-xs text-slate-500">예약 내역에서 상세 내용을 확인하세요.</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-lg">
            <CardContent className="space-y-2 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">최근 활동</p>
              <p className="text-3xl font-semibold text-slate-900">
                {reservations[0]?.businessName || "기록 없음"}
              </p>
              <p className="text-xs text-slate-500">마지막 예약 가게를 보여줍니다.</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-lg">
            <CardContent className="space-y-2 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">추천 혜택</p>
              <p className="text-3xl font-semibold text-emerald-600">5% 캐시백</p>
              <p className="text-xs text-slate-500">노쇼 없는 예약 시 자동 적용됩니다.</p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6 rounded-3xl bg-white px-6 py-6 shadow-lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-slate-400">주요 관리</p>
              <h2 className="text-2xl font-semibold text-slate-900">예약 & 설정</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={() => setModalType("profile")}>개인정보 수정</Button>
              <Button variant="outline" size="sm" onClick={() => setModalType("alert")}>알림 설정</Button>
              <Button variant="outline" size="sm" onClick={() => setModalType("payment")}>결제 수단 관리</Button>
              <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => setModalType("withdraw")}>회원 탈퇴</Button>
            </div>
          </div>
          <Tabs defaultValue="history" className="space-y-6">
            <TabsList className="gap-2 rounded-2xl bg-slate-100 p-1 shadow-inner">
              <TabsTrigger value="history">예약 내역</TabsTrigger>
              <TabsTrigger value="rewards">리워드</TabsTrigger>
              <TabsTrigger value="settings">설정</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-5">
              {reservations.length === 0 && (
                <p className="text-sm text-slate-500">예약 내역이 없습니다.</p>
              )}
              {reservations.map((r) => {
                const d = new Date(r.reservationTime);
                const date = d.toLocaleDateString("ko-KR");
                const time = d.toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <Card key={r.id} className="border-slate-100 shadow-sm">
                    <CardContent className="space-y-4 px-5 py-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900">{r.businessName}</h3>
                            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                              {r.status}
                            </Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-slate-400" /> {date} {time}
                            </span>
                            <span className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-slate-400" /> {r.people}명 방문
                            </span>
                            <span className="flex items-center gap-2">
                              <Gift className="h-4 w-4 text-blue-600" /> 결제 상태: <strong className="text-slate-900">{r.paymentStatus}</strong>
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 md:flex-row">
                          <Button variant="outline" size="sm">다시 예약하기</Button>
                          <Button variant="ghost" size="sm">리뷰 작성</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="rewards">
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-slate-900">보유 포인트</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-4xl font-bold text-slate-900">{points.toLocaleString()}P</div>
                  <p className="text-sm text-slate-600">1P = 1원. 전국 가맹점에서 자유롭게 사용 가능합니다. 지금 바로 포인트로 결제하세요.</p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">포인트 사용하기</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="space-y-4 px-4 py-5">
                  <Button variant="outline" className="w-full justify-start border-slate-300" onClick={() => setModalType("profile")}>개인정보 수정</Button>
                  <Button variant="outline" className="w-full justify-start border-slate-300" onClick={() => setModalType("alert")}>알림 설정</Button>
                  <Button variant="outline" className="w-full justify-start border-slate-300" onClick={() => setModalType("payment")}>결제 수단 관리</Button>
                  <Button variant="outline" className="w-full justify-start border-red-300 text-red-600 hover:bg-red-50" onClick={() => setModalType("withdraw")}>회원 탈퇴</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </main>

        <PrivacyModal
          isOpen={modalType === "profile"}
        onClose={closeModal}
        profile={profile}
        setProfile={setProfile}
      />
      <AlertModal isOpen={modalType === "alert"} onClose={closeModal} />
        <PaymentModal
          isOpen={modalType === "payment"}
        onClose={closeModal}
        cardNumber={cardNumber}
        expiry={expiry}
        cvc={cvc}
        alias={alias}
        handlers={{ setCardNumber: handleCardNumberChange, setExpiry: handleExpiryChange, setCvc, setAlias }}
        handleRegister={handleRegister}
      />
      <WithdrawModal isOpen={modalType === "withdraw"} onClose={closeModal} />
    </div>
  );
}

function PrivacyModal({ isOpen, onClose, profile, setProfile }) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="개인정보 수정">
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm text-slate-700">이름</span>
          <input
            type="text"
            className="mt-1 w-full border rounded-lg p-2"
            value={profile.name}
            onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-700">전화번호</span>
          <input
            type="text"
            className="mt-1 w-full border rounded-lg p-2"
            value={profile.phone}
            onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-700">비밀번호 변경 (선택)</span>
          <input
            type="password"
            className="mt-1 w-full border rounded-lg p-2"
            placeholder="새 비밀번호 입력 (선택)"
            onChange={(e) => setProfile((prev) => ({ ...prev, newPassword: e.target.value }))}
          />
        </label>
        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={onClose}>
          저장
        </Button>
      </div>
    </Modal>
  );
}

function AlertModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="알림 설정">
      <div className="space-y-4 text-sm text-slate-600">
        <p>알림 수신 여부를 개별적으로 설정하고 푸시/이메일 알림을 관리하세요.</p>
        <div className="space-y-3">
          {[
            "예약 확정",
            "알림/리워드",
            "프로모션",
          ].map((item) => (
            <div key={item} className="flex items-center justify-between">
              <span>{item}</span>
              <input type="checkbox" className="h-4 w-4" defaultChecked />
            </div>
          ))}
        </div>
        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={onClose}>
          저장
        </Button>
      </div>
    </Modal>
  );
}

function PaymentModal({ isOpen, onClose, cardNumber, expiry, cvc, alias, handlers, handleRegister }) {
  if (!isOpen) return null;
  const { setCardNumber, setExpiry, setCvc, setAlias } = handlers;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="결제 수단 등록">
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm text-slate-700">카드 번호</span>
          <input
            type="text"
            className="mt-1 w-full border rounded-lg p-2"
            value={cardNumber}
            onChange={setCardNumber}
            placeholder="0000-0000-0000-0000"
          />
        </label>
        <div className="flex gap-3">
          <label className="block flex-1">
            <span className="text-sm text-slate-700">유효기간</span>
            <input
              type="text"
              className="mt-1 w-full border rounded-lg p-2"
              value={expiry}
              onChange={setExpiry}
              placeholder="MM/YY"
            />
          </label>
          <label className="block flex-1">
            <span className="text-sm text-slate-700">CVC</span>
            <input
              type="text"
              className="mt-1 w-full border rounded-lg p-2"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              placeholder="123"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm text-slate-700">카드 별칭</span>
          <input
            type="text"
            className="mt-1 w-full border rounded-lg p-2"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="예: 주카드"
          />
        </label>
        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleRegister}>
          등록
        </Button>
      </div>
    </Modal>
  );
}

function WithdrawModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="회원 탈퇴">
      <div className="space-y-4 text-sm text-slate-600">
        <p>탈퇴 시 모든 예약 정보 및 포인트가 삭제됩니다. 정말 진행하시겠습니까?</p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button variant="outline" className="flex-1 border-red-300 text-red-600" onClick={() => alert("탈퇴 처리 중...") }>
            탈퇴하기
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default CustomerMyPage;
