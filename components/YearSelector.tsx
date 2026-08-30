"use client";

export default function YearSelector({
  year,
  onChange,
}: {
  year: number;
  onChange: (y: number) => void;
}) {
  const current = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => current - i);

  return (
    <div className="relative">
      <select
        value={year}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="appearance-none rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 pr-8 text-sm font-medium text-white backdrop-blur hover:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-white/15"
      >
        {years.map((y) => (
          <option key={y} value={y} className="bg-[#0a0f14] text-white">
            {y}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/50">▼</span>
    </div>
  );
}
