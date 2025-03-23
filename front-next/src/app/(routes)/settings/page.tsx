"use client";

import { useState } from "react";
import { SettingsHeader } from "@/components/pages/settings/settings-header";
import { SettingsNavigation } from "@/components/pages/settings/settings-navigation";
import { ProfileSettings } from "@/components/pages/settings/sections/profile-settings";
import { AppearanceSettings } from "@/components/pages/settings/sections/appearance-settings";
import { SecuritySettings } from "@/components/pages/settings/sections/security-settings";
import { useAuth } from "@/hooks/use-auth";

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState("profile");
  const { user } = useAuth();

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSettings />;
      case "appearance":
        return <AppearanceSettings />;
      case "security":
        return <SecuritySettings />;
      default:
        return (
          <div className="p-8 text-center bg-muted/30 rounded-3xl">
            <h3 className="text-lg font-medium mb-2">Seção em desenvolvimento</h3>
            <p className="text-muted-foreground">
              Esta seção de configurações está em desenvolvimento e estará disponível em breve.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <SettingsHeader
        title="Configurações do Sistema"
        subtitle="Personalize sua experiência e gerencie suas preferências"
      />

      {/* Main Content */}
      <div className="container px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar Navigation */}
          <div className="md:border-r pr-6">
            <SettingsNavigation
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>

          {/* Content Area */}
          <div className="space-y-6">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
