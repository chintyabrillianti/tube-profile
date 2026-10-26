"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ContactUsLink from "./contact-us-link";

interface PriceEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string | null;
}

export default function PriceEstimatorModal({
  isOpen,
  onClose,
  whatsappNumber,
}: PriceEstimatorModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeModal = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }

    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      onClose();
      setIsClosing(false);
      closeTimerRef.current = null;
    }, 250);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    openerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() =>
      closeButtonRef.current?.focus(),
    );

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      openerRef.current?.focus();
    };
  }, [isOpen, closeModal]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 transition-opacity duration-250 ease-out motion-reduce:transition-none ${
            isClosing ? "opacity-0" : "opacity-100"
          }`}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="price-estimator-heading"
            aria-describedby="price-estimator-description"
            className={`relative max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-200 bg-[#fffefd] p-6 shadow-2xl shadow-black/20 transition-[opacity,transform] duration-250 ease-out motion-reduce:transition-none sm:p-8 ${
              isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
            }`}
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeModal}
              aria-label="Tutup estimasi biaya"
              className="absolute right-4 top-4 inline-flex size-11 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#142331] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f47721] motion-reduce:transition-none"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="size-5"
              >
                <path
                  d="m6 6 12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <p className="mb-3 flex items-center gap-3 pr-12 text-xs font-semibold uppercase tracking-[0.18em] text-[#a7470a]">
              <span className="h-px w-7 bg-[#f47721]" />
              ESTIMASI LAYANAN BENE
            </p>
            <h2
              id="price-estimator-heading"
              className="pr-8 text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#142331] sm:text-3xl"
            >
              Estimasi Biaya
            </h2>
            <p
              id="price-estimator-description"
              className="mt-4 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7"
            >
              Tarif layanan resmi belum tersedia, sehingga estimasi harga
              belum dapat dihitung. Hubungi tim kami untuk mendapatkan
              penawaran sesuai kebutuhan proyek.
            </p>
            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
              <p className="border-l-2 border-[#f47721] pl-4 text-sm leading-6 text-slate-700 sm:text-base">
                Penawaran tidak termasuk biaya mobilisasi dan demobilisasi.
              </p>
              <ContactUsLink
                whatsappNumber={whatsappNumber}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[#b74e0d] px-6 py-3 text-sm font-semibold text-white transition-[background-color,transform] duration-300 ease-out hover:-translate-y-px hover:bg-[#9f4006] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f47721] focus-visible:ring-offset-2 sm:w-auto motion-reduce:transform-none motion-reduce:transition-none"
              >
                Hubungi Kami
              </ContactUsLink>
            </div>
          </div>
        </div>,
    document.body,
  );
}
