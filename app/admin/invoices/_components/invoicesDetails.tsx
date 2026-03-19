"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, DollarSign, Building2, User, Calendar, Clock } from "lucide-react";
import { formatUsd } from "@/lib/formatCurrency";

type InvoiceStatus = 'paid' | 'overdue' | 'pending' | 'draft';

type InvoiceDetail = {
  id: string;
  business: string;
  client: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  issuedDate: string;
  contactName: string;
  contactEmail: string;
  address: string;
  notes: string;
};

const mockInvoices: Record<string, InvoiceDetail> = {
  "INV-5001": { id: "INV-5001", business: "ABC Corporation", client: "Downtown Plaza", amount: 12500, status: "paid", dueDate: "Mar 1, 2026", issuedDate: "Feb 15, 2026", contactName: "James Miller", contactEmail: "j.miller@downtownplaza.com", address: "123 Downtown Ave, New York, NY 10001", notes: "Full payment received. Services rendered for Q1 facility management." },
  "INV-5002": { id: "INV-5002", business: "TechStart Solutions", client: "Metro Office Park", amount: 8400, status: "overdue", dueDate: "Feb 20, 2026", issuedDate: "Feb 5, 2026", contactName: "Sarah Chen", contactEmail: "s.chen@metroofficepk.com", address: "456 Metro Blvd, Chicago, IL 60601", notes: "Payment overdue. Second reminder sent on Feb 25. Follow up required." },
  "INV-5003": { id: "INV-5003", business: "BuildRight Construction", client: "Riverside Apartments", amount: 18900, status: "paid", dueDate: "Mar 5, 2026", issuedDate: "Feb 18, 2026", contactName: "David Torres", contactEmail: "d.torres@riversideapts.com", address: "789 River Rd, Austin, TX 78701", notes: "Invoice settled ahead of due date. Building C renovation phase 1 complete." },
  "INV-5004": { id: "INV-5004", business: "Global Industries Ltd", client: "Harbor View Mall", amount: 32400, status: "pending", dueDate: "Mar 15, 2026", issuedDate: "Mar 1, 2026", contactName: "Lisa Park", contactEmail: "l.park@harborviewmall.com", address: "321 Harbor Dr, Miami, FL 33101", notes: "Awaiting approval from client's finance department before processing." },
  "INV-5005": { id: "INV-5005", business: "ProServices Inc", client: "Tech Campus Building", amount: 6700, status: "draft", dueDate: "Mar 20, 2026", issuedDate: "Mar 8, 2026", contactName: "Mark Johnson", contactEmail: "m.johnson@techcampus.com", address: "654 Innovation Way, Seattle, WA 98101", notes: "Draft pending internal review. Not yet sent to client." },
  "INV-5006": { id: "INV-5006", business: "Quantum Logistics", client: "Distribution Center", amount: 15800, status: "paid", dueDate: "Feb 28, 2026", issuedDate: "Feb 12, 2026", contactName: "Angela Brooks", contactEmail: "a.brooks@distcenter.com", address: "987 Warehouse Ln, Dallas, TX 75201", notes: "Payment confirmed via bank transfer. Warehouse equipment maintenance invoiced." },
};

const getStatusColor = (status: InvoiceStatus) => {
  if (status === 'paid') return { bg: 'rgba(40, 175, 176, 0.2)', text: '#1E8A8B' }
  if (status === 'overdue') return { bg: 'rgba(239, 68, 68, 0.15)', text: '#DC2626' }
  if (status === 'pending') return { bg: 'rgba(245, 158, 11, 0.2)', text: '#B45309' }
  return { bg: '#F3F4F6', text: '#1F271B' }
}

export default function InvoiceDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const invoice = mockInvoices[id];

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <FileText size={48} className="text-neutral-dark/30" />
        <h2 className="text-xl font-semibold text-neutral-dark">Invoice not found</h2>
        <p className="text-sm text-neutral-dark/60">No invoice exists with ID: {id}</p>
        <button onClick={() => router.push("/admin/invoices")} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg" style={{ backgroundColor: "#28AFB0" }}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const color = getStatusColor(invoice.status);

  const stats = [
    { label: "Amount", value: formatUsd(invoice.amount), icon: DollarSign },
    { label: "Status", value: invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1), icon: FileText },
    { label: "Issued", value: invoice.issuedDate, icon: Calendar },
    { label: "Due Date", value: invoice.dueDate, icon: Clock },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/admin/invoices")} className="p-2 rounded-lg hover:bg-neutral-light transition-colors">
          <ArrowLeft size={18} style={{ color: "#1F271B" }} />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark">Invoice Details</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-light overflow-hidden">
        {/* Invoice Header */}
        <div className="p-4 border-b border-neutral-light">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(40,175,176,0.1)" }}>
                <FileText size={24} style={{ color: "#28AFB0" }} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-dark">{invoice.id}</h2>
                <p className="text-sm text-neutral-dark/60">{invoice.client}</p>
              </div>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium self-start sm:self-auto" style={{ backgroundColor: color.bg, color: color.text }}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-neutral-light border-b border-neutral-light">
          {stats.map((stat) => (
            <div key={stat.label} className="p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <stat.icon size={13} style={{ color: "#28AFB0" }} />
                <span className="text-xs text-neutral-dark/60 font-medium">{stat.label}</span>
              </div>
              <p className="text-sm font-bold text-neutral-dark">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Details Grid */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-dark flex items-center gap-1.5">
              <User size={14} style={{ color: "#28AFB0" }} />
              Client Information
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-neutral-dark/50">Client Name</p>
                <p className="text-sm text-neutral-dark">{invoice.client}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-dark/50">Contact Person</p>
                <p className="text-sm text-neutral-dark">{invoice.contactName}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-dark/50">Contact Email</p>
                <p className="text-sm text-neutral-dark">{invoice.contactEmail}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-dark/50">Billing Address</p>
                <p className="text-sm text-neutral-dark">{invoice.address}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-dark flex items-center gap-1.5">
              <FileText size={14} style={{ color: "#28AFB0" }} />
              Invoice Information
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-neutral-dark/50">Invoice ID</p>
                <p className="text-sm font-mono text-neutral-dark">{invoice.id}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-dark/50">Issued By</p>
                <p className="text-sm text-neutral-dark">{invoice.business}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-dark/50">Account Status</p>
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-0.5" style={{ backgroundColor: color.bg, color: color.text }}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-xs text-neutral-dark/50">Notes</p>
                <p className="text-sm text-neutral-dark">{invoice.notes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}