/**
 * 메뉴 OCR 관리 페이지
 *
 * 메뉴판 사진을 업로드하여 AI가 자동으로 메뉴와 가격을 인식
 * - 드래그 앤 드롭 파일 업로드
 * - OCR 결과 편집 가능
 * - 기존 메뉴 관리
 */

import { useState } from 'react';
import { Camera, Upload, X, Edit2, Trash2, Check, AlertCircle, Plus } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

const MenuOCR = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // 더미 OCR 결과
  const mockOCRResult = [
    {
      id: 1,
      name: "짜장면",
      price: 8000,
      category: "중식",
      confidence: 98,
      status: "confirmed"
    },
    {
      id: 2,
      name: "짬뽕",
      price: 9000,
      category: "중식",
      confidence: 97,
      status: "confirmed"
    },
    {
      id: 3,
      name: "탕수육(소)",
      price: 15000,
      category: "중식",
      confidence: 95,
      status: "confirmed"
    },
    {
      id: 4,
      name: "탕수육(대)",
      price: 25000,
      category: "중식",
      confidence: 96,
      status: "confirmed"
    },
    {
      id: 5,
      name: "볶음밥",
      price: "8,OOO",
      category: "중식",
      confidence: 65,
      status: "needs_review"
    }
  ];

  // 더미 기존 메뉴
  const [existingMenu, setExistingMenu] = useState([
    {
      id: 1,
      name: "짜장면",
      price: 8000,
      category: "중식",
      isPopular: true,
      orderCount: 156
    },
    {
      id: 2,
      name: "짬뽕",
      price: 9000,
      category: "중식",
      orderCount: 89
    },
    {
      id: 3,
      name: "김치찌개",
      price: 9000,
      category: "한식",
      orderCount: 45
    },
    {
      id: 4,
      name: "된장찌개",
      price: 8000,
      category: "한식",
      orderCount: 38
    }
  ]);

  const categories = ['전체', '중식', '한식', '일식', '양식', '음료'];

  // 파일 업로드 핸들러
  const handleFileUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setToast({ show: true, message: '이미지 파일만 업로드 가능합니다', type: 'error' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setToast({ show: true, message: '파일 크기는 10MB 이하여야 합니다', type: 'error' });
      return;
    }

    setIsProcessing(true);

    // 3초 후 더미 결과 표시
    setTimeout(() => {
      setOcrResult(mockOCRResult);
      setIsProcessing(false);
      setToast({ show: true, message: '메뉴판 인식 완료! 결과를 확인해주세요.', type: 'success' });
    }, 3000);
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

  // OCR 결과 삭제
  const handleDeleteOCRItem = (id) => {
    setOcrResult(ocrResult.filter(item => item.id !== id));
  };

  // OCR 결과 등록
  const handleRegisterMenu = () => {
    const confirmedItems = ocrResult.filter(item => item.status === 'confirmed');
    if (confirmedItems.length === 0) {
      setToast({ show: true, message: '등록할 메뉴가 없습니다', type: 'error' });
      return;
    }

    setToast({ show: true, message: `${confirmedItems.length}개 메뉴가 등록되었습니다!`, type: 'success' });
    setOcrResult([]);
  };

  // 기존 메뉴 삭제
  const handleDeleteExistingMenu = (id) => {
    setExistingMenu(existingMenu.filter(item => item.id !== id));
    setToast({ show: true, message: '메뉴가 삭제되었습니다', type: 'success' });
  };

  // 필터된 메뉴
  const filteredMenu = selectedCategory === '전체'
    ? existingMenu
    : existingMenu.filter(item => item.category === selectedCategory);

  // 인식 정확도 계산
  const accuracy = ocrResult.length > 0
    ? Math.round((ocrResult.filter(item => item.status === 'confirmed').length / ocrResult.length) * 100)
    : 0;

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
            메뉴판 사진만 찍으면 AI가 자동으로 메뉴와 가격을 인식하여 등록합니다!
          </p>
        </div>

        {/* 파일 업로드 영역 */}
        <Card className="mb-8">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
              isDragging
                ? 'border-primary-green bg-light-green bg-opacity-10'
                : 'border-border-color hover:border-primary-green'
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
                  여기에 이미지를 드래그하세요<br />
                  (JPG, PNG 최대 10MB)
                </p>
                <div>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <Button className="cursor-pointer">
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
            <h4 className="font-semibold text-text-primary mb-2">💡 촬영 팁:</h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• 메뉴판이 화면에 꽉 차게 촬영하세요</li>
              <li>• 조명이 밝은 곳에서 촬영하세요</li>
              <li>• 글씨가 선명하게 보이도록 초점을 맞추세요</li>
            </ul>
          </div>
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
                  인식 정확도: <span className="font-bold text-primary-green">{accuracy}%</span>
                </span>
                <span className="text-sm text-text-secondary">
                  ({ocrResult.filter(item => item.status === 'confirmed').length}개 확인 /
                  {ocrResult.filter(item => item.status === 'needs_review').length}개 검토 필요)
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {ocrResult.map(item => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 ${
                    item.status === 'needs_review'
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-border-color'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                      <div>
                        <span className="font-semibold text-text-primary">{item.name}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">{item.price.toLocaleString()}원</span>
                      </div>
                      <div>
                        <span className="px-3 py-1 bg-light-green bg-opacity-20 text-primary-green rounded-full text-sm">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.status === 'confirmed' ? (
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
                            message: '메뉴 수정을 준비 중입니다',
                            type: 'info',
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
                        onClick={() => handleDeleteOCRItem(item.id)}
                      >
                        <Trash2 size={16} className="mr-1" />
                        삭제
                      </Button>
                    </div>
                  </div>
                  {item.status === 'needs_review' && (
                    <div className="mt-2 text-sm text-yellow-700">
                      → 가격 확인 필요 (인식 불확실: {item.confidence}%)
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border-color">
              <Button variant="outline" onClick={() => setOcrResult([])}>
                전체 취소
              </Button>
              <Button onClick={handleRegisterMenu}>
                <Check size={20} className="mr-2" />
                수정 완료 후 등록하기
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

          {/* 카테고리 필터 */}
          <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-primary-green text-white'
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* 메뉴 목록 */}
          <div className="space-y-3">
            {filteredMenu.map(menu => (
              <div
                key={menu.id}
                className="border border-border-color rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg font-bold text-text-primary">{menu.name}</span>
                      {menu.isPopular && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-semibold">
                          인기 메뉴 🔥
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-text-secondary">
                      <span className="font-semibold text-text-primary text-lg">
                        {menu.price.toLocaleString()}원
                      </span>
                      <span className="px-2 py-1 bg-light-green bg-opacity-20 text-primary-green rounded">
                        {menu.category}
                      </span>
                      <span>주문 {menu.orderCount}회</span>
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
