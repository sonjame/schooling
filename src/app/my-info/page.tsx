'use client'

import React, { useState, useEffect } from 'react'

interface UserData {
  username: string
  password?: string // 선택적
  school: string
  grade: string
  name?: string
  // 예전에 pw, userPassword 같은 키로 저장했을 가능성까지 대비
  pw?: string
  userPassword?: string
}

const pwInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 10px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  fontSize: 13,
  boxSizing: 'border-box',
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        marginBottom: 18,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <label
        style={{
          marginBottom: 6,
          fontSize: 13,
          fontWeight: 600,
          color: '#374151',
          width: '80%',
        }}
      >
        {label}
      </label>

      <input
        value={value}
        readOnly
        disabled
        style={{
          width: '80%',
          padding: '10px 12px',
          borderRadius: 10,
          border: '1px solid #e5e7eb',
          background: '#f3f4f6',
          color: '#6b7280',
          cursor: 'not-allowed',
        }}
      />
    </div>
  )
}

export default function MyInfoPagePreview() {
  const [user, setUser] = useState<UserData | null>(null)

  // 비밀번호 변경 상태
  const [showPwForm, setShowPwForm] = useState(false)
  const [showPwConfirmModal, setShowPwConfirmModal] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [newPw2, setNewPw2] = useState('')

  // 학교 변경 상태
  const [showSchoolForm, setShowSchoolForm] = useState(false)
  const [schoolKeyword, setSchoolKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [schoolMessage, setSchoolMessage] = useState<string | null>(null)
  const [schoolError, setSchoolError] = useState<string | null>(null)

  // 선택된 학교 + 모달 상태
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  /* ============================
      로그인 정보 불러오기
  ============================ */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('loggedInUser')
    if (!stored) return

    try {
      const parsed = JSON.parse(stored) as any

      // 🔹 password / pw / userPassword 중 실제로 있는 값만 사용
      const normalized: UserData = {
        username: parsed.username,
        school: parsed.school,
        grade: parsed.grade,
        name: parsed.name,
        password:
          parsed.password !== undefined
            ? parsed.password
            : parsed.pw !== undefined
            ? parsed.pw
            : parsed.userPassword !== undefined
            ? parsed.userPassword
            : undefined,
        pw: parsed.pw,
        userPassword: parsed.userPassword,
      }

      setUser(normalized)
    } catch {
      setUser(null)
    }
  }, [])

  /* ============================
      user 변경 시 localStorage 갱신
      (state -> loggedInUser 동기화)
  ============================ */
  useEffect(() => {
    if (!user || typeof window === 'undefined') return

    const toStore: any = {
      ...user,
    }

    if (user.password) {
      toStore.password = user.password
      if ('pw' in toStore) toStore.pw = user.password
      if ('userPassword' in toStore) toStore.userPassword = user.password
    }

    localStorage.setItem('loggedInUser', JSON.stringify(toStore))
  }, [user])

  /* ============================
      비밀번호 변경 실제 처리 로직
  ============================ */
  const handlePasswordChange = () => {
    if (!user) return

    // 1) 저장된 비밀번호 가져오기 (password / pw / userPassword 다 대응)
    const storedPassword =
      user.password ?? user.pw ?? user.userPassword ?? undefined

    // 2) 기본 검증
    if (!currentPw || !newPw || !newPw2) {
      alert('모든 비밀번호 항목을 입력해주세요.')
      return
    }

    if (newPw !== newPw2) {
      alert('새 비밀번호가 서로 일치하지 않습니다.')
      return
    }

    // 3) 기존 비밀번호가 실제로 저장되어 있는 경우에만 검사
    //    (저장된 비밀번호가 없으면, 이번에 "처음 설정"하는 느낌으로 허용)
    if (storedPassword && currentPw !== storedPassword) {
      alert('현재 비밀번호가 일치하지 않습니다.')
      return
    }

    // 4) state 상의 user 변경
    const updated: UserData = {
      ...user,
      password: newPw,
    }

    // pw / userPassword 키를 실제로 쓰고 있던 경우도 함께 맞춰줌
    if ('pw' in user) {
      ;(updated as any).pw = newPw
    }
    if ('userPassword' in user) {
      ;(updated as any).userPassword = newPw
    }

    setUser(updated)

    // 5) 🔥 로컬스토리지 직접 갱신 (loggedInUser + users 배열까지)
    if (typeof window !== 'undefined') {
      try {
        // (1) loggedInUser 업데이트
        const loggedRaw = localStorage.getItem('loggedInUser')
        if (loggedRaw) {
          try {
            const loggedParsed = JSON.parse(loggedRaw)
            const merged = {
              ...loggedParsed,
              password: newPw,
              pw: newPw,
              userPassword: newPw,
            }
            localStorage.setItem('loggedInUser', JSON.stringify(merged))
          } catch {
            // 예전에 문자열로만 저장돼 있었다면, 새 구조로 덮어씀
            const merged = {
              username: user.username,
              school: user.school,
              grade: user.grade,
              name: user.name,
              password: newPw,
              pw: newPw,
              userPassword: newPw,
            }
            localStorage.setItem('loggedInUser', JSON.stringify(merged))
          }
        }

        // (2) users 배열(회원 목록)도 있으면 같이 업데이트
        const usersRaw = localStorage.getItem('users')
        if (usersRaw) {
          const users = JSON.parse(usersRaw)
          if (Array.isArray(users)) {
            const newUsers = users.map((u: any) => {
              if (
                u.username === user.username ||
                u.id === user.username ||
                u.userId === user.username
              ) {
                return {
                  ...u,
                  password: newPw,
                  pw: newPw,
                  userPassword: newPw,
                }
              }
              return u
            })
            localStorage.setItem('users', JSON.stringify(newUsers))
          }
        }
      } catch (e) {
        console.error('로컬스토리지 비밀번호 동기화 중 오류:', e)
      }
    }

    // 6) 입력값 / 폼 초기화
    setCurrentPw('')
    setNewPw('')
    setNewPw2('')
    setShowPwForm(false)

    alert('비밀번호가 성공적으로 변경되었습니다.')
  }

  /* ============================
      학교 검색 (입력할 때마다 자동, 포함 검색)
  ============================ */
  const handleSchoolSearch = async (keyword: string) => {
    const trimmed = keyword.trim()

    if (!trimmed) {
      setSchoolError(null)
      setSearchResults([])
      setSelectedSchool(null)
      return
    }

    setSchoolError(null)
    setSchoolMessage(null)
    setIsSearching(true)

    try {
      const API_KEY = process.env.NEXT_PUBLIC_NEIS_KEY
      if (!API_KEY) {
        console.error('NEXT_PUBLIC_NEIS_KEY가 설정되지 않았습니다.')
        setSchoolError('서버 설정 오류로 학교 검색을 할 수 없습니다.')
        setSearchResults([])
        return
      }

      const url = `https://open.neis.go.kr/hub/schoolInfo?KEY=${API_KEY}&Type=json&pIndex=1&pSize=20&SCHUL_NM=${encodeURIComponent(
        trimmed
      )}`

      const res = await fetch(url)
      const data = await res.json()

      if (data.schoolInfo && data.schoolInfo[1]?.row) {
        const rows: any[] = data.schoolInfo[1].row

        const filtered = rows.filter((s) =>
          String(s.SCHUL_NM || '').includes(trimmed)
        )

        if (filtered.length > 0) {
          setSearchResults(filtered)
        } else {
          setSearchResults([])
          setSchoolError('검색 결과가 없습니다.')
        }
      } else {
        setSearchResults([])
        setSchoolError('검색 결과가 없습니다.')
      }
    } catch (err) {
      console.error('학교 검색 오류:', err)
      setSchoolError('학교 검색 중 오류가 발생했습니다.')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectSchool = (schulNm: string) => {
    setSelectedSchool(schulNm)
    setSchoolMessage(
      `'${schulNm}'(으)로 변경을 진행하려면 아래 확인 버튼을 눌러주세요.`
    )
  }

  const handleConfirmSchoolChange = () => {
    if (!user || !selectedSchool) return

    // 1) state 상의 user 변경
    const updated: UserData = { ...user, school: selectedSchool }
    setUser(updated)
    setSchoolMessage(`'${selectedSchool}'(으)로 학교가 변경되었습니다.`)
    setShowConfirmModal(false)
    setShowSchoolForm(false)
    setSearchResults([])
    setSchoolKeyword('')
    setSelectedSchool(null)

    // 2) 🔥 로컬스토리지 직접 갱신 (loggedInUser + users 배열까지)
    if (typeof window !== 'undefined') {
      try {
        // (1) loggedInUser 업데이트
        const loggedRaw = localStorage.getItem('loggedInUser')
        if (loggedRaw) {
          try {
            const loggedParsed = JSON.parse(loggedRaw)
            const merged = {
              ...loggedParsed,
              school: selectedSchool,
            }
            localStorage.setItem('loggedInUser', JSON.stringify(merged))
          } catch {
            // 예전에 문자열로만 저장돼 있었다면, 새 구조로 덮어씀
            const merged = {
              username: user.username,
              school: selectedSchool,
              grade: user.grade,
              name: user.name,
              password: user.password,
              pw: user.pw ?? user.password,
              userPassword: user.userPassword ?? user.password,
            }
            localStorage.setItem('loggedInUser', JSON.stringify(merged))
          }
        }

        // (2) users 배열(회원 목록)도 있으면 같이 업데이트
        const usersRaw = localStorage.getItem('users')
        if (usersRaw) {
          const users = JSON.parse(usersRaw)
          if (Array.isArray(users)) {
            const newUsers = users.map((u: any) => {
              if (
                u.username === user.username ||
                u.id === user.username ||
                u.userId === user.username
              ) {
                return {
                  ...u,
                  school: selectedSchool,
                }
              }
              return u
            })
            localStorage.setItem('users', JSON.stringify(newUsers))
          }
        }
      } catch (e) {
        console.error('로컬스토리지 학교 동기화 중 오류:', e)
      }
    }
  }

  const handleCancelSchoolChange = () => {
    setShowConfirmModal(false)
  }

  if (!user) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#f5f7fb',
        }}
      >
        <p style={{ color: '#555' }}>로그인이 필요합니다.</p>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: '85vh',
        background: '#f5f7fb',
        display: 'flex',
        justifyContent: 'center',
        padding: '70px 40px 30px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 10px 30px rgba(15,23,42,0.12)',
          padding: 24,
          position: 'relative',
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 4,
            textAlign: 'center',
            color: '#111827',
          }}
        >
          내 정보
        </h1>

        {/* 이름 */}
        <Field label="이름" value={user.name || ''} />

        {/* 아이디 */}
        <Field label="아이디" value={user.username} />

        {/* 학교 이름 + 변경 버튼 inline */}
        <div
          style={{
            marginBottom: 18,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <label
            style={{
              marginBottom: 6,
              fontSize: 13,
              fontWeight: 600,
              color: '#374151',
              width: '80%',
            }}
          >
            학교 이름
          </label>

          {/* 🔹 아이디 input과 똑같이 80% 폭 맞춤 */}
          <div
            style={{
              width: '85%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <input
              value={user.school}
              readOnly
              disabled
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #e5e7eb',
                background: '#f3f4f6',
                color: '#6b7280',
                cursor: 'not-allowed',
              }}
            />

            <button
              type="button"
              onClick={() => {
                setSchoolMessage(null)
                setSchoolError(null)
                setShowSchoolForm((prev) => !prev)
                setSearchResults([])
                setSchoolKeyword('')
                setSelectedSchool(null)
                setShowConfirmModal(false)
              }}
              style={{
                padding: '9px 14px',
                background: '#38bdf8',
                color: 'white',
                borderRadius: 10,
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              학교 변경
            </button>
          </div>

          {/* 🔽 기존 폼은 그대로 유지 */}
          {showSchoolForm && (
            <form
              onSubmit={(e) => e.preventDefault()}
              style={{
                marginTop: 10,
                padding: 10,
                borderRadius: 10,
                border: '1px solid #e5e7eb',
                background: '#f9fafb',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                alignItems: 'stretch',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                }}
              >
                <input
                  type="text"
                  placeholder="학교 이름을 입력하세요"
                  value={schoolKeyword}
                  onChange={(e) => {
                    const value = e.target.value
                    setSchoolKeyword(value)
                    handleSchoolSearch(value)
                  }}
                  style={{
                    flex: 1,
                    padding: '9px 10px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {isSearching && (
                <p
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    color: '#6b7280',
                  }}
                >
                  검색 중...
                </p>
              )}

              {searchResults.length > 0 && (
                <div
                  style={{
                    marginTop: 6,
                    maxHeight: 180,
                    overflowY: 'auto',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    background: '#ffffff',
                  }}
                >
                  {searchResults.map((s: any) => {
                    const name = s.SCHUL_NM
                    const isSelected = selectedSchool === name
                    return (
                      <button
                        key={s.SD_SCHUL_CODE ?? name}
                        type="button"
                        onClick={() => handleSelectSchool(name)}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 10px',
                          border: 'none',
                          borderBottom: '1px solid #f3f4f6',
                          background: isSelected ? '#e0f2fe' : 'transparent',
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{name}</div>
                        {s.LCTN_SC_NM && (
                          <div
                            style={{
                              fontSize: 11,
                              color: '#6b7280',
                            }}
                          >
                            {s.LCTN_SC_NM}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {schoolError && (
                <p
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    color: '#ef4444',
                  }}
                >
                  {schoolError}
                </p>
              )}

              {selectedSchool && (
                <div
                  style={{
                    marginTop: 8,
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 999,
                      border: 'none',
                      background: '#6366f1',
                      color: 'white',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    확인
                  </button>
                </div>
              )}
            </form>
          )}

          {schoolMessage && (
            <p
              style={{
                marginTop: 6,
                fontSize: 12,
                color: schoolMessage.includes('변경') ? '#10b981' : '#6b7280',
              }}
            >
              {schoolMessage}
            </p>
          )}
        </div>

        {/* 학년 */}
        <Field label="학년" value={user.grade} />

        {/* 🔐 비밀번호 변경 */}
        <div style={{ marginTop: 30, textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setShowPwForm((prev) => !prev)
              if (!showPwForm) {
                setCurrentPw('')
                setNewPw('')
                setNewPw2('')
              }
            }}
            style={{
              padding: '10px 16px',
              background: '#4FC3F7',
              color: 'white',
              borderRadius: 10,
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            비밀번호 변경
          </button>

          {showPwForm && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setShowPwConfirmModal(true)
              }}
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 10,
                border: '1px solid #e5e7eb',
                background: '#f9fafb',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <input
                type="password"
                placeholder="현재 비밀번호"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                style={pwInputStyle}
              />
              <input
                type="password"
                placeholder="새 비밀번호"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                style={pwInputStyle}
              />
              <input
                type="password"
                placeholder="새 비밀번호 확인"
                value={newPw2}
                onChange={(e) => setNewPw2(e.target.value)}
                style={pwInputStyle}
              />

              <button
                type="submit"
                style={{
                  marginTop: 4,
                  padding: '9px 12px',
                  borderRadius: 999,
                  border: 'none',
                  background: '#6366f1',
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                확인
              </button>
            </form>
          )}
        </div>

        {/* 🔸 비밀번호 변경 확인 모달 */}
        {showPwConfirmModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.35)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
            }}
          >
            <div
              style={{
                background: 'white',
                borderRadius: 12,
                padding: 20,
                width: '90%',
                maxWidth: 360,
                boxShadow: '0 10px 25px rgba(15,23,42,0.25)',
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  marginBottom: 16,
                  textAlign: 'center',
                }}
              >
                비밀번호를 변경하시겠습니까?
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowPwConfirmModal(false)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 999,
                    border: '1px solid #d1d5db',
                    background: 'white',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  아니오
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPwConfirmModal(false)
                    handlePasswordChange()
                  }}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 999,
                    border: 'none',
                    background: '#6366f1',
                    color: 'white',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  예
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🔸 학교 변경 확인 모달 */}
        {showConfirmModal && selectedSchool && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.35)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
            }}
          >
            <div
              style={{
                background: 'white',
                borderRadius: 12,
                padding: 20,
                width: '90%',
                maxWidth: 360,
                boxShadow: '0 10px 25px rgba(15,23,42,0.25)',
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  marginBottom: 16,
                  textAlign: 'center',
                }}
              >
                학교변경을 하시겠습니까?
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  onClick={handleCancelSchoolChange}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 999,
                    border: '1px solid #d1d5db',
                    background: 'white',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  아니오
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSchoolChange}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 999,
                    border: 'none',
                    background: '#6366f1',
                    color: 'white',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  예
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
