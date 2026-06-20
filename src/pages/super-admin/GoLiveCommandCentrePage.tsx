import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, Rocket } from 'lucide-react'
import type { ReactNode } from 'react'

interface ConfigRow {
  label: string
  configured: boolean
  detail: string
}

// Static engineering-readiness facts from the production-readiness audit (see /audit).
// These reflect the architecture itself, not runtime config, so they don't change
// without real code changes — re-run the audit after structural work to update this list.
const ENGINEERING_READINESS: Array<{ label: string; ready: boolean; detail: string }> = [
  { label: 'Frontend build & type safety', ready: true, detail: 'tsc and vite build both pass cleanly' },
  { label: 'Route-level code splitting', ready: true, detail: 'All 74 routes are lazy-loaded' },
  { label: 'Design system consistency', ready: true, detail: 'Shared component kit used across all 79 pages' },
  { label: 'Role-based access control', ready: false, detail: 'No server-side or route-level permission checks exist — any logged-in role can reach any page' },
  { label: 'Real backend / database', ready: false, detail: 'Zero network calls anywhere; all data is in-memory + localStorage' },
  { label: 'Real authentication', ready: false, detail: 'Hardcoded demo accounts, shared password, no session expiry' },
  { label: 'Automated tests', ready: false, detail: 'No test suite exists in the repo' },
  { label: 'Lint pipeline', ready: false, detail: 'eslint is installed but has no config file — npm run lint fails' },
  { label: 'Accessibility baseline', ready: false, detail: 'Near-zero ARIA coverage; likely contrast failures on secondary text' },
]

