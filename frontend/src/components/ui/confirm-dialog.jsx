import { FiAlertTriangle } from 'react-icons/fi'
import { Dialog } from './dialog'
import { Button } from './button'

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <div className="p-6 text-center">
        <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center">
          <FiAlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-6">{message}</p>
        <div className="flex items-center gap-3 justify-center">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger-solid' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
