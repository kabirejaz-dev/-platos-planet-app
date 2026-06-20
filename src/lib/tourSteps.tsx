import type { UserRole } from '@/types'

export interface TourStep {
  title: string
  description: string
}

export const TOUR_STEPS: Record<UserRole, TourStep[]> = {
  super_admin: [
    { title: 'Welcome to your Executive Overview', description: 'This is your bird\'s-eye view of every branch, revenue, and enrolment across the whole organisation.' },
    { title: 'Track revenue at a glance', description: 'The KPI cards and Revenue vs Target chart update live from real invoices — no manual reporting needed.' },
    { title: 'Monitor every branch', description: 'Branch Performance shows students, teachers, and revenue per branch so you can spot issues early.' },
    { title: 'Go Live when you\'re ready', description: 'Use Go Live Setup to connect real payment gateways and email providers once you\'re out of demo mode.' },
    { title: 'You\'re all set!', description: 'Explore the sidebar to dive into Academics, Admissions, Finance, and more. Click the ? button anytime to replay this tour.' },
  ],
  branch_admin: [
    { title: 'Welcome to your Branch Dashboard', description: 'This is your home base for managing students, teachers, and attendance at your branch.' },
    { title: 'Add students as they enrol', description: 'Use the Add Student button to bring new students onto the platform and link them to a parent.' },
    { title: 'Keep attendance current', description: 'Mark Today\'s Attendance daily — it feeds straight into reports and parent visibility.' },
    { title: 'Watch for at-risk students', description: 'The Low Attendance panel flags students who need a follow-up before it becomes a bigger problem.' },
    { title: 'You\'re all set!', description: 'Explore Students, Batches, Fees and Requests from the sidebar. Click the ? button anytime to replay this tour.' },
  ],
  sales: [
    { title: 'Welcome to your Admissions Command Centre', description: 'Track every lead from first enquiry through to enrolment in one place.' },
    { title: 'Add new leads as they come in', description: 'Use Add Lead to capture enquiries from website, walk-ins, referrals, and WhatsApp.' },
    { title: 'Work your pipeline', description: 'The Sales Kanban board lets you move leads through stages — drag a card to update its status.' },
    { title: 'Never miss a follow-up', description: 'The Follow-Ups page shows everyone due for a call today, with one-tap WhatsApp and phone shortcuts.' },
    { title: 'You\'re all set!', description: 'Explore Leads, Follow-Ups, and Reports from the sidebar. Click the ? button anytime to replay this tour.' },
  ],
  teacher: [
    { title: 'Welcome, let\'s get you oriented', description: 'This is your teaching command centre — classes, homework, and assessments all in one place.' },
    { title: 'Mark attendance in seconds', description: 'Today\'s Classes lets you mark attendance for each batch with one tap per student.' },
    { title: 'Set and grade homework', description: 'Assign homework from the Homework page and grade submissions as they come in.' },
    { title: 'Track every student\'s progress', description: 'My Students shows attendance and performance trends so you can spot who needs support.' },
    { title: 'You\'re all set!', description: 'Explore Classes, Homework, Tests, and Messages from the sidebar. Click the ? button anytime to replay this tour.' },
  ],
  coordinator: [
    { title: 'Welcome to your Academic Excellence Centre', description: 'Oversee curriculum coverage, assessments, and teacher performance across your branch.' },
    { title: 'Create and track assessments', description: 'Use Create Assessment to schedule tests, then review results as they\'re graded.' },
    { title: 'Support at-risk students', description: 'The Intervention Required panel highlights students who need an academic support plan.' },
    { title: 'Review your teaching team', description: 'Use Teacher Reviews to log observations and keep performance conversations on record.' },
    { title: 'You\'re all set!', description: 'Explore Assessments, Results, Interventions, and Reviews from the sidebar. Click the ? button anytime to replay this tour.' },
  ],
  finance: [
    { title: 'Welcome to your Financial Command Centre', description: 'This is where you manage invoices, payments, and collections.' },
    { title: 'Create invoices for students', description: 'Use Create Invoice to bill a student for a term, programme, or one-off charge.' },
    { title: 'Track outstanding payments', description: 'The Outstanding tab shows every pending and overdue invoice with an aging breakdown.' },
    { title: 'Record a payment', description: 'When cash or a bank transfer comes in, record it here to keep balances accurate and issue a receipt.' },
    { title: 'You\'re all set!', description: 'Explore Invoices, Payment Plans, Expenses, and VAT Reports from the sidebar. Click the ? button anytime to replay this tour.' },
  ],
  parent: [
    { title: 'Welcome to your Parent Dashboard', description: 'Keep track of your child\'s classes, homework, grades, and fees in one place.' },
    { title: 'This Week at a Glance', description: 'See attendance, pending homework, and the latest grade for your child without digging through menus.' },
    { title: 'Pay fees online', description: 'Use Pay Now on the Fees page to settle an invoice and see your payment history.' },
    { title: 'Message a teacher directly', description: 'Use Message Teacher to reach your child\'s teacher in-app or via WhatsApp.' },
    { title: 'You\'re all set!', description: 'Explore Fees, Messages, Meetings, and Progress from the sidebar. Click the ? button anytime to replay this tour.' },
  ],
  student: [
    { title: 'Welcome to Plato\'s Planet!', description: 'Your dashboard tracks your homework, classes, and progress as you journey through the planets.' },
    { title: 'Stay on top of homework', description: 'Check the Homework page for what\'s due and submit your work before the deadline.' },
    { title: 'Ask the AI Tutor anything', description: 'Stuck on a topic? The AI Tutor can explain it, quiz you, or make flashcards.' },
    { title: 'Check your results', description: 'See your grades and progress over time on the Exams & Results page.' },
    { title: 'You\'re all set!', description: 'Explore your dashboard and keep your streak going. Click the ? button anytime to replay this tour.' },
  ],
  ai_tutor: [
    { title: 'Welcome to your AI Tutor', description: 'Ask any question and get an instant, subject-specific explanation.' },
    { title: 'Generate a quiz', description: 'Use the Quiz Generator tab to test yourself on any topic before an exam.' },
    { title: 'Build flashcards', description: 'The Flashcards tab helps you revise key facts — create your own cards for any subject.' },
    { title: 'Save useful answers', description: 'Bookmark any answer so you can find it again later.' },
    { title: 'You\'re all set!', description: 'Ask your first question whenever you\'re ready. Click the ? button anytime to replay this tour.' },
  ],
}
