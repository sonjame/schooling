"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Post {
  id: string;
  author: string;
  title: string;
  content: string;
  likes: number;
  category: string;
  createdAt: number;
  image?: string;
}

export default function BoardTemplate({
  title,
  category,
  storageKey,
}: {
  title: string;
  category: string;
  storageKey: string;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState<"latest" | "likes">("latest");

  const getCommentCount = (id: string) => {
    const data = JSON.parse(localStorage.getItem(`comments_${id}`) || "[]");
    return data.length;
  };

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    const posts = raw ? JSON.parse(raw) : [];
    setPosts(posts);
  }, [storageKey]);

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filteredPosts].sort((a, b) => {
    if (sortType === "latest") return b.createdAt - a.createdAt;
    if (sortType === "likes") return b.likes - a.likes;
    return 0;
  });

  return (
    <div
      style={{
        background: "#fff",
        padding: "24px",
        borderRadius: "12px",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          fontSize: "22px",
          fontWeight: 700,
          borderBottom: "2px solid #4FC3F7",
          paddingBottom: "6px",
          marginBottom: "18px",
          color: "#4FC3F7",
        }}
      >
        {title}
      </h2>

      {/* 검색 */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: "1 1 200px",
            padding: 12,
            borderRadius: 8,
            border: "1.5px solid #ccc",
          }}
        />

        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value as "latest" | "likes")}
          style={{
            padding: "0 12px",
            height: 44,
            borderRadius: 8,
            border: "1.5px solid #ccc",
          }}
        >
          <option value="latest">🕒 최신순</option>
          <option value="likes">💙 좋아요순</option>
        </select>

        <Link
          href={`/board/write?category=${category}`}
          style={{
            height: 44,
            padding: "0 18px",
            background: "#4FC3F7",
            color: "white",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
          }}
        >
          ✏ 글쓰기
        </Link>
      </div>

      {/* 목록 */}
      {sorted.length === 0 ? (
        <p style={{ color: "#666", textAlign: "center" }}>게시글이 없습니다.</p>
      ) : (
        sorted.map((p) => (
          <Link
            key={p.id}
            href={`/board/post/${p.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                border: "2px solid #E1F5FE",
                borderRadius: 12,
                padding: 16,
                marginBottom: 14,
                cursor: "pointer",
              }}
            >
              <h3 style={{ fontSize: 17, fontWeight: 600 }}>{p.title}</h3>

              <p
                style={{
                  marginTop: 6,
                  color: "#555",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {p.content}
              </p>

              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: "#666",
                }}
              >
                <span>
                  작성자: {p.author} · {new Date(p.createdAt).toLocaleString()}
                </span>

                <span style={{ display: "flex", gap: 10 }}>
                  <span>💙 {p.likes}</span>
                  <span>💬 {getCommentCount(p.id)}</span>
                </span>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
