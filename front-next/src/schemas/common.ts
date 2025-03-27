import { z } from "zod";
import { phoneRegex, documentRegex, VALIDATION_MESSAGES, isValidPhoneNumber } from "./utils";
import { PhoneType } from "@/types/employee";

// Schema para nome
export const nameSchema = z.string()
  .min(2, { message: VALIDATION_MESSAGES.minLength(2) })
  .max(50, { message: VALIDATION_MESSAGES.maxLength(50) });

// Schema para email
export const emailSchema = z.string()
  .min(1, { message: VALIDATION_MESSAGES.required })
  .email({ message: VALIDATION_MESSAGES.email });


export const corporateEmailSchema = emailSchema
  .refine((email) => email.endsWith('@nossaempresa.com'), {
    message: "O e-mail deve ser corporativo (@nossaempresa.com)."
  });

// Schema para telefone
export const phoneSchema = z.string()
  .min(1, { message: VALIDATION_MESSAGES.required })
  .regex(phoneRegex, { message: VALIDATION_MESSAGES.phone });

// Schema para documento (CPF)
export const documentSchema = z.string()
  .min(1, { message: VALIDATION_MESSAGES.required })
  .regex(documentRegex, { message: VALIDATION_MESSAGES.document });

// Schema formatado para documento (CPF)
export const formattedDocumentSchema = z.string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: "O CPF deve estar no formato 000.000.000-00."
  });

// Schema para senha
export const passwordSchema = z.string()
  .min(8, { message: VALIDATION_MESSAGES.minLength(8) })
  .max(100, { message: VALIDATION_MESSAGES.maxLength(100) })
  .regex(/[A-Z]/, { message: "Deve conter pelo menos uma letra maiúscula" })
  .regex(/[a-z]/, { message: "Deve conter pelo menos uma letra minúscula" })
  .regex(/[0-9]/, { message: "Deve conter pelo menos um número" })
  .regex(/[^A-Za-z0-9]/, { message: "Deve conter pelo menos um caractere especial" });

// Schema simplificado para senha (usado em login)
export const simplePasswordSchema = z.string()
  .min(6, { message: "A senha deve ter pelo menos 6 caracteres." });

// Função para verificar se as senhas coincidem
export const passwordsMatch = (password: string, confirmPassword: string) => {
  return password === confirmPassword;
};

// Schema para objeto de telefone
export const phoneObjectSchema = z.object({
  id: z.string().optional(),
  number: z.string().refine(isValidPhoneNumber, {
    message: "O telefone deve ser um número brasileiro válido."
  }),
  type: z.nativeEnum(PhoneType, {
    errorMap: () => ({ message: "Selecione um tipo de telefone válido." })
  })
});