import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  for (const name of ["koptal_role", "koptal_user_id", "koptal_token"]) {
    response.cookies.set(name, "", { maxAge: 0, path: "/" });
  }

  return response;
}
