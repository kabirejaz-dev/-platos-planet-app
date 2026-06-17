import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
mkdirSync('./screenshots', { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

// ── Student: homework
await page.goto('http://localhost:5175/login')
await page.click('button:has-text("Student")')
await page.fill('input[type="password"]', 'demo123')
await page.click('button[type="submit"]')
await page.waitForURL('**/student**', { timeout: 10000 })
await page.click('text=Homework')
await page.waitForSelector('text=Homework', { timeout: 5000 })
await page.waitForTimeout(600)
await page.screenshot({ path: './screenshots/np01-student-homework.png' })
console.log('✓ Student Homework')

await page.click('text=Tests')
await page.waitForTimeout(600)
await page.screenshot({ path: './screenshots/np02-student-tests.png' })
console.log('✓ Student Tests')

await page.click('text=Achievements')
await page.waitForTimeout(600)
await page.screenshot({ path: './screenshots/np03-student-achievements.png' })
console.log('✓ Student Achievements')

// ── Teacher: classes & progress
await page.goto('http://localhost:5175/login')
await page.click('button:has-text("Teacher")')
await page.fill('input[type="password"]', 'demo123')
await page.click('button[type="submit"]')
await page.waitForSelector('text=My Batches', { timeout: 10000 })
await page.click('text=My Classes')
await page.waitForTimeout(600)
await page.screenshot({ path: './screenshots/np04-teacher-classes.png' })
console.log('✓ Teacher Classes')

await page.click('text=Student Progress')
await page.waitForTimeout(800)
await page.screenshot({ path: './screenshots/np05-teacher-progress.png' })
console.log('✓ Teacher Student Progress')

// ── Branch admin: students & batches
await page.goto('http://localhost:5175/login')
await page.click('button:has-text("Branch Admin")')
await page.fill('input[type="password"]', 'demo123')
await page.click('button[type="submit"]')
await page.waitForTimeout(800)
await page.click('text=Students')
await page.waitForTimeout(600)
await page.screenshot({ path: './screenshots/np06-branch-students.png' })
console.log('✓ Branch Admin Students')

await page.click('text=Batches')
await page.waitForTimeout(600)
await page.screenshot({ path: './screenshots/np07-branch-batches.png' })
console.log('✓ Branch Admin Batches')

// ── Parent: attendance, fees
await page.goto('http://localhost:5175/login')
await page.click('button:has-text("Parent")')
await page.fill('input[type="password"]', 'demo123')
await page.click('button[type="submit"]')
await page.waitForTimeout(800)
await page.click('text=Attendance')
await page.waitForTimeout(600)
await page.screenshot({ path: './screenshots/np08-parent-attendance.png' })
console.log('✓ Parent Attendance')

await page.click('text=Fees')
await page.waitForTimeout(600)
await page.screenshot({ path: './screenshots/np09-parent-fees.png' })
console.log('✓ Parent Fees')

// ── Finance: outstanding
await page.goto('http://localhost:5175/login')
await page.click('button:has-text("Finance")')
await page.fill('input[type="password"]', 'demo123')
await page.click('button[type="submit"]')
await page.waitForTimeout(800)
await page.click('text=Outstanding')
await page.waitForTimeout(600)
await page.screenshot({ path: './screenshots/np10-finance-outstanding.png' })
console.log('✓ Finance Outstanding')

// ── Sales: follow-ups
await page.goto('http://localhost:5175/login')
await page.click('button:has-text("Sales")')
await page.fill('input[type="password"]', 'demo123')
await page.click('button[type="submit"]')
await page.waitForTimeout(800)
await page.click('text=Follow-Ups')
await page.waitForTimeout(600)
await page.screenshot({ path: './screenshots/np11-sales-followups.png' })
console.log('✓ Sales Follow-Ups')

await browser.close()
console.log('\n✅ New pages screenshots done!')
