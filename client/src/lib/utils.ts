import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, formatDistanceToNow as fnsFormatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string, formatStr: string = "PPP"): string {
  try {
    return format(parseISO(dateString), formatStr)
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString
  }
}

export function formatDistanceToNow(date: Date): string {
  try {
    return fnsFormatDistanceToNow(date, { addSuffix: false })
  } catch (error) {
    console.error("Error formatting distance:", error)
    return ""
  }
}
