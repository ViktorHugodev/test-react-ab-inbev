import React from "react";
import Link from "next/link";
import { Building2, Users, Edit, Trash2, ExternalLink } from "lucide-react";
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
  onEdit?: () => void;
  onDelete?: () => void;
}

export function DepartmentCard({ department, onEdit, onDelete }: DepartmentCardProps) {
  const handleClick = (e: React.MouseEvent, callback?: () => void) => {
    if (callback) {
      e.preventDefault();
      e.stopPropagation();
      callback();
    }
  };

  return (
    <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
      <Link href={`/departments/${department.id}`}>
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
      </Link>
      
      <CardFooter className="flex justify-between items-center">
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link href={`/departments/${department.id}`}>
            <span>Ver detalhes</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Button>
        
        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={(e) => handleClick(e, onEdit)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Editar</span>
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:text-destructive" 
                onClick={(e) => handleClick(e, onDelete)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Excluir</span>
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}