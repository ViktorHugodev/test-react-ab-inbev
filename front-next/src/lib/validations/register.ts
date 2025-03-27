import * as z from "zod";
import { EmployeeRole, PhoneType } from "@/types/employee";
import { isAValidNumber } from '../utils';

export const phoneSchema = z.object({
  id: z.string().optional(),
  number: z
    .string()
    .min(8)
    .refine(isAValidNumber, {
      message: "O número de telefone deve ser um número brasileiro válido",
    }),
  type: z.nativeEnum(PhoneType, {
    required_error: "Selecione um tipo de telefone válido",
  }),
});

export const registerEmployeeSchema = z.object({
  firstName: z
    .string()
    .min(2, {
      message: "O nome deve ter pelo menos 2 caracteres",
    }),
  lastName: z
    .string()
    .min(2, {
      message: "O sobrenome deve ter pelo menos 2 caracteres",
    }),
  email: z
    .string()
    .email({
      message: "Digite um email válido",
    }),
  password: z
    .string()
    .min(8, {
      message: "A senha deve ter pelo menos 8 caracteres",
    })
    .regex(/[A-Z]/, {
      message: "A senha deve conter pelo menos uma letra maiúscula",
    })
    .regex(/[a-z]/, {
      message: "A senha deve conter pelo menos uma letra minúscula",
    })
    .regex(/[0-9]/, {
      message: "A senha deve conter pelo menos um número",
    }),
  confirmPassword: z.string({
    required_error: "A confirmação de senha é obrigatória",
  }),
  documentNumber: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
      message: "O CPF deve estar no formato 000.000.000-00",
    }),
  phoneNumbers: z
    .array(phoneSchema)
    .min(1, {
      message: "É necessário informar pelo menos um telefone válido",
    }),
  department: z.string().refine((val) => ["Financeiro", "Vendas"].includes(val), {
    message: "Selecione um departamento válido",
  }),
  role: z.nativeEnum(EmployeeRole, {
    required_error: "Selecione um cargo válido",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

// Função para validar os dados de registro
export function validateRegisterData(values: unknown) {
  try {
    return registerEmployeeSchema.parse(values);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.format() };
    }
    return { error };
  }
}
