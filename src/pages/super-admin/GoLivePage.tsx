import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { CheckCircle2, Circle, Zap, Building2, CreditCard, Mail, MessageSquare, Brain, FileText, HardDrive } from 'lucide-react'

interface SetupSection {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  fields: Array<{ key: string; label: string; placeholder: string; type?: string }>
}

const SECTIONS: SetupSection[] = [
  {
    id: 'business',
    icon: <Building2 size={20} />,
    title: 'Business Info',
    description: 'Your company details displayed on invoices and communications',
    fields: [
      { key: 'companyName', label: 'Company Name', placeholder: "Plato's Planet Digital" },
      { key: 'address', label: 'Address', placeholder: 'Dubai Marina, Tower 1' },
      { key: 'phone', label: 'Phone', placeholder: '+971 4 XXX XXXX' },
      { key: 'email', label: 'Email', placeholder: 'hello@company.ae' },
      { key: 'website', label: 'Website', placeholder: 'https://company.ae' },
      { key: 'vatNumber', label: 'VAT / TRN Number', placeholder: 'TRN1002345...' },
    ],
  },
  {
    id: 'payment',
    icon: <CreditCard size={20} />,
    title: 'Payment Gateway',
    description: 'Connect a payment processor to collect fees online',
    fields: [
      { key: 'stripeKey', label: 'Stripe Secret Key', placeholder: 'sk_live_...', type: 'password' },
      { key: 'stripePublic', label: 'Stripe Publishable Key', placeholder: 'pk_live_...' },
    ],
  },
  {
    id: 'storage',
    icon: <HardDrive size={20} />,
    title: 'File Storage',
    description: 'Store student documents, homework, and resources',
    fields: [
      { key: 's3Bucket', label: 'AWS S3 Bucket', placeholder: 'platos-planet-files' },
      { key: 's3Region', label: 'AWS Region', placeholder: 'me-south-1' },
      { key: 's3AccessKey', label: 'Access Key ID', placeholder: 'AKIA...', type: 'password' },
    ],
  },
  {
    id: 'email',
    icon: <Mail size={20} />,
    title: 'Email Provider',
    description: 'Send transactional emails to parents and students',
    fields: [
      { key: 'sendgridKey', label: 'SendGrid API Key', placeholder: 'SG.xxx...', type: 'password' },
      { key: 'fromEmail', label: 'From Email', placeholder: 'noreply@company.ae' },
      { key: 'fromName', label: 'From Name', placeholder: "Plato's Planet" },
    ],
  },
  {
    id: 'whatsapp',
    icon: <MessageSquare size={20} />,
    title: 'WhatsApp Business',
    description: 'Send attendance alerts and fee reminders via WhatsApp',
    fields: [
      { key: 'wapiToken', label: 'Meta WhatsApp Token', placeholder: 'EAAxx...', type: 'password' },
      { key: 'wapiPhoneId', label: 'Phone Number ID', placeholder: '1234567890' },
    ],
  },
  {
    id: 'ai',
    icon: <Brain size={20} />,
    title: 'AI Provider',
    description: 'Power the AI Tutor and doubt solver features',
    fields: [
      { key: 'anthropicKey', label: 'Anthropic / Claude API Key', placeholder: 'sk-ant-...', type: 'password' },
      { key: 'openaiKey', label: 'OpenAI API Key (optional)', placeholder: 'sk-...', type: 'password' },
    ],
  },
  {
    id: 'legal',
    icon: <FileText size={20} />,
    title: 'Legal & Compliance',
    description: 'Required policy URLs for student and parent registration',
    fields: [
      { key: 'privacyUrl', label: 'Privacy Policy URL', placeholder: 'https://company.ae/privacy' },
      { key: 'termsUrl', label: 'Terms of Service URL', placeholder: 'https://company.ae/terms' },
      { key: 'refundUrl', label: 'Refund Policy URL', placeholder: 'https://company.ae/refund' },
    ],
  },
]

export default function GoLivePage() {
  const { settings, updateSettings } = useAppStore()
  const [activeSection, setActiveSection] = useState('business')
  const [formData, setFormData] = useState<Record<string, string>>({
    companyName: settings.companyName,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    website: settings.website,
    vatNumber: settings.vatNumber || '',
  })
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  const handleSave = (sectionId: string) => {
    if (sectionId === 'business') {
      updateSettings({
        companyName: formData.companyName,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        vatNumber: formData.vatNumber,
      })
    }
    if (sectionId === 'whatsapp' && formData.wapiToken) {
      updateSettings({ whatsappEnabled: true })
    }
    setSaved({ ...saved, [sectionId]: true })
  }

  const handleGoLive = () => {
    updateSettings({ isLive: true })
  }

  const completedCount = Object.keys(saved).length
  const totalSections = SECTIONS.length
  const canGoLive = saved.business && saved.payment && saved.email

  return (
    <div className="space-y-6">
      <PageHeader
        title="Go Live Setup"
        subtitle="Configure your production environment"
        actions={
          <button
            className="btn-primary disabled:opacity-40"
            disabled={!canGoLive || settings.isLive}
            onClick={handleGoLive}
          >
            <Zap size={16} />
            {settings.isLive ? 'Already Live ✓' : 'Go Live'}
          </button>
        }
      />

      {settings.isLive && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#00FFA3]/5 border border-[#00FFA3]/20">
          <CheckCircle2 size={18} className="text-[#00FFA3]" />
          <p className="text-sm font-semibold text-[#00FFA3]">Platform is LIVE — all features are in production mode.</p>
        </div>
      )}

      {/* Progress */}
      <div className="plato-card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-foreground">Setup Progress</span>
          <span className="text-sm text-muted-foreground">{completedCount}/{totalSections} completed</span>
        </div>
        <div className="w-full h-2 bg-dark-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#4D7CFF] to-[#00FFA3] transition-all duration-500"
            style={{ width: `${(completedCount / totalSections) * 100}%` }}
          />
        </div>
        {!canGoLive && (
          <p className="text-xs text-muted-foreground mt-2">Complete Business Info, Payment, and Email to go live.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section nav */}
        <div className="space-y-1">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all ${activeSection === section.id ? 'bg-[#4D7CFF]/10 text-[#4D7CFF] border border-[#4D7CFF]/20' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
            >
              <span className="flex-shrink-0">{section.icon}</span>
              <span className="flex-1">{section.title}</span>
              {saved[section.id] ? (
                <CheckCircle2 size={16} className="text-[#00FFA3] flex-shrink-0" />
              ) : (
                <Circle size={16} className="opacity-30 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Section content */}
        {SECTIONS.map((section) => section.id === activeSection && (
          <div key={section.id} className="lg:col-span-3 plato-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#4D7CFF]/10 flex items-center justify-center text-[#4D7CFF]">
                {section.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground font-display">{section.title}</h2>
                <p className="text-xs text-muted-foreground">{section.description}</p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    className="plato-input"
                    placeholder={field.placeholder}
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-6 pt-5 border-t border-dark-border">
              {saved[section.id] && (
                <div className="flex items-center gap-2 text-[#00FFA3] text-sm">
                  <CheckCircle2 size={16} />
                  Saved
                </div>
              )}
              <button
                className="btn-primary ml-auto"
                onClick={() => handleSave(section.id)}
              >
                {saved[section.id] ? 'Update' : 'Save & Continue'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
