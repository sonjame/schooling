'use client'

import { useEffect, useState } from 'react'
import type React from 'react'

export default function WritePage() {
  const [category, setCategory] = useState('free')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([]) // ⭐ 여러 장 저장

  /* 모달 */
  const [modal, setModal] = useState({
    show: false,
    message: '',
    onConfirm: () => {},
  })

  const showAlert = (msg: string, callback?: () => void) => {
    setModal({
      show: true,
      message: msg,
      onConfirm: () => {
        setModal((prev) => ({ ...prev, show: false }))
        if (callback) callback()
      },
    })
  }

  /* 카테고리 로드 */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const c = params.get('category')
    if (c) setCategory(c)
  }, [])

  /* ⭐ 이미지 여러 장 업로드 */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const fileArray = Array.from(files)

    fileArray.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        setImages((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  /* 🔥 글 작성 저장 */
  const submit = () => {
    if (!title.trim() || !content.trim()) {
      showAlert('제목과 내용을 모두 입력해주세요.')
      return
    }

    // 로그인 정보 username만 사용
    const raw = localStorage.getItem('loggedInUser')
    let username = '익명'

    try {
      const obj = JSON.parse(raw || '{}')
      username = obj.username || '익명'
    } catch {
      username = raw || '익명'
    }

    const storageKey = `board_${category}`
    const boardList = JSON.parse(localStorage.getItem(storageKey) || '[]')
    const allPosts = JSON.parse(localStorage.getItem('posts_all') || '[]')

    const newPost = {
      id: crypto.randomUUID(),
      title,
      content,
      images, // ⭐ 여러 장 저장됨
      author: username,
      category,
      likes: 0,
      createdAt: Date.now(),
    }

    localStorage.setItem(storageKey, JSON.stringify([newPost, ...boardList]))
    localStorage.setItem('posts_all', JSON.stringify([newPost, ...allPosts]))

    showAlert('작성 완료!', () => {
      window.location.href = `/board/${category}`
    })
  }

  return (
    <>
      <div style={pageWrap}>
        <div style={card}>
          <h2 style={titleStyle}>
            <span className="material-symbols-rounded" style={titleIcon}></span>
            글쓰기
          </h2>

          {/* 카테고리 */}
          <label style={label}>카테고리</label>
          <div style={{ ...inputBox, background: '#ECEFF1', fontWeight: 600 }}>
            {category === 'free'
              ? '자유게시판'
              : category === 'promo'
              ? '홍보게시판'
              : category === 'club'
              ? '동아리게시판'
              : `${category.replace('grade', '')}학년 게시판`}
          </div>

          {/* 제목 */}
          <label style={label}>제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            style={inputBox}
          />

          {/* 내용 */}
          <label style={label}>내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            style={textArea}
          />

          {/* 이미지 업로드 */}
          <input
            id="uploadImage"
            type="file"
            accept="image/*"
            multiple // ⭐ 여러장 가능
            hidden
            onChange={handleImageUpload}
          />

          <label htmlFor="uploadImage" style={uploadBtn}>
            <span className="material-symbols-rounded" style={uploadBtnIcon}>
              image
            </span>
            사진 업로드
          </label>

          {/* 미리보기 */}
          {images.length > 0 && (
            <div style={previewGrid}>
              {images.map((src, idx) => (
                <div key={idx} style={previewBox}>
                  <img src={src} style={previewImg} />
                  <button
                    style={deleteBtn}
                    onClick={() =>
                      setImages((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <button onClick={submit} style={submitBtn}>
            등록하기
          </button>
        </div>
      </div>

      {/* 모달 */}
      {modal.show && (
        <div style={modalBg}>
          <div style={modalBox}>
            <p>{modal.message}</p>
            <button style={btnBlue} onClick={modal.onConfirm}>
              확인
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/* -------------------- Style -------------------- */

const pageWrap: React.CSSProperties = {
  background: '#F3F6FA',
  minHeight: '100vh',
  padding: '40px 20px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  fontFamily: 'Inter, sans-serif',
}

const card: React.CSSProperties = {
  width: '100%',
  maxWidth: 720,
  background: '#fff',
  padding: '36px 40px',
  borderRadius: 20,
  boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
  border: '1px solid #E3EAF3',
  marginTop: 20,
}

const titleStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 800,
  display: 'flex',
  alignItems: 'center',
  color: '#0277BD',
  marginBottom: 28,
  letterSpacing: '-0.3px',
}

const titleIcon: React.CSSProperties = {
  fontSize: 'clamp(22px, 4vw, 28px)',
  marginRight: 6,
}

const label: React.CSSProperties = {
  fontWeight: 600,
  marginTop: 22,
  marginBottom: 10,
  fontSize: 15,
  color: '#37474F',
  display: 'block',
}

const inputBox: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 12,
  border: '1.5px solid #CFD8DC',
  background: '#F9FAFB',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box',
}

const textArea: React.CSSProperties = {
  width: '100%',
  height: 220,
  padding: '14px 16px',
  borderRadius: 12,
  border: '1.5px solid #CFD8DC',
  background: '#F9FAFB',
  fontSize: '15px',
  resize: 'vertical',
  outline: 'none',
  boxSizing: 'border-box',
  lineHeight: 1.6,
}

const uploadBtn: React.CSSProperties = {
  marginTop: 26,
  marginBottom: 20,
  width: '100%',
  padding: '14px 0',
  borderRadius: 12,
  background: '#E3F2FD',
  color: '#0277BD',
  fontWeight: 700,
  fontSize: 16,
  cursor: 'pointer',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
}

const uploadBtnIcon: React.CSSProperties = {
  fontSize: 22,
}

const previewGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: '14px',
  marginTop: '10px',
  marginBottom: '14px',
}

const previewBox: React.CSSProperties = {
  position: 'relative',
  borderRadius: 10,
  overflow: 'hidden',
  border: '1px solid #ddd',
}

const previewImg: React.CSSProperties = {
  width: 110,
  height: 110,
  objectFit: 'cover',
  borderRadius: 12,
  boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
}

const deleteBtn: React.CSSProperties = {
  position: 'absolute',
  top: 4,
  right: 4,
  background: '#fff',
  width: 26,
  height: 26,
  borderRadius: '50%',
  border: '1px solid #ccc',
  cursor: 'pointer',
  fontWeight: 600,
}

const submitBtn: React.CSSProperties = {
  width: '100%',
  padding: '16px 0',
  marginTop: 30,
  background: 'linear-gradient(90deg, #4FC3F7, #0288D1)',
  border: 'none',
  borderRadius: 14,
  color: 'white',
  fontWeight: 800,
  fontSize: 17,
  cursor: 'pointer',
  boxShadow: '0 5px 14px rgba(2,136,209,0.25)',
}

const modalBg: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999,
}

const modalBox: React.CSSProperties = {
  background: 'white',
  padding: '22px',
  borderRadius: 12,
  width: 300,
  textAlign: 'center',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
}

const btnBlue: React.CSSProperties = {
  background: '#4FC3F7',
  color: 'white',
  padding: '8px 14px',
  borderRadius: 6,
  border: 'none',
  fontWeight: 600,
  cursor: 'pointer',
}
