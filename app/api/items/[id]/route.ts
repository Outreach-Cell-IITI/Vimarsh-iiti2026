import { NextRequest, NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { checkAdminAuth } from "@/lib/adminAuth";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/uploads";

const VALID_TYPES = ["event", "colloquium"];

type ColloquiumRow = {
  id: number;
  type: string;
  speaker: string;
  title: string;
  series: string | null;
  event_date: string;
  image_url: string | null;
  pdf_url: string | null;
  video_url: string | null;
};

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

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  await ensureSchema();
  const { id } = await params;
  try {
    const result = await pool.query("SELECT * FROM colloquium_events WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, item: toClientItem(result.rows[0]) });
  } catch {
    return NextResponse.json({ success: false, message: "Invalid item ID" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  await ensureSchema();
  const authError = checkAdminAuth(req);
  if (authError) return authError;

  const { id } = await params;

  try {
    const existing = await pool.query("SELECT * FROM colloquium_events WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
    }
    const current: ColloquiumRow = existing.rows[0];

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

    const result = await pool.query(
      `UPDATE colloquium_events
       SET type = $1, speaker = $2, title = $3, series = $4, event_date = $5,
           image_url = $6, pdf_url = $7, video_url = $8, updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
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

    return NextResponse.json({ success: true, item: toClientItem(result.rows[0]) });
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

  try {
    const existing = await pool.query("SELECT * FROM colloquium_events WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
    }
    const current: ColloquiumRow = existing.rows[0];

    await pool.query("DELETE FROM colloquium_events WHERE id = $1", [id]);

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
