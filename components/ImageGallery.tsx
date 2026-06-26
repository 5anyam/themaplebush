"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

type Image = { src: string; alt?: string };

export default function ImageGallery({ images }: { images: Image[] }) {

  const [active, setActive] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const DRAG_THRESHOLD = 80;
  const VELOCITY_THRESHOLD = 0.5;

  const displayImages = images && images.length > 0 ? images : [];


  // --- Image Loading State ---
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setIsLoading(false);
    img.src = displayImages[active]?.src;
    setIsLoading(true);
  }, [active, displayImages]);

  // --- Navigation/Drag Logic ---

  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActive((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 300);
    setIsZoomed(false);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActive((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 300);
    setIsZoomed(false);
  };

  // -- Touch/Drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isZoomed) return;
    const touch = e.touches[0];
    setStartX(touch.clientX);
    setCurrentX(touch.clientX);
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isZoomed) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    const absDeltaX = Math.abs(deltaX);
    if (absDeltaX > 10) e.preventDefault();
    let adjustedDelta = deltaX;
    if ((active === 0 && deltaX > 0) || (active === displayImages.length - 1 && deltaX < 0)) {
      adjustedDelta = deltaX * 0.3;
    }
    setCurrentX(touch.clientX);
    setDragOffset(adjustedDelta);
  };

  const handleTouchEnd = () => {
    if (!isDragging || isZoomed) return;
    const deltaX = currentX - startX;
    const velocity = Math.abs(deltaX) / 100;
    const shouldSlide = Math.abs(deltaX) > DRAG_THRESHOLD || velocity > VELOCITY_THRESHOLD;
    if (shouldSlide) {
      if (deltaX > 0 && active > 0) handlePrevious();
      else if (deltaX < 0 && active < displayImages.length - 1) handleNext();
    }
    setIsDragging(false);
    setDragOffset(0);
    setStartX(0);
    setCurrentX(0);
  };

  // -- Desktop Mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isZoomed) return;
    setStartX(e.clientX);
    setCurrentX(e.clientX);
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isZoomed) return;
    const deltaX = e.clientX - startX;
    let adjustedDelta = deltaX;
    if ((active === 0 && deltaX > 0) || (active === displayImages.length - 1 && deltaX < 0)) {
      adjustedDelta = deltaX * 0.3;
    }
    setCurrentX(e.clientX);
    setDragOffset(adjustedDelta);
  };

  const handleMouseUp = () => {
    if (!isDragging || isZoomed) return;
    const deltaX = currentX - startX;
    const shouldSlide = Math.abs(deltaX) > DRAG_THRESHOLD;
    if (shouldSlide) {
      if (deltaX > 0 && active > 0) handlePrevious();
      else if (deltaX < 0 && active < displayImages.length - 1) handleNext();
    }
    setIsDragging(false);
    setDragOffset(0);
    setStartX(0);
    setCurrentX(0);
  };

  if (!displayImages || displayImages.length === 0) return null;

  // --- UI RETURN ---
  return (
    <>
      {/* Main Image Container */}
      <div className="relative group">
        <div
          ref={containerRef}
          className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200/50 h-[400px] md:h-[600px] lg:h-[700px] bg-white touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            touchAction: isDragging ? "none" : "pan-y"
          }}
        >
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-400 rounded-full animate-spin animate-reverse"></div>
              </div>
            </div>
          )}

          {/* Images Container with Drag */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {displayImages.map((img, i) => (
              <div
                key={i}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${
                  i === active
                    ? "opacity-100 translate-x-0 scale-100 z-10"
                    : i < active
                      ? "opacity-0 -translate-x-full scale-95 z-0"
                      : "opacity-0 translate-x-full scale-95 z-0"
                }`}
                style={{
                  transform: i === active ? `translateX(${dragOffset}px)` : undefined
                }}
              >
                <img
                  src={img.src}
                  alt={img.alt || `Product image ${i + 1}`}
                  className={`max-h-full max-w-full object-contain transition-all duration-500 select-none mx-auto rounded-xl ${
                    isZoomed && i === active
                      ? "scale-150 cursor-zoom-out"
                      : "cursor-pointer hover:scale-105"
                  }`}
                  onClick={() => {
                    if (i === active) {
                      setIsZoomed(!isZoomed);
                    } else {
                      setActive(i);
                      setIsZoomed(false);
                    }
                  }}
                  onLoad={() => i === active && setIsLoading(false)}
                  onDragStart={(e) => e.preventDefault()}
                  style={{
                    filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15)) drop-shadow(0 10px 20px rgba(0,0,0,0.1))",
                    userSelect: "none"
                  }}
                />
              </div>
            ))}
          </div>

          {/* Desktop Navigation Arrows */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                disabled={isTransitioning}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border border-gray-200/50 z-30 hidden md:block disabled:opacity-50 focus:outline-none"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={isTransitioning}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border border-gray-200/50 z-30 hidden md:block disabled:opacity-50 focus:outline-none"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Zoom Button */}
          <div className="absolute top-4 right-4 flex gap-2 z-30">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg backdrop-blur-sm hover:scale-110 transition-all duration-200 border border-gray-200/50 opacity-100 md:opacity-0 md:group-hover:opacity-100"
              aria-label={isZoomed ? "Zoom out" : "Zoom in"}
              tabIndex={-1}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Drag Indicator */}
          {isDragging && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm border border-white/20 z-10">
              {Math.abs(dragOffset) > DRAG_THRESHOLD ? "Release to slide" : "Drag to slide"}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnails (desktop+mobile) */}
      {displayImages.length > 1 && (
        <div className="mt-8">
          <div className="flex overflow-x-auto gap-4 px-2 py-2 scrollbar-hide">
            {displayImages.map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  setActive(i);
                  setIsZoomed(false);
                }}
                className={`flex-shrink-0 relative group/thumb transition-all duration-300 focus:outline-none ${
                  i === active
                    ? "ring-2 ring-blue-500 ring-offset-2 scale-105 shadow-lg"
                    : "ring-2 ring-transparent hover:ring-gray-300 opacity-70 hover:opacity-100 hover:scale-105"
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <div className="w-[64px] h-[64px] rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/50">
                  <img
                    src={img.src}
                    alt={img.alt || `Thumbnail ${i + 1}`}
                    className="object-contain w-full h-full transition-transform duration-300 group-hover/thumb:scale-110 drop-shadow-md p-1"
                    loading="lazy"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Dots Indicator */}
      {displayImages.length > 1 && (
        <div className="flex justify-center mt-4 gap-3 sm:hidden">
          {displayImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-8 h-2 rounded-full transition-all duration-300 shadow-sm ${
                i === active
                  ? "bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-400 shadow-blue-500/40"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </>
  );
}
