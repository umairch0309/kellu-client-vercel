"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Eye, UserCheck, Ban, Building2 } from "lucide-react";

type BusinessItem = {
  id: string;
  companyName: string;
  email: string;
  status: "active" | "inactive" | "suspended";
  totalJobs: number;
  revenue: number;
  usersCount: number;
  lastLogin: string;
};

const initialMockBusinesses: BusinessItem[] = [
  {
    id: "1",
    companyName: "ABC Corporation",
    email: "contact@abccorp.com",
    status: "active",
    totalJobs: 142,
    revenue: 45800,
    usersCount: 12,
    lastLogin: "2 hours ago",
  },
  {
    id: "2",
    companyName: "TechStart Solutions",
    email: "hello@techstart.io",
    status: "active",
    totalJobs: 89,
    revenue: 32400,
    usersCount: 8,
    lastLogin: "1 day ago",
  },
  {
    id: "3",
    companyName: "Global Industries Ltd",
    email: "info@globalind.com",
    status: "suspended",
    totalJobs: 234,
    revenue: 78900,
    usersCount: 25,
    lastLogin: "2 weeks ago",
  },
  {
    id: "4",
    companyName: "BuildRight Construction",
    email: "admin@buildright.com",
    status: "active",
    totalJobs: 167,
    revenue: 54200,
    usersCount: 15,
    lastLogin: "5 hours ago",
  },
  {
    id: "5",
    companyName: "Creative Design Studio",
    email: "studio@creative.design",
    status: "inactive",
    totalJobs: 45,
    revenue: 12300,
    usersCount: 5,
    lastLogin: "3 months ago",
  },
];

export default function AdminBusinessesList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [businesses] = useState(initialMockBusinesses);
  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || business.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusStyle = (status: string) => {
    if (status === "active") return "bg-[rgba(40,175,176,0.2)] text-[#1E8A8B]";
    if (status === "inactive") return "bg-neutral-dark/10 text-neutral-dark";
    return "bg-[rgba(239,68,68,0.2)] text-red-600";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark">
          Businesses
        </h1>
        <button
          className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          style={{ backgroundColor: "#28AFB0", color: "white" }}
        >
          <Plus size={18} />
          <span>Create Business</span>
        </button>
      </div>

      {/* Businesses List */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-light overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 p-3 border-b border-neutral-light">
          <h2 className="text-base font-bold" style={{ color: "#1F271B" }}>
            All businesses ({filteredBusinesses.length} result
            {filteredBusinesses.length !== 1 ? "s" : ""})
          </h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 sm:flex-initial justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border rounded text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              style={{
                borderColor: "#EAEBED",
                color: "#1F271B",
                backgroundColor: "#F3F4F6",
              }}
            >
              <option value="all">Status | All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <div className="relative flex-1 sm:flex-initial sm:min-w-[200px]">
              <Search
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2"
                size={14}
                style={{ color: "#1F271B", opacity: 0.5 }}
              />
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                style={{ borderColor: "#EAEBED", color: "#1F271B" }}
              />
            </div>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-neutral-light">
          {filteredBusinesses.map((business) => (
            <div
              key={business.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/businesses/${business.id}`)}
              className="p-4 hover:bg-neutral-light/50 cursor-pointer active:bg-neutral-light/70"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-dark">
                    {business.companyName}
                  </p>
                  <p className="text-xs text-neutral-dark/70 mt-0.5">
                    {business.email}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ml-2 shrink-0 flex items-center gap-1 ${statusStyle(business.status)}`}
                >
                  <Building2 size={14} />
                  {business.status}
                </span>
              </div>
              <div className="space-y-1 mt-2">
                <p className="text-xs text-neutral-dark/70">
                  Jobs: {business.totalJobs}
                </p>
                <p className="text-xs text-neutral-dark/70">
                  Users: {business.usersCount}
                </p>
                <p className="text-xs text-neutral-dark/70">
                  Last Login: {business.lastLogin}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-light">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">
                  Company Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-dark">
                  Total Jobs
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-dark">
                  Revenue
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-dark">
                  Users
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">
                  Last Login
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-dark">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBusinesses.map((business) => (
                <tr
                  key={business.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/businesses/${business.id}`)}
                  className="border-b border-neutral-light hover:bg-neutral-light/50 cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm font-medium text-neutral-dark">
                    {business.companyName}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-dark/70">
                    {business.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle(business.status)}`}
                    >
                      {business.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-neutral-dark">
                    {business.totalJobs}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-neutral-dark">
                    ${business.revenue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-neutral-dark">
                    {business.usersCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-dark/70">
                    {business.lastLogin}
                  </td>
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/businesses/${business.id}`}
                        className="p-2 rounded hover:bg-neutral-light"
                      >
                        <Eye size={16} />
                      </Link>
                      <button className="p-2 rounded hover:bg-neutral-light">
                        <UserCheck size={16} />
                      </button>
                      <button className="p-2 rounded hover:bg-neutral-light">
                        <Ban size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
