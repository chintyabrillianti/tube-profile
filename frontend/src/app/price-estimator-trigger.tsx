"use client";

import { useCallback, useState } from "react";
import PriceEstimatorModal from "./price-estimator-modal";

interface PriceEstimatorTriggerProps {
  className: string;
  whatsappNumber: string | null;
}

export default function PriceEstimatorTrigger({
  className,
  whatsappNumber,
}: PriceEstimatorTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        Estimasi Biaya
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="size-4"
        >
          <path
            d="M3.5 10h12m-5-5 5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <PriceEstimatorModal
        isOpen={isOpen}
        onClose={closeModal}
        whatsappNumber={whatsappNumber}
      />
    </>
  );
}
