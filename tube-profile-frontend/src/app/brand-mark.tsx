export default function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="flex size-10 items-center justify-center rounded-lg bg-[#f47721] text-white"
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-6">
        <path
          d="M7 4v16M17 4v16M7 8h10M7 16h10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
