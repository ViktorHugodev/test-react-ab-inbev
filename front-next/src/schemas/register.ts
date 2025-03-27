import * as z from "zod";
import { EmployeeRole } from "@/types/employee";
import { nameSchema, corporateEmailSchema, formattedDocumentSchema, passwordSchema, phoneObjectSchema } from "./common";

// Schema para registro de novo usuário
export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: corporateEmailSchema,
  password: passwordSchema,
  confirmPassword: z.string({
    required_error: "A confirmação de senha é obrigatória."
  }),
  documentNumber: formattedDocumentSchema,
  phoneNumbers: z.array(phoneObjectSchema).min(1, {
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