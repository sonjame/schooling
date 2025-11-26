'use client'

import { useEffect, useState } from 'react'
import TimetablePreview from '../components/Dashboard/TimetablePreview'
import Link from 'next/link'

interface Post {
  id: string
  author: string
  title: string
  content: string
  likes: number
  category: string
  createdAt: number
}

interface HomeCalendarItem {
  dateLabel: string
  event: string
  ddayLabel: string
  diffDays: number
  weekdayIndex: number
  weekdayLabel: string
}

export default function HomePage() {
  const [user, setUser] = useState<string | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [today, setToday] = useState<string>('')
  const [calendar, setCalendar] = useState<HomeCalendarItem[]>([])

  useEffect(() => {
    // 로그인 유저
    setUser(localStorage.getItem('loggedInUser') || null)

    /* ==========================================
       🔥 A 방식: 모든 게시판 데이터 합치기
    ========================================== */
    const boardKeys = [
      'board_free',
      'board_promo',
      'board_club',
      'board_grade1',
      'board_grade2',
      'board_grade3',
    ]

    let allPosts: Post[] = []

    boardKeys.forEach((key) => {
      const list = JSON.parse(localStorage.getItem(key) || '[]')
      allPosts = [...allPosts, ...list]
    })

    // 최신순 정렬
    allPosts.sort((a, b) => b.createdAt - a.createdAt)

    setPosts(allPosts)

    /* ==========================================
       📆 오늘 요일
    ========================================== */
    const dayNames = ['일', '월', '화', '수', '목', '금', '토']
    const now = new Date()
    setToday(`${dayNames[now.getDay()]}요일`)

    /* ==========================================
       📅 홈 캘린더 일정 불러오기
    ========================================== */
    try {
      const raw = localStorage.getItem('calendarEvents')
      if (!raw) {
        setCalendar([])
        return
      }

      type CalendarEvent = { date: string; title: string }
      const events: CalendarEvent[] = JSON.parse(raw) || []

      const todayDate = new Date()
      const todayZero = new Date(
        todayDate.getFullYear(),
        todayDate.getMonth(),
        todayDate.getDate()
      ).getTime()

      const upcoming: HomeCalendarItem[] = []
      const dayNames2 = ['일', '월', '화', '수', '목', '금', '토']

      for (const ev of events) {
        if (!ev.date) continue
        const [y, m, d] = ev.date.split('-').map(Number)
        if (!y || !m || !d) continue

        const dateObj = new Date(y, m - 1, d)
        const diffMs = dateObj.getTime() - todayZero
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays < 0 || diffDays > 7) continue

        const weekdayIndex = dateObj.getDay()
        const weekdayLabel = dayNames2[weekdayIndex]

        upcoming.push({
          dateLabel: `${m}월 ${d}일 (${weekdayLabel})`,
          event: ev.title,
          ddayLabel: diffDays === 0 ? 'D-Day' : `D-${diffDays}`,
          diffDays,
          weekdayIndex,
          weekdayLabel,
        })
      }

      upcoming.sort((a, b) => a.diffDays - b.diffDays)

      setCalendar(upcoming)
    } catch (e) {
      console.warn('홈 화면 일정 로드 오류:', e)
      setCalendar([])
    }
  }, [])

  /* ==========================================
     🔥 인기 게시물 3개
  ========================================== */
  const popularPosts = [...posts]
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 3)

  /* ==========================================
     📆 오늘 & 이번주 일정 분리
  ========================================== */
  const todayItems = calendar.filter((c) => c.diffDays === 0)
  const weekItems = calendar.filter((c) => c.diffDays > 0)

  const weekdayOrder = [1, 2, 3, 4, 5, 6, 0]
  const weekdayLabels: Record<number, string> = {
    0: '일',
    1: '월',
    2: '화',
    3: '수',
    4: '목',
    5: '금',
    6: '토',
  }

  const weekByWeekday: Record<number, HomeCalendarItem[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  }

  weekItems.forEach((item) => {
    weekByWeekday[item.weekdayIndex].push(item)
  })

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: 'clamp(10px, 3vw, 20px)',
        backgroundColor: '#fff',
        borderRadius: '14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      }}
    >
      {/* ------------------ 상단 ------------------ */}
      <h2
        style={{
          fontSize: 'clamp(20px, 4vw, 28px)',
          fontWeight: 700,
          color: '#4FC3F7',
          marginBottom: '8px',
          textAlign: 'center',
        }}
      >
        💙 학교 커뮤니티 메인
      </h2>

      <p
        style={{
          color: '#666',
          marginBottom: '28px',
          fontSize: 'clamp(13px, 2.5vw, 16px)',
          textAlign: 'center',
        }}
      >
        학생 생활을 한눈에 확인하세요 📚
      </p>

      {/* ------------------ 오늘 일정 ------------------ */}
      <section style={{ marginBottom: '26px' }}>
        <h3
          style={{
            fontSize: 'clamp(16px, 3vw, 20px)',
            fontWeight: 700,
            color: '#4FC3F7',
            borderBottom: '2px solid #4FC3F7',
            paddingBottom: '6px',
            marginBottom: '14px',
          }}
        >
          📆 오늘 일정
        </h3>

        {todayItems.length === 0 ? (
          <p style={{ color: '#888', fontSize: '14px' }}>
            오늘은 등록된 일정이 없습니다.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: '12px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            }}
          >
            {todayItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#E1F5FE',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  fontSize: 'clamp(13px, 2.2vw, 15px)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}
                >
                  <strong style={{ color: '#0277BD' }}>{item.dateLabel}</strong>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#c62828',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: '#ffebee',
                    }}
                  >
                    {item.ddayLabel}
                  </span>
                </div>
                <p style={{ marginTop: '2px', color: '#555' }}>{item.event}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ------------------ 이번 주 일정 ------------------ */}
      <section style={{ marginBottom: '36px' }}>
        <h3
          style={{
            fontSize: 'clamp(16px, 3vw, 20px)',
            fontWeight: 700,
            color: '#4FC3F7',
            borderBottom: '2px solid #4FC3F7',
            paddingBottom: '6px',
            marginBottom: '14px',
          }}
        >
          📅 이번 주 일정
        </h3>

        {weekItems.length === 0 ? (
          <p style={{ color: '#888', fontSize: '14px' }}>
            7일 이내에 등록된 일정이 없습니다.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
              gap: '10px',
            }}
          >
            {weekdayOrder.map((wIdx) => {
              const list = weekByWeekday[wIdx]
              return (
                <div
                  key={wIdx}
                  style={{
                    background: '#F5FBFF',
                    borderRadius: '14px',
                    padding: '10px 10px 12px',
                    minHeight: '135px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '13px',
                      color:
                        wIdx === 0
                          ? '#E53935'
                          : wIdx === 6
                          ? '#1E88E5'
                          : '#0277BD',
                      marginBottom: '4px',
                      borderBottom: '1px solid #BBDEFB',
                      paddingBottom: '3px',
                    }}
                  >
                    {weekdayLabels[wIdx]}
                  </div>

                  {list.length === 0 ? (
                    <span
                      style={{
                        fontSize: '11px',
                        color: '#999',
                        textAlign: 'center',
                        marginTop: '4px',
                      }}
                    >
                      일정 없음
                    </span>
                  ) : (
                    list.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: '#E1F5FE',
                          borderRadius: '10px',
                          padding: '6px 8px',
                          fontSize: '12px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 3,
                          }}
                        >
                          <span
                            style={{
                              color: '#0277BD',
                              fontWeight: 600,
                              fontSize: '12px',
                            }}
                          >
                            {item.dateLabel.split('(')[0]}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#c62828',
                              padding: '2px 7px',
                              borderRadius: '999px',
                              background: '#ffebee',
                            }}
                          >
                            {item.ddayLabel}
                          </span>
                        </div>
                        <div
                          style={{
                            marginTop: '1px',
                            color: '#555',
                            wordBreak: 'keep-all',
                          }}
                        >
                          {item.event}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ------------------ 오늘 시간표 ------------------ */}
      <section style={{ marginBottom: '36px' }}>
        <h3
          style={{
            fontSize: 'clamp(16px, 3vw, 20px)',
            fontWeight: 700,
            color: '#4FC3F7',
            borderBottom: '2px solid #4FC3F7',
            paddingBottom: '6px',
            marginBottom: '14px',
          }}
        >
          📚 오늘의 시간표 ({today})
        </h3>

        <TodayTimetable today={today} />
      </section>

      {/* ------------------ 주간 시간표 ------------------ */}
      <TimetablePreview />

      {/* ------------------ 인기 게시물 ------------------ */}
      <section style={{ marginTop: '36px' }}>
        <h3
          style={{
            fontSize: 'clamp(16px, 3vw, 20px)',
            fontWeight: 700,
            color: '#4FC3F7',
            borderBottom: '2px solid #4FC3F7',
            paddingBottom: '6px',
            marginBottom: '14px',
          }}
        >
          🔥 인기 게시물
        </h3>

        {popularPosts.length === 0 ? (
          <p style={{ color: '#888' }}>아직 게시글이 없습니다.</p>
        ) : (
          popularPosts.map((p) => {
            const categoryNames: Record<string, string> = {
              free: '자유',
              promo: '홍보',
              club: '동아리',
              grade1: '1학년',
              grade2: '2학년',
              grade3: '3학년',
            }

            return (
              <Link
                href={`/board/post/${p.id}`}
                key={p.id}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid #E1F5FE',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '14px',
                    transition: '0.2s',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = '#E1F5FE')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'white')
                  }
                >
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      backgroundColor: '#4FC3F7',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: 'clamp(11px, 2vw, 13px)',
                      fontWeight: 600,
                      marginBottom: '8px',
                    }}
                  >
                    {categoryNames[p.category || ''] || '기타'}
                  </span>

                  <h4
                    style={{
                      fontSize: 'clamp(14px, 3vw, 17px)',
                      fontWeight: 600,
                      color: '#333',
                      marginBottom: '4px',
                    }}
                  >
                    {p.title}
                  </h4>

                  <p
                    style={{
                      fontSize: 'clamp(12px, 2.3vw, 14px)',
                      color: '#555',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      whiteSpace: 'normal',
                    }}
                  >
                    {p.content}
                  </p>

                  <div
                    style={{
                      fontSize: 'clamp(11px, 2vw, 13px)',
                      color: '#777',
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '8px',
                    }}
                  >
                    <span>작성자: {p.author}</span>
                    <span>💙 {p.likes || 0}</span>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </section>
    </div>
  )
}

