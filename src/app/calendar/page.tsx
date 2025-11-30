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
  events: "calendarEvents",

  viewYear: "calendar_view_year",
  viewMonth: "calendar_view_month",
  selectedDate: "calendar_selected_date",
  contextDate: "calendar_context_date",
};

// 🎨 사용할 셀 색상 5가지 (연한 파스텔 톤)
const COLOR_PRESETS = [
  "#DBEAFE", // 연한 파랑
  "#FFE4D5", // 연한 주황
  "#DCFCE7", // 연한 초록
  "#FEE2E2", // 연한 빨강/핑크
  "#EDE9FE", // 연한 보라
];

// 📦 날짜 메모/기간 → Home에서 사용할 events 배열로 변환
function buildCalendarEvents(
  dateNoteTitles: Record<string, string>,
  dateNoteContents: Record<string, string[]>,
  periods: Period[]
): CalendarEvent[] {
  const map: Record<string, string[]> = {};

  // 1) 날짜 메모 제목 (1개)
  for (const [date, title] of Object.entries(dateNoteTitles)) {
    const t = title.trim();
    if (!t) continue;
    if (!map[date]) map[date] = [];
    map[date].push(t);
  }

  // 2) 날짜 메모 내용 (여러 개)
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

  const [periods, setPeriods] = useState<Period[]>([]);

  const [holidayMap, setHolidayMap] = useState<Record<string, Holiday>>({});
  const [holidayLoading, setHolidayLoading] = useState(false);

  const [loaded, setLoaded] = useState(false);

  // 🟣 새 일정 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStartDate, setModalStartDate] = useState<string>("");
  const [modalEndDate, setModalEndDate] = useState<string>("");
  const [modalRangeType, setModalRangeType] = useState<"single" | "range">(
    "single"
  );

  // 🔔 시간: 시작 / 종료
  const [modalStartTime, setModalStartTime] = useState<string>("");
  const [modalEndTime, setModalEndTime] = useState<string>("");

  // 제목 / 설명
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalDescription, setModalDescription] = useState<string>("");

  // 🎨 셀 색상 (5가지 중 하나 or 빈 값)
  const [modalColor, setModalColor] = useState<string>("");

  // ✏️ 현재 모달에서 수정 중인 일정 인덱스 (null이면 "새 일정 추가" 모드)
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const todayKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // ✅ 처음 로드
  useEffect(() => {
    try {
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
      setLoaded(true);
    }
  }, []);

  // ✅ 데이터 변경 → 저장 + Home events
  useEffect(() => {
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

  // ✅ 뷰 상태 저장
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

  // 🔄 연도 바뀔 때 공휴일
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

  // 📅 셀 생성
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

  // 🔧 월 이동
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

  // ✅ 날짜 클릭 시: 모달 오픈 (기본은 "새 일정 추가" 모드)
  const openScheduleModal = (dateKey: string) => {
    setSelectedDate(dateKey);
    setContextDate(dateKey);
    setModalStartDate(dateKey);
    setModalEndDate(dateKey);
    setModalRangeType("single");

    const existingTitle = dateNoteTitles[dateKey] ?? "";
    const existingColor = customColors[dateKey] ?? "";

    // 날짜 대표 제목 / 색상만 불러오고,
    // 시간/설명은 "새 일정" 추가를 위해 비워둠
    setModalTitle(existingTitle);
    setModalStartTime("");
    setModalEndTime("");
    setModalDescription("");
    setModalColor(existingColor);
    setEditingIndex(null);

    setIsModalOpen(true);
  };

  const handleRightClickDay = (
    e: MouseEvent<HTMLButtonElement>,
    key: string | null
  ) => {
    e.preventDefault();
    if (!key) return;
    openScheduleModal(key);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingIndex(null);
  };

  // ✏️ 기존 일정 "수정" 버튼 / 리스트 아이템 클릭 시
  const handleEditExistingSchedule = (index: number) => {
    const dateKey = selectedDate || modalStartDate;
    if (!dateKey) return;

    const memoList = memos[dateKey] || [];
    const descList = dateNoteContents[dateKey] || [];

    const targetMemo = memoList[index];
    const targetDesc = descList[index] ?? targetMemo?.text ?? "";

    setEditingIndex(index);
    setModalStartTime(targetMemo?.start ?? "");
    setModalEndTime(targetMemo?.end ?? "");
    setModalDescription(targetDesc);
  };

  // 🗑 기존 일정 하나만 삭제
  const handleDeleteScheduleItem = (index: number) => {
    const dateKey = selectedDate || modalStartDate;
    if (!dateKey) return;

    const ok = window.confirm("이 일정을 삭제할까요?");
    if (!ok) return;

    setMemos((prev) => {
      const list = prev[dateKey];
      if (!list) return prev;
      const newList = list.filter((_, i) => i !== index);
      const next = { ...prev };
      if (newList.length === 0) {
        delete next[dateKey];
      } else {
        next[dateKey] = newList;
      }
      return next;
    });

    setDateNoteContents((prev) => {
      const list = prev[dateKey];
      if (!list) return prev;
      const newList = list.filter((_, i) => i !== index);
      const next = { ...prev };
      if (newList.length === 0) {
        delete next[dateKey];
      } else {
        next[dateKey] = newList;
      }
      return next;
    });

    // 제목은 그대로 두고, 필요하면 사용자가 수정 가능
    setEditingIndex(null);
    setModalStartTime("");
    setModalEndTime("");
    setModalDescription("");
  };

  // ✅ single / range 처리 + 설명/시간/색상 저장
  const handleModalSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!modalStartDate) {
      alert("시작일을 선택하세요.");
      return;
    }
    if (!modalTitle.trim()) {
      alert("제목을 입력하세요.");
      return;
    }

    const start = modalStartDate;
    const end =
      modalRangeType === "range" && modalEndDate
        ? modalEndDate
        : modalStartDate;

    const descriptionText =
      modalDescription.trim().length > 0
        ? modalDescription.trim()
        : modalTitle.trim();

    if (modalRangeType === "single") {
      // 🔹 하루 일정 모드

      // 대표 제목 (날짜 단위) 갱신
      setDateNoteTitles((prev) => ({
        ...prev,
        [start]: modalTitle.trim(),
      }));

      if (editingIndex !== null) {
        // ✏ 기존 일정 "수정" 모드
        setDateNoteContents((prev) => {
          const next = { ...prev };
          const list = next[start] ? [...next[start]] : [];
          list[editingIndex] = descriptionText;
          next[start] = list;
          return next;
        });

        setMemos((prev) => {
          const next = { ...prev };
          const list = next[start] ? [...next[start]] : [];
          const finalStart = modalStartTime || "";
          const finalEnd = modalEndTime || "";
          list[editingIndex] = {
            start: finalStart,
            end: finalEnd,
            text: descriptionText,
          };
          next[start] = list;
          return next;
        });
      } else {
        // ➕ 새 일정 추가 모드

        // 설명: 배열에 "추가"
        setDateNoteContents((prev) => {
          const next = { ...prev };
          if (!descriptionText) return next;

          const list = next[start] ? [...next[start]] : [];
          list.push(descriptionText);
          next[start] = list;
          return next;
        });

        // 시간 메모: 항상 배열에 "추가" (시간이 없어도 저장)
        setMemos((prev) => {
          const next = { ...prev };
          const list = next[start] ? [...next[start]] : [];
          const finalStart = modalStartTime || "";
          const finalEnd = modalEndTime || "";
          list.push({
            start: finalStart,
            end: finalEnd,
            text: descriptionText,
          });
          next[start] = list;
          return next;
        });
      }

      // 이 날짜의 셀 색상 (대표 색 1개 유지)
      setCustomColors((prev) => {
        const next = { ...prev };
        if (modalColor) {
          next[start] = modalColor;
        } else {
          delete next[start];
        }
        return next;
      });
    } else {
      // 🔹 기간 모드
      if (start && end && start <= end) {
        setPeriods((prev) => [
          ...prev,
          {
            id: Date.now(),
            label: descriptionText,
            start,
            end,
            color: "#7c3aed",
          },
        ]);
      }

      // 기간 시작일 기준 설명 (여러 개 누적 가능)
      setDateNoteContents((prev) => {
        const next = { ...prev };
        if (!descriptionText) return next;
        const list = next[start] ? [...next[start]] : [];
        list.push(descriptionText);
        next[start] = list;
        return next;
      });

      // 기간 시작일 셀 색상
      setCustomColors((prev) => {
        const next = { ...prev };
        if (modalColor) {
          next[start] = modalColor;
        } else {
          delete next[start];
        }
        return next;
      });
    }

    setEditingIndex(null);
    setIsModalOpen(false);
  };

  const handleDeleteScheduleForDate = () => {
    const dateKey = modalStartDate || selectedDate;
    if (!dateKey) return;

    const ok = window.confirm("이 날짜의 모든 일정을 삭제할까요?");
    if (!ok) return;

    setDateNoteTitles((prev) => {
      const next = { ...prev };
      delete next[dateKey];
      return next;
    });

    setDateNoteContents((prev) => {
      const next = { ...prev };
      delete next[dateKey];
      return next;
    });

    setMemos((prev) => {
      const next = { ...prev };
      delete next[dateKey];
      return next;
    });

    setCustomColors((prev) => {
      const next = { ...prev };
      delete next[dateKey];
      return next;
    });

    setPeriods((prev) =>
      prev.filter((p) => !(p.start <= dateKey && dateKey <= p.end))
    );

    setEditingIndex(null);
    setIsModalOpen(false);
  };

  const cellsWithRender = cells;

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
              {cellsWithRender.map((cell, index) => {
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

                // 👉 이 날짜에 저장된 일정 개수 (설명 기준)
                const scheduleCount =
                  (cell.key && dateNoteContents[cell.key]?.length) || 0;

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
                        openScheduleModal(cell.key);
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
                        <div className="day-title">
                          {dateTitle}
                          {scheduleCount > 1 && (
                            <span style={{ fontSize: 9, marginLeft: 2 }}>
                              외 {scheduleCount - 1}개
                            </span>
                          )}
                        </div>
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
        </div>
      </main>

      {/* 🟢 새 일정 추가 / 수정 모달 */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={handleModalClose}>
          <div
            className="modal-panel"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="modal-header">
              <span className="modal-title">
                {editingIndex === null ? "새 일정 추가" : "기존 일정 수정"}
              </span>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleModalClose}
              >
                ×
              </button>
            </div>

            <form className="modal-body" onSubmit={handleModalSubmit}>
              {/* 시작일 */}
              <div className="modal-field">
                <label className="modal-label">시작일</label>
                <input
                  type="date"
                  className="modal-input"
                  value={modalStartDate}
                  onChange={(e) => setModalStartDate(e.target.value)}
                />
              </div>

              {/* 기간 설정 */}
              <div className="modal-field">
                <label className="modal-label">기간 설정</label>
                <div className="modal-radio-row">
                  <label className="modal-radio">
                    <input
                      type="radio"
                      checked={modalRangeType === "single"}
                      onChange={() => setModalRangeType("single")}
                    />
                    <span>하루</span>
                  </label>
                  <label className="modal-radio">
                    <input
                      type="radio"
                      checked={modalRangeType === "range"}
                      onChange={() => setModalRangeType("range")}
                    />
                    <span>기간 설정</span>
                  </label>
                </div>
                {modalRangeType === "range" && (
                  <input
                    type="date"
                    className="modal-input modal-range-end"
                    value={modalEndDate}
                    onChange={(e) => setModalEndDate(e.target.value)}
                  />
                )}
              </div>

              {/* 시간 입력 (선택) */}
              <div className="modal-field">
                <label className="modal-label">시간 (선택)</label>
                <div className="modal-time-row">
                  <input
                    type="time"
                    className="modal-input modal-time-input"
                    value={modalStartTime}
                    onChange={(e) => setModalStartTime(e.target.value)}
                  />
                  <span className="modal-time-separator">~</span>
                  <input
                    type="time"
                    className="modal-input modal-time-input"
                    value={modalEndTime}
                    onChange={(e) => setModalEndTime(e.target.value)}
                  />
                </div>
              </div>

              {/* 셀 색상 선택 (5가지 고정) */}
              <div className="modal-field">
                <label className="modal-label">셀 색상 (선택)</label>
                <div className="modal-color-row">
                  <div className="color-palette">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={
                          "color-swatch" +
                          (modalColor === color ? " selected" : "")
                        }
                        style={{ background: color }}
                        onClick={() => setModalColor(color)}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="modal-color-reset-btn"
                    onClick={() => setModalColor("")}
                  >
                    기본으로
                  </button>
                </div>
              </div>

              {/* 제목 (날짜 대표 제목) */}
              <div className="modal-field">
                <label className="modal-label">제목 (날짜 요약)</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="예: 시험 기간, 수행평가 등"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                />
              </div>

              {/* 설명 */}
              <div className="modal-field">
                <label className="modal-label">설명</label>
                <textarea
                  className="modal-textarea"
                  placeholder="일정 설명을 입력하세요"
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                />
              </div>

              {/* 👉 이 날짜의 기존 일정 리스트 */}
              {selectedDate &&
                (() => {
                  const dateKey = selectedDate;
                  const memoList = memos[dateKey] || [];
                  const descList = dateNoteContents[dateKey] || [];
                  const maxLen = Math.max(memoList.length, descList.length);

                  if (maxLen === 0) return null;

                  return (
                    <div className="modal-field">
                      <label className="modal-label">
                        이 날짜에 저장된 일정
                      </label>
                      <div className="schedule-list">
                        {Array.from({ length: maxLen }).map((_, i) => {
                          const memo = memoList[i];
                          const desc = descList[i] ?? memo?.text ?? "";
                          const timeLabel =
                            memo && (memo.start || memo.end)
                              ? `${memo.start || ""} ~ ${memo.end || ""}`
                              : "시간 없음";

                          return (
                            <div
                              key={i}
                              className="schedule-list-item"
                              // 🔹 리스트 아이템 전체 클릭 → 일정 불러오기
                              onClick={() => handleEditExistingSchedule(i)}
                            >
                              <div className="schedule-list-main">
                                <span className="schedule-time">
                                  {timeLabel}
                                </span>
                                <span className="schedule-desc">{desc}</span>
                              </div>
                              <div className="schedule-list-actions">
                                <button
                                  type="button"
                                  className="schedule-edit-btn"
                                  onClick={(e) => {
                                    e.stopPropagation(); // 부모 onClick 막기
                                    handleEditExistingSchedule(i);
                                  }}
                                >
                                  수정
                                </button>
                                <button
                                  type="button"
                                  className="schedule-delete-btn"
                                  onClick={(e) => {
                                    e.stopPropagation(); // 부모 onClick 막기
                                    handleDeleteScheduleItem(i);
                                  }}
                                >
                                  삭제
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

              {/* 저장 버튼 */}
              <button type="submit" className="modal-submit-btn">
                {editingIndex === null ? "일정 추가" : "일정 수정 저장"}
              </button>

              {/* 날짜 전체 삭제 버튼 */}
              <button
                type="button"
                className="modal-delete-btn"
                onClick={handleDeleteScheduleForDate}
              >
                이 날짜의 일정 전체 삭제
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ⬇ 스타일 ⬇ */}
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
          position: relative; /* 🔹 제목/내용이 넘쳐도 셀 높이 고정 */
          overflow: hidden; /* 🔹 내부 내용 오버플로우 숨김 */
        }

        .day-cell.sun,
        .day-cell.holiday {
          color: #e53935;
          background: rgba(255, 0, 0, 0.04);
          border-color: rgba(255, 0, 0, 0.1);
        }

        .day-cell.sat {
          color: #1e88e5;
          background: rgba(30, 136, 229, 0.04);
          border-color: rgba(30, 136, 229, 0.1);
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

        /* 🔹 제목이 길어도 셀 높이 안늘어나게 2줄까지만 표시 */
        .day-title {
          margin-top: 4px;
          font-size: 9px;
          line-height: 1.2;
          color: #555555;
          text-align: center;
          width: 100%;
          max-height: 24px; /* 2줄 정도 */
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
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

        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-panel {
          width: 380px;
          max-width: 92%;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
          overflow: hidden;
        }

        .modal-header {
          padding: 10px 14px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f9fafb;
        }

        .modal-title {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .modal-close-btn {
          border: none;
          background: transparent;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          color: #6b7280;
        }

        .modal-close-btn:hover {
          color: #111827;
        }

        .modal-body {
          padding: 14px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #ffffff;
        }

        .modal-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .modal-label {
          font-size: 12px;
          font-weight: 500;
          color: #374151;
        }

        .modal-input {
          border-radius: 6px;
          border: 1px solid #d1d5db;
          padding: 7px 9px;
          font-size: 12px;
          outline: none;
          background: #ffffff;
        }

        .modal-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.15);
        }

        .modal-range-end {
          margin-top: 4px;
        }

        .modal-radio-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 2px;
          flex-wrap: wrap;
        }

        .modal-radio {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #4b5563;
        }

        .modal-radio input {
          accent-color: #2563eb;
        }

        .modal-textarea {
          border-radius: 6px;
          border: 1px solid #d1d5db;
          padding: 8px 9px;
          font-size: 12px;
          min-height: 70px;
          resize: none;
          outline: none;
          background: #ffffff;
        }

        .modal-textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.15);
        }

        .modal-time-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .modal-time-input {
          flex: 1;
        }

        .modal-time-separator {
          font-size: 12px;
          color: #4b5563;
        }

        .modal-color-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .color-palette {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .color-swatch {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          border: 2px solid transparent;
          padding: 0;
          cursor: pointer;
        }

        .color-swatch.selected {
          border-color: #111827;
        }

        .modal-color-reset-btn {
          border: none;
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 11px;
          cursor: pointer;
          background: #f3f4f6;
          color: #374151;
          white-space: nowrap;
        }

        .modal-color-reset-btn:hover {
          background: #e5e7eb;
        }

        .schedule-list {
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          padding: 6px 8px;
          max-height: 150px;
          overflow-y: auto;
          background: #f9fafb;
        }

        .schedule-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          padding: 4px 0;
          border-bottom: 1px solid #e5e7eb;
          cursor: pointer; /* 🔹 리스트 전체도 클릭 가능 */
        }

        .schedule-list-item:last-child {
          border-bottom: none;
        }

        .schedule-list-main {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }

        .schedule-time {
          font-size: 11px;
          color: #6b7280;
        }

        .schedule-desc {
          font-size: 12px;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .schedule-list-actions {
          display: flex;
          gap: 4px;
        }

        .schedule-edit-btn,
        .schedule-delete-btn {
          border-radius: 6px;
          border: none;
          padding: 4px 8px;
          font-size: 11px;
          cursor: pointer;
          white-space: nowrap;
        }

        .schedule-edit-btn {
          background: #e0f2fe;
          color: #0369a1;
        }

        .schedule-edit-btn:hover {
          background: #bae6fd;
        }

        .schedule-delete-btn {
          background: #fee2e2;
          color: #b91c1c;
        }

        .schedule-delete-btn:hover {
          background: #fecaca;
        }

        .modal-submit-btn {
          margin-top: 6px;
          border: none;
          width: 100%;
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
          cursor: pointer;
          background: #2563eb;
        }

        .modal-submit-btn:hover {
          background: #1d4ed8;
        }

        .modal-delete-btn {
          margin-top: 4px;
          border: none;
          width: 100%;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 500;
          color: #b91c1c;
          cursor: pointer;
          background: #fee2e2;
        }

        .modal-delete-btn:hover {
          background: #fecaca;
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
        }
      `}</style>
    </div>
  );
}
