"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminBusinessesHeader from "./AdminBusinessesHeader";
import AdminBusinessesFilters from "./AdminBusinessesFilters";
import AdminBusinessesTable from "./AdminBusinessesTable";
import { CreateBusinessDialog, UpdateBusinessDialog } from "./BusinessDialogs";
import { extractBusinessesList, normalizeBusiness, normalizeWebsite } from "./businessesApi";
import type { BusinessItem, CreateBusinessForm, UpdateBusinessForm } from "./businessesTypes";

export default function AdminBusinessesList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [statusUpdatingIds, setStatusUpdatingIds] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [editingBusinessId, setEditingBusinessId] = useState<string>("");
  const [createForm, setCreateForm] = useState<CreateBusinessForm>({
    companyName: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    tempPassword: "",
    status: true,
  });
  const [updateForm, setUpdateForm] = useState<UpdateBusinessForm>({
    companyName: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    status: true,
  });

  const fetchBusinesses = useCallback(async () => {
    let cancelled = false;
    try {
      setLoading(true);
      setFetchError(null);
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
        .map((item) => normalizeBusiness(item));
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
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void fetchBusinesses();
  }, [fetchBusinesses]);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((business) => {
      const matchesSearch =
        business.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || business.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [businesses, searchTerm, statusFilter]);

  const statusStyle = (status: string) => {
    if (status === "active") return "bg-[rgba(40,175,176,0.2)] text-[#1E8A8B]";
    if (status === "inactive") return "bg-neutral-dark/10 text-neutral-dark";
    return "bg-[rgba(239,68,68,0.2)] text-red-600";
  };

  const resetCreateForm = () => {
    setCreateForm({
      companyName: "",
      email: "",
      phone: "",
      address: "",
      website: "",
      tempPassword: "",
      status: true,
    });
    setCreateError(null);
  };

  const resetUpdateForm = () => {
    setUpdateForm({
      companyName: "",
      email: "",
      phone: "",
      address: "",
      website: "",
      status: true,
    });
    setEditingBusinessId("");
    setUpdateError(null);
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!createForm.companyName.trim() || !createForm.email.trim() || !createForm.phone.trim() || !createForm.tempPassword.trim()) {
      setCreateError("Company name, email, phone and temp password are required.");
      return;
    }
    setCreating(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const normalizedWebsite = normalizeWebsite(createForm.website);
      if (normalizedWebsite === null) {
        setCreateError("Website must be a valid URL.");
        setCreating(false);
        return;
      }
      const body: Record<string, unknown> = {
        companyName: createForm.companyName.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim(),
        tempPassword: createForm.tempPassword.trim(),
        status: createForm.status,
      };
      if (createForm.address.trim()) body.address = createForm.address.trim();
      if (normalizedWebsite) body.website = normalizedWebsite;

      const res = await fetch(`${baseUrl}/api/businesses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || (json as { success?: boolean }).success === false) {
        const msg =
          (json as { message?: string }).message ??
          (json as { errors?: { message?: string }[] })?.errors?.[0]?.message ??
          `Failed to create business (${res.status})`;
        setCreateError(msg);
        return;
      }
      setIsCreateOpen(false);
      resetCreateForm();
      await fetchBusinesses();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create business");
    } finally {
      setCreating(false);
    }
  };

  const openUpdateBusiness = (business: BusinessItem) => {
    setEditingBusinessId(business.id);
    setUpdateForm({
      companyName: business.companyName === "—" ? "" : business.companyName,
      email: business.email === "—" ? "" : business.email,
      phone: business.phone,
      address: business.address,
      website: business.website,
      status: business.status === "active",
    });
    setUpdateError(null);
    setIsUpdateOpen(true);
  };

  const handleUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError(null);
    if (!editingBusinessId) return;
    if (!updateForm.companyName.trim() || !updateForm.email.trim() || !updateForm.phone.trim()) {
      setUpdateError("Company name, email and phone are required.");
      return;
    }
    setUpdating(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const normalizedWebsite = normalizeWebsite(updateForm.website);
      if (normalizedWebsite === null) {
        setUpdateError("Website must be a valid URL.");
        setUpdating(false);
        return;
      }
      const body: Record<string, unknown> = {
        companyName: updateForm.companyName.trim(),
        email: updateForm.email.trim(),
        phone: updateForm.phone.trim(),
        status: updateForm.status,
      };
      if (updateForm.address.trim()) body.address = updateForm.address.trim();
      if (normalizedWebsite) body.website = normalizedWebsite;

      const res = await fetch(`${baseUrl}/api/businesses/${encodeURIComponent(editingBusinessId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || (json as { success?: boolean }).success === false) {
        const msg =
          (json as { message?: string }).message ??
          (json as { errors?: { message?: string }[] })?.errors?.[0]?.message ??
          `Failed to update business (${res.status})`;
        setUpdateError(msg);
        return;
      }
      setIsUpdateOpen(false);
      resetUpdateForm();
      await fetchBusinesses();
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Failed to update business");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (business: BusinessItem) => {
    const id = String(business.id).trim();
    if (!id || statusUpdatingIds.has(id)) return;
    const nextStatus = business.status === "active" ? "inactive" : "active";
    const nextStatusBoolean = nextStatus === "active";
    setStatusUpdatingIds((prev) => new Set(prev).add(id));
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(`${baseUrl}/api/businesses/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: nextStatusBoolean }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || (json as { success?: boolean }).success === false) {
        const msg =
          (json as { message?: string }).message ??
          (json as { errors?: { message?: string }[] })?.errors?.[0]?.message ??
          `Failed to update status (${res.status})`;
        alert(msg);
        return;
      }
      const apiStatus =
        typeof (json as { data?: { status?: unknown } }).data?.status === "string"
          ? String((json as { data?: { status?: string } }).data?.status).toLowerCase()
          : nextStatus;
      setBusinesses((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: apiStatus } : item))
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setStatusUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="space-y-4">
      <AdminBusinessesHeader
        onCreate={() => {
          resetCreateForm();
          setIsCreateOpen(true);
        }}
      />

      <div className="bg-white rounded-lg shadow-sm border border-neutral-light overflow-hidden">
        <AdminBusinessesFilters
          resultCount={filteredBusinesses.length}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <AdminBusinessesTable
          loading={loading}
          fetchError={fetchError}
          businesses={filteredBusinesses}
          statusStyle={statusStyle}
          onRowClick={(id) => router.push(`/admin/businesses/${id}`)}
          onToggleStatus={handleToggleStatus}
          statusUpdatingIds={statusUpdatingIds}
          onOpenUpdate={openUpdateBusiness}
        />
      </div>

      <CreateBusinessDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        form={createForm}
        setForm={setCreateForm}
        error={createError}
        creating={creating}
        onSubmit={handleCreateBusiness}
      />

      <UpdateBusinessDialog
        open={isUpdateOpen}
        onOpenChange={(open) => {
          setIsUpdateOpen(open);
          if (!open) resetUpdateForm();
        }}
        form={updateForm}
        setForm={setUpdateForm}
        error={updateError}
        updating={updating}
        onSubmit={handleUpdateBusiness}
      />
    </div>
  );
}