/**
 * 고객 커뮤니티 페이지
 *
 * 고객들이 맛집 후기, 질문, 꿀팁 등을 공유하는 공간
 */

import { useState } from "react";
import {
  MessageSquare,
  Eye,
  Search,
  Plus,
  Heart,
  MapPin,
  Clock,
} from "lucide-react";

import Navbar from "../../components/Navbar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";

const CustomerCommunity = () => {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // 수정 모드 여부
  const [editMode, setEditMode] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // --------------------------
  // 🔥 게시글 데이터 5개 (isMine: true)
  // --------------------------
  const [posts, setPosts] = useState([
    {
      id: 1,
      category: "후기",
      icon: "⭐",
      title: "신라면옥 진짜 맛있어요!",
      author: "광주사는 미식가",
      location: "광주 동구",
      content:
        "평소에 냉면을 좋아해서 가봤는데 육수가 미쳐버렸습니다… 재방문 확정!",
      tags: ["맛집후기", "추천", "냉면"],
      likes: 32,
      comments: 8,
      views: 126,
      createdAt: "1시간 전",
      isLiked: false,
      isMine: true,
    },
    {
      id: 2,
      category: "질문",
      icon: "❓",
      title: "광주에 조용한 카페 추천해주세요!",
      author: "학생",
      location: "광주 북구",
      content: "노트북 작업하기 조용한 곳 있나요? 추천 부탁드립니다!",
      tags: ["카페추천", "질문"],
      likes: 12,
      comments: 5,
      views: 80,
      createdAt: "2시간 전",
      isLiked: false,
      isMine: true,
    },
    {
      id: 3,
      category: "꿀팁",
      icon: "💡",
      title: "줄 안 서고 맛집 가는 팁",
      author: "맛잘알",
      location: "광주 서구",
      content: "오픈 시간 맞춰 가면 웬만한 맛집은 바로 입장 가능합니다!",
      tags: ["맛집팁", "꿀팁"],
      likes: 22,
      comments: 3,
      views: 99,
      createdAt: "4시간 전",
      isLiked: false,
      isMine: true,
    },
    {
      id: 4,
      category: "후기",
      icon: "🍣",
      title: "초밥 신상집 후기!",
      author: "스시매니아",
      location: "광주 남구",
      content: "신상 초밥집 갔는데 가성비 미쳤습니다! 강추!",
      tags: ["초밥", "맛집"],
      likes: 18,
      comments: 2,
      views: 150,
      createdAt: "6시간 전",
      isLiked: false,
      isMine: true,
    },
    {
      id: 5,
      category: "질문",
      icon: "🤔",
      title: "혼밥하기 좋은 곳 추천 좀요",
      author: "혼밥러",
      location: "광주 광산구",
      content: "혼자 조용히 밥 먹을 가게 찾고 있어요!",
      tags: ["혼밥", "질문"],
      likes: 14,
      comments: 4,
      views: 73,
      createdAt: "8시간 전",
      isLiked: false,
      isMine: true,
    },
  ]);

  // 삭제 처리
  const handleDelete = (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    setPosts(posts.filter((p) => p.id !== id));

    setToast({
      show: true,
      message: "게시글이 삭제되었습니다.",
      type: "success",
    });
  };

  // 수정 클릭
  const handleEdit = (post) => {
    setEditMode(true);
    setEditTarget(post);
    setIsWriteModalOpen(true);
  };

  // 상세보기
  const handleViewDetail = (post) => {
    setSelectedPost(post);
    setIsDetailModalOpen(true);

    setPosts(
      posts.map((p) => (p.id === post.id ? { ...p, views: p.views + 1 } : p))
    );
  };

  // 좋아요 처리
  const handleLike = (id) => {
    setPosts(
      posts.map((post) =>
        post.id === id
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked,
            }
          : post
      )
    );
  };

  // 검색 + 카테고리 필터
  const filteredPosts = posts.filter((post) => {
    const matchCategory =
      selectedCategory === "전체" || selectedCategory === post.category;

    const matchSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchSearch;
  });

  // ---------------------------
  // 🔥 글쓰기 / 수정 저장
  // ---------------------------
  const handleSubmitPost = () => {
    const title = document.getElementById("write-title").value;
    const content = document.getElementById("write-content").value;
    const tags = document
      .getElementById("write-tags")
      .value.split(",")
      .map((t) => t.trim());

    if (editMode) {
      // 수정 모드
      setPosts(
        posts.map((p) =>
          p.id === editTarget.id ? { ...p, title, content, tags } : p
        )
      );

      setToast({
        show: true,
        message: "게시글이 수정되었습니다!",
        type: "success",
      });

      setEditMode(false);
      setEditTarget(null);
    } else {
      // 새 글 추가
      const newPost = {
        id: posts.length + 1,
        category: "후기",
        icon: "📝",
        title,
        content,
        tags,
        author: "사용자",
        location: "미정",
        likes: 0,
        comments: 0,
        views: 0,
        createdAt: "방금 전",
        isLiked: false,
        isMine: true,
      };

      setPosts([newPost, ...posts]);

      setToast({
        show: true,
        message: "게시글이 작성되었습니다!",
        type: "success",
      });
    }

    setIsWriteModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar userType="customer" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <MessageSquare size={32} className="mr-3 text-primary-purple" />
          고객 커뮤니티
        </h1>

        {/* 게시글 카드 목록 */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              onClick={() => handleViewDetail(post)}
              className="cursor-pointer hover:shadow-md transition"
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{post.icon}</div>

                <div className="flex-1">
                  {/* 제목 */}
                  <h3 className="text-xl font-bold mb-1">{post.title}</h3>

                  {/* 작성자 */}
                  <div className="flex items-center text-sm text-slate-500 space-x-3 mb-2">
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

                  {/* 본문 */}
                  <p className="text-slate-600 mb-2 line-clamp-2">
                    {post.content}
                  </p>

                  {/* 태그 */}
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {post.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-purple-100 text-primary-purple rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* 좋아요/댓글/조회수 */}
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(post.id);
                      }}
                      className={`flex items-center space-x-1 ${
                        post.isLiked ? "text-primary-purple" : "text-slate-500"
                      }`}
                    >
                      <Heart
                        size={18}
                        className={post.isLiked ? "fill-current" : ""}
                      />
                      <span>{post.likes}</span>
                    </button>

                    <span className="flex items-center text-slate-500">
                      <MessageSquare size={18} className="mr-1" />
                      {post.comments}
                    </span>

                    <span className="flex items-center text-slate-500">
                      <Eye size={18} className="mr-1" />
                      {post.views}
                    </span>
                  </div>

                  {/* 🔥 수정 / 삭제 버튼 */}
                  {post.isMine && (
                    <div className="flex justify-end space-x-4 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(post);
                        }}
                        className="text-primary-green font-medium hover:underline"
                      >
                        수정
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(post.id);
                        }}
                        className="text-red-500 font-medium hover:underline"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 글쓰기/수정 모달 */}
      <Modal
        isOpen={isWriteModalOpen}
        onClose={() => {
          setIsWriteModalOpen(false);
          setEditMode(false);
        }}
        title={editMode ? "게시글 수정하기" : "글쓰기"}
      >
        <div className="space-y-3">
          <input
            id="write-title"
            type="text"
            placeholder="제목"
            defaultValue={editMode ? editTarget.title : ""}
            className="w-full p-3 border rounded-lg"
          />

          <textarea
            id="write-content"
            placeholder="내용"
            defaultValue={editMode ? editTarget.content : ""}
            className="w-full p-3 border rounded-lg resize-none"
            rows="6"
          />

          <input
            id="write-tags"
            type="text"
            placeholder="태그 입력(쉼표로 구분)"
            defaultValue={editMode ? editTarget.tags.join(",") : ""}
            className="w-full p-3 border rounded-lg"
          />

          <Button className="w-full" onClick={handleSubmitPost}>
            {editMode ? "수정 완료" : "등록"}
          </Button>
        </div>
      </Modal>

      {/* 토스트 */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default CustomerCommunity;
