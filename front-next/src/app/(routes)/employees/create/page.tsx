"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { EmployeeForm } from "@/components/shared/forms/employee-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CreateEmployeePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center">
        <Link href="/employees">
          <Button variant="ghost" className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Adicionar Novo Funcionário</h1>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Formulário de Cadastro</CardTitle>
          <CardDescription>
            Preencha os dados para cadastrar um novo funcionário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeForm />
        </CardContent>
      </Card>
    </div>
  );
}