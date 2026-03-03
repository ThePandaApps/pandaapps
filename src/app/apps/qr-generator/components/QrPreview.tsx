"use client";

import { useEffect, useRef, useCallback } from "react";
import type QRCodeStyling from "qr-code-styling";
import type { QrConfig } from "../types";
import { encodeQrData } from "../encode";

interface Props {
  config: QrConfig;
}

export default function QrPreview({ config }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const initRef = useRef(false);

  const getOptions = useCallback(
    () => ({
      width: config.size,
      height: config.size,
      data: encodeQrData(config) || "https://pandaapps.com",
      dotsOptions: {
        color: config.fgColor,
        type: config.dotStyle,
      },
      backgroundOptions: {
        color: config.bgColor,
      },
      cornersSquareOptions: {
        color: config.fgColor,
        type: config.cornerSquareStyle,
      },
      cornersDotOptions: {
        color: config.fgColor,
        type: config.cornerDotStyle,
      },
      imageOptions: {
        crossOrigin: "anonymous" as const,
        margin: config.logoMargin,
        imageSize: config.logoSize,
      },
      image: config.logoFile || undefined,
      qrOptions: {
        errorCorrectionLevel: config.errorCorrection,
      },
    }),
    [config]
  );

  // Initialize QR code (client-only)
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    import("qr-code-styling").then(({ default: QRCodeStylingClass }) => {
      const qr = new QRCodeStylingClass(getOptions());
      qrRef.current = qr;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        qr.append(containerRef.current);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update QR code when config changes
  useEffect(() => {
    if (qrRef.current) {
      qrRef.current.update(getOptions());
    }
  }, [getOptions]);

  return (
    <div className="flex items-center justify-center">
      <div className="relative rounded-2xl border border-border/50 bg-white p-6 shadow-2xl shadow-black/20">
        {/* Decorative corner dots */}
        <div className="absolute top-2 left-2 h-1.5 w-1.5 rounded-full bg-accent/30" />
        <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-accent/30" />
        <div className="absolute bottom-2 left-2 h-1.5 w-1.5 rounded-full bg-accent/30" />
        <div className="absolute bottom-2 right-2 h-1.5 w-1.5 rounded-full bg-accent/30" />

        <div
          ref={containerRef}
          className="flex items-center justify-center [&>canvas]:rounded-lg [&>svg]:rounded-lg"
          style={{
            minWidth: Math.min(config.size, 300),
            minHeight: Math.min(config.size, 300),
          }}
        />
      </div>
    </div>
  );
}
