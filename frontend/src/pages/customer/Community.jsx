import { useState, useEffect } from "react";
import { MessageSquare, Eye, Heart, MapPin, Clock, Trash } from "lucide-react";

import Navbar from "../../components/Navbar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";

const CustomerCommunity = () => {
  const [posts, setPosts] = useState([]);
  const [viewTab, setViewTab] = useState("ALL");
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // 글쓰기 input 상태
  const [writeTitle, setWriteTitle] = useState("");
  const [writeContent, setWriteContent] = useState("");
  const [writeTags, setWriteTags] = useState("");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const loginUser = JSON.parse(localStorage.getItem("user"));
  const myCustomerId = loginUser?.customerId;

  // ---------------------------------------------------------
  // 🔥 게시글 전체 불러오기
  // ---------------------------------------------------------
  const loadPosts = async () => {
    try {
      const res = await fetch("/api/community/user/all");
      const data = await res.json();

      const postsWithComments = await Promise.all(
        data.map(async (p) => {
          const res = await fetch(
            `/api/community/comments/user/${p.id}`
          );
          const commentList = await res.json();

          return {
            id: p.id,
            title: p.title,
            content: p.content,
            tags: p.tags ? p.tags.split(",") : [],
            author: p.author || "익명",
            location: p.location || "지역 정보 없음",
            likes: p.likes || 0,
            views: p.views || 0,
            createdAt: p.createdAt || "",
            icon: "💬",
            isLiked: false,
            isMine: p.memberId === myCustomerId,
            commentCount: commentList.length,
          };
        })
      );

      // 최신순
      postsWithComments.sort((a, b) => b.id - a.id);

      setPosts(postsWithComments);
    } catch (err) {
      console.error("게시글 로딩 실패:", err);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // ---------------------------------------------------------
  // 댓글 불러오기
  // ---------------------------------------------------------
  const loadComments = async (postId) => {
    try {
      const res = await fetch(
        `/api/community/comments/user/${postId}`
      );
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error("댓글 로딩 실패:", err);
    }
  };

  // ---------------------------------------------------------
  // 상세보기
  // ---------------------------------------------------------
  const handleViewDetail = (post) => {
    setSelectedPost(post);
    setIsDetailModalOpen(true);
    loadComments(post.id);

    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, views: p.views + 1 } : p))
    );
  };

  // ---------------------------------------------------------
  // 댓글 작성
  // ---------------------------------------------------------
  const handleSubmitComment = async () => {
    const content = document.getElementById("comment-input").value;
    if (!content.trim()) return;

    await fetch("/api/community/comments/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        communityId: selectedPost.id,
        author: loginUser?.name || "익명",
        content,
      }),
    });

    document.getElementById("comment-input").value = "";
    loadComments(selectedPost.id);
    loadPosts();
  };

  // ---------------------------------------------------------
  // 댓글 삭제
  // ---------------------------------------------------------
  const handleDeleteComment = async (commentId) => {
    await fetch(`/api/community/comments/${commentId}`, {
      method: "DELETE",
    });

    loadComments(selectedPost.id);
    loadPosts();
  };

  // ---------------------------------------------------------
  // 좋아요
  // ---------------------------------------------------------
  const handleLike = (id) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
              isLiked: !p.isLiked,
            }
          : p
      )
    );
  };

  // ---------------------------------------------------------
  // 글쓰기 / 수정 저장
  // ---------------------------------------------------------
  const handleSubmitPost = async () => {
    try {
      const body = {
        title: writeTitle,
        content: writeContent,
        tags: writeTags,
        memberId: myCustomerId,
      };

      if (editMode) {
        await fetch(
          `/api/community/user/${editTarget.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );

        setToast({
          show: true,
          message: "게시글이 수정되었습니다!",
          type: "success",
        });
      } else {
        await fetch("/api/community/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        setToast({
          show: true,
          message: "게시글이 작성되었습니다!",
          type: "success",
        });
      }

      // 초기화
      setIsWriteModalOpen(false);
      setEditMode(false);
      setWriteTitle("");
      setWriteContent("");
      setWriteTags("");

      loadPosts();
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------------------------------------------------
  // 글 삭제
  // ---------------------------------------------------------
  const handleDeletePost = async (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;

    await fetch(`/api/community/user/${id}`, {
      method: "DELETE",
    });

    setToast({ show: true, message: "삭제되었습니다!", type: "success" });
    loadPosts();
  };

  // ---------------------------------------------------------
  // 수정 버튼 클릭
  // ---------------------------------------------------------
  const handleEdit = (post) => {
    setEditMode(true);
    setEditTarget(post);

    // 모달에 기존 데이터 채우기
    setWriteTitle(post.title);
    setWriteContent(post.content);
    setWriteTags(post.tags.join(","));

    setIsWriteModalOpen(true);
  };

  // ---------------------------------------------------------
  // 정렬
  // ---------------------------------------------------------
  let displayedPosts = [...posts];

  if (viewTab === "ALL") {
    displayedPosts.sort((a, b) => b.id - a.id);
  }

  if (viewTab === "HOT") {
    displayedPosts = displayedPosts.sort(
      (a, b) => b.likes - a.likes || b.views - a.views
    );
  }

  if (viewTab === "MINE") {
    displayedPosts = displayedPosts
      .filter((p) => p.isMine)
      .sort((a, b) => b.id - a.id);
  }

  // ---------------------------------------------------------
  // 렌더링
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar userType="customer" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <MessageSquare size={32} className="mr-3 text-primary-purple" />
          고객 커뮤니티
        </h1>

        {/* 탭 */}
        <div className="flex gap-6 mb-6 text-lg font-semibold">
          <button
            onClick={() => setViewTab("ALL")}
            className={
              viewTab === "ALL" ? "text-primary-purple" : "text-gray-400"
            }
          >
            전체 글
          </button>

          <button
            onClick={() => setViewTab("HOT")}
            className={
              viewTab === "HOT" ? "text-primary-purple" : "text-gray-400"
            }
          >
            인기 글
          </button>

          <button
            onClick={() => setViewTab("MINE")}
            className={
              viewTab === "MINE" ? "text-primary-purple" : "text-gray-400"
            }
          >
            내 글
          </button>

          <button
            className="ml-auto bg-primary-purple text-white px-4 py-2 rounded-lg"
            onClick={() => setIsWriteModalOpen(true)}
          >
            글쓰기
          </button>
        </div>

        {/* 게시글 리스트 */}
        <div className="space-y-4">
          {displayedPosts.map((post) => (
            <Card
              key={post.id}
              onClick={() => handleViewDetail(post)}
              className="cursor-pointer hover:shadow-md transition"
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{post.icon}</div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold">{post.title}</h3>

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

                  <p className="text-slate-600 line-clamp-2">{post.content}</p>

                  <div className="flex gap-2 flex-wrap mt-2">
                    {post.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-purple-100 text-primary-purple rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-6 mt-3">
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
                      {post.commentCount}
                    </span>

                    <span className="flex items-center text-slate-500">
                      <Eye size={18} className="mr-1" />
                      {post.views}
                    </span>
                  </div>

                  {post.isMine && (
                    <div className="flex justify-end space-x-4 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(post);
                        }}
                        className="text-green-600 font-medium hover:underline"
                      >
                        수정
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost(post.id);
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

      {/* 상세보기 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedPost?.title || "게시글"}
      >
        <p className="mb-4">{selectedPost?.content}</p>

        <h3 className="font-semibold mb-2">댓글</h3>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {comments.map((c) => (
            <div
              key={c.id}
              className="border p-3 rounded-lg flex justify-between items-start"
            >
              <div>
                <p className="font-semibold">{c.author}</p>
                <p>{c.content}</p>
              </div>

              <Trash
                size={18}
                className="text-red-500 cursor-pointer"
                onClick={() => handleDeleteComment(c.id)}
              />
            </div>
          ))}
        </div>

        <div className="mt-4">
          <textarea
            id="comment-input"
            className="w-full border rounded-lg p-2"
            placeholder="댓글을 입력하세요"
          />

          <Button className="w-full mt-2" onClick={handleSubmitComment}>
            댓글 작성
          </Button>
        </div>
      </Modal>

      {/* 글쓰기 모달 */}
      <Modal
        isOpen={isWriteModalOpen}
        onClose={() => {
          setIsWriteModalOpen(false);
          setEditMode(false);
          setEditTarget(null);
          setWriteTitle("");
          setWriteContent("");
          setWriteTags("");
        }}
        title={editMode ? "게시글 수정" : "글쓰기"}
      >
        <div className="space-y-3">
          <input
            className="w-full p-3 border rounded-lg"
            placeholder="제목"
            value={writeTitle}
            onChange={(e) => setWriteTitle(e.target.value)}
          />

          <textarea
            className="w-full p-3 border rounded-lg resize-none"
            rows="6"
            placeholder="내용"
            value={writeContent}
            onChange={(e) => setWriteContent(e.target.value)}
          />

          <input
            className="w-full p-3 border rounded-lg"
            placeholder="태그(쉼표로 구분)"
            value={writeTags}
            onChange={(e) => setWriteTags(e.target.value)}
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
