import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Merges Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format video duration from ISO 8601 duration string
export function formatDuration(duration: string) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  
  if (!match) return '0:00'
  
  const hours = parseInt((match[1] || '').replace('H', '') || '0')
  const minutes = parseInt((match[2] || '').replace('M', '') || '0')
  const seconds = ((match[3] || '').replace('S', '') || '0').toString()
  
  // Handle cases with no hours and no minutes
  if (hours === 0 && minutes === 0) {
    return `${parseInt(seconds)}`
  }
  
  // Handle cases with no hours
  if (hours === 0) {
    return `${minutes}:${seconds.padStart(2, '0')}`
  }
  
  // Handle cases with all values
  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.padStart(2, '0')}`
}

// Format view count with appropriate suffix (K, M, B)
export function formatViewCount(count: number) {
  if (count >= 1e9) {
    return (count / 1e9).toFixed(1) + 'B'
  }
  if (count >= 1e6) {
    return (count / 1e6).toFixed(1) + 'M'
  }
  if (count >= 1e3) {
    return (count / 1e3).toFixed(1) + 'K'
  }
  return count.toString()
}

// Format relative time (e.g., "2 hours ago", "3 days ago")
export function formatRelativeTime(date: string | Date) {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  }
  
  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds)
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`
    }
  }
  
  return 'just now'
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Generate random color from string (useful for avatar backgrounds)
export function stringToColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF
    color += ('00' + value.toString(16)).substr(-2)
  }
  return color
}

// Debounce function for search inputs etc.
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}