"use client";

import { useEffect, useState } from "react";
import TimetablePreview from "../components/Dashboard/TimetablePreview";
import Link from "next/link";

interface Post {
  id: number;
  author: string;
  title: string;
  content: string;
  likes?: number;
  category?: string;
}

interface HomeCalendarItem {
  dateLabel: string; // 예: "11월 11일 (월)"
  event: string; // 일정 제목
  ddayLabel: string; // 예: "D-3", "D-Day"
  diffDays: number; // 정렬용
}

export default function HomePage() {
  const [user, setUser] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [today, setToday] = useState<string>("");
  const [calendar, setCalendar] = useState<HomeCalendarItem[]>([]);

  useEffect(() => {
    // 로그인 유저
    setUser(localStorage.getItem("loggedInUser") || null);

    // 게시글
    setPosts(JSON.parse(localStorage.getItem("posts_all") || "[]"));

    // 오늘 요일
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const now = new Date();
    setToday(`${dayNames[now.getDay()]}요일`);

    // 🔗 캘린더 페이지에서 저장한 일정(localStorage) 읽어오기
    try {
      const raw = localStorage.getItem("calendarEvents"); // CalendarPage의 STORAGE_KEYS.events와 맞춤
      if (!raw) {
        setCalendar([]);
        return;
      }

      type CalendarEvent = { date: string; title: string };
      const events: CalendarEvent[] = JSON.parse(raw) || [];

      const todayDate = new Date();
      const todayZero = new Date(
        todayDate.getFullYear(),
        todayDate.getMonth(),
        todayDate.getDate()
      ).getTime();

      const dayNames2 = ["일", "월", "화", "수", "목", "금", "토"];

      const upcoming: HomeCalendarItem[] = [];

      for (const ev of events) {
        if (!ev.date) continue;
        const [y, m, d] = ev.date.split("-").map(Number);
        if (!y || !m || !d) continue;

        const dateObj = new Date(y, m - 1, d);
        const diffMs = dateObj.getTime() - todayZero;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        // 🔎 오늘 ~ 7일 이내 일정만
        if (diffDays < 0 || diffDays > 7) continue;

        const dateLabel = `${m}월 ${d}일 (${dayNames2[dateObj.getDay()]})`;
        let ddayLabel = "";
        if (diffDays === 0) ddayLabel = "D-Day";
        else ddayLabel = `D-${diffDays}`;

        upcoming.push({
          dateLabel,
          event: ev.title,
          ddayLabel,
          diffDays,
        });
      }

      // 가까운 순으로 정렬
      upcoming.sort((a, b) => a.diffDays - b.diffDays);

      setCalendar(upcoming);
    } catch (e) {
      console.warn("홈 화면 일정 로드 오류:", e);
      setCalendar([]);
    }
  }, []);

  const popularPosts = [...posts]
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 3);

  // 👉 오늘 일정 / 이번 주 일정 분리
  const todayItems = calendar.filter((item) => item.diffDays === 0);
  const weekItems = calendar.filter((item) => item.diffDays > 0);

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "clamp(10px, 3vw, 20px)",
        backgroundColor: "#fff",
        borderRadius: "14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      }}
    >
      {/* ------------------ 상단 제목 ------------------ */}
      <h2
        style={{
          fontSize: "clamp(20px, 4vw, 28px)",
          fontWeight: 700,
          color: "#4FC3F7",
          marginBottom: "8px",
          textAlign: "center",
        }}
      >
        💙 학교 커뮤니티 메인
      </h2>

      <p
        style={{
          color: "#666",
          marginBottom: "28px",
          fontSize: "clamp(13px, 2.5vw, 16px)",
          textAlign: "center",
        }}
      >
        학생 생활을 한눈에 확인하세요 📚
      </p>

      {/* ------------------ 📆 오늘 일정 + 📅 이번 주 일정 (2열 레이아웃) ------------------ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "20px",
          marginBottom: "32px",
          alignItems: "flex-start",
        }}
      >
        {/* 📆 오늘 일정 */}
        <section>
          <h3
            style={{
              fontSize: "clamp(16px, 3vw, 20px)",
              fontWeight: 700,
              color: "#4FC3F7",
              borderBottom: "2px solid #4FC3F7",
              paddingBottom: "6px",
              marginBottom: "14px",
            }}
          >
            📆 오늘 일정
          </h3>

          {todayItems.length === 0 ? (
            <p style={{ color: "#888", fontSize: "14px" }}>
              오늘은 등록된 일정이 없습니다.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "10px",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              }}
            >
              {todayItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#E1F5FE",
                    borderRadius: "10px",
                    padding: "12px",
                    fontSize: "clamp(12px, 2.2vw, 15px)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <strong style={{ color: "#0277BD" }}>
                      {item.dateLabel}
                    </strong>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#c62828",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background: "#ffebee",
                      }}
                    >
                      {item.ddayLabel}
                    </span>
                  </div>
                  <p style={{ marginTop: "2px", color: "#555" }}>
                    {item.event}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 📅 이번 주 일정 */}
        <section>
          <h3
            style={{
              fontSize: "clamp(16px, 3vw, 20px)",
              fontWeight: 700,
              color: "#4FC3F7",
              borderBottom: "2px solid #4FC3F7",
              paddingBottom: "6px",
              marginBottom: "14px",
            }}
          >
            📅 이번 주 일정
          </h3>

          {weekItems.length === 0 ? (
            <p style={{ color: "#888", fontSize: "14px" }}>
              7일 이내에 등록된 일정이 없습니다.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "10px",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              }}
            >
              {weekItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#E1F5FE",
                    borderRadius: "10px",
                    padding: "12px",
                    fontSize: "clamp(12px, 2.2vw, 15px)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <strong style={{ color: "#0277BD" }}>
                      {item.dateLabel}
                    </strong>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#c62828",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background: "#ffebee",
                      }}
                    >
                      {item.ddayLabel}
                    </span>
                  </div>
                  <p style={{ marginTop: "2px", color: "#555" }}>
                    {item.event}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ------------------ 📚 오늘의 시간표 ------------------ */}
      <section style={{ marginBottom: "36px" }}>
        <h3
          style={{
            fontSize: "clamp(16px, 3vw, 20px)",
            fontWeight: 700,
            color: "#4FC3F7",
            borderBottom: "2px solid #4FC3F7",
            paddingBottom: "6px",
            marginBottom: "14px",
          }}
        >
          📚 오늘의 시간표 ({today})
        </h3>

        <TodayTimetable today={today} />
      </section>

      {/* ------------------ 🗓 주간 시간표 미리보기 ------------------ */}
      <TimetablePreview />

      {/* ------------------ 🔥 인기 게시물 ------------------ */}
      <section style={{ marginTop: "36px" }}>
        <h3
          style={{
            fontSize: "clamp(16px, 3vw, 20px)",
            fontWeight: 700,
            color: "#4FC3F7",
            borderBottom: "2px solid #4FC3F7",
            paddingBottom: "6px",
            marginBottom: "14px",
          }}
        >
          🔥 인기 게시물
        </h3>

        {popularPosts.length === 0 ? (
          <p style={{ color: "#888" }}>아직 게시글이 없습니다.</p>
        ) : (
          popularPosts.map((p) => {
            const categoryNames: Record<string, string> = {
              free: "자유",
              promo: "홍보",
              club: "동아리",
              grade1: "1학년",
              grade2: "2학년",
              grade3: "3학년",
            };

            return (
              <Link
                href={`/board/post/${p.id}`}
                key={p.id}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    backgroundColor: "white",
                    border: "2px solid #E1F5FE",
                    borderRadius: "12px",
                    padding: "14px",
                    marginBottom: "14px",
                    transition: "0.2s",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#E1F5FE")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "white")
                  }
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      backgroundColor: "#4FC3F7",
                      color: "white",
                      borderRadius: "6px",
                      fontSize: "clamp(11px, 2vw, 13px)",
                      fontWeight: 600,
                      marginBottom: "8px",
                    }}
                  >
                    {categoryNames[p.category || ""] || "기타"}
                  </span>

                  <h4
                    style={{
                      fontSize: "clamp(14px, 3vw, 17px)",
                      fontWeight: 600,
                      color: "#333",
                      marginBottom: "4px",
                    }}
                  >
                    {p.title}
                  </h4>

                  <p
                    style={{
                      fontSize: "clamp(12px, 2.3vw, 14px)",
                      color: "#555",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      whiteSpace: "normal",
                    }}
                  >
                    {p.content}
                  </p>

                  <div
                    style={{
                      fontSize: "clamp(11px, 2vw, 13px)",
                      color: "#777",
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "8px",
                    }}
                  >
                    <span>작성자: {p.author}</span>
                    <span>💙 {p.likes || 0}</span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </section>
    </div>
  );
}

