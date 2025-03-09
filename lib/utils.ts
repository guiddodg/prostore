import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert prisma object into a regular js object
export function convertToPlainObject<T>(obj: T):T {
  return JSON.parse(JSON.stringify(obj))
}

// Format number with decimal places
export function formatNumberWithDecimalPlaces(num: number):string {
  const [int,decimal]=num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2,'0')}` : `${int}.00`;
}
