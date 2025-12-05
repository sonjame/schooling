'use client'

import { useEffect, useState } from 'react'

// ---------------------------
//  Google Fonts + Icons 로딩
// ---------------------------
const loadGoogleResources = () => {
  const font = document.createElement('link')
  font.rel = 'stylesheet'
  font.href =
    'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap'

  const icon = document.createElement('link')
  icon.rel = 'stylesheet'
  icon.href =
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined'

  document.head.appendChild(font)
  document.head.appendChild(icon)
}

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

    const raw = data.mealServiceDietInfo[1]?.row?.[0]?.DDISH_NM
    if (!raw) return null

    const lines: string[] = raw.split('<br/>')

    const cleanedLines = lines
      .map((line) =>
        line
          .replace(/[\u2460-\u2473]/g, '')
          .replace(/\(\s?[0-9.]+\s?\)/g, '')
          .replace(/-\s*$/g, '')
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

  // 🔹 1) 저장 정보 불러오기
  useEffect(() => {
    const storedEdu = localStorage.getItem('eduCode')
    const storedCode = localStorage.getItem('schoolCode')

    setEduCode(storedEdu ?? 'J10')
    setSchoolCode(storedCode ?? '7580167')

    setReady(true) // ⭐ storage 로딩 완료 표시
  }, [])

  // 🔹 2) 급식 불러오기 (storage 값 준비된 후 실행)
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
        background: '#F3FAFF',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',

        /* 모바일 화면 조건 */
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      {/* 제목 */}
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 700,
          color: '#4FC3F7',
          borderBottom: '2px solid #4FC3F7',
          paddingBottom: '6px',
          marginBottom: '16px',
        }}
      >
        🍱 이번 주 급식
      </h3>
      <style>
        {`
    /* --------------------------- */
    /*   🔥 모바일 최적화 (5칸 가로 스크롤) */
    /* --------------------------- */
    @media (max-width: 480px) {

      /* 모바일일 때는 flex row + scroll */
      .meal-grid {
        display: flex !important;
        flex-direction: row !important;
        overflow-x: auto !important;
        gap: 10px !important;
        padding-bottom: 8px !important;
        scrollbar-width: none;       /* Firefox */
      }

      .meal-grid::-webkit-scrollbar {
        display: none; /* Chrome/Safari */
      }

      /* 각 급식 카드 고정 너비 */
      .meal-card {
        min-width: 160px !important;
        max-width: 160px !important;
        flex-shrink: 0 !important;
        padding: 12px !important;
        border-radius: 12px !important;
      }

      .meal-date {
        font-size: 13px !important;
        margin-bottom: 4px !important;
      }

      .meal-ul {
        font-size: 12px !important;
        padding-left: 14px !important;
        line-height: 1.45 !important;
      }

      h3 {
        font-size: 16px !important;
      }
    }
  `}
      </style>

      {/* 리스트 */}
      <div
        className="meal-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
        }}
      >
        {weekMeals.map((d, idx) => (
          <div
            key={idx}
            className="meal-card"
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '12px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              border: '1px solid #E1F5FE',
            }}
          >
            <div
              className="meal-date"
              style={{
                fontWeight: 700,
                color: '#0288D1',
                marginBottom: '6px',
                fontSize: '14px',
                textAlign: 'center',
              }}
            >
              {d.label}
            </div>

            {!d.meal && (
              <p
                style={{ fontSize: '12px', color: '#777', textAlign: 'center' }}
              >
                급식 없음
              </p>
            )}

            {d.meal && (
              <ul
                className="meal-ul"
                style={{
                  margin: 0,
                  paddingLeft: '14px',
                  lineHeight: 1.35,
                  fontSize: '13px',
                }}
              >
                {d.meal.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
