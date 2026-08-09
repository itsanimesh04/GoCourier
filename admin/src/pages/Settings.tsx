import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import configService from "../services/admin/config.service";
import type { AppConfig } from "../types/admin.types";

const Settings = () => {
  const [form, setForm] = useState<Partial<AppConfig>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    configService
      .get()
      .then((res) => setForm(res.data.data))
      .catch(() => undefined);
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await configService.update({
        delivery_fee: form.delivery_fee,
        custom_request_fee: form.custom_request_fee,
        parcel_fee: form.parcel_fee,
        app_download_title: form.app_download_title,
        app_download_subtitle: form.app_download_subtitle,
        play_store_href: form.play_store_href,
        app_store_href: form.app_store_href,
        marquee_strings: form.marquee_strings,
        faq: form.faq,
      });
      setForm(res.data.data);
      setMessage("Settings saved");
    } catch {
      setMessage("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Fees, app download, FAQ, and marquee copy" />

      <div className="admin-card p-6 space-y-4 max-w-3xl">
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              ["delivery_fee", "Delivery fee"],
              ["custom_request_fee", "Custom request fee"],
              ["parcel_fee", "Parcel fee"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="text-xs text-(--text-muted) mb-1 block">{label}</label>
              <input
                className="admin-input"
                value={String(form[key] ?? "")}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        {(
          [
            ["app_download_title", "App download title"],
            ["app_download_subtitle", "App download subtitle"],
            ["play_store_href", "Play Store URL"],
            ["app_store_href", "App Store URL"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label className="text-xs text-(--text-muted) mb-1 block">{label}</label>
            <input
              className="admin-input"
              value={String(form[key] ?? "")}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            />
          </div>
        ))}

        <div>
          <label className="text-xs text-(--text-muted) mb-1 block">
            Marquee strings (one per line)
          </label>
          <textarea
            className="admin-input min-h-28"
            value={(form.marquee_strings ?? []).join("\n")}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                marquee_strings: e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              }))
            }
          />
        </div>

        <div>
          <label className="text-xs text-(--text-muted) mb-1 block">
            FAQ (JSON array of {"{question, answer}"})
          </label>
          <textarea
            className="admin-input min-h-40 font-mono text-xs"
            value={JSON.stringify(form.faq ?? [], null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                if (Array.isArray(parsed)) setForm((f) => ({ ...f, faq: parsed }));
              } catch {
                // ignore invalid while typing
              }
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </button>
          {message && <span className="text-sm text-(--text-muted)">{message}</span>}
        </div>
      </div>
    </div>
  );
};

export default Settings;
