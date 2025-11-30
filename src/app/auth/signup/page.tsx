'use client'

const API_KEY = '32cbd596f1b64e7abc94e1eb85ca5a06'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')

  const [school, setSchool] = useState('')
  const [schoolCode, setSchoolCode] = useState('')
  const [eduCode, setEduCode] = useState('')
  const [level, setLevel] = useState('')

  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const [grade, setGrade] = useState('1학년')
  const [showPassword, setShowPassword] = useState(false)
  const [users, setUsers] = useState<any[]>([])

  // 학년 확인 모달
  const [showConfirm, setShowConfirm] = useState(false)

  // ⭐ 새로운 블루 모달 (alert 대체)
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')

  // 기존 유저 불러오기
  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]')
    setUsers(savedUsers)
  }, [])

  // ⭐ 통합 모달 함수
  const showAlert = (msg: string) => {
    setModalMessage(msg)
    setShowModal(true)
    setTimeout(() => setShowModal(false), 1500)
  }

  // 학교 검색
  const searchSchool = async (keyword: string) => {
    setSchool(keyword)
    setIsSearching(true)

    if (keyword.trim().length < 2) {
      setSearchResults([])
      return
    }

    try {
      const url = `https://open.neis.go.kr/hub/schoolInfo?KEY=${API_KEY}&Type=json&pIndex=1&pSize=20&SCHUL_NM=${encodeURIComponent(
        keyword
      )}`
      const res = await fetch(url)
      const data = await res.json()

      if (data.schoolInfo && data.schoolInfo[1]?.row) {
        setSearchResults(data.schoolInfo[1].row)
      } else {
        setSearchResults([])
      }
    } catch (err) {
      console.error(err)
    }
  }

  // 학교 선택
  const selectSchool = (item: any) => {
    setSchool(item.SCHUL_NM)
    setSchoolCode(item.SD_SCHUL_CODE)
    setEduCode(item.ATPT_OFCDC_SC_CODE)
    setLevel(item.SCHUL_KND_SC_NM)

    setSearchResults([])
    setIsSearching(false)
  }

  // 최종 회원가입 제출
  const handleFinalSubmit = () => {
    const exists = users.find((u) => u.username === username)

    if (exists) {
      showAlert('이미 존재하는 아이디입니다.')
      return
    }

    const newUser = {
      username,
      password,
      school,
      schoolCode,
      eduCode,
      level,
      grade,
      verified_student: false,
    }

    const updated = [...users, newUser]

    localStorage.setItem('users', JSON.stringify(updated))

    showAlert('회원가입 완료! 로그인해주세요.')

    setTimeout(() => {
      window.location.href = '/auth/login'
    }, 1500)
  }

  // 회원가입 → 중간 체크 모달
  const handleSubmit = () => {
    if (!username || !password || !password2 || !school) {
      showAlert('모든 정보를 입력해주세요.')
      return
    }

    if (password !== password2) {
      showAlert('비밀번호가 일치하지 않습니다.')
      return
    }

    setShowConfirm(true)
  }

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
            📝 회원가입
          </h2>

          {/* 아이디 */}
          <div style={inputWrapper}>
            <input
              style={inputStyle}
              type="text"
              placeholder="아이디를 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* 비밀번호 */}
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

          {/* 비밀번호 확인 */}
          <div style={inputWrapper}>
            <input
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* 학교 검색 자동완성 */}
          <div style={inputWrapper}>
            <input
              type="text"
              placeholder="학교명을 입력하세요 (자동완성)"
              value={school}
              onChange={(e) => searchSchool(e.target.value)}
              style={inputStyle}
            />

            {isSearching && searchResults.length > 0 && (
              <ul
                style={{
                  position: 'absolute',
                  top: '50px',
                  left: 0,
                  width: '100%',
                  background: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  zIndex: 100,
                  padding: 0,
                  margin: 0,
                  listStyle: 'none',
                }}
              >
                {searchResults.map((item) => (
                  <li
                    key={item.SD_SCHUL_CODE}
                    onClick={() => selectSchool(item)}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee',
                      fontSize: '14px',
                    }}
                  >
                    <strong>{item.SCHUL_NM}</strong>
                    <span style={{ color: '#777', marginLeft: '6px' }}>
                      ({item.LCTN_SC_NM})
                    </span>
                    <span style={{ color: '#4FC3F7', marginLeft: '6px' }}>
                      / {item.SCHUL_KND_SC_NM}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 학년 */}
          <select
            style={{ ...inputStyle, marginBottom: '6px' }}
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          >
            <option>1학년</option>
            <option>2학년</option>
            <option>3학년</option>
          </select>

          <p
            style={{ marginBottom: '20px', fontSize: '13px', color: '#d32f2f' }}
          >
            ⚠️ 한번 선택한 학년은 변경할 수 없습니다.
            <br /> 다시 한번 확인해주세요.
          </p>

          {/* 회원가입 버튼 */}
          <button
            onClick={handleSubmit}
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
            회원가입 완료
          </button>

          <p
            style={{
              textAlign: 'center',
              marginTop: '20px',
              fontSize: '14px',
            }}
          >
            이미 계정이 있으신가요?{' '}
            <Link
              href="/auth/login"
              style={{ color: '#4FC3F7', fontWeight: 600 }}
            >
              로그인
            </Link>
          </p>
        </div>

        {/* 학년 확인 모달 */}
        {showConfirm && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.4)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 999,
            }}
          >
            <div
              style={{
                width: '340px',
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              <h3 style={{ marginBottom: '10px', color: '#333' }}>학년 확인</h3>
              <p style={{ fontSize: '14px', color: '#555' }}>
                선택한 학년은 가입 후 변경할 수 없습니다.
                <br />
                <br />
                <strong>{grade}</strong> 이 맞습니까?
              </p>

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#ccc',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  취소
                </button>

                <button
                  onClick={handleFinalSubmit}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#4FC3F7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  네, 맞아요
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ⭐ 블루 모달 UI(로그인과 동일 스타일) */}
        {showModal && (
          <div className="modal-backdrop">
            <div className="modal-box">
              <div className="modal-icon">✔</div>
              <p>{modalMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* 스타일 */}
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

