/**
 * 메뉴 OCR 관리 페이지
 *
 * 메뉴판 사진을 업로드하여 AI가 자동으로 메뉴와 가격을 인식
 * - 드래그 앤 드롭 파일 업로드
 * - OCR 결과 편집 가능
 * - 기존 메뉴 관리
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  Upload,
  X,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Plus,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Toast from "../../components/Toast";
import { useAuth } from "../../contexts/AuthContext";
import { menuAPI } from "../../services/menu";

const MenuOCR = () => {
  const { user } = useAuth();
  const ownerId = user?.ownerId;

  // TODO: 실제 비즈니스 선택 기능 추가 필요
  // 현재는 임시로 businessId를 1로 설정
  // eslint-disable-next-line no-unused-vars
  const [businessId, setBusinessId] = useState(1);

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState([]); // 임시 OCR 결과 (아직 DB에 저장되지 않음)
  const [isSaving, setIsSaving] = useState(false); // 저장 중 상태
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [existingMenu, setExistingMenu] = useState([]);
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);

  const fetchExistingMenus = useCallback(async () => {
    if (!ownerId || !businessId) {
      return;
    }

    setIsMenuLoading(true);
    try {
      const data = await menuAPI.fetchMenus(ownerId, businessId);
      setExistingMenu(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setToast({
        show: true,
        message: error.message || "메뉴를 불러오지 못했습니다.",
        type: "error",
      });
    } finally {
      setIsMenuLoading(false);
    }
  }, [ownerId, businessId]);

  useEffect(() => {
    fetchExistingMenus();
  }, [fetchExistingMenus]);

  // 파일 업로드 핸들러
  const handleFileUpload = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setToast({
        show: true,
        message: "이미지 파일만 업로드 가능합니다",
        type: "error",
      });
      return;
    }

    if (!ownerId) {
      setToast({
        show: true,
        message: "로그인 후 이용해주세요.",
        type: "error",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setToast({
        show: true,
        message: "파일 크기는 10MB 이하여야 합니다",
        type: "error",
      });
      return;
    }

    // 이미지 미리보기 설정
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
    };
    reader.readAsDataURL(file);

    setIsProcessing(true);

    try {
      const response = await menuAPI.uploadMenuImage({ ownerId, businessId, file });
      // OCR 결과를 임시 상태로 저장 (DB에 저장되지 않음)
      setOcrResult(response?.items ?? []);
      setToast({
        show: true,
        message: response?.message || "메뉴판 인식 완료! 결과를 확인 후 저장해주세요.",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      setToast({
        show: true,
        message: error.message || "메뉴판을 분석하지 못했습니다.",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 메뉴 목록 일괄 저장
  const handleSaveMenuList = async () => {
    if (!ownerId) {
      setToast({
        show: true,
        message: "로그인 후 이용해주세요.",
        type: "error",
      });
      return;
    }

    if (ocrResult.length === 0) {
      setToast({
        show: true,
        message: "저장할 메뉴가 없습니다.",
        type: "error",
      });
      return;
    }

    setIsSaving(true);

    try {
      // OCR 결과를 Menu 형식으로 변환
      const menus = ocrResult.map((item) => ({
        menuName: item.name,
        price: item.price,
        category: item.category || "미분류",
        confidence: item.confidence,
        status: item.status,
        rawText: item.rawText,
        sourceImage: item.sourceImage,
        isAvailable: true,
        isPopular: false,
        displayOrder: 0,
        orderCount: 0,
      }));

      await menuAPI.saveMenuBatch(ownerId, businessId, menus);

      setToast({
        show: true,
        message: `${ocrResult.length}개의 메뉴가 성공적으로 저장되었습니다.`,
        type: "success",
      });

      // 저장 후 OCR 결과 초기화 및 기존 메뉴 목록 새로고침
      setOcrResult([]);
      setUploadedImage(null);
      await fetchExistingMenus();
    } catch (error) {
      console.error(error);
      setToast({
        show: true,
        message: error.message || "메뉴 저장에 실패했습니다.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Drag & Drop 핸들러
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  // OCR 결과 삭제 (임시 상태에서만 제거, DB 삭제 아님)
  const handleDeleteOCRItem = (index) => {
    setOcrResult(ocrResult.filter((_, i) => i !== index));
    setToast({
      show: true,
      message: "임시 목록에서 제거되었습니다.",
      type: "success",
    });
  };

  // 기존 메뉴 삭제
  const handleDeleteExistingMenu = async (id) => {
    if (!ownerId) {
      return;
    }

    try {
      await menuAPI.deleteMenu(ownerId, id);
      setExistingMenu(existingMenu.filter((item) => item.id !== id));
      setOcrResult(ocrResult.filter((item) => item.id !== id));
      setToast({
        show: true,
        message: "메뉴가 삭제되었습니다",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      setToast({
        show: true,
        message: error.message || "메뉴 삭제에 실패했습니다.",
        type: "error",
      });
    }
  };


  // 메뉴 목록 (필터링 없음)
  const filteredMenu = existingMenu;

  // 인식 정확도 계산
  const accuracy =
    ocrResult.length > 0
      ? Math.round(
          (ocrResult.filter((item) => item.status === "CONFIRMED").length /
            ocrResult.length) *
            100
        )
      : 0;

  const categoryLabel = useCallback((category) => category || "미분류", []);

  const renderPrice = useCallback((price) => {
    if (typeof price === "number") {
      return `${price.toLocaleString()}원`;
    }
    return "가격 확인 필요";
  }, []);

  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar userType="owner" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center">
            <Camera className="mr-3 text-primary-green" size={32} />
            메뉴판 자동 등록
          </h1>
          <p className="text-text-secondary">
            메뉴판 사진만 찍으면 AI가 자동으로 메뉴와 가격을 인식하여
            등록합니다!
          </p>
        </div>

        {!ownerId && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700">
            로그인이 필요한 기능입니다. 먼저 로그인한 뒤 다시 시도해주세요.
          </div>
        )}

        {/* 파일 업로드 영역 */}
        <Card className="mb-8">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
              isDragging
                ? "border-primary-green bg-light-green bg-opacity-10"
                : "border-border-color hover:border-primary-green"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isProcessing ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-green"></div>
                </div>
                <p className="text-lg font-semibold text-text-primary">
                  AI가 메뉴판을 분석하고 있습니다...
                </p>
                <p className="text-sm text-text-secondary">
                  잠시만 기다려주세요 (약 3초 소요)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-green to-primary-purple rounded-full flex items-center justify-center">
                    <Camera className="text-white" size={40} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-text-primary">
                  📷 사진 촬영하기 또는 이미지 업로드
                </h3>
                <p className="text-text-secondary">
                  여기에 이미지를 드래그하세요
                  <br />
                  (JPG, PNG 최대 10MB)
                </p>
                <div>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                      ref={fileInputRef}
                    />
                    <Button
                      type="button"
                      className="cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={20} className="mr-2" />
                      파일 선택하기
                    </Button>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* 촬영 팁 */}
          <div className="mt-6 bg-light-green bg-opacity-10 rounded-lg p-4">
            <h4 className="font-semibold text-text-primary mb-2">
              💡 촬영 팁:
            </h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• 메뉴판이 화면에 꽉 차게 촬영하세요</li>
              <li>• 조명이 밝은 곳에서 촬영하세요</li>
              <li>• 글씨가 선명하게 보이도록 초점을 맞추세요</li>
            </ul>
          </div>

          {/* 업로드된 이미지 미리보기 */}
          {uploadedImage && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                📷 업로드된 이미지
              </h3>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden max-h-96">
                <img
                  src={uploadedImage}
                  alt="업로드된 메뉴판"
                  className="w-full h-auto object-cover"
                />
                <button
                  onClick={() => {
                    setUploadedImage(null);
                    setOcrResult([]);
                  }}
                  className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                  title="이미지 제거"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* OCR 인식 결과 */}
        {ocrResult.length > 0 && (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">
                📋 인식 결과 (수정 가능)
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-text-secondary">
                  인식 정확도:{" "}
                  <span className="font-bold text-primary-green">
                    {accuracy}%
                  </span>
                </span>
                <span className="text-sm text-text-secondary">
                  (
                  {
                    ocrResult.filter((item) => item.status === "CONFIRMED")
                      .length
                  }
                  개 확인 /
                  {
                    ocrResult.filter((item) => item.status === "NEEDS_REVIEW")
                      .length
                  }
                  개 검토 필요)
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {ocrResult.map((item, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    item.status === "NEEDS_REVIEW"
                      ? "border-yellow-300 bg-yellow-50"
                      : "border-border-color"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                      <div>
                        <span className="font-semibold text-text-primary">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-text-secondary">
                        {renderPrice(item.price)}
                      </div>
                      <div>
                        <span className="px-3 py-1 bg-light-green bg-opacity-20 text-primary-green rounded-full text-sm">
                          {categoryLabel(item.category)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.status === "CONFIRMED" ? (
                          <span className="flex items-center text-primary-green text-sm">
                            <Check size={16} className="mr-1" />
                            확인됨
                          </span>
                        ) : (
                          <span className="flex items-center text-yellow-600 text-sm">
                            <AlertCircle size={16} className="mr-1" />
                            확인 필요
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setToast({
                            show: true,
                            message: "메뉴 수정을 준비 중입니다",
                            type: "info",
                          })
                        }
                      >
                        <Edit2 size={16} className="mr-1" />
                        수정
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteOCRItem(index)}
                      >
                        <Trash2 size={16} className="mr-1" />
                        삭제
                      </Button>
                    </div>
                  </div>
                  {item.status === "NEEDS_REVIEW" && (
                    <div className="mt-2 text-sm text-yellow-700">
                      → 가격 확인 필요 (인식 불확실: {item.confidence ?? 0}%)
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border-color">
              <Button variant="outline" onClick={() => setOcrResult([])}>
                전체 취소
              </Button>
              <Button
                onClick={handleSaveMenuList}
                disabled={isSaving}
                className={isSaving ? "opacity-50 cursor-not-allowed" : ""}
              >
                <Check size={20} className="mr-2" />
                {isSaving ? "저장 중..." : "메뉴 목록 저장하기"}
              </Button>
            </div>
          </Card>
        )}

        {/* 현재 등록된 메뉴 */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">
              📋 현재 등록된 메뉴 ({existingMenu.length}개)
            </h2>
            <Button size="sm">
              <Plus size={16} className="mr-1" />
              메뉴 직접 추가
            </Button>
          </div>

          {/* 메뉴 목록 */}
          {isMenuLoading ? (
            <div className="text-center py-12 text-text-secondary">
              메뉴를 불러오는 중입니다...
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {filteredMenu.map((menu) => (
                  <div
                    key={menu.id}
                    className="border border-border-color rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-lg font-bold text-text-primary">
                            {menu.name}
                          </span>
                          {menu.popular && (
                            <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-semibold">
                              인기 메뉴 🔥
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-text-secondary">
                          <span className="font-semibold text-text-primary text-lg">
                            {renderPrice(menu.price)}
                          </span>
                          <span className="px-2 py-1 bg-light-green bg-opacity-20 text-primary-green rounded">
                            {categoryLabel(menu.category)}
                          </span>
                          <span>주문 {menu.orderCount ?? 0}회</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit2 size={16} className="mr-1" />
                          수정
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteExistingMenu(menu.id)}
                        >
                          <Trash2 size={16} className="mr-1" />
                          삭제
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredMenu.length === 0 && (
                <div className="text-center py-12 text-text-secondary">
                  <p>해당 카테고리에 등록된 메뉴가 없습니다</p>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Toast 알림 */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default MenuOCR;
