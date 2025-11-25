import {
  Card,
  CardContent,
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

import { MapPin, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ownerAPI } from "../../services/owner";
import { businessAPI } from "../../services/business";

function OwnerMyPage() {
  const { user } = useAuth();
  const ownerId = user?.ownerId;
  const navigate = useNavigate();

  const [modalType, setModalType] = useState(null);
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [businessLoading, setBusinessLoading] = useState(true);
  const [businessError, setBusinessError] = useState(null);

  // 수정 폼 상태
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    email: "",
    businessNumber: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  const closeModal = () => setModalType(null);

  // 프로필 불러오기
  useEffect(() => {
    if (!ownerId) return;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await ownerAPI.getOwnerProfile(ownerId);
        setOwnerProfile(data);
        setEditForm({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          businessNumber: data.businessNumber || "",
        });
      } catch (err) {
        console.error("프로필 로드 실패:", err);
        alert("프로필을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [ownerId]);

  useEffect(() => {
    if (!ownerId) {
      setBusinessLoading(false);
      setBusinesses([]);
      return;
    }

    let isMounted = true;

    const fetchBusinesses = async () => {
      try {
        setBusinessLoading(true);
        setBusinessError(null);
        const data = await businessAPI.getBusinessesByOwner(ownerId);
        if (!isMounted) return;
        setBusinesses(data ?? []);
      } catch (err) {
        if (!isMounted) return;
        console.error("비즈니스 조회 실패:", err);
        setBusinessError("가게 정보를 불러오지 못했습니다.");
      } finally {
        if (!isMounted) return;
        setBusinessLoading(false);
      }
    };

    fetchBusinesses();

    return () => {
      isMounted = false;
    };
  }, [ownerId]);

  // 정보 수정 제출
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editForm.name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    if (!editForm.phone.trim()) {
      alert("전화번호를 입력해주세요.");
      return;
    }

    try {
      setEditLoading(true);
      const updated = await ownerAPI.updateOwnerProfile(ownerId, editForm);
      setOwnerProfile(updated);
      alert("정보가 수정되었습니다.");
      closeModal();
    } catch (err) {
      console.error("수정 실패:", err);
      alert(err.response?.data?.message || "정보 수정에 실패했습니다.");
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar userType="owner" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
          <span className="ml-2 text-slate-500">프로필 로딩 중...</span>
        </div>
      </div>
    );
  }

  if (!ownerProfile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar userType="owner" />
        <div className="container mx-auto px-6 py-8">
          <p className="text-center text-slate-500">프로필 정보를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userType="owner" />

      {/* ------------------------------ Main ------------------------------ */}
      <main className="container mx-auto px-6 py-8">
        {/* 프로필 카드 */}
        <Card className="mb-8 border-slate-200">
          <CardContent className="p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <Avatar className="h-24 w-24 bg-green-100">
                <AvatarFallback className="text-3xl text-green-700 font-semibold">
                  {ownerProfile.name?.[0] || "사"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-bold text-slate-900">
                    {ownerProfile.name}
                  </h2>
                  <Badge className="bg-green-600 text-white">사업자</Badge>
                  {ownerProfile.isVerified && (
                    <Badge className="bg-blue-600 text-white">인증완료</Badge>
                  )}
                </div>

                <p className="mb-2 text-slate-600">{ownerProfile.phone}</p>
                {ownerProfile.email && (
                  <p className="mb-4 text-sm text-slate-500">{ownerProfile.email}</p>
                )}

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <div className="text-sm text-slate-500">구독 플랜</div>
                    <div className="text-2xl font-bold text-green-600">
                      {ownerProfile.subscriptionPlan || "FREE"}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-500">등록 가게 수</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {ownerProfile.totalBusinessCount || 0}개
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-500">최대 가게 수</div>
                    <div className="text-2xl font-bold text-slate-600">
                      {ownerProfile.maxBusinessCount || 1}개
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-500">가입일</div>
                    <div className="text-lg font-medium text-slate-700">
                      {ownerProfile.createdAt
                        ? new Date(ownerProfile.createdAt).toLocaleDateString("ko-KR")
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 사업자번호 표시 */}
            <div className="mt-6 rounded-lg bg-slate-50 p-4">
              <div className="text-sm font-medium text-slate-600 mb-1">
                사업자등록번호
              </div>
              <div className="text-lg font-mono text-slate-900">
                {ownerProfile.businessNumber || "미등록"}
              </div>
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
            {businessLoading ? (
            <Card className="border-slate-200 bg-white">
              <CardContent className="p-6 flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-slate-500 animate-spin" />
                <span className="text-sm text-slate-500">가게를 불러오는 중입니다...</span>
              </CardContent>
            </Card>
          ) : businessError ? (
            <Card className="border-slate-200">
              <CardContent className="p-6 text-center text-sm text-red-500">
                {businessError}
              </CardContent>
            </Card>
          ) : businesses.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="p-6 text-center">
                <div className="text-lg font-bold text-slate-900 mb-2">
                  등록된 가게가 없습니다
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  가게를 등록하시면 마이페이지에서 바로 관리할 수 있어요.
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate("/owner/register-business")}
                  className="bg-green-50 text-green-600"
                >
                  가게 등록하기
                </Button>
              </CardContent>
            </Card>
          ) : (
            businesses.map((business) => {
              const rating =
                business.averageRating != null
                  ? Number(business.averageRating).toFixed(1)
                  : "0.0";
              const reviews = business.reviewCount ?? 0;
              return (
                <Card key={business.businessId} className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold">{business.businessName}</h3>
                          <Badge
                            className={`text-xs ${
                              business.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {business.isActive ? "운영 중" : "비활성"}
                          </Badge>
                        </div>

                        <p className="text-sm text-slate-600 flex items-center gap-1 mb-2">
                          <MapPin size={16} className="text-slate-400" />
                          {business.address || "주소 없음"}
                        </p>

                        <div className="flex gap-6 text-sm">
                          <span>리뷰 {reviews}개</span>
                          <span>{rating}★ 평균</span>
                          <span>{business.category || "카테고리 없음"}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/owner/reservations?businessId=${business.businessId}`)}
                        >
                          예약 관리
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/owner/menu-ocr?businessId=${business.businessId}`)}
                        >
                          통계 보기
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
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

      {/* ============ 사업자 정보 수정 모달 ============ */}
      <Modal
        isOpen={modalType === "edit"}
        onClose={closeModal}
        title="사업자 정보 수정"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="사업자 이름"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              전화번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="010-1234-5678"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              사업자등록번호
            </label>
            <input
              type="text"
              value={editForm.businessNumber}
              onChange={(e) =>
                setEditForm({ ...editForm, businessNumber: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="123-45-67890"
            />
            <p className="text-xs text-slate-500 mt-1">
              하이픈(-)을 포함하여 입력해주세요
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={editLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {editLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                "저장"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={editLoading}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </form>
      </Modal>

      {/* 알림 설정 모달 */}
      <Modal
        isOpen={modalType === "alert"}
        onClose={closeModal}
        title="알림 설정"
      >
        <p className="text-slate-600">알림 설정 기능은 곧 추가될 예정입니다.</p>
      </Modal>

      {/* 회원 탈퇴 모달 */}
      <Modal
        isOpen={modalType === "withdraw"}
        onClose={closeModal}
        title="회원 탈퇴"
      >
        <div className="space-y-4">
          <p className="text-slate-700">정말로 탈퇴하시겠습니까?</p>
          <p className="text-sm text-red-600">
            탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                alert("탈퇴 기능은 곧 추가될 예정입니다.");
                closeModal();
              }}
            >
              탈퇴하기
            </Button>
            <Button variant="outline" onClick={closeModal} className="flex-1">
              취소
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default OwnerMyPage;
