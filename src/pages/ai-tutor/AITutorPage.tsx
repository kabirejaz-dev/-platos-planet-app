import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { generateId } from '@/lib/utils'
import { Brain, Send, Sparkles, BookOpen, Zap, RotateCcw } from 'lucide-react'
import type { Subject, AIMessage } from '@/types'

const SUBJECTS: Subject[] = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'Computer Science']

const SAMPLE_QUESTIONS: Record<string, string[]> = {
  Physics: [
    "Explain Newton's Second Law with a worked example",
    "What is the difference between speed and velocity?",
    "How do I solve circuit problems with resistors in parallel?",
  ],
  Chemistry: [
    "Explain oxidation and reduction with examples",
    "How do I balance a chemical equation?",
    "What are the properties of alkenes vs alkanes?",
  ],
  Mathematics: [
    "How do I integrate by parts?",
    "Explain the chain rule with an example",
    "How do I solve quadratic inequalities?",
  ],
  Biology: [
    "Explain the process of mitosis",
    "What is the difference between DNA and RNA?",
    "How does the immune system fight infection?",
  ],
  English: [
    "How do I structure a IGCSE argument essay?",
    "Explain the difference between simile and metaphor",
    "How do I analyse poetry effectively?",
  ],
  'Computer Science': [
    "What is the difference between recursion and iteration?",
    "Explain Big O notation",
    "How do I write a binary search algorithm?",
  ],
}

// Simulated AI responses
function generateAIResponse(question: string, subject: Subject): string {
  const responses: Record<string, string> = {
    default: `Great question about **${subject}**!\n\nLet me break this down step by step:\n\n**Key Concept:**\n${question.includes('?') ? question.slice(0, -1) : question} is an important topic in ${subject}.\n\n**Explanation:**\nThis involves understanding the fundamental principles at play. In ${subject}, we approach this systematically:\n\n1. **First principle** — Start with the basics\n2. **Application** — Apply the concept to real scenarios\n3. **Worked example** — Let's solve a specific problem\n\n**Practice Question:**\nTry solving a similar problem and I'll guide you through it!\n\n*💡 Tip: For IGCSE ${subject}, always show your working in exams.*`,
  }

  if (question.toLowerCase().includes("newton") || question.toLowerCase().includes("second law")) {
    return `**Newton's Second Law of Motion** states:\n\n> **F = ma** (Force = mass × acceleration)\n\nThis means the acceleration of an object is directly proportional to the net force and inversely proportional to its mass.\n\n**Worked Example:**\nA 5 kg box on a frictionless surface is pushed with a net force of 20 N.\n\n*Find the acceleration:*\n- F = 20 N\n- m = 5 kg  \n- a = F/m = 20 ÷ 5 = **4 m/s²**\n\n**IGCSE-style question:**\nA car of mass 1200 kg accelerates from rest to 15 m/s in 6 seconds. What net force acts on it?\n\n*Solution:*\n- a = Δv/t = 15/6 = 2.5 m/s²\n- F = ma = 1200 × 2.5 = **3000 N**\n\n🎯 **Key points to remember:**\n- Double the force → double the acceleration\n- Double the mass → half the acceleration\n- Net force means resultant of ALL forces\n\nWant me to give you a harder question with friction?`
  }

  if (question.toLowerCase().includes("integrate by parts")) {
    return `**Integration by Parts** uses the formula:\n\n$$\\int u \\, dv = uv - \\int v \\, du$$\n\n**The LIATE rule** helps you choose u:\n- **L**ogarithmic\n- **I**nverse trig\n- **A**lgebraic\n- **T**rigonometric\n- **E**xponential\n\n**Worked Example:**\n\nEvaluate ∫ x·eˣ dx\n\n*Step 1:* Choose u = x, dv = eˣ dx\n*Step 2:* du = dx, v = eˣ\n*Step 3:* Apply formula:\n∫ x·eˣ dx = x·eˣ - ∫ eˣ dx\n= x·eˣ - eˣ + C\n= **eˣ(x - 1) + C** ✓\n\n**Try this:** ∫ x·sin(x) dx\n\n💡 *Hint: Use u = x, dv = sin(x) dx*`
  }

  return responses.default
}

