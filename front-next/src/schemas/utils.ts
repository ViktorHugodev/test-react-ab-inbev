import { z } from "zod";

// Regex patterns para validações comuns
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const phoneRegex = /^(\+\d{1,3}\s?)?(\(\d{1,4}\)|\d{1,4})[\s-]?\d{3,4}[\s-]?\d{3,4}$/;
export const documentRegex = /^\d{3}\.?\d{3}\.?\d{3}\-?\d{2}$/;

// Mensagens de erro padronizadas
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

// Funções auxiliares para validações específicas
export const isValidDocument = (document: string): boolean => {
  const cleanDocument = document.replace(/[^\d]/g, "");
  
  if (cleanDocument.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanDocument)) return false;
  
  return documentRegex.test(document);
};

// Função para validar número de telefone brasileiro
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  // Remove caracteres não numéricos
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Verifica se tem entre 10 e 11 dígitos (com e sem o 9)
  if (cleanNumber.length < 10 || cleanNumber.length > 11) {
    return false;
  }
  
  // Verifica se o DDD é válido (entre 11 e 99)
  const ddd = parseInt(cleanNumber.substring(0, 2));
  if (ddd < 11 || ddd > 99) {
    return false;
  }
  
  return true;
};

// Função para obter a data mínima para nascimento (18 anos atrás)
export const getMinBirthDate = (): Date => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date;
};

// Helper para verificar se senhas coincidem
export const passwordsMatch = (
  passwordField: string = 'password',
  confirmField: string = 'confirmPassword'
): z.ZodEffects<z.ZodObject<Record<string, z.ZodString>>> => {
  return z.object({
    [passwordField]: z.string(),
    [confirmField]: z.string()
  }).refine(data => data[passwordField] === data[confirmField], {
    message: VALIDATION_MESSAGES.passwordMatch,
    path: [confirmField]
  });
};