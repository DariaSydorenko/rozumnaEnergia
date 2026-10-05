import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getErrorMessage, getFieldErrors, getSettings, saveSettings } from "../api";
import { ErrorAlert, PageHeader, Spinner } from "../components/ui";
import type { Settings } from "../types";

export function meta() {
  return [{ title: "EnergyBalance — Налаштування" }];
}

// Числові поля зберігаємо рядками, щоб користувач міг вільно редагувати значення
interface FormState {
  battery_capacity: string;
  max_charge_rate: string;
  max_discharge_rate: string;
  alert_threshold: string;
  algorithm: string;
  alerts_enabled: boolean;
  grid_export_enabled: boolean;
  grid_import_enabled: boolean;
}

const toForm = (s: Settings): FormState => ({
  ...s,
  battery_capacity: String(s.battery_capacity),
  max_charge_rate: String(s.max_charge_rate),
  max_discharge_rate: String(s.max_discharge_rate),
  alert_threshold: String(s.alert_threshold),
});

export default function SettingsPage() {
  const [form, setForm] = useState<FormState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then((s) => setForm(toForm(s)))
      .catch((e) => setLoadError(getErrorMessage(e)));
  }, []);

  if (!form) return loadError ? <ErrorAlert message={loadError} /> : <Spinner />;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm({ ...form, [key]: value });
    setSaved(false);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const numeric = {
      battery_capacity: parseFloat(form.battery_capacity),
      max_charge_rate: parseFloat(form.max_charge_rate),
      max_discharge_rate: parseFloat(form.max_discharge_rate),
      alert_threshold: parseInt(form.alert_threshold, 10),
    };
    const clientErrors: Record<string, string> = {};
    Object.entries(numeric).forEach(([key, value]) => {
      if (Number.isNaN(value)) clientErrors[key] = "Введіть число";
    });
    setFieldErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setSaving(true);
    setSaveError(null);
    try {
      const result = await saveSettings({ ...form, ...numeric });
      setForm(toForm(result));
      setSaved(true);
    } catch (e) {
      setFieldErrors(getFieldErrors(e));
      setSaveError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const numberField = (key: "battery_capacity" | "max_charge_rate" | "max_discharge_rate" | "alert_threshold", label: string, step: string) => (
    <div className="mb-3">
      <label htmlFor={key} className="form-label">{label}</label>
      <input
        id={key}
        type="number"
        step={step}
        className={`form-control ${fieldErrors[key] ? "is-invalid" : ""}`}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        required
      />
      {fieldErrors[key] && <div className="invalid-feedback">{fieldErrors[key]}</div>}
    </div>
  );

  const checkbox = (key: "grid_export_enabled" | "grid_import_enabled" | "alerts_enabled", label: string) => (
    <div className="form-check mb-3">
      <input id={key} type="checkbox" className="form-check-input" checked={form[key]} onChange={(e) => set(key, e.target.checked)} />
      <label htmlFor={key} className="form-check-label">{label}</label>
    </div>
  );

  return (
    <>
      <PageHeader title="Налаштування системи" subtitle="Параметри акумулятора, обміну з мережею та сповіщень" />
      <form onSubmit={submit} noValidate>
        <div className="eb-card mb-3">
          <div className="card-body p-4">
            <h2 className="eb-chart-title">Акумулятор і мережа</h2>
            <div className="row">
              <div className="col-md-6">
                {numberField("battery_capacity", "Ємність акумулятора (кВт·год)", "0.1")}
                {numberField("max_charge_rate", "Макс. швидкість заряджання (кВт)", "0.1")}
                {checkbox("grid_export_enabled", "Дозволити віддачу в мережу")}
              </div>
              <div className="col-md-6">
                {numberField("max_discharge_rate", "Макс. швидкість розряджання (кВт)", "0.1")}
                <div className="mb-3">
                  <label htmlFor="algorithm" className="form-label">Алгоритм балансування</label>
                  <select id="algorithm" className={`form-select ${fieldErrors.algorithm ? "is-invalid" : ""}`} value={form.algorithm} onChange={(e) => set("algorithm", e.target.value)}>
                    <option value="basic">Базовий</option>
                  </select>
                  {fieldErrors.algorithm && <div className="invalid-feedback">{fieldErrors.algorithm}</div>}
                </div>
                {checkbox("grid_import_enabled", "Дозволити споживання з мережі")}
              </div>
            </div>
          </div>
        </div>

        <div className="eb-card mb-3">
          <div className="card-body p-4">
            <h2 className="eb-chart-title">Сповіщення</h2>
            {checkbox("alerts_enabled", "Попереджати про низький заряд акумулятора")}
            {numberField("alert_threshold", "Поріг попередження (% заряду)", "1")}
          </div>
        </div>

        <ErrorAlert message={saveError} />
        {saved && <div className="alert alert-success" role="status">Налаштування збережено.</div>}
        <button type="submit" className="btn btn-success" disabled={saving}>
          {saving ? "Збереження…" : "Зберегти налаштування"}
        </button>
      </form>
    </>
  );
}
