interface MultiSelectChipsProps {
  options: string[]
  selected: string[]
  onChange: (next: string[]) => void
}

export function MultiSelectChips({ options, selected, onChange }: MultiSelectChipsProps) {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt])
  }

  return (
    <div className="flex flex-wrap gap-2" role="group">
      {options.map((opt) => {
        const isSelected = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            onClick={() => toggle(opt)}
            onKeyDown={(e) => { if (e.key === ' ') { e.preventDefault(); toggle(opt) } }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border min-h-[36px] ${
              isSelected ? 'bg-[#4D7CFF] text-white border-[#4D7CFF]' : 'border-dark-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
