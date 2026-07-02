"use client";

import { useEffect, useRef, useState } from "react";

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "검색 또는 선택",
}: {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = options.filter((o) =>
    (o.label + " " + (o.sublabel ?? "")).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-line bg-white px-3 py-2 text-left text-sm outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-100"
      >
        <span className={selected ? "text-ink" : "text-ink/40"}>
          {selected ? `${selected.label}${selected.sublabel ? ` (${selected.sublabel})` : ""}` : placeholder}
        </span>
        <span className="text-ink/40">▾</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-line bg-white shadow-lg">
          <input
            autoFocus
            className="w-full border-b border-line px-3 py-2 text-sm outline-none"
            placeholder="이름/번호로 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && <li className="px-3 py-2 text-sm text-ink/40">검색 결과가 없습니다</li>}
            {filtered.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setQuery("");
                    setOpen(false);
                  }}
                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-navy-50 ${
                    o.value === value ? "bg-navy-50 font-semibold text-navy-600" : "text-ink"
                  }`}
                >
                  {o.label}
                  {o.sublabel && <span className="ml-1 text-xs text-ink/40">({o.sublabel})</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
