'use client'

import React, { useState, useEffect } from 'react'

interface UserData {
  username: string
  password?: string
  school: string
  grade: string
  name?: string
  pw?: string
  userPassword?: string
  eduCode?: string
  schoolCode?: string
}

/** 🔥 users 배열에서 사용하는 타입 정의 */
interface UserRecord {
  username: string // 필수 값
  id?: string
  userId?: string
  school?: string
  eduCode?: string
  schoolCode?: string
  password?: string
  pw?: string
  userPassword?: string
  [key: string]: unknown
}

/** 🔥 학교 검색 결과 row 타입 지정 */
interface SchoolRow {
  SCHUL_NM: string
  SD_SCHUL_CODE: string
  ATPT_OFCDC_SC_CODE: string
  LCTN_SC_NM?: string
  [key: string]: unknown
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

  const [showPwForm, setShowPwForm] = useState(false)
  const [showPwConfirmModal, setShowPwConfirmModal] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [newPw2, setNewPw2] = useState('')

  const [showSchoolForm, setShowSchoolForm] = useState(false)
  const [schoolKeyword, setSchoolKeyword] = useState('')

  const [searchResults, setSearchResults] = useState<SchoolRow[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [schoolMessage, setSchoolMessage] = useState<string | null>(null)
  const [schoolError, setSchoolError] = useState<string | null>(null)

  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [selectedSchoolRow, setSelectedSchoolRow] = useState<SchoolRow | null>(
    null
  )

  const [showConfirmModal, setShowConfirmModal] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('loggedInUser')
    if (!stored) return

    try {
      const parsed = JSON.parse(stored)

      const normalized: UserData = {
        username: parsed.username,
        school: parsed.school,
        grade: parsed.grade,
        name: parsed.name,
        eduCode: parsed.eduCode,
        schoolCode: parsed.schoolCode,
        password:
          parsed.password ?? parsed.pw ?? parsed.userPassword ?? undefined,
        pw: parsed.pw,
        userPassword: parsed.userPassword,
      }

      setUser(normalized)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    if (!user) return

    const toStore = { ...user }
    if (user.password) {
      toStore.password = user.password
      if ('pw' in toStore) toStore.pw = user.password
      if ('userPassword' in toStore) toStore.userPassword = user.password
    }

    localStorage.setItem('loggedInUser', JSON.stringify(toStore))
  }, [user])

  const handlePasswordChange = () => {
    if (!user) return

    const storedPassword =
      user.password ?? user.pw ?? user.userPassword ?? undefined

    if (!currentPw || !newPw || !newPw2)
      return alert('모든 비밀번호 항목을 입력해주세요.')
    if (newPw !== newPw2) return alert('새 비밀번호가 서로 일치하지 않습니다.')
    if (storedPassword && currentPw !== storedPassword)
      return alert('현재 비밀번호가 일치하지 않습니다.')

    const updated: UserData = { ...user, password: newPw }
    if ('pw' in user) updated.pw = newPw
    if ('userPassword' in user) updated.userPassword = newPw

    setUser(updated)

    const usersRaw = localStorage.getItem('users')
    if (usersRaw) {
      try {
        const users: UserRecord[] = JSON.parse(usersRaw)

        const newUsers = users.map((u) =>
          u.username === user.username
            ? { ...u, password: newPw, pw: newPw, userPassword: newPw }
            : u
        )

        localStorage.setItem('users', JSON.stringify(newUsers))
      } catch {}
    }

    setCurrentPw('')
    setNewPw('')
    setNewPw2('')
    setShowPwForm(false)

    alert('비밀번호가 변경되었습니다.')
  }

  /** 🔹 학교 검색 */
  const handleSchoolSearch = async (keyword: string) => {
    const trimmed = keyword.trim()
    if (!trimmed) {
      setSchoolError(null)
      setSearchResults([])
      setSelectedSchool(null)
      return
    }

    setIsSearching(true)
    setSchoolMessage(null)
    setSchoolError(null)

    try {
      const API_KEY = process.env.NEXT_PUBLIC_NEIS_KEY
      if (!API_KEY) {
        setSchoolError('서버 설정 오류로 학교 검색을 할 수 없습니다.')
        return
      }

      const url = `https://open.neis.go.kr/hub/schoolInfo?KEY=${API_KEY}&Type=json&pIndex=1&pSize=20&SCHUL_NM=${encodeURIComponent(
        trimmed
      )}`

      const res = await fetch(url)
      const data = await res.json()

      if (data.schoolInfo && data.schoolInfo[1]?.row) {
        const rows: SchoolRow[] = data.schoolInfo[1].row

        const filtered = rows.filter((s) =>
          String(s.SCHUL_NM || '').includes(trimmed)
        )

        setSearchResults(filtered)
        if (!filtered.length) setSchoolError('검색 결과가 없습니다.')
      } else {
        setSchoolError('검색 결과가 없습니다.')
      }
    } catch {
      setSchoolError('학교 검색 중 오류 발생.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectSchool = (schoolRow: SchoolRow) => {
    setSelectedSchool(schoolRow.SCHUL_NM)
    setSelectedSchoolRow(schoolRow)
    setSchoolMessage(
      `'${schoolRow.SCHUL_NM}'(으)로 변경하려면 아래 확인을 누르세요.`
    )
  }

  const handleConfirmSchoolChange = () => {
    if (!user || !selectedSchoolRow) return

    const updated: UserData = {
      ...user,
      school: selectedSchoolRow.SCHUL_NM,
      eduCode: selectedSchoolRow.ATPT_OFCDC_SC_CODE,
      schoolCode: selectedSchoolRow.SD_SCHUL_CODE,
    }

    setUser(updated)

    localStorage.setItem('loggedInUser', JSON.stringify(updated))
    localStorage.setItem('eduCode', updated.eduCode!)
    localStorage.setItem('schoolCode', updated.schoolCode!)
    localStorage.setItem('school', updated.school)

    const usersRaw = localStorage.getItem('users')
    if (usersRaw) {
      try {
        const users: UserRecord[] = JSON.parse(usersRaw)

        const newUsers = users.map((u: UserRecord) =>
          u.username === user.username
            ? {
                ...u,
                school: updated.school,
                eduCode: updated.eduCode,
                schoolCode: updated.schoolCode,
              }
            : u
        )

        localStorage.setItem('users', JSON.stringify(newUsers))
      } catch {}
    }

    window.dispatchEvent(new Event('storage'))

    setSchoolMessage(`'${updated.school}'(으)로 학교가 변경되었습니다.`)
    setShowConfirmModal(false)
    setShowSchoolForm(false)
    setSearchResults([])
    setSchoolKeyword('')
    setSelectedSchool(null)
    setSelectedSchoolRow(null)
  }

  const handleCancelSchoolChange = () => setShowConfirmModal(false)

  if (!user) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <p>로그인이 필요합니다.</p>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: '85vh',
        display: 'flex',
        justifyContent: 'center',
        padding: '70px 40px 30px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: 'white',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 10px 30px rgba(15,23,42,0.12)',
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 4,
            textAlign: 'center',
          }}
        >
          내 정보
        </h1>

