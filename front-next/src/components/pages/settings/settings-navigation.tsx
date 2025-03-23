import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Globe, 
  HelpCircle,
  LucideIcon
} from 'lucide-react';

interface SettingsNavItem {
  label: string;
  value: string;
  icon: LucideIcon;
  description: string;
}

const settingsNavItems: SettingsNavItem[] = [
  {
    label: 'Perfil',
    value: 'profile',
    icon: User,
    description: 'Gerencie suas informações pessoais'
  },
  {
    label: 'Notificações',
    value: 'notifications',
    icon: Bell,
    description: 'Configure suas preferências de notificação'
  },
  {
    label: 'Segurança',
    value: 'security',
    icon: Shield,
    description: 'Gerencie senhas e autenticação'
  },
  {
    label: 'Aparência',
    value: 'appearance',
    icon: Palette,
    description: 'Personalize a interface do sistema'
  },
  {
    label: 'Sistema',
    value: 'system',
    icon: Database,
    description: 'Configurações gerais do sistema'
  },
  {
    label: 'Idioma',
    value: 'language',
    icon: Globe,
    description: 'Altere o idioma da interface'
  },
  {
    label: 'Ajuda',
    value: 'help',
    icon: HelpCircle,
    description: 'Obtenha suporte e documentação'
  }
];

interface SettingsNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function SettingsNavigation({ 
  activeSection, 
  onSectionChange 
}: SettingsNavigationProps) {
  return (
    <div className="space-y-2 w-full">
      {settingsNavItems.map((item) => (
        <Button
          key={item.value}
          variant="ghost"
          onClick={() => onSectionChange(item.value)}
          className={cn(
            "w-full justify-start gap-2 rounded-xl h-auto py-3 px-4 transition-all duration-300",
            activeSection === item.value 
              ? "bg-primary/10 text-primary hover:bg-primary/15" 
              : "hover:bg-muted"
          )}
        >
          <item.icon className="h-5 w-5" />
          <div className="flex flex-col items-start">
            <span className="font-medium">{item.label}</span>
            <span className="text-xs text-muted-foreground">{item.description}</span>
          </div>
        </Button>
      ))}
    </div>
  );
}
