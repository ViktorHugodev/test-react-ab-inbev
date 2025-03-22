import React from 'react';
import { Employee, EmployeeRole } from '@/types/employee';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

interface ProfileHeaderProps {
  user: Employee | null | undefined;
  isLoading: boolean;
}

export function ProfileHeader({ user, isLoading }: ProfileHeaderProps) {
  // Get role display name and badge variant
  const getRoleInfo = (role: number) => {
    let label = 'Desconhecido';
    let variant: 'default' | 'secondary' | 'outline' = 'outline';
    
    switch (role) {
      case EmployeeRole.Director:
        label = 'Diretor';
        variant = 'default';
        break;
      case EmployeeRole.Leader:
        label = 'Líder';
        variant = 'secondary';
        break;
      case EmployeeRole.Employee:
        label = 'Funcionário';
        variant = 'outline';
        break;
    }
    
    return { label, variant };
  };
  
  if (isLoading || !user) {
    return (
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="container px-6 py-12">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted animate-pulse rounded" />
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const { label, variant } = getRoleInfo(user.role);
  const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
  
  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
      <div className="container px-6 py-12">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <Avatar className="w-20 h-20 border-4 border-background">
            <AvatarImage src="https://avatar.iran.liara.run/public" alt={user.email} />
            <AvatarFallback className="text-xl">{getInitials(fullName)}</AvatarFallback>
          </Avatar>
       
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              {fullName}
              <Badge variant={variant} className="ml-2">
                {label}
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-1">
              {user.email}
              {user.department && ` • ${user.department}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
