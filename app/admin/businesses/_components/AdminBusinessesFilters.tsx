import { Search } from "lucide-react";

type Props = {
  resultCount: number;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
};

export default function AdminBusinessesFilters({
  resultCount,
  statusFilter,
  onStatusChange,
  searchTerm,
  onSearchChange,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 p-3 border-b border-neutral-light">
      <h2 className="text-base font-bold" style={{ color: "#1F271B" }}>
        All businesses ({resultCount} result{resultCount !== 1 ? "s" : ""})
      </h2>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 sm:flex-initial justify-end">
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            style={{ borderColor: "#EAEBED", color: "#1F271B" }}
          />
        </div>
      </div>
    </div>
  );
}
