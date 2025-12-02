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
//  학교 데이터 (교육청코드 + 학교코드)
// ---------------------------
const SCHOOL_DATA: Record<string, { edu: string; code: string }> = {
  양주고등학교: { edu: 'J10', code: '7580167' },
  덕계고등학교: { edu: 'J10', code: '7531116' },
  회천고등학교: { edu: 'J10', code: '7620312' },
}

// ---------------------------
//  급식 API 불러오기 함수 (단일 날짜 조회)
// ---------------------------
async function fetchMeal(date: string, eduCode: string, schoolCode: string) {
  const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=109e3660c3624bf5a4803631891234ef&Type=json&ATPT_OFCDC_SC_CODE=J10&SD_SCHUL_CODE=7531116&MLSV_YMD=${date}`

  try {
    const res = await fetch(url)
    const data = await res.json()

    if (!data.mealServiceDietInfo) return null

    const raw = data.mealServiceDietInfo[1].row[0].DDISH_NM as string

    // 1) 먼저 <br/> 기준으로 줄 나누기
    const lines = raw.split('<br/>')

    // 2) 각 줄에서 번호 / 괄호 제거 + 정리
    const cleanedLines = lines
      .map((line) =>
        line
          .replace(/[①-⑳]/g, '') // ①~⑳ 제거 (혹시 있을 경우)
          .replace(/\(\s?[0-9.]+\s?\)/g, '') // (1.2.6.13) 같은 알레르기 번호 제거
          .replace(/-\s*$/g, '') // 라인 끝의 '-' 제거 (잡곡밥- → 잡곡밥)
          .replace(/\s+/g, ' ') // 중복 공백 정리
          .trim()
      )
      .filter((line) => line.length > 0) // 빈 줄 제거

    // 🔙 UI에서는 string[] 으로 사용
    return cleanedLines
  } catch {
    return null
  }
}

// ---------------------------
//  이번 주 월~금 날짜 구하기
// ---------------------------
function getWeekDates() {
  const today = new Date()

  // 한국 시간 기준으로 변환
  const kr = new Date(today.getTime() + 9 * 60 * 60 * 1000)
  const day = kr.getDay() // 0: 일, 1: 월...
  const monday = new Date(kr)
  monday.setDate(kr.getDate() - (day === 0 ? 6 : day - 1))

  const dates = []
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)

    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')

    dates.push({
      key: `${y}${m}${dd}`,
      label: `${m}/${dd}`,
    })
  }

  return dates
}

// ---------------------------
//  메인 컴포넌트
// ---------------------------
export default function WeeklyMealPage() {
  const [weekMeals, setWeekMeals] = useState<
    { date: string; label: string; meal: string[] | null }[]
  >([])
  const [loading, setLoading] = useState(true)

  const [eduCode, setEduCode] = useState('J10')
  const [schoolCode, setSchoolCode] = useState('7580167')

  useEffect(() => {
    loadGoogleResources()

    const userSchool = localStorage.getItem('userSchool')
    if (userSchool && SCHOOL_DATA[userSchool]) {
      setEduCode(SCHOOL_DATA[userSchool].edu)
      setSchoolCode(SCHOOL_DATA[userSchool].code)
    }

    const dates = getWeekDates()
    Promise.all(
      dates.map(async (d) => {
        const meal = await fetchMeal(d.key, eduCode, schoolCode)
        return { date: d.key, label: d.label, meal }
      })
    ).then((results) => {
      setWeekMeals(results)
      setLoading(false)
    })
  }, [eduCode, schoolCode])

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
