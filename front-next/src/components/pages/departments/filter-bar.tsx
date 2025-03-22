import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function FilterBar({
  searchTerm,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative w-full md:max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar departamentos..."
          className="pl-8 rounded-full"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
