import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // =========================
  // POSITION CALCULATION
  // =========================
  const updatePosition = () => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    setPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  };

  // =========================
  // TOGGLE
  // =========================
  const handleToggle = () => {
    if (!open) updatePosition();
    setOpen((prev) => !prev);
  };

  // =========================
  // OUTSIDE CLICK (FIXED)
  // =========================
  useEffect(() => {
    const handleOutside = (e: PointerEvent) => {
      const target = e.target as Node;

      if (
        containerRef.current &&
        dropdownRef.current &&
        !containerRef.current.contains(target) &&
        !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, []);

  // =========================
  // ESC KEY
  // =========================
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // =========================
  // REPOSITION
  // =========================
  useEffect(() => {
    if (!open) return;

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  return (
    <>
      {/* TRIGGER */}
      <div ref={containerRef} className="relative w-full">
        <button
          onClick={handleToggle}
          className="flex items-center justify-between w-full px-3 py-2 text-white transition border rounded-xl bg-white/20 border-white/30 backdrop-blur-md hover:bg-white/30"
        >
          <span className={`${!selected ? "opacity-60" : ""}`}>
            {selected?.label || placeholder || "Select"}
          </span>

          <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>
      </div>

      {/* PORTAL */}
      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: position.top,
              left: position.left,
              width: position.width,
              zIndex: 9999,
            }}
            className="overflow-hidden border shadow-xl bg-white/20 backdrop-blur-xl border-white/20 rounded-xl"
            onClick={(e) => e.stopPropagation()} // 🔥 important
          >
            <div className="overflow-y-auto max-h-60 custom-scrollbar">
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <div
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation(); // 🔥 prevents race condition
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
          </div>,
          document.body
        )}
    </>
  );
};

export default GlassDropdown;