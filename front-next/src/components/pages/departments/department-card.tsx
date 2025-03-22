import React from "react";
import Link from "next/link";
import { Building2, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Department {
  id: string;
  name: string;
  description?: string;
  employeeCount: number;
  isActive?: boolean;
}

export interface DepartmentCardProps {
  department: Department;
}

export function DepartmentCard({ department }: DepartmentCardProps) {
  return (
    <Link href={`/departments/${department.id}`}>
      <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>{department.name}</CardTitle>
          </div>
          <CardDescription>
            {department.description || "Sem descrição"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary" className="text-xs">
              {department.employeeCount || 0} funcionários
            </Badge>
            
            {department.isActive === false && (
              <Badge variant="destructive" className="text-xs">
                Inativo
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" className="w-full">
            Ver detalhes
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}