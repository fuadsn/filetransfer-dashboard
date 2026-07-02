import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import type { Transfer } from './types'
import { useTransfers } from './lib/useTransfers'
import { loadUiState, saveUiState, type UiState } from './lib/storage'
import { useTheme } from './lib/useTheme'
import { Dashboard } from './components/Dashboard'
import { TransferDetail } from './components/TransferDetail'
import { ExtendExpiryModal } from './components/ExtendExpiryModal'
import { ThemeToggle } from './components/ThemeToggle'
import { Toaster } from '@/components/ui/sonner'

// App shell: owns URL-driven routing (dashboard at "/", each transfer at
// "/transfers/:id"), persisted UI state, and the transient modal/toast overlays.
// Data + mutations live in useTransfers.
export default function App() {
  const { transfers, toggleFavorite, setDisabled, extendExpiry } = useTransfers()
  const { theme, toggle: toggleTheme } = useTheme()
  const navigate = useNavigate()

  // Persisted search/filter state.
  const [ui, setUi] = useState<UiState>(() => loadUiState())
  useEffect(() => saveUiState(ui), [ui])

  // Extend-expiry overlay (rendered app-level so it works from any route).
  const [extendingId, setExtendingId] = useState<string | null>(null)
  const extending = transfers.find((t) => t.id === extendingId) ?? null

  // Fake initial load so the skeleton state is demoable.
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 650)
    return () => clearTimeout(id)
  }, [])

  const handleDisable = (id: string) => {
    setDisabled(id, true)
    toast('Link disabled', {
      action: { label: 'Undo', onClick: () => setDisabled(id, false) },
    })
  }

  return (
    <div className="min-h-full">
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              transfers={transfers}
              ui={ui}
              onUiChange={setUi}
              onOpen={(id) => navigate(`/transfers/${id}`)}
              onToggleFavorite={toggleFavorite}
              loading={loading}
            />
          }
        />
        <Route
          path="/transfers/:id"
          element={
            <TransferRoute
              transfers={transfers}
              onToggleFavorite={toggleFavorite}
              onDisable={handleDisable}
              onExtendClick={setExtendingId}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {extending && (
        <ExtendExpiryModal
          currentExpiresAt={extending.expiresAt}
          onCancel={() => setExtendingId(null)}
          onConfirm={(newExpiresAt) => {
            extendExpiry(extending.id, newExpiresAt)
            setExtendingId(null)
            toast.success('Expiry extended')
          }}
        />
      )}

      <Toaster />
    </div>
  )
}

// Resolves the :id param to a transfer; unknown ids bounce back to the dashboard.
function TransferRoute({
  transfers,
  onToggleFavorite,
  onDisable,
  onExtendClick,
}: {
  transfers: Transfer[]
  onToggleFavorite: (id: string) => void
  onDisable: (id: string) => void
  onExtendClick: (id: string) => void
}) {
  const { id } = useParams()
  const navigate = useNavigate()
  const transfer = transfers.find((t) => t.id === id)

  if (!transfer) return <Navigate to="/" replace />

  return (
    <TransferDetail
      transfer={transfer}
      onBack={() => navigate('/')}
      onToggleFavorite={onToggleFavorite}
      onDisable={onDisable}
      onExtendClick={onExtendClick}
    />
  )
}
