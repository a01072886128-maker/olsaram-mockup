/**
 * 소상공인 커뮤니티 페이지
 *
 * 사장님들이 노쇼 정보, 운영 노하우 등을 공유하는 커뮤니티
 * - 카테고리별 필터링
 * - 게시글 좋아요/댓글
 * - 게시글 상세보기 모달
 * - 새 글 작성 모달
 */

import { useState } from "react";
import {
  MessageSquare,
  ThumbsUp,
  Eye,
  Search,
  Plus,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  TrendingUp,
  MapPin,
  Clock,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";

const Community = () => {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [searchQuery, setSearchQuery] = useState("");

  // 더미 게시글 데이터
  const [posts, setPosts] = useState([
    {
      id: 1,
      category: "사기 의심 공유",
      icon: "🚨",
      title: "[긴급] 010-****-1234 주의하세요!",
      author: "홍대 중국집 사장님",
      location: "서울 마포구",
      content:
        "공공기관 사칭해서 단체 예약 후 선결제 요구하더니 연락 두절됐습니다. 다른 사장님들도 조심하세요!",
      tags: ["사기주의", "공공기관사칭", "선결제요구"],
      likes: 12,
      comments: 3,
      views: 45,
      createdAt: "5분 전",
      isUrgent: true,
      isLiked: false,
    },
    {
      id: 2,
      category: "꿀팁",
      icon: "💡",
      title: "예약 관리 꿀팁 공유합니다",
      author: "강남 한식당",
      location: "서울 강남구",
      content:
        '저는 예약 확정 문자에 "취소 시 최소 3시간 전 연락 부탁드립니다" 문구를 넣었더니 무단 취소가 70% 줄었어요!',
      tags: ["운영팁", "예약관리", "노쇼방지"],
      likes: 28,
      comments: 7,
      views: 156,
      createdAt: "2시간 전",
      isLiked: false,
    },
    {
      id: 3,
      category: "질문",
      icon: "❓",
      title: "노쇼 고객 예약금 청구 어떻게 하나요?",
      author: "신규 사장님",
      location: "경기 수원시",
      content:
        "어제 4인 예약 노쇼가 발생했는데 예약금 청구를 어떻게 진행해야 할까요?",
      tags: ["질문", "예약금", "노쇼대응"],
      likes: 5,
      comments: 12,
      views: 89,
      createdAt: "5시간 전",
      isLiked: false,
    },
    {
      id: 4,
      category: "꿀팁",
      icon: "🎉",
      title: "올사람 플랫폼 도입 후 노쇼율 80% 감소!",
      author: "이태원 일식",
      location: "서울 용산구",
      content:
        "2개월 전 올사람 도입했는데 노쇼율이 15% → 3%로 떨어졌습니다! AI 사기 탐지 기능이 정말 유용해요 👍",
      tags: ["후기", "효과인증", "감사합니다"],
      likes: 45,
      comments: 15,
      views: 234,
      createdAt: "1일 전",
      isFeatured: true,
      isLiked: false,
    },
  ]);

  // 더미 댓글 데이터
  const mockComments = {
    1: [
      {
        id: 1,
        author: "강남 일식집",
        content: "저도 이 번호로 연락 왔었어요! 신고했습니다.",
        createdAt: "3분 전",
      },
      {
        id: 2,
        author: "홍대 카페",
        content: "공유 감사합니다. 조심하겠습니다.",
        createdAt: "4분 전",
      },
      {
        id: 3,
        author: "신촌 한식당",
        content: "이런 사기가 요즘 정말 많네요...",
        createdAt: "5분 전",
      },
    ],
    2: [
      {
        id: 1,
        author: "강남역 일식",
        content: "좋은 정보 감사합니다! 저도 적용해봐야겠어요.",
        createdAt: "1시간 전",
      },
      {
        id: 2,
        author: "홍대 중식당",
        content: "오! 바로 문자 내용 수정했습니다.",
        createdAt: "1시간 전",
      },
    ],
  };

  const categories = [
    { name: "전체", icon: null },
    { name: "사기 의심 공유", icon: "🚨" },
    { name: "꿀팁", icon: "💡" },
    { name: "질문", icon: "❓" },
  ];

  // 필터된 게시글
  const filteredPosts = posts.filter((post) => {
    const categoryMatch =
      selectedCategory === "전체" || post.category === selectedCategory;
    const searchMatch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // 좋아요 클릭
  const handleLike = (postId) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked,
          };
        }
        return post;
      })
    );

    const post = posts.find((p) => p.id === postId);
    if (!post.isLiked) {
      setToast({ show: true, message: "공감했습니다!", type: "success" });
    }
  };

  // 상세보기
  const handleViewDetail = (post) => {
    setSelectedPost(post);
    setIsDetailModalOpen(true);
    // 조회수 증가
    setPosts(
      posts.map((p) => (p.id === post.id ? { ...p, views: p.views + 1 } : p))
    );
  };

  // 새 글 작성
  const handleWritePost = () => {
    setIsWriteModalOpen(true);
  };

  // 글 작성 완료
  const handleSubmitPost = () => {
    setIsWriteModalOpen(false);
    setToast({
      show: true,
      message: "게시글이 작성되었습니다!",
      type: "success",
    });
  };

  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar userType="owner" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center">
            <MessageSquare className="mr-3 text-primary-purple" size={32} />
            소상공인 커뮤니티
          </h1>
          <p className="text-text-secondary">
            노쇼 정보 공유, 운영 노하우, 서로 돕는 공간입니다
          </p>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap flex items-center space-x-2 ${
                  selectedCategory === category.name
                    ? "bg-primary-purple text-white"
                    : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                }`}
              >
                {category.icon && <span>{category.icon}</span>}
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* 검색 및 작성 버튼 */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
              />
              <Search
                className="absolute left-3 top-2.5 text-text-secondary"
                size={20}
              />
            </div>
            <Button onClick={handleWritePost}>
              <Plus size={20} className="mr-2" />새 글 작성
            </Button>
          </div>
        </div>

        {/* 게시글 목록 */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className={`hover:shadow-lg transition-shadow cursor-pointer ${
                post.isUrgent ? "border-2 border-red-300 bg-red-50" : ""
              } ${
                post.isFeatured
                  ? "border-2 border-primary-purple bg-purple-50"
                  : ""
              }`}
              onClick={() => handleViewDetail(post)}
            >
              <div className="flex items-start space-x-4">
                {/* 아이콘 */}
                <div className="text-4xl">{post.icon}</div>

                {/* 내용 */}
                <div className="flex-1">
                  {/* 제목 */}
                  <h3 className="text-xl font-bold text-text-primary mb-2 flex items-center">
                    {post.title}
                    {post.isUrgent && (
                      <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                        긴급
                      </span>
                    )}
                    {post.isFeatured && (
                      <span className="ml-2 px-2 py-1 bg-primary-purple text-white text-xs rounded-full">
                        인기
                      </span>
                    )}
                  </h3>

                  {/* 작성자 정보 */}
                  <div className="flex items-center space-x-3 text-sm text-text-secondary mb-3">
                    <span className="font-semibold">{post.author}</span>
                    <span className="flex items-center">
                      <MapPin size={14} className="mr-1" />
                      {post.location}
                    </span>
                    <span className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {post.createdAt}
                    </span>
                  </div>

                  {/* 본문 미리보기 */}
                  <p className="text-text-secondary mb-3 line-clamp-2">
                    {post.content}
                  </p>

                  {/* 태그 */}
                  <div className="flex items-center space-x-2 mb-3 flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-light-green bg-opacity-20 text-primary-green rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* 통계 및 버튼 */}
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(post.id);
                      }}
                      className={`flex items-center space-x-1 transition-colors ${
                        post.isLiked
                          ? "text-primary-purple"
                          : "text-text-secondary hover:text-primary-purple"
                      }`}
                    >
                      <ThumbsUp
                        size={18}
                        className={post.isLiked ? "fill-current" : ""}
                      />
                      <span className="font-semibold">{post.likes}</span>
                    </button>
                    <span className="flex items-center space-x-1 text-text-secondary">
                      <MessageSquare size={18} />
                      <span>{post.comments}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-text-secondary">
                      <Eye size={18} />
                      <span>{post.views}</span>
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filteredPosts.length === 0 && (
            <Card>
              <div className="text-center py-12 text-text-secondary">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                <p>게시글이 없습니다</p>
              </div>
            </Card>
          )}
        </div>

        {/* 더 보기 버튼 */}
        {filteredPosts.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline">더 보기 ▼</Button>
          </div>
        )}
      </div>

      {/* 게시글 상세보기 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="게시글 상세보기"
        size="lg"
      >
        {selectedPost && (
          <div>
            {/* 게시글 헤더 */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-4xl">{selectedPost.icon}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-text-primary mb-2">
                    {selectedPost.title}
                  </h3>
                  <div className="flex items-center space-x-3 text-sm text-text-secondary">
                    <span className="font-semibold">{selectedPost.author}</span>
                    <span className="flex items-center">
                      <MapPin size={14} className="mr-1" />
                      {selectedPost.location}
                    </span>
                    <span className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {selectedPost.createdAt}
                    </span>
                  </div>
                </div>
              </div>

              {/* 본문 */}
              <p className="text-text-primary text-lg leading-relaxed mb-4">
                {selectedPost.content}
              </p>

              {/* 태그 */}
              <div className="flex items-center space-x-2 mb-4 flex-wrap gap-2">
                {selectedPost.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-light-green bg-opacity-20 text-primary-green rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* 통계 */}
              <div className="flex items-center space-x-6 pt-4 border-t border-border-color">
                <button
                  onClick={() => handleLike(selectedPost.id)}
                  className={`flex items-center space-x-2 transition-colors ${
                    selectedPost.isLiked
                      ? "text-primary-purple"
                      : "text-text-secondary hover:text-primary-purple"
                  }`}
                >
                  <ThumbsUp
                    size={20}
                    className={selectedPost.isLiked ? "fill-current" : ""}
                  />
                  <span className="font-semibold">{selectedPost.likes}</span>
                </button>
                <span className="flex items-center space-x-2 text-text-secondary">
                  <MessageSquare size={20} />
                  <span>{selectedPost.comments}</span>
                </span>
                <span className="flex items-center space-x-2 text-text-secondary">
                  <Eye size={20} />
                  <span>{selectedPost.views}</span>
                </span>
              </div>
            </div>

            {/* 댓글 섹션 */}
            <div className="border-t border-border-color pt-6">
              <h4 className="text-lg font-bold text-text-primary mb-4">
                댓글 {mockComments[selectedPost.id]?.length || 0}개
              </h4>

              {/* 댓글 입력 */}
              <div className="mb-6">
                <textarea
                  placeholder="댓글을 작성해주세요..."
                  className="w-full p-4 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple resize-none"
                  rows="3"
                ></textarea>
                <div className="flex justify-end mt-2">
                  <Button size="sm">댓글 작성</Button>
                </div>
              </div>

              {/* 댓글 목록 */}
              <div className="space-y-4">
                {mockComments[selectedPost.id]?.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-text-primary">
                        {comment.author}
                      </span>
                      <span className="text-sm text-text-secondary">
                        {comment.createdAt}
                      </span>
                    </div>
                    <p className="text-text-secondary">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 글 작성 모달 */}
      <Modal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        title="새 글 작성"
        size="lg"
      >
        <div className="space-y-4">
          {/* 카테고리 선택 */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              카테고리
            </label>
            <select className="w-full p-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple">
              <option>사기 의심 공유</option>
              <option>꿀팁</option>
              <option>질문</option>
            </select>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              제목
            </label>
            <input
              type="text"
              placeholder="제목을 입력하세요"
              className="w-full p-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
            />
          </div>

          {/* 본문 */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              내용
            </label>
            <textarea
              placeholder="내용을 입력하세요"
              className="w-full p-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple resize-none"
              rows="8"
            ></textarea>
          </div>

          {/* 태그 */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              태그 (쉼표로 구분)
            </label>
            <input
              type="text"
              placeholder="예: 노쇼방지, 예약관리, 꿀팁"
              className="w-full p-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsWriteModalOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleSubmitPost}>작성 완료</Button>
          </div>
        </div>
      </Modal>

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

export default Community;
