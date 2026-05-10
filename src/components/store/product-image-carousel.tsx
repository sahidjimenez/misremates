'use client'

import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react'

interface ProductImageCarouselProps {
  images: string[]
  title: string
}

export function ProductImageCarousel({ images, title }: ProductImageCarouselProps) {
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef<number | null>(null)

  if (!images.length) {
    return (
      <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center">
        <Tag className="h-20 w-20 text-slate-300" />
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
        <img src={images[0]} alt={title} className="h-full w-full object-cover" />
      </div>
    )
  }

  function prev() {
    setCurrent((c) => (c - 1 + images.length) % images.length)
  }

  function next() {
    setCurrent((c) => (c + 1) % images.length)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      diff > 0 ? next() : prev()
    }
    touchStartX.current = null
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[current]}
          alt={`${title} — imagen ${current + 1}`}
          className="h-full w-full object-cover transition-opacity duration-200"
          key={current}
        />

        {/* Prev button */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white transition-colors"
          aria-label="Imagen anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Next button */}
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white transition-colors"
          aria-label="Siguiente imagen"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
              }`}
              aria-label={`Ir a imagen ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-2">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`aspect-square overflow-hidden rounded-lg bg-slate-100 ring-2 transition-all ${
              i === current ? 'ring-green-500' : 'ring-transparent hover:ring-slate-300'
            }`}
          >
            <img src={img} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}
