import * as XLSX from "xlsx";
import { isoDate } from "./adminUtils";

export type ExportColumn =
  | "name"
  | "email"
  | "phone"
  | "joined"
  | "accountStatus"
  | "accountType"
  | "planName"
  | "subStart"
  | "subEnd";

export const EXPORT_COLUMNS: ExportColumn[] = [
  "name",
  "email",
  "phone",
  "joined",
  "accountStatus",
  "accountType",
  "planName",
  "subStart",
  "subEnd",
];

export interface ExportableUser {
  full_name: string;
  email: string;
  phone: string;
  created_at?: string | null;
  is_active: boolean;
  account_type: string;
  plan_name?: string | null;
  subscription_start?: string | null;
  subscription_end?: string | null;
}

const cell = (u: ExportableUser, col: ExportColumn, labels: Record<string, string>): string => {
  switch (col) {
    case "name":
      return u.full_name ?? "";
    case "email":
      return u.email ?? "";
    case "phone":
      // Kept as text so a leading zero is never dropped.
      return u.phone ? String(u.phone) : "";
    case "joined":
      return isoDate(u.created_at);
    case "accountStatus":
      return u.is_active ? labels.active : labels.inactive;
    case "accountType":
      return u.account_type === "premium" ? labels.premium : labels.free;
    case "planName":
      return u.plan_name ?? "";
    case "subStart":
      return isoDate(u.subscription_start);
    case "subEnd":
      return isoDate(u.subscription_end);
  }
};

const download = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const exportUsersXlsx = (
  users: ExportableUser[],
  columns: ExportColumn[],
  headers: Record<ExportColumn, string>,
  labels: Record<string, string>,
) => {
  const aoa = [columns.map((c) => headers[c]), ...users.map((u) => columns.map((c) => cell(u, c, labels)))];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  // Force every data cell to text so phone numbers keep their leading zero.
  const range = XLSX.utils.decode_range(ws["!ref"] as string);
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      const target = ws[ref];
      if (target) {
        target.t = "s";
        target.z = "@";
      }
    }
  }
  ws["!cols"] = columns.map(() => ({ wch: 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Users");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  download(new Blob([out], { type: "application/octet-stream" }), `users-${isoDate(new Date().toISOString())}.xlsx`);
};

export const exportUsersCsv = (
  users: ExportableUser[],
  columns: ExportColumn[],
  headers: Record<ExportColumn, string>,
  labels: Record<string, string>,
) => {
  const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [
    columns.map((c) => esc(headers[c])).join(","),
    ...users.map((u) =>
      columns
        .map((c) => {
          const v = cell(u, c, labels);
          // Excel-safe text formula keeps the leading zero of phone numbers intact.
          if (c === "phone" && v) return `="${v}"`;
          return esc(v);
        })
        .join(","),
    ),
  ];
  download(
    new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" }),
    `users-${isoDate(new Date().toISOString())}.csv`,
  );
};
