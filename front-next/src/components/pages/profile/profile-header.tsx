import React from 'react';
import { Employee, EmployeeRole } from '@/types/employee';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { CurrentUserResponse } from '@/services/auth';
import { UserDataSource, UnifiedUserData } from '@/types/employee';
import { normalizeUserData } from '@/lib/utils';

interface ProfileHeaderProps {
  user: UserDataSource;
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
  
  // Usar o hook useMemo para evitar recálculos desnecessários
  const normalizedUser = React.useMemo(() => {
    // Verificar se user é do tipo UnifiedUserData
    if (user && 'id' in user && 'firstName' in user && 'lastName' in user && 'email' in user && 'fullName' in user) {
      // Se já for UnifiedUserData, retornar diretamente
      return user as UnifiedUserData;
    }
    // Caso contrário, normalizar usando a função
    return normalizeUserData(user as (Employee | CurrentUserResponse | null | undefined));
  }, [user]);
  
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
  
  if (!normalizedUser) return null;
  
  const roleInfo = getRoleInfo(normalizedUser.role);
  
  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-8" suppressHydrationWarning>
      <div className="container px-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-24 h-24 border-4 border-background">
            <AvatarFallback className="text-2xl bg-primary/20">
              {getInitials(normalizedUser.fullName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-2">
              <h1 className="text-2xl font-bold">{normalizedUser.fullName}</h1>
              <Badge variant={roleInfo.variant as any} className="ml-0 md:ml-2">
                {roleInfo.label}
              </Badge>
            </div>
            
            {normalizedUser.department && (
              <p className="text-muted-foreground">
                Departamento: {normalizedUser.department}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
