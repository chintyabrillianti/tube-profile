import Image from "next/image";

type BrandMarkProps = {
  className?: string;
  preload?: boolean;
};

export default function BrandMark({
  className = "h-12 w-auto sm:h-14",
  preload = false,
}: BrandMarkProps) {
  return (
    <Image
      src="/logo-bene.png"
      alt="PT Brianov Egatara Nirbana Estu"
      width={745}
      height={335}
      preload={preload}
      className={`object-contain ${className}`}
    />
  );
}
