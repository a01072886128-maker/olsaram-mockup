/**
 * 내 주변 맛집 찾기 - 카카오맵 기반
 *
 * 네이버 지도 스타일 레이아웃:
 * - 상단: 필터 영역
 * - 중앙: 지도 (네모 상자)
 * - 하단: 맛집 리스트
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  Clock,
  Loader2,
  ChevronDown,
  Check,
  Zap,
  Search,
  Mic,
  TrendingDown,
  Shield,
  Users2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import Navbar from "../../components/Navbar";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Card, CardContent } from "../../components/ui/card";
import { storeAPI } from "../../services/store";

const DEFAULT_LOCATION = {
  lat: 35.1495,
  lng: 126.9173,
  name: "광주 금남로",
};

const LOCATION_CONSENT_COOKIE = "olsaram_location_consent";

const setCookie = (name, value, days = 30) => {
  if (typeof document === "undefined") return;
  const expiration = new Date();
  expiration.setTime(expiration.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expiration.toUTCString()};path=/`;
};

const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return null;
};

const CATEGORIES = [
  { id: "all", name: "전체", icon: "🍽️" },
  { id: "korean", name: "한식", icon: "🍚" },
  { id: "recommended", name: "우리추천", icon: "⭐" },
  { id: "japanese", name: "이자카야", icon: "🍶" },
];

const DISTANCE_FILTERS = [
  { value: 800, label: "800m" },
  { value: 1000, label: "1km" },
  { value: 3000, label: "3km" },
  { value: 5000, label: "5km" },
  { value: 10000, label: "10km" },
];

const SORT_OPTIONS = ["추천순", "거리순", "평점순", "리뷰순"];

function NearbyStores() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // 상태 관리
  const [step, setStep] = useState("initial");
  const [location, setLocation] = useState(null);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 검색 관련
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // UI 필터
  const [radiusFilter, setRadiusFilter] = useState(5000);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [showRadiusDropdown, setShowRadiusDropdown] = useState(false);

  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // 카카오 지도 스크립트 로드
  useEffect(() => {
    const kakaoMapKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
    if (!document.getElementById("kakao-map-script")) {
      const script = document.createElement("script");
      script.id = "kakao-map-script";
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapKey}&libraries=services&autoload=false`;
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const fetchNearbyStores = useCallback(async (lat, lng, radius) => {
    try {
      setIsLoading(true);
      const data = await storeAPI.getNearbyStores(lat, lng, radius);
      setStores(data.stores || data || []);
    } catch (err) {
      console.error("매장 검색 오류:", err);
      setStores([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const beginLocationLookup = useCallback(() => {
    setStep("requesting");
    setIsLoading(true);

    const useDefaultLocation = () => {
      setLocation(DEFAULT_LOCATION);
      setStep("located");
      fetchNearbyStores(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, radiusFilter);
    };

    if (!navigator.geolocation) {
      useDefaultLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude, name: "현재 위치" });
        setStep("located");
        fetchNearbyStores(latitude, longitude, radiusFilter);
      },
      (err) => {
        console.log("위치 권한 오류:", err);
        useDefaultLocation();
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [fetchNearbyStores, radiusFilter]);

  // 첫 진입 → 위치 권한 모달 또는 자동 진행
  useEffect(() => {
    if (step === "initial") {
      const consent = getCookie(LOCATION_CONSENT_COOKIE);
      if (consent === "granted") {
        setShowPermissionModal(false);
        beginLocationLookup();
      } else {
        setShowPermissionModal(true);
      }
    }
  }, [step, beginLocationLookup]);

  // 위치 권한 허용
  const handleAllowLocation = () => {
    setCookie(LOCATION_CONSENT_COOKIE, "granted", 30);
    setShowPermissionModal(false);
    beginLocationLookup();
  };

  // 위치 권한 거부
  const handleDenyLocation = () => {
    setShowPermissionModal(false);
    setLocation(DEFAULT_LOCATION);
    setStep("located");
    fetchNearbyStores(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, radiusFilter);
  };

  // 주변 매장 조회

  // 반경 변경
  const handleRadiusChange = (newRadius) => {
    setRadiusFilter(newRadius);
    setShowRadiusDropdown(false);
    if (location) {
      fetchNearbyStores(location.lat, location.lng, newRadius);
    }
  };

  // 카테고리 매핑
  const getCategoryKey = (category) => {
    const mapping = {
      한식: "korean",
      중식: "chinese",
      일식: "japanese",
      양식: "western",
      카페: "cafe",
      분식: "snack",
    };
    return mapping[category] || "all";
  };

  // 검색 처리
  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    const newHist = [
      searchQuery,
      ...recentSearches.filter((v) => v !== searchQuery),
    ].slice(0, 5);

    setRecentSearches(newHist);
    localStorage.setItem("recentSearches", JSON.stringify(newHist));
  };

  // 최근 검색어 로드
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  // 검색 + 필터링
  const filteredStores = stores.filter((store) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !store.name?.toLowerCase().includes(q) &&
        !store.category?.toLowerCase().includes(q) &&
        !store.menu?.toLowerCase().includes(q)
      ) {
        return false;
      }
    }

    if (
      categoryFilter !== "all" &&
      getCategoryKey(store.category) !== categoryFilter
    )
      return false;

    if (showTodayOnly && !store.availableToday) return false;

    return true;
  });

  // 카카오맵 로드
  useEffect(() => {
    if (step === "located" && location && mapRef.current) {
      let attempts = 0;
      const maxTry = 50;

      const check = () => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(() => initializeMap());
        } else if (attempts < maxTry) {
          attempts++;
          setTimeout(check, 100);
        }
      };

      check();
    }
  }, [step, location]);

  // 지도 초기화
  const initializeMap = () => {
    if (!window.kakao || !window.kakao.maps) return;

    const zoomLevel = radiusFilter <= 1000 ? 3 : radiusFilter <= 3000 ? 5 : 7;

    const map = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(location.lat, location.lng),
      level: zoomLevel,
    });

    mapInstance.current = map;

    // 현재 위치 마커
    const curr = new window.kakao.maps.CustomOverlay({
      position: new window.kakao.maps.LatLng(location.lat, location.lng),
      content:
        '<div style="width:24px;height:24px;background:#2563eb;border:4px solid white;border-radius:50%;"></div>',
      yAnchor: 0.5,
    });

    curr.setMap(map);
  };

  // 매장 마커 갱신
  useEffect(() => {
    if (mapInstance.current && filteredStores.length > 0) {
      updateMapMarkers();
    }
  }, [filteredStores]);

  const updateMapMarkers = () => {
    if (!mapInstance.current) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    filteredStores.forEach((store) => {
      if (!store.latitude || !store.longitude) return;

      const pos = new window.kakao.maps.LatLng(
        parseFloat(store.latitude),
        parseFloat(store.longitude)
      );

      if (store.noShowDiscount) {
        const overlay = new window.kakao.maps.CustomOverlay({
          position: pos,
          content: `
            <div style="background:#ef4444;color:white;padding:4px 8px;border-radius:12px;font-size:11px;">
              📍 ${store.noShowDiscount}% ${store.name}
            </div>
          `,
          yAnchor: 1.5,
        });

        overlay.setMap(mapInstance.current);
        markersRef.current.push(overlay);
      } else {
        const marker = new window.kakao.maps.Marker({
          position: pos,
          map: mapInstance.current,
        });
        markersRef.current.push(marker);
      }
    });
  };

  const selectedRadiusLabel =
    DISTANCE_FILTERS.find((f) => f.value === radiusFilter)?.label || "800m";

  return (
    <div className="min-h-screen bg-white">
      <Navbar userType="customer" />

      {/* 위치 권한 모달 */}
      <Dialog open={showPermissionModal} onClose={() => {}}>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <DialogTitle className="text-center">
            내 주변 맛집을 찾아드립니다
          </DialogTitle>
          <DialogDescription className="text-center">
            현재 위치 기반으로 가까운 맛집을 추천해드립니다.
            <br />
            위치 권한을 허용해주세요.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleDenyLocation}
          >
            나중에
          </Button>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleAllowLocation}
          >
            <MapPin className="w-4 h-4 mr-2" /> 허용하기
          </Button>
        </DialogFooter>
      </Dialog>

      {/* 로딩 */}
      {isLoading && step === "requesting" && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
          <p className="text-lg font-medium text-slate-700">
            주변 맛집을 찾고 있습니다...
          </p>
        </div>
      )}

      {/* 메인 */}
      {step === "located" && (
        <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
          <div className="container mx-auto px-4 py-4">
            {/* 검색바 */}
            <div className="mb-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  className="w-full pl-12 pr-20 py-4 text-lg border-2 border-gray-300 rounded-xl"
                  placeholder="짜장면, 신라면옥, 이탈리안 레스토랑..."
                />

                <button
                  type="button"
                  title="음성 검색"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Mic className="w-5 h-5 text-slate-500" />
                </button>

                {/* 최근 검색어 */}
                {searchFocused && recentSearches.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border py-2 z-30">
                    <div className="px-4 py-2 text-xs text-slate-500 font-semibold">
                      최근 검색어
                    </div>

                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSearchQuery(term)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* 상단 필터 */}
            <div className="space-y-3 mb-4">
              {/* 반경 선택 */}
              <div className="relative inline-block">
                <button
                  onClick={() => setShowRadiusDropdown(!showRadiusDropdown)}
                  className="bg-white rounded-lg shadow px-4 py-2.5 flex items-center gap-2 border"
                >
                  주변 {selectedRadiusLabel}
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {showRadiusDropdown && (
                  <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border py-2 min-w-[120px] z-20">
                    {DISTANCE_FILTERS.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => handleRadiusChange(filter.value)}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between ${
                          radiusFilter === filter.value
                            ? "text-blue-600 font-semibold"
                            : ""
                        }`}
                      >
                        {filter.label}
                        {radiusFilter === filter.value && (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 필터 바 */}
              <div className="bg-white rounded-lg shadow border p-3 space-y-3">
                {/* 정렬 */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {SORT_OPTIONS.map((opt) => (
                    <Button
                      key={opt}
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      {opt}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" className="rounded-full">
                    필터
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full">
                    내 주변
                  </Button>
                </div>

                {/* 카테고리 */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`flex flex-col items-center p-3 rounded-lg border-2 min-w-[70px] ${
                        categoryFilter === cat.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <span className="text-2xl mb-1">{cat.icon}</span>
                      <span
                        className={`text-xs ${
                          categoryFilter === cat.id
                            ? "text-blue-600"
                            : "text-slate-700"
                        }`}
                      >
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* 오늘 예약 */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="todayOnly"
                    checked={showTodayOnly}
                    onChange={(e) => setShowTodayOnly(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label
                    htmlFor="todayOnly"
                    className="text-sm flex items-center gap-1"
                  >
                    <Zap className="w-4 h-4 text-orange-500" />
                    오늘예약 매장 보기
                  </label>
                </div>
              </div>
            </div>

            {/* 지도 + 리스트 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 지도 */}
              <div
                className="bg-white rounded-lg shadow border overflow-hidden"
                style={{ height: "500px" }}
              >
                <div ref={mapRef} className="w-full h-full" />
              </div>

              {/* 오른쪽 리스트 */}
              <div
                className="flex flex-col gap-4 pr-1 py-4"
                style={{ maxHeight: "500px", overflowY: "auto" }}
              >
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
                      className="w-full"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      {/* ⭐⭐ 여기만 추가됨 → 상세페이지 이동 가능 ⭐⭐ */}
                      <Link
                        to={`/customer/store/${store.id}`}
                        className="block w-full"
                      >
                        <Card className="w-full hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500">
                          <CardContent className="p-4 pt-5">
                            <div className="flex gap-3">
                              {/* 이미지 */}
                              <div className="relative flex-shrink-0">
                                {store.imageUrl ? (
                                  <img
                                    src={store.imageUrl}
                                    alt={store.name}
                                    className="w-24 h-24 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-24 h-24 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                                    이미지 준비중
                                  </div>
                                )}

                                {store.noShowDiscount && (
                                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    <TrendingDown className="w-3 h-3" />
                                    {store.noShowDiscount}% OFF
                                  </div>
                                )}
                              </div>

                              {/* 정보 */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-lg text-slate-900 truncate">
                                      {store.name}
                                    </h3>

                                    {store.trustLevel && (
                                      <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs flex items-center gap-1">
                                        <Shield className="w-3 h-3" />
                                        신뢰가게
                                      </Badge>
                                    )}
                                  </div>

                                  {store.distance !== null && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs flex-shrink-0 ml-2"
                                    >
                                      {store.distance < 1
                                        ? `${Math.round(
                                            store.distance * 1000
                                          )}m`
                                        : `${store.distance.toFixed(1)}km`}
                                    </Badge>
                                  )}
                                </div>

                                {/* 평점 */}
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-bold text-sm">
                                      {store.rating?.toFixed(1) || "0.0"}
                                    </span>
                                  </div>
                                  <span className="text-xs text-slate-500">
                                    ({store.reviewCount || 0})
                                  </span>

                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {store.category}
                                  </Badge>
                                </div>

                                {/* 줄서기 */}
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  {store.waitTime !== undefined && (
                                    <Badge
                                      className={`text-xs flex items-center gap-1 ${
                                        store.waitTime === 0
                                          ? "bg-green-100 text-green-700 border-green-300"
                                          : "bg-orange-100 text-orange-700 border-orange-300"
                                      }`}
                                    >
                                      {store.waitTime === 0 ? (
                                        <>
                                          <Zap className="w-3 h-3" />
                                          즉시 입장
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="w-3 h-3" />
                                          {store.waitTime}분 대기
                                        </>
                                      )}
                                    </Badge>
                                  )}

                                  {store.popularityScore && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs flex items-center gap-1"
                                    >
                                      <Users2 className="w-3 h-3" />
                                      인기 {store.popularityScore}
                                    </Badge>
                                  )}
                                </div>

                                <p className="text-xs text-slate-500 truncate">
                                  {store.address}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
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
