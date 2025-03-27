"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";

import { loginSchema, LoginFormValues } from "@/schemas/auth";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface LoginFormProps {
  variant?: "simple" | "card";
  containerClassName?: string;
  onSuccess?: () => void;
}

export function LoginForm({ 
  variant = "simple",
  containerClassName,
  onSuccess
}: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    if (isSubmitting) return; // Evita múltiplos envios
    
    setIsSubmitting(true);
    setIsLoading(true);

    try {
      await login(values.email, values.password);
      toast.success("Login realizado com sucesso");
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Aumentando o tempo de redirecionamento para dar feedback visual ao usuário
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Email ou senha inválidos");
      console.error(error);
    } finally {
      // Só resetamos os estados no catch, pois no caso de sucesso queremos manter o botão desabilitado durante o redirecionamento
      if (!onSuccess) {
        setTimeout(() => {
          setIsSubmitting(false);
          setIsLoading(false);
        }, 1500); // Tempo ligeiramente maior que o redirecionamento para garantir que o botão permaneça desabilitado
      } else {
        setIsSubmitting(false);
        setIsLoading(false);
      }
    }
  }

  
  if (variant === "simple") {
    return (
      <div className={containerClassName}>
        <Form {...form}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(onSubmit)(e);
            }} 
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="seu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300" 
              disabled={isLoading || isSubmitting || form.formState.isSubmitting}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <p>Credenciais de exemplo: admin@companymanager.com / Admin@123</p>
            </div>
          </form>
        </Form>
      </div>
    );
  }

  
  return (
    <div className={containerClassName}>
      <Form {...form}>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(onSubmit)(e);
          }} 
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">E-mail</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="seu@email.com" 
                      className="pl-10 rounded-xl border-input" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Senha</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="password" 
                      placeholder="******" 
                      className="pl-10 rounded-xl border-input" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300" 
            disabled={isLoading || isSubmitting || form.formState.isSubmitting}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm text-muted-foreground mt-4">
        <p>Credenciais de exemplo: admin@companymanager.com / Admin@123</p>
      </div>
    </div>
  );
}