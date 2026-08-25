"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";
import { VimarshItem, ItemType, resolveMediaUrl } from "@/lib/api";

type Props = {
  type: ItemType;
  item: VimarshItem | null; // null = creating a new item
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
};

const toInputDate = (isoDate: string) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

export default function ItemForm({ type, item, onClose, onSave }: Props) {
  const [speaker, setSpeaker] = useState(item?.speaker || "");
  const [title, setTitle] = useState(item?.title || "");
  const [series, setSeries] = useState(
    item?.series || (type === "colloquium" ? "Institute Colloquium" : "Institute Public Lecture - VIMARSH")
  );
  const [date, setDate] = useState(toInputDate(item?.date || ""));
  const [video, setVideo] = useState(item?.video || "");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [removePdf, setRemovePdf] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const existingImageUrl = item?.image ? resolveMediaUrl(item.image) : "";
  const existingPdfUrl = item?.pdf ? resolveMediaUrl(item.pdf) : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!speaker.trim() || !title.trim() || !date) {
      setError("Speaker, title and date are required.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("speaker", speaker.trim());
      formData.append("title", title.trim());
      formData.append("series", series.trim());
      formData.append("date", date);
      formData.append("video", video.trim());
      if (imageFile) formData.append("image", imageFile);
      if (removeImage) formData.append("removeImage", "true");
      if (pdfFile) formData.append("pdf", pdfFile);
      if (removePdf) formData.append("removePdf", "true");

      await onSave(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-slate-900">
              {item ? "Edit" : "Add"} {type === "colloquium" ? "Institute Colloquium" : "Event"}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Speaker *</label>
              <textarea
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                required
                rows={2}
                placeholder="e.g. Prof. Jane Doe, Director, XYZ Institute"
                className="w-full px-4 py-2 border border-slate-700 text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Talk Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. India going to the Moon"
                className="w-full px-4 py-2 border border-slate-700 text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Series / Tag</label>
              <input
                type="text"
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                placeholder="e.g. Institute Colloquium"
                className="w-full px-4 py-2 border border-slate-700 text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-700 text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Video Link (YouTube)</label>
                <input
                  type="url"
                  value={video}
                  onChange={(e) => setVideo(e.target.value)}
                  placeholder="https://youtu.be/..."
                  className="w-full px-4 py-2 border border-slate-700 text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Poster image */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Poster / Flyer Image</label>
              {existingImageUrl && !removeImage && (
                <div className="mb-3 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={existingImageUrl} alt="Current poster" className="w-20 h-20 object-cover rounded border" />
                  <button
                    type="button"
                    onClick={() => setRemoveImage(true)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove current image
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {imageFile && (
                <p className="text-xs text-slate-500 mt-1">New file selected: {imageFile.name}</p>
              )}
            </div>

            {/* PDF flyer */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">PDF Flyer (optional)</label>
              {existingPdfUrl && !removePdf && (
                <div className="mb-3 flex items-center gap-3 text-sm">
                  <a href={existingPdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View current PDF
                  </a>
                  <button
                    type="button"
                    onClick={() => setRemovePdf(true)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove current PDF
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {pdfFile && <p className="text-xs text-slate-500 mt-1">New file selected: {pdfFile.name}</p>}
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="w-5 h-5" />
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 border border-slate-700 text-gray-600 rounded-lg font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
