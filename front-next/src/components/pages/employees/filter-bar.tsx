import { Search } from "lucide-react";
import { Department } from "@/types/deparment";
import { Employee } from "@/types/employee";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDepartment: string | undefined;
  onDepartmentChange: (value: string) => void;
  selectedManager: string | undefined;
  onManagerChange: (value: string) => void;
  departments: Department[] | undefined;
  managers: Employee[] | undefined;
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedManager,
  onManagerChange,
  departments,
  managers,
}: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative w-full md:max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar funcionários..."
          className="pl-8 rounded-full"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
        <Select
          value={selectedDepartment || "all"}
          onValueChange={onDepartmentChange}
        >
          <SelectTrigger className="w-full sm:w-[180px] rounded-full">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Departamentos</SelectItem>
            {departments?.map((dept) => (
              <SelectItem key={dept.id} value={dept.name}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={selectedManager || "all"}
          onValueChange={onManagerChange}
        >
          <SelectTrigger className="w-full sm:w-[180px] rounded-full">
            <SelectValue placeholder="Gerente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Gerentes</SelectItem>
            {managers?.map((manager) => (
              <SelectItem key={manager.id} value={manager.id}>
                {manager.firstName} {manager.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
