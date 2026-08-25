import { NextRequest, NextResponse } from "next/server";


export function checkAdminAuth(req: NextRequest): NextResponse | null {
  if (!process.env.ADMIN_SECRET) {
    console.error("ADMIN_SECRET is not set in the environment!");
    return NextResponse.json(
      { success: false, message: "Server misconfigured" },
      { status: 500 }
    );
  }

  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json(
      { success: false, message: "Admin access denied" },
      { status: 403 }
    );
  }

  return null;
}
