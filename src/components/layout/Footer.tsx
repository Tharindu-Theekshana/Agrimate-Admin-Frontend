export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <div className="bg-background px-3">
      <div className="flex h-11 items-center justify-between rounded-t-2xl border border-border bg-surface px-5">
        <p className="hidden select-none text-[11px] text-ink-faint sm:block">
          © {year} AgriMate · Admin Dashboard
        </p>
        <div className="flex items-center gap-4">
          {['Privacy', 'Terms', 'Support'].map((label) => (
            <button key={label} className="bg-transparent p-0 text-[11px] text-ink-faint transition-colors hover:text-primary">
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
