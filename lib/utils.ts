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

// Format errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatErrors(error: any) {
  //prisma errors
  if (error.code === 'P2002') {
    return `${error.meta.target[0]} already exists`;
  }
  //zod errors
  if (error.name === 'ZodError') {
    const fieldErrors = Object.keys(error.errors).map((field) => error.errors[field].message);
    
    return fieldErrors.join(', ');
  }
  //other errors
  return typeof error.message === 'string' ? error.message : JSON.stringify(error);
}

//Round number to 2 decimal places
export function round2(num: number | string) {
  if (typeof num === 'string') {
    num = parseFloat(num);
  }
  return Math.round(num * 100) / 100;
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
  minimumFractionDigits: 2,
});

export function formatCurrency(number: number ) {
  if (typeof number === 'number') {
    return CURRENCY_FORMATTER.format(number);
  }
 
}

