import * as z from "zod";
import { EmployeeRole, PhoneType } from "@/types/employee";
import { isAValidNumber } from "@/lib/utils";

// Validation for phone numbers
export const phoneSchema = z.object({
  id: z.string().optional(),
  number: z
    .string()
    .min(8, {
      message: "O número de telefone deve ter pelo menos 8 dígitos",
    })
    .refine(isAValidNumber, {
      message: "Selecione um tipo de telefone válido",
    }),
  type: z.nativeEnum(PhoneType),
});

// Schema para validação de funcionário
export const employeeSchema = z.object({
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
  documentNumber: z
    .string()
    .min(11, {
      message: "O número do documento deve ter pelo menos 11 caracteres",
    }),
  phoneNumbers: z
    .array(phoneSchema)
    .min(1, {
      message: "Adicione pelo menos um telefone",
    }),
  birthDate: z
    .date({
      required_error: "A data de nascimento é obrigatória",
      invalid_type_error: "A data de nascimento deve ser válida",
    })
    .refine((date) => {
      const today = new Date();
      const birthDate = new Date(date);
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18;
    }, {
      message: "O funcionário deve ter pelo menos 18 anos",
    }),
  department: z.string({
    required_error: "Selecione um departamento",
  }),
  password: z
    .string()
    .min(8, {
      message: "A senha deve ter pelo menos 8 caracteres",
    })
    .regex(/[A-Z]/, {
      message: "A senha deve conter pelo menos uma letra maiúscula",
    })
    .regex(/[0-9]/, {
      message: "A senha deve conter pelo menos um número",
    })
    .regex(/[^a-zA-Z0-9]/, {
      message: "A senha deve conter pelo menos um caractere especial",
    }),
  role: z.nativeEnum(EmployeeRole, {
    required_error: "Selecione um cargo válido",
  }),
});

// Função para validar os dados do funcionário
export function validateEmployeeData(values: unknown) {
  try {
    // Converte a data de nascimento para um objeto Date
    if (values && typeof values === "object" && "birthDate" in values) {
      const birthDate = values.birthDate;
      if (birthDate && typeof birthDate === "string") {
        (values as any).birthDate = new Date(birthDate);
      }
    }

    // Valida os números de telefone
    if (values && typeof values === "object" && "phoneNumbers" in values) {
      const phoneNumbers = values.phoneNumbers;
      if (Array.isArray(phoneNumbers)) {
        phoneNumbers.forEach((phone) => {
          if (phone && typeof phone === "object" && "number" in phone) {
            if (!isAValidNumber(phone.number)) {
              throw new Error("Número de telefone inválido");
            }
          }
        });
      }
    }

    return employeeSchema.parse(values);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.format() };
    }
    return { error };
  }
}
