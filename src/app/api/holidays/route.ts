import { NextResponse } from "next/server";
import { getHolidays } from "@kokr/date";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";   // ★★ 가장 중요 ★★

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get("year");
    const year = yearParam ? Number(yearParam) : new Date().getFullYear();

    const raw = await getHolidays(year);
    const onlyHolidays = raw.filter((h: any) => h.holiday === true);

    return NextResponse.json(onlyHolidays, { status: 200 });
  } catch (err) {
    console.error("❌ [/api/holidays] error:", err);
    return NextResponse.json(
      { message: "failed to load holidays" },
      { status: 500 }
    );
  }
}
