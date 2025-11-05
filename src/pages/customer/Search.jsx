/**
 * 고객 메인 화면 - 위치 기반 맛집 탐색 (KT 스타일)
 *
 * 위치 기반으로 주변 맛집을 검색하고 예약할 수 있는 페이지
 * KT 사장님Easy의 깔끔한 카드 그리드 디자인 적용
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Star,
  Navigation,
  Heart,
  Clock,
  Users,
  Tag,
  Search as SearchIcon
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';

const Search = () => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  // 음식 카테고리
  const categories = ['전체', '한식', '중식', '일식', '양식', '카페', '분식'];

  // 더미 맛집 데이터
  const restaurants = [
    {
      id: 1,
      name: '신라면옥',
      category: '중식',
      rating: 4.7,
      reviewCount: 234,
      distance: '350m',
      walkTime: '5분',
      discount: '신뢰 고객 5% 할인',
      tags: ['주차가능', '단체석'],
      imageUrl: '🍜',
      priceRange: '₩₩',
      openNow: true
    },
    {
      id: 2,
      name: '이태원 초밥',
      category: '일식',
      rating: 4.9,
      reviewCount: 567,
      distance: '520m',
      walkTime: '8분',
      discount: '신뢰 고객 10% 할인',
      tags: ['오마카세', '예약필수'],
      imageUrl: '🍣',
      priceRange: '₩₩₩',
      openNow: true
    },
    {
      id: 3,
      name: '카페 봄날',
      category: '카페',
      rating: 4.5,
      reviewCount: 189,
      distance: '280m',
      walkTime: '4분',
      discount: '신뢰 고객 음료 1+1',
      tags: ['조용함', 'WiFi'],
      imageUrl: '☕',
      priceRange: '₩',
      openNow: true
    },
    {
      id: 4,
      name: '정통 한우집',
      category: '한식',
      rating: 4.8,
      reviewCount: 423,
      distance: '670m',
      walkTime: '10분',
      discount: '신뢰 고객 디저트 서비스',
      tags: ['1++한우', '룸 있음'],
      imageUrl: '🥩',
      priceRange: '₩₩₩₩',
      openNow: true
    },
    {
      id: 5,
      name: '파스타 공방',
      category: '양식',
      rating: 4.6,
      reviewCount: 312,
      distance: '410m',
      walkTime: '6분',
      discount: '신뢰 고객 샐러드 무료',
      tags: ['수제파스타', '베이커리'],
      imageUrl: '🍝',
      priceRange: '₩₩',
      openNow: false
    },
    {
      id: 6,
      name: '엄마손 분식',
      category: '분식',
      rating: 4.4,
      reviewCount: 156,
      distance: '190m',
      walkTime: '3분',
      discount: '신뢰 고객 3% 할인',
      tags: ['포장가능', '배달'],
      imageUrl: '🍲',
      priceRange: '₩',
      openNow: true
    }
  ];

  // 필터링된 맛집 목록
  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesCategory = selectedCategory === '전체' || restaurant.category === selectedCategory;
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header - KT 스타일 */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/">
            <h1 className="text-2xl font-bold text-text-primary">올사람</h1>
          </Link>
          <div className="flex gap-3">
            <Link to="/customer/my-page">
              <Button size="sm" variant="outline">마이페이지</Button>
            </Link>
            <Button size="sm">내 예약</Button>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-gray-50 border-b py-6">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-text-primary mb-2">
              주변 맛집 찾기
            </h1>
            <p className="text-text-secondary">노쇼 걱정 없는 신뢰 예약 플랫폼</p>
          </div>

          <div className="relative max-w-2xl mx-auto mb-4">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary" size={20} />
            <input
              type="text"
              placeholder="가게 이름, 음식 종류로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-border-color focus:outline-none focus:ring-2 focus:ring-primary-green"
            />
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
            <MapPin className="w-4 h-4 text-primary-green" />
            <span>현재 위치: 서울 마포구 홍대입구</span>
            <button className="ml-2 text-primary-green hover:text-dark-green font-semibold flex items-center">
              <Navigation size={14} className="mr-1" />
              변경
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* 카테고리 필터 */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-green text-white'
                  : 'bg-white text-text-secondary border border-border-color hover:border-primary-green'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 맛집 그리드 - KT 스타일 3열 */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            {selectedCategory === '전체' ? '모든 맛집' : selectedCategory}
          </h2>
          <p className="text-text-secondary">
            총 {filteredRestaurants.length}곳
          </p>
        </div>

        {filteredRestaurants.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map(restaurant => (
              <Card key={restaurant.id} hover className="overflow-hidden">
                {/* 이미지 영역 */}
                <div className="aspect-video bg-gradient-to-br from-primary-green/20 to-secondary/20 relative flex items-center justify-center text-6xl">
                  {restaurant.imageUrl}
                  <div className="absolute top-3 right-3">
                    {restaurant.openNow ? (
                      <span className="px-3 py-1 bg-primary-green text-white text-xs font-semibold rounded-full">
                        영업중
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-400 text-white text-xs font-semibold rounded-full">
                        영업종료
                      </span>
                    )}
                  </div>
                  <button className="absolute top-3 left-3 text-white hover:text-red-500 transition-colors">
                    <Heart size={24} />
                  </button>
                </div>

                {/* 맛집 정보 */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-text-primary mb-1">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                        <span className="flex items-center">
                          <Star className="text-yellow-500 mr-1" size={14} fill="currentColor" />
                          <span className="font-bold text-text-primary mr-1">
                            {restaurant.rating}
                          </span>
                          ({restaurant.reviewCount})
                        </span>
                        <span>·</span>
                        <span>{restaurant.priceRange}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-text-secondary mb-3 flex items-center">
                    <MapPin size={14} className="mr-1" />
                    {restaurant.distance} · 도보 {restaurant.walkTime}
                  </p>

                  {/* 태그 */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {restaurant.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-text-secondary text-xs rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* 신뢰 고객 혜택 */}
                  <div className="bg-green-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center text-sm">
                      <Tag className="text-primary-green mr-2" size={16} />
                      <span className="font-semibold text-primary-green">
                        {restaurant.discount}
                      </span>
                    </div>
                  </div>

                  {/* 예약 버튼 */}
                  <Button
                    variant="primary"
                    className="w-full"
                    disabled={!restaurant.openNow}
                  >
                    <Clock className="mr-2" size={18} />
                    지금 예약하기
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <p className="text-text-secondary text-lg">
              검색 결과가 없습니다. 다른 검색어나 카테고리를 선택해보세요.
            </p>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Search;
