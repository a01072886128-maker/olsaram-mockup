import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { useAuth } from "../../contexts/AuthContext";
import { ownerAPI } from "../../services/owner";
import Modal from "../../components/Modal";
import PageLayout from "../../components/Layout";

function OwnerMyPage() {
  const { user } = useAuth();
  const ownerId = user?.ownerId;
  const navigate = useNavigate();

  const [modalType, setModalType] = useState(null);
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    email: "",
    businessNumber: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  const closeModal = () => setModalType(null);

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
      <PageLayout userType="owner">
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          프로필 로딩 중...
        </div>
      </PageLayout>
    );
  }

  if (!ownerProfile) {
    return (
      <PageLayout userType="owner">
        <p className="text-center text-slate-500">프로필 정보를 불러올 수 없습니다.</p>
      </PageLayout>
    );
  }

  const joinedAt = ownerProfile.createdAt
    ? new Date(ownerProfile.createdAt).toLocaleDateString("ko-KR")
    : "-";

  return (
    <PageLayout userType="owner">
      <div className="space-y-10">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-primary-green/20 blur-3xl" />
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            <div className="flex items-center justify-center rounded-3xl bg-white/10 p-3 shadow-inner">
              <Avatar className="h-24 w-24 bg-white">
                <AvatarFallback className="text-3xl text-slate-900 font-semibold">
                  {ownerProfile.name?.[0] || "사"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <h1 className="text-3xl font-semibold tracking-tight">{ownerProfile.name}</h1>
                <Badge className="bg-emerald-400 text-slate-900">사업자</Badge>
              </div>
              <p className="text-base text-slate-200">
                {ownerProfile.phone}
                {ownerProfile.email ? ` · ${ownerProfile.email}` : ""}
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="rounded-2xl bg-white/10 px-4 py-2">
                  가입일: <strong className="text-white">{joinedAt}</strong>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-2">
                  사업자등록번호: {" "}
                  <strong className="text-white">
                    {ownerProfile.businessNumber || "미등록"}
                  </strong>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section className="space-y-6 rounded-3xl bg-white px-6 py-6 shadow-lg">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-slate-400">주요 관리</p>
            <h2 className="text-2xl font-semibold text-slate-900">설정 & 액션</h2>
          </div>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="space-y-4 px-5 pt-10 pb-10">
              {[{
                title: "사업자 정보 수정",
                desc: "이름, 연락처, 이메일, 사업자등록번호를 변경합니다.",
                action: () => setModalType("edit"),
                danger: false,
              },
              {
                title: "알림 설정",
                desc: "푸시·이메일 알림을 관리합니다.",
                action: () => setModalType("alert"),
                danger: false,
              },
              {
                title: "회원 탈퇴",
                desc: "계정 및 예약 정보를 삭제합니다.",
                action: () => setModalType("withdraw"),
                danger: true,
              }].map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={item.danger ? "border-red-300 text-red-600 hover:bg-red-50" : "border-slate-300"}
                    onClick={item.action}
                  >
                    {item.title}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>

      <PrivacyModal
        isOpen={modalType === "edit"}
        onClose={closeModal}
        editForm={editForm}
        setEditForm={setEditForm}
        handleEditSubmit={handleEditSubmit}
        editLoading={editLoading}
      />
      <AlertModal isOpen={modalType === "alert"} onClose={closeModal} />
      <WithdrawModal isOpen={modalType === "withdraw"} onClose={closeModal} />
    </PageLayout>
  );
}

function PrivacyModal({ isOpen, onClose, editForm, setEditForm, handleEditSubmit, editLoading }) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="사업자 정보 수정">
      <form onSubmit={handleEditSubmit} className="space-y-4 pt-2 pb-2">
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
          <label className="block text-sm font-medium text-slate-700 mb-1">이메일</label>
          <input
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">사업자등록번호</label>
          <input
            type="text"
            value={editForm.businessNumber}
            onChange={(e) => setEditForm({ ...editForm, businessNumber: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="123-45-67890"
          />
          <p className="text-xs text-slate-500 mt-1">하이픈(-)을 포함하여 입력해주세요</p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={editLoading} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
            {editLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              "저장"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={editLoading} className="flex-1">
            취소
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function AlertModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="알림 설정">
      <div className="space-y-4 text-sm text-slate-600">
        <p>알림 설정 기능은 곧 추가될 예정입니다.</p>
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function WithdrawModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="회원 탈퇴">
      <div className="space-y-4">
        <p className="text-slate-700">정말로 탈퇴하시겠습니까?</p>
        <p className="text-sm text-red-600">탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.</p>
        <div className="flex gap-3 pt-4">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => {
              alert("탈퇴 기능은 곧 추가될 예정입니다.");
              onClose();
            }}
          >
            탈퇴하기
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            취소
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default OwnerMyPage;
