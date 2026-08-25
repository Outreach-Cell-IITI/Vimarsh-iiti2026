import { NextRequest, NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { checkAdminAuth } from "@/lib/adminAuth";
import { saveUploadedFile } from "@/lib/uploads";

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
    date: row.event_date, // ISO date string; frontend formats for display
    image: row.image_url || "",
    pdf: row.pdf_url || "",
    video: row.video_url || "",
  };
}

export async function GET(req: NextRequest) {
  await ensureSchema();
  const type = req.nextUrl.searchParams.get("type");

  if (type && !VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { success: false, message: `type must be one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const result = type
      ? await pool.query(
          "SELECT * FROM colloquium_events WHERE type = $1 ORDER BY event_date DESC, id DESC",
          [type]
        )
      : await pool.query("SELECT * FROM colloquium_events ORDER BY event_date DESC, id DESC");

    return NextResponse.json({ success: true, items: result.rows.map(toClientItem) });
  } catch (err) {
    console.error("List items error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  const authError = checkAdminAuth(req);
  if (authError) return authError;

  try {
    const formData = await req.formData();

    const type = (formData.get("type") as string) || "event";
    const speaker = formData.get("speaker") as string | null;
    const title = formData.get("title") as string | null;
    const series = (formData.get("series") as string) || "";
    const date = formData.get("date") as string | null;
    const video = (formData.get("video") as string) || "";

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { success: false, message: `type must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 }
      );
    }
    if (!speaker || !title || !date) {
      return NextResponse.json(
        { success: false, message: "speaker, title and date are required" },
        { status: 400 }
      );
    }

    let imageUrl = "";
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await saveUploadedFile(imageFile, "image");
    }

    let pdfUrl = "";
    const pdfFile = formData.get("pdf") as File | null;
    if (pdfFile && pdfFile.size > 0) {
      pdfUrl = await saveUploadedFile(pdfFile, "pdf");
    }

    const result = await pool.query(
      `INSERT INTO colloquium_events (type, speaker, title, series, event_date, image_url, pdf_url, video_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [type, speaker, title, series, date, imageUrl, pdfUrl, video]
    );

    return NextResponse.json({ success: true, item: toClientItem(result.rows[0]) }, { status: 201 });
  } catch (err) {
    console.error("Create item error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
