import { z } from 'zod'
import { isValidEmail, isValidUaePhone, EMAIL_ERROR, UAE_PHONE_ERROR } from '@/lib/validation'

// Optional UAE phone: empty string is fine (field is optional in most forms),
// but if something was typed it must match the UAE format.
const optionalUaePhone = z.string().refine((v) => !v || isValidUaePhone(v), UAE_PHONE_ERROR)
const requiredUaePhone = z.string().refine((v) => isValidUaePhone(v), UAE_PHONE_ERROR)
const optionalEmail = z.string().refine((v) => !v || isValidEmail(v), EMAIL_ERROR)
const requiredEmail = z.string().refine((v) => isValidEmail(v), EMAIL_ERROR)

export const expenseSchema = z.object({
  category: z.string().min(1),
  description: z.string().trim().min(3, 'Description is too short').max(200),
  amount: z.coerce.number({ message: 'Enter an amount' }).positive('Amount must be greater than 0'),
})

export const userSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short'),
  email: requiredEmail,
  phone: optionalUaePhone,
})

export const leadSchema = z.object({
  studentName: z.string().trim().min(2, 'Name is too short'),
  studentAge: z.string().refine((v) => !v || (Number(v) >= 3 && Number(v) <= 25), 'Age must be between 3 and 25'),
  parentName: z.string().trim().min(2, 'Name is too short'),
  parentEmail: optionalEmail,
  parentPhone: requiredUaePhone,
})

export const invoiceSchema = z.object({
  description: z.string().trim().min(3, 'Description is too short').max(200),
  amount: z.coerce.number({ message: 'Enter an amount' }).positive('Amount must be greater than 0'),
  dueDate: z.string().min(1, 'Due date is required'),
})

export const homeworkSchema = z.object({
  title: z.string().trim().min(3, 'Title is too short').max(150),
  dueDate: z.string().min(1, 'Due date is required'),
  maxMarks: z.coerce.number({ message: 'Enter max marks' }).positive('Max marks must be greater than 0'),
})

export const assessmentSchema = z.object({
  title: z.string().trim().min(3, 'Title is too short').max(150),
  date: z.string().min(1, 'Date is required'),
  maxMarks: z.coerce.number({ message: 'Enter max marks' }).positive('Max marks must be greater than 0'),
  duration: z.coerce.number({ message: 'Enter duration' }).positive('Duration must be greater than 0'),
})

export const batchSchema = z.object({
  name: z.string().trim().min(3, 'Name is too short').max(100),
  grade: z.string().trim().min(1, 'Grade is required'),
  teacherId: z.string().min(1, 'Select a teacher'),
  maxCapacity: z.coerce.number({ message: 'Enter capacity' }).int().min(1, 'Capacity must be at least 1').max(50, 'Capacity cannot exceed 50'),
})

export function getFieldErrors<T extends Record<string, unknown>>(
  schema: z.ZodType<T>,
  data: unknown
): Partial<Record<keyof T, string>> {
  const result = schema.safeParse(data)
  if (result.success) return {}
  const errors: Partial<Record<keyof T, string>> = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof T
    if (!errors[key]) errors[key] = issue.message
  }
  return errors
}
