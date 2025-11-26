'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface BoardSection {
  key: string
  title: string
  icon: string // 필수
  posts: any[]
}

export default function BoardMainPage() {
  const [sections, setSections] = useState<BoardSection[]>([])

  useEffect(() => {
    // 🔹 여기서 icon까지 같이 정의해주기
    const boards: Omit<BoardSection, 'posts'>[] = [
      { key: 'free', title: '자유게시판', icon: '' },
      { key: 'promo', title: '홍보게시판', icon: '' },
      { key: 'club', title: '동아리게시판', icon: '' },
      { key: 'grade1', title: '1학년게시판', icon: '' },
      { key: 'grade2', title: '2학년게시판', icon: '' },
      { key: 'grade3', title: '3학년게시판', icon: '' },
    ]

    const loaded: BoardSection[] = boards.map((b) => {
      const saved = localStorage.getItem('board_' + b.key)
      return {
        ...b,
        posts: saved ? JSON.parse(saved) : [],
      }
    })

    setSections(loaded)
  }, [])

  return (
    <div style={wrap}>
      <h1 style={title}>📚 게시판 메인</h1>

      <div style={grid}>
        {sections.map((s) => (
          <Link key={s.key} href={`/board/${s.key}`} style={card}>
            <div style={cardInner}>
              <div style={cardIcon}>{s.icon}</div>

              <h3 style={cardTitle}>{s.title}</h3>

              <p style={cardDesc}>
                {s.posts.length > 0
                  ? `${s.posts.length}개의 게시글`
                  : '게시글 없음'}
              </p>

              {s.posts.slice(0, 2).map((p, idx) => (
                <p key={idx} style={miniPost}>
                  • {p.title}
                </p>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ===================== Style ===================== */

const wrap: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px',
}

const title: React.CSSProperties = {
  fontSize: '26px',
  fontWeight: 800,
  color: '#222',
  marginBottom: '26px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
  gap: '24px',
}

const card: React.CSSProperties = {
  textDecoration: 'none',
  color: 'inherit',
}

const cardInner: React.CSSProperties = {
  background: 'white',
  padding: '24px',
  borderRadius: '16px',
  boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
  border: '1px solid #eef1f5',
  transition: '0.25s',
  cursor: 'pointer',
}

;(cardInner as any)[':hover'] = {
  transform: 'translateY(-4px)',
  boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
}

const cardIcon: React.CSSProperties = {
  fontSize: '32px',
  marginBottom: '10px',
}

const cardTitle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '6px',
}

const cardDesc: React.CSSProperties = {
  fontSize: '14px',
  color: '#777',
  marginBottom: '12px',
}

const miniPost: React.CSSProperties = {
  fontSize: '14px',
  color: '#4a4a4a',
  background: '#f9fbff',
  padding: '6px 10px',
  borderRadius: '6px',
  marginTop: '4px',
}
