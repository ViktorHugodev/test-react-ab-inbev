import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as z from "zod";

import { Employee, PhoneType } from "@/types/employee";
import { CurrentUserResponse } from "@/lib/api/auth";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Personal information form schema
const personalInfoSchema = z.object({
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  birthDate: z.date({
    required_error: "Data de nascimento é obrigatória",
  }),
  phoneNumbers: z.array(
    z.object({
      id: z.string().optional(),
      number: z.string().min(8, "Número de telefone deve ter pelo menos 8 dígitos"),
      type: z.nativeEnum(PhoneType),
    })
  ),
});

export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

interface PersonalInfoFormProps {
  user: Employee | CurrentUserResponse | null | undefined;
  onSubmit: (data: PersonalInfoFormValues) => Promise<void>;
  isLoading: boolean;
}

export function PersonalInfoForm({ user, onSubmit, isLoading }: PersonalInfoFormProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Adaptar os dados do usuário para o formulário
  const adaptUserData = () => {
    if (!user) return null;
    
    // Se for CurrentUserResponse, adaptar para o formato esperado pelo formulário
    if ('name' in user) {
      const nameParts = user.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      return {
        firstName,
        lastName,
        email: user.email,
        birthDate: undefined,
        phoneNumbers: []
      };
    }
    
    // Se for Employee, usar diretamente
    return {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      birthDate: user.birthDate ? new Date(user.birthDate) : new Date(),
      phoneNumbers: user.phoneNumbers || []
    };
  };
  
  const userData = adaptUserData();

  // Form for personal information
  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: userData || {
      firstName: "",
      lastName: "",
      email: "",
      birthDate: new Date(),
      phoneNumbers: [],
    },
  });

  const handleSubmit = async (data: PersonalInfoFormValues) => {
    await onSubmit(data);
    setIsEditing(false);
  };

  const handleAddPhone = () => {
    const currentPhones = form.getValues("phoneNumbers") || [];
    form.setValue("phoneNumbers", [
      ...currentPhones,
      { number: "", type: PhoneType.Mobile },
    ]);
  };

  const handleRemovePhone = (index: number) => {
    const currentPhones = form.getValues("phoneNumbers") || [];
    form.setValue(
      "phoneNumbers",
      currentPhones.filter((_, i) => i !== index)
    );
  };

  const getPhoneTypeLabel = (type: PhoneType): string => {
    switch (type) {
      case PhoneType.Mobile:
        return "Celular";
      case PhoneType.Home:
        return "Residencial";
      case PhoneType.Work:
        return "Trabalho";
      case PhoneType.Other:
        return "Outro";
      default:
        return "Outro";
    }
  };

  return (
    <Card className="bg-card hover:shadow-md transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Informações Pessoais</CardTitle>
        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 rounded-full"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing}
                        className="rounded-full"
                      />
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
                    <FormLabel>Sobrenome</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing}
                        className="rounded-full"
                      />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      disabled={!isEditing}
                      className="rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Nascimento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          disabled={!isEditing}
                          className={`w-full justify-start text-left font-normal rounded-full ${
                            !field.value ? "text-muted-foreground" : ""
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Telefones</FormLabel>
                {isEditing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddPhone}
                    className="h-8 rounded-full"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                )}
              </div>

              {form.watch("phoneNumbers")?.map((phone, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    <FormField
                      control={form.control}
                      name={`phoneNumbers.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            disabled={!isEditing}
                            onValueChange={(value) => field.onChange(Number(value))}
                            value={String(field.value)}
                          >
                            <FormControl>
                              <SelectTrigger className="rounded-full">
                                <SelectValue placeholder="Tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(PhoneType)
                                .filter(([key]) => !isNaN(Number(key)))
                                .map(([key, value]) => (
                                  <SelectItem key={key} value={key}>
                                    {getPhoneTypeLabel(Number(key) as PhoneType)}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`phoneNumbers.${index}.number`}
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              placeholder="Número"
                              className="rounded-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePhone(index)}
                      className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remover</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="rounded-full"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="rounded-full"
                >
                  {isLoading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
