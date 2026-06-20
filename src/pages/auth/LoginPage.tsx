import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import type { UserRole, AuthUser } from '@/types'
import { Eye, EyeOff, Loader2, Sparkles, Zap, Users, Globe, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { isValidEmail, EMAIL_ERROR } from '@/lib/validation'
import { useCountUp } from '@/hooks/useCountUp'

const ROLE_ICONS: Record<UserRole, string> = {
  super_admin: '👑',
  branch_admin: '🏢',
  sales: '📈',
  teacher: '👩‍🏫',
  coordinator: '📊',
  finance: '💰',
  parent: '👪',
  student: '🎓',
  ai_tutor: '🤖',
}

const REMEMBERED_EMAIL_KEY = 'platos-planet-remembered-email'

const DEMO_ACCOUNTS: Array<{
  role: UserRole
  name: string
  email: string
  password: string
  label: string
  color: string
  userId: string
  branchId?: string
}> = [
  { role: 'super_admin',  name: 'Khalid Al Rashid',   email: 'khalid@platosplanet.ae',         password: 'demo123', label: 'Super Admin',  color: '#FF6B7A', userId: 'u-sa-001' },
  { role: 'branch_admin', name: 'Fatima Hassan',       email: 'fatima@platosplanet.ae',         password: 'demo123', label: 'Branch Admin', color: '#4D7CFF', userId: 'u-ba-001', branchId: 'br-001' },
  { role: 'sales',        name: 'Layla Nasser',        email: 'layla@platosplanet.ae',          password: 'demo123', label: 'Sales',        color: '#00FFA3', userId: 'u-sl-001', branchId: 'br-001' },
  { role: 'teacher',      name: 'Dr. Sarah Mitchell',  email: 'sarah@platosplanet.ae',          password: 'demo123', label: 'Teacher',      color: '#7B61FF', userId: 'u-tc-001', branchId: 'br-001' },
  { role: 'coordinator',  name: 'Dr. Yusuf Ibrahim',   email: 'yusuf@platosplanet.ae',          password: 'demo123', label: 'Coordinator',  color: '#00F0FF', userId: 'u-co-001', branchId: 'br-001' },
  { role: 'finance',      name: 'Priya Sharma',        email: 'priya@platosplanet.ae',          password: 'demo123', label: 'Finance',      color: '#C6FF00', userId: 'u-fi-001', branchId: 'br-001' },
  { role: 'parent',       name: 'Mohammed Al Farsi',   email: 'mfarsi@gmail.com',               password: 'demo123', label: 'Parent',       color: '#4D7CFF', userId: 'u-pr-001' },
  { role: 'student',      name: 'Zaid Al Farsi',       email: 'zaid@student.platosplanet.ae',   password: 'demo123', label: 'Student',      color: '#00FFA3', userId: 'u-st-001', branchId: 'br-001' },
  { role: 'ai_tutor',     name: 'Zaid Al Farsi',       email: 'ai@platosplanet.ae',             password: 'demo123', label: 'AI Tutor',     color: '#7B61FF', userId: 'u-st-001', branchId: 'br-001' },
]

const ROLE_ROUTES: Record<UserRole, string> = {
  super_admin: '/super-admin',
  branch_admin: '/branch-admin',
  sales: '/sales',
  teacher: '/teacher',
  coordinator: '/coordinator',
  finance: '/finance',
  parent: '/parent',
  student: '/student',
  ai_tutor: '/ai-tutor',
}

const FEATURES = [
  { icon: <Sparkles size={15} />, text: 'AI-powered personalised learning' },
  { icon: <Users size={15} />, text: '9 role-based dashboards in one platform' },
  { icon: <Globe size={15} />, text: 'Built for IGCSE, A-Level & CBSE in UAE/GCC' },
  { icon: <Zap size={15} />, text: 'Real-time attendance, fees & parent updates' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const setCurrentUser = useAppStore((s) => s.setCurrentUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showForgotPw, setShowForgotPw] = useState(false)
  const [justFilled, setJustFilled] = useState(false)
  const rolesCount = useCountUp(9)
  const programmesCount = useCountUp(10)

  useEffect(() => {
    const remembered = localStorage.getItem(REMEMBERED_EMAIL_KEY)
    if (remembered) {
      setEmail(remembered)
      setRememberMe(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    const account = DEMO_ACCOUNTS.find((a) => a.email === email && a.password === password)
    if (!account) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return
    }
    if (rememberMe) localStorage.setItem(REMEMBERED_EMAIL_KEY, email)
    else localStorage.removeItem(REMEMBERED_EMAIL_KEY)
    const authUser: AuthUser = {
      id: account.userId,
      name: account.name,
      email: account.email,
      role: account.role,
      branchId: account.branchId,
      token: `demo-token-${Date.now()}`,
    }
    setCurrentUser(authUser)
    navigate(ROLE_ROUTES[account.role])
    setLoading(false)
  }

  const quickLogin = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email)
    setPassword(account.password)
    setJustFilled(true)
    setTimeout(() => setJustFilled(false), 700)
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#070B17' }}>

      {/* ── Left Hero Panel ───────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-14 relative overflow-hidden">

        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(77,124,255,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(77,124,255,0.06) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
            }}
          />
          {/* Glow orbs */}
          <div
            className="absolute animate-float"
            style={{
              top: '-15%', left: '-10%',
              width: 600, height: 600,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(77,124,255,0.15) 0%, transparent 65%)',
            }}
          />
          <div
            className="absolute animate-float-slow"
            style={{
              bottom: '-20%', right: '-15%',
              width: 500, height: 500,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(123,97,255,0.12) 0%, transparent 60%)',
            }}
          />
          <div
            className="absolute animate-float-slower"
            style={{
              top: '45%', left: '55%',
              width: 300, height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,240,255,0.07) 0%, transparent 60%)',
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #4D7CFF 0%, #7B61FF 60%, #00F0FF 100%)',
              boxShadow: '0 0 30px rgba(77,124,255,0.5), 0 0 60px rgba(123,97,255,0.25)',
            }}
          >
            <span className="text-white font-bold text-lg font-display">P</span>
          </div>
          <div>
            <p className="text-[15px] font-bold text-white font-display leading-tight">Plato's Planet</p>
            <p className="text-[11px] text-white/30 font-medium tracking-wider uppercase">Digital</p>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative space-y-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(77,124,255,0.1)',
              border: '1px solid rgba(77,124,255,0.25)',
            }}
          >
            <Sparkles size={13} style={{ color: '#4D7CFF' }} />
            <span className="text-[12px] font-semibold" style={{ color: '#4D7CFF' }}>
              AI-Powered Education OS — UAE & GCC
            </span>
          </div>

          <h1 className="text-[52px] font-bold text-white font-display leading-[1.08] tracking-tight">
            The future of<br />
            <span className="gradient-text">education</span><br />
            starts here.
          </h1>

          <p className="text-[15px] leading-relaxed max-w-sm" style={{ color: 'rgba(148,163,184,0.9)' }}>
            One intelligent platform for students, teachers, parents, and administrators — powered by AI.
          </p>

          {/* Features */}
          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(77,124,255,0.12)', color: '#4D7CFF' }}
                >
                  {f.icon}
                </div>
                <span className="text-[13px]" style={{ color: 'rgba(148,163,184,0.8)' }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { value: `${rolesCount}`, label: 'User Roles' },
              { value: `${programmesCount}+`, label: 'Programmes' },
              { value: 'AI-First', label: 'Platform' },
            ].map((s) => (
              <div
                key={s.label}
                className="p-4 rounded-2xl text-center"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <p className="text-[22px] font-bold text-white font-display leading-tight">{s.value}</p>
                <p className="text-[11px] mt-1" style={{ color: 'rgba(100,116,139,0.8)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative space-y-2">
          <p className="text-[11px]" style={{ color: 'rgba(100,116,139,0.5)' }}>
            © 2026 Plato's Planet Digital. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-[11px]" style={{ color: 'rgba(100,116,139,0.5)' }}>
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <span>·</span>
            <Link to="/terms" className="hover:underline">Terms</Link>
            <span>·</span>
            <Link to="/refund" className="hover:underline">Refunds</Link>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ──────────────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center p-8 relative"
        style={{
          background: 'rgba(8,12,24,0.6)',
          borderLeft: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Subtle bg glow */}
        <div
          className="absolute top-0 right-0 pointer-events-none"
          style={{
            width: 400, height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(123,97,255,0.06) 0%, transparent 65%)',
          }}
        />

        <div className="w-full max-w-sm relative">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4D7CFF 0%, #7B61FF 100%)' }}
            >
              <span className="text-white font-bold font-display">P</span>
            </div>
            <div>
              <p className="text-[14px] font-bold text-white font-display">Plato's Planet Digital</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-[28px] font-bold text-white font-display leading-tight mb-1">Welcome back</h2>
            <p className="text-[13px]" style={{ color: 'rgba(100,116,139,0.8)' }}>Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: 'rgba(148,163,184,0.8)' }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError('') }}
                onBlur={() => setEmailError(email && !isValidEmail(email) ? EMAIL_ERROR : '')}
                placeholder="your@email.com"
                className={emailError ? 'plato-input border-[#FF6B7A]' : 'plato-input'}
                style={justFilled ? { boxShadow: '0 0 0 2px rgba(0,255,163,0.5)', transition: 'box-shadow 0.4s ease' } : { transition: 'box-shadow 0.4s ease' }}
                required
              />
              {emailError && <p className="text-[11px] text-[#FF6B7A] mt-1">{emailError}</p>}
            </div>

            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: 'rgba(148,163,184,0.8)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="plato-input pr-10"
                  style={justFilled ? { boxShadow: '0 0 0 2px rgba(0,255,163,0.5)', transition: 'box-shadow 0.4s ease' } : { transition: 'box-shadow 0.4s ease' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(100,116,139,0.6)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.9)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(100,116,139,0.6)' }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 text-[12px] cursor-pointer" style={{ color: 'rgba(148,163,184,0.8)' }}>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4" />
                  Remember me
                </label>
                <button type="button" onClick={() => setShowForgotPw(true)} className="text-[12px] hover:underline" style={{ color: '#4D7CFF' }}>
                  Forgot password?
                </button>
              </div>
            </div>

            {error && (
              <div
                className="flex items-start justify-between gap-3 px-4 py-3 rounded-xl text-[13px]"
                style={{
                  background: 'rgba(255,107,122,0.08)',
                  border: '1px solid rgba(255,107,122,0.25)',
                  color: '#FF6B7A',
                }}
              >
                <span>{error}</span>
                <button type="button" onClick={() => setError('')} aria-label="Dismiss" className="flex-shrink-0">
                  <X size={14} />
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-[14px]"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span className="text-[11px] font-semibold" style={{ color: 'rgba(100,116,139,0.7)' }}>
                Demo Accounts
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <p className="text-[11px] mb-3" style={{ color: 'rgba(100,116,139,0.6)' }}>
              Click any role to auto-fill credentials:
            </p>

            <div className="grid grid-cols-3 gap-1.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const isActive = email === acc.email
                return (
                  <button
                    key={acc.role}
                    onClick={() => quickLogin(acc)}
                    className="px-2 py-2 rounded-xl text-[11px] font-semibold text-center transition-all flex flex-col items-center gap-1 min-h-[44px]"
                    style={{
                      background: isActive ? `${acc.color}15` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? `${acc.color}40` : 'rgba(255,255,255,0.07)'}`,
                      color: isActive ? acc.color : 'rgba(100,116,139,0.8)',
                      boxShadow: isActive ? `0 0 12px ${acc.color}20` : 'none',
                    }}
                  >
                    <span className="text-[14px] leading-none">{ROLE_ICONS[acc.role]}</span>
                    {acc.label}
                  </button>
                )
              })}
            </div>

            <p className="text-[11px] mt-3" style={{ color: 'rgba(100,116,139,0.5)' }}>
              Password:{' '}
              <code
                className="px-1.5 py-0.5 rounded font-mono"
                style={{ background: 'rgba(77,124,255,0.12)', color: '#4D7CFF', fontSize: 11 }}
              >
                demo123
              </code>
            </p>
          </div>
        </div>
      </div>

      <Modal open={showForgotPw} onClose={() => setShowForgotPw(false)} title="Forgot password?" size="sm">
        <p className="text-[13px] text-white/70 leading-relaxed">
          Password reset is not available in demo mode. Demo password: <code className="px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(77,124,255,0.12)', color: '#4D7CFF' }}>demo123</code>
        </p>
        <button type="button" className="btn-primary w-full justify-center mt-4" onClick={() => setShowForgotPw(false)}>Got it</button>
      </Modal>
    </div>
  )
}
