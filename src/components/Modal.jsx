import Icon from './Icon'

export default function Modal({ title, onClose, children, footer }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="card shadow-pop w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h3 className="text-base font-semibold text-fg">{title}</h3>
          <button
            onClick={onClose}
            className="text-fg-faint hover:text-fg p-1 -m-1 rounded-md hover:bg-surface-2"
          >
            <Icon name="x" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-line">{footer}</div>
        )}
      </div>
    </div>
  )
}
