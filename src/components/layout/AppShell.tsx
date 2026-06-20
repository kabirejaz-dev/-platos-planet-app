import { Suspense, useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { OnboardingTour } from '@/components/ui/OnboardingTour'
import { DemoModeBanner } from './DemoModeBanner'
import { useAppStore } from '@/store/appStore'

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const location = useLocation()
  const currentUser = useAppStore((s) => s.currentUser)

  useEffect(() => {
    if (!currentUser) return
    const done = localStorage.getItem(`pp_tour_${currentUser.role}_done`)
    if (!done) setShowTour(true)
  }, [currentUser])

  const closeTour = () => {
    if (currentUser) localStorage.setItem(`pp_tour_${currentUser.role}_done`, 'true')
    setShowTour(false)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <DemoModeBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={collapsed} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar onToggleSidebar={() => setCollapsed((c) => !c)} onShowTour={() => setShowTour(true)} />
          {currentUser && <OnboardingTour role={currentUser.role} open={showTour} onClose={closeTour} />}
          <main className="flex-1 overflow-y-auto p-6">
            <Suspense fallback={<DashboardSkeleton />}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </main>
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
