'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type React from 'react'

export default function PostDetailPage() {
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

  const [post, setPost] = useState<any>(null)
  const [storageKey, setStorageKey] = useState<string>('')

  const [comments, setComments] = useState<any[]>([])
  const [username, setUsername] = useState<string>('') // username만 저장하도록 고침

  const [commentValue, setCommentValue] = useState('')
  const [replyTarget, setReplyTarget] = useState<string | null>(null)
  const [replyValue, setReplyValue] = useState('')

  const [editId, setEditId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const [menuOpen, setMenuOpen] = useState(false)
  const [isAuthor, setIsAuthor] = useState(false)

  const [scrapped, setScrapped] = useState(false)

  const [reportOpen, setReportOpen] = useState(false)
  const [reportType, setReportType] = useState('')
  const [reportText, setReportText] = useState('')

  const [openCommentMenu, setOpenCommentMenu] = useState<string | null>(null)

  const [modal, setModal] = useState({
    show: false,
    message: '',
    type: 'alert' as 'alert' | 'confirm',
    onConfirm: () => {},
    onCancel: () => {},
  })

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

  /* ------------------------------------------
     게시글 + 댓글 로딩
  ------------------------------------------- */
  useEffect(() => {
    let foundPost: any = null
    let foundKey = ''

    // 게시글 찾기
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
    }

    // 로그인 유저 username만 불러오기
    try {
      const saved = localStorage.getItem('loggedInUser')
      const parsed = JSON.parse(saved || '{}')
      setUsername(parsed.username || '')
    } catch {
      setUsername('')
    }

    // 댓글 로드 + author 자동 정리
    const rawComments = JSON.parse(
      localStorage.getItem(`comments_${postId}`) || '[]'
    )

    const cleaned = rawComments.map((c: any) => {
      let author = c.author

      // author가 JSON 형태이면 username만 추출
      if (typeof author === 'string' && author.includes('{')) {
        try {
          author = JSON.parse(author).username || author
        } catch {}
      }

      return { ...c, author }
    })

    setComments(cleaned)
    localStorage.setItem(`comments_${postId}`, JSON.stringify(cleaned))
  }, [postId])

  /* ------------------------------------------
     게시글 작성자인지 체크
  ------------------------------------------- */
  useEffect(() => {
    if (!post || !username) return

    let author = post.author

    // author가 JSON이면 username만 추출
    if (typeof author === 'string' && author.includes('{')) {
      try {
        author = JSON.parse(author).username
      } catch {}
    }

    setIsAuthor(username.trim() === String(author).trim())
  }, [post, username])

  /* ------------------------------------------
     스크랩 여부
  ------------------------------------------- */
  useEffect(() => {
    if (!post || !username) return

    const key = `scrap_${username}`
    const saved = JSON.parse(localStorage.getItem(key) || '[]')
    setScrapped(saved.includes(postId))
  }, [post, username])

  const toggleScrap = () => {
    if (!username) return showAlert('로그인이 필요합니다.')

    const key = `scrap_${username}`
    const saved = JSON.parse(localStorage.getItem(key) || '[]')

    let updated = []

    if (saved.includes(postId)) {
      updated = saved.filter((i: string) => i !== postId)
      setScrapped(false)
      showAlert('스크랩이 해제되었습니다.')
    } else {
      updated = [...saved, postId]
      setScrapped(true)
      showAlert('스크랩되었습니다.')
    }

    localStorage.setItem(key, JSON.stringify(updated))
  }

  /* ------------------------------------------
     댓글 트리 구성
  ------------------------------------------- */
  function buildTree(arr: any[], parent: string | null = null): any[] {
    return arr
      .filter((c) => c.parent === parent)
      .map((c) => ({
        ...c,
        children: buildTree(arr, c.id),
      }))
  }

  const commentTree = buildTree(comments)

  /* ------------------------------------------
     댓글 작성
  ------------------------------------------- */
  const writeComment = () => {
    if (!commentValue.trim()) return

    const newComment = {
      id: crypto.randomUUID(),
      content: commentValue,
      author: username || '익명',
      createdAt: new Date().toLocaleString(),
      parent: null,
    }

    const updated = [...comments, newComment]
    setComments(updated)

    localStorage.setItem(`comments_${postId}`, JSON.stringify(updated))
    setCommentValue('')
  }

  /* ------------------------------------------
     대댓글 작성
  ------------------------------------------- */
  const writeReply = () => {
    if (!replyValue.trim() || !replyTarget) return

    const newReply = {
      id: crypto.randomUUID(),
      content: replyValue,
      author: username || '익명',
      createdAt: new Date().toLocaleString(),
      parent: replyTarget,
    }

    const updated = [...comments, newReply]
    setComments(updated)

    localStorage.setItem(`comments_${postId}`, JSON.stringify(updated))
    setReplyValue('')
    setReplyTarget(null)
  }

  /* ------------------------------------------
     댓글 수정
  ------------------------------------------- */
  const saveEdit = () => {
    const updated = comments.map((c) =>
      c.id === editId ? { ...c, content: editValue } : c
    )

    setComments(updated)
    localStorage.setItem(`comments_${postId}`, JSON.stringify(updated))

    setEditId(null)
    setEditValue('')
  }

  /* ------------------------------------------
     댓글 삭제
  ------------------------------------------- */
  const deleteComment = (id: string) => {
    showConfirm('댓글을 삭제하시겠습니까?', () => {
      const updated = comments.filter((c) => c.id !== id && c.parent !== id)
      setComments(updated)

      localStorage.setItem(`comments_${postId}`, JSON.stringify(updated))
    })
  }

  /* ------------------------------------------
     게시글 삭제 (posts_all + board_xxx)
  ------------------------------------------- */
  const deletePost = () => {
    if (!storageKey || !post) return

    showConfirm('게시글을 삭제하시겠습니까?', () => {
      // 게시판 제거
      const list = JSON.parse(localStorage.getItem(storageKey) || '[]')
      const updated = list.filter((p: any) => p.id !== post.id)
      localStorage.setItem(storageKey, JSON.stringify(updated))

      // 전체 게시판 제거
      const all = JSON.parse(localStorage.getItem('posts_all') || '[]')
      const updatedAll = all.filter((p: any) => p.id !== post.id)
      localStorage.setItem('posts_all', JSON.stringify(updatedAll))

      showAlert('게시글이 삭제되었습니다.', () => {
        router.push(`/board`)
      })
    })
  }

  /* ------------------------------------------
     좋아요 (전체 + 게시판)
  ------------------------------------------- */
  const handleLike = () => {
    if (!username) return showAlert('로그인이 필요합니다.')
    if (!post || !storageKey) return

    const likeKey = `like_postIds_${username}`
    const liked = JSON.parse(localStorage.getItem(likeKey) || '[]')
    const already = liked.includes(postId)

    const newLikes = already ? post.likes - 1 : post.likes + 1

    // board_xxx 수정
    const boardList = JSON.parse(localStorage.getItem(storageKey) || '[]')
    const updatedBoard = boardList.map((p: any) =>
      p.id === post.id ? { ...p, likes: newLikes } : p
    )
    localStorage.setItem(storageKey, JSON.stringify(updatedBoard))

    // posts_all 수정
    const all = JSON.parse(localStorage.getItem('posts_all') || '[]')
    const updatedAll = all.map((p: any) =>
      p.id === post.id ? { ...p, likes: newLikes } : p
    )
    localStorage.setItem('posts_all', JSON.stringify(updatedAll))

    setPost({ ...post, likes: newLikes })

    const newLiked = already
      ? liked.filter((x: string) => x !== postId)
      : [...liked, postId]

    localStorage.setItem(likeKey, JSON.stringify(newLiked))
  }

  /* ------------------------------------------
     댓글 렌더링 함수
  ------------------------------------------- */
  const renderComments = (list: any[], depth = 0) => {
    return list.map((c) => {
      // 댓글 작성자 비교 (JSON이면 username만 추출)
      let writer = c.author
      if (typeof writer === 'string' && writer.includes('{')) {
        try {
          writer = JSON.parse(writer).username
        } catch {}
      }

      const isWriter = writer === username

      return (
        <div
          key={c.id}
          style={{
            marginLeft: depth * 20,
            background: '#F7FBFF',
            border: '1px solid #E0EEF8',
            padding: '14px',
            borderRadius: '10px',
            marginBottom: '12px',
            position: 'relative',
          }}
        >
          {/* 메뉴 버튼 */}
          <button
            style={menuBtn}
            onClick={() =>
              setOpenCommentMenu(openCommentMenu === c.id ? null : c.id)
            }
          >
            ⋮
          </button>

          {openCommentMenu === c.id && (
            <div style={menuBox}>
              <button style={menuItem} onClick={() => setReportOpen(true)}>
                🚩 신고하기
              </button>

              {isWriter && (
                <>
                  <button
                    style={menuItem}
                    onClick={() => {
                      setEditId(c.id)
                      setEditValue(c.content)
                    }}
                  >
                    ✏ 수정하기
                  </button>
                  <button
                    style={menuItemRed}
                    onClick={() => deleteComment(c.id)}
                  >
                    🗑 삭제하기
                  </button>
                </>
              )}
            </div>
          )}

          {editId === c.id ? (
            <div>
              <textarea
                style={textBox}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
              />
              <button style={btnBlue} onClick={saveEdit}>
                저장
              </button>
              <button style={btnGray} onClick={() => setEditId(null)}>
                취소
              </button>
            </div>
          ) : (
            <>
              <div style={{ fontWeight: 600 }}>{c.content}</div>
              <small style={{ color: '#666' }}>
                {writer} · {c.createdAt}
              </small>

              <button style={btnSmall} onClick={() => setReplyTarget(c.id)}>
                ↪ 답글
              </button>
            </>
          )}

          {replyTarget === c.id && (
            <div style={{ marginTop: '10px' }}>
              <textarea
                style={textBox}
                value={replyValue}
                onChange={(e) => setReplyValue(e.target.value)}
              />
              <button style={btnBlue} onClick={writeReply}>
                답글 작성
              </button>
              <button style={btnGray} onClick={() => setReplyTarget(null)}>
                취소
              </button>
            </div>
          )}

          {/* 자식 댓글 */}
          {renderComments(c.children, depth + 1)}
        </div>
      )
    })
  }

  if (!post)
    return <p style={{ padding: '20px' }}>게시글을 찾을 수 없습니다.</p>

  /* ------------------------------------------
     UI RETURN
  ------------------------------------------- */
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h3 style={{ color: '#4FC3F7', marginBottom: '12px' }}>
        {post.category === 'free'
          ? '📢 자유게시판'
          : post.category === 'promo'
          ? '📣 홍보게시판'
          : post.category === 'club'
          ? '🎭 동아리게시판'
          : `🎓 ${post.category.replace('grade', '')}학년 게시판`}
      </h3>

      {/* 게시글 카드 */}
      <div style={postCard}>
        <button onClick={() => setMenuOpen(!menuOpen)} style={menuBtn}>
          ⋮
        </button>

        {menuOpen && (
          <div style={menuBox}>
            {isAuthor && (
              <button
                style={menuItem}
                onClick={() => router.push(`/board/post/${postId}/edit`)}
              >
                ✏ 수정하기
              </button>
            )}

            <button style={menuItem} onClick={() => setReportOpen(true)}>
              🚩 신고하기
            </button>

            {isAuthor && (
              <button style={menuItemRed} onClick={deletePost}>
                🗑 삭제하기
              </button>
            )}
          </div>
        )}

        <div
          style={{
            padding: '10px 22px',
            fontSize: '14px',
            background: '#F0F8FF',
            borderRadius: '12px 12px 0 0',
          }}
        >
          <strong>{post.author}</strong> ·{' '}
          <span style={{ color: '#999' }}>
            {new Date(post.createdAt).toLocaleString()}
          </span>
        </div>

        <div style={{ padding: '20px', background: '#F0F8FF' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>{post.title}</h2>
        </div>

        {post.image && (
          <div style={{ padding: '16px 20px' }}>
            <img
              src={post.image}
              style={{
                maxWidth: '100%',
                borderRadius: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            />
          </div>
        )}

        <div style={postBody}>{post.content}</div>

        <div style={{ padding: '0 20px 20px' }}>
          <button style={btnBlue} onClick={handleLike}>
            💙 좋아요 {post.likes}
          </button>

          <button
            style={{
              padding: '8px 14px',
              background: scrapped ? '#FFB74D' : '#E0E0E0',
              borderRadius: '6px',
              marginLeft: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
            onClick={toggleScrap}
          >
            {scrapped ? '⭐ 스크랩됨' : '☆ 스크랩'}
          </button>
        </div>
      </div>

      {/* 댓글 */}
      <div style={commentCard}>
        <h3 style={{ marginBottom: '10px' }}>💬 댓글</h3>

        <textarea
          style={textBox}
          placeholder="댓글 입력..."
          value={commentValue}
          onChange={(e) => setCommentValue(e.target.value)}
        />

        <button style={btnBlue} onClick={writeComment}>
          댓글 작성
        </button>

        <hr style={{ margin: '20px 0' }} />

        {renderComments(commentTree)}
      </div>

      {/* 신고 모달 */}
      {reportOpen && (
        <div style={modalBg}>
          <div style={reportBox}>
            <h3
              style={{
                marginBottom: '12px',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              🚨 신고하기
            </h3>

            {/* 신고 유형 */}
            <select
              style={inputBox}
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="">신고 유형 선택</option>
              <option value="욕설/비방">욕설/비방</option>
              <option value="정치/사회 갈등">정치/사회 갈등</option>
              <option value="광고/홍보">광고/홍보</option>
              <option value="기타">기타</option>
            </select>

            {/* 기타 사유 입력 */}
            {reportType === '기타' && (
              <textarea
                style={reportTextArea}
                placeholder="신고 사유를 입력해주세요..."
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
              />
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '14px',
              }}
            >
              <button style={btnGray} onClick={() => setReportOpen(false)}>
                닫기
              </button>

              <button
                style={btnBlue}
                onClick={() => {
                  setReportOpen(false)
                  showAlert('신고가 접수되었습니다.')
                }}
              >
                제출
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 공통 모달 */}
      {modal.show && (
        <div style={modalBg}>
          <div style={modalBox}>
            <p>{modal.message}</p>

            <div
              style={{
                marginTop: '10px',
                display: 'flex',
                gap: '10px',
                justifyContent: 'center',
              }}
            >
              {modal.type === 'confirm' && (
                <button style={btnGray} onClick={modal.onCancel}>
                  취소
                </button>
              )}

              <button style={btnBlue} onClick={modal.onConfirm}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* -------------------- 스타일 -------------------- */

const postCard: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  marginBottom: '20px',
  position: 'relative',
}

const postBody: React.CSSProperties = {
  padding: '20px',
  lineHeight: '1.7',
  fontSize: '16px',
  whiteSpace: 'pre-wrap',
}

const menuBtn: React.CSSProperties = {
  position: 'absolute',
  top: '10px',
  right: '14px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: '22px',
}

const menuBox: React.CSSProperties = {
  position: 'absolute',
  top: '40px',
  right: '10px',
  background: 'white',
  border: '1px solid #ddd',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  padding: '6px 0',
  zIndex: 9999,
}

const menuItem: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  textAlign: 'left',
  background: 'white',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
}

const menuItemRed: React.CSSProperties = {
  ...menuItem,
  color: 'red',
}

const commentCard: React.CSSProperties = {
  background: 'white',
  padding: '25px',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
}

const textBox: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1.5px solid #cfd8dc',
  borderRadius: '10px',
  marginBottom: '14px',
  fontSize: '14px',
  boxSizing: 'border-box',
  background: '#ffffff',
  resize: 'none',
}

const btnBlue: React.CSSProperties = {
  background: '#4FC3F7',
  color: 'white',
  padding: '8px 14px',
  borderRadius: '6px',
  border: 'none',
  fontWeight: 600,
  cursor: 'pointer',
}

const btnGray: React.CSSProperties = {
  background: '#ddd',
  padding: '8px 14px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
}

const btnSmall: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#4FC3F7',
  fontSize: '12px',
  cursor: 'pointer',
  marginTop: '6px',
}

const modalBg: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
}

const modalBox: React.CSSProperties = {
  background: 'white',
  padding: '24px',
  borderRadius: '12px',
  width: '320px',
  textAlign: 'center',
}

const reportBox: React.CSSProperties = {
  background: '#ffffff',
  padding: '22px',
  borderRadius: '12px',
  width: '420px',
  maxWidth: '90%',
  textAlign: 'center',
  boxShadow: '0 4px 18px rgba(0,0,0,0.12)',
  border: '1.5px solid #E3EAF3',
}

const inputBox: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  marginBottom: '10px',
}

const reportTextArea: React.CSSProperties = {
  width: '100%',
  minHeight: '110px',
  padding: '12px',
  border: '1.5px solid #D0D7DF',
  borderRadius: '10px',
  fontSize: '14px',
  resize: 'vertical',
  outlineColor: '#4FC3F7',
  background: '#FAFCFF',
  marginTop: '10px',
  boxSizing: 'border-box',
}
