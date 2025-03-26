import { z } from "zod";

// Common regex patterns
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const phoneRegex = /^(\+\d{1,3}\s?)?(\(\d{1,4}\)|\d{1,4})[\s-]?\d{3,4}[\s-]?\d{3,4}$/;
export const documentRegex = /^\d{3}\.?\d{3}\.?\d{3}\-?\d{2}$/; // CPF format

// Common validation error messages
export const VALIDATION_MESSAGES = {
  required: "Campo obrigatório",
  email: "Email inválido",
  minLength: (min: number) => `Deve ter pelo menos ${min} caracteres`,
  maxLength: (max: number) => `Deve ter no máximo ${max} caracteres`,
  phone: "Número de telefone inválido",
  document: "Documento inválido",
  password: "A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais",
  passwordMatch: "As senhas não coincidem",
};

// Common schema fragments
export const nameSchema = z.string()
  .min(2, { message: VALIDATION_MESSAGES.minLength(2) })
  .max(50, { message: VALIDATION_MESSAGES.maxLength(50) });

export const emailSchema = z.string()
  .min(1, { message: VALIDATION_MESSAGES.required })
  .email({ message: VALIDATION_MESSAGES.email });

export const phoneSchema = z.string()
  .min(1, { message: VALIDATION_MESSAGES.required })
  .regex(phoneRegex, { message: VALIDATION_MESSAGES.phone });
  
export const documentSchema = z.string()
  .min(1, { message: VALIDATION_MESSAGES.required })
  .regex(documentRegex, { message: VALIDATION_MESSAGES.document });

export const passwordSchema = z.string()
  .min(8, { message: VALIDATION_MESSAGES.minLength(8) })
  .max(100, { message: VALIDATION_MESSAGES.maxLength(100) })
  .regex(/[A-Z]/, { message: "Deve conter pelo menos uma letra maiúscula" })
  .regex(/[a-z]/, { message: "Deve conter pelo menos uma letra minúscula" })
  .regex(/[0-9]/, { message: "Deve conter pelo menos um número" })
  .regex(/[^A-Za-z0-9]/, { message: "Deve conter pelo menos um caractere especial" });

// Helper to validate matching passwords
export const passwordsMatch = (
  passwordField: string = 'password',
  confirmField: string = 'confirmPassword'
) => {
  return z.object({
    [passwordField]: z.string(),
    [confirmField]: z.string()
  }).refine(data => data[passwordField] === data[confirmField], {
    message: VALIDATION_MESSAGES.passwordMatch,
    path: [confirmField]
  });
};

// Helper function to validate phone numbers
export function isValidPhoneNumber(phoneNumber: string): boolean {
  return phoneRegex.test(phoneNumber);
}

// Helper function to validate document numbers (CPF)
export function isValidDocument(document: string): boolean {
  const cleanDocument = document.replace(/[^\d]/g, "");
  
  if (cleanDocument.length !== 11) return false;
  
  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cleanDocument)) return false;
  
  // Simple validation logic (could be enhanced with actual CPF validation algorithm)
  return documentRegex.test(document);
}