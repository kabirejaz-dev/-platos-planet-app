import { Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'

interface LegalPageProps {
  title: string
  sections: { heading: string; body: string }[]
}

export function LegalPage({ title, sections }: LegalPageProps) {
  return (
    <div className="min-h-screen" style={{ background: '#080C18' }}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link to="/login" className="inline-flex items-center gap-2 text-[13px] text-white/40 hover:text-white/70 transition-colors mb-8">
          <ArrowLeft size={14} /> Back to login
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4D7CFF 0%, #7B61FF 100%)' }}>
            <FileText size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white font-display">{title}</h1>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FBBF24]/5 border border-[#FBBF24]/20 mb-8">
          <p className="text-[12px] text-[#FBBF24]/90">
            <strong>Demo placeholder:</strong> this is sample text for the Plato's Planet Digital demo, not a real legal document.
            Replace with your actual policy before going live.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-[14px] font-semibold text-white/85 mb-1.5">{s.heading}</h2>
              <p className="text-[13px] leading-relaxed text-white/50">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const PRIVACY_SECTIONS = [
  { heading: 'Information we collect', body: 'In a real deployment, this section would describe what student, parent, and staff data the platform collects — names, contact details, attendance, academic results, and payment records.' },
  { heading: 'How we use it', body: 'Data would be used to operate the learning platform: tracking attendance and homework, generating reports, processing fees, and sending notifications to parents and students.' },
  { heading: 'Data sharing', body: 'Describe any third parties data is shared with (e.g. payment processors, email/WhatsApp providers) and under what conditions.' },
  { heading: 'Contact', body: 'Provide a real contact email or address for privacy-related requests once this is no longer a demo.' },
]

export const TERMS_SECTIONS = [
  { heading: 'Using the platform', body: 'Describe acceptable use of the platform by students, parents, teachers, and administrators.' },
  { heading: 'Accounts', body: 'Explain account responsibilities — keeping login credentials secure and reporting unauthorized access.' },
  { heading: 'Fees and billing', body: 'Set out invoicing terms, due dates, and consequences of non-payment once real billing is connected.' },
  { heading: 'Changes to these terms', body: 'Explain how and when these terms may be updated.' },
]

export const REFUND_SECTIONS = [
  { heading: 'Eligibility', body: 'Describe which fees are refundable (e.g. unused term fees) and which are not (e.g. registration fees).' },
  { heading: 'How to request a refund', body: 'Explain the process — who to contact, what information is needed, and expected turnaround time.' },
  { heading: 'Processing time', body: 'State how long refunds typically take to reach the original payment method once approved.' },
]
