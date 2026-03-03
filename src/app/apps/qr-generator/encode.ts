import type { QrConfig } from "./types";

/**
 * Encode the current QR config data into a string for QR code generation.
 */
export function encodeQrData(config: QrConfig): string {
  switch (config.dataType) {
    case "url":
    case "text":
    case "phone":
      return config.simpleData;

    case "wifi": {
      const { ssid, password, encryption, hidden } = config.wifiData;
      return `WIFI:T:${encryption};S:${escapeWifi(ssid)};P:${escapeWifi(password)};H:${hidden ? "true" : "false"};;`;
    }

    case "vcard": {
      const v = config.vcardData;
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${v.lastName};${v.firstName};;;`,
        `FN:${v.firstName} ${v.lastName}`,
      ];
      if (v.phone) lines.push(`TEL:${v.phone}`);
      if (v.email) lines.push(`EMAIL:${v.email}`);
      if (v.organization) lines.push(`ORG:${v.organization}`);
      if (v.url) lines.push(`URL:${v.url}`);
      lines.push("END:VCARD");
      return lines.join("\n");
    }

    case "email": {
      const { address, subject, body } = config.emailData;
      const params: string[] = [];
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
      if (body) params.push(`body=${encodeURIComponent(body)}`);
      return `mailto:${address}${params.length ? "?" + params.join("&") : ""}`;
    }

    case "sms": {
      const { phone, message } = config.smsData;
      return `sms:${phone}${message ? `?body=${encodeURIComponent(message)}` : ""}`;
    }

    default:
      return config.simpleData;
  }
}

function escapeWifi(str: string): string {
  return str.replace(/[\\;,:""]/g, (m) => `\\${m}`);
}
