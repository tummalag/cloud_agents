interface StatCardProps {
  label: string
  value: string
  subtext?: string
  icon: string
}

export function StatCard({ label, value, subtext, icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:bg-white/10">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
        <span aria-hidden="true">{icon}</span>
        <span>{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
    </div>
  )
}
