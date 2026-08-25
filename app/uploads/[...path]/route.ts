import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { UPLOAD_ROOT } from "@/lib/uploads";

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

type Params = { params: Promise<{ path: string[] }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { path: segments } = await params;

  // Resolve against UPLOAD_ROOT and make sure the result is still inside
  // it - blocks ../ traversal attempts regardless of how segments arrive.
  const requestedPath = path.join(UPLOAD_ROOT, ...segments);
  const resolved = path.normalize(requestedPath);

  if (!resolved.startsWith(UPLOAD_ROOT)) {
    return NextResponse.json({ success: false, message: "Invalid path" }, { status: 400 });
  }

  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  const ext = path.extname(resolved).toLowerCase();
  const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
  const fileBuffer = fs.readFileSync(resolved);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
