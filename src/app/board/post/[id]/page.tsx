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
  const [username, setUsername] = useState<string>('')
  const [myName, setMyName] = useState<string>('') // 실명 저장

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

  /* 🔥 투표 관련 상태 */
  const [myVoteIndex, setMyVoteIndex] = useState<number | null>(null)
  const [totalVotes, setTotalVotes] = useState(0)

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

  /* ------------------------------------------
     게시글 + 댓글 로딩
  ------------------------------------------- */
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
      // 🔥 투표 구조 보정 (voters 없으면 빈배열)
      // 🔥 기존 투표 데이터 보존하도록 수정
      if (foundPost.vote?.enabled && Array.isArray(foundPost.vote.options)) {
        foundPost.vote.options = foundPost.vote.options.map((opt: any) => ({
          optionId: opt.optionId ?? crypto.randomUUID(), // key ID 보정
          text: opt.text,
          voters: Array.isArray(opt.voters) ? opt.voters : [],
          votes: typeof opt.votes === 'number' ? opt.votes : 0,
        }))
      }

      setPost(foundPost)
      setStorageKey(foundKey)
    }

    /* 로그인 유저 정보 로드 */
    try {
      const saved = localStorage.getItem('loggedInUser')
      const parsed = JSON.parse(saved || '{}')

      setUsername(parsed.username || '')
      setMyName(parsed.name || '') // 실명
    } catch {}

    /* 댓글 로드 */
    const rawComments = JSON.parse(
      localStorage.getItem(`comments_${postId}`) || '[]'
    )
    setComments(rawComments)
  }, [postId])

  /* 게시글 작성자 체크 */
  useEffect(() => {
    if (!post || !myName) return
    setIsAuthor(post.author === myName)
  }, [post, myName])

  /* 스크랩 여부 */
  useEffect(() => {
    if (!post || !username) return

    const key = `scrap_${username}`
    const saved = JSON.parse(localStorage.getItem(key) || '[]')
    setScrapped(saved.includes(postId))
  }, [post, username, postId])

  /* 🔥 투표 관련 계산 (총 투표수, 내 선택 옵션 인덱스) */
  useEffect(() => {
    if (!post || !post.vote?.enabled || !Array.isArray(post.vote.options)) {
      setTotalVotes(0)
      setMyVoteIndex(null)
      return
    }

    const options = post.vote.options
    const total = options.reduce(
      (sum: number, opt: any) => sum + (opt.votes || 0),
      0
    )
    setTotalVotes(total)

    if (username) {
      const idx = options.findIndex((opt: any) =>
        (opt.voters || []).includes(username)
      )
      setMyVoteIndex(idx >= 0 ? idx : null)
    } else {
      setMyVoteIndex(null)
    }
  }, [post, username])

  /* ------------------------------------------
     댓글 트리 생성
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
     댓글 작성 (실명)
  ------------------------------------------- */
  const writeComment = () => {
    if (!commentValue.trim()) return

    const newComment = {
      id: crypto.randomUUID(),
      content: commentValue,
      author: myName || '익명',
      createdAt: new Date().toLocaleString(),
      parent: null,
      likes: 0, // 👍 추가
      likedUsers: [], // 👍 추가
    }

    const updated = [...comments, newComment]
    setComments(updated)

    localStorage.setItem(`comments_${postId}`, JSON.stringify(updated))
    setCommentValue('')
  }

  /* ------------------------------------------
     대댓글 작성 (실명)
  ------------------------------------------- */
  const writeReply = () => {
    if (!replyValue.trim() || !replyTarget) return

    const newReply = {
      id: crypto.randomUUID(),
      content: replyValue,
      author: myName || '익명',
      createdAt: new Date().toLocaleString(),
      parent: replyTarget,
      likes: 0, // 👍 추가
      likedUsers: [], // 👍 추가
    }

    const updated = [...comments, newReply]
    setComments(updated)

    localStorage.setItem(`comments_${postId}`, JSON.stringify(updated))

    setReplyValue('')
    setReplyTarget(null)
  }

  /* 댓글 수정 */
  const saveEdit = () => {
    const updated = comments.map((c) =>
      c.id === editId ? { ...c, content: editValue } : c
    )

    setComments(updated)
    localStorage.setItem(`comments_${postId}`, JSON.stringify(updated))

    setEditId(null)
    setEditValue('')
  }

  /* 댓글 삭제 */
  const deleteComment = (id: string) => {
    showConfirm('댓글을 삭제하시겠습니까?', () => {
      const updated = comments.filter((c) => c.id !== id && c.parent !== id)
      setComments(updated)

      localStorage.setItem(`comments_${postId}`, JSON.stringify(updated))
    })
  }

  /* 게시글 삭제 */
  const deletePost = () => {
    if (!storageKey || !post) return

    showConfirm('게시글을 삭제하시겠습니까?', () => {
      const list = JSON.parse(localStorage.getItem(storageKey) || '[]')
      const updated = list.filter((p: any) => p.id !== post.id)
      localStorage.setItem(storageKey, JSON.stringify(updated))

      const all = JSON.parse(localStorage.getItem('posts_all') || '[]')
      const updatedAll = all.filter((p: any) => p.id !== post.id)
      localStorage.setItem('posts_all', JSON.stringify(updatedAll))

      showAlert('게시글이 삭제되었습니다.', () => {
        router.push(`/board`)
      })
    })
  }

  /* 게시글을 로컬스토리지에 동기화 (좋아요/투표 등 공용) */
  const updatePostInStorage = (updatedPost: any) => {
    if (!updatedPost || !updatedPost.id) return

    const sync = (key: string) => {
      const list = JSON.parse(localStorage.getItem(key) || '[]')

      const updatedList = list.map((p: any) => {
        if (p.id !== updatedPost.id) return p

        // 🔥 기존 options map을 optionId 기준으로 저장하기 위해 dictionary 생성
        const oldOptionsMap = (p.vote?.options || []).reduce(
          (acc: any, opt: any) => {
            acc[opt.optionId] = opt // 기존 voters data 보존
            return acc
          },
          {}
        )

        let mergedVote = p.vote

        // vote 업데이트가 포함되어있다면 병합 처리
        if (updatedPost.vote) {
          mergedVote = {
            ...p.vote,
            ...updatedPost.vote,
            options: updatedPost.vote.options
              ? updatedPost.vote.options.map((newOpt: any) => {
                  const oldOpt = oldOptionsMap[newOpt.optionId] || {}

                  return {
                    ...oldOpt, // 🔥 기존 voters 유지
                    ...newOpt, // 새 텍스트, 새 votes 반영
                    voters: Array.isArray(newOpt.voters)
                      ? newOpt.voters
                      : oldOpt.voters || [], // voters 보존
                    votes:
                      typeof newOpt.votes === 'number'
                        ? newOpt.votes
                        : oldOpt.votes || 0,
                  }
                })
              : p.vote.options,
          }
        }

        return {
          ...p,
          ...updatedPost,
          vote: mergedVote,
        }
      })

      localStorage.setItem(key, JSON.stringify(updatedList))
    }

    if (storageKey) sync(storageKey)
    sync('posts_all')
  }

  /* 좋아요 */
  const handleLike = () => {
    if (!username) return showAlert('로그인이 필요합니다.')
    if (!post || !storageKey) return

    const likeKey = `like_postIds_${username}`
    const liked = JSON.parse(localStorage.getItem(likeKey) || '[]')
    const already = liked.includes(postId)

    const newLikes = already ? post.likes - 1 : post.likes + 1

    const updatedPost = { ...post, likes: newLikes }
    setPost(updatedPost)
    updatePostInStorage(updatedPost)

    const newLiked = already
      ? liked.filter((x: string) => x !== postId)
      : [...liked, postId]

    localStorage.setItem(likeKey, JSON.stringify(newLiked))
  }

  /* ------------------------------------------
   스크랩 (북마크)
------------------------------------------- */
  const toggleScrap = () => {
    if (!username) return showAlert('로그인이 필요합니다.')

    const key = `scrap_${username}`
    const saved = JSON.parse(localStorage.getItem(key) || '[]')

    let updated: string[] = []

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

  const copyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    showAlert('링크가 복사되었습니다!')
  }

  /* 🔥 투표 클릭 처리 (투표 취소 + 재투표 지원) */
  const handleVote = (index: number) => {
    if (!post || !post.vote?.enabled || !Array.isArray(post.vote.options))
      return

    if (!username) {
      showAlert('투표는 로그인 후 이용 가능합니다.')
      return
    }

    const options = post.vote.options.map((opt: any) => {
      if (!Array.isArray(opt.voters)) {
        opt.voters = []
      }
      if (typeof opt.votes !== 'number') {
        opt.votes = 0
      }
      return opt
    })

    const myPrevIndex = myVoteIndex // 이전에 내가 투표했는지
    const clicked = index

    // -----------------------------
    // 1) ❌ 같은 항목을 다시 누르면: 투표 취소
    // -----------------------------
    if (myPrevIndex === clicked) {
      const prevOpt = options[myPrevIndex]
      prevOpt.votes = Math.max(0, prevOpt.votes - 1)
      prevOpt.voters = prevOpt.voters.filter((u: string) => u !== username)

      const updatedPost = {
        ...post,
        vote: {
          ...post.vote,
          options,
        },
      }

      setPost(updatedPost)
      updatePostInStorage(updatedPost)
      return
    }

    // -----------------------------
    // 2) 🔄 다른 항목을 누르면: 이전 투표 취소 후 새 항목 투표
    // -----------------------------
    if (myPrevIndex !== null) {
      // 기존 항목에서 제거
      const prevOpt = options[myPrevIndex]
      prevOpt.votes = Math.max(0, prevOpt.votes - 1)
      prevOpt.voters = prevOpt.voters.filter((u: string) => u !== username)
    }

    // 새 항목에 추가
    const newOpt = options[clicked]
    newOpt.votes += 1
    newOpt.voters.push(username)

    const updatedPost = {
      ...post,
      vote: {
        ...post.vote,
        options,
      },
    }

    setPost(updatedPost)
    updatePostInStorage(updatedPost)
  }

  /* 댓글 좋아요 */
  const toggleCommentLike = (commentId: string) => {
    if (!username) return showAlert('로그인이 필요합니다.')

    const updated = comments.map((c) => {
      if (c.id !== commentId) return c

      const already = c.likedUsers?.includes(username)

      const newLikes = already ? (c.likes || 0) - 1 : (c.likes || 0) + 1

      return {
        ...c,
        likes: newLikes,
        likedUsers: already
          ? c.likedUsers.filter((u: string) => u !== username)
          : [...(c.likedUsers || []), username],
      }
    })

    setComments(updated)
    localStorage.setItem(`comments_${postId}`, JSON.stringify(updated))
  }

  /* ------------------------------------------
     댓글 렌더링
  ------------------------------------------- */
  const renderComments = (list: any[], depth = 0) =>
    list.map((c) => {
      const writer = c.author
      const isWriter = writer === myName

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

              {/* 🔥 댓글 좋아요 */}
              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: c.likedUsers?.includes(username) ? '#E91E63' : '#888',
                  fontSize: '13px',
                  cursor: 'pointer',
                  marginTop: '6px',
                  marginRight: '8px',
                }}
                onClick={() => toggleCommentLike(c.id)}
              >
                💙 {c.likes || 0}
              </button>

              {/* 답글 버튼 */}
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

          {renderComments(c.children, depth + 1)}
        </div>
      )
    })

  /* ------------------------------------------ */

  if (!post)
    return <p style={{ padding: '20px' }}>게시글을 찾을 수 없습니다.</p>

  const created = new Date(post.createdAt)
  const dateStr = created.toLocaleString()

  /* 🔥 투표 마감 여부 */
  const isVoteEnded =
    post?.vote?.endAt && new Date() > new Date(post.vote.endAt)

  const hasVote =
    post.vote?.enabled &&
    Array.isArray(post.vote.options) &&
    post.vote.options.length > 0
  const alreadyVoted = myVoteIndex !== null

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

            {/* 🔗 링크 복사 */}
            <button
              style={menuItem}
              onClick={() => {
                copyLink()
                setMenuOpen(false) // 메뉴 닫기
              }}
            >
              🔗 게시물 공유
            </button>

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
          <span style={{ color: '#999' }}>{dateStr}</span>
        </div>

        <div style={{ padding: '20px', background: '#F0F8FF' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>{post.title}</h2>
        </div>

        {/* 이미지 (여러장 or 단일) */}
        {Array.isArray(post.images) && post.images.length > 0 && (
          <div
            style={{
              padding: '16px 20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: 12,
            }}
          >
            {post.images.map((src: string, i: number) => (
              <img
                key={i}
                src={src}
                style={{
                  width: '100%',
                  height: 140,
                  objectFit: 'cover',
                  borderRadius: 10,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              />
            ))}
          </div>
        )}

        {!post.images && post.image && (
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

        {/* 🔥 투표 영역 (좋아요 버튼 위에 위치) */}
        {hasVote && (
          <div style={voteCard}>
            <div style={voteHeader}>
              <span style={{ fontWeight: 700 }}>투표</span>

              {/* 🔥 마감 안내 */}
              <span style={{ fontSize: 13, color: '#607D8B' }}>
                총 {totalVotes}표{alreadyVoted && ' · 내가 참여함'}
                {post.vote.endAt && (
                  <>
                    {' · '}
                    {isVoteEnded ? (
                      <span style={{ color: '#D32F2F', fontWeight: 700 }}>
                        마감됨
                      </span>
                    ) : (
                      <>마감 {new Date(post.vote.endAt).toLocaleString()}</>
                    )}
                  </>
                )}
              </span>
            </div>

            <div
              style={{
                marginTop: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {post.vote.options.map((opt: any, idx: number) => {
                const votes = opt.votes || 0
                const percent =
                  totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
                const isMyChoice = myVoteIndex === idx

                return (
                  <button
                    key={idx}
                    onClick={() => !isVoteEnded && handleVote(idx)} // ⛔ 마감되면 클릭 막기
                    style={{
                      ...voteOptionRow,
                      borderColor: isMyChoice ? '#0288D1' : '#CFD8DC',
                      backgroundColor: isMyChoice ? '#E1F5FE' : '#FFFFFF',
                      cursor: isVoteEnded ? 'not-allowed' : 'pointer',
                      opacity: isVoteEnded ? 0.6 : 1, // ⛔ 흐리게 처리
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={voteOptionTop}>
                        <span style={{ fontWeight: 600 }}>{opt.text}</span>
                        <span style={{ fontSize: 13, color: '#546E7A' }}>
                          {votes}표 · {percent}%
                        </span>
                      </div>

                      <div style={voteBarTrack}>
                        <div
                          style={{
                            ...voteBarFill,
                            width: `${percent}%`,
                            opacity: percent === 0 ? 0.15 : 0.9,
                            background: isMyChoice
                              ? 'linear-gradient(90deg, #4FC3F7, #0288D1)'
                              : '#B0BEC5',
                          }}
                        />
                      </div>
                    </div>

                    {isMyChoice && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#0288D1',
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: '#E1F5FE',
                          marginLeft: 8,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        내 선택
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* 안내 문구 */}
            <p style={{ marginTop: 8, fontSize: 12, color: '#78909C' }}>
              {isVoteEnded
                ? '⛔ 투표가 마감되었습니다.'
                : '투표는 1회만 가능하며, 선택한 항목을 다시 누르면 취소됩니다.'}
            </p>
          </div>
        )}

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

/* 🔥 투표 스타일 */
const voteCard: React.CSSProperties = {
  margin: '0 20px 16px',
  padding: '16px 14px 12px',
  borderRadius: 14,
  background: '#F5FAFF',
  border: '1px solid #BBDEFB',
}

const voteHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const voteOptionRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '10px 10px',
  borderRadius: 12,
  border: '1px solid #CFD8DC',
  background: '#FFFFFF',
  gap: 8,
  transition: '0.2s',
}

const voteOptionTop: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 6,
}

const voteBarTrack: React.CSSProperties = {
  width: '100%',
  height: 8,
  borderRadius: 999,
  background: '#ECEFF1',
  overflow: 'hidden',
}

const voteBarFill: React.CSSProperties = {
  height: '100%',
  borderRadius: 999,
  transition: 'width 0.25s ease',
}
