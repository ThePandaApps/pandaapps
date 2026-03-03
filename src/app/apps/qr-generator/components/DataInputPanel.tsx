"use client";

import { QR_DATA_TYPES } from "../types";
import type { QrConfig, QrDataType } from "../types";

interface Props {
  config: QrConfig;
  onChange: (c: Partial<QrConfig>) => void;
}

export default function DataInputPanel({ config, onChange }: Props) {
  const activeType = QR_DATA_TYPES.find((t) => t.id === config.dataType)!;

  return (
    <div className="space-y-5">
      {/* ── Data type selector ── */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-3">
          Content Type
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {QR_DATA_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => onChange({ dataType: type.id as QrDataType })}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs transition-all ${
                config.dataType === type.id
                  ? "border-accent/50 bg-accent/10 text-accent"
                  : "border-border/50 bg-card/30 text-muted hover:border-border hover:bg-card/50"
              }`}
            >
              <span className="text-base">{type.icon}</span>
              <span className="font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Dynamic fields ── */}
      <div className="space-y-3">
        {(config.dataType === "url" ||
          config.dataType === "text" ||
          config.dataType === "phone") && (
          <Field
            label={activeType.label}
            value={config.simpleData}
            onChange={(v) => onChange({ simpleData: v })}
            placeholder={activeType.placeholder}
            multiline={config.dataType === "text"}
          />
        )}

        {config.dataType === "wifi" && (
          <>
            <Field
              label="Network Name (SSID)"
              value={config.wifiData.ssid}
              onChange={(v) =>
                onChange({ wifiData: { ...config.wifiData, ssid: v } })
              }
              placeholder="My WiFi Network"
            />
            <Field
              label="Password"
              value={config.wifiData.password}
              onChange={(v) =>
                onChange({ wifiData: { ...config.wifiData, password: v } })
              }
              placeholder="Enter password"
              type="password"
            />
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Encryption
              </label>
              <div className="flex gap-2">
                {(["WPA", "WEP", "nopass"] as const).map((enc) => (
                  <button
                    key={enc}
                    onClick={() =>
                      onChange({
                        wifiData: { ...config.wifiData, encryption: enc },
                      })
                    }
                    className={`rounded-lg border px-4 py-2 text-xs font-medium transition-all ${
                      config.wifiData.encryption === enc
                        ? "border-accent/50 bg-accent/10 text-accent"
                        : "border-border/50 bg-card/30 text-muted hover:bg-card/50"
                    }`}
                  >
                    {enc === "nopass" ? "None" : enc}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={config.wifiData.hidden}
                onChange={(e) =>
                  onChange({
                    wifiData: { ...config.wifiData, hidden: e.target.checked },
                  })
                }
                className="rounded border-border accent-accent"
              />
              Hidden network
            </label>
          </>
        )}

        {config.dataType === "vcard" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="First Name"
              value={config.vcardData.firstName}
              onChange={(v) =>
                onChange({
                  vcardData: { ...config.vcardData, firstName: v },
                })
              }
              placeholder="John"
            />
            <Field
              label="Last Name"
              value={config.vcardData.lastName}
              onChange={(v) =>
                onChange({
                  vcardData: { ...config.vcardData, lastName: v },
                })
              }
              placeholder="Doe"
            />
            <Field
              label="Phone"
              value={config.vcardData.phone}
              onChange={(v) =>
                onChange({
                  vcardData: { ...config.vcardData, phone: v },
                })
              }
              placeholder="+1 234 567 8900"
            />
            <Field
              label="Email"
              value={config.vcardData.email}
              onChange={(v) =>
                onChange({
                  vcardData: { ...config.vcardData, email: v },
                })
              }
              placeholder="john@example.com"
            />
            <Field
              label="Organization"
              value={config.vcardData.organization}
              onChange={(v) =>
                onChange({
                  vcardData: { ...config.vcardData, organization: v },
                })
              }
              placeholder="Acme Inc."
            />
            <Field
              label="Website"
              value={config.vcardData.url}
              onChange={(v) =>
                onChange({
                  vcardData: { ...config.vcardData, url: v },
                })
              }
              placeholder="https://example.com"
            />
          </div>
        )}

        {config.dataType === "email" && (
          <>
            <Field
              label="Email Address"
              value={config.emailData.address}
              onChange={(v) =>
                onChange({
                  emailData: { ...config.emailData, address: v },
                })
              }
              placeholder="user@example.com"
            />
            <Field
              label="Subject"
              value={config.emailData.subject}
              onChange={(v) =>
                onChange({
                  emailData: { ...config.emailData, subject: v },
                })
              }
              placeholder="Hello!"
            />
            <Field
              label="Body"
              value={config.emailData.body}
              onChange={(v) =>
                onChange({
                  emailData: { ...config.emailData, body: v },
                })
              }
              placeholder="Message body…"
              multiline
            />
          </>
        )}

        {config.dataType === "sms" && (
          <>
            <Field
              label="Phone Number"
              value={config.smsData.phone}
              onChange={(v) =>
                onChange({ smsData: { ...config.smsData, phone: v } })
              }
              placeholder="+1 234 567 8900"
            />
            <Field
              label="Message"
              value={config.smsData.message}
              onChange={(v) =>
                onChange({
                  smsData: { ...config.smsData, message: v },
                })
              }
              placeholder="Your message…"
              multiline
            />
          </>
        )}
      </div>
    </div>
  );
}

/* ── Reusable field ── */
function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
  type?: string;
}) {
  const cls =
    "w-full rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors";
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1.5">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cls + " resize-none"}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}
