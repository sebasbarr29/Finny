"use client";

import { useState } from "react";
import { IconCheck } from "@/app/components/icons";

type Item = { id: string; task: string; category: "profit" | "cash_flow" | "costs" | "growth"; priority: "high" | "medium" | "low"; done: boolean };

const CATEGORIES: { key: Item["category"]; label: string; tone: string }[] = [
  { key: "costs", label: "Costs", tone: "rose" },
  { key: "cash_flow", label: "Cash flow", tone: "blue" },
  { key: "profit", label: "Profit", tone: "green" },
  { key: "growth", label: "Growth", tone: "amber" },
];
const PRIORITY_LABEL = { high: "High priority", medium: "Medium priority", low: "Low priority" };

export default function Checklist({ items: initial }: { items: Item[] }) {
  const [items, setItems] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const done = items.filter((i) => i.done).length;

  async function toggle(item: Item) {
    const next = !item.done;
    setError(null);
    setSaving(item.id);
    setItems((all) => all.map((i) => (i.id === item.id ? { ...i, done: next } : i)));
    try {
      const res = await fetch(`/api/actions/${item.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ done: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setItems((all) => all.map((i) => (i.id === item.id ? { ...i, done: !next } : i)));
      setError("Couldn't save that change. Check your connection and try again.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="checklist">
      <section className="card progress-card" aria-label="Progress">
        <div className="card-row">
          <strong>{done} of {items.length} done</strong>
          <span className="muted small">{items.length - done === 0 ? "All done for this month" : `${items.length - done} left`}</span>
        </div>
        <div className="pbar lg" role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={done} aria-label="Action plan progress">
          <i style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} />
        </div>
      </section>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="check-groups">
        {CATEGORIES.map((cat) => {
          const group = items.filter((i) => i.category === cat.key);
          if (!group.length) return null;
          return (
            <section key={cat.key} className={`card check-group ${cat.tone}`} aria-labelledby={`g-${cat.key}`}>
              <h2 id={`g-${cat.key}`} className="card-title"><span className="dot" aria-hidden="true" />{cat.label}</h2>
              <ul>
                {group.map((i) => (
                  <li key={i.id} className={i.done ? "done" : undefined}>
                    <label>
                      <input type="checkbox" checked={i.done} onChange={() => toggle(i)} disabled={saving === i.id} />
                      <span className="cb" aria-hidden="true">{i.done && <IconCheck />}</span>
                      <span className="task">{i.task}</span>
                    </label>
                    <span className={`prio ${i.priority}`}>{PRIORITY_LABEL[i.priority]}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
