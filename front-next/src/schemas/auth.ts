import * as z from "zod";
import { emailSchema, simplePasswordSchema, passwordSchema } from "./common";

// Schema para formulário de login
export const loginSchema = z.object({
  email: emailSchema,
  password: simplePasswordSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Schema para alteração de senha
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(8, "Senha atual deve ter pelo menos 8 caracteres"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(8, "Confirmação de senha deve ter pelo menos 8 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Senhas não conferem",
    path: ["confirmNewPassword"],
  });

export type PasswordFormValues = z.infer<typeof passwordChangeSchema>;

// Schema para recuperação de senha
export const passwordResetSchema = z.object({
  email: emailSchema,
  code: z.string().min(6, "Código de verificação inválido").max(6),
  password: passwordSchema,
  confirmPassword: z.string(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "As senhas não coincidem",
      path: ["confirmPassword"],
    });
  }
});