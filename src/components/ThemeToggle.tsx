"use client";

import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  className?: string;
}

export default function ThemeToggle({ className = "" }: Props) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`relative flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all select-none ${
        isDark
          ? "border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          : "border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
      } ${className}`}
    >
      {/* Panda face */}
      <span className="text-sm leading-none">🐼</span>

      {/* Toggle track */}
      <span
        className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
          isDark ? "bg-zinc-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-3 w-3 rounded-full shadow-sm transition-transform ${
            isDark
              ? "translate-x-3.5 bg-zinc-900"
              : "translate-x-0.5 bg-white"
          }`}
          style={{
            backgroundImage: isDark
              ? undefined
              : "radial-gradient(circle at 35% 35%, #fff 30%, #e5e7eb 100%)",
          }}
        />
      </span>

      <span className="hidden sm:inline">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
