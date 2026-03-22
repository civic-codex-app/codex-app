'use client'

export function ExportPdfButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--codex-border)] text-[var(--codex-sub)] transition-all hover:border-[var(--codex-input-focus)] hover:text-[var(--codex-text)] print:hidden"
      aria-label="Export as PDF"
      title="Export as PDF"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </button>
  )
}
