"use client";

import { useEffect, useState } from "react";
import { fetchItems, VimarshItem } from "@/lib/api";
import ItemCard from "@/components/shared/ItemCard";

export default function ColloquiumPage() {
  const [items, setItems] = useState<VimarshItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetchItems("colloquium")
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load Institute Colloquium talks");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-gray-900 text-center md:text-left">
          Institute Colloquium
        </h1>

        {loading && (
          <p className="text-gray-500 text-center py-12">Loading Institute Colloquium talks...</p>
        )}

        {!loading && error && (
          <p className="text-red-500 text-center py-12">{error}</p>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="text-gray-500 text-center py-12">No Institute Colloquium talks yet. Check back soon.</p>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 gap-8">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
