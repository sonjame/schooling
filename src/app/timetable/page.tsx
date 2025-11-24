'use client'
import { useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'

interface ClassItem {
  day: string
  period: number
  subject: string
  teacher: string
  room: string
}

const DEFAULT_SUBJECTS = [
  '국어',
  '수학',
  '영어',
  '통합과학',
  '과학탐구실험',
  '통합사회',
  '체육',
  '음악',
  '미술',
  '자율학습',
  '한국사',
]

// 기본 과목 색상
const SUBJECT_COLORS: Record<string, string> = {
  국어: '#FFCDD2',
  수학: '#BBDEFB',
  영어: '#C8E6C9',
  통합과학: '#D1C4E9',
  과학탐구실험: '#D1C4E9',
  통합사회: '#FFE0B2',
  체육: '#B3E5FC',
  음악: '#F8BBD0',
  미술: '#DCEDC8',
  자율학습: '#FFF9C4',
  한국사: '#E0E0E0',
}

// ✔ 랜덤 파스텔 색 생성
const generatePastelColor = () => {
  return `hsl(${Math.floor(Math.random() * 360)}, 70%, 85%)`
}

// ✔ 과목 색상 (localStorage 저장하여 재사용)
const getSubjectColor = (subject: string) => {
  if (SUBJECT_COLORS[subject]) return SUBJECT_COLORS[subject]

  const saved = localStorage.getItem(`subject-color-${subject}`)
  if (saved) return saved

  const newColor = generatePastelColor()
  localStorage.setItem(`subject-color-${subject}`, newColor)
  return newColor
}

const DAYS = ['월', '화', '수', '목', '금']
const PERIODS = Array.from({ length: 12 }, (_, i) => i + 1)

export default function TimetablePage() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [edit, setEdit] = useState<ClassItem | null>(null)

  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState({
    day: '월',
    start: 1,
    end: 1,
    subject: '',
    teacher: '',
    room: '',
  })

  const tableRef = useRef<HTMLDivElement>(null)

  /* ----------------- 초기 로드 ----------------- */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('timetable')
      if (saved) setClasses(JSON.parse(saved))
    } catch {
      setClasses([])
    }
  }, [])

  const save = (next: ClassItem[]) => {
    setClasses(next)
    localStorage.setItem('timetable', JSON.stringify(next))
  }

  /* ----------------- 셀 클릭 시 수정 ----------------- */
  const openEdit = (day: string, period: number) => {
    const existing = classes.find((c) => c.day === day && c.period === period)
    setEdit(existing ?? { day, period, subject: '', teacher: '', room: '' })
  }

  const saveEdit = () => {
    if (!edit) return

    if (!edit.subject.trim()) {
      const filtered = classes.filter(
        (c) => !(c.day === edit.day && c.period === edit.period)
      )
      save(filtered)
      setEdit(null)
      return
    }

    const filtered = classes.filter(
      (c) => !(c.day === edit.day && c.period === edit.period)
    )
    save([...filtered, edit])
    setEdit(null)
  }

  const deleteEdit = () => {
    if (!edit) return
    const filtered = classes.filter(
      (c) => !(c.day === edit.day && c.period === edit.period)
    )
    save(filtered)
    setEdit(null)
  }

  /* ----------------- 수업 추가 ----------------- */
  const saveAdd = () => {
    const { day, start, end, subject, teacher, room } = addForm

    if (!subject.trim()) return alert('과목을 입력하거나 선택해주세요.')
    if (end < start) return alert('종료 교시는 시작 교시보다 앞설 수 없습니다.')

    let next = [...classes]

    for (let p = start; p <= end; p++) {
      next = next.filter((c) => !(c.day === day && c.period === p))
      next.push({ day, period: p, subject, teacher, room })
    }

    save(next)
    setAddOpen(false)
  }

  /* ----------------- 이미지 저장 ----------------- */
  const exportImage = async () => {
    if (!tableRef.current) return

    const canvas = await html2canvas(tableRef.current, {
      scale: 2,
      width: 1000,
      windowWidth: 1000,
      backgroundColor: '#ffffff',
    })

    const link = document.createElement('a')
    const yyyy = new Date().getFullYear()
    const mm = String(new Date().getMonth() + 1).padStart(2, '0')
    const dd = String(new Date().getDate()).padStart(2, '0')

    link.download = `${yyyy}-${mm}-${dd}_시간표.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  /* ==========================================================
      화면 출력
  ========================================================== */
  return (
    <div style={wrap}>
      <h2 style={title}>🕑 시간표 관리</h2>

      <div style={toolbar}>
        <button style={btn('#4FC3F7')} onClick={() => setAddOpen(true)}>
          ➕ 수업 추가하기
        </button>
        <button style={btn('#81C784')} onClick={exportImage}>
          📸 시간표 저장 (이미지)
        </button>
      </div>

      <div
        ref={tableRef}
        style={{
          width: '100%', // 모바일에서는 100%
          maxWidth: '1000px', // 데스크탑까지는 1000px
          margin: '0 auto',
          overflowX: 'auto', // 혹시 초과하면 부드럽게 스크롤
        }}
      >
        <table style={tableCss}>
          <thead>
            <tr>
              <th style={th}>교시</th>
              {DAYS.map((d) => (
                <th key={d} style={th}>
                  {d}요일
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {PERIODS.map((p) => (
              <tr key={p}>
                <td style={periodTh}>{p}교시</td>

                {DAYS.map((d) => {
                  const cell = classes.find(
                    (c) => c.day === d && c.period === p
                  )

                  const bg = cell ? getSubjectColor(cell.subject) : '#f8f8f8'

                  return (
                    <td
                      key={d}
                      onClick={() => openEdit(d, p)}
                      style={{
                        border: '1px solid #000',
                        height: 70,
                        background: bg,
                        cursor: 'pointer',
                        verticalAlign: 'middle',
                      }}
                    >
                      {cell ? (
                        <div>
                          <strong
                            style={{
                              fontSize: 'clamp(10px, 1.4vw, 16px)',
                            }}
                          >
                            {cell.subject}
                          </strong>
                          <div
                            style={{
                              fontSize: 'clamp(8px, 1.2vw, 14px)',
                              color: '#444',
                            }}
                          >
                            {cell.teacher}
                          </div>
                          <div
                            style={{
                              fontSize: 'clamp(8px, 1.2vw, 14px)',
                              color: '#777',
                            }}
                          >
                            {cell.room}
                          </div>
                        </div>
                      ) : (
                        <span
                          style={{
                            color: '#BBB',
                            fontSize: 'clamp(12px, 2vw, 20px)',
                          }}
                        >
                          +
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ----------------- 수업 추가 모달 ----------------- */}
      {addOpen && (
        <Modal onClose={() => setAddOpen(false)} title="📘 수업 추가">
          <Row label="요일">
            <select
              value={addForm.day}
              onChange={(e) => setAddForm({ ...addForm, day: e.target.value })}
              style={inputCss}
            >
              {DAYS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Row>

          <Row label="시작교시">
            <select
              value={addForm.start}
              onChange={(e) =>
                setAddForm({ ...addForm, start: Number(e.target.value) })
              }
              style={inputCss}
            >
              {PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p}교시
                </option>
              ))}
            </select>
          </Row>

          <Row label="종료교시">
            <select
              value={addForm.end}
              onChange={(e) =>
                setAddForm({ ...addForm, end: Number(e.target.value) })
              }
              style={inputCss}
            >
              {PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p}교시
                </option>
              ))}
            </select>
          </Row>

          {/* 과목 */}
          <Row label="과목">
            <div style={{ display: 'flex', gap: 6, width: '79%' }}>
              <select
                value={
                  DEFAULT_SUBJECTS.includes(addForm.subject)
                    ? addForm.subject
                    : ''
                }
                onChange={(e) =>
                  setAddForm({ ...addForm, subject: e.target.value })
                }
                style={{ ...inputCss, flex: 1 }}
              >
                <option value="">과목 선택</option>
                {DEFAULT_SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="직접 입력"
                value={
                  !DEFAULT_SUBJECTS.includes(addForm.subject)
                    ? addForm.subject
                    : ''
                }
                onChange={(e) =>
                  setAddForm({ ...addForm, subject: e.target.value })
                }
                style={{ ...inputCss, flex: 1, width: '85%' }}
              />
            </div>
          </Row>

          <Row label="교사명">
            <input
              type="text"
              style={inputCss}
              value={addForm.teacher}
              placeholder="예: 김선생"
              onChange={(e) =>
                setAddForm({ ...addForm, teacher: e.target.value })
              }
            />
          </Row>

          <Row label="교실">
            <input
              type="text"
              style={inputCss}
              value={addForm.room}
              placeholder="예: 2-3"
              onChange={(e) => setAddForm({ ...addForm, room: e.target.value })}
            />
          </Row>

          <div style={modalButtons}>
            <button style={btn('#4FC3F7')} onClick={saveAdd}>
              저장
            </button>
            <button style={btn('#B0BEC5')} onClick={() => setAddOpen(false)}>
              닫기
            </button>
          </div>
        </Modal>
      )}

      {/* ----------------- 수정 모달 ----------------- */}
      {edit && (
        <Modal
          onClose={() => setEdit(null)}
          title={`✏️ ${edit.day}요일 ${edit.period}교시`}
        >
          <Row label="과목">
            <div style={{ display: 'flex', gap: 6, width: '79%' }}>
              <select
                value={
                  DEFAULT_SUBJECTS.includes(edit.subject) ? edit.subject : ''
                }
                onChange={(e) => setEdit({ ...edit, subject: e.target.value })}
                style={{ ...inputCss, flex: 0.9, padding: '6px 8px' }}
              >
                <option value="">과목 선택</option>
                {DEFAULT_SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="직접 입력"
                value={
                  !DEFAULT_SUBJECTS.includes(edit.subject) ? edit.subject : ''
                }
                onChange={(e) => setEdit({ ...edit, subject: e.target.value })}
                style={{ ...inputCss, flex: 1, width: '75%' }}
              />
            </div>
          </Row>

          <Row label="교사명">
            <input
              type="text"
              style={inputCss}
              value={edit.teacher}
              placeholder="예: 김선생"
              onChange={(e) => setEdit({ ...edit, teacher: e.target.value })}
            />
          </Row>

          <Row label="장소">
            <input
              type="text"
              style={inputCss}
              value={edit.room}
              placeholder="예: 2-3"
              onChange={(e) => setEdit({ ...edit, room: e.target.value })}
            />
          </Row>

          <div style={modalButtons}>
            <button style={btn('#4FC3F7')} onClick={saveEdit}>
              저장
            </button>
            <button style={btn('#E57373')} onClick={deleteEdit}>
              삭제
            </button>
            <button style={btn('#B0BEC5')} onClick={() => setEdit(null)}>
              닫기
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ----------------- 공통 컴포넌트 ----------------- */

function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div style={overlay}>
      <div style={modalBox}>
        <h3 style={modalTitle}>{title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {children}
        </div>
      </div>
      <div onClick={onClose} />
    </div>
  )
}

function Row({ label, children }: { label: string; children: any }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <label style={labelCss}>{label}</label>
      {children}
    </div>
  )
}

/* ----------------- 스타일 ----------------- */

const wrap: React.CSSProperties = {
  maxWidth: 1000,
  margin: '40px auto',
  background: 'white',
  borderRadius: 16,
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  padding: 30,
}

const title: React.CSSProperties = {
  fontSize: 'clamp(20px, 3vw, 30px)',
  fontWeight: 700,
  color: '#4FC3F7',
  marginBottom: 20,
}

const toolbar: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 10,
}

const tableCss: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  tableLayout: 'fixed',
  textAlign: 'center',
}

const th: React.CSSProperties = {
  padding: 8,
  background: '#E3F2FD',
  border: '1px solid #E0E0E0',
  fontWeight: 600,
  fontSize: 'clamp(12px, 1.8vw, 18px)',
}

const periodTh: React.CSSProperties = {
  ...th,
  fontWeight: 700,
  background: '#E3F2FD',
}

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 100,
}

const modalBox: React.CSSProperties = {
  background: 'white',
  borderRadius: 12,
  padding: 20,
  width: 360,
  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
}

const modalTitle: React.CSSProperties = {
  fontWeight: 700,
  color: '#0277BD',
  marginBottom: 12,
  textAlign: 'center',
  fontSize: 'clamp(16px, 2vw, 26px)',
}

const modalButtons: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: 10,
  marginTop: 8,
}

const labelCss: React.CSSProperties = {
  width: 70,
  textAlign: 'right',
  fontWeight: 600,
  color: '#333',
  fontSize: 'clamp(10px, 1.6vw, 16px)',
}

const inputCss: React.CSSProperties = {
  flex: 1,
  padding: '6px 8px',
  border: '1px solid #bbb',
  borderRadius: 6,
  outline: 'none',
  fontSize: 'clamp(10px, 1.4vw, 16px)',
}

const btn = (color: string): React.CSSProperties => ({
  background: color,
  color: 'white',
  border: 'none',
  borderRadius: 6,
  padding: '8px 14px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 'clamp(10px, 1.6vw, 16px)',
})
