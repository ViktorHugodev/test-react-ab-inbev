import * as z from "zod";
import { EmployeeRole, PhoneType } from "@/types/employee";

// Validação para a data mínima de nascimento (18 anos)
const getMinBirthDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date;
};

// Esquema de validação para telefone
export const phoneSchema = z.object({
  id: z.string().optional(),
  number: z.string().min(8, {
    message: "O número de telefone deve ter pelo menos 8 dígitos",
  }),
  type: z.nativeEnum(PhoneType, {
    errorMap: () => ({ message: "Selecione um tipo de telefone válido" }),
  }),
});

// Esquema de validação para novo funcionário
export const createEmployeeSchema = z.object({
  firstName: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres",
  }),
  lastName: z.string().min(2, {
    message: "O sobrenome deve ter pelo menos 2 caracteres",
  }),
  email: z.string().email({
    message: "Digite um email válido",
  }),
  documentNumber: z.string().min(8, {
    message: "O número do documento deve ter pelo menos 8 caracteres",
  }),
  phoneNumbers: z.array(phoneSchema).min(1, {
    message: "Adicione pelo menos um telefone",
  }),
  birthDate: z.date({
    required_error: "A data de nascimento é obrigatória",
    invalid_type_error: "A data de nascimento deve ser válida",
  }).refine((date) => date <= getMinBirthDate(), {
    message: "O funcionário deve ter pelo menos 18 anos",
  }),
  department: z.string({
    required_error: "Selecione um departamento",
  }),
  managerId: z.string().optional(),
  password: z.string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres" })
    .regex(/[A-Z]/, { message: "A senha deve conter pelo menos uma letra maiúscula" })
    .regex(/[0-9]/, { message: "A senha deve conter pelo menos um número" })
    .regex(/[^a-zA-Z0-9]/, { message: "A senha deve conter pelo menos um caractere especial" }),
  role: z.nativeEnum(EmployeeRole, {
    errorMap: () => ({ message: "Selecione um cargo válido" }),
  }),
});

// Tipo para os valores do formulário
export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;

// Conversor de valores do formulário para o DTO da API
export const formValuesToCreateEmployeeDTO = (values: CreateEmployeeFormValues) => {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    documentNumber: values.documentNumber,
    birthDate: values.birthDate.toISOString(),
    password: values.password,
    role: values.role,
    department: values.department,
    managerId: values.managerId || undefined,
    phoneNumbers: values.phoneNumbers.map(phone => ({
      number: phone.number,
      type: phone.type
    }))
  };
};