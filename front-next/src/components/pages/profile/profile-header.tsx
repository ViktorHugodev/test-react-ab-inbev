import React from 'react';
import { Employee, EmployeeRole } from '@/types/employee';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { CurrentUserResponse } from '@/lib/api/auth';

interface ProfileHeaderProps {
  user: Employee | CurrentUserResponse | null | undefined;
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
  
  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-8">
        <div className="container px-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2 text-center md:text-left">
              <div className="h-8 w-48 bg-muted animate-pulse rounded" />
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) return null;
  
  // Adaptar para lidar com os dois tipos de usuário
  const userName = 'name' in user 
    ? user.name 
    : `${(user as Employee).firstName || ''} ${(user as Employee).lastName || ''}`.trim();
  
  const userRole = typeof user.role === 'string' 
    ? parseInt(user.role) 
    : user.role;
  
  const roleInfo = getRoleInfo(userRole);
  
  const userDepartment = 'department' in user 
    ? user.department 
    : null;
  
  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-8">
      <div className="container px-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-24 h-24 border-4 border-background">
            <AvatarFallback className="text-2xl bg-primary/20">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-2">
              <h1 className="text-2xl font-bold">{userName}</h1>
              <Badge variant={roleInfo.variant as any} className="ml-0 md:ml-2">
                {roleInfo.label}
              </Badge>
            </div>
            
            {userDepartment && (
              <p className="text-muted-foreground">
                Departamento: {userDepartment}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
