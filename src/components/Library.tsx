'use client'

import { useEffect, useState } from 'react'
import Head from 'next/head'

export default function LibraryRecommend() {
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  // 🔵 전체 페이지 목록 (1~20)
  const PAGES = Array.from({ length: 20 }, (_, i) => i + 1)

  // 🔵 페이지 그룹 (1 = 1~5, 2 = 6~10, 3 = 11~15, 4 = 16~20)
  const GROUP_SIZE = 5
  const TOTAL_GROUPS = Math.ceil(PAGES.length / GROUP_SIZE)

  const [pageGroup, setPageGroup] = useState(1)

  // 🔵 현재 표시되는 페이지 번호
  const start = (pageGroup - 1) * GROUP_SIZE + 1
  const end = pageGroup * GROUP_SIZE
  const visiblePages = PAGES.slice(start - 1, end)

  const loadBooks = () => {
    setLoading(true)

    fetch(`/api/aladin/recommend?page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        setBooks(data.item || [])
        setLoading(false)
      })
  }

  useEffect(() => {
    loadBooks()
  }, [page])

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:FILL@0;1&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="container">
        <h2 className="section-title">
          <span className="material-symbols-rounded title-icon">
            auto_stories
          </span>
          오늘의 추천도서
        </h2>

        <div className="section-box">
          {loading && <p className="loading">⏳ 불러오는 중...</p>}

          {!loading && books.length > 0 && (
            <div className="book-list">
              {books.map((book: any, i) => (
                <a
                  key={book.isbn}
                  href={book.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="book-card">
                    <img src={book.cover} className="book-cover" />
                    <div className="book-info">
                      <div>
                        <h3 className="book-title">
                          {book.title.length > 55
                            ? book.title.slice(0, 55) + '…'
                            : book.title}
                        </h3>
                        <p className="book-author">{book.author}</p>
                      </div>
                      <p className="book-date">{book.pubDate}</p>
                    </div>
                  </div>

                  {i !== books.length - 1 && <hr className="divider" />}
                </a>
              ))}
            </div>
          )}

          {!loading && books.length === 0 && (
            <p className="no-data">추천 도서를 불러오지 못했습니다.</p>
          )}

          {/* 🔵 페이지네이션 */}
          <div className="pagination">
            {/* 이전 그룹 */}
            <button
              className="page-btn"
              onClick={() => setPageGroup((g) => g - 1)}
              disabled={pageGroup === 1}
            >
              이전
            </button>

            {/* 페이지 번호 */}
            {visiblePages.map((num) => (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`page-btn ${page === num ? 'active' : ''}`}
              >
                {num}
              </button>
            ))}

            {/* 다음 그룹 */}
            <button
              className="page-btn"
              onClick={() => setPageGroup((g) => g + 1)}
              disabled={pageGroup === TOTAL_GROUPS}
            >
              다음
            </button>
          </div>
        </div>
      </div>

      {/* CSS — 디자인 그대로 유지 + 모바일 최적화 추가 */}
      <style>{`
        .container {
          max-width: 960px;
          margin: auto;
          padding: 10px 20px 40px;
          font-family: 'Inter', sans-serif;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 22px;
          font-weight: 600;
          color: #2563EB;
          margin-bottom: 14px;
        }

        .title-icon {
          font-size: 26px;
          color: #2563EB;
        }

        .section-box {
          background: #F0F7FF;
          border: 1px solid #C9DEFF;
          border-radius: 18px;
          padding: 26px 28px;
          box-shadow: 0px 2px 6px rgba(0,0,0,0.05);
        }

        .loading {
          text-align: center;
          margin: 40px 0;
          font-size: 18px;
          color: #6B7280;
        }

        .book-list {
          margin-top: 10px;
        }

        .book-card {
          display: flex;
          gap: 18px;
          padding: 18px;
          background: white;
          border: 1px solid #E3E9F2;
          border-radius: 14px;
          transition: all 0.18s ease;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }

        .book-card:hover {
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .book-cover {
          width: 90px;
          height: 130px;
          object-fit: cover;
          border-radius: 10px;
          box-shadow: 0 3px 6px rgba(0,0,0,0.15);
        }

        .book-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .book-title {
          font-size: 17px;
          font-weight: 600;
          line-height: 1.3;
          color: #111827;
        }

        .book-author {
          margin-top: 6px;
          font-size: 13px;
          color: #6B7280;
        }

        .book-date {
          margin-top: 12px;
          font-size: 12px;
          color: #9CA3AF;
        }

        .divider {
          border: none;
          border-bottom: 1px solid #D1D5DB;
          margin: 20px 0;
        }

        .pagination {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 26px;
        }

        .page-btn {
          padding: 8px 14px;
          font-size: 14px;
          border-radius: 10px;
          border: 1px solid #C9DEFF;
          background: white;
          color: #2563EB;
          font-weight: 600;
          cursor: pointer;
          transition: 0.15s;
        }

        .page-btn.active {
          background: #2563EB;
          color: white;
          box-shadow: 0px 2px 8px rgba(37,99,235,0.35);
        }

        .page-btn:hover {
          background: #E3EEFF;
        }

        .page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .no-data {
          text-align: center;
          color: #6B7280;
          font-size: 16px;
          margin-top: 30px;
        }

        /* 📱 모바일 페이지네이션 사이즈 축소 */
        @media (max-width: 480px) {
          .pagination {
            gap: 6px;
            margin-top: 20px;
          }

          .page-btn {
            padding: 6px 10px;
            font-size: 12px;
            border-radius: 8px;
          }

          .page-btn.active {
            box-shadow: 0px 1px 4px rgba(37,99,235,0.3);
          }
        }
      `}</style>
    </>
  )
}
