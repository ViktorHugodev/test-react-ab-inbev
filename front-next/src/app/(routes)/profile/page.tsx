"use client";

import { useState } from "react";
import { useCurrentUser } from '@/services/auth/queries';
import { useUpdateEmployeeProfile, useUpdateEmployeePassword } from '@/services/employee/queries';
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ProfileHeader } from "@/components/pages/profile/profile-header";
import { PersonalInfoForm, PersonalInfoFormValues } from "@/components/pages/profile/personal-info-form";
import { PasswordForm, PasswordFormValues } from "@/components/pages/profile/password-form";

export default function ProfilePage() {
  const { data: user, isLoading, isError } = useCurrentUser();
  const [activeTab, setActiveTab] = useState("profile");
  
  const updateProfile = useUpdateEmployeeProfile();
  const updatePassword = useUpdateEmployeePassword();

  const onPersonalInfoSubmit = async (data: PersonalInfoFormValues) => {
    if (!user || !user.id) return;

    try {
      await updateProfile.mutateAsync({
        id: user.id,
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          birthDate: data.birthDate.toISOString(),
          phoneNumbers: data.phoneNumbers
        }
      });

      toast.success("Informações pessoais atualizadas com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar informações pessoais.");
      console.error(error);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    if (!user || !user.id) return;

    try {
      await updatePassword.mutateAsync({
        employeeId: user.id,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });

      toast.success("Senha atualizada com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar senha.");
      console.error(error);
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

  return (
    <div className="bg-background min-h-screen">
      {/* Profile Header */}
      <ProfileHeader user={user} isLoading={isLoading} />

      {/* Main Content */}
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
              user={user} 
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