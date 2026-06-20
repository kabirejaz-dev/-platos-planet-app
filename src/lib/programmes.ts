import type { Curriculum, ProgrammeType } from '@/types'

// The 10 programmes Plato's Planet actually offers: 3 core academic curricula
// + 7 enrichment programmes. IB and American curricula are not offered (the
// platform's own marketing copy only ever cites IGCSE/A-Level/CBSE), so they
// are intentionally excluded from billing/enrolment programme pickers.
export const CORE_CURRICULA: Curriculum[] = ['IGCSE', 'A-Level', 'CBSE']

export const ENRICHMENT_PROGRAMMES: ProgrammeType[] = ['NEET-JEE', 'Robotics', 'Brainobrain', 'Oratory', 'IELTS', 'SAT', 'Languages']

export const ENRICHMENT_PROGRAMME_LABEL: Record<string, string> = { 'NEET-JEE': 'NEET/IIT-JEE', SAT: 'SATs' }

export interface ProgrammeOption {
  value: string
  label: string
  group: 'Curriculum' | 'Enrichment Programme'
}

export const ALL_PROGRAMME_OPTIONS: ProgrammeOption[] = [
  ...CORE_CURRICULA.map((c) => ({ value: c, label: c, group: 'Curriculum' as const })),
  ...ENRICHMENT_PROGRAMMES.map((p) => ({ value: p, label: ENRICHMENT_PROGRAMME_LABEL[p] || p, group: 'Enrichment Programme' as const })),
]
