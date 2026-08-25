"use client";

import { useEffect, useState, useCallback } from "react";
import { Lock, Eye, EyeOff, Plus, Edit2, Trash2, LogOut, ExternalLink } from "lucide-react";
import { ItemType, VimarshItem, resolveMediaUrl, formatDisplayDate } from "@/lib/api";
import ItemForm from "./ItemForm";

const SECRET_STORAGE_KEY = "vimarsh_admin_secret";

type Banner = { type: "success" | "error"; message: string } | null;

export default function AdminPanel() {
  const [secret, setSecret] = useState("");
  const [secretInput, setSecretInput] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(
    () => typeof window !== "undefined" && Boolean(sessionStorage.getItem(SECRET_STORAGE_KEY))
  );
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<ItemType>("event");
  const [items, setItems] = useState<VimarshItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<VimarshItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const showBanner = useCallback((b: Banner) => {
    setBanner(b);
    if (b) setTimeout(() => setBanner(null), 4000);
  }, []);

  /* ---------------- AUTH ---------------- */

  const verifySecret = useCallback(async (candidate: string) => {
    const res = await fetch("/api/admin/verify", {
      headers: { "x-admin-secret": candidate },
    });
    return res.ok;
  }, []);

  // On mount, try to restore a previously verified session.
  // checkingAuth's initial value already reflects whether there's a stored
  // secret to verify, so this effect only needs to act when one exists.
  useEffect(() => {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem(SECRET_STORAGE_KEY) : null;
    if (!stored) return;

    verifySecret(stored).then((ok) => {
      if (ok) {
        setSecret(stored);
        setAuthorized(true);
      } else {
        sessionStorage.removeItem(SECRET_STORAGE_KEY);
      }
      setCheckingAuth(false);
    });
  }, [verifySecret]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretInput.trim()) {
      setLoginError("Enter the admin secret.");
      return;
    }
    setLoginLoading(true);
    setLoginError("");
    try {
      const ok = await verifySecret(secretInput.trim());
      if (!ok) {
        setLoginError("Incorrect admin secret.");
        return;
      }
      sessionStorage.setItem(SECRET_STORAGE_KEY, secretInput.trim());
      setSecret(secretInput.trim());
      setAuthorized(true);
    } catch {
      setLoginError("Could not reach the backend. Is it running?");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SECRET_STORAGE_KEY);
    setSecret("");
    setSecretInput("");
    setAuthorized(false);
  };

  /* ---------------- DATA ---------------- */

  const loadItems = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetch(`/api/items?type=${activeTab}`, { cache: "no-store" });
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      showBanner({ type: "error", message: "Failed to load items." });
    } finally {
      setListLoading(false);
    }
  }, [activeTab, showBanner]);

  useEffect(() => {
    if (!authorized) return;
    // loadItems sets listLoading before its first await; that's the actual
    // data-sync work this effect exists to do (refetch when the tab or auth
    // state changes), so it's an intentional exception to set-state-in-effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadItems();
  }, [authorized, activeTab, loadItems]);

  /* ---------------- CREATE / EDIT ---------------- */

  const openCreateForm = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const openEditForm = (item: VimarshItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleSave = async (formData: FormData) => {
    const isEdit = Boolean(editingItem);
    const url = isEdit ? `/api/items/${editingItem!.id}` : "/api/items";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "x-admin-secret": secret },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to save");
    }

    setShowForm(false);
    setEditingItem(null);
    showBanner({ type: "success", message: isEdit ? "Updated successfully." : "Added successfully." });
    loadItems();
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "DELETE",
        headers: { "x-admin-secret": secret },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete");
      showBanner({ type: "success", message: "Deleted." });
      loadItems();
    } catch (err) {
      showBanner({ type: "error", message: err instanceof Error ? err.message : "Failed to delete" });
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------------- RENDER ---------------- */

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 w-full max-w-sm"
        >
          <div className="flex flex-col items-center mb-6">
            <div className="bg-blue-50 text-blue-600 rounded-full p-3 mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Vimarsh Admin</h1>
            <p className="text-sm text-slate-500 mt-1 text-center">
              Enter the admin secret to manage Events and Institute Colloquium
            </p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">
              {loginError}
            </div>
          )}

          <div className="relative mb-4">
            <input
              type={showSecret ? "text" : "password"}
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              placeholder="Admin secret"
              className="w-full px-4 py-2 pr-10 text-black border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowSecret((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showSecret ? "Hide secret" : "Show secret"}
            >
              {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-semibold transition-colors"
          >
            {loginLoading ? "Verifying..." : "Log In"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Vimarsh Admin Panel</h1>
            <p className="text-sm text-slate-500">Manage Events &amp; Institute Colloquium</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {banner && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg text-sm border ${
              banner.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {banner.message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex gap-2 bg-white border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("event")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                activeTab === "event" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab("colloquium")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                activeTab === "colloquium" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Institute Colloquium
            </button>
          </div>

          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add {activeTab === "colloquium" ? "Colloquium Talk" : "Event"}
          </button>
        </div>

        {/* List */}
        {listLoading ? (
          <p className="text-slate-500 text-center py-12">Loading...</p>
        ) : items.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
            Nothing here yet. Click &ldquo;Add&rdquo; to create the first entry.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {items.map((item) => {
              const imageUrl = resolveMediaUrl(item.image);
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                >
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 border flex items-center justify-center">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt={item.speaker} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-slate-400">No image</span>
                    )}
                  </div>

                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                    <p className="text-sm text-slate-500 truncate">{item.speaker}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-blue-600 font-semibold">
                        {formatDisplayDate(item.date)}
                      </span>
                      {item.series && (
                        <span className="text-xs text-slate-400 uppercase tracking-wide">{item.series}</span>
                      )}
                      {item.video && (
                        <a
                          href={item.video}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-red-500 hover:underline flex items-center gap-1"
                        >
                          Video <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEditForm(item)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${item.title}"? This cannot be undone.`)) {
                          handleDelete(item.id);
                        }
                      }}
                      disabled={deletingId === item.id}
                      className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showForm && (
        <ItemForm
          type={activeTab}
          item={editingItem}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
