"use client";

import { useState, useEffect, FormEvent, MouseEvent } from "react";

type DayCell = {
  day: number | null;
  key: string | null;
};

type TimeMemo = {
  start: string;
  end: string;
  text: string;
};

type MemoMap = Record<string, TimeMemo[]>;

type Holiday = {
  date: string; // "YYYY-MM-DD"
  name: string; // 예: "추석", "어린이날"
};

type Period = {
  id: number;
  label: string; // 예: "수행평가 기간", "중간고사 기간"
  start: string; // "YYYY-MM-DD"
  end: string; // "YYYY-MM-DD"
  color: string; // 기간 표시 선 색상
};

type CalendarEvent = {
  date: string; // "YYYY-MM-DD"
  title: string; // 일정 제목
};

// 🔐 localStorage 키 모음 (HomePage와 맞추기)
const STORAGE_KEYS = {
  memos: "calendar_memos",
  colors: "calendar_colors",
  titles: "calendar_titles",
  contents: "calendar_contents",
  periods: "calendar_periods",
  events: "calendarEvents", // Home 페이지에서 읽는 키

  // ✅ 뷰 상태 유지용 키
  viewYear: "calendar_view_year",
  viewMonth: "calendar_view_month",
  selectedDate: "calendar_selected_date",
  contextDate: "calendar_context_date",
};

// 📦 날짜 메모/기간 → Home에서 사용할 events 배열로 변환
function buildCalendarEvents(
  dateNoteTitles: Record<string, string>,
  dateNoteContents: Record<string, string[]>,
  periods: Period[]
): CalendarEvent[] {
  const map: Record<string, string[]> = {};

  // 1) 날짜 메모 제목
  for (const [date, title] of Object.entries(dateNoteTitles)) {
    const t = title.trim();
    if (!t) continue;
    if (!map[date]) map[date] = [];
    map[date].push(t);
  }

  // 2) 날짜 메모 내용
  for (const [date, list] of Object.entries(dateNoteContents)) {
    for (const raw of list) {
      const t = raw.trim();
      if (!t) continue;
      if (!map[date]) map[date] = [];
      map[date].push(t);
    }
  }

  // 3) 기간 (시작일 기준으로만 넣음)
  for (const p of periods) {
    const t = p.label.trim();
    if (!t || !p.start) continue;
    if (!map[p.start]) map[p.start] = [];
    if (!map[p.start].includes(t)) map[p.start].push(t);
  }

  const events: CalendarEvent[] = [];
  for (const [date, titles] of Object.entries(map)) {
    const uniq = Array.from(new Set(titles));
    for (const t of uniq) {
      events.push({ date, title: t });
    }
  }
  return events;
}

function getHolidayFromMap(
  holidayMap: Record<string, Holiday>,
  dateKey: string | null
): Holiday | undefined {
  if (!dateKey) return undefined;
  return holidayMap[dateKey];
}

