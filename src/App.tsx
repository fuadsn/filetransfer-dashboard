import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { ChevronRight, PanelRight } from 'lucide-react'
import { toast } from 'sonner'
import type { Transfer } from './types'
import { useTransfers } from './lib/useTransfers'
import { loadUiState, saveUiState, type UiState } from './lib/storage'
import { useTheme, type RevealOrigin, type Theme } from './lib/useTheme'
import { Dashboard } from './components/Dashboard'
import { TransferDetail } from './components/TransferDetail'
import { ExtendExpiryModal } from './components/ExtendExpiryModal'
import { ThemeToggle } from './components/ThemeToggle'
import { Sidebar } from './components/Sidebar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from '@/components/ui/sonner'

const SIDEBAR_KEY = 'tcw:sidebar'

// App shell: a collapsible left sidebar (brand + needs-attention) beside a
// centered main column. Owns routing, persisted UI state, and overlays.
export default function App() {
  const { transfers, toggleFavorite, setDisabled, extendExpiry } = useTransfers()
  const { theme, toggle: toggleTheme } = useTheme()
  const navigate = useNavigate()

  // Sidebar open/collapsed — persisted; defaults open on desktop, closed on mobile.
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem(SIDEBAR_KEY)
    if (saved !== null) return saved === '1'
    return window.innerWidth >= 1024
  })
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, sidebarOpen ? '1' : '0')
    } catch {
      // best-effort
    }
  }, [sidebarOpen])

  // ⌘/Ctrl-B toggles the sidebar from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'b' || e.key === 'B') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSidebarOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Persisted search/filter state.
  const [ui, setUi] = useState<UiState>(() => loadUiState())
  useEffect(() => saveUiState(ui), [ui])

  // Extend-expiry overlay.
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

  const openTransfer = (id: string) => {
    navigate(`/transfers/${id}`)
    if (window.innerWidth < 1024) setSidebarOpen(false)
  }

  return (
    <MotionConfig reducedMotion="user">
    <div className="flex min-h-screen">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        <HeaderBar
          transfers={transfers}
          loading={loading}
          theme={theme}
          onToggleTheme={toggleTheme}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
        />

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
      </main>

      <Sidebar
        transfers={transfers}
        ui={ui}
        open={sidebarOpen}
        loading={loading}
        onToggle={() => setSidebarOpen((o) => !o)}
        onOpen={openTransfer}
      />

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
    </MotionConfig>
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
  const transfer = transfers.find((t) => t.id === id)

  if (!transfer) return <Navigate to="/" replace />

  return (
    <TransferDetail
      transfer={transfer}
      onToggleFavorite={onToggleFavorite}
      onDisable={onDisable}
      onExtendClick={onExtendClick}
    />
  )
}

// Persistent top chrome shown on both routes. On the dashboard it labels the
// view; on a transfer detail it shows a "Dashboard › Title" breadcrumb so the
// navigation context never disappears into a blank band. Sticky, so the
// breadcrumb and controls stay reachable while scrolling a long page.
function HeaderBar({
  transfers,
  loading,
  theme,
  onToggleTheme,
  sidebarOpen,
  onToggleSidebar,
}: {
  transfers: Transfer[]
  loading: boolean
  theme: Theme
  onToggleTheme: (origin?: RevealOrigin) => void
  sidebarOpen: boolean
  onToggleSidebar: () => void
}) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const match = matchPath('/transfers/:id', pathname)
  const transfer = match ? transfers.find((t) => t.id === match.params.id) : null

  return (
    <header className="bg-background/80 border-border/60 sticky top-0 z-20 flex items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur">
      <div className="flex min-w-0 items-center gap-1.5 text-sm">
        {transfer ? (
          <>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer font-medium transition-colors"
            >
              Dashboard
            </button>
            <ChevronRight className="text-faint size-4 shrink-0" />
            <span className="text-foreground min-w-0 truncate font-medium">{transfer.title}</span>
          </>
        ) : (
          <span className="text-foreground font-medium">Dashboard</span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {loading ? (
          <>
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="size-9 rounded-md" />
          </>
        ) : (
          <>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <PanelRight className="size-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