export default function GoLiveCommandCentrePage() {
  const { settings, goLiveConfig } = useAppStore()
  const navigate = useNavigate()

  const businessRows: ConfigRow[] = [
    { label: 'Company name', configured: !!settings.companyName, detail: settings.companyName || 'Not set' },
    { label: 'Address', configured: !!settings.address, detail: settings.address || 'Not set' },
    { label: 'Phone', configured: !!settings.phone, detail: settings.phone || 'Not set' },
    { label: 'Email', configured: !!settings.email, detail: settings.email || 'Not set' },
    { label: 'Website', configured: !!settings.website, detail: settings.website || 'Not set' },
    { label: 'VAT / TRN number', configured: !!settings.vatNumber, detail: settings.vatNumber || 'Not set' },
  ]

  const integrationRows: Array<ConfigRow & { section: string }> = [
    { label: 'Stripe / payment gateway', configured: !!goLiveConfig.stripeKey, detail: goLiveConfig.stripeKey ? 'Key entered (demo storage)' : 'Not configured', section: 'payment' },
    { label: 'File storage (S3)', configured: !!goLiveConfig.s3Bucket, detail: goLiveConfig.s3Bucket ? `Bucket: ${goLiveConfig.s3Bucket}` : 'Not configured', section: 'storage' },
    { label: 'Email provider (SendGrid)', configured: !!goLiveConfig.sendgridKey, detail: goLiveConfig.sendgridKey ? 'Key entered (demo storage)' : 'Not configured', section: 'email' },
    { label: 'WhatsApp Business API', configured: !!goLiveConfig.wapiToken, detail: goLiveConfig.wapiToken ? 'Token entered (demo storage)' : 'Not configured', section: 'whatsapp' },
    { label: 'AI provider (Anthropic/OpenAI)', configured: !!(goLiveConfig.anthropicKey || goLiveConfig.openaiKey), detail: goLiveConfig.anthropicKey || goLiveConfig.openaiKey ? 'Key entered (demo storage) — AI Tutor is still simulated regardless' : 'Not configured', section: 'ai' },
    { label: 'StudentPro mobile app sync', configured: !!goLiveConfig.studentProApiKey && goLiveConfig.studentProSyncEnabled, detail: goLiveConfig.studentProApiKey ? (goLiveConfig.studentProSyncEnabled ? 'Key entered & sync enabled (demo storage)' : 'Key entered but sync disabled') : 'Not configured', section: 'mobile' },
  ]

  const legalRows: ConfigRow[] = [
    { label: 'Privacy Policy URL', configured: !!goLiveConfig.privacyUrl, detail: goLiveConfig.privacyUrl || 'Not set' },
    { label: 'Terms of Service URL', configured: !!goLiveConfig.termsUrl, detail: goLiveConfig.termsUrl || 'Not set' },
    { label: 'Refund Policy URL', configured: !!goLiveConfig.refundUrl, detail: goLiveConfig.refundUrl || 'Not set' },
  ]

  const missingBusinessData = businessRows.filter((r) => !r.configured)
  const missingIntegrations = integrationRows.filter((r) => !r.configured)
  const missingLegal = legalRows.filter((r) => !r.configured)
  const engineeringBlockers = ENGINEERING_READINESS.filter((r) => !r.ready)
  const engineeringReady = ENGINEERING_READINESS.filter((r) => r.ready)

  const totalChecks = ENGINEERING_READINESS.length + businessRows.length + integrationRows.length + legalRows.length
  const totalReady = engineeringReady.length + businessRows.filter((r) => r.configured).length + integrationRows.filter((r) => r.configured).length + legalRows.filter((r) => r.configured).length
  const readinessPct = Math.round((totalReady / totalChecks) * 100)

  const Row = ({ label, configured, detail }: ConfigRow) => (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
      {configured ? <CheckCircle2 size={15} className="text-[#00FFA3] flex-shrink-0" /> : <XCircle size={15} className="text-[#FF6B7A] flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-white/80">{label}</p>
        <p className="text-[11px] text-white/35 truncate">{detail}</p>
      </div>
    </div>
  )

  const Section = ({ title, icon, children, action }: { title: string; icon: ReactNode; children: ReactNode; action?: ReactNode }) => (
    <div className="plato-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest flex items-center gap-2">{icon} {title}</h3>
        {action}
      </div>
      {children}
    </div>
  )

  return (
    <div className="space-y-5">
      <PageHeader
        title="Go-Live Command Centre"
        subtitle="Real-time launch readiness, computed from actual app state and audit findings"
      />

      <div className="plato-card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-semibold text-white/70">Overall Readiness</span>
          <span className="text-[13px] font-bold" style={{ color: readinessPct >= 85 ? '#00FFA3' : readinessPct >= 50 ? '#FBBF24' : '#FF6B7A' }}>{readinessPct}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${readinessPct}%`, background: readinessPct >= 85 ? '#00FFA3' : readinessPct >= 50 ? '#FBBF24' : '#FF6B7A' }} />
        </div>
        <p className="text-[11px] text-white/30 mt-2">{totalReady} of {totalChecks} checks passing across engineering, business data, integrations, and legal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section title="Ready Items" icon={<CheckCircle2 size={14} className="text-[#00FFA3]" />}>
          {engineeringReady.map((r) => <Row key={r.label} label={r.label} configured detail={r.detail} />)}
        </Section>

        <Section title="Blockers (engineering)" icon={<AlertTriangle size={14} className="text-[#FF6B7A]" />}>
          {engineeringBlockers.map((r) => <Row key={r.label} label={r.label} configured={false} detail={r.detail} />)}
        </Section>

        <Section
          title="Missing Business Data"
          icon={<AlertTriangle size={14} className="text-[#FBBF24]" />}
          action={missingBusinessData.length > 0 && <button onClick={() => navigate('/super-admin/go-live')} className="btn-ghost text-[11px]">Fill in <ArrowRight size={12} /></button>}
        >
          {businessRows.map((r) => <Row key={r.label} {...r} />)}
        </Section>

        <Section
          title="Missing Integrations"
          icon={<AlertTriangle size={14} className="text-[#FBBF24]" />}
          action={missingIntegrations.length > 0 && <button onClick={() => navigate('/super-admin/go-live')} className="btn-ghost text-[11px]">Configure <ArrowRight size={12} /></button>}
        >
          {integrationRows.map((r) => <Row key={r.label} {...r} />)}
          <Row label="Production database" configured={false} detail="Blocker, not a config field — see DATABASE_REPORT.md. Never enter DB credentials into client-side code." />
        </Section>
      </div>

      <Section
        title="Legal & Compliance"
        icon={<AlertTriangle size={14} className="text-[#FBBF24]" />}
        action={missingLegal.length > 0 && <button onClick={() => navigate('/super-admin/go-live')} className="btn-ghost text-[11px]">Add links <ArrowRight size={12} /></button>}
      >
        {legalRows.map((r) => <Row key={r.label} {...r} />)}
      </Section>

      <div className="plato-card p-5 flex items-center gap-4" style={{ borderLeft: '3px solid #4D7CFF' }}>
        <Rocket size={20} className="text-[#4D7CFF] flex-shrink-0" />
        <p className="text-[13px] text-white/60">
          This dashboard reflects the findings in <code className="text-white/80">/audit/PLATO_PRODUCTION_READINESS_REPORT.md</code>. The engineering blockers above require real backend work (see <code className="text-white/80">DATABASE_REPORT.md</code>, <code className="text-white/80">SECURITY_REPORT.md</code>, <code className="text-white/80">AUTH_AUDIT_REPORT.md</code>) — they cannot be resolved by filling in a form.
        </p>
      </div>
    </div>
  )
}
