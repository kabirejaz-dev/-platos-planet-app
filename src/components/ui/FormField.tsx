export function RequiredMark() {
  return <span className="text-[#FF6B7A]"> *</span>
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-[11px] text-[#FF6B7A] mt-1">{message}</p>
}

export function RequiredFieldsNote() {
  return <p className="text-[11px] text-white/30 mt-2">* Required fields</p>
}

export function fieldInputClass(hasError?: string) {
  return hasError ? 'plato-input border-[#FF6B7A]' : 'plato-input'
}
