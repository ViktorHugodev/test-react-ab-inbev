import * as z from "zod";

// Schema para formulário de departamento
export const departmentFormSchema = z.object({
  name: z.string().min(2, {
    message: "O nome do departamento deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().min(5, {
    message: "A descrição deve ter pelo menos 5 caracteres.",
  }),
  isActive: z.boolean().default(true),
});

export type DepartmentFormValues = z.infer<typeof departmentFormSchema>;