'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Post {
    id: string
    title: string
    content: string
    author: string
    likes: number
    createdAt: number
    category: string
}

export default function ScrapPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [user, setUser] = useState<string | null>(null)

    const boardKeys = [
        'board_free',
        'board_promo',
        'board_club',
        'board_grade1',
        'board_grade2',
        'board_grade3',
    ]

    useEffect(() => {
        const current = localStorage.getItem('loggedInUser')
        if (!current) return

        setUser(current)

        const scrapKey = `scrap_${current}`
        const scrapedIds: string[] = JSON.parse(localStorage.getItem(scrapKey) || '[]')

        let scrapedPosts: Post[] = []

        boardKeys.forEach((key) => {
            const list = JSON.parse(localStorage.getItem(key) || '[]')
            const matches = list.filter((p: Post) => scrapedIds.includes(p.id))
            scrapedPosts = [...scrapedPosts, ...matches]
        })

        setPosts(scrapedPosts)
    }, [])

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ fontSize: '22px', marginBottom: '16px' }}>⭐ 스크랩한 글</h2>

            {posts.length === 0 ? (
                <p>스크랩한 글이 없습니다.</p>
            ) : (
                posts.map((p) => (
                    <Link
                        href={`/board/post/${p.id}`}
                        key={p.id}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <div
                            style={{
                                background: 'white',
                                padding: '16px',
                                marginBottom: '12px',
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                            }}
                        >
                            <h3>{p.title}</h3>
                            <small>{new Date(p.createdAt).toLocaleString()}</small>
                        </div>
                    </Link>
                ))
            )}
        </div>
    )
}
