'use client'

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiChevronDown } from "react-icons/fi";

const mockJobs = [
  { id: "ORD-1001", business: "ABC Corporation", client: "Downtown Plaza", status: "active" as const, amount: 15400, createdDate: "Feb 15, 2026" },
  { id: "ORD-1002", business: "TechStart Solutions", client: "Metro Office Park", status: "completed" as const, amount: 8900, createdDate: "Feb 10, 2026" },
  { id: "ORD-1003", business: "BuildRight Construction", client: "Riverside Apartments", status: "active" as const, amount: 32500, createdDate: "Feb 8, 2026" },
  { id: "ORD-1004", business: "Global Industries Ltd", client: "Harbor View Mall", status: "pending" as const, amount: 45200, createdDate: "Feb 5, 2026" },
  { id: "ORD-1005", business: "ProServices Inc", client: "Tech Campus Building", status: "completed" as const, amount: 12800, createdDate: "Feb 1, 2026" },
  { id: "ORD-1006", business: "Quantum Logistics", client: "Distribution Center", status: "active" as const, amount: 28900, createdDate: "Jan 28, 2026" },
  { id: "ORD-1007", business: "ABC Corporation", client: "City Hall Renovation", status: "cancelled" as const, amount: 67300, createdDate: "Jan 25, 2026" },
];

type JobStatus = "active" | "completed" | "pending" | "cancelled";

const getStatusColor = (status: JobStatus) => {
  const teal = { bg: 'rgba(40, 175, 176, 0.2)', text: '#1E8A8B' };
  const purple = { bg: 'rgba(176, 132, 204, 0.2)', text: '#8B6AA3' };
  const blue = { bg: 'rgba(43, 80, 170, 0.2)', text: '#1F3A7A' };
  const gray = { bg: '#F3F4F6', text: '#1F271B' };
  const red = { bg: 'rgba(239, 68, 68, 0.15)', text: '#DC2626' };

  switch (status) {
    case 'completed': return teal;
    case 'active': return blue;
    case 'pending': return purple;
    case 'cancelled': return red;
    default: return gray;
  }
};

const uniqueBusinesses = Array.from(new Set(mockJobs.map(j => j.business)));
const statusOptions = ['active', 'completed', 'pending', 'cancelled'];

const jobStats = {
  active: mockJobs.filter(j => j.status === 'active').length,
  pending: mockJobs.filter(j => j.status === 'pending').length,
  completed: mockJobs.filter(j => j.status === 'completed').length,
  cancelled: mockJobs.filter(j => j.status === 'cancelled').length,
};