        <Field label="이름" value={user.name || ''} />
        <Field label="아이디" value={user.username} />

        {/* 🔹 학교 변경 UI */}
        <div style={{ marginBottom: 18, width: '100%', textAlign: 'center' }}>
          <label
            style={{
              marginBottom: 6,
              fontSize: 13,
              fontWeight: 600,
              display: 'block',
              width: '80%',
              margin: '0 auto 6px',
              textAlign: 'left',
            }}
          >
            학교 이름
          </label>

          {/* 기존 필드 디자인과 동일한 배치 */}
          <div
            style={{
              width: '85%',
              margin: '0 auto',
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
                padding: '8px 12px',
                background: '#38bdf8',
                color: 'white',
                borderRadius: 10,
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              학교 변경
            </button>
          </div>

          {/* 🔹 검색창 & 결과 카드 */}
          {showSchoolForm && (
            <div
              style={{
                width: '85%', // 📌 input과 동일 비율
                margin: '6px auto 0',
                borderRadius: 10,
                border: '1px solid #e5e7eb',
                background: '#f9fafb',
                padding: '8px 10px', // 📌 padding 줄여서 input에 딱 맞게
                boxSizing: 'border-box',
              }}
            >
              {/* 검색 input — width 줄임 */}
              <input
                type="text"
                placeholder="학교 이름을 입력하세요"
                value={schoolKeyword}
                onChange={(e) => {
                  setSchoolKeyword(e.target.value)
                  handleSchoolSearch(e.target.value)
                }}
                style={{
                  width: '90%', // 📌 컨테이너와 동일하게
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 13,
                  outline: 'none',
                }}
              />

              {isSearching && (
                <p
                  style={{
                    fontSize: 12,
                    textAlign: 'center',
                    color: '#6b7280',
                  }}
                >
                  🔎 검색 중...
                </p>
              )}

              {/* 검색결과 박스 */}
              {searchResults.length > 0 && (
                <div
                  style={{
                    maxHeight: 180,
                    overflowY: 'auto',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    marginTop: 6,
                  }}
                >
                  {searchResults.map((s) => {
                    const isSelected = selectedSchool === s.SCHUL_NM
                    return (
                      <button
                        key={s.SD_SCHUL_CODE}
                        type="button"
                        onClick={() => handleSelectSchool(s)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 10px',
                          border: 'none',
                          background: isSelected ? '#e0f2fe' : 'transparent',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f3f4f6',
                        }}
                      >
                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                          {s.SCHUL_NM}
                        </div>
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
                <p style={{ fontSize: 12, color: 'red', marginTop: 4 }}>
                  {schoolError}
                </p>
              )}

              {selectedSchool && (
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  style={{
                    width: '100%',
                    marginTop: 10,
                    padding: '8px 0',
                    borderRadius: 8,
                    background: '#6366f1',
                    color: 'white',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ✔ 선택한 학교 적용
                </button>
              )}
            </div>
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

        <Field label="학년" value={user.grade} />

        {/* 비밀번호 변경 */}
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

        {/* 비번 변경 모달 */}
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
              }}
            >
              <p style={{ textAlign: 'center', marginBottom: 16 }}>
                비밀번호를 변경하시겠습니까?
              </p>
              <div
                style={{ display: 'flex', justifyContent: 'center', gap: 8 }}
              >
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
                    cursor: 'pointer',
                  }}
                >
                  예
                </button>
                <button
                  type="button"
                  onClick={() => setShowPwConfirmModal(false)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 999,
                    border: '1px solid #d1d5db',
                    background: 'white',
                    cursor: 'pointer',
                  }}
                >
                  아니오
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 학교 변경 확인 모달 */}
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
              }}
            >
              <p style={{ textAlign: 'center', marginBottom: 16 }}>
                정말 학교를 변경하시겠습니까?
              </p>
              <div
                style={{ display: 'flex', justifyContent: 'center', gap: 10 }}
              >
                <button
                  type="button"
                  onClick={handleConfirmSchoolChange}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 999,
                    border: 'none',
                    background: '#6366f1',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  예
                </button>
                <button
                  type="button"
                  onClick={handleCancelSchoolChange}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 999,
                    border: '1px solid #d1d5db',
                    background: 'white',
                    cursor: 'pointer',
                  }}
                >
                  아니오
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
