'use client'

import { useState, useEffect } from 'react'

export default function LibrarySearch() {
  const [query, setQuery] = useState('')
  const [searchBooks, setSearchBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const PAGES = Array.from({ length: 15 }, (_, i) => i + 1)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)

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

            <button onClick={handleSearch} className="search-button">
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
            {PAGES.map((num) => (
              <button
                key={num}
                className={`page-btn ${page === num ? 'active' : ''}`}
                onClick={() => setPage(num)}
              >
                {num}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---------------- CSS 직접 삽입 ---------------- */}
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

        /* 검색창 */
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
          transition: 0.2s;
        }

        .search-button:hover {
          background: #1d4ed8;
        }

        .loading {
          font-size: 22px;
          color: #666;
          margin-top: 20px;
        }

        /* 결과 리스트 */
        .result-list {
          margin-top: 30px;
          max-width: 720px;
          margin-left: auto;
          margin-right: auto;
        }

        .book-item {
          display: flex;
          gap: 32px;
          padding: 24px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transition: 0.2s;
        }

        .book-item:hover {
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }

        .book-cover {
          width: 150px;
          height: 220px;
          object-fit: cover;
          border-radius: 16px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }

        .book-info {
          text-align: left;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .book-title {
          font-size: 26px;
          font-weight: bold;
        }

        .book-author {
          margin-top: 12px;
          font-size: 18px;
          color: #555;
        }

        .book-date {
          margin-top: 20px;
          font-size: 16px;
          color: #777;
        }

        .divider {
          margin: 28px 0;
          border: none;
          border-bottom: 1px solid #ccc;
        }

        /* 페이지네이션 */
        .pagination {
          display: flex;
          justify-content: center;
          margin-top: 50px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .page-btn {
          padding: 12px 18px;
          font-size: 18px;
          background: #e5e7eb;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: 0.15s;
          font-weight: 600;
        }

        .page-btn:hover {
          background: #d1d5db;
        }

        .page-btn.active {
          background: #2563eb;
          color: white;
          box-shadow: 0 4px 15px rgba(37,99,235,0.4);
        }
      `}</style>
    </>
  )
}
