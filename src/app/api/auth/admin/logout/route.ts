import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ data: { ok: true } });
  res.cookies.set("admin_token", "", { maxAge: 0, path: "/" });
  return res;
}
