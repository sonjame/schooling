'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type React from 'react'

export default function EditPostPage() {
  const params = useParams<{ id: string }>()
  const postId = params.id
  const router = useRouter()

  const boardKeys = [
    'board_free',
    'board_promo',
    'board_club',
    'board_grade1',
    'board_grade2',
    'board_grade3',
  ]

  const [storageKey, setStorageKey] = useState<string>('')
  const [post, setPost] = useState<any>(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState<string>('')

  /* 🔥 투표 수정 상태 */
  const [voteEnabled, setVoteEnabled] = useState(false)
  const [voteOptions, setVoteOptions] = useState<string[]>([])
  const [voteEndAt, setVoteEndAt] = useState<string>('') // yyyy-mm-ddTHH:mm

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /* 모달 상태 */
  const [modal, setModal] = useState({
    show: false,
    message: '',
    type: 'alert' as 'alert' | 'confirm',
    onConfirm: () => {},
    onCancel: () => {},
  })

  /* 모달 */
  const showAlert = (msg: string, callback?: () => void) => {
    setModal({
      show: true,
      message: msg,
      type: 'alert',
      onConfirm: () => {
        setModal((m) => ({ ...m, show: false }))
        if (callback) callback()
      },
      onCancel: () => {},
    })
  }

  const showConfirm = (msg: string, yesFn: () => void) => {
    setModal({
      show: true,
      message: msg,
      type: 'confirm',
      onConfirm: () => {
        setModal((m) => ({ ...m, show: false }))
        yesFn()
      },
      onCancel: () => setModal((m) => ({ ...m, show: false })),
    })
  }

  /* ------------------------------
     게시글 로드
  ------------------------------ */
  useEffect(() => {
    let foundPost: any = null
    let foundKey = ''

    for (const key of boardKeys) {
      const list = JSON.parse(localStorage.getItem(key) || '[]')
      const match = list.find((p: any) => String(p.id) === String(postId))
      if (match) {
        foundPost = match
        foundKey = key
        break
      }
    }

    if (foundPost) {
      setPost(foundPost)
      setStorageKey(foundKey)
      setTitle(foundPost.title)
      setContent(foundPost.content || '')
      setImage(foundPost.image || '')

      /* 🔥 투표 정보 로드 */
      if (foundPost.vote?.enabled) {
        setVoteEnabled(true)
        setVoteOptions(foundPost.vote.options.map((o: any) => o.text))
        setVoteEndAt(foundPost.vote.endAt || '')
      }
    }
  }, [postId])

  /* textarea 자동 높이 조절 */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [content])

  /* 이미지 업로드 */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => setImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  /* ------------------------------
     저장하기
  ------------------------------ */
  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      showAlert('제목과 내용을 모두 입력하세요.')
      return
    }

    if (!storageKey) {
      showAlert('게시판 정보를 찾을 수 없습니다.')
      return
    }

    showConfirm('정말 수정하시겠습니까?', () => {
      /* 게시판별 저장 */
      const boardList = JSON.parse(localStorage.getItem(storageKey) || '[]')

      const updatedBoard = boardList.map((p: any) =>
        String(p.id) === String(postId)
          ? {
              ...p,
              title,
              content,
              image,
              vote: voteEnabled
                ? {
                    enabled: true,
                    options: voteOptions.map((text, idx) => {
                      // 기존 옵션 데이터 찾아오기
                      const oldOpt =
                        p.vote?.options?.find((o: any) => o.text === text) || {}

                      return {
                        optionId: oldOpt.optionId ?? crypto.randomUUID(),
                        text,
                        votes: oldOpt.votes ?? 0,
                        voters: oldOpt.voters ?? [],
                      }
                    }),
                    endAt: voteEndAt,
                  }
                : { enabled: false },
            }
          : p
      )

      localStorage.setItem(storageKey, JSON.stringify(updatedBoard))

      /* posts_all 저장 */
      const all = JSON.parse(localStorage.getItem('posts_all') || '[]')
      const updatedAll = all.map((p: any) =>
        String(p.id) === String(postId)
          ? {
              ...p,
              title,
              content,
              image,
              vote: voteEnabled
                ? {
                    enabled: true,
                    options: voteOptions.map((text) => {
                      const oldOpt =
                        p.vote?.options?.find((o: any) => o.text === text) || {}

                      return {
                        optionId: oldOpt.optionId ?? crypto.randomUUID(),
                        text,
                        votes: oldOpt.votes ?? 0,
                        voters: oldOpt.voters ?? [],
                      }
                    }),
                    endAt: voteEndAt,
                  }
                : { enabled: false },
            }
          : p
      )

      localStorage.setItem('posts_all', JSON.stringify(updatedAll))

      showAlert('수정되었습니다!', () => {
        router.push(`/board/post/${postId}`)
      })
    })
  }

  if (!post) return <p style={{ padding: 20 }}>게시글을 찾을 수 없습니다.</p>

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
            게시글 수정
          </h2>

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
            ref={textareaRef}
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
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={image} style={previewImg} />

                <button style={deleteBtn} onClick={() => setImage('')}>
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

          {/* ------------------------------- */}
          {/* 🔥 투표 수정 UI */}
          {/* ------------------------------- */}

          <hr style={{ margin: '20px 0', borderColor: '#ddd' }} />

          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
            🗳 투표 수정
          </h3>

          {/* 투표 활성화 */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                ...label,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <input
                type="checkbox"
                checked={voteEnabled}
                onChange={(e) => setVoteEnabled(e.target.checked)}
              />
              투표 사용하기
            </label>
          </div>

          {voteEnabled && (
            <div style={{ paddingLeft: 8 }}>
              {/* 옵션 수정 */}
              <label style={label}>투표 옵션</label>

              {voteOptions.map((opt, idx) => (
                <div
                  key={idx}
                  style={{ display: 'flex', gap: 8, marginBottom: 8 }}
                >
                  <input
                    value={opt}
                    onChange={(e) => {
                      const list = [...voteOptions]
                      list[idx] = e.target.value
                      setVoteOptions(list)
                    }}
                    placeholder={`옵션 ${idx + 1}`}
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '1px solid #ccc',
                      borderRadius: 8,
                    }}
                  />

                  <button
                    onClick={() =>
                      setVoteOptions(voteOptions.filter((_, i) => i !== idx))
                    }
                    style={{
                      background: '#ff5252',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '0 10px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    삭제
                  </button>
                </div>
              ))}

              <button
                onClick={() => setVoteOptions([...voteOptions, ''])}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#E3F2FD',
                  border: '1px solid #90CAF9',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  marginBottom: 14,
                }}
              >
                + 옵션 추가
              </button>

              {/* 마감 시간 */}
              <label style={label}>투표 마감 시간</label>
              <input
                type="datetime-local"
                value={voteEndAt}
                onChange={(e) => setVoteEndAt(e.target.value)}
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '0 14px',
                  border: '1.5px solid #CFD8DC',
                  borderRadius: '10px',
                  fontSize: '15px',
                  background: '#FFFFFF',
                  boxSizing: 'border-box',
                  marginBottom: '18px', // 🔥 여백 추가 (이 줄만 추가!)
                }}
              />
            </div>
          )}

          {/* 저장하기 */}
          <button onClick={handleSave} style={submitBtn}>
            저장하기
          </button>
        </div>
      </div>

      {/* 모달 */}
      {modal.show && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-icon">✔</div>
            <p>{modal.message}</p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 10,
                marginTop: 12,
              }}
            >
              {modal.type === 'confirm' && (
                <button
                  style={{
                    padding: '8px 14px',
                    background: '#ddd',
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  onClick={modal.onCancel}
                >
                  취소
                </button>
              )}

              <button
                style={{
                  padding: '8px 14px',
                  background: '#4FC3F7',
                  color: 'white',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
                onClick={modal.onConfirm}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .modal-box {
          background: #ffffff;
          padding: 22px 28px;
          border-radius: 12px;
          border: 2px solid #4fc3f7;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          text-align: center;
          animation: fadeIn 0.25s ease-out;
        }

        .modal-icon {
          color: #4fc3f7;
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 6px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  )
}

/* -------------------- Style -------------------- */

const pageWrap: React.CSSProperties = {
  background: '#F3F6FA',
  minHeight: '100vh',
  padding: 'clamp(12px, 4vw, 40px)',
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box',
  overflowX: 'hidden',
}

const card: React.CSSProperties = {
  width: '100%',
  maxWidth: '700px',
  margin: '0 auto',
  background: '#fff',
  padding: 'clamp(18px, 4vw, 30px)',
  borderRadius: 18,
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  border: '1px solid #E3EAF3',
  boxSizing: 'border-box',
}

const titleStyle: React.CSSProperties = {
  fontSize: 'clamp(20px, 5vw, 26px)',
  fontWeight: 800,
  display: 'flex',
  alignItems: 'center',
  color: '#0277BD',
  marginBottom: 'clamp(14px, 3vw, 20px)',
}

const titleIcon: React.CSSProperties = {
  fontSize: 'clamp(22px, 4vw, 28px)',
  marginRight: 6,
}

const label: React.CSSProperties = {
  fontWeight: 600,
  marginBottom: 6,
  marginTop: 'clamp(10px, 2vw, 16px)',
  fontSize: 'clamp(13px, 3vw, 15px)',
  color: '#37474F',
  display: 'block',
}

const inputBox: React.CSSProperties = {
  width: '100%',
  padding: '12px 10px',
  borderRadius: 10,
  border: '1px solid #CFD8DC',
  background: '#F9FAFB',
  fontSize: 'clamp(14px, 3vw, 15px)',
  outline: 'none',
  boxSizing: 'border-box',
}

const textArea: React.CSSProperties = {
  width: '100%',
  padding: '12px 10px',
  borderRadius: 10,
  border: '1px solid #CFD8DC',
  background: '#F9FAFB',
  fontSize: 'clamp(14px, 3vw, 15px)',
  resize: 'none',
  outline: 'none',
  overflow: 'hidden',
  boxSizing: 'border-box',
}

const uploadBtn: React.CSSProperties = {
  marginTop: 16,
  marginBottom: 16,
  width: '100%',
  padding: 'clamp(12px, 3vw, 14px) 0',
  borderRadius: 12,
  background: '#E3F2FD',
  color: '#0277BD',
  fontWeight: 700,
  fontSize: 'clamp(14px, 3vw, 16px)',
  cursor: 'pointer',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  boxSizing: 'border-box',
}

const uploadBtnIcon: React.CSSProperties = {
  fontSize: 'clamp(20px, 5vw, 22px)',
}

const previewWrap: React.CSSProperties = {
  textAlign: 'center',
  marginTop: 20,
  marginBottom: 20,
}

const previewImg: React.CSSProperties = {
  width: 'min(240px, 100%)',
  borderRadius: 14,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
}

const deleteBtn: React.CSSProperties = {
  position: 'absolute',
  top: -10,
  right: -10,
  width: 32,
  height: 32,
  borderRadius: '50%',
  background: '#ffffff',
  border: '1px solid #ccc',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
}

const submitBtn: React.CSSProperties = {
  width: '100%',
  padding: 'clamp(12px, 3vw, 14px) 0',
  background: 'linear-gradient(90deg, #4FC3F7, #0288D1)',
  border: 'none',
  borderRadius: 12,
  color: 'white',
  fontWeight: 700,
  fontSize: 'clamp(15px, 3vw, 16px)',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(2,136,209,0.25)',
}
