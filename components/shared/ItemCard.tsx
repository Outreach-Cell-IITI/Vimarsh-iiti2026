"use client";

import { useState, useEffect } from "react";
import { Youtube, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { VimarshItem, resolveMediaUrl, formatDisplayDate } from "@/lib/api";

export default function ItemCard({ item }: { item: VimarshItem }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const imageUrl = resolveMediaUrl(item.image);
  const pdfUrl = resolveMediaUrl(item.pdf);

  return (
    <div className="relative w-full [perspective:1000px] h-[550px] md:h-auto">
      <motion.div
        animate={{ rotateY: isMobile && isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        className="relative w-full h-full md:flex md:flex-row md:items-stretch md:gap-10 md:bg-white md:rounded-xl md:shadow-md md:border md:p-8 [transform-style:preserve-3d]"
      >
        {/* FRONT SIDE (Poster) */}
        <div className="absolute inset-0 w-full h-full md:relative md:w-72 md:h-72 flex flex-col bg-white rounded-xl shadow-lg border overflow-hidden [backface-visibility:hidden]">
          <div className="relative flex-grow w-full min-h-[300px] md:min-h-0 bg-gray-50 flex items-center justify-center">
            {imageUrl ? (
              // Using a plain <img> here (not next/image) since the poster
              // may be served from a different origin (the backend API),
              // which can vary per deployment.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={item.speaker}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <span className="text-gray-400 text-sm px-4 text-center">No poster uploaded</span>
            )}
          </div>
          {/* Mobile Flip Button */}
          <button
            onClick={() => setIsFlipped(true)}
            className="md:hidden bg-black text-white py-4 flex items-center justify-center gap-2 font-medium"
          >
            More Details
          </button>
        </div>

        <div
          className={`absolute inset-0 w-full h-full md:relative md:flex-grow flex flex-col justify-center p-8 bg-white rounded-xl border-2 border-black md:border-none md:p-0 [backface-visibility:hidden]
          ${isMobile ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"}`}
        >
          <div className="h-full flex flex-col justify-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
              {item.speaker}
            </h2>
            <p className="text-gray-700 mt-3 text-lg leading-relaxed italic border-l-4 border-blue-500 pl-4">
              {item.title}
            </p>
            {item.series && (
              <p className="text-sm text-gray-500 mt-4 uppercase tracking-wider font-semibold">
                {item.series}
              </p>
            )}
            <p className="text-xl text-blue-600 font-black mt-2">
              {formatDisplayDate(item.date)}
            </p>

            <div className="flex items-center gap-6 mt-8">
              <span className="font-bold text-lg text-black uppercase">
                Resources:
              </span>
              <div className="flex gap-4">
                {item.video && (
                  <a
                    href={item.video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-md"
                    title="Watch Video"
                  >
                    <Youtube className="w-6 h-6" />
                  </a>
                )}
                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center p-3 border-2 border-black text-black rounded-full hover:bg-black hover:text-white transition-all shadow-sm"
                    title="Download PDF/Flyer"
                  >
                    <FileText className="w-6 h-6" />
                  </a>
                )}
                {!item.video && !pdfUrl && (
                  <span className="text-sm text-gray-400">No resources added</span>
                )}
              </div>
            </div>

            <motion.button
              onClick={() => setIsFlipped(false)}
              className="md:hidden mt-auto pt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2 overflow-hidden relative group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <motion.span
                className="relative z-10"
                animate={{ x: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                ←
              </motion.span>
              <span className="relative z-10">Back to Poster</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
