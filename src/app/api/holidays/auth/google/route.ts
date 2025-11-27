import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ⭐ 반드시 추가 (안하면 오류)

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

export async function GET() {
    const authUrl =
        "https://accounts.google.com/o/oauth2/v2/auth" +
        "?response_type=code" +
        `&client_id=${GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}` +
        "&scope=openid%20email%20profile" +
        "&access_type=offline";

    return NextResponse.redirect(authUrl);
}
