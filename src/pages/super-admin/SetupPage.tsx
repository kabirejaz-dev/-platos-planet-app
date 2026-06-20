import { useRef, useState } from 'react'
import { useAppStore, exportStoreSnapshot } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { toast } from '@/components/ui/Toaster'
import { Settings, Download, Upload, AlertTriangle } from 'lucide-react'

export default function SetupPage() {
  const { settings, updateSettings, importStoreSnapshot } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  const isLive = settings.mode === 'live'

  const setMode = (mode: 'demo' | 'live') => {
    updateSettings({ mode })
    toast.success(mode === 'live' ? 'Switched to Live Mode' : 'Switched to Demo Mode')
  }

  const handleExport = () => {
    const json = exportStoreSnapshot()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `platosplanet-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Data exported', 'Your backup file has started downloading.')
  }

  const handleImportFile = (file: File) => {
    setImporting(true)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const snapshot = JSON.parse(reader.result as string)
        if (!Array.isArray(snapshot.users) || !Array.isArray(snapshot.students)) {
          throw new Error('File is missing expected data (users/students arrays).')
        }
        importStoreSnapshot(snapshot)
        toast.success('Data imported', 'Reloading with the imported data…')
        setTimeout(() => window.location.reload(), 800)
      } catch (err) {
        toast.error('Import failed', err instanceof Error ? err.message : 'Could not read this file.')
        setImporting(false)
      }
    }
    reader.onerror = () => {
      toast.error('Import failed', 'Could not read this file.')
      setImporting(false)
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Company Setup"
        subtitle="Configure your school's real data and switch from demo to live mode"
        badge={<DemoBadge />}
      />

      <div className="plato-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4D7CFF]/10 flex items-center justify-center text-[#4D7CFF]">
            <Settings size={18} />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-white/90 font-display">Mode</h2>
            <p className="text-xs text-white/40">Demo mode shows seed data for exploring the product. Live mode shows only real data you've entered.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all border ${!isLive ? 'bg-[#4D7CFF]/15 text-[#4D7CFF] border-[#4D7CFF]/30' : 'text-white/40 border-white/10 hover:text-white/70'}`}
            onClick={() => setMode('demo')}
          >
            Demo Mode
          </button>
          <button
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all border ${isLive ? 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30' : 'text-white/40 border-white/10 hover:text-white/70'}`}
            onClick={() => setMode('live')}
          >
            Live Mode
          </button>
        </div>

        {isLive && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#FBBF24]/5 border border-[#FBBF24]/20">
            <AlertTriangle size={16} className="text-[#FBBF24] flex-shrink-0 mt-0.5" />
            <p className="text-[13px] text-[#FBBF24]/90">
              Live mode is on. The full data-entry wizard (branches, staff, students, fees) and real-account login are not built yet — this toggle currently only flips <code>settings.mode</code> for testing the export/import flow below.
            </p>
          </div>
        )}
      </div>

      <div className="plato-card p-5 space-y-4">
        <div>
          <h2 className="text-[15px] font-bold text-white/90 font-display">Backup &amp; Restore</h2>
          <p className="text-xs text-white/40 mt-1">Export everything in this browser to a JSON file, or restore from a previous export.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary" onClick={handleExport}>
            <Download size={15} /> Export All Data
          </button>
          <button className="btn-ghost border border-dark-border" disabled={importing} onClick={() => fileInputRef.current?.click()}>
            <Upload size={15} /> {importing ? 'Importing…' : 'Import Data'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportFile(f); e.target.value = '' }}
          />
        </div>
      </div>
    </div>
  )
}
