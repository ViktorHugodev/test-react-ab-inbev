import * as z from "zod";
import { EmployeeRole, PhoneType } from "@/types/employee";
import { getMinBirthDate } from "./utils";
import { 
  nameSchema, 
  emailSchema, 
  documentSchema, 
  passwordSchema, 
  phoneObjectSchema 
} from "./common";


export const createEmployeeSchema = z.object({
  firstName: nameSchema.min(2, {
    message: "O nome deve ter pelo menos 2 caracteres",
  }),
  lastName: nameSchema.min(2, {
    message: "O sobrenome deve ter pelo menos 2 caracteres",
  }),
  email: emailSchema,
  documentNumber: documentSchema.min(8, {
    message: "O número do documento deve ter pelo menos 8 caracteres",
  }),
  phoneNumbers: z.array(phoneObjectSchema).min(1, {
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
  password: passwordSchema,
  role: z.nativeEnum(EmployeeRole, {
    errorMap: () => ({ message: "Selecione um cargo válido" }),
  }),
});

export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;


export const updateEmployeeSchema = z.object({
  id: z.string(),
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  documentNumber: documentSchema.optional(),
  phoneNumbers: z.array(phoneObjectSchema).min(1, {
    message: "Adicione pelo menos um telefone",
  }),
  birthDate: z.date({
    required_error: "A data de nascimento é obrigatória",
    invalid_type_error: "A data de nascimento deve ser válida",
  }),
  department: z.string({
    required_error: "Selecione um departamento",
  }),
  managerId: z.string().optional(),
  role: z.nativeEnum(EmployeeRole, {
    errorMap: () => ({ message: "Selecione um cargo válido" }),
  }),
});

export type UpdateEmployeeFormValues = z.infer<typeof updateEmployeeSchema>;


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


export const personalInfoSchema = z.object({
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  birthDate: z.date({
    required_error: "Data de nascimento é obrigatória",
  }),
  documentNumber: z.string().optional(),
  age: z.number().nullable().optional(),
  role: z.number().optional(),
  department: z.string().optional(),
  phoneNumbers: z.array(
    z.object({
      id: z.string().optional(),
      number: z.string().min(8, "Número de telefone deve ter pelo menos 8 dígitos"),
      type: z.nativeEnum(PhoneType),
    })
  ),
});

export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;