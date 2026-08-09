import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import configService from "@/services/admin/config.service";
import type { AppConfig } from "@/types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
  const [form, setForm] = useState<Partial<AppConfig>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    configService
      .get()
      .then((res) => setForm(res.data.data))
      .catch(() => undefined);
  }, []);

  const save = async () => {
    setSaving(true);
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
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Fees, app download, FAQ, and marquee copy" />

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>App configuration</CardTitle>
          <CardDescription>Changes apply to the client experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(
              [
                ["delivery_fee", "Delivery fee"],
                ["custom_request_fee", "Custom request fee"],
                ["parcel_fee", "Parcel fee"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <Input
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
            <div key={key} className="space-y-1.5">
              <Label>{label}</Label>
              <Input
                value={String(form[key] ?? "")}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <Label>Marquee strings (one per line)</Label>
            <Textarea
              className="min-h-28"
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

          <div className="space-y-1.5">
            <Label>FAQ (JSON array of {"{question, answer}"})</Label>
            <Textarea
              className="min-h-40 font-mono text-xs"
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

          <Button onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
