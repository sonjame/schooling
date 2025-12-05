'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const API_KEY = '32cbd596f1b64e7abc94e1eb85ca5a06'

export default function SignupPage() {

  // 입력 값
  const [realName, setRealName] = useState('')
  const [username, setUsername] = useState('')
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

  const [idAvailable, setIdAvailable] = useState<boolean | null>(null)

  // 기존 유저 불러오기
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('users') || '[]')
    setUsers(saved)
  }, [])

  // alert
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
      const url = `https://open.neis.go.kr/hub/schoolInfo?KEY=${API_KEY}&Type=json&pIndex=1&pSize=20&SCHUL_NM=${encodeURIComponent(keyword)}`
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

  // 아이디 중복확인
  const checkDuplicateId = () => {
    if (!username.trim()) {
      showAlert('아이디를 입력해주세요.')
      return
    }

    const exists = users.some((u) => u.username === username)

    if (exists) {
      setIdAvailable(false)
      showAlert('이미 사용 중인 아이디입니다.')
    } else {
      setIdAvailable(true)
      showAlert('사용 가능한 아이디입니다!')
    }
  }

  // 제출 전 체크
  const handleSubmit = () => {
    if (!realName || !username || !password || !password2 || !school) {
      showAlert('모든 정보를 입력해주세요.')
      return
    }

    if (idAvailable === false) {
      showAlert('이미 사용 중인 아이디입니다.')
      return
    }

    if (idAvailable !== true) {
      showAlert('아이디 중복확인을 먼저 해주세요.')
      return
    }

    if (password !== password2) {
      showAlert('비밀번호가 일치하지 않습니다.')
      return
    }

    setShowConfirm(true)
  }

  const handleFinalSubmit = () => {
    const newUser = {
      username,
      password,
      name: realName,
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

          {/* 실명 */}
          <input
            style={inputStyle}
            placeholder="이름을 입력하세요 (실명)"
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
          />

          {/* 아이디 */}
          <div style={{ position: 'relative', marginTop: '12px' }}>
            <input
              style={{ ...inputStyle, paddingRight: '100px' }}
              placeholder="아이디를 입력하세요"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setIdAvailable(null)
              }}
            />

            <button
              onClick={checkDuplicateId}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '8px 10px',
                background: '#4FC3F7',
                color: 'white',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              중복확인
            </button>
          </div>

          {/* 중복확인 결과 */}
          {idAvailable === true && (
            <p style={{ color: '#2E7D32', fontSize: '13px', marginTop: '6px' }}>
              ✅ 사용 가능한 아이디입니다.
            </p>
          )}

          {idAvailable === false && (
            <p style={{ color: '#D32F2F', fontSize: '13px', marginTop: '6px' }}>
              ❌ 이미 사용 중인 아이디입니다.
            </p>
          )}

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
            <Link href="/auth/login" style={{ color: '#4FC3F7', fontWeight: 600 }}>
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

      <style jsx>{`
        .auth-btn {
          width: 100%;
          height: 48px;
          display: flex;
          align-items: center;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 12px;
        }

        .modal-backdrop,
        .confirm-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.35);
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
          height: 42px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          border: none;
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
