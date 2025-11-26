'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function MyPostsPage() {
  const [myPosts, setMyPosts] = useState<any[]>([])
  const [username, setUsername] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem('loggedInUser') || ''
    const cleaned = JSON.parse(localStorage.getItem('posts_all') || '[]')

    // 로그인 유저 파싱
    let user = ''
    try {
      const obj = JSON.parse(raw)
      user = obj.username || ''
    } catch {
      user = raw || ''
    }
    setUsername(user)

    // 내가 쓴 글만 필터
    const mine = cleaned.filter((p: any) => p.author === user)
    setMyPosts(mine)
  }, [])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <h2
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: '#4FC3F7',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        📝 내가 쓴 글
      </h2>

      {myPosts.length === 0 && (
        <p style={{ color: '#777', fontSize: 15 }}>작성한 게시글이 없습니다.</p>
      )}

      {myPosts.map((p) => (
        <Link
          key={p.id}
          href={`/board/post/${p.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div style={card}>
            <div style={header}>
              <span style={tag}>{categoryToName(p.category)}</span>
              <span style={likes}>💙 {p.likes}</span>
            </div>

            <h3 style={title}>{p.title}</h3>
            <p style={content}>{p.content}</p>

            <div style={footer}>
              <span>{p.author}</span>
              <span>{new Date(p.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

/* ---------- STYLE ---------- */

const card: React.CSSProperties = {
  background: '#ffffff',
  padding: '18px 22px',
  borderRadius: 14,
  border: '1px solid #E1F5FE',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  marginBottom: 16,
  transition: '0.2s',
}

const header: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 8,
}

const tag: React.CSSProperties = {
  padding: '4px 10px',
  background: '#4FC3F7',
  color: 'white',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
}

const likes: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#555',
}

const title: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  margin: '6px 0',
  color: '#333',
}

const content: React.CSSProperties = {
  fontSize: 14,
  color: '#666',
  marginBottom: 12,
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
}

const footer: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 12,
  color: '#888',
}

function categoryToName(c: string) {
  return c === 'free'
    ? '자유'
    : c === 'promo'
    ? '홍보'
    : c === 'club'
    ? '동아리'
    : `${c.replace('grade', '')}학년`
}
