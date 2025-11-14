/**
 * 내 주변 맛집 찾기 - 카카오맵 기반
 *
 * 네이버 지도 스타일 레이아웃:
 * - 상단: 필터 영역
 * - 중앙: 지도 (네모 상자)
 * - 하단: 맛집 리스트
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Star,
  Clock,
  LogOut,
  Loader2,
  ChevronDown,
  Check,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Card, CardContent } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { storeAPI } from '../../services/store';

const DEFAULT_LOCATION = {
  lat: 35.1495,
  lng: 126.9173,
  name: '광주 금남로',
};

const CATEGORIES = [
  { id: 'all', name: '전체', icon: '🍽️' },
  { id: 'korean', name: '한식', icon: '🍚' },
  { id: 'recommended', name: '우리추천', icon: '⭐' },
  { id: 'japanese', name: '이자카야', icon: '🍶' },
];

const DISTANCE_FILTERS = [
  { value: 800, label: '800m' },
  { value: 1000, label: '1km' },
  { value: 3000, label: '3km' },
  { value: 5000, label: '5km' },
  { value: 10000, label: '10km' },
];

const SORT_OPTIONS = ['추천순', '거리순', '평점순', '리뷰순'];

function NearbyStores() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // 상태 관리
  const [step, setStep] = useState('initial');
  const [location, setLocation] = useState(null);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 필터 & UI
  const [radiusFilter, setRadiusFilter] = useState(800);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [showRadiusDropdown, setShowRadiusDropdown] = useState(false);

  // 모달
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // 페이지 진입 시 위치 권한 모달 표시
  useEffect(() => {
    if (step === 'initial') {
      setShowPermissionModal(true);
    }
  }, [step]);

  // 위치 권한 허용
  const handleAllowLocation = () => {
    setShowPermissionModal(false);
    setStep('requesting');
    setIsLoading(true);

    if (!navigator.geolocation) {
      console.error('❌ Geolocation API 미지원');
      setLocation(DEFAULT_LOCATION);
      setStep('located');
      fetchNearbyStores(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, radiusFilter);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('✅ 위치 획득 성공:', latitude, longitude);
        setLocation({ lat: latitude, lng: longitude, name: '현재 위치' });
        setStep('located');
        fetchNearbyStores(latitude, longitude, radiusFilter);
      },
      (error) => {
        console.error('❌ 위치 권한 오류:', error);
        setLocation(DEFAULT_LOCATION);
        setStep('located');
        fetchNearbyStores(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, radiusFilter);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // 위치 권한 나중에
  const handleDenyLocation = () => {
    setShowPermissionModal(false);
    setLocation(DEFAULT_LOCATION);
    setStep('located');
    fetchNearbyStores(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, radiusFilter);
  };

  // 맛집 검색
  const fetchNearbyStores = async (lat, lng, radius) => {
    try {
      setIsLoading(true);
      const data = await storeAPI.getNearbyStores(lat, lng, radius);
      setStores(data.stores || data || []);
    } catch (err) {
      console.error('맛집 검색 오류:', err);
      setStores([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 반경 필터 변경
  const handleRadiusChange = (newRadius) => {
    setRadiusFilter(newRadius);
    setShowRadiusDropdown(false);
    if (location && location.lat && location.lng) {
      fetchNearbyStores(location.lat, location.lng, newRadius);
    }
  };

  // 카테고리 매핑
  const getCategoryKey = (category) => {
    const mapping = {
      '한식': 'korean',
      '중식': 'chinese',
      '일식': 'japanese',
      '양식': 'western',
      '카페': 'cafe',
      '분식': 'snack',
    };
    return mapping[category] || 'all';
  };

  // 필터링된 맛집 목록
  const filteredStores = stores.filter((store) => {
    if (categoryFilter !== 'all' && getCategoryKey(store.category) !== categoryFilter) {
      return false;
    }
    if (showTodayOnly && !store.availableToday) {
      return false;
    }
    return true;
  });

  // 카카오맵 초기화
  useEffect(() => {
    if (step === 'located' && location && mapRef.current) {
      // 카카오 SDK 로드 대기 (최대 5초)
      let attempts = 0;
      const maxAttempts = 50;

      const checkKakaoLoaded = () => {
        if (window.kakao && window.kakao.maps) {
          console.log('✅ Kakao Maps SDK loaded successfully');
          window.kakao.maps.load(() => {
            initializeMap();
          });
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkKakaoLoaded, 100);
        } else {
          console.error('❌ Kakao Maps SDK failed to load after 5 seconds');
        }
      };

      checkKakaoLoaded();
    }
  }, [step, location]);

  // 맵 마커 업데이트
  useEffect(() => {
    if (mapInstance.current && filteredStores.length > 0) {
      updateMapMarkers();
    }
  }, [filteredStores]);

  const initializeMap = () => {
    if (!window.kakao || !window.kakao.maps) {
      console.error('Kakao Maps SDK not loaded');
      return;
    }

    const container = mapRef.current;
    const zoomLevel = radiusFilter <= 1000 ? 3 : radiusFilter <= 3000 ? 5 : 7;

    const options = {
      center: new window.kakao.maps.LatLng(location.lat, location.lng),
      level: zoomLevel,
    };

    const map = new window.kakao.maps.Map(container, options);
    mapInstance.current = map;

    // 현재 위치 마커
    const currentMarkerContent = '<div style="width:24px;height:24px;background:#4285f4;border:4px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>';
    const currentMarker = new window.kakao.maps.CustomOverlay({
      position: new window.kakao.maps.LatLng(location.lat, location.lng),
      content: currentMarkerContent,
      yAnchor: 0.5,
    });
    currentMarker.setMap(map);
  };

  const updateMapMarkers = () => {
    if (!mapInstance.current) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 새 마커 추가
    filteredStores.forEach((store) => {
      if (store.latitude && store.longitude) {
        const lat = parseFloat(store.latitude);
        const lng = parseFloat(store.longitude);
        const position = new window.kakao.maps.LatLng(lat, lng);

        const marker = new window.kakao.maps.Marker({
          position: position,
          map: mapInstance.current,
        });

        markersRef.current.push(marker);
      }
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const selectedRadiusLabel = DISTANCE_FILTERS.find(f => f.value === radiusFilter)?.label || '800m';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors">
              올사람
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link to="/customer/search" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                가게 검색
              </Link>
              <Link to="/customer/nearby" className="text-sm text-slate-900 font-semibold border-b-2 border-blue-600 pb-4">
                내 주변 맛집
              </Link>
              <Link to="/customer/mypage" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                마이페이지
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user?.name || '고객'}님</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* 위치 권한 요청 모달 */}
      <Dialog open={showPermissionModal} onClose={() => {}}>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <DialogTitle className="text-center">내 주변 맛집을 찾아드립니다</DialogTitle>
          <DialogDescription className="text-center">
            현재 위치를 기반으로 가까운 맛집을 추천해드립니다.
            <br />
            위치 권한을 허용해주세요.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleDenyLocation} className="w-full sm:w-auto">
            나중에
          </Button>
          <Button onClick={handleAllowLocation} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
            <MapPin className="w-4 h-4 mr-2" />
            허용하기
          </Button>
        </DialogFooter>
      </Dialog>

      {/* 로딩 중 */}
      {isLoading && step === 'requesting' && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
          <p className="text-lg font-medium text-slate-700">주변 맛집을 찾고 있습니다...</p>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      {step === 'located' && (
        <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
          <div className="container mx-auto px-4 py-4">
            {/* 상단 필터 영역 */}
            <div className="space-y-3 mb-4">
              {/* 거리 필터 드롭다운 */}
              <div className="relative inline-block">
                <button
                  onClick={() => setShowRadiusDropdown(!showRadiusDropdown)}
                  className="bg-white rounded-lg shadow px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <span className="font-semibold text-slate-900">주변 {selectedRadiusLabel}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {showRadiusDropdown && (
                  <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[120px] z-20">
                    {DISTANCE_FILTERS.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => handleRadiusChange(filter.value)}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                          radiusFilter === filter.value ? 'text-blue-600 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <span>{filter.label}</span>
                        {radiusFilter === filter.value && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 필터 바 */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-3 space-y-3">
                {/* 정렬 옵션 */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {SORT_OPTIONS.map((option) => (
                    <Button key={option} variant="outline" size="sm" className="flex-shrink-0 rounded-full">
                      {option}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" className="flex-shrink-0 rounded-full">
                    필터
                  </Button>
                  <Button variant="outline" size="sm" className="flex-shrink-0 rounded-full">
                    내 주변
                  </Button>
                </div>

                {/* 카테고리 아이콘 버튼 */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all flex-shrink-0 min-w-[70px] ${
                        categoryFilter === cat.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl mb-1">{cat.icon}</span>
                      <span className={`text-xs font-medium ${
                        categoryFilter === cat.id ? 'text-blue-600' : 'text-slate-700'
                      }`}>
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* 오늘예약 매장 보기 체크박스 */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="todayOnly"
                    checked={showTodayOnly}
                    onChange={(e) => setShowTodayOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="todayOnly" className="flex items-center gap-1 text-sm font-medium text-slate-700 cursor-pointer">
                    <Zap className="w-4 h-4 text-orange-500" />
                    오늘예약 매장 보기
                  </label>
                </div>
              </div>
            </div>

            {/* 지도와 리스트 그리드 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 왼쪽: 지도 */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden" style={{ height: '500px' }}>
                <div ref={mapRef} className="w-full h-full" />
              </div>

              {/* 오른쪽: 맛집 리스트 */}
              <div className="space-y-3" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : filteredStores.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">주변에 맛집이 없습니다</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredStores.map((store, index) => (
                    <motion.div
                      key={store.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            {/* 이미지 */}
                            {store.imageUrl && (
                              <img
                                src={store.imageUrl}
                                alt={store.name}
                                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                              />
                            )}

                            {/* 매장 정보 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <h3 className="font-bold text-lg text-slate-900 truncate">
                                  {store.name}
                                </h3>
                                {store.distance !== null && (
                                  <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">
                                    {store.distance < 1
                                      ? `${Math.round(store.distance * 1000)}m`
                                      : `${store.distance.toFixed(1)}km`}
                                  </Badge>
                                )}
                              </div>

                              {/* 평점 */}
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span className="font-bold text-sm">{store.rating?.toFixed(1) || '0.0'}</span>
                                </div>
                                <span className="text-xs text-slate-500">({store.reviewCount || 0})</span>
                                <Badge variant="secondary" className="text-xs">{store.category}</Badge>
                              </div>

                              {/* 영업 시간 */}
                              <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
                                <Clock className="w-3 h-3" />
                                <span>브레이크타임 · 17:30 영업 시작</span>
                              </div>

                              <p className="text-xs text-slate-500 truncate">
                                {store.address}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NearbyStores;
