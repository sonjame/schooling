"use client";

import { useParams } from "next/navigation";
import BoardTemplate from "../BoardTemplate";

export default function CategoryPage() {
    // URL에서 /board/free 같은 경로의 free 부분을 가져옴
    const params = useParams<{ category: string }>();
    const category = params?.category;

    const boardConfig: Record<string, { title: string; storageKey: string }> = {
        free: { title: "자유게시판", storageKey: "board_free" },
        promo: { title: "홍보게시판", storageKey: "board_promo" },
        club: { title: "동아리게시판", storageKey: "board_club" },
        grade1: { title: "1학년게시판", storageKey: "board_grade1" },
        grade2: { title: "2학년게시판", storageKey: "board_grade2" },
        grade3: { title: "3학년게시판", storageKey: "board_grade3" },
    };

    // category가 없거나, 설정에 없는 값이면 에러 문구 출력
    if (!category || !boardConfig[category]) {
        return <div style={{ padding: 20 }}>존재하지 않는 게시판입니다.</div>;
    }

    const config = boardConfig[category];

    return (
        <BoardTemplate
            title={config.title}
            category={category}
            storageKey={config.storageKey}
        />
    );
}
