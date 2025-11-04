/**
 * 고객 메인 화면 - 위치 기반 맛집 탐색
 *
 * 위치 기반으로 주변 맛집을 검색하고 예약할 수 있는 페이지
 * - 현재 위치 표시
 * - 음식 종류 필터
 * - 맛집 목록 (리뷰, 거리, 신뢰 고객 혜택 표시)
 * - 예약하기 버튼
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
    <div className="min-h-screen bg-bg-main">
      <Navbar userType="customer" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-text-primary">
              주변 맛집 찾기
            </h1>
            <Link to="/customer/my-page">
              <Button size="sm" variant="secondary">
                <Heart className="mr-2" size={16} />
                리워드
              </Button>
            </Link>
          </div>

          {/* 현재 위치 */}
          <div className="flex items-center text-text-secondary mb-6">
            <MapPin className="mr-2 text-primary-green" size={20} />
            <span className="font-medium">현재 위치: 홍대입구역</span>
            <button className="ml-4 text-primary-green hover:text-dark-green font-semibold text-sm flex items-center">
              <Navigation size={16} className="mr-1" />
              위치 변경
            </button>
          </div>

          {/* 검색바 */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="맛집 이름으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-border-color focus:outline-none focus:ring-2 focus:ring-primary-green"
            />
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary" size={20} />
          </div>

          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-green text-white'
                    : 'bg-white text-text-secondary border border-border-color hover:border-primary-green'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 맛집 목록 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">
              {selectedCategory === '전체' ? '모든 맛집' : selectedCategory}
              <span className="text-text-secondary font-normal ml-2">
                ({filteredRestaurants.length}곳)
              </span>
            </h2>
            <select className="px-3 py-2 rounded-lg border border-border-color text-sm focus:outline-none focus:ring-2 focus:ring-primary-green">
              <option>거리순</option>
              <option>평점순</option>
              <option>리뷰 많은순</option>
            </select>
          </div>

          {filteredRestaurants.map(restaurant => (
            <Card key={restaurant.id} hover>
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* 맛집 이미지 (이모지로 대체) */}
                <div className="w-full md:w-32 h-32 bg-gradient-to-br from-primary-green to-primary-purple rounded-xl flex items-center justify-center text-6xl flex-shrink-0">
                  {restaurant.imageUrl}
                </div>

                {/* 맛집 정보 */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-2xl font-bold text-text-primary">
                          {restaurant.name}
                        </h3>
                        {restaurant.openNow ? (
                          <span className="px-2 py-1 bg-primary-green text-white text-xs font-semibold rounded">
                            영업중
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-400 text-white text-xs font-semibold rounded">
                            영업종료
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-text-secondary mb-2">
                        <span className="flex items-center">
                          <Star className="text-yellow-500 mr-1" size={16} fill="currentColor" />
                          <span className="font-bold text-text-primary mr-1">
                            {restaurant.rating}
                          </span>
                          (리뷰 {restaurant.reviewCount})
                        </span>
                        <span className="flex items-center">
                          <MapPin className="mr-1" size={16} />
                          {restaurant.distance} · 도보 {restaurant.walkTime}
                        </span>
                        <span>{restaurant.priceRange}</span>
                      </div>
                    </div>
                    <button className="text-text-secondary hover:text-red-500 transition-colors">
                      <Heart size={24} />
                    </button>
                  </div>

                  {/* 태그 */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {restaurant.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-text-secondary text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* 신뢰 고객 혜택 */}
                  <div className="bg-gradient-to-r from-light-green to-light-purple bg-opacity-10 rounded-lg p-3 mb-4">
                    <div className="flex items-center">
                      <Tag className="text-primary-green mr-2" size={18} />
                      <span className="font-semibold text-primary-green">
                        💚 {restaurant.discount}
                      </span>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-3">
                    <Button variant="primary" className="flex-1" disabled={!restaurant.openNow}>
                      <Clock className="mr-2" size={18} />
                      지금 예약하기
                    </Button>
                    <Link to="/customer/voice-reservation" className="flex-1">
                      <Button variant="secondary" className="w-full" disabled={!restaurant.openNow}>
                        🎤 음성 예약
                      </Button>
                    </Link>
                    <button className="px-6 py-3 border-2 border-text-secondary text-text-secondary rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                      상세보기
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filteredRestaurants.length === 0 && (
            <Card className="text-center py-12">
              <p className="text-text-secondary text-lg">
                검색 결과가 없습니다. 다른 검색어나 카테고리를 선택해보세요.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
