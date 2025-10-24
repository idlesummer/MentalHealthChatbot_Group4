import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimestamp(ts: number) {
  const date = new Date(ts)
  const isToday = date.toDateString() === new Date().toDateString()

  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    month: isToday ? undefined : 'short',
    day: isToday ? undefined : 'numeric',
  })
}

export async function delay(ms: number ) {
  return new Promise(res => setTimeout(res, ms))
}

export function rand(min: number, max: number): number { 
  return Math.random() * (max - min) + min
}
