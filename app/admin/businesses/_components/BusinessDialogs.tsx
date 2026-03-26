import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CreateBusinessForm, UpdateBusinessForm } from "./businessesTypes";

type CreateProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: CreateBusinessForm;
  setForm: React.Dispatch<React.SetStateAction<CreateBusinessForm>>;
  error: string | null;
  creating: boolean;
  onSubmit: (e: React.FormEvent) => void;
};

export function CreateBusinessDialog({
  open,
  onOpenChange,
  form,
  setForm,
  error,
  creating,
  onSubmit,
}: CreateProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Create Business</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          {error && (
            <div className="rounded border px-3 py-2 text-xs" style={{ borderColor: "#FCA5A5", color: "#B91C1C", backgroundColor: "#FEF2F2" }}>
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Company Name *" value={form.companyName} onChange={(v) => setForm((p) => ({ ...p, companyName: v }))} required />
            <Field label="Email *" type="email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} required />
            <Field label="Phone *" value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} required />
            <Field label="Temp Password *" value={form.tempPassword} onChange={(v) => setForm((p) => ({ ...p, tempPassword: v }))} required />
            <Field label="Address" value={form.address} onChange={(v) => setForm((p) => ({ ...p, address: v }))} />
            <Field label="Website" value={form.website} onChange={(v) => setForm((p) => ({ ...p, website: v }))} />
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-medium" style={{ color: "#1F271B" }}>
            <input
              type="checkbox"
              checked={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.checked }))}
              style={{ accentColor: "#28AFB0" }}
            />
            Active status
          </label>
          <DialogFooter>
            <button type="button" onClick={() => onOpenChange(false)} className="px-3 py-2 border rounded text-sm" style={{ borderColor: "#EAEBED", color: "#1F271B" }}>
              Cancel
            </button>
            <button type="submit" disabled={creating} className="px-3 py-2 rounded text-sm text-white disabled:opacity-60" style={{ backgroundColor: "#28AFB0" }}>
              {creating ? "Saving..." : "Save Business"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type UpdateProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UpdateBusinessForm;
  setForm: React.Dispatch<React.SetStateAction<UpdateBusinessForm>>;
  error: string | null;
  updating: boolean;
  onSubmit: (e: React.FormEvent) => void;
};

export function UpdateBusinessDialog({
  open,
  onOpenChange,
  form,
  setForm,
  error,
  updating,
  onSubmit,
}: UpdateProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Update Business</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          {error && (
            <div className="rounded border px-3 py-2 text-xs" style={{ borderColor: "#FCA5A5", color: "#B91C1C", backgroundColor: "#FEF2F2" }}>
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Company Name *" value={form.companyName} onChange={(v) => setForm((p) => ({ ...p, companyName: v }))} required />
            <Field label="Email *" type="email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} required />
            <Field label="Phone *" value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} required />
            <Field label="Address" value={form.address} onChange={(v) => setForm((p) => ({ ...p, address: v }))} />
            <div className="sm:col-span-2">
              <Field label="Website" value={form.website} onChange={(v) => setForm((p) => ({ ...p, website: v }))} />
            </div>
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-medium" style={{ color: "#1F271B" }}>
            <input
              type="checkbox"
              checked={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.checked }))}
              style={{ accentColor: "#28AFB0" }}
            />
            Active status
          </label>
          <DialogFooter>
            <button type="button" onClick={() => onOpenChange(false)} className="px-3 py-2 border rounded text-sm" style={{ borderColor: "#EAEBED", color: "#1F271B" }}>
              Cancel
            </button>
            <button type="submit" disabled={updating} className="px-3 py-2 rounded text-sm text-white disabled:opacity-60" style={{ backgroundColor: "#28AFB0" }}>
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "#1F271B" }}>
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded text-sm"
        style={{ borderColor: "#EAEBED", color: "#1F271B" }}
      />
    </div>
  );
}
