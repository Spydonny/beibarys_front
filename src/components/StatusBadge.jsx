import { STATUS_RU } from '../lib/api'

const DOT = {
  pending: 'bg-amber-400',
  confirmed: 'bg-emerald-400',
  cancelled: 'bg-rose-400',
  completed: 'bg-sky-400',
}

export default function StatusBadge({ status }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs
                     bg-surface-2 border border-line text-fg-muted">
      <span className={`w-1.5 h-1.5 rounded-full ${DOT[status] || 'bg-fg-faint'}`} />
      {STATUS_RU[status] || status}
    </span>
  )
}
