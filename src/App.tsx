import { useEffect, useState } from 'react'
import { useTransfers } from './lib/useTransfers'
import { loadUiState, saveUiState, type UiState } from './lib/storage'
import { useTheme } from './lib/useTheme'
import { Dashboard } from './components/Dashboard'
import { TransferDetail } from './components/TransferDetail'
import { ExtendExpiryModal } from './components/ExtendExpiryModal'
import { Toast, type ToastState } from './components/Toast'
import { ThemeToggle } from './components/ThemeToggle'

// App shell: owns the top-level view (dashboard | detail), persisted UI state,
// and the transient modal/toast overlays. Data + mutations live in useTransfers.
export default function App() {
  const { transfers, toggleFavorite, setDisabled, extendExpiry } = useTransfers()
  const { theme, toggle: toggleTheme } = useTheme()

  // Persisted search/filter state.
  const [ui, setUi] = useState<UiState>(() => loadUiState())
  useEffect(() => saveUiState(ui), [ui])

  // Simple view routing without a router dependency.
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = transfers.find((t) => t.id === selectedId) ?? null

  // Overlays.
  const [extendingId, setExtendingId] = useState<string | null>(null)
  const extending = transfers.find((t) => t.id === extendingId) ?? null
  const [toast, setToast] = useState<ToastState | null>(null)

  // Fake initial load so the skeleton state is demoable.
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 650)
    return () => clearTimeout(id)
  }, [])

  const handleDisable = (id: string) => {
    setDisabled(id, true)
    setToast({
      message: 'Link disabled',
      actionLabel: 'Undo',
      onAction: () => setDisabled(id, false),
    })
  }

  return (
    <div className="min-h-full">
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      {selected ? (
        <TransferDetail
          transfer={selected}
          onBack={() => setSelectedId(null)}
          onToggleFavorite={toggleFavorite}
          onDisable={handleDisable}
          onExtendClick={setExtendingId}
        />
      ) : (
        <Dashboard
          transfers={transfers}
          ui={ui}
          onUiChange={setUi}
          onOpen={setSelectedId}
          onToggleFavorite={toggleFavorite}
          loading={loading}
        />
      )}

      {extending && (
        <ExtendExpiryModal
          currentExpiresAt={extending.expiresAt}
          onCancel={() => setExtendingId(null)}
          onConfirm={(newExpiresAt) => {
            extendExpiry(extending.id, newExpiresAt)
            setExtendingId(null)
            setToast({ message: 'Expiry extended' })
          }}
        />
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
