import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

mkdirSync('./screenshots', { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const login = async (role) => {
  await page.goto('http://localhost:5176/login')
  await page.waitForSelector('text=Welcome back', { timeout: 15000 })
  await page.click(`button:has-text("${role}")`)
  await page.fill('input[type="password"]', 'demo123')
  await page.click('button[type="submit"]')
}

// ── Login page ────────────────────────────────────────────────────────────────
await page.goto('http://localhost:5176/login')
await page.waitForSelector('text=Welcome back', { timeout: 15000 })
await page.screenshot({ path: './screenshots/01-login.png' })
console.log('✓ Login page')

// ── Student ───────────────────────────────────────────────────────────────────
await login('Student')
await page.waitForURL('**/student**', { timeout: 10000 })
await page.waitForSelector('text=Student Dashboard', { timeout: 10000 })
await page.screenshot({ path: './screenshots/02-student-dashboard.png' })
console.log('✓ Student dashboard')

await page.screenshot({ path: './screenshots/03-student-planet-journey.png', fullPage: true })
console.log('✓ Student planet journey')

await page.click('text=Homework')
await page.waitForSelector('text=Homework', { timeout: 5000 })
await page.screenshot({ path: './screenshots/np01-student-homework.png' })
console.log('✓ Student homework')

await page.click('text=Tests')
await page.waitForTimeout(600)
await page.screenshot({ path: './screenshots/np02-student-tests.png' })
console.log('✓ Student tests')

await page.click('text=Achievements')
await page.waitForTimeout(600)
await page.screenshot({ path: './screenshots/np03-student-achievements.png', fullPage: true })
console.log('✓ Student achievements')

await page.click('text=AI Doubt Solver')
await page.waitForSelector('text=AI Tutor', { timeout: 5000 })
await page.screenshot({ path: './screenshots/04-ai-tutor.png' })
console.log('✓ AI Tutor page')

// ── Super Admin ───────────────────────────────────────────────────────────────
await login('Super Admin')
await page.waitForSelector('text=Executive Overview', { timeout: 10000 })
await page.screenshot({ path: './screenshots/05-super-admin-dashboard.png' })
console.log('✓ Super Admin dashboard')

await page.click('text=Branches')
await page.waitForSelector('text=Dubai Marina Centre', { timeout: 5000 })
await page.screenshot({ path: './screenshots/06-branches.png' })
console.log('✓ Branches page')

await page.click('text=Go Live Setup')
await page.waitForSelector('text=Setup Progress', { timeout: 5000 })
await page.screenshot({ path: './screenshots/07-go-live.png' })
console.log('✓ Go Live page')

// ── Branch Admin ──────────────────────────────────────────────────────────────
await login('Branch Admin')
await page.waitForURL('**/branch-admin**', { timeout: 10000 })
await page.waitForTimeout(800)

await page.click('text=Students')
await page.waitForTimeout(800)
await page.screenshot({ path: './screenshots/np06-branch-students.png' })
console.log('✓ Branch admin students')

await page.click('text=Batches')
await page.waitForTimeout(800)
await page.screenshot({ path: './screenshots/np07-branch-batches.png' })
console.log('✓ Branch admin batches')

// ── Teacher ───────────────────────────────────────────────────────────────────
await login('Teacher')
await page.waitForSelector('text=My Batches', { timeout: 10000 })
await page.screenshot({ path: './screenshots/08-teacher-dashboard.png' })
console.log('✓ Teacher dashboard')

await page.click('text=Classes')
await page.waitForTimeout(800)
await page.screenshot({ path: './screenshots/np04-teacher-classes.png' })
console.log('✓ Teacher classes')

await page.click('text=Student Progress')
await page.waitForTimeout(800)
await page.screenshot({ path: './screenshots/np05-teacher-progress.png' })
console.log('✓ Teacher student progress')

await page.click('text=Attendance')
await page.waitForSelector('text=Mark Attendance', { timeout: 5000 })
await page.screenshot({ path: './screenshots/09-teacher-attendance.png' })
console.log('✓ Teacher attendance')

// ── Sales ─────────────────────────────────────────────────────────────────────
await login('Sales')
await page.waitForSelector('text=Admissions Command Centre', { timeout: 10000 })
await page.screenshot({ path: './screenshots/10-sales-dashboard.png' })
console.log('✓ Sales dashboard')

await page.click('text=Follow-Ups')
await page.waitForTimeout(800)
await page.screenshot({ path: './screenshots/np11-sales-followups.png' })
console.log('✓ Sales follow-ups')

// ── Finance ───────────────────────────────────────────────────────────────────
await login('Finance')
await page.waitForURL('**/finance**', { timeout: 10000 })
await page.waitForTimeout(800)

await page.click('text=Outstanding')
await page.waitForTimeout(800)
await page.screenshot({ path: './screenshots/np10-finance-outstanding.png' })
console.log('✓ Finance outstanding')

// ── Parent ────────────────────────────────────────────────────────────────────
await login('Parent')
await page.waitForURL('**/parent**', { timeout: 10000 })
await page.waitForTimeout(800)

await page.click('text=Attendance')
await page.waitForTimeout(600)
await page.screenshot({ path: './screenshots/np08-parent-attendance.png' })
console.log('✓ Parent attendance')

await page.click('text=Fees')
await page.waitForTimeout(600)
await page.screenshot({ path: './screenshots/np09-parent-fees.png' })
console.log('✓ Parent fees')

// Check console errors
const errors = []
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
if (errors.length > 0) {
  console.warn('Console errors:', errors)
} else {
  console.log('✓ No console errors')
}

await browser.close()
console.log('\n✅ All screenshots captured in ./screenshots/')
