export default function Loading() {
  return (
    <div className="grid place-items-center py-32">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-navy-200 border-t-teal-500 animate-spin" />
        <p className="text-xs text-navy-400">Loading secure module…</p>
      </div>
    </div>
  );
}
