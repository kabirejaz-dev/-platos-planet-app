import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { toast } from '@/components/ui/Toaster'
import { Save, Building2, CreditCard, Bell, Sparkles } from 'lucide-react'

export default function SystemSettingsPage() {
  const { settings, updateSettings } = useAppStore()
  const [form, setForm] = useState(settings)

  const handleSave = () => {
    updateSettings(form)
    toast.success('Settings saved', 'Platform-wide settings have been updated.')
  }

  const field = (label: string, value: string | number, onChange: (v: string) => void, type = 'text') => (
    <div>
      <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">{label}</label>
      <input type={type} className="plato-input" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )

  const thisYear = new Date().getFullYear()
  const academicYearOptions = Array.from({ length: 5 }, (_, i) => {
    const start = thisYear - 2 + i
    return `${start}-${start + 1}`
  })
  if (!academicYearOptions.includes(form.academicYear)) academicYearOptions.unshift(form.academicYear)

  return (
    <div className="space-y-5">
      <PageHeader
        title="System Settings"
        subtitle="Configure platform-wide settings, permissions, and notification preferences"
        badge={<DemoBadge />}
        actions={<button className="btn-primary" onClick={handleSave}><Save size={14} /> Save Changes</button>}
      />

      <div className="plato-card p-5 space-y-4">
        <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest flex items-center gap-2"><Building2 size={14} /> Company Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('Company Name', form.companyName, (v) => setForm((f) => ({ ...f, companyName: v })))}
          {field('Website', form.website, (v) => setForm((f) => ({ ...f, website: v })))}
          {field('Email', form.email, (v) => setForm((f) => ({ ...f, email: v })))}
          {field('Phone', form.phone, (v) => setForm((f) => ({ ...f, phone: v })))}
          <div className="sm:col-span-2">{field('Address', form.address, (v) => setForm((f) => ({ ...f, address: v })))}</div>
        </div>
      </div>

      <div className="plato-card p-5 space-y-4">
        <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest flex items-center gap-2"><CreditCard size={14} /> Finance & Compliance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Currency</label>
            <select className="plato-input" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value as typeof f.currency }))}>
              <option value="AED">AED</option>
              <option value="SAR">SAR</option>
              <option value="USD">USD</option>
            </select>
          </div>
          {field('VAT Number', form.vatNumber || '', (v) => setForm((f) => ({ ...f, vatNumber: v })))}
          {field('VAT Rate (%)', form.vatRate, (v) => setForm((f) => ({ ...f, vatRate: Number(v) })), 'number')}
          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Academic Year</label>
            <select className="plato-input" value={form.academicYear} onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))}>
              {academicYearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {field('Timezone', form.timezone, (v) => setForm((f) => ({ ...f, timezone: v })))}
        </div>
      </div>

      <div className="plato-card p-5 space-y-4">
        <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest flex items-center gap-2"><Bell size={14} /> Notifications & Integrations</h3>
        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <p className="text-[13px] font-medium text-white/80">WhatsApp Notifications</p>
            <p className="text-[11px] text-white/40">Send attendance, fee, and homework alerts via WhatsApp</p>
          </div>
          <button
            onClick={() => setForm((f) => ({ ...f, whatsappEnabled: !f.whatsappEnabled }))}
            className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0"
            style={{ background: form.whatsappEnabled ? '#00FFA3' : 'rgba(255,255,255,0.12)' }}
          >
            <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: form.whatsappEnabled ? 22 : 2 }} />
          </button>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#7B61FF]" />
            <div>
              <p className="text-[13px] font-medium text-white/80">Platform Live Status</p>
              <p className="text-[11px] text-white/40">Controls whether the platform is publicly accessible to students and parents</p>
            </div>
          </div>
          <button
            onClick={() => setForm((f) => ({ ...f, isLive: !f.isLive }))}
            className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0"
            style={{ background: form.isLive ? '#00FFA3' : 'rgba(255,255,255,0.12)' }}
          >
            <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: form.isLive ? 22 : 2 }} />
          </button>
        </div>
      </div>
    </div>
  )
}
