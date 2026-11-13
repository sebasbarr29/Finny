import "server-only";
import type { ActionPlanItem, AiReport } from "./ai";
import { sql } from "./db";

export type ActionItem = {
  id: string;
  report_id: string;
  position: number;
  task: string;
  category: ActionPlanItem["category"];
  priority: ActionPlanItem["priority"];
  done: boolean;
};

const KEYWORDS: [ActionPlanItem["category"], RegExp][] = [
  ["cash_flow", /cash|invoice|claim|collect|payment|pay(s|ing)? |receivable|deposit|cobr|factur|pago|reembolso|flujo/i],
  ["costs", /cost|supplier|supply|supplies|vendor|expense|spend|bill|rent|utilit|quote|insumo|proveedor|gasto|costo|cotiza/i],
  ["growth", /marketing|customer|patient|client|new |grow|referral|promot|advertis|crec|cliente|paciente|nuevo/i],
  ["profit", /price|pricing|fee|margin|profit|payroll|staff|schedule|precio|tarifa|margen|utilidad|personal/i],
];

/** For reports created before action plans existed: turn "what to do next" into checklist items. */
function fallbackItems(content: AiReport): ActionPlanItem[] {
  const steps = content.monthly_report?.what_to_do_next ?? [];
  return steps.map((task, i) => ({
    task,
    category: KEYWORDS.find(([, re]) => re.test(task))?.[0] ?? "profit",
    priority: i === 0 ? "high" : i === 1 ? "medium" : "low",
  }));
}

/** Creates the checklist for a report the first time it's needed. Safe to call repeatedly. */
export async function ensureActionItems(userId: string, reportId: string, content: AiReport): Promise<void> {
  const existing = await sql<{ n: number }>("SELECT count(*)::int AS n FROM action_items WHERE report_id = $1 AND user_id = $2", [reportId, userId]);
  if (existing[0].n > 0) return;
  const items = content.action_plan?.length ? content.action_plan : fallbackItems(content);
  for (const [i, it] of items.entries()) {
    await sql(
      `INSERT INTO action_items (user_id, report_id, position, task, category, priority)
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (report_id, position) DO NOTHING`,
      [userId, reportId, i, it.task, it.category, it.priority],
    );
  }
}

export async function listActionItems(userId: string, reportId: string): Promise<ActionItem[]> {
  return sql<ActionItem>(
    `SELECT id::text AS id, report_id::text AS report_id, position, task, category, priority, done
       FROM action_items WHERE user_id = $1 AND report_id = $2
      ORDER BY CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, position`,
    [userId, reportId],
  );
}

/** Only updates an item that belongs to this user. Returns false if not found. */
export async function setActionDone(userId: string, itemId: string, done: boolean): Promise<boolean> {
  if (!/^\d{1,18}$/.test(itemId)) return false;
  const rows = await sql(
    `UPDATE action_items SET done = $3, done_at = CASE WHEN $3 THEN now() ELSE NULL END
      WHERE id = $1 AND user_id = $2 RETURNING id`,
    [itemId, userId, done],
  );
  return rows.length > 0;
}

export async function actionProgress(userId: string, reportId: string): Promise<{ done: number; total: number }> {
  const rows = await sql<{ done: number; total: number }>(
    `SELECT count(*) FILTER (WHERE done)::int AS done, count(*)::int AS total FROM action_items WHERE user_id = $1 AND report_id = $2`,
    [userId, reportId],
  );
  return rows[0];
}