export default function CalendarPage() {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0 ~ 11
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [contextDate, setContextDate] = useState<string | null>(null);

  const [memos, setMemos] = useState<MemoMap>({});
  const [customColors, setCustomColors] = useState<Record<string, string>>({});

  const [dateNoteTitles, setDateNoteTitles] = useState<Record<string, string>>(
    {}
  );
  const [dateNoteContents, setDateNoteContents] = useState<
    Record<string, string[]>
  >({});

  const [dateNoteTitleInput, setDateNoteTitleInput] = useState("");
  const [dateNoteContentInput, setDateNoteContentInput] = useState("");

  const [periodLabelInput, setPeriodLabelInput] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [periodColorInput, setPeriodColorInput] = useState("#ffa000"); // 기본 기간 색
  const [periods, setPeriods] = useState<Period[]>([]);

  const [memoStartTime, setMemoStartTime] = useState("08:00");
  const [memoEndTime, setMemoEndTime] = useState("09:00");
  const [memoText, setMemoText] = useState("");

  const [holidayMap, setHolidayMap] = useState<Record<string, Holiday>>({});
  const [holidayLoading, setHolidayLoading] = useState(false);

  // 🔑 localStorage 로드 완료 여부
  const [loaded, setLoaded] = useState(false);

  // 오늘 날짜 키
  const todayKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // ✅ 페이지 처음 들어올 때 localStorage에서 일정 + 뷰 상태 로드
  useEffect(() => {
    try {
      // 🧭 뷰 상태 복원 (연/월/선택날짜/컨텍스트 날짜)
      const savedYear = localStorage.getItem(STORAGE_KEYS.viewYear);
      const savedMonth = localStorage.getItem(STORAGE_KEYS.viewMonth);
      const savedSelectedDate = localStorage.getItem(STORAGE_KEYS.selectedDate);
      const savedContextDate = localStorage.getItem(STORAGE_KEYS.contextDate);

      if (savedYear && !Number.isNaN(parseInt(savedYear, 10))) {
        setYear(parseInt(savedYear, 10));
      }
      if (savedMonth && !Number.isNaN(parseInt(savedMonth, 10))) {
        setMonth(parseInt(savedMonth, 10));
      }
      if (savedSelectedDate) {
        setSelectedDate(savedSelectedDate);
      }
      if (savedContextDate) {
        setContextDate(savedContextDate);
      }

      // 🗂 일정 관련 데이터들 복원
      const savedMemos = localStorage.getItem(STORAGE_KEYS.memos);
      const savedColors = localStorage.getItem(STORAGE_KEYS.colors);
      const savedTitles = localStorage.getItem(STORAGE_KEYS.titles);
      const savedContents = localStorage.getItem(STORAGE_KEYS.contents);
      const savedPeriods = localStorage.getItem(STORAGE_KEYS.periods);

      if (savedMemos) setMemos(JSON.parse(savedMemos));
      if (savedColors) setCustomColors(JSON.parse(savedColors));
      if (savedTitles) setDateNoteTitles(JSON.parse(savedTitles));
      if (savedContents) setDateNoteContents(JSON.parse(savedContents));
      if (savedPeriods) setPeriods(JSON.parse(savedPeriods));
    } catch (e) {
      console.warn("캘린더 데이터 로드 중 오류:", e);
    } finally {
      // ✅ 로드 완료 플래그
      setLoaded(true);
    }
  }, []);

  // ✅ 메모/색상/기간이 바뀔 때마다 localStorage에 저장 + Home용 events 생성
  useEffect(() => {
    // 🔒 아직 로딩이 끝나지 않았다면 저장 금지 (기존 데이터 덮어쓰기 방지)
    if (!loaded) return;

    try {
      localStorage.setItem(STORAGE_KEYS.memos, JSON.stringify(memos));
      localStorage.setItem(STORAGE_KEYS.colors, JSON.stringify(customColors));
      localStorage.setItem(STORAGE_KEYS.titles, JSON.stringify(dateNoteTitles));
      localStorage.setItem(
        STORAGE_KEYS.contents,
        JSON.stringify(dateNoteContents)
      );
      localStorage.setItem(STORAGE_KEYS.periods, JSON.stringify(periods));

      const events = buildCalendarEvents(
        dateNoteTitles,
        dateNoteContents,
        periods
      );
      localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
    } catch (e) {
      console.warn("캘린더 데이터 저장 중 오류:", e);
    }
  }, [memos, customColors, dateNoteTitles, dateNoteContents, periods, loaded]);

  // ✅ 연/월/선택 날짜/컨텍스트 날짜 바뀔 때마다 뷰 상태 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.viewYear, String(year));
      localStorage.setItem(STORAGE_KEYS.viewMonth, String(month));

      if (selectedDate) {
        localStorage.setItem(STORAGE_KEYS.selectedDate, selectedDate);
      } else {
        localStorage.removeItem(STORAGE_KEYS.selectedDate);
      }

      if (contextDate) {
        localStorage.setItem(STORAGE_KEYS.contextDate, contextDate);
      } else {
        localStorage.removeItem(STORAGE_KEYS.contextDate);
      }
    } catch (e) {
      console.warn("캘린더 뷰 상태 저장 중 오류:", e);
    }
  }, [year, month, selectedDate, contextDate]);

  // 🔄 연도 바뀔 때 한국 공휴일 API에서 가져오기
  useEffect(() => {
    let cancelled = false;

    async function loadHolidays() {
      try {
        setHolidayLoading(true);
        const res = await fetch(`/api/holidays?year=${year}`);
        if (!res.ok) throw new Error("failed to fetch holidays");
        const data: Holiday[] = await res.json();

        if (cancelled) return;

        const map: Record<string, Holiday> = {};
        for (const h of data) {
          map[h.date] = h;
        }
        setHolidayMap(map);
      } catch (e) {
        console.error("공휴일 가져오기 실패:", e);
        setHolidayMap({});
      } finally {
        if (!cancelled) {
          setHolidayLoading(false);
        }
      }
    }

    loadHolidays();
    return () => {
      cancelled = true;
    };
  }, [year]);

  // 📅 달력 셀 만들기
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const cells: DayCell[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: null, key: null });
  }
  for (let d = 1; d <= lastDate; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      d
    ).padStart(2, "0")}`;
    cells.push({ day: d, key });
  }

  // 🔧 연/월 이동
  const handlePrevMonth = () => {
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 0) {
      newMonth = 11;
      newYear = year - 1;
    }
    setYear(newYear);
    setMonth(newMonth);
    setSelectedDate(null);
    setContextDate(null);
  };

  const handleNextMonth = () => {
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 11) {
      newMonth = 0;
      newYear = year + 1;
    }
    setYear(newYear);
    setMonth(newMonth);
    setSelectedDate(null);
    setContextDate(null);
  };

  const handleRightClickDay = (
    e: MouseEvent<HTMLButtonElement>,
    key: string | null
  ) => {
    e.preventDefault();
    if (!key) return;
    setSelectedDate(key);
    setContextDate(key);
  };

  // 🕒 시간 메모 추가
  const handleAddMemo = (e: FormEvent) => {
    e.preventDefault();
    if (!contextDate) return;
    if (!memoText.trim()) return;

    setMemos((prev) => {
      const prevList = prev[contextDate] ?? [];
      const newList: TimeMemo[] = [
        ...prevList,
        { start: memoStartTime, end: memoEndTime, text: memoText.trim() },
      ];

      newList.sort((a, b) =>
        a.start < b.start ? -1 : a.start > b.start ? 1 : 0
      );

      return { ...prev, [contextDate]: newList };
    });

    setMemoText("");
  };

  const handleDeleteMemo = (dateKey: string, index: number) => {
    setMemos((prev) => {
      const list = prev[dateKey];
      if (!list) return prev;

      const newList = list.filter((_, i) => i !== index);
      const next: MemoMap = { ...prev };

      if (newList.length === 0) {
        delete next[dateKey];
      } else {
        next[dateKey] = newList;
      }

      return next;
    });
  };

  // 🎨 날짜 배경색
  const handleSetColor = (dateKey: string, color: string | null) => {
    setCustomColors((prev) => {
      const next = { ...prev };
      if (!color) {
        delete next[dateKey];
      } else {
        next[dateKey] = color;
      }
      return next;
    });
  };

  // 📝 날짜 메모 제목
  const handleAddDateTitle = () => {
    if (!contextDate) return;
    if (!dateNoteTitleInput.trim()) return;

    setDateNoteTitles((prev) => ({
      ...prev,
      [contextDate]: dateNoteTitleInput.trim(),
    }));

    setDateNoteTitleInput("");
  };

  // 📝 날짜 메모 내용
  const handleAddDateContent = () => {
    if (!contextDate) return;
    if (!dateNoteContentInput.trim()) return;

    setDateNoteContents((prev) => {
      const list = prev[contextDate] ?? [];
      return {
        ...prev,
        [contextDate]: [...list, dateNoteContentInput.trim()],
      };
    });

    setDateNoteContentInput("");
  };

  const handleDeleteDateContent = (dateKey: string, index: number) => {
    setDateNoteContents((prev) => {
      const list = prev[dateKey];
      if (!list) return prev;

      const newList = list.filter((_, i) => i !== index);
      const next: Record<string, string[]> = { ...prev };

      if (newList.length === 0) {
        delete next[dateKey];
      } else {
        next[dateKey] = newList;
      }

      return next;
    });
  };

  // 📌 기간 추가 / 삭제
  const handleAddPeriod = () => {
    if (!periodLabelInput.trim() || !periodStart || !periodEnd) return;

    const start = periodStart <= periodEnd ? periodStart : periodEnd;
    const end = periodStart <= periodEnd ? periodEnd : periodStart;

    setPeriods((prev) => [
      ...prev,
      {
        id: Date.now(),
        label: periodLabelInput.trim(),
        start,
        end,
        color: periodColorInput || "#ffa000",
      },
    ]);

    setPeriodLabelInput("");
    setPeriodStart("");
    setPeriodEnd("");
  };

  const handleDeletePeriod = (id: number) => {
    setPeriods((prev) => prev.filter((p) => p.id !== id));
  };

  const currentMemoList: TimeMemo[] = contextDate
    ? memos[contextDate] ?? []
    : [];
  const contextHoliday = getHolidayFromMap(holidayMap, contextDate);
  const currentDateTitle: string = contextDate
    ? dateNoteTitles[contextDate] ?? ""
    : "";
  const currentDateContents: string[] = contextDate
    ? dateNoteContents[contextDate] ?? []
    : [];

  const periodsForContext = contextDate
    ? periods.filter((p) => p.start <= contextDate && contextDate <= p.end)
    : [];

  return (
    <div className="page-wrapper">
      <main className="main-section">
        <div className="calendar-column">
          <div className="card">
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
              캘린더
            </h2>
            <p style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
              오늘: {todayKey}
            </p>
            {holidayLoading && (
              <p style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                공휴일 불러오는 중...
              </p>
            )}
          </div>

          {/* ⬇⬇⬇ 캘린더 화면 부분 ⬇⬇⬇ */}
          <div className="card calendar-card">
            <div className="calendar-header-row">
              <button
                className="month-nav-btn"
                type="button"
                onClick={handlePrevMonth}
              >
                ◀
              </button>
              <h3 className="calendar-title">
                {year}년 {month + 1}월
              </h3>
              <button
                className="month-nav-btn"
                type="button"
                onClick={handleNextMonth}
              >
                ▶
              </button>
            </div>

            <div className="calendar-weekdays">
              <div className="weekday sun">일</div>
              <div className="weekday">월</div>
              <div className="weekday">화</div>
              <div className="weekday">수</div>
              <div className="weekday">목</div>
              <div className="weekday">금</div>
              <div className="weekday sat">토</div>
            </div>

            <div className="calendar-grid">
              {cells.map((cell, index) => {
                if (cell.day === null) {
                  return <div key={index} className="day-cell empty" />;
                }

                const weekdayIndex = index % 7;
                const isSun = weekdayIndex === 0;
                const isSat = weekdayIndex === 6;

                const holidayInfo = getHolidayFromMap(holidayMap, cell.key);
                const isHoliday = !!holidayInfo;

                const isSelected = selectedDate === cell.key;
                const isToday = cell.key === todayKey;

                const customColor = cell.key
                  ? customColors[cell.key]
                  : undefined;

                const periodsForDay = cell.key
                  ? periods.filter(
                    (p) =>
                      p.start <= (cell.key as string) &&
                      (cell.key as string) <= p.end
                  )
                  : [];
                const firstPeriodForDay = periodsForDay[0];
                const isInPeriod = periodsForDay.length > 0;

                let dayStyle:
                  | { background?: string; borderColor?: string }
                  | undefined;

                if (customColor) {
                  dayStyle = !isSelected
                    ? {
                      background: customColor,
                      borderColor: customColor,
                    }
                    : { background: customColor };
                }

                const hasTimeMemo =
                  !!cell.key && !!memos[cell.key] && memos[cell.key].length > 0;

                const hasDateNote =
                  !!cell.key &&
                  ((dateNoteTitles[cell.key] &&
                    dateNoteTitles[cell.key].trim() !== "") ||
                    (dateNoteContents[cell.key] &&
                      dateNoteContents[cell.key].length > 0));

                const hasAnyNote = hasTimeMemo || hasDateNote;

                const dateTitle =
                  cell.key && dateNoteTitles[cell.key]
                    ? dateNoteTitles[cell.key].trim()
                    : "";

                const dayClassNames = [
                  "day-cell",
                  isSun && "sun",
                  isSat && "sat",
                  isHoliday && "holiday",
                  isToday && "today",
                  isSelected && "selected",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    key={index}
                    type="button"
                    className={dayClassNames}
                    style={dayStyle}
                    onClick={() => {
                      if (cell.key) {
                        setSelectedDate(cell.key);
                        setContextDate(cell.key);
                      }
                    }}
                    onContextMenu={(e) => handleRightClickDay(e, cell.key)}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        paddingTop: 6,
                        paddingInline: 4,
                        boxSizing: "border-box",
                      }}
                    >
                      {isToday && <span className="today-badge">오늘</span>}

                      <span className="day-number">{cell.day}</span>

                      {holidayInfo && (
                        <div className="holiday-cell-name">
                          {holidayInfo.name}
                        </div>
                      )}

                      {dateTitle && (
                        <div className="day-title">{dateTitle}</div>
                      )}

                      {firstPeriodForDay && (
                        <div className="period-tag">
                          <span className="period-tag-label">
                            {firstPeriodForDay.label}
                          </span>
                        </div>
                      )}

                      {hasAnyNote && <span className="memo-dot" />}

                      {isInPeriod && firstPeriodForDay && (
                        <div
                          className="period-line"
                          style={{ background: firstPeriodForDay.color }}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          {/* ⬆⬆⬆ 캘린더 화면 부분 끝 ⬆⬆⬆ */}

          {contextDate && (
            <div className="card memo-card">
              <div className="memo-header">
                <span className="memo-title">메모</span>
                <span className="memo-date">{contextDate}</span>
              </div>

              {contextHoliday && (
                <div className="holiday-banner">
                  <span className="holiday-label">공휴일</span>
                  <span className="holiday-name">{contextHoliday.name}</span>
                </div>
              )}

              <div className="date-note-row">
                <label className="date-note-label">
                  날짜 메모 제목
                  <div className="date-note-input-row">
                    <input
                      type="text"
                      className="date-note-input"
                      placeholder="이 날짜 메모의 제목을 적어주세요"
                      value={dateNoteTitleInput}
                      onChange={(e) => setDateNoteTitleInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="memo-add-btn"
                      onClick={handleAddDateTitle}
                    >
                      저장
                    </button>
                  </div>
                </label>
              </div>

              <div className="date-note-display-card">
                <div className="date-note-display-title">메모 내용</div>

                {currentDateTitle && (
                  <div className="date-note-title-line">
                    <span className="date-note-title-label">제목</span>
                    <span className="date-note-title-text">
                      {currentDateTitle}
                    </span>
                    <button
                      type="button"
                      className="memo-delete-btn"
                      onClick={() => {
                        if (!contextDate) return;
                        setDateNoteTitles((prev) => {
                          const next = { ...prev };
                          delete next[contextDate];
                          return next;
                        });
                      }}
                    >
                      제목 삭제
                    </button>
                  </div>
                )}

                <div className="date-note-input-row" style={{ marginTop: 6 }}>
                  <input
                    type="text"
                    className="date-note-input"
                    placeholder="메모 내용을 입력하세요"
                    value={dateNoteContentInput}
                    onChange={(e) => setDateNoteContentInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className="memo-add-btn"
                    onClick={handleAddDateContent}
                  >
                    추가
                  </button>
                </div>

                {currentDateContents.length === 0 ? (
                  <p className="date-note-empty">
                    등록된 메모 내용이 없습니다.
                  </p>
                ) : (
                  <div className="date-note-list">
                    {currentDateContents.map((content, idx) => (
                      <div key={idx} className="date-note-item">
                        <span className="date-note-text">{content}</span>
                        <button
                          type="button"
                          className="memo-delete-btn"
                          onClick={() =>
                            handleDeleteDateContent(contextDate as string, idx)
                          }
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="period-card">
                <div className="period-inline-row">
                  <span className="period-header-inline">기간 설정</span>

                  <label className="period-label-inline">
                    시작일
                    <input
                      type="date"
                      className="period-input"
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                    />
                  </label>

                  <label className="period-label-inline">
                    종료일
                    <input
                      type="date"
                      className="period-input"
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                    />
                  </label>

                  <label className="period-label-inline">
                    선 색상
                    <input
                      type="color"
                      className="period-color-input"
                      value={periodColorInput}
                      onChange={(e) => setPeriodColorInput(e.target.value)}
                    />
                  </label>

                  <button
                    type="button"
                    className="memo-add-btn"
                    onClick={handleAddPeriod}
                  >
                    기간 추가
                  </button>
                </div>

                <div className="period-desc-row">
                  <input
                    type="text"
                    className="period-input period-desc-input"
                    placeholder="예: 수행평가 기간, 중간고사 기간"
                    value={periodLabelInput}
                    onChange={(e) => setPeriodLabelInput(e.target.value)}
                  />
                </div>

                {periodsForContext.length === 0 ? (
                  <p className="period-empty">
                    이 날짜에 포함되는 기간이 없습니다.
                  </p>
                ) : (
                  <div className="period-list">
                    {periodsForContext.map((p) => (
                      <div key={p.id} className="period-item">
                        <div className="period-tag-label">
                          <span
                            className="period-color-dot"
                            style={{ background: p.color }}
                          />
                          {p.label}
                        </div>
                        <div className="period-tag-dates">
                          {p.start} ~ {p.end}
                        </div>
                        <button
                          type="button"
                          className="memo-delete-btn"
                          onClick={() => handleDeletePeriod(p.id)}
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="color-row">
                <span className="color-label">색상</span>
                <div className="color-options">
                  <button
                    type="button"
                    className="color-pill default"
                    onClick={() =>
                      contextDate && handleSetColor(contextDate, null)
                    }
                  >
                    기본
                  </button>
                  <button
                    type="button"
                    className="color-pill yellow"
                    onClick={() =>
                      contextDate && handleSetColor(contextDate, "#fff9c4")
                    }
                  >
                    노랑
                  </button>
                  <button
                    type="button"
                    className="color-pill green"
                    onClick={() =>
                      contextDate && handleSetColor(contextDate, "#c8e6c9")
                    }
                  >
                    초록
                  </button>
                  <button
                    type="button"
                    className="color-pill purple"
                    onClick={() =>
                      contextDate && handleSetColor(contextDate, "#e1bee7")
                    }
                  >
                    보라
                  </button>
                  <button
                    type="button"
                    className="color-pill orange"
                    onClick={() =>
                      contextDate && handleSetColor(contextDate, "#ffe0b2")
                    }
                  >
                    주황
                  </button>
                  <button
                    type="button"
                    className="color-pill pink"
                    onClick={() =>
                      contextDate && handleSetColor(contextDate, "#ffc1e3")
                    }
                  >
                    분홍
                  </button>
                  <button
                    type="button"
                    className="color-pill blue"
                    onClick={() =>
                      contextDate && handleSetColor(contextDate, "#bbdefb")
                    }
                  >
                    파랑
                  </button>
                  <button
                    type="button"
                    className="color-pill gray"
                    onClick={() =>
                      contextDate && handleSetColor(contextDate, "#eeeeee")
                    }
                  >
                    회색
                  </button>
                </div>
              </div>

              <form className="memo-form" onSubmit={handleAddMemo}>
                <div className="memo-input-row">
                  <label className="memo-label">
                    시작
                    <input
                      type="time"
                      value={memoStartTime}
                      onChange={(e) => setMemoStartTime(e.target.value)}
                      className="memo-time-input"
                    />
                  </label>
                  <label className="memo-label">
                    종료
                    <input
                      type="time"
                      value={memoEndTime}
                      onChange={(e) => setMemoEndTime(e.target.value)}
                      className="memo-time-input"
                    />
                  </label>
                  <label className="memo-label memo-text-label">
                    내용
                    <input
                      type="text"
                      value={memoText}
                      onChange={(e) => setMemoText(e.target.value)}
                      placeholder="메모를 입력하세요"
                      className="memo-text-input"
                    />
                  </label>
                  <button type="submit" className="memo-add-btn">
                    추가
                  </button>
                </div>
              </form>

              <div className="memo-list">
                {currentMemoList.length === 0 ? (
                  <p className="memo-empty">등록된 메모가 없습니다.</p>
                ) : (
                  currentMemoList.map((m, idx) => (
                    <div key={idx} className="memo-item">
                      <span className="memo-time">
                        {m.start}~{m.end}
                      </span>
                      <span className="memo-text">{m.text}</span>
                      <button
                        type="button"
                        className="memo-delete-btn"
                        onClick={() =>
                          handleDeleteMemo(contextDate as string, idx)
                        }
                      >
                        삭제
                      </button>
                    </div>
                  ))
                )}
              </div>

              <p className="memo-hint">
                ※ 날짜를 클릭 또는 우클릭하면 해당 날짜에 메모를 작성할 수
                있습니다.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ⬇ 기존 스타일 그대로 ⬇ */}
      <style jsx>{`
        .page-wrapper {
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f5f7fb;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }

        .main-section {
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 80px;
          padding-bottom: 40px;
          box-sizing: border-box;
          width: 100%;
        }

        .calendar-column {
          width: 100%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin: 0 auto;
        }

        .card {
          width: 100%;
          border: 1px solid #dedede;
          border-radius: 14px;
          padding: 18px 20px;
          background: #ffffff;
          box-sizing: border-box;
        }

        .calendar-card {
          padding-top: 16px;
        }

        .calendar-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .calendar-title {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
        }

        .month-nav-btn {
          border: none;
          background: #f2f2f2;
          border-radius: 999px;
          padding: 6px 12px;
          font-size: 12px;
          cursor: pointer;
        }

        .month-nav-btn:hover {
          background: #e5e5e5;
        }

        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-weight: 600;
          font-size: 12px;
          margin-bottom: 8px;
        }

        .weekday {
          padding: 4px 0;
        }

        .weekday.sun {
          color: #e53935;
        }

        .weekday.sat {
          color: #1e88e5;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 14px;
        }

        .day-cell {
          height: 80px;
          border-radius: 12px;
          border: 1px solid #dedede;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          cursor: pointer;
          padding: 0;
          box-sizing: border-box;
        }

        .day-cell.sun,
        .day-cell.holiday {
          color: #e53935;
          background: rgba(255, 0, 0, 0.08);
          border-color: rgba(255, 0, 0, 0.15);
        }

        .day-cell.sat {
          color: #1e88e5;
          background: rgba(30, 136, 229, 0.08);
          border-color: rgba(30, 136, 229, 0.15);
        }

        .day-cell.today:not(.selected) {
          border-color: #111827;
          border-width: 2px;
        }

        .day-cell.selected {
          border: 2px solid #000000;
        }

        .day-cell.empty {
          border: none;
          background: transparent;
          cursor: default;
        }

        .day-number {
          font-size: 16px;
          font-weight: 500;
        }

        .today-badge {
          position: absolute;
          top: 4px;
          right: 6px;
          font-size: 9px;
          padding: 1px 4px;
          border-radius: 999px;
          background: #111827;
          color: #ffffff;
        }

        .holiday-cell-name {
          margin-top: 2px;
          font-size: 9px;
          line-height: 1.2;
          color: #c62828;
          font-weight: 600;
          text-align: center;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .day-title {
          margin-top: 4px;
          font-size: 10px;
          line-height: 1.2;
          color: #555555;
          text-align: center;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .memo-dot {
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          background: #27a9ff;
          border-radius: 50%;
        }

        .period-tag {
          margin-top: 2px;
          font-size: 9px;
          line-height: 1.2;
          color: #856404;
          background: rgba(255, 243, 205, 0.95);
          border-radius: 999px;
          padding: 1px 6px;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          border: 1px solid #ffeeba;
        }

        .period-line {
          position: absolute;
          bottom: 3px;
          left: 50%;
          transform: translateX(-50%);
          width: 70%;
          height: 3px;
          border-radius: 999px;
        }

        .memo-card {
          margin-top: 4px;
        }

        .memo-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .memo-title {
          font-weight: 600;
          font-size: 14px;
        }

        .memo-date {
          font-size: 13px;
          color: #666666;
        }

        .holiday-banner {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 999px;
          background: #ffecec;
          border: 1px solid #ffbcbc;
          font-size: 12px;
          color: #c62828;
          margin-bottom: 10px;
        }

        .holiday-label {
          font-weight: 700;
        }

        .holiday-name {
          font-weight: 500;
        }

        .date-note-row {
          margin-bottom: 10px;
        }

        .date-note-label {
          display: flex;
          flex-direction: column;
          font-size: 12px;
          color: #444444;
        }

        .date-note-input-row {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }

        .date-note-input {
          padding: 6px 8px;
          border-radius: 8px;
          border: 1px solid #d0d0d0;
          font-size: 12px;
          width: 100%;
        }

        .date-note-display-card {
          border-radius: 10px;
          border: 1px solid #eeeeee;
          background: #fafafa;
          padding: 8px 10px;
          margin-bottom: 10px;
        }

        .date-note-display-title {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .date-note-title-line {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
          font-size: 12px;
        }

        .date-note-title-label {
          font-weight: 600;
          color: #555555;
        }

        .date-note-title-text {
          flex: 1;
          word-break: break-word;
        }

        .date-note-empty {
          font-size: 12px;
          color: #999999;
          margin: 6px 0 0;
        }

        .date-note-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 6px;
        }

        .date-note-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .date-note-text {
          flex: 1;
          word-break: break-word;
        }

        .period-card {
          border-radius: 10px;
          border: 1px solid #eeeeee;
          background: #fafafa;
          padding: 6px 8px;
          margin-bottom: 8px;
        }

        .period-inline-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: nowrap;
        }

        .period-header-inline {
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .period-label-inline {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #444444;
          white-space: nowrap;
        }

        .period-input {
          padding: 4px 6px;
          border-radius: 8px;
          border: 1px solid #d0d0d0;
          font-size: 11px;
          box-sizing: border-box;
        }

        .period-color-input {
          width: 32px;
          height: 20px;
          padding: 0;
          border-radius: 4px;
          border: 1px solid #d0d0d0;
        }

        .period-desc-row {
          margin-top: 4px;
        }

        .period-desc-input {
          width: 100%;
        }

        .period-list {
          display: flex;
          flex-direction: column;
          gap: 3px;
          margin-top: 4px;
          max-height: 60px;
          overflow-y: auto;
        }

        .period-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          font-size: 11px;
          padding: 2px 0;
        }

        .period-tag-label {
          font-weight: 600;
          color: #333333;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .period-color-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          border: 1px solid #e5e5e5;
        }

        .period-tag-dates {
          font-size: 10px;
          color: #777777;
        }

        .period-empty {
          font-size: 11px;
          color: #999999;
          margin-top: 2px;
        }

        .color-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .color-label {
          font-size: 12px;
          color: #555555;
          font-weight: 500;
        }

        .color-options {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .color-pill {
          border: none;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 11px;
          cursor: pointer;
          background: #f2f2f2;
          color: #333333;
        }

        .color-pill.default {
          background: #f2f2f2;
        }

        .color-pill.yellow {
          background: #fff9c4;
        }

        .color-pill.green {
          background: #c8e6c9;
        }

        .color-pill.purple {
          background: #e1bee7;
        }

        .color-pill.orange {
          background: #ffe0b2;
        }

        .color-pill.pink {
          background: #ffc1e3;
        }

        .color-pill.blue {
          background: #bbdefb;
        }

        .color-pill.gray {
          background: #eeeeee;
        }

        .color-pill:hover {
          filter: brightness(0.97);
        }

        .memo-form {
          margin-bottom: 10px;
        }

        .memo-input-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          flex-wrap: wrap;
        }

        .memo-label {
          display: flex;
          flex-direction: column;
          font-size: 12px;
          color: #444444;
        }

        .memo-time-input {
          margin-top: 4px;
          padding: 6px 8px;
          border-radius: 8px;
          border: 1px solid #d0d0d0;
          font-size: 12px;
          min-width: 100px;
        }

        .memo-text-label {
          flex: 1;
        }

        .memo-text-input {
          margin-top: 4px;
          padding: 6px 8px;
          border-radius: 8px;
          border: 1px solid #d0d0d0;
          font-size: 12px;
          width: 100%;
        }

        .memo-add-btn {
          border: none;
          background: #27a9ff;
          color: #ffffff;
          border-radius: 999px;
          padding: 7px 14px;
          font-size: 12px;
          cursor: pointer;
          white-space: nowrap;
        }

        .memo-add-btn:hover {
          filter: brightness(0.96);
        }

        .memo-list {
          border-top: 1px solid #eeeeee;
          padding-top: 8px;
          margin-top: 4px;
          max-height: 180px;
          overflow-y: auto;
        }

        .memo-empty {
          margin: 6px 0 0;
          font-size: 12px;
          color: #888888;
        }

        .memo-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 0;
          font-size: 12px;
        }

        .memo-time {
          font-weight: 600;
          min-width: 80px;
        }

        .memo-text {
          flex: 1;
          word-break: break-word;
        }

        .memo-delete-btn {
          border: none;
          background: #f2f2f2;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 11px;
          cursor: pointer;
          white-space: nowrap;
        }

        .memo-delete-btn:hover {
          background: #e2e2e2;
        }

        .memo-hint {
          margin: 8px 0 0;
          font-size: 11px;
          color: #999999;
        }

        .memo-card {
          padding: 10px 14px !important;
          margin-top: 0 !important;
          max-height: 260px;
          overflow-y: auto;
        }

        .memo-header {
          margin-bottom: 8px !important;
        }

        .date-note-row {
          margin-bottom: 6px !important;
        }

        .date-note-input,
        .memo-text-input,
        .memo-time-input,
        .period-input {
          height: 32px;
        }

        .date-note-display-card {
          padding: 6px 8px !important;
          margin-bottom: 8px !important;
        }

        .color-row {
          margin-bottom: 6px !important;
        }

        .memo-form {
          margin-bottom: 6px !important;
        }

        .memo-add-btn {
          padding: 5px 12px !important;
        }

        .memo-item {
          padding: 3px 0 !important;
        }

        .memo-list {
          max-height: 130px !important;
        }

        .memo-hint {
          margin-top: 4px !important;
        }

        @media (max-width: 768px) {
          .main-section {
            padding-top: 40px;
            padding-bottom: 24px;
          }

          .calendar-column {
            max-width: 100%;
            padding: 0 12px;
          }

          .memo-input-row {
            align-items: stretch;
          }

          .period-inline-row {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}
