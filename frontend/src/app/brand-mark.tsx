import Image from "next/image";

export default function BrandMark() {
  return (
    <Image
      src="/bene-logo-horizontal.jpeg"
      alt="PT Brianov Egatara Nirbana Estu"
      width={320}
      height={144}
      priority
      className="h-14 w-auto object-contain sm:h-16"
    />
  );
}