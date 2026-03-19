import { useEffect, useRef, useState } from "react";

interface Option {
  label: string;
  value: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const GlassDropdown = ({ options, value, onChange, placeholder }: Props) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);

  // =========================
  // CLOSE ON OUTSIDE CLICK
  // =========================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =========================
  // KEYBOARD SUPPORT (ESC)
  // =========================
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">

      {/* TRIGGER */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center justify-between w-full px-3 py-2 text-white transition border rounded-xl bg-white/20 border-white/30 backdrop-blur-md hover:bg-white/30"
      >
        <span className={`${!selected ? "opacity-60" : ""}`}>
          {selected?.label || placeholder || "Select"}
        </span>

        {/* ARROW */}
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute z-50 w-full mt-2 overflow-hidden border shadow-xl bg-white/20 backdrop-blur-xl border-white/20 rounded-xl">

          <div className="overflow-y-auto max-h-60 custom-scrollbar">

            {options.map(option => {
              const isSelected = option.value === value;

              return (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`px-3 py-2 text-sm text-white cursor-pointer transition
                    ${isSelected ? "bg-white/30" : "hover:bg-white/20"}
                  `}
                >
                  {option.label}
                </div>
              );
            })}

          </div>

        </div>
      )}
    </div>
  );
};

export default GlassDropdown;