"use client";

import { useActionState } from "react";
import { saveSettings, type SettingsState } from "./actions";

export default function SettingsForm({
  email,
  initial,
  types,
}: {
  email: string;
  initial: { businessName: string; businessType: string; language: "en" | "es" };
  types: { value: string; label: string }[];
}) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveSettings, {});
  return (
    <form action={action} className="card settings-form">
      {state.ok && <p className="form-notice" role="status">Settings saved.</p>}
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      <label className="field">
        <span>Business name</span>
        <input id="businessName" name="businessName" defaultValue={initial.businessName} maxLength={100} placeholder="e.g. Bright Smile Dental" />
      </label>
      <label className="field">
        <span>Business type</span>
        <select id="businessType" name="businessType" defaultValue={initial.businessType}>
          <option value="">Choose one</option>
          {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <small>Helps Finny give advice that fits your kind of business.</small>
      </label>
      <fieldset className="field radio-group">
        <legend>Preferred report language</legend>
        <label><input type="radio" name="language" value="en" defaultChecked={initial.language === "en"} /> English</label>
        <label><input type="radio" name="language" value="es" defaultChecked={initial.language === "es"} /> Español</label>
        <small>Used as the default when you upload. You can still pick per report.</small>
      </fieldset>
      <label className="field">
        <span>Email</span>
        <input value={email} readOnly disabled />
      </label>
      <div className="row-actions">
        <button className="btn btn-primary" type="submit" disabled={pending}>{pending ? "Saving…" : "Save settings"}</button>
      </div>
    </form>
  );
}
