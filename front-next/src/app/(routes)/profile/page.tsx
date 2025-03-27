"use client";

import { useState, useEffect } from "react";
import { useCurrentUser, useDetailedUserInfo } from '@/services/auth/queries';
import { useUpdateEmployeeProfile, useUpdateEmployeePassword } from '@/services/employee/queries';
import { normalizeUserData, toISODateString } from '@/lib/utils';
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhoneType } from "@/types/employee";

import { ProfileHeader } from "@/components/pages/profile/profile-header";
import { PersonalInfoForm } from "@/components/pages/profile/personal-info-form";
import { PasswordForm } from "@/components/pages/profile/password-form";
import { PersonalInfoFormValues } from '@/schemas/employee';
import { PasswordFormValues } from '@/schemas/auth';

export default function ProfilePage() {
  
  const [isHydrated, setIsHydrated] = useState(false);
  const { data: user, isLoading: isLoadingUser, isError: isUserError } = useCurrentUser();
  const { data: detailedUser, isLoading: isLoadingDetails, isError: isDetailsError } = useDetailedUserInfo();
  const [activeTab, setActiveTab] = useState("profile");
  
  const isLoading = isLoadingUser || isLoadingDetails;
  const isError = isUserError || isDetailsError;
  
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  const updateProfile = useUpdateEmployeeProfile();
  const updatePassword = useUpdateEmployeePassword();

  const onPersonalInfoSubmit = async (data: PersonalInfoFormValues) => {
    
    const normalizedUser = normalizeUserData(detailedUser || user);
    
    if (!normalizedUser || !normalizedUser.id) {
      toast.error("Dados do usuário não disponíveis. Tente novamente.");
      return;
    }

    try {
      
      const processedPhoneNumbers = (data.phoneNumbers || [])
        .filter(phone => phone && typeof phone === 'object') 
        .map(phone => {
          
          
          const phoneObj: any = {
            number: (phone.number || "").trim(),
            type: Number(phone.type) || PhoneType.Mobile
          };
          
          
          if (phone.id && typeof phone.id === 'string' && phone.id.trim() !== '') {
            phoneObj.id = phone.id.trim();
          }
          
          return phoneObj;
        })
        .filter(phone => phone.number.length >= 8); 

      
      const birthDateISOString = toISODateString(data.birthDate);
      
      
      await updateProfile.mutateAsync({
        id: normalizedUser.id,
        data: {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim(),
          birthDate: birthDateISOString || (new Date()).toISOString(),
          phoneNumbers: processedPhoneNumbers
        }
      });

      toast.success("Informações pessoais atualizadas com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar informações pessoais.");
      console.error("Erro na atualização do perfil:", error);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    
    const normalizedUser = normalizeUserData(detailedUser || user);
    
    if (!normalizedUser || !normalizedUser.id) {
      toast.error("Dados do usuário não disponíveis. Tente novamente.");
      return;
    }

    try {
      
      if (data.newPassword !== data.confirmNewPassword) {
        toast.error("As senhas não coincidem.");
        return;
      }
      
      if (data.newPassword.length < 6) {
        toast.error("A nova senha deve ter pelo menos 6 caracteres.");
        return;
      }

      await updatePassword.mutateAsync({
        employeeId: normalizedUser.id,
        currentPassword: data.currentPassword.trim(),
        newPassword: data.newPassword.trim(),
        confirmNewPassword: data.confirmNewPassword.trim(),
      });

      toast.success("Senha atualizada com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar senha.");
      console.error("Erro na atualização de senha:", error);
    }
  };

  if (isError) {
    return (
      <div className="bg-background min-h-screen">
        <div className="container px-6 py-12">
          <div className="text-center py-10">
            <h1 className="text-2xl font-bold text-destructive">Erro ao carregar perfil</h1>
            <p className="text-muted-foreground mt-2">
              Não foi possível carregar as informações do seu perfil. Por favor, tente novamente mais tarde.
            </p>
          </div>
        </div>
      </div>
    );
  }

  
  if (!isHydrated) {
    return (
      <div className="bg-background min-h-screen">
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
        <div className="container px-6 py-8">
          <div className="w-full h-[500px] bg-card rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen" suppressHydrationWarning>
      {}
      <ProfileHeader user={detailedUser || user} isLoading={isLoading} />

      {}
      <div className="container px-6 py-8">
        <Tabs
          defaultValue="profile"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2 rounded-full">
            <TabsTrigger value="profile" className="rounded-full">
              Perfil
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-full">
              Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <PersonalInfoForm 
              user={detailedUser || user} 
              onSubmit={onPersonalInfoSubmit} 
              isLoading={updateProfile.isPending} 
            />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <PasswordForm 
              onSubmit={onPasswordSubmit} 
              isLoading={updatePassword.isPending} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}