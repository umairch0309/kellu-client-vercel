import { Plus } from "lucide-react";

type Props = {
  onCreate: () => void;
};

export default function AdminBusinessesHeader({ onCreate }: Props) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark">
        Businesses
      </h1>
      <button
        type="button"
        onClick={onCreate}
        className="px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1.5 transition-all shrink-0"
        style={{ backgroundColor: "#28AFB0", color: "white" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#1E8A8B";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#28AFB0";
        }}
      >
        <Plus size={16} />
        <span>Create Business</span>
      </button>
    </div>
  );
}
