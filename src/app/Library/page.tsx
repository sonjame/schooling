'use client'

import { useState, useEffect } from 'react'

export default function LibrarySearch() {
  const [query, setQuery] = useState('')
  const [searchBooks, setSearchBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  // 🔵 1~20 페이지 구성
  const PAGES = Array.from({ length: 20 }, (_, i) => i + 1)

  // 🔵 페이지 그룹(1=1~5 / 2=6~10 / 3=11~15 / 4=16~20)
  const GROUP_SIZE = 5
  const TOTAL_GROUPS = Math.ceil(PAGES.length / GROUP_SIZE)
  const [pageGroup, setPageGroup] = useState(1)

  const start = (pageGroup - 1) * GROUP_SIZE + 1
  const end = pageGroup * GROUP_SIZE
  const visiblePages = PAGES.slice(start - 1, end)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)

    // 🔵 검색하면 화면 맨 위로
    window.scrollTo({ top: 0, behavior: 'smooth' })

    const res = await fetch(`/api/aladin/search?q=${query}&page=${page}`)
    const data = await res.json()

    setSearchBooks(data.item || [])
    setLoading(false)
  }

  useEffect(() => {
    if (query.trim() !== '') handleSearch()
  }, [page])

  return (
    <>
      <div className="container">
        <h1 className="title">
          <span className="material-symbols-rounded icon-large">search</span>
          도서 검색
        </h1>

        {/* 검색창 */}
        <div className="search-area">
          <div className="search-box">
            <span className="material-symbols-rounded icon">search</span>

            <input
              className="search-input"
              placeholder="검색어를 입력하세요"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <button
              onClick={() => {
                handleSearch()
                window.scrollTo({ top: 0, behavior: 'smooth' }) // 검색 후 맨 위
              }}
              className="search-button"
            >
              검색
            </button>
          </div>
        </div>

        {loading && <p className="loading">⏳ 검색 중입니다...</p>}

        {/* 검색 결과 */}
        {searchBooks.length > 0 && (
          <div className="result-list">
            {searchBooks.map((book: any, i) => (
              <a
                key={book.isbn}
                href={book.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="book-item">
                  <img src={book.cover} className="book-cover" />

                  <div className="book-info">
                    <div>
                      <h3 className="book-title">
                        {book.title.length > 60
                          ? book.title.slice(0, 60) + '…'
                          : book.title}
                      </h3>
                      <p className="book-author">{book.author}</p>
                    </div>

                    <p className="book-date">{book.pubDate}</p>
                  </div>
                </div>

                {i !== searchBooks.length - 1 && <hr className="divider" />}
              </a>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {searchBooks.length > 0 && (
          <div className="pagination">
            {/* 이전 그룹 */}
            <button
              className="page-btn"
              onClick={() => {
                setPageGroup((g) => g - 1)
                window.scrollTo({ top: 0, behavior: 'smooth' }) // 맨 위로 이동
              }}
              disabled={pageGroup === 1}
            >
              이전
            </button>

            {/* 번호 */}
            {visiblePages.map((num) => (
              <button
                key={num}
                className={`page-btn ${page === num ? 'active' : ''}`}
                onClick={() => {
                  setPage(num)
                  window.scrollTo({ top: 0, behavior: 'smooth' }) // 페이지 이동 시 맨 위
                }}
              >
                {num}
              </button>
            ))}

            {/* 다음 그룹 */}
            <button
              className="page-btn"
              onClick={() => {
                setPageGroup((g) => g + 1)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              disabled={pageGroup === TOTAL_GROUPS}
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* 아래 CSS는 네 기존 코드 그대로 유지됨 */}
      <style>{`
        .container {
          max-width: 960px;
          margin: auto;
          padding: 30px;
          text-align: center;
          font-family: Inter, sans-serif;
        }

        .title {
          font-size: 36px;
          font-weight: bold;
          display: flex;
          justify-content: center;
          gap: 16px;
          align-items: center;
          margin-bottom: 40px;
        }

        .icon-large {
          font-size: 48px;
          color: #3b82f6;
        }

        .search-area {
          display: flex;
          justify-content: center;
          margin-bottom: 40px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          max-width: 720px;
          padding: 16px 24px;
          background: white;
          border: 1px solid #ccc;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
        }

        .icon {
          font-size: 30px;
          color: gray;
        }

        .search-input {
          flex: 1;
          font-size: 16px;
          border: none;
          outline: none;
        }

        .search-button {
          padding: 8px 18px;
          background: #2563eb;
          color: white;
          font-size: 16px;
          border-radius: 12px;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }

        .loading {
          font-size: 22px;
          color: #666;
        }

        .result-list {
          margin-top: 30px;
          max-width: 720px;
          margin-left: auto;
          margin-right: auto;
        }

        .book-item {
          display: flex;
          gap: 20px;
          padding: 20px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 18px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transition: 0.2s;
        }

        .book-item:hover {
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }

        .book-cover {
          width: 140px;
          height: 200px;
          object-fit: cover;
          border-radius: 12px;
        }

        .book-info {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: left;
        }

        .book-title {
          font-size: 22px;
          font-weight: bold;
        }

        .book-author {
          margin-top: 10px;
          font-size: 16px;
          color: #555;
        }

        .book-date {
          margin-top: 16px;
          font-size: 14px;
          color: #777;
        }

        .divider {
          margin: 20px 0;
          border-bottom: 1px solid #ccc;
        }

        .pagination {
          display: flex;
          justify-content: center;
          margin-top: 40px;
          gap: 10px;
          flex-wrap: wrap;
        }

        .page-btn {
          padding: 10px 14px;
          font-size: 16px;
          border-radius: 10px;
          background: #e5e7eb;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }

        .page-btn.active {
          background: #2563eb;
          color: white;
          box-shadow: 0 4px 15px rgba(37,99,235,0.4);
        }

        /* 📱 모바일 최적화 */
        @media (max-width: 480px) {
          .book-item {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }

          .book-cover {
            width: 120px;
            height: 180px;
            margin: auto;
          }

          .book-title {
            font-size: 18px;
          }

          .book-author {
            font-size: 14px;
          }

          .pagination {
            gap: 6px;
            margin-top: 30px;
          }

          .page-btn {
            padding: 6px 10px;
            font-size: 12px;
            border-radius: 6px;
          }
        }
      `}</style>
    </>
  )
}
