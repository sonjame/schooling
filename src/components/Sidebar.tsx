'use client';
import Link from "next/link";

export default function Sidebar() {
    return (
        <div
            style={{
                width: "160px",
                background: "#4FC3F7",
                padding: "20px",
                minHeight: "100vh",
                color: "white",
                fontWeight: 700,
                boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
            }}
        >
            <div
                style={{
                    fontSize: "20px",
                    marginBottom: "30px",
                    cursor: "pointer",
                    textDecoration: "none",
                }}
            >
                <Link
                    href="/"
                    style={{
                        color: "white",
                        textDecoration: "none",
                    }}
                >
                    School <br /> Community
                </Link>
            </div>

            {/* 메뉴 공통 스타일 */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <Link href="/board" style={menuBtn}>
                    📝 게시판
                </Link>

                <Link href="/calendar" style={menuBtn}>
                    🏫 일정
                </Link>

                <Link href="/timetable" style={menuBtn}>
                    ⏱ 시간표
                </Link>

                <Link href="/scores" style={menuBtn}>
                    📚 모의고사
                </Link>
            </nav>
        </div>
    );
}

/* 공통 스타일 */
const menuBtn: React.CSSProperties = {
    background: "rgba(255,255,255,0.25)",
    padding: "12px 16px",
    borderRadius: "10px",
    color: "white",
    fontWeight: 600,
    display: "block",
    textDecoration: "none",   // ← 밑줄 제거!
    fontSize: "15px",
    transition: "0.15s",
};