export function Workorders() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [businessFilter, setBusinessFilter] = useState("all");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const businessDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
      if (businessDropdownRef.current && !businessDropdownRef.current.contains(event.target as Node)) {
        setIsBusinessDropdownOpen(false);
      }
    };
    if (isStatusDropdownOpen || isBusinessDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isStatusDropdownOpen, isBusinessDropdownOpen]);

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.business.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesBusiness = businessFilter === "all" || job.business === businessFilter;
    return matchesSearch && matchesStatus && matchesBusiness;
  });

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || businessFilter !== 'all';

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setBusinessFilter('all');
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>Workorders</h1>
      </div>

      {/* Overview Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div className="h-0.5" style={{ backgroundColor: '#2B50AA' }}></div>
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Active Workorders</p>
            </div>
            <button type="button" onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')} className="w-full flex items-center justify-between py-0.5 px-1 -mx-1 rounded text-left hover:bg-black/5 transition-colors" style={{ backgroundColor: statusFilter === 'active' ? 'rgba(43, 80, 170, 0.12)' : 'transparent' }}>
              <span className="text-[10px]" style={{ color: '#1F271B', opacity: 0.7 }}>Active</span>
              <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>{jobStats.active}</span>
            </button>
            <button type="button" onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')} className="w-full flex items-center justify-between py-0.5 px-1 -mx-1 rounded text-left hover:bg-black/5 transition-colors" style={{ backgroundColor: statusFilter === 'pending' ? 'rgba(176, 132, 204, 0.15)' : 'transparent' }}>
              <span className="text-[10px]" style={{ color: '#1F271B', opacity: 0.7 }}>Pending</span>
              <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>{jobStats.pending}</span>
            </button>
          </div>
        </div>

        <div
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div className="h-0.5" style={{ backgroundColor: '#28AFB0' }}></div>
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Completed Workorders</p>
            </div>
            <button type="button" onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')} className="w-full flex items-center justify-between py-0.5 px-1 -mx-1 rounded text-left hover:bg-black/5 transition-colors" style={{ backgroundColor: statusFilter === 'completed' ? 'rgba(40, 175, 176, 0.12)' : 'transparent' }}>
              <span className="text-[10px]" style={{ color: '#1F271B', opacity: 0.7 }}>Completed</span>
              <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>{jobStats.completed}</span>
            </button>
          </div>
        </div>

        <div
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div className="h-0.5" style={{ backgroundColor: '#ff0000' }}></div>
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Cancelled Workorders</p>
            </div>
            <button type="button" onClick={() => setStatusFilter(statusFilter === 'cancelled' ? 'all' : 'cancelled')} className="w-full flex items-center justify-between py-0.5 px-1 -mx-1 rounded text-left hover:bg-black/5 transition-colors" style={{ backgroundColor: statusFilter === 'cancelled' ? 'rgba(239, 68, 68, 0.12)' : 'transparent' }}>
              <span className="text-[10px]" style={{ color: '#1F271B', opacity: 0.7 }}>Cancelled</span>
              <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>{jobStats.cancelled}</span>
            </button>
          </div>
        </div>

        <div
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div className="h-0.5" style={{ backgroundColor: '#3af93d' }}></div>
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Total Value</p>
            </div>
            <p className="text-sm font-bold" style={{ color: '#1F271B' }}>
              ${mockJobs.reduce((sum, j) => sum + j.amount, 0).toLocaleString()}
            </p>
            <p className="text-[10px]" style={{ color: '#1F271B', opacity: 0.6 }}>across all workorders</p>
          </div>
        </div>
      </div>

      {/* All Workorders Section */}
      <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED', marginTop: '2rem' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>
            All workorders ({filteredJobs.length} result{filteredJobs.length !== 1 ? 's' : ''})
          </h2>
          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end flex-wrap">
            {hasActiveFilters && (
              <button type="button" onClick={clearAllFilters} className="text-xs font-medium hover:underline px-1" style={{ color: '#28AFB0' }}>
                Clear filters
              </button>
            )}

            {/* Business Filter */}
            <div className="relative" ref={businessDropdownRef}>
              <button
                onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
                className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                style={{ backgroundColor: businessFilter === 'all' ? '#F3F4F6' : 'white', borderColor: '#EAEBED', color: '#1F271B' }}
              >
                <span className="font-semibold" style={{ color: '#1F271B' }}>Business</span>
                <span style={{ color: '#1F271B', opacity: 0.5 }}>|</span>
                <span style={{ color: '#1F271B', opacity: 0.8 }}>{businessFilter === 'all' ? 'All' : businessFilter}</span>
                <FiChevronDown size={12} className={`transition-transform ${isBusinessDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#1F271B', opacity: 0.6 }} />
              </button>
              {isBusinessDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white rounded shadow-lg border z-10 min-w-[200px] py-1" style={{ borderColor: '#EAEBED' }}>
                  <button onClick={() => { setBusinessFilter('all'); setIsBusinessDropdownOpen(false); }} className="w-full text-left px-2 py-1.5 text-[10px] transition-colors" style={{ color: '#1F271B', backgroundColor: businessFilter === 'all' ? '#F3F4F6' : 'white' }}>All</button>
                  {uniqueBusinesses.map((biz) => (
                    <span key={biz}>
                      <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
                      <button onClick={() => { setBusinessFilter(biz); setIsBusinessDropdownOpen(false); }} className="w-full text-left px-2 py-1.5 text-[10px] transition-colors" style={{ color: '#1F271B', backgroundColor: businessFilter === biz ? '#F3F4F6' : 'white' }}>{biz}</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                style={{ backgroundColor: statusFilter === 'all' ? '#F3F4F6' : 'white', borderColor: '#EAEBED', color: '#1F271B' }}
              >
                <span className="font-semibold" style={{ color: '#1F271B' }}>Status</span>
                <span style={{ color: '#1F271B', opacity: 0.5 }}>|</span>
                <span style={{ color: '#1F271B', opacity: 0.8 }}>{statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span>
                <FiChevronDown size={12} className={`transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#1F271B', opacity: 0.6 }} />
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white rounded shadow-lg border z-10 min-w-[180px] py-1" style={{ borderColor: '#EAEBED' }}>
                  <button onClick={() => { setStatusFilter('all'); setIsStatusDropdownOpen(false); }} className="w-full text-left px-2 py-1.5 text-[10px] transition-colors" style={{ color: '#1F271B', backgroundColor: statusFilter === 'all' ? '#F3F4F6' : 'white' }}>All</button>
                  {statusOptions.map((status) => (
                    <span key={status}>
                      <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
                      <button onClick={() => { setStatusFilter(status); setIsStatusDropdownOpen(false); }} className="w-full text-left px-2 py-1.5 text-[10px] transition-colors" style={{ color: '#1F271B', backgroundColor: statusFilter === status ? '#F3F4F6' : 'white' }}>{status.charAt(0).toUpperCase() + status.slice(1)}</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-initial">
              <FiSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2" size={14} style={{ color: '#1F271B', opacity: 0.5 }} />
              <input
                type="text"
                placeholder="Search workorders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-56 pl-8 pr-3 py-1.5 border rounded text-xs focus:outline-none transition-all shadow-sm"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'; }}
              />
            </div>
          </div>
        </div>

        {/* Workorders Table */}
        <div className="rounded overflow-hidden border" style={{ borderColor: '#EAEBED' }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F3F4F6' }}>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Workorder ID</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Business</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Client</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Status</th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold" style={{ color: '#1F271B' }}>Amount</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>No workorders found</td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const color = getStatusColor(job.status);
                  return (
                    <tr
                      key={job.id}
                      className="border-t cursor-pointer transition-colors"
                      style={{ borderColor: '#EAEBED' }}
                      onClick={() => router.push(`/admin/workorders/${job.id}`)}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
                    >
                      <td className="px-3 py-2"><p className="text-xs font-medium" style={{ color: '#1F271B' }}>{job.id}</p></td>
                      <td className="px-3 py-2"><p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>{job.business}</p></td>
                      <td className="px-3 py-2"><p className="text-xs font-medium" style={{ color: '#1F271B' }}>{job.client}</p></td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ backgroundColor: color.bg, color: color.text }}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right"><p className="text-xs font-semibold" style={{ color: '#1F271B' }}>${job.amount.toLocaleString()}</p></td>
                      <td className="px-3 py-2"><p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>{job.createdDate}</p></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}