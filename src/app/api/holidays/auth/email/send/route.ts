import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs"; // nodemailer는 edge에서 안됨

export async function POST(req: Request) {
    const { email } = await req.json();

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Gmail SMTP
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER!,
            pass: process.env.EMAIL_PASS!,
        },
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER!,
        to: email,
        subject: "학교 커뮤니티 앱 이메일 인증코드",
        text: `인증코드: ${code}`,
    });

    // 코드 저장 (임시)
    globalThis.emailVerifyCode = code;

    return NextResponse.json({ success: true });
}
