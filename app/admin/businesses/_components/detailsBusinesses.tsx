"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Mail,
  Users,
  Briefcase,
  DollarSign,
  Clock,
  Ban,
  UserCheck,
  Activity,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type BusinessDetail = {
  id: string;
  companyName: string;
  email: string;
  status: string;
  totalJobs: number;
  revenue: number;
  usersCount: number;
  lastLogin: string;
  phone: string;
  address: string;
  joinedDate: string;
  industry: string;
};

function extractBusinessesList(json: unknown): unknown[] {
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

function asNumber(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const parsed = parseFloat(v);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function asDateDisplay(value: unknown): string {
  if (value == null) return "—";
  const raw = String(value).trim();
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString();
}

function normalizeBusinessDetail(raw: Record<string, unknown>): BusinessDetail {
  const owner = (raw.owner ?? {}) as Record<string, unknown>;
  const contactInfo = (raw.contactInfo ?? {}) as Record<string, unknown>;
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
  const phone =
    (typeof raw.phone === "string" && raw.phone) ||
    (typeof contactInfo.phone === "string" && contactInfo.phone) ||
    (typeof owner.phone === "string" && owner.phone) ||
    "—";
  const address =
    (typeof raw.address === "string" && raw.address) ||
    (typeof contactInfo.address === "string" && contactInfo.address) ||
    (typeof owner.address === "string" && owner.address) ||
    "—";
  const registered = raw.registered;
  return {
    id: String(raw.id ?? ""),
    companyName,
    email,
    status: String(raw.status ?? "inactive").toLowerCase(),
    totalJobs: Math.trunc(asNumber(raw.totalJobs)),
    revenue: asNumber(raw.revenue),
    usersCount: Math.trunc(asNumber(raw.users)),
    lastLogin: asDateDisplay(raw.lastLogin),
    phone,
    address,
    joinedDate: asDateDisplay(registered),
    industry: "Business",
  };
}

const statusStyle = (status: string) => {
  if (status === "active") return "bg-[rgba(40,175,176,0.2)] text-[#1E8A8B]";
  if (status === "inactive") return "bg-neutral-dark/10 text-neutral-dark";
  return "bg-[rgba(239,68,68,0.2)] text-red-600";
};

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [businesses, setBusinesses] = useState<BusinessDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [reminderSending, setReminderSending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailForm, setEmailForm] = useState({
    subject: "",
    body: "",
    message: "",
  });

  useEffect(() => {
    let cancelled = false;
    const fetchBusinesses = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
        const res = await fetch(`${baseUrl}/api/businesses`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || (json as { success?: boolean }).success === false) {
          const msg =
            (json as { message?: string }).message ??
            `Failed to load businesses (${res.status})`;
          throw new Error(msg);
        }
        const rows = extractBusinessesList(json)
          .filter(
            (item): item is Record<string, unknown> =>
              item != null && typeof item === "object" && !Array.isArray(item)
          )
          .map((item) => normalizeBusinessDetail(item));
        if (!cancelled) setBusinesses(rows);
      } catch (e) {
        if (!cancelled) {
          setFetchError(
            e instanceof Error ? e.message : "Failed to load businesses"
          );
          setBusinesses([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchBusinesses();
    return () => {
      cancelled = true;
    };
  }, []);

  const business = useMemo(
    () => businesses.find((item) => item.id === id),
    [businesses, id]
  );

  const handleToggleSuspend = async () => {
    if (!business || !business.id || statusUpdating) return;
    setStatusUpdating(true);
    try {
      const isSuspended = business.status === "suspended";
      const actionPath = isSuspended ? "unsuspend" : "suspend";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(
        `${baseUrl}/api/businesses/${encodeURIComponent(business.id)}/${actionPath}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({}),
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok || (json as { success?: boolean }).success === false) {
        const msg =
          (json as { message?: string }).message ??
          (json as { errors?: { message?: string }[] })?.errors?.[0]?.message ??
          `Failed to ${actionPath} business (${res.status})`;
        alert(msg);
        return;
      }
      const nextStatus =
        typeof (json as { data?: { status?: unknown } }).data?.status === "string"
          ? String((json as { data?: { status?: string } }).data?.status).toLowerCase()
          : isSuspended
          ? "active"
          : "suspended";
      setBusinesses((prev) =>
        prev.map((item) =>
          item.id === business.id ? { ...item, status: nextStatus } : item
        )
      );
      alert(
        (json as { message?: string }).message ??
          (isSuspended
            ? "Business unsuspended successfully."
            : "Business suspended successfully.")
      );
    } catch (e) {
      alert(
        e instanceof Error
          ? e.message
          : "Failed to update business status"
      );
    } finally {
      setStatusUpdating(false);
    }
  };

  const resetEmailForm = () => {
    setEmailForm({ subject: "", body: "", message: "" });
    setEmailError(null);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business?.id) return;
    const subject = emailForm.subject.trim();
    if (!subject) {
      setEmailError("Subject is required.");
      return;
    }
    setEmailSending(true);
    setEmailError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const payload: Record<string, string> = { subject };
      if (emailForm.body.trim()) payload.body = emailForm.body.trim();
      if (emailForm.message.trim()) payload.message = emailForm.message.trim();
      const res = await fetch(
        `${baseUrl}/api/businesses/${encodeURIComponent(business.id)}/send-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok || (json as { success?: boolean }).success === false) {
        const msg =
          (json as { message?: string }).message ??
          (json as { data?: { message?: string } }).data?.message ??
          (json as { errors?: { message?: string }[] })?.errors?.[0]?.message ??
          `Failed to send email (${res.status})`;
        setEmailError(msg);
        return;
      }
      alert(
        (json as { data?: { message?: string } }).data?.message ??
          (json as { message?: string }).message ??
          "Email sent successfully."
      );
      setEmailDialogOpen(false);
      resetEmailForm();
    } catch (e2) {
      setEmailError(e2 instanceof Error ? e2.message : "Failed to send email");
    } finally {
      setEmailSending(false);
    }
  };

  const handleSendReminder = async () => {
    if (!business?.id || reminderSending) return;
    setReminderSending(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(
        `${baseUrl}/api/businesses/${encodeURIComponent(business.id)}/reminder`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({}),
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok || (json as { success?: boolean }).success === false) {
        const msg =
          (json as { message?: string }).message ??
          (json as { data?: { message?: string } }).data?.message ??
          (json as { errors?: { message?: string }[] })?.errors?.[0]?.message ??
          `Failed to send reminder (${res.status})`;
        alert(msg);
        return;
      }
      alert(
        (json as { data?: { message?: string } }).data?.message ??
          (json as { message?: string }).message ??
          "Reminder sent successfully."
      );
    } catch (e) {
      alert(
        e instanceof Error ? e.message : "Failed to send reminder"
      );
    } finally {
      setReminderSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Building2 size={48} className="text-neutral-dark/30" />
        <h2 className="text-xl font-semibold text-neutral-dark">Loading business...</h2>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Building2 size={48} className="text-neutral-dark/30" />
        <h2 className="text-xl font-semibold text-neutral-dark">
          Business not found
        </h2>
        {fetchError ? (
          <p className="text-sm text-red-600">{fetchError}</p>
        ) : null}
        <p className="text-sm text-neutral-dark/60">
          No business exists with ID: {id}
        </p>
        <button
          onClick={() => router.push("/admin/businesses")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg"
          style={{ backgroundColor: "#28AFB0" }}
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Jobs",
      value: business.totalJobs,
      icon: Briefcase,
      color: "#28AFB0",
    },
    {
      label: "Revenue",
      value: `$${business.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: "#28AFB0",
    },
    {
      label: "Users",
      value: business.usersCount,
      icon: Users,
      color: "#28AFB0",
    },
    {
      label: "Last Login",
      value: business.lastLogin,
      icon: Clock,
      color: "#28AFB0",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/businesses")}
          className="p-2 rounded-lg hover:bg-neutral-light transition-colors"
        >
          <ArrowLeft size={18} style={{ color: "#1F271B" }} />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark">
          Business Details
        </h1>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-light overflow-hidden">
        {/* Business Header */}
        <div className="p-4 border-b border-neutral-light">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: "rgba(40,175,176,0.1)" }}
              >
                <Building2 size={24} style={{ color: "#28AFB0" }} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-dark">
                  {business.companyName}
                </h2>
                <p className="text-sm text-neutral-dark/60">{business.industry}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle(business.status)}`}
              >
                {business.status}
              </span>
              <button
                type="button"
                onClick={() => {
                  resetEmailForm();
                  setEmailDialogOpen(true);
                }}
                className="px-3 py-1.5 rounded text-xs font-medium transition-colors text-white disabled:opacity-60"
                style={{ backgroundColor: "#28AFB0" }}
              >
                Send email
              </button>
              <button
                type="button"
                onClick={handleSendReminder}
                disabled={reminderSending}
                className="px-3 py-1.5 rounded text-xs font-medium transition-colors text-white disabled:opacity-60"
                style={{ backgroundColor: "#28AFB0" }}
              >
                {reminderSending ? "Sending..." : "Reminder"}
              </button>
              <button
                type="button"
                onClick={handleToggleSuspend}
                disabled={statusUpdating}
                className="p-2 rounded-lg hover:bg-neutral-light transition-colors"
                title={business.status === "suspended" ? "Unsuspend" : "Suspend"}
              >
                {business.status === "suspended" ? (
                  <UserCheck size={16} style={{ color: "#1E8A8B" }} />
                ) : (
                  <Ban size={16} style={{ color: "#EF4444" }} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-neutral-light border-b border-neutral-light">
          {stats.map((stat) => (
            <div key={stat.label} className="p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <stat.icon size={13} style={{ color: stat.color }} />
                <span className="text-xs text-neutral-dark/60 font-medium">
                  {stat.label}
                </span>
              </div>
              <p className="text-base font-bold text-neutral-dark">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Details Grid */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-dark flex items-center gap-1.5">
              <Activity size={14} style={{ color: "#28AFB0" }} />
              Contact Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Mail size={14} className="mt-0.5 shrink-0 text-neutral-dark/40" />
                <div>
                  <p className="text-xs text-neutral-dark/50">Email</p>
                  <p className="text-sm text-neutral-dark">{business.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 shrink-0 text-neutral-dark/40"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <div>
                  <p className="text-xs text-neutral-dark/50">Phone</p>
                  <p className="text-sm text-neutral-dark">{business.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 shrink-0 text-neutral-dark/40"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div>
                  <p className="text-xs text-neutral-dark/50">Address</p>
                  <p className="text-sm text-neutral-dark">{business.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-dark flex items-center gap-1.5">
              <Building2 size={14} style={{ color: "#28AFB0" }} />
              Account Information
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-neutral-dark/50">Business ID</p>
                <p className="text-sm font-mono text-neutral-dark">#{business.id}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-dark/50">Industry</p>
                <p className="text-sm text-neutral-dark">{business.industry}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-dark/50">Member Since</p>
                <p className="text-sm text-neutral-dark">{business.joinedDate}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-dark/50">Account Status</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 ${statusStyle(business.status)}`}
                >
                  {business.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={emailDialogOpen}
        onOpenChange={(open) => {
          setEmailDialogOpen(open);
          if (!open) resetEmailForm();
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Send email to business</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendEmail} className="space-y-3">
            {emailError && (
              <div
                className="rounded border px-3 py-2 text-xs"
                style={{
                  borderColor: "#FCA5A5",
                  color: "#B91C1C",
                  backgroundColor: "#FEF2F2",
                }}
              >
                {emailError}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#1F271B" }}>
                Subject *
              </label>
              <input
                type="text"
                required
                value={emailForm.subject}
                onChange={(e) =>
                  setEmailForm((prev) => ({ ...prev, subject: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                style={{ borderColor: "#EAEBED", color: "#1F271B" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#1F271B" }}>
                Body
              </label>
              <textarea
                rows={3}
                value={emailForm.body}
                onChange={(e) =>
                  setEmailForm((prev) => ({ ...prev, body: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded text-sm resize-none"
                style={{ borderColor: "#EAEBED", color: "#1F271B" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#1F271B" }}>
                Message
              </label>
              <textarea
                rows={3}
                value={emailForm.message}
                onChange={(e) =>
                  setEmailForm((prev) => ({ ...prev, message: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded text-sm resize-none"
                style={{ borderColor: "#EAEBED", color: "#1F271B" }}
              />
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setEmailDialogOpen(false)}
                className="px-3 py-2 border rounded text-sm"
                style={{ borderColor: "#EAEBED", color: "#1F271B" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={emailSending}
                className="px-3 py-2 rounded text-sm text-white disabled:opacity-60"
                style={{ backgroundColor: "#28AFB0" }}
              >
                {emailSending ? "Sending..." : "Send email"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}