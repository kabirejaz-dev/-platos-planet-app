import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { formatDateFull } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { User, Phone, Mail, Shield, KeyRound } from 'lucide-react'

export default function StudentProfilePage() {
  const { currentUser, students, parents, branches } = useAppStore()
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  const student = students.find((s) => s.userId === currentUser?.id)
  if (!student || !currentUser) return <div className="text-white/30 p-6">Student profile not found.</div>

  const parent = parents.find((p) => p.id === student.parentId)
  const branch = branches.find((b) => b.id === student.branchId)

  const personalDetails = [
    { label: 'Full Name', value: student.name },
    { label: 'Date of Birth', value: student.dateOfBirth ? formatDateFull(student.dateOfBirth) : '—' },
    { label: 'Nationality', value: student.nationality || '—' },
    { label: 'Gender', value: student.gender || '—' },
    { label: 'Student ID', value: student.id.toUpperCase() },
    { label: 'Enrollment Date', value: formatDateFull(student.enrollmentDate) },
  ]

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPw || !newPw || !confirmPw) {
      toast.error('All fields are required')
      return
    }
    if (newPw !== confirmPw) {
      toast.error('Passwords do not match')
      return
    }
    setCurrentPw('')
    setNewPw('')
    setConfirmPw('')
    toast.success('Password changed!', 'Demo mode — no real password was changed.')
  }

  return (
    <div className="space-y-5">
      <PageHeader title="My Profile" subtitle="View your account and personal details" />

      {/* Header card */}
      <div className="plato-card p-5 flex items-center gap-4">
        <Avatar name={student.name} size="xl" />
        <div>
          <h2 className="text-[18px] font-bold text-white font-display">{student.name}</h2>
          <p className="text-[13px] text-white/50">{student.curriculum} · {student.grade}</p>
          {branch && <p className="text-[12px] text-white/30 mt-0.5">{branch.name}, {branch.city} · {branch.id === student.branchId ? 'Academic Year 2025–2026' : ''}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Personal details */}
        <div className="plato-card overflow-hidden">
          <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <User size={14} className="text-[#4D7CFF]" />
            <h3 className="text-[13px] font-bold text-white/70">Personal Details</h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {personalDetails.map((row) => (
              <div key={row.label} className="flex justify-between px-5 py-3 text-[12px]">
                <span className="text-white/35">{row.label}</span>
                <span className="text-white/75 font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & family */}
        <div className="plato-card overflow-hidden">
          <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Phone size={14} className="text-[#7B61FF]" />
            <h3 className="text-[13px] font-bold text-white/70">Contact & Family</h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <div className="flex justify-between px-5 py-3 text-[12px]">
              <span className="text-white/35">Student Email</span>
              <span className="text-white/75 font-medium">{student.email}</span>
            </div>
            {student.phone && (
              <div className="flex justify-between px-5 py-3 text-[12px]">
                <span className="text-white/35">Student Phone</span>
                <span className="text-white/75 font-medium">{student.phone}</span>
              </div>
            )}
            {parent && (
              <>
                <div className="flex justify-between px-5 py-3 text-[12px]">
                  <span className="text-white/35">Parent / Guardian</span>
                  <span className="text-white/75 font-medium">{parent.name}{parent.relationship ? ` (${parent.relationship})` : ''}</span>
                </div>
                <div className="flex justify-between px-5 py-3 text-[12px]">
                  <span className="text-white/35">Parent Phone</span>
                  <span className="text-white/75 font-medium">{parent.phone}</span>
                </div>
                <div className="flex justify-between px-5 py-3 text-[12px]">
                  <span className="text-white/35">Parent Email</span>
                  <span className="text-white/75 font-medium">{parent.email}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-white/25 px-1">
        To update your personal or contact details, please contact your branch administrator.
      </p>

      {/* Account info */}
      <div className="plato-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={14} className="text-[#00FFA3]" />
          <h3 className="text-[13px] font-bold text-white/70">Account Info</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-[12px]">
          <div>
            <p className="text-white/35 flex items-center gap-1"><Mail size={11} /> Email</p>
            <p className="text-white/75 font-medium mt-1">{currentUser.email}</p>
          </div>
          <div>
            <p className="text-white/35">Role</p>
            <p className="text-white/75 font-medium mt-1 capitalize">Student</p>
          </div>
          <div>
            <p className="text-white/35">Last Login</p>
            <p className="text-white/75 font-medium mt-1">Today</p>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="plato-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound size={14} className="text-[#FF6B7A]" />
          <h3 className="text-[13px] font-bold text-white/70">Change Password</h3>
        </div>
        <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input type="password" className="plato-input text-[13px]" placeholder="Current password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
          <input type="password" className="plato-input text-[13px]" placeholder="New password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          <input type="password" className="plato-input text-[13px]" placeholder="Confirm new password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
          <button type="submit" className="btn-primary sm:col-span-3 justify-center">Change Password</button>
        </form>
      </div>
    </div>
  )
}
