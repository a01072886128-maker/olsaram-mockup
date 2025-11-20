/** 소상공인 커뮤니티 페이지 */

import { useState, useEffect } from "react";
import {
  MessageSquare,
  ThumbsUp,
  Eye,
  Plus,
  MapPin,
  Clock,
  Trash,
} from "lucide-react";

import Navbar from "../../components/Navbar";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";

const Community = () => {
  const loginUser = JSON.parse(localStorage.getItem("user"));
  const myOwnerId = loginUser?.ownerId;

  const [viewTab, setViewTab] = useState("ALL");
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  const [commentInput, setCommentInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [writeTitle, setWriteTitle] = useState("");
  const [writeContent, setWriteContent] = useState("");
  const [writeCategory, setWriteCategory] = useState("사기 의심 공유");
  const [writeTags, setWriteTags] = useState("");

  const [isEditMode, setIsEditMode] = useState(false);
  const [editPostId, setEditPostId] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  /** 🔥 한글 → ENUM 변환 */
  const convertCategoryToEnum = (value) => {
    switch (value) {
      case "사기 의심 공유":
        return "OWNER_POST";
      case "꿀팁":
        return "TIP";
      case "질문":
        return "QUESTION";
      default:
        return "OWNER_POST";
    }
  };

  /** 카테고리 매핑 */
  const categoryMap = {
    OWNER_POST: { name: "사기 의심 공유", icon: "🚨" },
    TIP: { name: "꿀팁", icon: "💡" },
    QUESTION: { name: "질문", icon: "❓" },
    USER_POST: { name: "질문", icon: "❓" },
  };

  /** DB → 화면 변환 */
  const convertPostFormat = (data) =>
    data.map((item) => {
      const mapped = categoryMap[item.category] || categoryMap["QUESTION"];

      return {
        id: item.id,
        memberId: item.memberId,
        title: item.title,
        content: item.content,
        author: item.authorName ?? "사장님",
        rawCategory: item.category,
        category: mapped.name,
        icon: `${item.id}`,
        tags: item.tags ? item.tags.split(",") : [],
        likes: item.likes ?? 0,
        views: item.views ?? 0,
        comments: 0,
        isLiked: false,
        isMine: item.memberId === myOwnerId,
        location: "서울",
        createdAt: "방금 전",
      };
    });

  /** 게시글 로드 */
  const loadPosts = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/community/owner/all");
      const data = await res.json();
      let converted = convertPostFormat(data);

      const withComments = await Promise.all(
        converted.map(async (post) => {
          const c = await fetch(
            `http://localhost:8080/api/community/comments/owner/${post.id}`
          );
          const list = await c.json();
          return { ...post, comments: list.length };
        })
      );

      setPosts(withComments);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  /** 댓글 로딩 */
  const loadComments = async (postId) => {
    const res = await fetch(
      `http://localhost:8080/api/community/comments/owner/${postId}`
    );
    setComments(await res.json());
  };

  /** 댓글 작성 */
  const handleSubmitComment = async () => {
    if (!commentInput.trim()) return;

    await fetch("http://localhost:8080/api/community/comments/owner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        communityId: selectedPost.id,
        author: loginUser.name ?? "사장님",
        content: commentInput,
      }),
    });

    setCommentInput("");
    loadComments(selectedPost.id);
    loadPosts();
  };

  /** 댓글 삭제 */
  const deleteComment = async (commentId) => {
    await fetch(`http://localhost:8080/api/community/comments/${commentId}`, {
      method: "DELETE",
    });
    loadComments(selectedPost.id);
    loadPosts();
  };

  /** 조회수 증가 */
  const increaseView = async (id) => {
    await fetch(`http://localhost:8080/api/community/owner/${id}/view`, {
      method: "POST",
    });
  };

  /** 좋아요 */
  const toggleLike = async (post) => {
    setPosts(
      posts.map((p) =>
        p.id === post.id
          ? {
              ...p,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
              isLiked: !p.isLiked,
            }
          : p
      )
    );

    await fetch(`http://localhost:8080/api/community/owner/${post.id}/like`, {
      method: "POST",
    });

    loadPosts();
  };

  /** 게시글 삭제 */
  const deletePost = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    await fetch(`http://localhost:8080/api/community/owner/${id}`, {
      method: "DELETE",
    });

    setIsDetailModalOpen(false);
    loadPosts();
  };

  /** 상세보기 */
  const handleViewDetail = (post) => {
    setSelectedPost(post);
    setIsDetailModalOpen(true);

    increaseView(post.id);
    loadComments(post.id);
    loadPosts();
  };

  /** 글쓰기 저장 */
  const handleWritePost = async () => {
    if (!writeTitle.trim() || !writeContent.trim()) {
      alert("제목과 내용을 입력하세요.");
      return;
    }

    const body = {
      title: writeTitle,
      content: writeContent,
      category: convertCategoryToEnum(writeCategory), // 🔥 핵심
      tags: writeTags,
      memberId: myOwnerId,
    };

    if (isEditMode) {
      await fetch(`http://localhost:8080/api/community/owner/${editPostId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      setIsWriteModalOpen(false);
      loadPosts();
      return;
    }

    await fetch("http://localhost:8080/api/community/owner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setWriteTitle("");
    setWriteContent("");
    setWriteTags("");
    setIsWriteModalOpen(false);
    loadPosts();
  };

  /** 검색 필터 */
  const keywordFiltered = posts.filter(
    (p) =>
      searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /** 탭 정렬 */
  const finalPosts = (() => {
    let list = [...keywordFiltered];

    if (viewTab === "MINE") {
      return list.filter((p) => p.isMine).sort((a, b) => b.id - a.id);
    }

    if (viewTab === "HOT") {
      return list
        .map((p) => ({
          ...p,
          hotScore: p.comments * 2 + p.likes + p.views,
        }))
        .sort((a, b) => b.hotScore - a.hotScore);
    }

    return list.sort((a, b) => b.id - a.id);
  })();

  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar userType="owner" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 제목 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <MessageSquare size={32} className="mr-3 text-primary-purple" />
            소상공인 커뮤니티
          </h1>
          <p className="text-gray-500">노쇼 정보 공유, 운영 노하우</p>
        </div>

        {/* 탭 */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setViewTab("ALL")}
            className={`px-4 py-2 rounded-lg font-semibold ${
              viewTab === "ALL"
                ? "bg-primary-purple text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            전체 글
          </button>

          <button
            onClick={() => setViewTab("MINE")}
            className={`px-4 py-2 rounded-lg font-semibold ${
              viewTab === "MINE"
                ? "bg-primary-purple text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            내 글 보기
          </button>

          <button
            onClick={() => setViewTab("HOT")}
            className={`px-4 py-2 rounded-lg font-semibold ${
              viewTab === "HOT"
                ? "bg-primary-purple text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            인기 글 🔥
          </button>
        </div>

        {/* 글쓰기 버튼 */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              setIsEditMode(false);
              setWriteTitle("");
              setWriteContent("");
              setWriteTags("");
              setWriteCategory("사기 의심 공유");
              setIsWriteModalOpen(true);
            }}
            className="px-4 py-2 bg-primary-purple text-white font-semibold rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> 글 작성
          </button>
        </div>

        {/* 게시글 목록 */}
        <div className="space-y-4">
          {finalPosts.map((post) => {
            const borderColor =
              post.rawCategory === "OWNER_POST"
                ? "border-red-400"
                : post.rawCategory === "TIP"
                ? "border-green-400"
                : post.rawCategory === "QUESTION"
                ? "border-yellow-400"
                : "border-gray-200";

            return (
              <Card
                key={post.id}
                className={`hover:shadow-lg transition cursor-pointer relative border-2 ${borderColor}`}
                onClick={() => handleViewDetail(post)}
              >
                {post.isMine && (
                  <div className="absolute top-3 right-3 flex gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditMode(true);
                        setEditPostId(post.id);
                        setWriteTitle(post.title);
                        setWriteContent(post.content);
                        setWriteCategory(post.rawCategory);
                        setWriteTags(post.tags.join(","));
                        setIsWriteModalOpen(true);
                      }}
                      className="text-blue-500"
                    >
                      ✏
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePost(post.id);
                      }}
                      className="text-red-500"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                )}

                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{post.icon}</div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{post.title}</h3>
                      {post.isMine && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
                          내 글
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-gray-600 text-sm">
                      <span>{post.author}</span>
                      <span className="flex items-center">
                        <MapPin size={14} className="mr-1" />
                        {post.location}
                      </span>
                      <span className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {post.createdAt}
                      </span>
                    </div>

                    <p className="line-clamp-2 mt-2">{post.content}</p>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {post.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-100 rounded-full text-sm text-primary-purple"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-5 mt-3 text-gray-600">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(post);
                        }}
                        className="flex items-center gap-1"
                      >
                        <ThumbsUp size={18} />
                        <span>{post.likes}</span>
                      </button>

                      <span className="flex items-center gap-1">
                        <MessageSquare size={18} />
                        <span>{post.comments}</span>
                      </span>

                      <span className="flex items-center gap-1">
                        <Eye size={18} />
                        <span>{post.views}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {finalPosts.length === 0 && (
            <Card>
              <div className="text-center py-10 text-gray-400">
                <MessageSquare size={40} className="mx-auto mb-3 opacity-50" />
                게시글이 없습니다
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* 상세보기 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedPost?.title}
        size="lg"
      >
        {selectedPost && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-600">
              <span className="text-3xl">{selectedPost.icon}</span>
              <span>{selectedPost.author}</span>

              {selectedPost.isMine && (
                <button
                  onClick={() => deletePost(selectedPost.id)}
                  className="ml-auto text-red-500"
                >
                  <Trash size={20} />
                </button>
              )}
            </div>

            <p className="whitespace-pre-wrap text-lg">
              {selectedPost.content}
            </p>

            <hr />

            <h3 className="font-semibold text-lg">댓글</h3>

            {comments.map((c) => (
              <div
                key={c.id}
                className="relative p-3 bg-gray-50 border rounded-lg"
              >
                <p className="font-semibold">{c.author}</p>
                <p>{c.content}</p>

                <button
                  onClick={() => deleteComment(c.id)}
                  className="absolute top-2 right-2 text-red-500"
                >
                  <Trash size={16} />
                </button>
              </div>
            ))}

            <input
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="댓글 입력..."
            />

            <button
              onClick={handleSubmitComment}
              className="w-full py-2 bg-primary-purple text-white rounded-lg"
            >
              댓글 작성
            </button>
          </div>
        )}
      </Modal>

      {/* 글쓰기 모달 */}
      <Modal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        title={isEditMode ? "게시글 수정" : "게시글 작성"}
        size="lg"
      >
        <div className="space-y-4">
          <input
            value={writeTitle}
            onChange={(e) => setWriteTitle(e.target.value)}
            placeholder="제목"
            className="w-full p-3 border rounded-lg"
          />

          <select
            value={writeCategory}
            onChange={(e) => setWriteCategory(e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            <option value="사기 의심 공유">사기 의심 공유</option>
            <option value="꿀팁">꿀팁</option>
            <option value="질문">질문</option>
          </select>

          <textarea
            value={writeContent}
            onChange={(e) => setWriteContent(e.target.value)}
            placeholder="내용"
            className="w-full h-40 p-3 border rounded-lg resize-none"
          />

          <input
            value={writeTags}
            onChange={(e) => setWriteTags(e.target.value)}
            placeholder="태그 (예: 손님, 예약, 광고...)"
            className="w-full p-3 border rounded-lg"
          />

          <button
            onClick={handleWritePost}
            className="w-full py-3 bg-primary-purple text-white rounded-lg font-bold"
          >
            {isEditMode ? "수정하기" : "작성하기"}
          </button>
        </div>
      </Modal>

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
