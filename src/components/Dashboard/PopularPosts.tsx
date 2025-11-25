'use client'
export default function PopularPosts() {
  // ✅ export default
  const posts = [
    { id: 1, title: '학교 축제 일정 공유', likes: 15 },
    { id: 2, title: '중간고사 꿀팁 모음', likes: 12 },
    { id: 3, title: '급식 맛있었던 날 BEST', likes: 9 },
  ]

  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>
          <strong>{p.title}</strong> — ❤️ {p.likes}
        </li>
      ))}
    </ul>
  )
}
