import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { normalizeUserData } from "@/lib/utils";
import { PersonalInfoFormValues, personalInfoSchema } from "@/schemas/employee";
import { CurrentUserResponse } from "@/services/auth";
import { Employee, EmployeeRole, PhoneType, UnifiedUserData, UserDataSource } from "@/types/employee";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";



interface PersonalInfoFormProps {
  user: UserDataSource;
  onSubmit: (data: PersonalInfoFormValues) => Promise<void>;
  isLoading: boolean;
}

export function PersonalInfoForm({ user, onSubmit, isLoading }: PersonalInfoFormProps) {
  const [isEditing, setIsEditing] = useState(false);

  
  const normalizedUser = useMemo(() => {
    
    if (user && 'id' in user && 'firstName' in user && 'lastName' in user && 'email' in user && 'fullName' in user) {
      
      return user as UnifiedUserData;
    }
    
    return normalizeUserData(user as (Employee | CurrentUserResponse | null | undefined));
  }, [user]);
  
  
  const userData = useMemo(() => {
    if (!normalizedUser) return null;
    
    return {
      firstName: normalizedUser.firstName,
      lastName: normalizedUser.lastName,
      email: normalizedUser.email,
      birthDate: normalizedUser.birthDate || new Date(),
      documentNumber: normalizedUser.documentNumber || '',
      age: normalizedUser.age || null,
      role: normalizedUser.role || EmployeeRole.Employee,
      department: normalizedUser.department || '',
      phoneNumbers: normalizedUser.phoneNumbers.map(phone => ({
        id: phone.id,
        number: phone.number,
        type: phone.type
      }))
    };
  }, [normalizedUser]);


  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      birthDate: new Date(),
      phoneNumbers: [],
    },
  });

  useEffect(() => {
    if (userData) {
      form.reset(userData);
    }
  }, [form, userData]);
  
  const handleSubmit = async (data: PersonalInfoFormValues) => {
    try {
      await onSubmit(data);
      setIsEditing(false);
    } catch (error) {
      
      console.error("Erro ao submeter formulário:", error);
    }
  };

  
  const handleAddPhone = () => {
    
    const currentPhones = form.getValues("phoneNumbers") || [];
    
    
    
    const newPhone = {
      number: "",
      type: PhoneType.Mobile
    };
    
    
    const newPhones = [...currentPhones, newPhone];
    
    
    form.setValue("phoneNumbers", newPhones, { 
      shouldValidate: false, 
      shouldDirty: true,
      shouldTouch: true
    });
    
    
    
    const newIndex = newPhones.length - 1;
    setTimeout(() => {
      form.setFocus(`phoneNumbers.${newIndex}.number`);
    }, 50);
  };

  const handleRemovePhone = (index: number) => {
    const currentPhones = form.getValues("phoneNumbers") || [];
    
    
    if (index < 0 || index >= currentPhones.length) {
      console.error(`Índice inválido para remoção: ${index}, tamanho do array: ${currentPhones.length}`);
      return;
    }
    
    
    const phoneToRemove = currentPhones[index];
    
    
    if (phoneToRemove?.id && currentPhones.length === 1) {
      const resetPhone = { 
        id: phoneToRemove.id, 
        number: "", 
        type: PhoneType.Mobile 
      };
      
      form.setValue("phoneNumbers", [resetPhone], {
        shouldValidate: false, 
        shouldDirty: true,
        shouldTouch: true
      });
      return;
    }
    
    
    const newPhones = currentPhones.filter((_, i) => i !== index);
    
    
    form.setValue("phoneNumbers", newPhones, {
      shouldValidate: false, 
      shouldDirty: true,
      shouldTouch: true
    });
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
          <form 
            onSubmit={form.handleSubmit(handleSubmit)} 
            className="space-y-4"
          >
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="documentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF/CNPJ</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        disabled={true}
                        className="rounded-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idade</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value?.toString() || ''}
                        disabled={true}
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
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      disabled={true}
                      className="rounded-full"
                    />
                  </FormControl>
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

              {form.watch("phoneNumbers")?.map((phone, index) => {
                
                const phoneId = phone.id || `phone-${index}`;
                
                return (
                  <div 
                    key={phoneId}
                    className="flex items-center gap-2"
                    data-phone-index={index}
                  >
                    <div className="grid grid-cols-3 gap-2 flex-1">
                      <FormField
                        control={form.control}
                        name={`phoneNumbers.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              disabled={!isEditing}
                              onValueChange={(value) => {
                                field.onChange(Number(value));
                              }}
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
                                value={field.value || ''}
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
                );
              })}
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
