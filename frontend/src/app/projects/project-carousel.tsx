"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FocusEvent } from "react";
import type { PublicProject } from "@/lib/api";
import { ProjectCard } from "./project-card";

export default function ProjectCarousel({
  projects,
}: {
  projects: PublicProject[];
}) {
  const [itemsPerSlide, setItemsPerSlide] = useState(2);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isPaused = isHovered || hasFocus;

  useEffect(() => {
    const viewport = window.matchMedia("(max-width: 639px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateViewport = () => {
      setItemsPerSlide(viewport.matches ? 1 : 2);
      setCurrentSlide(0);
    };
    const updateMotion = () => setReducedMotion(motion.matches);
    const updateVisibility = () => setIsVisible(!document.hidden);

    updateViewport();
    updateMotion();
    updateVisibility();
    viewport.addEventListener("change", updateViewport);
    motion.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);

    return () => {
      viewport.removeEventListener("change", updateViewport);
      motion.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  const slides = useMemo(() => {
    const result: PublicProject[][] = [];
    for (let index = 0; index < projects.length; index += itemsPerSlide) {
      result.push(projects.slice(index, index + itemsPerSlide));
    }
    return result;
  }, [itemsPerSlide, projects]);
  const useCarousel = projects.length > 2;
  const activeSlide = slides.length > 0 ? currentSlide % slides.length : 0;

  useEffect(() => {
    if (
      !useCarousel ||
      reducedMotion ||
      isPaused ||
      !isVisible ||
      slides.length < 2
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentSlide((slide) => (slide + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(interval);
  }, [isPaused, isVisible, reducedMotion, slides.length, useCarousel]);

  function pauseOnFocus() {
    setHasFocus(true);
  }

  function resumeOnBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setHasFocus(false);
    }
  }

  function moveSlide(direction: -1 | 1) {
    setCurrentSlide(
      (activeSlide + direction + slides.length) % slides.length,
    );
  }

  return (
    <div
      ref={carouselRef}
      className="mt-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={pauseOnFocus}
      onBlurCapture={resumeOnBlur}
    >
      {projects.length === 0 ? (
        <p className="flex min-h-28 items-center justify-center border border-slate-200 bg-white px-5 py-7 text-center text-sm leading-6 text-slate-600">
          Belum ada proyek yang ditampilkan.
        </p>
      ) : useCarousel ? (
        <>
          <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1fr)_3rem] sm:gap-4">
            <button
              aria-label="Proyek sebelumnya"
              className="inline-flex size-10 items-center justify-center rounded-full border border-slate-300 bg-white text-[#142331] transition-colors hover:border-[#f47721] hover:text-[#a7470a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f47721] sm:size-12"
              type="button"
              onClick={() => moveSlide(-1)}
            >
              <span aria-hidden="true" className="text-2xl leading-none">‹</span>
            </button>
            <div className="min-w-0 overflow-hidden sm:col-span-2">
              <div
                className="flex"
                style={{
                  transform: `translateX(-${activeSlide * 100}%)`,
                  transitionDuration: reducedMotion ? "0ms" : "500ms",
                  transitionProperty: "transform",
                  transitionTimingFunction: "ease-in-out",
                }}
                aria-live="off"
              >
                {slides.map((slide, index) => (
                  <div
                    className="grid w-full shrink-0 grid-cols-1 items-stretch gap-5 sm:grid-cols-2 sm:gap-7"
                    key={slide[0]?.id ?? index}
                    aria-hidden={index !== activeSlide}
                    inert={index !== activeSlide}
                  >
                    {slide.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <button
              aria-label="Proyek berikutnya"
              className="inline-flex size-10 items-center justify-center rounded-full border border-slate-300 bg-white text-[#142331] transition-colors hover:border-[#f47721] hover:text-[#a7470a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f47721] sm:size-12"
              type="button"
              onClick={() => moveSlide(1)}
            >
              <span aria-hidden="true" className="text-2xl leading-none">›</span>
            </button>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-h-12 items-center gap-3">
              <span className="min-w-12 text-sm font-medium tabular-nums text-slate-600" aria-live="polite">
                {activeSlide + 1} / {slides.length}
              </span>
            </div>
            <Link
              href="/projects"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#b74e0d] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#9f4006] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f47721] focus-visible:ring-offset-2"
            >
              Lihat Semua Proyek
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 sm:gap-7">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              href="/projects"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#b74e0d] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#9f4006] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f47721] focus-visible:ring-offset-2"
            >
              Lihat Semua Proyek
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
