import Link from "next/link";
import { Eye, Pencil, Building2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { BusinessItem } from "./businessesTypes";

type Props = {
  loading: boolean;
  fetchError: string | null;
  businesses: BusinessItem[];
  statusStyle: (status: string) => string;
  onRowClick: (id: string) => void;
  onToggleStatus: (business: BusinessItem) => void;
  statusUpdatingIds: Set<string>;
  onOpenUpdate: (business: BusinessItem) => void;
};

export default function AdminBusinessesTable({
  loading,
  fetchError,
  businesses,
  statusStyle,
  onRowClick,
  onToggleStatus,
  statusUpdatingIds,
  onOpenUpdate,
}: Props) {
  return (
    <>
      <div className="md:hidden divide-y divide-neutral-light">
        {loading && (
          <div className="p-4 text-xs text-neutral-dark/70">Loading businesses...</div>
        )}
        {!loading && fetchError && (
          <div className="p-4 text-xs text-red-600">{fetchError}</div>
        )}
        {businesses.map((business) => (
          <div
            key={business.id}
            role="button"
            tabIndex={0}
            onClick={() => onRowClick(business.id)}
            className="p-4 hover:bg-neutral-light/50 cursor-pointer active:bg-neutral-light/70"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-dark">{business.companyName}</p>
                <p className="text-xs text-neutral-dark/70 mt-0.5">{business.email}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 shrink-0 flex items-center gap-1 ${statusStyle(business.status)}`}>
                <Building2 size={14} />
                {business.status}
              </span>
            </div>
            <div className="space-y-1 mt-2">
              <p className="text-xs text-neutral-dark/70">Jobs: {business.totalJobs}</p>
              <p className="text-xs text-neutral-dark/70">Users: {business.usersCount}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <TooltipProvider>
          <table className="w-full">
            <thead className="bg-neutral-light">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Company Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Status</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-dark">Total Jobs</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-dark">Revenue</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-dark">Users</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-neutral-dark/70">
                    Loading businesses...
                  </td>
                </tr>
              )}
              {!loading && fetchError && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-red-600">
                    {fetchError}
                  </td>
                </tr>
              )}
              {!loading && !fetchError && businesses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-neutral-dark/70">
                    No businesses found.
                  </td>
                </tr>
              )}
              {businesses.map((business) => (
                <tr
                  key={business.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onRowClick(business.id)}
                  className="border-b border-neutral-light hover:bg-neutral-light/50 cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm font-medium text-neutral-dark">{business.companyName}</td>
                  <td className="px-4 py-3 text-sm text-neutral-dark/70">{business.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle(business.status)}`}>
                      {business.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-neutral-dark">{business.totalJobs}</td>
                  <td className="px-4 py-3 text-sm text-right text-neutral-dark">${business.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-neutral-dark">{business.usersCount}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <label className="inline-flex items-center gap-2 cursor-pointer px-1.5 py-1 rounded hover:bg-neutral-light" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[11px] font-medium" style={{ color: "#1F271B", opacity: 0.75 }}>
                              {business.status === "active" ? "Active" : "Inactive"}
                            </span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={business.status === "active"}
                              aria-label="Toggle business status"
                              disabled={statusUpdatingIds.has(business.id)}
                              onClick={() => onToggleStatus(business)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                business.status === "active" ? "bg-[#28AFB0]" : "bg-neutral-dark/30"
                              } disabled:opacity-50`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                business.status === "active" ? "translate-x-4" : "translate-x-0.5"
                              }`} />
                            </button>
                          </label>
                        </TooltipTrigger>
                        <TooltipContent className="text-[#1F271B] bg-neutral-light">Toggle status</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href={`/admin/businesses/${business.id}`} className="p-2 rounded hover:bg-neutral-light">
                            <Eye size={16} />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent className="text-blue-600 bg-blue-50">View Details</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="p-2 rounded hover:bg-neutral-light" onClick={() => onOpenUpdate(business)}>
                            <Pencil size={16} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="text-[#2B50AA] bg-blue-50">Update</TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TooltipProvider>
      </div>
    </>
  );
}
