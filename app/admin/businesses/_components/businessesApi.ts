import type { BusinessItem } from "./businessesTypes";

export function extractBusinessesList(json: unknown): unknown[] {
  if (json == null || typeof json !== "object") return [];
  const obj = json as Record<string, unknown>;
  const data = obj.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const nested = (data as Record<string, unknown>).data;
    if (Array.isArray(nested)) return nested;
  }
  if (Array.isArray(data)) return data;
  return [];
}

export function asNumber(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const parsed = parseFloat(v);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export function formatLastLogin(value: unknown): string {
  if (value == null) return "—";
  const raw = String(value).trim();
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString();
}

export function normalizeBusiness(raw: Record<string, unknown>): BusinessItem {
  const owner = (raw.owner ?? {}) as Record<string, unknown>;
  const id = raw.id != null ? String(raw.id) : "";
  const companyName =
    typeof raw.companyName === "string" && raw.companyName.trim() !== ""
      ? raw.companyName
      : "—";
  const email =
    typeof raw.email === "string" && raw.email.trim() !== ""
      ? raw.email
      : typeof owner.email === "string"
      ? owner.email
      : "—";
  const contactInfo = (raw.contactInfo ?? {}) as Record<string, unknown>;
  const phone =
    typeof raw.phone === "string" && raw.phone.trim() !== ""
      ? raw.phone
      : typeof contactInfo.phone === "string" && contactInfo.phone.trim() !== ""
      ? contactInfo.phone
      : "";
  const address =
    typeof raw.address === "string" && raw.address.trim() !== ""
      ? raw.address
      : typeof contactInfo.address === "string" && contactInfo.address.trim() !== ""
      ? contactInfo.address
      : "";
  const website =
    typeof raw.website === "string" && raw.website.trim() !== ""
      ? raw.website
      : typeof contactInfo.website === "string" && contactInfo.website.trim() !== ""
      ? contactInfo.website
      : "";
  return {
    id,
    companyName,
    email,
    phone,
    address,
    website,
    status: String(raw.status ?? "inactive").toLowerCase(),
    totalJobs: Math.trunc(asNumber(raw.totalJobs)),
    revenue: asNumber(raw.revenue),
    usersCount: Math.trunc(asNumber(raw.users)),
    lastLogin: formatLastLogin(raw.lastLogin),
  };
}

export function normalizeWebsite(input: string): string | null {
  const websiteInput = input.trim();
  if (!websiteInput) return "";
  const withProtocol =
    /^https?:\/\//i.test(websiteInput) ? websiteInput : `https://${websiteInput}`;
  try {
    return new URL(withProtocol).toString();
  } catch {
    return null;
  }
}
