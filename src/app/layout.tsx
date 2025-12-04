'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [userSchool, setUserSchool] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true)
  const [isPC, setIsPC] = useState<boolean>(true)

  // ⭐ 모달 상태
  const [modal, setModal] = useState({
    show: false,
    message: '',
    type: 'alert',
    onConfirm: () => {},
    onCancel: () => {},
  })

  // 🔥 게시판 드롭다운
  const [dropOpen, setDropOpen] = useState(false)

  // ⭐ 로그인 정보 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('loggedInUser')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setUser(parsed) // ★ 객체 저장
      } catch {
        setUser(null)
      }
    }

    const school = localStorage.getItem('userSchool')
    setUserSchool(school)

    const check = () => {
      const wide = window.innerWidth >= 800
      setIsPC(wide)
      setSidebarOpen(wide)
    }

    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ⭐ alert 모달
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

  // ⭐ confirm 모달
  const showConfirm = (msg: string, yesFn: () => void) => {
    setModal({
      show: true,
      message: msg,
      type: 'confirm',
      onConfirm: () => {
        setModal((m) => ({ ...m, show: false }))
        yesFn()
      },
      onCancel: () =>
        setModal((m) => ({
          ...m,
          show: false,
        })),
    })
  }

  // ⭐ 로그아웃
  const handleLogout = () => {
    showConfirm('정말 로그아웃 하시겠습니까?', () => {
      localStorage.removeItem('loggedInUser')
      setUser(null)

      showAlert('로그아웃 되었습니다.', () => {
        window.location.href = '/'
      })
    })
  }

  return (
    <html lang="ko">
      <head>
        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Google Icons */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:FILL@0;1&display=swap"
          rel="stylesheet"
        />

        <style>{`
        .material-symbols-rounded {
          font-family: 'Material Symbols Rounded';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          display: inline-block;
          line-height: 1;
          white-space: nowrap;
        }
      `}</style>
      </head>
      <body
        style={{
          margin: 0,
          background: '#f2f4f7',
          fontFamily: 'Pretendard, sans-serif',
        }}
      >
        {/* 모바일 햄버거 버튼 */}
        {!isPC && (
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              position: 'fixed',
              top: '14px',
              left: '14px',
              zIndex: 999,
              padding: '10px 14px',
              background: '#4DB8FF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              cursor: 'pointer',
            }}
          >
            ☰
          </button>
        )}

        {/* 사이드바 */}
        <aside
          style={{
            position: 'fixed',
            top: 0,
            left: sidebarOpen ? 0 : isPC ? 0 : '-260px',
            width: isPC ? '220px' : '240px',
            height: '100vh',
            background: '#4DB8FF',
            padding: '20px 14px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            transition: 'left 0.3s ease',
            zIndex: 998,

            /* ⭐ 모바일 스크롤 활성화 */
            overflowY: 'auto',
            overflowX: 'hidden',

            /* ⭐ iOS 부드러운 스크롤 */
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
          }}
        >
          {/* 모바일 X */}
          {!isPC && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'rgba(0,0,0,0.25)',
                color: 'white',
                border: 'none',
                padding: '8px',
                borderRadius: '6px',
                cursor: 'pointer',
                alignSelf: 'flex-end',
              }}
            >
              ✕
            </button>
          )}

          {/* ⭐ 로고(학교 이름 표시 부분) */}
          <Link
            href="/"
            style={{
              fontSize: '20px',
              fontWeight: 700,
              marginBottom: '18px',
              color: 'white',
              textDecoration: 'none',
            }}
          >
            {userSchool ? `🏫 ${userSchool}` : 'School Community'}
          </Link>

          {/* 🔹 여기만 아이콘 변경 (📅 → 👤) */}
          <MenuItem icon="👤" label="내정보" href="/my-info" />

          {/* 게시판 */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => isPC && setDropOpen(true)}
            onMouseLeave={() => isPC && setDropOpen(false)}
            onClick={() => {
              if (!isPC) setDropOpen((prev) => !prev); // ⭐ 모바일에서는 클릭으로 열기/닫기
            }}
          >
            <MenuItem icon="📋" label="게시판" href="/board" />

            {dropOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '48px',
                  left: '0',
                  width: '180px',
                  background: 'white',
                  borderRadius: '10px',
                  padding: '10px 0',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 9999,
                  animation: 'fadein 0.2s',
                }}
              >
                {dropdownItem('/board', '📚 전체 게시판')}
                {dropdownItem('/board/myposts', '✏ 내가 쓴 글')}
                {dropdownItem('/board/scrap', '⭐ 스크랩한 글')}
              </div>
            )}
          </div>

          <MenuItem icon="📅" label="일정" href="/calendar" />
          <MenuItem icon="⏰" label="시간표" href="/timetable" />
          <MenuItem icon="📊" label="모의고사" href="/scores" />
          <MenuItem icon="🏫" label="학교인증" href="/school_certification" />
          <MenuItem icon="🍚" label="급식표" href="/meal" />
          <MenuItem icon="📚" label="도서관" href="/Library" />

          {/* 로그인/로그아웃 */}
          <div style={{ marginTop: 'auto' }}>
            {user ? (
              <>
                <div
                  style={{
                    color: 'white',
                    marginBottom: '10px',
                    fontWeight: 600,
                  }}
                >
                  👋 {user.name || user.username} 님
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#FF6B6B',
                    color: 'white',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <MenuItem icon="🔐" label="로그인" href="/auth/login" />
            )}
          </div>
        </aside>

        {/* 모바일 오버레이 */}
        {!isPC && sidebarOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.4)',
              zIndex: 997,
            }}
          />
        )}

        {/* 메인 */}
        <main
          className="min-h-screen"
          style={{
            marginLeft: isPC ? '220px' : '0px',
          }}
        >
          {children}
        </main>

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
                  <button className="modal-cancel" onClick={modal.onCancel}>
                    취소
                  </button>
                )}

                <button className="modal-confirm" onClick={modal.onConfirm}>
                  확인
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 모달 CSS */}
        <style jsx>{`
          .modal-backdrop {
            position: fixed;
            inset: 0;
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
            margin-bottom: 8px;
          }
          .modal-confirm {
            padding: 8px 14px;
            background: #4fc3f7;
            color: white;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-weight: 600;
          }
          .modal-cancel {
            padding: 8px 14px;
            background: #ddd;
            border-radius: 6px;
            border: none;
            cursor: pointer;
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
      </body>
    </html>
  )
}

/* 드롭다운 항목 */
function dropdownItem(href: string, label: string) {
  return (
    <Link
      href={href}
      style={{
        padding: '10px 16px',
        fontSize: '14px',
        color: '#333',
        textDecoration: 'none',
        cursor: 'pointer',
      }}
    >
      {label}
    </Link>
  )
}

/* 메뉴 아이템 */
function MenuItem({
  icon,
  label,
  href,
}: {
  icon: string
  label: string
  href: string
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 12px',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.25)',
        color: 'white',
        textDecoration: 'none',
        fontSize: '15px',
        fontWeight: 600,
        border: '1px solid rgba(255,255,255,0.4)',
      }}
    >
      <span style={{ fontSize: '18px' }}>{icon}</span>
      {label}
    </Link>
  )
}
