"use client"

import {
  Building2,
  DollarSign,
  Briefcase,
  Users,
  FileText,
  Server,
  UserCheck,
  ShieldAlert,
  AlertCircle,
  Download,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Button } from "@/components/ui/button"

const revenueData = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 55000 },
  { month: "Jun", revenue: 67000 },
  { month: "Jul", revenue: 72000 },
  { month: "Aug", revenue: 68000 },
  { month: "Sep", revenue: 75000 },
  { month: "Oct", revenue: 82000 },
  { month: "Nov", revenue: 73000 },
  { month: "Dec", revenue: 93000 },
]

function KPICard({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: any
  label: string
  value: string
  trend: number
  color: string
}) {
  const isPositive = trend >= 0

  return (
    <div
      className="rounded shadow-sm border border-neutral-light overflow-hidden cursor-pointer transition-all hover:shadow-md"
      style={{ backgroundColor: "#F3F4F6" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)"
      }}
    >
      <div className="h-0.5" style={{ backgroundColor: color }} />

      <div className="p-2.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Icon size={14} className="text-neutral-dark" />
          <h3 className="text-sm font-semibold text-neutral-dark">{label}</h3>
        </div>

        <div className="mb-1.5">
          <p className="text-[9px] text-neutral-dark/70">Total</p>
          <p className="text-lg font-bold text-neutral-dark">{value}</p>
        </div>

        <div className="flex items-center gap-1 text-[9px] text-neutral-dark/60">
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isPositive ? "+" : ""}
          {trend}%
        </div>
      </div>
    </div>
  )
}

export function AdminDashboard() {
  return (
    <div className="space-y-6">

      {/* KPI SECTION */}
      <div>
        <h2 className="text-base font-bold text-neutral-dark mb-2.5">
          Platform Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard icon={Building2} label="Total Businesses" value="1,247" trend={12} color="#2B50AA" />
          <KPICard icon={DollarSign} label="Total Revenue" value="$892K" trend={18} color="#28AFB0" />
          <KPICard icon={Briefcase} label="Total Jobs Created" value="8,432" trend={-3} color="#c05aff" />
          <KPICard icon={Users} label="Total Users" value="15,284" trend={24} color="#4292e3" />
          <KPICard icon={FileText} label="Invoices Generated" value="4,721" trend={15} color="#28AFB0" />
          <KPICard icon={Building2} label="Active Businesses" value="1,089" trend={8} color="#35f23b" />
          <KPICard icon={Building2} label="Inactive Businesses" value="128" trend={-2} color="#ffb032" />
          <KPICard icon={ShieldAlert} label="Suspended Accounts" value="30" trend={-12} color="#EF4444" />
        </div>
      </div>

      {/* SYSTEM HEALTH */}
      <div>
        <h2 className="text-base font-bold text-neutral-dark mb-2.5">
          System Health
        </h2>
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden border-[#EAEBED] p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <HealthItem icon={Server} label="Server Uptime" value="99.9%" color="#28AFB0" />
            <HealthItem icon={UserCheck} label="Active Sessions" value="3,847" color="#2B50AA" />
            <HealthItem icon={ShieldAlert} label="Suspended Accounts" value="30" color="#FF2D2D" />
            <HealthItem icon={AlertCircle} label="Failed Logins (24h)" value="142" color="#B084CC" />
          </div>
        </div>
      </div>

      {/* REVENUE CHART */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-base font-bold text-neutral-dark">
            Revenue Over Time
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="px-3 py-1.5 text-xs"
          >
            <Download size={14} className="mr-1.5" />
            Export
          </Button>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-[#EAEBED] p-4">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2B50AA"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function HealthItem({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any
  label: string
  value: string
  color: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded flex items-center justify-center"
        style={{ backgroundColor: "#F3F4F6", color }}
      >
        <Icon size={16} />
      </div>

      <div>
        <p className="text-lg font-bold text-neutral-dark">{value}</p>
        <p className="text-[9px] text-neutral-dark/70">{label}</p>
      </div>
    </div>
  )
}