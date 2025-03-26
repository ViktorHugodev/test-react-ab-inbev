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

type FilterOption = {
  id: string;
  name: string;
  value: string;
};

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    name: string;
    placeholder: string;
    value: string | undefined;
    onChange: (value: string) => void;
    options: FilterOption[];
  }[];
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters = [],
}: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative w-full md:max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={searchPlaceholder}
          className="pl-8 rounded-full"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {filters.length > 0 && (
        <div className={`grid ${filters.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-4 w-full md:w-auto`}>
          {filters.map((filter, index) => (
            <Select
              key={index}
              value={filter.value || "all"}
              onValueChange={filter.onChange}
            >
              <SelectTrigger className="w-full sm:w-[180px] rounded-full">
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{`Todos ${filter.name}`}</SelectItem>
                {filter.options?.map((option) => (
                  <SelectItem key={option.id} value={option.value}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      )}
    </div>
  );
}