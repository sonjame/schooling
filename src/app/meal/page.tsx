'use client'

import { useEffect, useState } from 'react'

// ---------------------------
//  급식 API 불러오기 함수 (단일 날짜 조회)
// ---------------------------
async function fetchMeal(date: string, eduCode: string, schoolCode: string) {
  const API_KEY = `109e3660c3624bf5a4803631891234ef`
  const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${eduCode}&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${date}`

  try {
    const res = await fetch(url)
    const data = await res.json()

    if (!data.mealServiceDietInfo) return null

    const rows = data.mealServiceDietInfo[1]?.row
    if (!rows) return null

    // ⭐⭐⭐ 중식만 필터링
    const lunchRow = rows.find((r: any) => r.MMEAL_SC_NM === '중식')
    if (!lunchRow) return null

    const raw = lunchRow.DDISH_NM
    if (!raw) return null

    const lines: string[] = raw.split('<br/>')

    const cleanedLines = lines
      .map((line) =>
        line
          .replace(/[\u2460-\u2473]/g, '') // ①② 숫자 제거
          .replace(/\(\s?[0-9.]+\s?\)/g, '') // (5.6) 칼로리 제거
          .replace(/-\s*$/g, '') // 끝에 - 제거
          .replace(/\s+/g, ' ')
          .trim()
      )
      .filter((line) => line.length > 0)

    return cleanedLines
  } catch (e) {
    console.error(`급식 불러오기 실패 (${date})`, e)
    return null
  }
}
// ---------------------------
//  이번 주 날짜 구하기
// ---------------------------
function getWeekDates() {
  const today = new Date()
  const kr = new Date(today.getTime() + 9 * 60 * 60 * 1000)

  // 📌 다음 주 월요일 계산
  const day = kr.getDay()
  const nextMonday = new Date(kr)
  nextMonday.setDate(kr.getDate() - (day === 0 ? 6 : day - 1) + 7)

  const dates = []
  for (let i = 0; i < 5; i++) {
    const d = new Date(nextMonday)
    d.setDate(nextMonday.getDate() + i)

    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')

    dates.push({ key: `${y}${m}${dd}`, label: `${m}/${dd}` })
  }

  return dates
}

export default function WeeklyMealPage() {
  const [weekMeals, setWeekMeals] = useState<
    { date: string; label: string; meal: string[] | null }[]
  >([])

  const [eduCode, setEduCode] = useState<string | null>(null)
  const [schoolCode, setSchoolCode] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  // 🔹 저장된 학교 정보 불러오기
  useEffect(() => {
    const storedEdu = localStorage.getItem('eduCode')
    const storedCode = localStorage.getItem('schoolCode')

    setEduCode(storedEdu ?? 'J10')
    setSchoolCode(storedCode ?? '7580167')

    setReady(true)
  }, [])

  // 🔹 아이콘 폰트 로드 보장 (아이콘 깨짐 방지)
  useEffect(() => {
    const iconLink = document.createElement('link')
    iconLink.rel = 'stylesheet'
    iconLink.href =
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined'
    document.head.appendChild(iconLink)
  }, [])

  // 🔹 저장된 값 준비 후 급식 로드
  useEffect(() => {
    if (!ready || !eduCode || !schoolCode) return

    const dates = getWeekDates()

    Promise.all(
      dates.map(async (d) => {
        const meal = await fetchMeal(d.key, eduCode, schoolCode)
        return { date: d.key, label: d.label, meal }
      })
    ).then((results) => {
      setWeekMeals(results)
    })
  }, [ready, eduCode, schoolCode])

  return (
    <div
      style={{
        marginBottom: '32px',
        padding: '20px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        fontFamily: "'Noto Sans KR', sans-serif",
      }}
    >
      <h3
        style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#4FC3F7',
          paddingBottom: '6px',
          borderBottom: '2px solid #4FC3F7',
          marginBottom: '16px',
        }}
      >
        🍱 이번 주 점심 메뉴
      </h3>

      {/* 🔥 아이콘 폰트 스타일 */}
      <style>
        {`
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 22px;
          display: inline-block;
          line-height: 1;
          vertical-align: middle;
        }
      `}
      </style>

      <div style={{ display: 'grid', gap: '16px' }}>
        {weekMeals.map((d, idx) => (
          <div
            key={idx}
            style={{
              padding: '18px',
              borderRadius: '14px',
              background: '#E3F2FD',
              color: '#222',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #BBDEFB',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  background: '#BBDEFB',
                  padding: '6px',
                  borderRadius: '8px',
                  color: '#1A237E',
                }}
              >
                calendar_month
              </span>

              <span
                style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#0D47A1',
                }}
              >
                {d.label}
              </span>
            </div>

            {!d.meal ? (
              <p style={{ opacity: 0.85, fontSize: 15 }}>급식 정보 없음</p>
            ) : (
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '18px',
                  fontSize: '15px',
                  lineHeight: 1.6,
                  color: '#222',
                }}
              >
                {d.meal.map((m, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>
                    {m}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
