'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const API_KEY = '32cbd596f1b64e7abc94e1eb85ca5a06'

export default function SignupClient() {
  const searchParams = useSearchParams()

  // ⭐ 입력 값
  const [verified, setVerified] = useState(false)

  const [realName, setRealName] = useState('') // 🔥 실명
  const [username, setUsername] = useState('') // 로그인 아이디
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')

  const [school, setSchool] = useState('')
  const [schoolCode, setSchoolCode] = useState('')
  const [eduCode, setEduCode] = useState('')
  const [level, setLevel] = useState('')

  const [grade, setGrade] = useState('1학년')

  const [users, setUsers] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [showConfirm, setShowConfirm] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')

  // 🔹 소셜로그인에서 넘어온 값 적용
  useEffect(() => {
    const socialName = searchParams.get('name')
    const socialEmail = searchParams.get('email')
    const socialId = searchParams.get('id')

    if (socialName && socialEmail && socialId) {
      localStorage.setItem(
        'socialUser',
        JSON.stringify({
          id: socialId,
          name: socialName,
          email: socialEmail,
        })
      )
    }
  }, [searchParams])

  // 기존 유저 불러오기
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('users') || '[]')
    setUsers(saved)
  }, [])

  // 인증 여부 확인
  useEffect(() => {
    const v = searchParams.get('verified')
    setVerified(v === '1')
  }, [searchParams])

  // 공통 alert
  const showAlert = (msg: string) => {
    setModalMessage(msg)
    setShowModal(true)
    setTimeout(() => setShowModal(false), 1500)
  }

  // 인증 방식들
  const handleKakaoAuth = () => (window.location.href = '/api/auth/kakao')
  const handleGoogleAuth = () => (window.location.href = '/api/auth/google')
  const handleEmailAuth = () => (window.location.href = '/auth/email')

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

  const selectSchool = (item: any) => {
    setSchool(item.SCHUL_NM)
    setSchoolCode(item.SD_SCHUL_CODE)
    setEduCode(item.ATPT_OFCDC_SC_CODE)
    setLevel(item.SCHUL_KND_SC_NM)
    setSearchResults([])
    setIsSearching(false)
  }

  // 회원가입 제출 전 체크
  const handleSubmit = () => {
    if (!realName || !username || !password || !password2 || !school) {
      showAlert('모든 정보를 입력해주세요.')
      return
    }

    if (password !== password2) {
      showAlert('비밀번호가 일치하지 않습니다.')
      return
    }

    setShowConfirm(true)
  }

  // 회원가입 최종 처리
  const handleFinalSubmit = () => {
    const exists = users.find((u) => u.username === username)
    if (exists) {
      showAlert('이미 존재하는 아이디입니다.')
      return
    }

    const social = JSON.parse(localStorage.getItem('socialUser') || '{}')

    const newUser = {
      username,
      password,
      name: realName,
      email: social.email || '',
      social_id: social.id || null,
      school,
      schoolCode,
      eduCode,
      level,
      grade,
      verified_student: false,
    }

    const updated = [...users, newUser]
    localStorage.setItem('users', JSON.stringify(updated))

    showAlert('회원가입 완료!')
    setTimeout(() => (window.location.href = '/auth/login'), 1500)
  }

  // 스타일
  const cardStyle: React.CSSProperties = {
    width: '420px',
    background: 'white',
    borderRadius: '16px',
    padding: '40px 30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
        {/* STEP 1: 인증 */}
        {!verified && (
          <div style={cardStyle}>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#4FC3F7',
                marginBottom: '6px',
              }}
            >
              🔐 본인 인증
            </h2>
            <p
              style={{ fontSize: '14px', color: '#555', marginBottom: '20px' }}
            >
              회원가입을 위해 하나를 선택해주세요.
            </p>

            <button onClick={handleKakaoAuth} className="auth-btn kakao">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg"
                alt="kakao"
                className="auth-icon"
              />
              카카오로 계속하기
            </button>

            <button onClick={handleGoogleAuth} className="auth-btn google">
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="google"
                className="auth-icon"
              />
              Google로 계속하기
            </button>

            <button onClick={handleEmailAuth} className="auth-btn email">
              📧 이메일 인증
            </button>
          </div>
        )}

        {/* STEP 2: 회원가입 입력 */}
        {verified && (
          <div style={cardStyle}>
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

            {/* 🔥 실명 입력칸 */}
            <input
              style={inputStyle}
              placeholder="이름을 입력하세요 (실명)"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
            />

            {/* 아이디 */}
            <input
              style={{ ...inputStyle, marginTop: '12px' }}
              placeholder="아이디를 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            {/* 비밀번호 */}
            <div style={{ position: 'relative', marginTop: '12px' }}>
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
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>

            <input
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              style={{ ...inputStyle, marginTop: '12px' }}
            />

            {/* 학교 검색 */}
            <div style={{ position: 'relative', marginTop: '12px' }}>
              <input
                style={inputStyle}
                placeholder="학교명을 입력하세요 (자동완성)"
                value={school}
                onChange={(e) => searchSchool(e.target.value)}
              />

              {isSearching && searchResults.length > 0 && (
                <ul
                  style={{
                    position: 'absolute',
                    top: '50px',
                    width: '100%',
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    zIndex: 100,
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

            <select
              style={{ ...inputStyle, marginTop: '12px' }}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option>1학년</option>
              <option>2학년</option>
              <option>3학년</option>
            </select>

            <p style={{ fontSize: '13px', color: '#d32f2f', marginTop: '6px' }}>
              ⚠️ 한번 선택한 학년은 변경할 수 없습니다.
            </p>

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
                marginTop: '20px',
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
              이미 계정이 있으신가요?
              <Link
                href="/auth/login"
                style={{ color: '#4FC3F7', fontWeight: 600 }}
              >
                {' '}
                로그인
              </Link>
            </p>

            {/* 학년 확인 모달 */}
            {showConfirm && (
              <div className="confirm-backdrop">
                <div className="confirm-box">
                  <div className="confirm-icon">❗</div>
                  <p className="confirm-text">{grade} 이 맞습니까?</p>
                  <div className="confirm-buttons">
                    <button
                      className="cancel-btn"
                      onClick={() => setShowConfirm(false)}
                    >
                      취소
                    </button>
                    <button className="ok-btn" onClick={handleFinalSubmit}>
                      확인
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 알림 모달 */}
        {showModal && (
          <div className="modal-backdrop">
            <div className="modal-box">
              <div className="modal-icon">✔</div>
              <p>{modalMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* 일부 스타일 그대로 유지 */}
      <style jsx>{`
        .auth-btn {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          display: flex;
          align-items: center;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          margin-bottom: 12px;
          justify-content: flex-start;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .auth-icon {
          width: 22px;
          height: 22px;
          margin-right: 12px;
        }

        .google {
          background: #ffffff;
          border: 1px solid #ddd;
          color: #444;
        }

        .kakao {
          background: #fee500;
          color: #3c1e1e;
        }

        .email {
          background: #e3f2fd;
          border: 1px solid #90caf9;
          color: #1976d2;
        }

        .modal-backdrop,
        .confirm-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(3px);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .modal-box,
        .confirm-box {
          background: white;
          padding: 30px;
          border-radius: 16px;
          text-align: center;
          border: 2px solid #4fc3f7;
        }

        .confirm-buttons {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .cancel-btn,
        .ok-btn {
          flex: 1;
          height: 42px; /* 버튼 높이 추가 */
          padding: 0; /* 패딩을 0으로 변경 → flex 중앙정렬 효과 확실 */

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          box-sizing: border-box; /* 크기 계산 안정화 */
        }

        .cancel-btn {
          background: #e2e2e2;
          color: #333;
        }

        .ok-btn {
          background: #4fc3f7;
          color: white;
        }
      `}</style>
    </>
  )
}
