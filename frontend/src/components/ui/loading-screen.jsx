import { FiCompass } from 'react-icons/fi'

export function LoadingScreen({ text = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-4 bg-surface-lighter border border-surface-border-light text-primary-400 rounded-2xl flex items-center justify-center animate-pulse">
          <FiCompass className="w-7 h-7 text-white" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-accent-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-sm text-gray-400">{text}</p>
      </div>
    </div>
  )
}
