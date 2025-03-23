import React from 'react';
import { SettingsCard } from '../settings-card';
import { Shield, Key, Smartphone, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, {
      message: "Senha atual é obrigatória",
    }),
    newPassword: z.string().min(8, {
      message: "Nova senha deve ter pelo menos 8 caracteres",
    }),
    confirmPassword: z.string().min(8, {
      message: "Confirmação de senha deve ter pelo menos 8 caracteres",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);
  const [sessionTimeout, setSessionTimeout] = React.useState(30);
  const [loginNotifications, setLoginNotifications] = React.useState(true);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  function onSubmit(data: PasswordFormValues) {
    toast.success("Senha alterada com sucesso!");
    form.reset();
  }

  return (
    <div className="space-y-6">
      <SettingsCard 
        title="Segurança" 
        description="Gerencie suas configurações de segurança"
        icon={<Shield className="h-5 w-5" />}
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Alterar Senha</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha Atual</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="password" 
                            placeholder="Digite sua senha atual" 
                            className="pl-10 rounded-xl" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="password" 
                            placeholder="Digite sua nova senha" 
                            className="pl-10 rounded-xl" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        A senha deve ter pelo menos 8 caracteres e incluir letras maiúsculas, minúsculas e números.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Nova Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="password" 
                            placeholder="Confirme sua nova senha" 
                            className="pl-10 rounded-xl" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="rounded-xl">Alterar Senha</Button>
              </form>
            </Form>
          </div>

          <div className="pt-6 border-t">
            <h3 className="text-lg font-medium mb-3">Autenticação de Dois Fatores</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center">
                  <Smartphone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Label htmlFor="two-factor">Autenticação de Dois Fatores</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Adicione uma camada extra de segurança à sua conta
                </p>
              </div>
              <Switch
                id="two-factor"
                checked={twoFactorEnabled}
                onCheckedChange={setTwoFactorEnabled}
              />
            </div>
            {twoFactorEnabled && (
              <div className="mt-4">
                <Button variant="outline" className="rounded-xl">Configurar 2FA</Button>
              </div>
            )}
          </div>

          <div className="pt-6 border-t">
            <h3 className="text-lg font-medium mb-3">Configurações de Sessão</h3>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="session-timeout">Tempo limite de sessão (minutos)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="session-timeout"
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(Number(e.target.value))}
                    min={5}
                    max={120}
                    className="w-24 rounded-xl"
                  />
                  <span className="text-sm text-muted-foreground">minutos</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sua sessão será encerrada após este período de inatividade
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-muted-foreground" />
                    <Label htmlFor="login-notifications">Notificações de Login</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações quando sua conta for acessada
                  </p>
                </div>
                <Switch
                  id="login-notifications"
                  checked={loginNotifications}
                  onCheckedChange={setLoginNotifications}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="text-lg font-medium mb-3">Dispositivos Conectados</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <div>
                    <p className="text-sm font-medium">Chrome - Windows</p>
                    <p className="text-xs text-muted-foreground">São Paulo, Brasil • Ativo agora</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-sm rounded-xl">
                  Este dispositivo
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full mr-2"></div>
                  <div>
                    <p className="text-sm font-medium">Safari - iPhone</p>
                    <p className="text-xs text-muted-foreground">São Paulo, Brasil • 2 dias atrás</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-sm text-destructive rounded-xl">
                  Desconectar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
