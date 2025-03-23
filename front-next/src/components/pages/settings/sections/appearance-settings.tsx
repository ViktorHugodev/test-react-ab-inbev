import React from 'react';
import { SettingsCard } from '../settings-card';
import { Palette, Monitor, Moon, Sun, Check } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function AppearanceSettings() {
  const [theme, setTheme] = React.useState<"light" | "dark" | "system">("system");
  const [fontSize, setFontSize] = React.useState<"default" | "large" | "larger">("default");
  const [animationsEnabled, setAnimationsEnabled] = React.useState(true);
  const [colorScheme, setColorScheme] = React.useState("default");

  const handleSave = () => {
    toast.success("Configurações de aparência salvas com sucesso!");
  };

  return (
    <div className="space-y-6">
      <SettingsCard 
        title="Aparência" 
        description="Personalize a interface do sistema"
        icon={<Palette className="h-5 w-5" />}
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Tema</h3>
            <RadioGroup 
              defaultValue={theme} 
              onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem 
                  value="light" 
                  id="theme-light" 
                  className="sr-only" 
                />
                <Label
                  htmlFor="theme-light"
                  className={cn(
                    "flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all duration-300",
                    theme === "light" && "border-primary"
                  )}
                >
                  <Sun className="h-6 w-6 mb-2" />
                  <div className="text-center">
                    <p className="font-medium">Claro</p>
                    <p className="text-xs text-muted-foreground">
                      Tema claro para ambientes bem iluminados
                    </p>
                  </div>
                  {theme === "light" && (
                    <div className="absolute top-2 right-2 h-5 w-5 text-primary rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </Label>
              </div>
              <div>
                <RadioGroupItem 
                  value="dark" 
                  id="theme-dark" 
                  className="sr-only" 
                />
                <Label
                  htmlFor="theme-dark"
                  className={cn(
                    "flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all duration-300",
                    theme === "dark" && "border-primary"
                  )}
                >
                  <Moon className="h-6 w-6 mb-2" />
                  <div className="text-center">
                    <p className="font-medium">Escuro</p>
                    <p className="text-xs text-muted-foreground">
                      Tema escuro para ambientes com pouca luz
                    </p>
                  </div>
                  {theme === "dark" && (
                    <div className="absolute top-2 right-2 h-5 w-5 text-primary rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </Label>
              </div>
              <div>
                <RadioGroupItem 
                  value="system" 
                  id="theme-system" 
                  className="sr-only" 
                />
                <Label
                  htmlFor="theme-system"
                  className={cn(
                    "flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all duration-300",
                    theme === "system" && "border-primary"
                  )}
                >
                  <Monitor className="h-6 w-6 mb-2" />
                  <div className="text-center">
                    <p className="font-medium">Sistema</p>
                    <p className="text-xs text-muted-foreground">
                      Segue as configurações do seu sistema
                    </p>
                  </div>
                  {theme === "system" && (
                    <div className="absolute top-2 right-2 h-5 w-5 text-primary rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Tamanho da Fonte</h3>
            <RadioGroup 
              defaultValue={fontSize} 
              onValueChange={(value) => setFontSize(value as "default" | "large" | "larger")}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem 
                  value="default" 
                  id="font-default" 
                  className="sr-only" 
                />
                <Label
                  htmlFor="font-default"
                  className={cn(
                    "flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all duration-300",
                    fontSize === "default" && "border-primary"
                  )}
                >
                  <span className="text-base font-medium">Aa</span>
                  <p className="text-xs text-muted-foreground mt-1">Padrão</p>
                </Label>
              </div>
              <div>
                <RadioGroupItem 
                  value="large" 
                  id="font-large" 
                  className="sr-only" 
                />
                <Label
                  htmlFor="font-large"
                  className={cn(
                    "flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all duration-300",
                    fontSize === "large" && "border-primary"
                  )}
                >
                  <span className="text-lg font-medium">Aa</span>
                  <p className="text-xs text-muted-foreground mt-1">Grande</p>
                </Label>
              </div>
              <div>
                <RadioGroupItem 
                  value="larger" 
                  id="font-larger" 
                  className="sr-only" 
                />
                <Label
                  htmlFor="font-larger"
                  className={cn(
                    "flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all duration-300",
                    fontSize === "larger" && "border-primary"
                  )}
                >
                  <span className="text-xl font-medium">Aa</span>
                  <p className="text-xs text-muted-foreground mt-1">Maior</p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Esquema de Cores</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Default", value: "default", color: "bg-primary" },
                { name: "Blue", value: "blue", color: "bg-blue-500" },
                { name: "Green", value: "green", color: "bg-green-500" },
                { name: "Purple", value: "purple", color: "bg-purple-500" },
              ].map((scheme) => (
                <div 
                  key={scheme.value}
                  onClick={() => setColorScheme(scheme.value)}
                  className={cn(
                    "flex flex-col items-center rounded-xl border-2 border-muted p-4 hover:border-primary cursor-pointer transition-all duration-300",
                    colorScheme === scheme.value && "border-primary"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-full mb-2", scheme.color)} />
                  <span className="text-sm">{scheme.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="rounded-xl">
              Salvar preferências
            </Button>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
