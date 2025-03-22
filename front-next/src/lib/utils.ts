import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extrai as iniciais de um nome completo
 * @param name Nome completo
 * @returns Iniciais (máximo de 2 caracteres)
 */
export function getInitials(name: string): string {
  if (!name || name.trim() === '') return '?';
  
  const nameParts = name.trim().split(' ').filter(Boolean);
  
  if (nameParts.length === 0) return '?';
  
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }
  
  // Pega a primeira letra do primeiro e último nome
  const firstInitial = nameParts[0].charAt(0);
  const lastInitial = nameParts[nameParts.length - 1].charAt(0);
  
  return `${firstInitial}${lastInitial}`.toUpperCase();
}