export default function AITutorPage() {
  const { currentUser, students, conversations, addConversation, updateConversation, addXP } = useAppStore()
  const student = students.find((s) => s.userId === currentUser?.id)

  const [selectedSubject, setSelectedSubject] = useState<Subject>('Physics')
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'ask' | 'quiz' | 'flashcards'>('ask')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const studentConvs = conversations.filter((c) => c.studentId === student?.id)
  const activeConv = conversations.find((c) => c.id === activeConvId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv?.messages.length, isTyping])

  const startNewConv = () => {
    if (!student) return
    const conv = {
      id: `conv-${generateId()}`,
      studentId: student.id,
      subject: selectedSubject,
      messages: [],
      createdAt: new Date().toISOString(),
    }
    addConversation(conv)
    setActiveConvId(conv.id)
  }

  const sendMessage = async () => {
    if (!input.trim() || !activeConvId) return
    const userMsg: AIMessage = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    const conv = conversations.find((c) => c.id === activeConvId)
    updateConversation(activeConvId, {
      messages: [...(conv?.messages || []), userMsg],
    })
    const question = input.trim()
    setInput('')
    setIsTyping(true)

    // Simulate AI response delay
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800))

    const aiMsg: AIMessage = {
      id: generateId(),
      role: 'assistant',
      content: generateAIResponse(question, selectedSubject),
      timestamp: new Date().toISOString(),
    }

    const updatedConv = conversations.find((c) => c.id === activeConvId)
    updateConversation(activeConvId, {
      messages: [...(updatedConv?.messages || []), userMsg, aiMsg],
    })

    if (student) addXP(student.id, 10)
    setIsTyping(false)
  }

  // Quiz generator
  const [quizSubject, setQuizSubject] = useState<Subject>('Physics')
  const [quizTopic, setQuizTopic] = useState('')
  const [quiz, setQuiz] = useState<Array<{ q: string; options: string[]; answer: number; explanation: string }> | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  const generateQuiz = () => {
    setQuiz([
      { q: `In ${quizSubject}, which of the following best describes ${quizTopic || 'a key concept'}?`, options: ['Option A', 'Option B — Correct answer', 'Option C', 'Option D'], answer: 1, explanation: `Option B is correct because it accurately describes the fundamental principle in ${quizSubject}.` },
      { q: `A common application of ${quizTopic || quizSubject} is:`, options: ['Application X', 'Application Y', 'Application Z — Correct', 'Application W'], answer: 2, explanation: `Application Z correctly demonstrates this concept in a real-world context.` },
      { q: `Which formula is associated with ${quizTopic || quizSubject}?`, options: ['F = mv', 'E = mc²', 'F = ma — Correct for this context', 'P = IV'], answer: 2, explanation: 'This formula is the key equation for solving these types of problems.' },
    ])
    setQuizAnswers({})
    setQuizSubmitted(false)
    if (student) addXP(student.id, 20)
  }

  // Flashcards
  const [cardSubject, setCardSubject] = useState<Subject>('Physics')
  const [flipped, setFlipped] = useState<Record<number, boolean>>({})
  const flashcards = [
    { front: `What is Newton's Second Law?`, back: 'F = ma — Net force equals mass times acceleration' },
    { front: 'Define acceleration', back: 'Rate of change of velocity with respect to time. a = Δv/Δt (m/s²)' },
    { front: 'What is the unit of force?', back: 'Newton (N) — equivalent to kg·m/s²' },
    { front: 'State the law of conservation of energy', back: 'Energy cannot be created or destroyed, only transferred between forms.' },
  ]

  return (
    <div className="space-y-6 h-full">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7B61FF] to-[#00F0FF] flex items-center justify-center">
          <Brain size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">AI Tutor</h1>
          <p className="text-xs text-muted-foreground">Powered by Claude · Instant subject help</p>
        </div>
        <span className="badge-purple ml-auto">+10 XP per question</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-dark-card border border-dark-border rounded-xl w-fit">
        {[
          { id: 'ask', label: 'Ask Question', icon: <Sparkles size={14} /> },
          { id: 'quiz', label: 'Quiz Generator', icon: <Zap size={14} /> },
          { id: 'flashcards', label: 'Flashcards', icon: <BookOpen size={14} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-[#7B61FF] text-white' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Ask Question tab */}
      {activeTab === 'ask' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-320px)] min-h-[400px]">
          {/* Left: Subject + history */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Subject</label>
              <select className="plato-input" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value as Subject)}>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <button className="btn-primary w-full justify-center" onClick={startNewConv}>
              <Sparkles size={14} /> New Conversation
            </button>

            {/* Quick questions */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Quick Questions</p>
              <div className="space-y-2">
                {(SAMPLE_QUESTIONS[selectedSubject] || []).map((q) => (
                  <button
                    key={q}
                    onClick={() => { if (!activeConvId) startNewConv(); setInput(q) }}
                    className="w-full text-left text-xs text-muted-foreground hover:text-foreground p-2.5 rounded-xl bg-white/3 border border-dark-border hover:border-[#7B61FF]/40 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Past conversations */}
            {studentConvs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">History</p>
                <div className="space-y-1">
                  {studentConvs.slice(-5).reverse().map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveConvId(c.id)}
                      className={`w-full text-left text-xs p-2.5 rounded-xl transition-all ${c.id === activeConvId ? 'bg-[#7B61FF]/10 text-[#7B61FF] border border-[#7B61FF]/20' : 'text-muted-foreground hover:text-foreground bg-white/3 border border-dark-border'}`}
                    >
                      {c.subject} — {c.messages[0]?.content.slice(0, 40) || 'New conversation'}…
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Chat */}
          <div className="lg:col-span-2 plato-card flex flex-col overflow-hidden">
            {!activeConvId ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#7B61FF] to-[#00F0FF] flex items-center justify-center mb-4">
                  <Brain size={40} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground font-display mb-2">Start a conversation</h3>
                <p className="text-sm text-muted-foreground max-w-sm">Select a subject and click "New Conversation" or pick a quick question to get started.</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {(activeConv?.messages || []).map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#4D7CFF] text-white rounded-tr-sm' : 'bg-white/5 border border-dark-border text-foreground rounded-tl-sm'}`}
                      >
                        {msg.role === 'assistant' ? (
                          <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-dark-border px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-[#7B61FF] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-dark-border flex items-center gap-3">
                  <input
                    className="plato-input flex-1"
                    placeholder={`Ask anything about ${selectedSubject}…`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isTyping}
                    className="w-10 h-10 rounded-xl bg-[#7B61FF] text-white flex items-center justify-center hover:bg-[#7B61FF]/90 transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Quiz Generator tab */}
      {activeTab === 'quiz' && (
        <div className="space-y-5">
          <div className="plato-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Generate a Quiz</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Subject</label>
                <select className="plato-input" value={quizSubject} onChange={(e) => setQuizSubject(e.target.value as Subject)}>
                  {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Topic (optional)</label>
                <input className="plato-input" placeholder="e.g. Forces, Organic Chemistry…" value={quizTopic} onChange={(e) => setQuizTopic(e.target.value)} />
              </div>
              <div className="flex items-end">
                <button className="btn-primary w-full justify-center" onClick={generateQuiz}>
                  <Zap size={14} /> Generate Quiz
                </button>
              </div>
            </div>
          </div>

          {quiz && (
            <div className="space-y-4">
              {quiz.map((q, idx) => (
                <div key={idx} className="plato-card p-5">
                  <p className="text-sm font-semibold text-foreground mb-3">Q{idx + 1}. {q.q}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = quizAnswers[idx] === oIdx
                      const isCorrect = quizSubmitted && oIdx === q.answer
                      const isWrong = quizSubmitted && isSelected && oIdx !== q.answer
                      return (
                        <button
                          key={oIdx}
                          onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, [idx]: oIdx })}
                          className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${isCorrect ? 'bg-[#00FFA3]/10 border-[#00FFA3] text-[#00FFA3]' : isWrong ? 'bg-[#FF6B7A]/10 border-[#FF6B7A] text-[#FF6B7A]' : isSelected ? 'bg-[#4D7CFF]/10 border-[#4D7CFF] text-[#4D7CFF]' : 'border-dark-border text-muted-foreground hover:border-[#4D7CFF]/40 hover:text-foreground'}`}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                  {quizSubmitted && (
                    <div className="mt-3 p-3 rounded-xl bg-[#7B61FF]/5 border border-[#7B61FF]/20 text-xs text-muted-foreground">
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              ))}
              {!quizSubmitted ? (
                <button className="btn-primary" onClick={() => setQuizSubmitted(true)}>Submit Quiz</button>
              ) : (
                <div className="plato-card p-4 flex items-center gap-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="font-semibold text-foreground">Score: {Object.entries(quizAnswers).filter(([idx, ans]) => ans === quiz[Number(idx)].answer).length}/{quiz.length}</p>
                    <p className="text-xs text-muted-foreground">+20 XP earned for completing the quiz!</p>
                  </div>
                  <button className="btn-ghost ml-auto border border-dark-border text-sm" onClick={() => { setQuiz(null); setQuizSubmitted(false) }}>
                    <RotateCcw size={13} /> New Quiz
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Flashcards tab */}
      {activeTab === 'flashcards' && (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <select className="plato-input w-48" value={cardSubject} onChange={(e) => setCardSubject(e.target.value as Subject)}>
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <p className="text-xs text-muted-foreground">{flashcards.length} cards · Click to flip</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcards.map((card, idx) => (
              <div
                key={idx}
                onClick={() => setFlipped({ ...flipped, [idx]: !flipped[idx] })}
                className="plato-card p-6 cursor-pointer hover:shadow-card-hover transition-all min-h-36 flex flex-col items-center justify-center text-center"
                style={{ border: flipped[idx] ? '1px solid rgba(123,97,255,0.3)' : undefined, background: flipped[idx] ? 'rgba(123,97,255,0.05)' : undefined }}
              >
                {flipped[idx] ? (
                  <>
                    <p className="text-xs text-[#7B61FF] font-semibold mb-2">ANSWER</p>
                    <p className="text-sm font-medium text-foreground">{card.back}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground font-semibold mb-2">QUESTION</p>
                    <p className="text-sm font-medium text-foreground">{card.front}</p>
                    <p className="text-xs text-muted-foreground mt-3">Click to reveal</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
