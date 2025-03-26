"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  setAccentColor, 
  setFontSize, 
  toggleHighContrast, 
  toggleReducedMotion 
} from "@/redux/features/theme/themeSlice";
import type { RootState } from "@/redux/store";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function ThemeCustomizer() {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const { accentColor, fontSize, reducedMotion, highContrast } = useAppSelector((state: RootState) => state.theme);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings2 className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Preferências de acessibilidade</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Preferências de Visualização</SheetTitle>
          <SheetDescription>
            Configure o tema e as preferências de acessibilidade.
          </SheetDescription>
        </SheetHeader>
        <Tabs defaultValue="appearance" className="mt-6">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="accessibility">Acessibilidade</TabsTrigger>
          </TabsList>
          <TabsContent value="appearance" className="mt-4 space-y-6">
            <div className="space-y-2">
              <Label>Cor de Destaque</Label>
              <div className="grid grid-cols-4 gap-2">
                {['orange', 'blue', 'green', 'purple'].map((color) => (
                  <Button 
                    key={color}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(setAccentColor(color as any))}
                    className={cn(
                      "border-2 justify-center",
                      {
                        'orange': 'bg-orange-500/10 border-orange-500/50',
                        'blue': 'bg-blue-500/10 border-blue-500/50',
                        'green': 'bg-green-500/10 border-green-500/50',
                        'purple': 'bg-purple-500/10 border-purple-500/50',
                      }[color],
                      accentColor === color && "ring-2 ring-offset-2"
                    )}
                  >
                    <span className="uppercase text-xs">{color}</span>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="accessibility" className="mt-4 space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Tamanho da Fonte</Label>
                <RadioGroup 
                  value={fontSize} 
                  onValueChange={(value) => dispatch(setFontSize(value as any))}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="font-normal" />
                    <Label htmlFor="font-normal">Normal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="font-large" />
                    <Label htmlFor="font-large" className="text-lg">Grande</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="extra-large" id="font-extra-large" />
                    <Label htmlFor="font-extra-large" className="text-xl">Extra Grande</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reduzir Movimento</Label>
                  <div className="text-xs text-muted-foreground">
                    Diminui animações na interface
                  </div>
                </div>
                <Switch 
                  checked={reducedMotion}
                  onCheckedChange={() => dispatch(toggleReducedMotion())}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alto Contraste</Label>
                  <div className="text-xs text-muted-foreground">
                    Aumenta contraste para melhor visualização
                  </div>
                </div>
                <Switch 
                  checked={highContrast}
                  onCheckedChange={() => dispatch(toggleHighContrast())}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}