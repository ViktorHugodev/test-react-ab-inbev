import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Employee, PhoneType, UnifiedUserData } from "@/types/employee";
import { CurrentUserResponse } from "@/services/auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getInitials(name: string): string {
  if (!name || name.trim() === '') return '?';
  
  const nameParts = name.trim().split(' ').filter(Boolean);
  
  if (nameParts.length === 0) return '?';
  
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }
  
  const firstInitial = nameParts[0].charAt(0);
  const lastInitial = nameParts[nameParts.length - 1].charAt(0);
  
  return `${firstInitial}${lastInitial}`.toUpperCase();
}

// Function to validate phone numbers
export function isAValidNumber(phoneNumber: string): boolean {
  // Remove non-numeric characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Check if it has between 10 and 11 digits (with and without the 9)
  if (cleanNumber.length < 10 || cleanNumber.length > 11) {
    return false;
  }
  
  // Check if the DDD is valid (between 11 and 99)
  const ddd = parseInt(cleanNumber.substring(0, 2));
  if (ddd < 11 || ddd > 99) {
    return false;
  }
  
  return true;
}


export function normalizeUserData(
  userData: Employee | CurrentUserResponse | null | undefined
): UnifiedUserData | null {
  if (!userData) return null;

  
  if ('name' in userData && !('firstName' in userData)) {
    const nameParts = userData.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    return {
      id: userData.id,
      firstName: firstName,
      lastName: lastName,
      fullName: userData.name,
      email: userData.email,
      role: typeof userData.role === 'string' ? parseInt(userData.role) : userData.role,
      phoneNumbers: []
    };
  }
  
  
  const employee = userData as Employee;
  
  return {
    id: employee.id || '',
    firstName: employee.firstName || '',
    lastName: employee.lastName || '',
    fullName: employee.fullName || `${employee.firstName} ${employee.lastName}`.trim(),
    email: employee.email || '',
    role: typeof employee.role === 'string' 
      ? parseInt(employee.role) 
      : (typeof employee.role === 'number' ? employee.role : Number(employee.role)),
    documentNumber: employee.documentNumber,
    birthDate: employee.birthDate instanceof Date 
      ? employee.birthDate 
      : employee.birthDate ? new Date(employee.birthDate) : undefined,
    age: employee.age,
    department: employee.department,
    phoneNumbers: Array.isArray(employee.phoneNumbers) 
      ? employee.phoneNumbers.map(phone => ({
          id: phone.id,
          number: phone.number || '',
          type: phone.type || PhoneType.Mobile
        }))
      : []
  };
}


export function toISODateString(date: Date | string | undefined): string | undefined {
  if (!date) return undefined;
  
  if (typeof date === 'string') {
    try {
      return new Date(date).toISOString();
    } catch (e) {
      return date;
    }
  }
  
  return date.toISOString();
}


export function isValidGuid(str: string): boolean {
  if (!str) return false;
  
  
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return guidRegex.test(str);
}
