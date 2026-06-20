import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface SearchableSelectOption {
  id: string
  label: string
  sublabel?: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
  emptyLabel?: string
  hasError?: boolean
  id?: string
}

export function SearchableSelect({ options, value, onChange, placeholder = '— Select —', emptyLabel = 'No options available', hasError, id }: SearchableSelectProps) {
  const selected = options.find((o) => o.id === value)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlight, setHighlight] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const choose = (id: string) => {
    onChange(id)
    setOpen(false)
    setSearch('')
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setHighlight((h) => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (open && filtered[highlight]) choose(filtered[highlight].id)
    } else if (e.key === 'Escape' && open) {
      e.stopPropagation()
      setOpen(false)
      setSearch('')
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <div
        className={`flex items-center gap-2 plato-input cursor-text ${hasError ? 'border-[#FF6B7A]' : ''}`}
        onClick={() => setOpen(true)}
      >
        <input
          id={id}
          className="flex-1 bg-transparent outline-none min-w-0"
          value={open ? search : selected?.label || ''}
          placeholder={selected ? selected.label : placeholder}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); setHighlight(0) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        <ChevronDown size={14} className="text-white/30 flex-shrink-0" />
      </div>

      {open && (
        <div
          className="absolute left-0 right-0 mt-1 z-20 max-h-56 overflow-y-auto rounded-xl"
          style={{ background: '#0B0F1E', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {filtered.length === 0 ? (
            <p className="text-[12px] text-white/30 px-3 py-3">{emptyLabel}</p>
          ) : (
            filtered.map((o, idx) => (
              <button
                key={o.id}
                type="button"
                onClick={() => choose(o.id)}
                onMouseEnter={() => setHighlight(idx)}
                className="w-full text-left px-3 py-2 text-[13px]"
                style={{ background: idx === highlight ? 'rgba(77,124,255,0.12)' : 'transparent', color: idx === highlight ? '#4D7CFF' : 'rgba(255,255,255,0.8)' }}
              >
                {o.label}
                {o.sublabel && <span className="block text-[11px] text-white/30">{o.sublabel}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
