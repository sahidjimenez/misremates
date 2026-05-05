import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function generateUniqueSlug(base: string, suffix?: string): string {
  const slug = slugify(base)
  if (suffix) return `${slug}-${suffix}`
  return `${slug}-${Math.random().toString(36).slice(2, 7)}`
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function getPlanDisplayName(plan: string): string {
  const names: Record<string, string> = {
    free: 'Gratis',
    basico: 'Básico',
    pro: 'Pro',
    premium: 'Premium',
  }
  return names[plan] ?? plan
}

export function getConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    nuevo: 'Nuevo',
    como_nuevo: 'Como nuevo',
    buen_estado: 'Buen estado',
    usado: 'Usado',
  }
  return labels[condition] ?? condition
}
