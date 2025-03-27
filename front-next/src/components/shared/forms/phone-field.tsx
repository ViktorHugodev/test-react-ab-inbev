"use client";

import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { PhoneType } from "@/types/employee";
import { CreateEmployeeFormValues } from "@/schemas/employee";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { X, Plus } from "lucide-react";

export function PhoneFieldArray() {
  const { control, formState } = useFormContext<CreateEmployeeFormValues>();
  const { fields, append, remove } = useFieldArray({
    name: "phoneNumbers",
    control,
  });

  
  const [initialized, setInitialized] = useState(false);
  if (!initialized && fields.length === 0) {
    append({ number: "", type: PhoneType.Mobile });
    setInitialized(true);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FormLabel className="text-base">Telefones</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ number: "", type: PhoneType.Mobile })}
          className="h-8 px-2"
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-2">
          <FormField
            control={control}
            name={`phoneNumbers.${index}.number`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input 
                    placeholder="Número de telefone" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`phoneNumbers.${index}.type`}
            render={({ field }) => (
              <FormItem className="w-[140px]">
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={PhoneType.Mobile.toString()}>Celular</SelectItem>
                    <SelectItem value={PhoneType.Home.toString()}>Residencial</SelectItem>
                    <SelectItem value={PhoneType.Work.toString()}>Trabalho</SelectItem>
                    <SelectItem value={PhoneType.Other.toString()}>Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {fields.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              className="h-9 w-9 shrink-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remover telefone</span>
            </Button>
          )}
        </div>
      ))}

      {formState.errors.phoneNumbers && formState.errors.phoneNumbers.root && (
        <p className="text-sm font-medium text-destructive mt-1">
          {formState.errors.phoneNumbers.root.message}
        </p>
      )}
    </div>
  );
}