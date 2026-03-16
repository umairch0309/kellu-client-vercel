"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, DollarSign, Building2, User, Calendar, Clock } from "lucide-react";

type JobStatus = "active" | "completed" | "pending" | "cancelled";

type WorkorderDetail = {
  id: string;
  business: string;
  client: string;
  status: JobStatus;
  amount: number;
  createdDate: string;
  address: string;
  contactName: string;
  contactEmail: string;
  description: string;
};

const mockWorkorders: Record<string, WorkorderDetail> = {
  "ORD-1001": { id: "ORD-1001", business: "ABC Corporation", client: "Downtown Plaza", status: "active", amount: 15400, createdDate: "Feb 15, 2026", address: "123 Downtown Ave, New York, NY 10001", contactName: "James Miller", contactEmail: "j.miller@downtownplaza.com", description: "Full facility maintenance and inspection services for the Downtown Plaza commercial complex." },
  "ORD-1002": { id: "ORD-1002", business: "TechStart Solutions", client: "Metro Office Park", status: "completed", amount: 8900, createdDate: "Feb 10, 2026", address: "456 Metro Blvd, Chicago, IL 60601", contactName: "Sarah Chen", contactEmail: "s.chen@metroofficepk.com", description: "IT infrastructure setup and network cabling throughout Metro Office Park floors 1–4." },
  "ORD-1003": { id: "ORD-1003", business: "BuildRight Construction", client: "Riverside Apartments", status: "active", amount: 32500, createdDate: "Feb 8, 2026", address: "789 River Rd, Austin, TX 78701", contactName: "David Torres", contactEmail: "d.torres@riversideapts.com", description: "Structural renovation of Building C including plumbing, drywall, and flooring upgrades." },
  "ORD-1004": { id: "ORD-1004", business: "Global Industries Ltd", client: "Harbor View Mall", status: "pending", amount: 45200, createdDate: "Feb 5, 2026", address: "321 Harbor Dr, Miami, FL 33101", contactName: "Lisa Park", contactEmail: "l.park@harborviewmall.com", description: "HVAC system overhaul across all retail zones and food court areas." },
  "ORD-1005": { id: "ORD-1005", business: "ProServices Inc", client: "Tech Campus Building", status: "completed", amount: 12800, createdDate: "Feb 1, 2026", address: "654 Innovation Way, Seattle, WA 98101", contactName: "Mark Johnson", contactEmail: "m.johnson@techcampus.com", description: "Security system installation including cameras, access control, and alarm systems." },
  "ORD-1006": { id: "ORD-1006", business: "Quantum Logistics", client: "Distribution Center", status: "active", amount: 28900, createdDate: "Jan 28, 2026", address: "987 Warehouse Ln, Dallas, TX 75201", contactName: "Angela Brooks", contactEmail: "a.brooks@distcenter.com", description: "Warehouse racking installation and loading dock equipment maintenance." },
  "ORD-1007": { id: "ORD-1007", business: "ABC Corporation", client: "City Hall Renovation", status: "cancelled", amount: 67300, createdDate: "Jan 25, 2026", address: "1 City Hall Plaza, Boston, MA 02101", contactName: "Robert Kim", contactEmail: "r.kim@cityofboston.gov", description: "Full interior renovation of City Hall floors 3–7 including electrical and accessibility upgrades." },
};

const getStatusColor = (status: JobStatus) => {
  switch (status) {
    case 'completed': return { bg: 'rgba(40, 175, 176, 0.2)', text: '#1E8A8B' };
    case 'active': return { bg: 'rgba(43, 80, 170, 0.2)', text: '#1F3A7A' };
    case 'pending': return { bg: 'rgba(176, 132, 204, 0.2)', text: '#8B6AA3' };
    case 'cancelled': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#DC2626' };
  }
};

export default function WorkorderDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const workorder = mockWorkorders[id];

  if (!workorder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Briefcase size={48} className="text-neutral-dark/30" />
        <h2 className="text-xl font-semibold text-neutral-dark">Workorder not found</h2>
        <p className="text-sm text-neutral-dark/60">No workorder exists with ID: {id}</p>
        <button onClick={() => router.push("/admin/workorders")} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg" style={{ backgroundColor: "#28AFB0" }}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const color = getStatusColor(workorder.status);

  const stats = [
    { label: "Amount", value: `$${workorder.amount.toLocaleString()}`, icon: DollarSign },
    { label: "Status", value: workorder.status.charAt(0).toUpperCase() + workorder.status.slice(1), icon: Briefcase },
    { label: "Business", value: workorder.business, icon: Building2 },
    { label: "Created", value: workorder.createdDate, icon: Calendar },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/admin/workorders")} className="p-2 rounded-lg hover:bg-neutral-light transition-colors">
          <ArrowLeft size={18} style={{ color: "#1F271B" }} />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark">Workorder Details</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-light overflow-hidden">
        {/* Workorder Header */}
        <div className="p-4 border-b border-neutral-light">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(40,175,176,0.1)" }}>
                <Briefcase size={24} style={{ color: "#28AFB0" }} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-dark">{workorder.id}</h2>
                <p className="text-sm text-neutral-dark/60">{workorder.client}</p>
              </div>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium self-start sm:self-auto" style={{ backgroundColor: color.bg, color: color.text }}>
              {workorder.status.charAt(0).toUpperCase() + workorder.status.slice(1)}
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
                <p className="text-sm text-neutral-dark">{workorder.client}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-dark/50">Contact Person</p>
                <p className="text-sm text-neutral-dark">{workorder.contactName}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-dark/50">Contact Email</p>
                <p className="text-sm text-neutral-dark">{workorder.contactEmail}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-dark/50">Site Address</p>
                <p className="text-sm text-neutral-dark">{workorder.address}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-dark flex items-center gap-1.5">
              <Briefcase size={14} style={{ color: "#28AFB0" }} />
              Workorder Information
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-neutral-dark/50">Workorder ID</p>
                <p className="text-sm font-mono text-neutral-dark">{workorder.id}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-dark/50">Assigned Business</p>
                <p className="text-sm text-neutral-dark">{workorder.business}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-dark/50">Created Date</p>
                <p className="text-sm text-neutral-dark">{workorder.createdDate}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-dark/50">Description</p>
                <p className="text-sm text-neutral-dark">{workorder.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}