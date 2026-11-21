import Image from "next/image";
import { songQrPath } from "@/lib/urls";

type QrCodeProps = {
  slug: string;
  size?: number;
  className?: string;
  alt?: string;
};

export default function QrCode({
  slug,
  size = 160,
  className,
  alt,
}: QrCodeProps) {
  return (
    <Image
      src={songQrPath(slug)}
      alt={alt ?? "QR code — scan to open this song"}
      width={size}
      height={size}
      unoptimized
      className={className}
    />
  );
}
