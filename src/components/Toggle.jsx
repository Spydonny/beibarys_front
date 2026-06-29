export default function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 relative w-10 h-[22px] rounded-full transition-colors shrink-0 ${
          checked ? 'bg-gold' : 'bg-surface-3'
        }`}
      >
        <span
          className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-surface-0 transition-transform ${
            checked ? 'translate-x-[18px]' : ''
          }`}
        />
      </button>
      <span>
        <span className="text-sm text-fg">{label}</span>
        {hint && <span className="block text-xs text-fg-faint mt-0.5">{hint}</span>}
      </span>
    </label>
  )
}
