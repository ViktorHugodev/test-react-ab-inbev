import * as z from "zod";
import { EmployeeRole, PhoneType } from "@/types/employee";

// Função para validar número de telefone brasileiro
export const isAValidNumber = (phoneNumber: string): boolean => {
  // Remove caracteres especiais
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Verifica se tem a quantidade correta de dígitos (10 ou 11)
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

const phoneSchema = z.object({
  number: z.string().refine(isAValidNumber, {
    message: "O telefone deve ser um número brasileiro válido."
  }),
  type: z.nativeEnum(PhoneType, {
    errorMap: () => ({ message: "Selecione um tipo de telefone válido." })
  })
});

export const registerSchema = z.object({
  firstName: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres."
  }),
  lastName: z.string().min(2, {
    message: "O sobrenome deve ter pelo menos 2 caracteres."
  }),
  email: z.string().email({
    message: "Digite um e-mail válido."
  }).refine((email) => email.endsWith('@nossaempresa.com'), {
    message: "O e-mail deve ser corporativo (@nossaempresa.com)."
  }),
  password: z.string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres." })
    .regex(/[A-Z]/, { message: "A senha deve conter pelo menos uma letra maiúscula." })
    .regex(/[a-z]/, { message: "A senha deve conter pelo menos uma letra minúscula." })
    .regex(/[0-9]/, { message: "A senha deve conter pelo menos um número." }),
  confirmPassword: z.string({
    required_error: "A confirmação de senha é obrigatória."
  }),
  documentNumber: z.string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
      message: "O CPF deve estar no formato 000.000.000-00."
    }),
  phoneNumbers: z.array(phoneSchema).min(1, {
    message: "É necessário informar pelo menos um telefone."
  }),
  department: z.enum(["TI", "RH", "Financeiro", "Marketing", "Vendas"], {
    errorMap: () => ({ message: "Selecione um departamento válido." })
  }),
  role: z.nativeEnum(EmployeeRole, {
    errorMap: () => ({ message: "Selecione um cargo válido." })
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"]
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
