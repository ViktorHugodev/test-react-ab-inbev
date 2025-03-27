"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, Mail, Lock, User, Building, UserCog, AlertTriangle } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { EmployeeRole, PhoneType } from "@/types/employee";

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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RegisterFormValues, registerSchema } from '@/schemas/register';
import { PhoneFieldArray } from "@/components/shared/forms/phone-field";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, registerEmployee, canCreateRole } = useAuth();
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    setHasPermission(user?.role === EmployeeRole.Director);
  }, [user]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      documentNumber: "",
      phoneNumbers: [{ number: "", type: PhoneType.Mobile }],
      department: "TI",
      role: EmployeeRole.Employee,
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);

    try {
      if (!hasPermission) {
        throw new Error("Você não tem permissão para registrar funcionários");
      }

      if (!canCreateRole(values.role)) {
        throw new Error("Você não pode criar funcionários com este nível de acesso");
      }

      
      const validPhoneNumbers = values.phoneNumbers
        .filter(phone => phone.number && phone.type) 
        .map(phone => ({
          number: phone.number as string, 
          type: phone.type as PhoneType   
        }));

      if (validPhoneNumbers.length === 0) {
        throw new Error("É necessário informar pelo menos um telefone válido");
      }

      await registerEmployee({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        documentNumber: values.documentNumber,
        phoneNumbers: validPhoneNumbers,
        department: values.department,
        role: values.role
      });

      toast.success("Funcionário cadastrado com sucesso!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao cadastrar funcionário");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!hasPermission) {
    return (
      <Card className="w-full max-w-lg shadow-lg rounded-4xl border-none bg-gradient-to-b from-card to-card/80 transition-all duration-300">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Acesso Restrito</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Acesso Negado</AlertTitle>
            <AlertDescription>
              Apenas Diretores podem registrar novos funcionários no sistema.
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl"
            >
              Voltar para o Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg shadow-lg rounded-4xl border-none bg-gradient-to-b from-card to-card/80 transition-all duration-300">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Cadastrar Funcionário</CardTitle>
        <CardDescription className="text-center">
          Preencha os dados abaixo para cadastrar um novo funcionário
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Nome</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Nome do funcionário" 
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
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Sobrenome</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Sobrenome do funcionário" 
                          className="pl-10 rounded-xl border-input" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
                        placeholder="email@nossaempresa.com" 
                        className="pl-10 rounded-xl border-input" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Confirmar Senha</FormLabel>
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
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="documentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">CPF</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="000.000.000-00" 
                          className="pl-10 rounded-xl border-input" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <PhoneFieldArray />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Departamento</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <div className="relative">
                          <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <SelectTrigger className="pl-10 rounded-xl border-input">
                            <SelectValue placeholder="Selecione um departamento" />
                          </SelectTrigger>
                        </div>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TI">TI</SelectItem>
                        <SelectItem value="RH">RH</SelectItem>
                        <SelectItem value="Financeiro">Financeiro</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Vendas">Vendas</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Cargo</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(Number(value))} 
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <div className="relative">
                          <UserCog className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <SelectTrigger className="pl-10 rounded-xl border-input">
                            <SelectValue placeholder="Selecione um cargo" />
                          </SelectTrigger>
                        </div>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={EmployeeRole.Employee.toString()}>Funcionário</SelectItem>
                        <SelectItem value={EmployeeRole.Leader.toString()}>Líder</SelectItem>
                        {user?.role === EmployeeRole.Director && (
                          <SelectItem value={EmployeeRole.Director.toString()}>Diretor</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar Funcionário"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 border-t pt-4">
        <div className="text-center text-sm text-muted-foreground">
          <p>
            <Link href="/dashboard" className="text-primary hover:underline">
              Voltar para o Dashboard
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
