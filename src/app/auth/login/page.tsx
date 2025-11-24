'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [users, setUsers] = useState<any[]>([])

  // ⭐ 모달 상태
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]')
    setUsers(savedUsers)
  }, [])

  const inputWrapper: React.CSSProperties = {
    width: '100%',
    position: 'relative',
    marginBottom: '16px',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1.5px solid #ccc',
    fontSize: '15px',
    outlineColor: '#4FC3F7',
    boxSizing: 'border-box',
  }

  // ⭐ 알림 모달
  const showAlert = (msg: string, callback?: () => void) => {
    setModalMessage(msg)
    setShowModal(true)
    setTimeout(() => {
      setShowModal(false)
      if (callback) callback()
    }, 1500)
  }

  const login = () => {
    const found = users.find(
      (u) => u.username === username && u.password === password
    )

    if (!found) {
      showAlert('아이디 또는 비밀번호가 올바르지 않습니다.')
      return
    }

    // ⭐ user 전체 데이터 저장하도록 수정
    localStorage.setItem('loggedInUser', JSON.stringify(found))

    showAlert('로그인 성공!', () => {
      window.location.href = '/'
    })
  }

  return (
    <>
      <div
        style={{
          minHeight: '100vh',
          background: '#E3F2FD',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            width: '420px',
            background: 'white',
            borderRadius: '16px',
            padding: '40px 30px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#4FC3F7',
              textAlign: 'center',
              marginBottom: '10px',
            }}
          >
            🔐 로그인
          </h2>

          <p
            style={{ textAlign: 'center', marginBottom: '25px', color: '#666' }}
          >
            학교 커뮤니티에 오신 것을 환영합니다!
          </p>

          <div style={inputWrapper}>
            <input
              type="text"
              placeholder="아이디를 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={inputWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: '48px' }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#4FC3F7',
                fontSize: '16px',
              }}
            >
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>

          <button
            onClick={login}
            style={{
              width: '100%',
              background: '#4FC3F7',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '10px',
            }}
          >
            로그인
          </button>

          <p
            style={{
              textAlign: 'center',
              marginTop: '20px',
              fontSize: '14px',
            }}
          >
            계정이 없으신가요?{' '}
            <Link
              href="/auth/signup"
              style={{ color: '#4FC3F7', fontWeight: 600 }}
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>

      {/* ⭐ 모달 UI */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-icon">✔</div>
            <p>{modalMessage}</p>
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
      `}</style>
    </>
  )
}
