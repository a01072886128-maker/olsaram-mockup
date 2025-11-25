import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";

import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ownerAPI } from "../../services/owner";

function OwnerMyPage() {
  const { user } = useAuth();
  const ownerId = user?.ownerId;
  const navigate = useNavigate();

  const [modalType, setModalType] = useState(null);
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
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
          <p className="text-center text-slate-500">
            프로필 정보를 불러올 수 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userType="owner" />

      {/* ------------------------------ Main ------------------------------ */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* 프로필 카드 (핵심 정보 중심) */}
        <Card className="mb-6 border-slate-200 bg-white shadow-sm">
          <CardContent className="px-6 py-5 md:px-8 md:py-6 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 bg-green-100">
                  <AvatarFallback className="text-2xl text-green-700 font-semibold">
                    {ownerProfile.name?.[0] || "사"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold text-slate-900">
                      {ownerProfile.name}
                    </h2>
                    <Badge className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                      사업자
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    {ownerProfile.phone}
                    {ownerProfile.email ? ` · ${ownerProfile.email}` : ""}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalType("edit")}
                className="border-slate-300 text-slate-700 hover:border-slate-400"
              >
                내 정보 수정
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span>가입일:</span>
              <span className="font-medium text-slate-900">
                {ownerProfile.createdAt
                  ? new Date(ownerProfile.createdAt).toLocaleDateString("ko-KR")
                  : "-"}
              </span>
            </div>

            <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <div className="text-xs font-semibold text-slate-500 mb-1">
                사업자등록번호
              </div>
              <div className="font-mono text-base text-slate-900">
                {ownerProfile.businessNumber || "미등록"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 간편 링크 섹션 */}
        <Card className="border-slate-200">
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-500">
                주요 관리 페이지로 이동하면 상세한 가게/예약 데이터를 확인할 수 있습니다.
              </p>
              <p className="text-lg font-semibold text-slate-900 mt-1">
                내 가게 관리 바로가기
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/owner/my-businesses")}
            >
              내 가게 페이지 이동
            </Button>
          </CardContent>
        </Card>
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
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
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
              onChange={(e) =>
                setEditForm({ ...editForm, phone: e.target.value })
              }
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
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
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
