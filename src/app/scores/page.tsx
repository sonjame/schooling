'use client'

import { BarChart, Bar } from 'recharts'
import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type SubjectKey =
  | 'korean'
  | 'math'
  | 'english'
  | 'history'
  | 'explore1'
  | 'explore2'
  | 'secondLang'

interface SavedEntry {
  korean?: number | null
  math?: number | null
  english?: number | null
  history?: number | null
  explore1?: number | null
  explore1Name?: string | null
  explore2?: number | null
  explore2Name?: string | null
  secondLang?: number | null
  secondLangName?: string | null
}

export default function ScoresPage() {
  // ---------------------------------------------
  // ⭐ 학년별 모의고사 달
  // ---------------------------------------------
  const gradeMonths: Record<number, string[]> = {
    1: ['3월', '6월', '9월', '10월'],
    2: ['3월', '6월', '9월', '10월'],
    3: ['3월', '5월', '6월', '7월', '9월', '10월', '11월'],
  }

  const [grade, setGrade] = useState<number | null>(null)
  const [months, setMonths] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [showModal, setShowModal] = useState(false)

  // ---------------------------------------------
  // ⭐ 점수 초기 상태
  // ---------------------------------------------
  const emptyScores = { korean: '', math: '', english: '', history: '' }
  const [scores, setScores] = useState(emptyScores)

  // 탐구 관련
  const [explorationArea, setExplorationArea] = useState('')
  const [explorationSubjects, setExplorationSubjects] = useState<string[]>([])
  const [exploreScores, setExploreScores] = useState({ sub1: '', sub2: '' })

  // 제2외국어
  const [secondLang, setSecondLang] = useState('')
  const [secondLangScore, setSecondLangScore] = useState('')

  // 저장된 점수 (현재 학년 기준, 월 → SavedEntry)
  const [savedData, setSavedData] = useState<Record<string, SavedEntry>>({})

  // 그래프: 선택된 과목
  const [selectedSubject, setSelectedSubject] = useState<{
    key: SubjectKey
    label: string
  } | null>(null)

  // 그래프 보기: 꺽은선 형식, 막대 형식 버튼 선택
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')

  // ---------------------------------------------
  // ⭐ 탐구 과목 리스트 (학년별)
  // ---------------------------------------------

  // 1학년
  const firstGradeSubjects = ['통합사회', '통합과학']

  // 2학년
  const secondGradeSocial = [
    '생활과 윤리',
    '윤리와 사상',
    '한국지리',
    '세계지리',
    '동아시아사',
    '세계사',
    '경제',
    '정치와 법',
    '사회·문화',
  ]

  const secondGradeScience = ['물리학I', '화학I', '생명과학I', '지구과학I']

  // 3학년
  const social = [
    '생활과 윤리',
    '윤리와 사상',
    '한국지리',
    '세계지리',
    '동아시아사',
    '세계사',
    '정치와 법',
    '경제',
    '사회·문화',
  ]

  const science = [
    '물리학I',
    '화학I',
    '생명과학I',
    '지구과학I',
    '물리학II',
    '화학II',
    '생명과학II',
    '지구과학II',
  ]

  const vocational = ['농업기초기술', '공업일반', '상업경제', '수산해운']

  const secondLanguages = [
    '독일어',
    '프랑스어',
    '스페인어',
    '중국어',
    '일본어',
    '러시아어',
    '베트남어',
    '아랍어',
  ]

  // ---------------------------------------------
  // ⭐ 탐구 선택 로직
  // ---------------------------------------------
  let subjects: string[] = []

  if (grade === 1) {
    subjects = firstGradeSubjects // 고1
  } else if (grade === 2) {
    subjects =
      explorationArea === '사회탐구' ? secondGradeSocial : secondGradeScience // 고2
  } else if (grade === 3) {
    subjects =
      explorationArea === '사회탐구'
        ? social
        : explorationArea === '과학탐구'
        ? science
        : vocational // 고3
  }

  // 탐구 과목 선택
  const toggleSubject = (s: string) => {
    if (explorationSubjects.includes(s)) {
      setExplorationSubjects(explorationSubjects.filter((v) => v !== s))
      return
    }
    if (explorationSubjects.length >= 2) return
    setExplorationSubjects([...explorationSubjects, s])
  }

  // ---------------------------------------------
  // ⭐ 등급 계산 함수들
  // ---------------------------------------------
  const getRawGrade = (score: string) => {
    if (!score || isNaN(Number(score))) return '-'
    const s = Number(score)
    if (s >= 90) return '1등급'
    if (s >= 80) return '2등급'
    if (s >= 70) return '3등급'
    if (s >= 60) return '4등급'
    if (s >= 50) return '5등급'
    if (s >= 40) return '6등급'
    if (s >= 30) return '7등급'
    if (s >= 20) return '8등급'
    return '9등급'
  }

  const getExploreGrade = (score: string) => {
    if (!score || isNaN(Number(score))) return '-'
    const s = Number(score)
    if (s >= 45) return '1등급'
    if (s >= 40) return '2등급'
    if (s >= 35) return '3등급'
    if (s >= 30) return '4등급'
    if (s >= 25) return '5등급'
    if (s >= 20) return '6등급'
    if (s >= 15) return '7등급'
    if (s >= 10) return '8등급'
    return '9등급'
  }

  const getEnglishGrade = (score: string) => {
    if (!score || isNaN(Number(score))) return '-'
    const s = Number(score)
    if (s >= 90) return '1등급'
    if (s >= 80) return '2등급'
    if (s >= 70) return '3등급'
    if (s >= 60) return '4등급'
    if (s >= 50) return '5등급'
    if (s >= 40) return '6등급'
    if (s >= 30) return '7등급'
    if (s >= 20) return '8등급'
    if (s >= 10) return '9등급'
  }

  const getHistoryGrade = (score: string) => {
    if (!score || isNaN(Number(score))) return '-'
    const s = Number(score)
    if (s >= 40) return '1등급'
    if (s >= 35) return '2등급'
    if (s >= 30) return '3등급'
    if (s >= 25) return '4등급'
    if (s >= 20) return '5등급'
    if (s >= 10) return '6등급'
  }

  const getSecondLangGrade = (score: string) => {
    if (!score || isNaN(Number(score))) return '-'
    const s = Number(score)
    if (s >= 45) return '1등급'
    if (s >= 40) return '2등급'
    if (s >= 35) return '3등급'
    if (s >= 30) return '4등급'
    if (s >= 25) return '5등급'
    return '6등급 이하'
  }

  // ---------------------------------------------
  // ⭐ 저장된 점수 로드 (학년 변경/초기)
  // ---------------------------------------------
  const loadSavedScores = (g: number) => {
    const key = `mock_scores_grade_${g}`
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    const parsed = raw ? JSON.parse(raw) : {}
    setSavedData(parsed)
  }

  // ---------------------------------------------
  // ⭐ 학년 선택 시 전체 초기화 + 저장 데이터 로드
  // ---------------------------------------------
  const handleGradeSelect = (g: number) => {
    setGrade(g)
    setMonths(gradeMonths[g])
    setSelectedMonth('')
    setScores(emptyScores)
    setExplorationArea('')
    setExplorationSubjects([])
    setExploreScores({ sub1: '', sub2: '' })
    setSecondLang('')
    setSecondLangScore('')
    setSelectedSubject(null)
    loadSavedScores(g)
  }

  // ⭐ 월 변경 시 전체 초기화
  const handleMonthSelect = (m: string) => {
    setSelectedMonth(m)
    setScores(emptyScores)
    setExplorationArea('')
    setExplorationSubjects([])
    setExploreScores({ sub1: '', sub2: '' })
    setSecondLang('')
    setSecondLangScore('')
  }

  // ---------------------------------------------
  // ⭐ 점수 저장 (localStorage: 학년별 / 월별)
  // ---------------------------------------------
  const handleSaveScores = () => {
    if (!grade || !selectedMonth) return

    const key = `mock_scores_grade_${grade}`
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    const parsed: Record<string, SavedEntry> = raw ? JSON.parse(raw) : {}

    const entry: SavedEntry = {
      korean: scores.korean ? Number(scores.korean) : null,
      math: scores.math ? Number(scores.math) : null,
      english: scores.english ? Number(scores.english) : null,
      history: scores.history ? Number(scores.history) : null,
      // 탐구
      explore1:
        grade === 1
          ? exploreScores.sub1
            ? Number(exploreScores.sub1)
            : null
          : explorationSubjects[0]
          ? exploreScores.sub1
            ? Number(exploreScores.sub1)
            : null
          : null,
      explore1Name:
        grade === 1
          ? '통합사회'
          : explorationSubjects[0]
          ? explorationSubjects[0]
          : null,
      explore2:
        grade === 1
          ? exploreScores.sub2
            ? Number(exploreScores.sub2)
            : null
          : explorationSubjects[1]
          ? exploreScores.sub2
            ? Number(exploreScores.sub2)
            : null
          : null,
      explore2Name:
        grade === 1
          ? '통합과학'
          : explorationSubjects[1]
          ? explorationSubjects[1]
          : null,
      // 제2외국어
      secondLang:
        grade === 3 && secondLangScore ? Number(secondLangScore) : null,
      secondLangName: grade === 3 && secondLang ? secondLang : null,
    }

    parsed[selectedMonth] = entry

    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(parsed))
    }
    setSavedData(parsed)
    setShowModal(true)
    setTimeout(() => setShowModal(false), 1500)
  }

  // ---------------------------------------------
  // ⭐ 과목별 색상
  // ---------------------------------------------
  const subjectColors: Record<SubjectKey, string> = {
    korean: '#e74c3c', // 빨강
    math: '#3498db', // 파랑
    english: '#2ecc71', // 초록
    history: '#9b59b6', // 보라
    explore1: '#e67e22', // 주황
    explore2: '#f1c40f', // 노랑
    secondLang: '#1abc9c', // 청록
  }

  // ---------------------------------------------
  // ⭐ 그래프용 과목 버튼 목록
  // ---------------------------------------------
  const subjectButtons: { key: SubjectKey; label: string }[] = []
  subjectButtons.push(
    { key: 'korean', label: '국어' },
    { key: 'math', label: '수학' },
    { key: 'english', label: '영어' },
    { key: 'history', label: '한국사' }
  )

  // 탐구 버튼
  if (grade === 1) {
    subjectButtons.push(
      { key: 'explore1', label: '통합사회' },
      { key: 'explore2', label: '통합과학' }
    )
  } else if (grade && grade >= 2) {
    if (explorationSubjects[0]) {
      subjectButtons.push({ key: 'explore1', label: explorationSubjects[0] })
    }
    if (explorationSubjects[1]) {
      subjectButtons.push({ key: 'explore2', label: explorationSubjects[1] })
    }
  }

  // 제2외국어 버튼 (고3만, 데이터가 있거나 현재 선택되어 있으면 표시)
  const hasSecondLangData =
    grade === 3 &&
    (secondLang || Object.values(savedData).some((v) => v.secondLang != null))

  if (grade === 3 && hasSecondLangData) {
    subjectButtons.push({
      key: 'secondLang',
      label: secondLang || '제2외국어',
    })
  }

  // ---------------------------------------------
  // ⭐ 선택된 과목의 월별 점수 그래프 데이터
  // ---------------------------------------------
  const chartData =
    grade && selectedSubject
      ? (gradeMonths[grade]
          .map((month) => {
            const entry = savedData[month]
            if (!entry) return null

            let value: number | null = null
            switch (selectedSubject.key) {
              case 'korean':
                value = entry.korean ?? null
                break
              case 'math':
                value = entry.math ?? null
                break
              case 'english':
                value = entry.english ?? null
                break
              case 'history':
                value = entry.history ?? null
                break
              case 'explore1':
                // 같은 과목 이름일 때만 포함
                if (entry.explore1Name === selectedSubject.label) {
                  value = entry.explore1 ?? null
                }
                break
              case 'explore2':
                if (entry.explore2Name === selectedSubject.label) {
                  value = entry.explore2 ?? null
                }
                break
              case 'secondLang':
                if (entry.secondLangName === selectedSubject.label) {
                  value = entry.secondLang ?? null
                }
                break
            }

            if (value == null) return null
            return { name: month, score: value }
          })
          .filter(Boolean) as { name: string; score: number }[])
      : []

  return (
    <div className="page-wrap">
      <h1 className="title">모의고사 성적 계산기</h1>
      <p className="subtitle">원점수 기준 등급을 확인하세요</p>

      {/* 학년 선택 */}
      <div className="grade-tabs">
        {[1, 2, 3].map((g) => (
          <button
            key={g}
            className={`grade-btn ${grade === g ? 'active' : ''}`}
            onClick={() => handleGradeSelect(g)}
          >
            {g}학년
          </button>
        ))}
      </div>

      {/* 월 선택 */}
      {grade && (
        <div className="month-tabs">
          {months.map((m) => (
            <button
              key={m}
              className={`month-btn ${selectedMonth === m ? 'active' : ''}`}
              onClick={() => handleMonthSelect(m)}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {/* 안내 */}
      {!selectedMonth && grade && (
        <p style={{ marginTop: 20, color: '#666' }}>
          모의고사 월을 선택해주세요.
        </p>
      )}

      {/* ---------------------------- */}
      {/* 점수 입력 영역 */}
      {/* ---------------------------- */}
      {selectedMonth && (
        <div className="grid">
          {/* 왼쪽 입력 */}
          <div className="card">
            <h2 className="section-title">필수 과목</h2>

            <div className="input-group">
              <div className="input-box">
                <label>국어 (100점)</label>
                <input
                  type="number"
                  value={scores.korean}
                  onChange={(e) =>
                    setScores({ ...scores, korean: e.target.value })
                  }
                />
              </div>

              <div className="input-box">
                <label>수학 (100점)</label>
                <input
                  type="number"
                  value={scores.math}
                  onChange={(e) =>
                    setScores({ ...scores, math: e.target.value })
                  }
                />
              </div>

              <div className="input-box">
                <label>영어 (100점)</label>
                <input
                  type="number"
                  value={scores.english}
                  onChange={(e) =>
                    setScores({ ...scores, english: e.target.value })
                  }
                />
              </div>

              <div className="input-box">
                <label>한국사 (50점)</label>
                <input
                  type="number"
                  value={scores.history}
                  onChange={(e) =>
                    setScores({ ...scores, history: e.target.value })
                  }
                />
              </div>
            </div>

            {/* ---------------------------------- */}
            {/* 탐구 영역 - 학년별 다르게 표시 */}
            {/* ---------------------------------- */}
            {grade === 1 && (
              <>
                <h2 className="section-title" style={{ marginTop: 30 }}>
                  탐구 영역 (필수)
                </h2>

                <div className="input-box">
                  <label>통합사회 (50점)</label>
                  <input
                    type="number"
                    value={exploreScores.sub1}
                    onChange={(e) =>
                      setExploreScores({
                        ...exploreScores,
                        sub1: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="input-box" style={{ marginTop: 10 }}>
                  <label>통합과학 (50점)</label>
                  <input
                    type="number"
                    value={exploreScores.sub2}
                    onChange={(e) =>
                      setExploreScores({
                        ...exploreScores,
                        sub2: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )}

            {grade === 2 && (
              <>
                <h2 className="section-title" style={{ marginTop: 30 }}>
                  탐구 영역
                </h2>

                <div className="explore-tabs">
                  {['사회탐구', '과학탐구'].map((area) => (
                    <button
                      key={area}
                      className={`explore-btn ${
                        explorationArea === area ? 'active' : ''
                      }`}
                      onClick={() => {
                        setExplorationArea(area)
                        setExplorationSubjects([])
                        setExploreScores({ sub1: '', sub2: '' })
                      }}
                    >
                      {area}
                    </button>
                  ))}
                </div>

                {explorationArea && (
                  <div className="subject-scroll">
                    {subjects.map((s) => (
                      <label key={s} className="subject-item">
                        <input
                          type="checkbox"
                          checked={explorationSubjects.includes(s)}
                          onChange={() => toggleSubject(s)}
                        />
                        {s}
                      </label>
                    ))}
                  </div>
                )}
              </>
            )}

            {grade === 3 && (
              <>
                <h2 className="section-title" style={{ marginTop: 30 }}>
                  탐구 영역
                </h2>

                <div className="explore-tabs">
                  {['사회탐구', '과학탐구', '직업탐구'].map((area) => (
                    <button
                      key={area}
                      className={`explore-btn ${
                        explorationArea === area ? 'active' : ''
                      }`}
                      onClick={() => {
                        setExplorationArea(area)
                        setExplorationSubjects([])
                        setExploreScores({ sub1: '', sub2: '' })
                      }}
                    >
                      {area}
                    </button>
                  ))}
                </div>

                {explorationArea && (
                  <div className="subject-scroll">
                    {subjects.map((s) => (
                      <label key={s} className="subject-item">
                        <input
                          type="checkbox"
                          checked={explorationSubjects.includes(s)}
                          onChange={() => toggleSubject(s)}
                        />
                        {s}
                      </label>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* 탐구 점수 입력 (2~3학년) */}
            {explorationSubjects.length > 0 && grade !== 1 && (
              <div style={{ marginTop: 20 }}>
                <h3 className="section-title">탐구 점수 입력 (50점)</h3>

                {explorationSubjects[0] && (
                  <div className="input-box">
                    <label>{explorationSubjects[0]}</label>
                    <input
                      type="number"
                      value={exploreScores.sub1}
                      onChange={(e) =>
                        setExploreScores({
                          ...exploreScores,
                          sub1: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                {explorationSubjects[1] && (
                  <div className="input-box" style={{ marginTop: 10 }}>
                    <label>{explorationSubjects[1]}</label>
                    <input
                      type="number"
                      value={exploreScores.sub2}
                      onChange={(e) =>
                        setExploreScores({
                          ...exploreScores,
                          sub2: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>
            )}

            {/* 제2외국어 - 고3만 */}
            {grade === 3 && (
              <>
                <h2 className="section-title" style={{ marginTop: 30 }}>
                  제2외국어 / 한문
                </h2>

                <div className="subject-scroll small">
                  {secondLanguages.map((lang) => (
                    <label key={lang} className="subject-item">
                      <input
                        type="radio"
                        name="secondLang"
                        checked={secondLang === lang}
                        onChange={() => {
                          setSecondLang(lang)
                          setSecondLangScore('')
                        }}
                      />
                      {lang}
                    </label>
                  ))}
                </div>

                {secondLang && (
                  <div className="input-box" style={{ marginTop: 15 }}>
                    <label>{secondLang} (50점)</label>
                    <input
                      type="number"
                      value={secondLangScore}
                      onChange={(e) => setSecondLangScore(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}

            {/* 점수 저장 버튼 */}
            <button
              style={{
                marginTop: 20,
                padding: '12px 20px',
                borderRadius: 8,
                background: '#4d8dff',
                color: '#fff',
              }}
              onClick={handleSaveScores}
            >
              점수 저장
            </button>
          </div>

          {/* 오른쪽 결과 */}
          <div className="card result">
            <h2 className="section-title">{selectedMonth} 모의고사 결과</h2>

            <div className="result-table">
              <table>
                <thead>
                  <tr>
                    <th>과목</th>
                    <th>점수</th>
                    <th>등급</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>국어</td>
                    <td>{scores.korean || '-'}</td>
                    <td>{getRawGrade(scores.korean)}</td>
                  </tr>

                  <tr>
                    <td>수학</td>
                    <td>{scores.math || '-'}</td>
                    <td>{getRawGrade(scores.math)}</td>
                  </tr>

                  <tr>
                    <td>영어</td>
                    <td>{scores.english || '-'}</td>
                    <td>{getEnglishGrade(scores.english)}</td>
                  </tr>

                  <tr>
                    <td>한국사</td>
                    <td>{scores.history || '-'}</td>
                    <td>{getHistoryGrade(scores.history)}</td>
                  </tr>

                  {/* 1학년 탐구 */}
                  {grade === 1 && (
                    <>
                      <tr>
                        <td>통합사회</td>
                        <td>{exploreScores.sub1 || '-'}</td>
                        <td>{getExploreGrade(exploreScores.sub1)}</td>
                      </tr>

                      <tr>
                        <td>통합과학</td>
                        <td>{exploreScores.sub2 || '-'}</td>
                        <td>{getExploreGrade(exploreScores.sub2)}</td>
                      </tr>
                    </>
                  )}

                  {/* 2~3학년 탐구 */}
                  {grade !== 1 && explorationSubjects[0] && (
                    <tr>
                      <td>{explorationSubjects[0]}</td>
                      <td>{exploreScores.sub1 || '-'}</td>
                      <td>{getExploreGrade(exploreScores.sub1)}</td>
                    </tr>
                  )}

                  {grade !== 1 && explorationSubjects[1] && (
                    <tr>
                      <td>{explorationSubjects[1]}</td>
                      <td>{exploreScores.sub2 || '-'}</td>
                      <td>{getExploreGrade(exploreScores.sub2)}</td>
                    </tr>
                  )}

                  {/* 제2외국어 */}
                  {grade === 3 && secondLang && (
                    <tr>
                      <td>{secondLang}</td>
                      <td>{secondLangScore || '-'}</td>
                      <td>{getSecondLangGrade(secondLangScore)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* 📊 과목별 성적 변화 그래프 (페이지 맨 아래 카드) */}
      {/* ===================================================== */}
      {grade && (
        <div className="card" style={{ marginTop: 40 }}>
          <h2 className="section-title">과목별 성적 변화 그래프</h2>

          {/* 과목 선택 버튼들 */}
          <div
            style={{
              marginTop: 12,
              marginBottom: 16,
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            {subjectButtons.map((btn) => (
              <button
                key={`${btn.key}-${btn.label}`}
                onClick={() => setSelectedSubject(btn)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  border:
                    selectedSubject?.key === btn.key &&
                    selectedSubject?.label === btn.label
                      ? `2px solid ${subjectColors[btn.key]}`
                      : '1px solid #ddd',
                  background:
                    selectedSubject?.key === btn.key &&
                    selectedSubject?.label === btn.label
                      ? '#f5f9ff'
                      : '#fff',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              onClick={() => setChartType('line')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border:
                  chartType === 'line' ? '2px solid #4d8dff' : '1px solid #ccc',
                background: chartType === 'line' ? '#eef4ff' : '#fff',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              꺾은선 그래프
            </button>

            <button
              onClick={() => setChartType('bar')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border:
                  chartType === 'bar' ? '2px solid #4d8dff' : '1px solid #ccc',
                background: chartType === 'bar' ? '#eef4ff' : '#fff',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              막대 그래프
            </button>
          </div>

          {/* 그래프 영역 */}
          {selectedSubject && chartData.length > 0 ? (
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                {chartType === 'line' ? (
                  /* ----------------------- */
                  /*      ❗ Line Chart      */
                  /* ----------------------- */
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      domain={[
                        0,
                        [
                          'history',
                          'explore1',
                          'explore2',
                          'secondLang',
                        ].includes(selectedSubject.key)
                          ? 50
                          : 100,
                      ]}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke={subjectColors[selectedSubject.key]}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                ) : (
                  /* ----------------------- */
                  /*      ❗ Bar Chart       */
                  /* ----------------------- */
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      domain={[
                        0,
                        [
                          'history',
                          'explore1',
                          'explore2',
                          'secondLang',
                        ].includes(selectedSubject.key)
                          ? 50
                          : 100,
                      ]}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="score"
                      fill={subjectColors[selectedSubject.key]}
                      radius={[6, 6, 0, 0]}
                      barSize={25}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ marginTop: 10, color: '#888', fontSize: 13 }}>
              {selectedSubject
                ? '선택한 과목의 저장된 성적이 아직 없습니다. 점수를 입력하고 "점수 저장"을 눌러주세요.'
                : '그래프를 보고 싶은 과목을 위에서 선택해주세요.'}
            </p>
          )}
        </div>
      )}

      {/* --------------------------------------------- */}
      {/* 반응형 스타일 */}
      {/* --------------------------------------------- */}
      <style jsx>{`
        .page-wrap {
          font-family: 'Noto Sans KR', sans-serif;
          background: #ffffff;
          min-height: 100vh;
          padding: 40px;
          margin: 20px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .title {
          font-size: clamp(22px, 4vw, 32px);
          font-weight: 700;
        }

        .subtitle {
          margin-top: 6px;
          color: #666;
          font-size: clamp(14px, 1.8vw, 18px);
        }

        .grade-tabs,
        .month-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 20px;
          margin-bottom: 20px;
        }

        .grade-btn,
        .month-btn {
          padding: 8px 14px;
          background: white;
          border: 1px solid #ccc;
          border-radius: 6px;
          cursor: pointer;
          font-size: clamp(12px, 1.6vw, 15px);
          white-space: nowrap; /* ⭐ 버튼 텍스트 줄바꿈 방지 */
          flex: 0 0 auto; /* ⭐ 줄어드는 것 방지 */
        }

        .grade-btn.active,
        .month-btn.active {
          background: #4d8dff;
          color: white;
          border-color: #4d8dff;
        }

        /* PC: 2 컬럼 */
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        /* 모바일: 1 컬럼 */
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
          }

          .card {
            margin-bottom: 20px;
          }

          .result {
            order: 99;
          }
        }

        .card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .section-title {
          font-size: clamp(16px, 2vw, 20px);
          font-weight: 700;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-top: 10px;
        }

        .input-box label {
          display: block;
          margin-bottom: 4px;
          font-size: clamp(12px, 1.6vw, 16px);
          font-weight: 500;
        }

        .input-box input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }

        .explore-tabs {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .explore-btn {
          padding: 10px 16px;
          background: white;
          border: 1px solid #ccc;
          border-radius: 6px;
          cursor: pointer;
          font-size: clamp(12px, 1.6vw, 16px);
        }

        .explore-btn.active {
          background: #4d8dff;
          color: white;
        }

        .subject-scroll {
          margin-top: 12px;
          border: 1px solid #ddd;
          padding: 12px;
          border-radius: 8px;
          max-height: 180px;
          overflow-y: auto;
        }

        .subject-scroll.small {
          max-height: 130px;
        }

        .subject-item {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
          font-size: clamp(12px, 1.6vw, 16px);
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: clamp(12px, 1.4vw, 16px);
        }

        th,
        td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: center;
        }

        th {
          background: #f0f0f0;
        }

        /* 모달 전체 배경 */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        /* 모달 박스 */
        .modal-box {
          background: #ffffff;
          padding: 22px 28px;
          border-radius: 12px;
          border: 2px solid #4d8dff; /* 기본 블루 */
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
          text-align: center;
          animation: fadeIn 0.25s ease-out;
        }

        /* 체크 아이콘 */
        .modal-icon {
          font-size: 32px;
          font-weight: bold;
          color: #4d8dff;
          margin-bottom: 8px;
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
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">✔</div>
            <p>점수가 저장되었습니다!</p>
          </div>
        </div>
      )}
    </div>
  )
}
