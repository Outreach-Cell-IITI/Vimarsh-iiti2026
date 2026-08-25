import fs from "fs";
import path from "path";
import crypto from "crypto";

// Files are stored OUTSIDE /public, in a dedicated `uploads/` folder at the
// project root, and served through app/uploads/[...path]/route.ts instead
// of Next's static /public serving. This is intentional: Next.js's
// production server builds a manifest of /public contents at build time,
// so files written there AFTER the build (i.e. anything an admin uploads
// later) are not reliably served. Reading them via a route handler avoids
// that entirely and always reflects what's actually on disk.
const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
const IMAGE_DIR = path.join(UPLOAD_ROOT, "images");
const PDF_DIR = path.join(UPLOAD_ROOT, "pdfs");

for (const dir of [IMAGE_DIR, PDF_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function saveUploadedFile(file: File, kind: "image" | "pdf"): Promise<string> {
  if (kind === "pdf" && file.type !== "application/pdf") {
    throw new Error("Only PDF files are allowed for the pdf field");
  }
  if (kind === "image" && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Only image files (jpg, png, gif, webp) are allowed");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size too large (max 10MB)");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name).toLowerCase();
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  const dir = kind === "pdf" ? PDF_DIR : IMAGE_DIR;

  fs.writeFileSync(path.join(dir, filename), buffer);

  return kind === "pdf" ? `/uploads/pdfs/${filename}` : `/uploads/images/${filename}`;
}

export function deleteUploadedFile(relativePath: string) {
  if (!relativePath) return;
  if (!relativePath.startsWith("/uploads/")) return; // external URL or legacy static asset - leave it
  const filename = path.basename(relativePath);
  const dir = relativePath.includes("/pdfs/") ? PDF_DIR : IMAGE_DIR;
  const fullPath = path.join(dir, filename);
  fs.unlink(fullPath, (err) => {
    if (err && (err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Failed to delete file:", fullPath, err.message);
    }
  });
}

export { UPLOAD_ROOT };
