import { NextResponse } from "next/server";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true });

  const clearCookie = {
    maxAge: 0,
    path: "/",
  };

  response.cookies.set("koptal_role", "", clearCookie);
  response.cookies.set("koptal_user_id", "", clearCookie);
  response.cookies.set("koptal_token", "", clearCookie);
  response.cookies.set("koptal_name", "", clearCookie);

  return response;
}
