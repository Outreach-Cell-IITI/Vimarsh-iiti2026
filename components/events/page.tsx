"use client";

import { useEffect, useState } from "react";
import { fetchItems, VimarshItem } from "@/lib/api";
import ItemCard from "@/components/shared/ItemCard";

export default function EventsPage() {
  const [events, setEvents] = useState<VimarshItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetchItems("event")
      .then((items) => {
        if (!cancelled) setEvents(items);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load events");
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
          Events
        </h1>

        {loading && (
          <p className="text-gray-500 text-center py-12">Loading events...</p>
        )}

        {!loading && error && (
          <p className="text-red-500 text-center py-12">{error}</p>
        )}

        {!loading && !error && events.length === 0 && (
          <p className="text-gray-500 text-center py-12">No events yet. Check back soon.</p>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 gap-8">
            {events.map((event) => (
              <ItemCard key={event.id} item={event} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