/* ======================================================
   📘 TodayTimetable (오늘 시간표)
====================================================== */
function TodayTimetable({ today }: { today: string }) {
  const [todayList, setTodayList] = useState<any[] | null>(null);

  const subjectColors: Record<string, string> = {
    국어: "#FFCDD2",
    수학: "#BBDEFB",
    영어: "#C8E6C9",
    과학: "#D1C4E9",
    사회: "#FFE0B2",
    체육: "#B3E5FC",
    음악: "#F8BBD0",
    미술: "#DCEDC8",
    자율: "#FFF9C4",
    default: "#F5F5F5",
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("timetable");
      if (!saved) return setTodayList([]);

      const all = JSON.parse(saved);
      if (!Array.isArray(all)) return setTodayList([]);

      const short = today.replace("요일", "");

      const todayData = all
        .filter((c: any) => c && c.day === short && c.subject?.trim())
        .sort((a: any, b: any) => a.period - b.period);

      setTodayList(todayData);
    } catch {
      setTodayList([]);
    }
  }, [today]);

  if (!todayList || todayList.length === 0) {
    return (
      <p
        style={{
          color: "#777",
          background: "#E1F5FE",
          padding: "clamp(12px, 3vw, 16px)",
          borderRadius: "12px",
          fontSize: "clamp(12px, 3vw, 15px)",
        }}
      >
        오늘은 등록된 수업이 없습니다.
      </p>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#F3F9FF",
        borderRadius: "14px",
        padding: "clamp(12px, 3vw, 20px)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "clamp(10px, 2vw, 16px)",
      }}
    >
      {todayList.map((c, i) => {
        const colorKey =
          Object.keys(subjectColors).find((k) => c.subject.includes(k)) ||
          "default";

        return (
          <div
            key={i}
            style={{
              backgroundColor: subjectColors[colorKey],
              borderRadius: "12px",
              padding: "clamp(12px, 3vw, 16px)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: "clamp(13px, 3vw, 16px)",
                marginBottom: "4px",
              }}
            >
              {c.period}교시
            </div>

            <div
              style={{
                fontSize: "clamp(14px, 3vw, 17px)",
                fontWeight: 600,
                color: "#111",
              }}
            >
              {c.subject}
            </div>

            <div
              style={{
                fontSize: "clamp(12px, 2.2vw, 14px)",
                marginTop: "4px",
              }}
            >
              👨‍🏫 {c.teacher || "미입력"}
            </div>

            <div
              style={{
                fontSize: "clamp(12px, 2.2vw, 14px)",
                marginTop: "2px",
              }}
            >
              🏫 {c.room || "교실 미지정"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