/* ======================================================
   📘 TodayTimetable (오늘 시간표)
====================================================== */
function TodayTimetable({ today }: { today: string }) {
  const [todayList, setTodayList] = useState<any[] | null>(null)

  const subjectColors: Record<string, string> = {
    국어: '#FFCDD2',
    수학: '#BBDEFB',
    영어: '#C8E6C9',
    과학: '#D1C4E9',
    사회: '#FFE0B2',
    체육: '#B3E5FC',
    음악: '#F8BBD0',
    미술: '#DCEDC8',
    자율: '#FFF9C4',
    default: '#F5F5F5',
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem('timetable')
      if (!saved) return setTodayList([])

      const all = JSON.parse(saved)
      if (!Array.isArray(all)) return setTodayList([])

      const short = today.replace('요일', '')

      const todayData = all
        .filter((c: any) => c && c.day === short && c.subject?.trim())
        .sort((a: any, b: any) => a.period - b.period)

      setTodayList(todayData)
    } catch {
      setTodayList([])
    }
  }, [today])

  if (!todayList || todayList.length === 0) {
    return (
      <p
        style={{
          color: '#777',
          background: '#E1F5FE',
          padding: 'clamp(12px, 3vw, 16px)',
          borderRadius: '12px',
          fontSize: 'clamp(12px, 3vw, 15px)',
        }}
      >
        오늘은 등록된 수업이 없습니다.
      </p>
    )
  }

  return (
    <div
      style={{
        backgroundColor: '#F3F9FF',
        borderRadius: '14px',
        padding: 'clamp(12px, 3vw, 20px)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 'clamp(10px, 2vw, 16px)',
      }}
    >
      {todayList.map((c, i) => {
        const colorKey =
          Object.keys(subjectColors).find((k) => c.subject.includes(k)) ||
          'default'

        return (
          <div
            key={i}
            style={{
              backgroundColor: subjectColors[colorKey],
              borderRadius: '12px',
              padding: 'clamp(12px, 3vw, 16px)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 'clamp(13px, 3vw, 16px)',
                marginBottom: '4px',
              }}
            >
              {c.period}교시
            </div>

            <div
              style={{
                fontSize: 'clamp(14px, 3vw, 17px)',
                fontWeight: 600,
                color: '#111',
              }}
            >
              {c.subject}
            </div>

            <div
              style={{
                fontSize: 'clamp(12px, 2.2vw, 14px)',
                marginTop: '4px',
              }}
            >
              👨‍🏫 {c.teacher || '미입력'}
            </div>

            <div
              style={{
                fontSize: 'clamp(12px, 2.2vw, 14px)',
                marginTop: '2px',
              }}
            >
              🏫 {c.room || '교실 미지정'}
            </div>
          </div>
        )
      })}
    </div>
  )
}
