"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Mail,
  Users,
  Briefcase,
  DollarSign,
  Clock,
  UserCheck,
  Ban,
  Activity,
} from "lucide-react";

type BusinessDetail = {
  id: string;
  companyName: string;
  email: string;
  status: "active" | "inactive" | "suspended";
  totalJobs: number;
  revenue: number;
  usersCount: number;
  lastLogin: string;
  phone: string;
  address: string;
  joinedDate: string;
  industry: string;
};

const mockBusinesses: Record<string, BusinessDetail> = {
  "1": {
    id: "1",
    companyName: "ABC Corporation",
    email: "contact@abccorp.com",
    status: "active",
    totalJobs: 142,
    revenue: 45800,
    usersCount: 12,
    lastLogin: "2 hours ago",
    phone: "+1 (555) 123-4567",
    address: "123 Business Ave, New York, NY 10001",
    joinedDate: "January 15, 2023",
    industry: "Technology",
  },
  "2": {
    id: "2",
    companyName: "TechStart Solutions",
    email: "hello@techstart.io",
    status: "active",
    totalJobs: 89,
    revenue: 32400,
    usersCount: 8,
    lastLogin: "1 day ago",
    phone: "+1 (555) 234-5678",
    address: "456 Innovation Blvd, San Francisco, CA 94105",
    joinedDate: "March 8, 2023",
    industry: "Software",
  },
  "3": {
    id: "3",
    companyName: "Global Industries Ltd",
    email: "info@globalind.com",
    status: "suspended",
    totalJobs: 234,
    revenue: 78900,
    usersCount: 25,
    lastLogin: "2 weeks ago",
    phone: "+1 (555) 345-6789",
    address: "789 Corporate Dr, Chicago, IL 60601",
    joinedDate: "September 21, 2022",
    industry: "Manufacturing",
  },
  "4": {
    id: "4",
    companyName: "BuildRight Construction",
    email: "admin@buildright.com",
    status: "active",
    totalJobs: 167,
    revenue: 54200,
    usersCount: 15,
    lastLogin: "5 hours ago",
    phone: "+1 (555) 456-7890",
    address: "321 Builder St, Dallas, TX 75201",
    joinedDate: "June 3, 2023",
    industry: "Construction",
  },
  "5": {
    id: "5",
    companyName: "Creative Design Studio",
    email: "studio@creative.design",
    status: "inactive",
    totalJobs: 45,
    revenue: 12300,
    usersCount: 5,
    lastLogin: "3 months ago",
    phone: "+1 (555) 567-8901",
    address: "654 Art Lane, Los Angeles, CA 90001",
    joinedDate: "November 12, 2023",
    industry: "Design",
  },
};

const statusStyle = (status: string) => {
  if (status === "active") return "bg-[rgba(40,175,176,0.2)] text-[#1E8A8B]";
  if (status === "inactive") return "bg-neutral-dark/10 text-neutral-dark";
  return "bg-[rgba(239,68,68,0.2)] text-red-600";
};

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const business = mockBusinesses[id];

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Building2 size={48} className="text-neutral-dark/30" />
        <h2 className="text-xl font-semibold text-neutral-dark">
          Business not found
        </h2>
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
                className="p-2 rounded-lg hover:bg-neutral-light transition-colors"
                title="Approve"
              >
                <UserCheck size={16} style={{ color: "#1F271B" }} />
              </button>
              <button
                className="p-2 rounded-lg hover:bg-neutral-light transition-colors"
                title="Suspend"
              >
                <Ban size={16} style={{ color: "#EF4444" }} />
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
    </div>
  );
}