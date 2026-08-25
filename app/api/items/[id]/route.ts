import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { pool, ensureSchema } from "@/lib/db";
import { checkAdminAuth } from "@/lib/adminAuth";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/uploads";

const VALID_TYPES = ["event", "colloquium"];

interface ColloquiumRow extends RowDataPacket {
  id: number;
  type: string;
  speaker: string;
  title: string;
  series: string | null;
  event_date: string;
  image_url: string | null;
  pdf_url: string | null;
  video_url: string | null;
}

function toClientItem(row: ColloquiumRow) {
  return {
    id: row.id,
    type: row.type,
    speaker: row.speaker,
    title: row.title,
    series: row.series || "",
    date: row.event_date,
    image: row.image_url || "",
    pdf: row.pdf_url || "",
    video: row.video_url || "",
  };
}

function isValidId(id: string): boolean {
  return /^\d+$/.test(id);
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  await ensureSchema();
  const { id } = await params;

  if (!isValidId(id)) {
    return NextResponse.json({ success: false, message: "Invalid item ID" }, { status: 400 });
  }

  try {
    const [rows] = await pool.query<ColloquiumRow[]>(
      "SELECT * FROM colloquium_events WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, item: toClientItem(rows[0]) });
  } catch {
    return NextResponse.json({ success: false, message: "Invalid item ID" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  await ensureSchema();
  const authError = checkAdminAuth(req);
  if (authError) return authError;

  const { id } = await params;

  if (!isValidId(id)) {
    return NextResponse.json({ success: false, message: "Invalid item ID" }, { status: 400 });
  }

  try {
    const [existingRows] = await pool.query<ColloquiumRow[]>(
      "SELECT * FROM colloquium_events WHERE id = ?",
      [id]
    );
    if (existingRows.length === 0) {
      return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
    }
    const current = existingRows[0];

    const formData = await req.formData();
    const type = formData.get("type") as string | null;
    const speaker = formData.get("speaker") as string | null;
    const title = formData.get("title") as string | null;
    const series = formData.get("series") as string | null;
    const date = formData.get("date") as string | null;
    const video = formData.get("video") as string | null;
    const removeImage = formData.get("removeImage") as string | null;
    const removePdf = formData.get("removePdf") as string | null;

    if (type && !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { success: false, message: `type must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    let imageUrl = current.image_url || "";
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      deleteUploadedFile(current.image_url || "");
      imageUrl = await saveUploadedFile(imageFile, "image");
    } else if (removeImage === "true") {
      deleteUploadedFile(current.image_url || "");
      imageUrl = "";
    }

    let pdfUrl = current.pdf_url || "";
    const pdfFile = formData.get("pdf") as File | null;
    if (pdfFile && pdfFile.size > 0) {
      deleteUploadedFile(current.pdf_url || "");
      pdfUrl = await saveUploadedFile(pdfFile, "pdf");
    } else if (removePdf === "true") {
      deleteUploadedFile(current.pdf_url || "");
      pdfUrl = "";
    }

    await pool.query(
      `UPDATE colloquium_events
       SET type = ?, speaker = ?, title = ?, series = ?, event_date = ?,
           image_url = ?, pdf_url = ?, video_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        type || current.type,
        speaker ?? current.speaker,
        title ?? current.title,
        series ?? current.series,
        date || current.event_date,
        imageUrl,
        pdfUrl,
        video ?? current.video_url,
        id,
      ]
    );

    const [rows] = await pool.query<ColloquiumRow[]>(
      "SELECT * FROM colloquium_events WHERE id = ?",
      [id]
    );

    return NextResponse.json({ success: true, item: toClientItem(rows[0]) });
  } catch (err) {
    console.error("Update item error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  await ensureSchema();
  const authError = checkAdminAuth(req);
  if (authError) return authError;

  const { id } = await params;

  if (!isValidId(id)) {
    return NextResponse.json({ success: false, message: "Invalid item ID" }, { status: 400 });
  }

  try {
    const [existingRows] = await pool.query<ColloquiumRow[]>(
      "SELECT * FROM colloquium_events WHERE id = ?",
      [id]
    );
    if (existingRows.length === 0) {
      return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
    }
    const current = existingRows[0];

    await pool.query("DELETE FROM colloquium_events WHERE id = ?", [id]);

    deleteUploadedFile(current.image_url || "");
    deleteUploadedFile(current.pdf_url || "");

    return NextResponse.json({ success: true, message: "Item deleted successfully" });
  } catch (err) {
    console.error("Delete item error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}