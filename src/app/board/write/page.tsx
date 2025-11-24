"use client";

import { useEffect, useState } from "react";
import type React from "react";

export default function WritePage() {
  const [category, setCategory] = useState("free");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");

  /* 🔵 모달 상태 */
  const [modal, setModal] = useState({
    show: false,
    message: "",
    onConfirm: () => { },
  });

  const showAlert = (msg: string, callback?: () => void) => {
    setModal({
      show: true,
      message: msg,
      onConfirm: () => {
        setModal((prev) => ({ ...prev, show: false }));
        if (callback) callback();
      },
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("category");
    if (c) setCategory(c);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!title.trim() || !content.trim()) {
      showAlert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    const author = localStorage.getItem("loggedInUser") || "익명";

    // 게시판별 저장소
    const storageKey = `board_${category}`;
    const all = JSON.parse(localStorage.getItem(storageKey) || "[]");

    const newPost = {
      id: crypto.randomUUID(),
      title,
      content,
      author,
      category,
      likes: 0,
      createdAt: Date.now(),
      image,
    };

    localStorage.setItem(storageKey, JSON.stringify([newPost, ...all]));

    showAlert("작성 완료!", () => {
      window.location.href = `/board/${category}`;
    });
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded"
        rel="stylesheet"
      />

      <div style={pageWrap}>
        <div style={card}>
          <h2 style={titleStyle}>
            <span className="material-symbols-rounded" style={titleIcon}>
              edit
            </span>
            글쓰기
          </h2>

          <label style={label}>제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            style={inputBox}
          />

          <label style={label}>내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            style={textArea}
          />

          <input
            id="uploadImage"
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageUpload}
          />

          <label htmlFor="uploadImage" style={uploadBtn}>
            <span className="material-symbols-rounded" style={uploadBtnIcon}>
              image
            </span>
            사진 업로드
          </label>

          {image && (
            <div style={previewWrap}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <img src={image} style={previewImg} />

                <button style={deleteBtn} onClick={() => setImage("")}>
                  <span
                    className="material-symbols-rounded"
                    style={{ fontSize: 20 }}
                  >
                    close
                  </span>
                </button>
              </div>
            </div>
          )}

          <button onClick={submit} style={submitBtn}>
            등록하기
          </button>
        </div>
      </div>

      {modal.show && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              width: 320,
              background: "white",
              padding: 22,
              borderRadius: 12,
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            <p
              style={{ marginBottom: 20, fontSize: 15, whiteSpace: "pre-line" }}
            >
              {modal.message}
            </p>

            <button
              style={{
                padding: "8px 14px",
                background: "#4FC3F7",
                color: "white",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
              }}
              onClick={modal.onConfirm}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* -------------------- Style -------------------- */

const pageWrap: React.CSSProperties = {
  background: "#F3F6FA",
  minHeight: "100vh",
  padding: "clamp(16px, 4vw, 40px)",
  fontFamily: "Inter, sans-serif",
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 700,
  margin: "0 auto",
  background: "#fff",
  padding: "clamp(16px, 4vw, 32px)",
  borderRadius: 18,
  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  border: "1px solid #E3EAF3",
};

const titleStyle: React.CSSProperties = {
  fontSize: "clamp(20px, 4vw, 26px)",
  fontWeight: 800,
  display: "flex",
  alignItems: "center",
  color: "#0277BD",
  marginBottom: "clamp(16px, 4vw, 24px)",
};

const titleIcon: React.CSSProperties = {
  fontSize: "clamp(22px, 4vw, 28px)",
  marginRight: 6,
};

const label: React.CSSProperties = {
  fontWeight: 600,
  marginTop: "clamp(12px, 2vw, 18px)",
  marginBottom: 6,
  fontSize: "clamp(13px, 3vw, 15px)",
  color: "#37474F",
  display: "block",
};

const inputBox: React.CSSProperties = {
  width: "100%",
  padding: "clamp(10px, 2vw, 12px)",
  borderRadius: 10,
  border: "1px solid #CFD8DC",
  background: "#F9FAFB",
  fontSize: "clamp(14px, 3vw, 15px)",
  outline: "none",
};

const textArea: React.CSSProperties = {
  width: "100%",
  height: "clamp(160px, 25vw, 200px)",
  padding: "clamp(10px, 2vw, 12px)",
  borderRadius: 10,
  border: "1px solid #CFD8DC",
  background: "#F9FAFB",
  fontSize: "clamp(14px, 3vw, 15px)",
  resize: "vertical",
  outline: "none",
};

const uploadBtn: React.CSSProperties = {
  marginTop: "clamp(14px, 3vw, 20px)",
  marginBottom: "clamp(14px, 3vw, 20px)",
  width: "100%",
  padding: "clamp(12px, 3vw, 14px) 0",
  borderRadius: 12,
  background: "#E3F2FD",
  color: "#0277BD",
  fontWeight: 700,
  fontSize: "clamp(14px, 3vw, 16px)",
  cursor: "pointer",
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const uploadBtnIcon: React.CSSProperties = {
  fontSize: "clamp(20px, 4vw, 22px)",
};

const previewWrap: React.CSSProperties = {
  textAlign: "center",
  marginTop: 20,
  marginBottom: 20,
};

const previewImg: React.CSSProperties = {
  width: "min(240px, 85%)",
  borderRadius: 14,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

const deleteBtn: React.CSSProperties = {
  position: "absolute",
  top: -10,
  right: -10,
  width: 32,
  height: 32,
  borderRadius: "50%",
  background: "#ffffff",
  border: "1px solid #ccc",
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
};

const submitBtn: React.CSSProperties = {
  width: "100%",
  padding: "clamp(12px, 3vw, 14px) 0",
  background: "linear-gradient(90deg, #4FC3F7, #0288D1)",
  border: "none",
  borderRadius: 12,
  color: "white",
  fontWeight: 700,
  fontSize: "clamp(15px, 3vw, 16px)",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(2,136,209,0.25)",
};
