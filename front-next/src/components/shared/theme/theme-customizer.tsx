"use client";

import { useState } from "react";
import { Settings2, Plus, Trash2, Check, Edit } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  setThemeMode, 
  setAccentColor, 
  setFontSize, 
  toggleReducedMotion, 
  toggleHighContrast,
  addCustomColorScheme,
  updateCustomColorScheme,
  removeCustomColorScheme,
  setActiveColorScheme,
  ColorScheme,
  ThemeMode,
  AccentColor
} from "@/redux/features/theme/themeSlice";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from 'uuid';

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function ThemeCustomizer() {
  // Usando Redux diretamente
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme);
  
  const {
    mode,
    accentColor,
    fontSize,
    reducedMotion,
    highContrast,
    customSchemes,
    activeSchemeId,
  } = theme;

  const [open, setOpen] = useState(false);
  const [schemeDialogOpen, setSchemeDialogOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<ColorScheme | null>(null);
  
  // Form state for creating/editing color schemes
  const [schemeName, setSchemeName] = useState('');
  const [schemeColors, setSchemeColors] = useState({
    background: '',
    foreground: '',
    primary: '',
    primaryForeground: '',
    secondary: '',
    secondaryForeground: '',
    accent: '',
    accentForeground: '',
    muted: '',
    mutedForeground: '',
    border: '',
    input: '',
    ring: '',
  });
  
  // Reset form state when dialog closes
  const resetSchemeForm = () => {
    setSchemeName('');
    setSchemeColors({
      background: '0 0% 100%',
      foreground: '224 71% 4%',
      primary: '24 89% 55%',
      primaryForeground: '0 0% 100%',
      secondary: '220 14% 96%',
      secondaryForeground: '224 71% 4%',
      accent: '24 89% 55%',
      accentForeground: '0 0% 100%',
      muted: '220 14% 96%',
      mutedForeground: '220 8% 46%',
      border: '220 13% 91%',
      input: '220 13% 91%',
      ring: '24 89% 55%',
    });
    setEditingScheme(null);
  };
  
  // Initialize form with scheme data for editing
  const editScheme = (scheme: ColorScheme) => {
    setEditingScheme(scheme);
    setSchemeName(scheme.name);
    setSchemeColors(scheme.colors);
    setSchemeDialogOpen(true);
  };
  
  // Handle scheme form submission
  const handleSchemeSubmit = () => {
    if (!schemeName.trim()) return;
    
    if (editingScheme) {
      // Update existing scheme
      dispatch(updateCustomColorScheme({
        ...editingScheme,
        name: schemeName,
        colors: schemeColors,
      }));
    } else {
      // Create new scheme
      dispatch(addCustomColorScheme({
        id: uuidv4(),
        name: schemeName,
        colors: schemeColors,
      }));
    }
    
    setSchemeDialogOpen(false);
    resetSchemeForm();
  };

  // Funções para manipular o tema diretamente com Redux
  const setMode = (newMode: ThemeMode) => dispatch(setThemeMode(newMode));
  const setAccent = (color: AccentColor) => dispatch(setAccentColor(color));
  const handleSetFontSize = (size: 'normal' | 'large' | 'extra-large') => dispatch(setFontSize(size));
  const handleToggleReducedMotion = () => dispatch(toggleReducedMotion());
  const handleToggleHighContrast = () => dispatch(toggleHighContrast());
  const handleSetColorScheme = (schemeId: string | null) => dispatch(setActiveColorScheme(schemeId));
  const handleDeleteColorScheme = (schemeId: string) => dispatch(removeCustomColorScheme(schemeId));

  return (
    <>
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
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="appearance">Aparência</TabsTrigger>
              <TabsTrigger value="colors">Cores</TabsTrigger>
              <TabsTrigger value="accessibility">Acessibilidade</TabsTrigger>
            </TabsList>
            <TabsContent value="appearance" className="mt-4 space-y-6">
              <div className="space-y-2">
                <Label>Modo do Tema</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMode('light')}
                    className={cn(
                      "justify-start gap-2",
                      mode === 'light' && "border-2 border-primary"
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2" />
                      <path d="M12 20v2" />
                      <path d="m4.93 4.93 1.41 1.41" />
                      <path d="m17.66 17.66 1.41 1.41" />
                      <path d="M2 12h2" />
                      <path d="M20 12h2" />
                      <path d="m6.34 17.66-1.41 1.41" />
                      <path d="m19.07 4.93-1.41 1.41" />
                    </svg>
                    <span>Claro</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMode('dark')}
                    className={cn(
                      "justify-start gap-2",
                      mode === 'dark' && "border-2 border-primary"
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                    <span>Escuro</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMode('system')}
                    className={cn(
                      "justify-start gap-2",
                      mode === 'system' && "border-2 border-primary"
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <rect width="20" height="14" x="2" y="3" rx="2" />
                      <line x1="8" x2="16" y1="21" y2="21" />
                      <line x1="12" x2="12" y1="17" y2="21" />
                    </svg>
                    <span>Sistema</span>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Cor de Destaque</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['orange', 'blue', 'green', 'purple', 'red', 'teal'].map((color) => (
                    <Button 
                      key={color}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Ao selecionar uma cor predefinida, desativa qualquer esquema personalizado
                        dispatch(setActiveColorScheme(null));
                        // Depois define a cor de destaque
                        dispatch(setAccentColor(color as AccentColor));
                      }}
                      className={cn(
                        "border-2 justify-center",
                        {
                          'orange': 'bg-orange-500/10 border-orange-500/50',
                          'blue': 'bg-blue-500/10 border-blue-500/50',
                          'green': 'bg-green-500/10 border-green-500/50',
                          'purple': 'bg-purple-500/10 border-purple-500/50',
                          'red': 'bg-red-500/10 border-red-500/50',
                          'teal': 'bg-teal-500/10 border-teal-500/50',
                        }[color],
                        accentColor === color && activeSchemeId === null && "ring-2 ring-offset-2"
                      )}
                    >
                      <span className="uppercase text-xs">{color}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="colors" className="mt-4 space-y-6">
              <div className="flex justify-between items-center">
                <Label>Esquemas de Cores</Label>
                <Dialog open={schemeDialogOpen} onOpenChange={setSchemeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => resetSchemeForm()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Esquema
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingScheme ? 'Editar Esquema de Cores' : 'Novo Esquema de Cores'}
                      </DialogTitle>
                      <DialogDescription>
                        Personalize as cores do seu tema. Use valores HSL (matiz, saturação, luminosidade).
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="scheme-name">Nome do Esquema</Label>
                        <Input
                          id="scheme-name"
                          value={schemeName}
                          onChange={(e) => setSchemeName(e.target.value)}
                          placeholder="Ex: Corporativo, Pastel, Vibrante"
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="background">Background</Label>
                          <Input
                            id="background"
                            value={schemeColors.background}
                            onChange={(e) => setSchemeColors({...schemeColors, background: e.target.value})}
                            placeholder="0 0% 100%"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="foreground">Foreground</Label>
                          <Input
                            id="foreground"
                            value={schemeColors.foreground}
                            onChange={(e) => setSchemeColors({...schemeColors, foreground: e.target.value})}
                            placeholder="224 71% 4%"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="primary">Primary</Label>
                          <Input
                            id="primary"
                            value={schemeColors.primary}
                            onChange={(e) => setSchemeColors({...schemeColors, primary: e.target.value})}
                            placeholder="24 89% 55%"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="primary-foreground">Primary Foreground</Label>
                          <Input
                            id="primary-foreground"
                            value={schemeColors.primaryForeground}
                            onChange={(e) => setSchemeColors({...schemeColors, primaryForeground: e.target.value})}
                            placeholder="0 0% 100%"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setSchemeDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSchemeSubmit}>
                        {editingScheme ? 'Atualizar' : 'Criar'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-4">
                {customSchemes.map((scheme) => (
                  <Card key={scheme.id} className={cn(
                    "relative overflow-hidden",
                    activeSchemeId === scheme.id && "ring-2 ring-primary"
                  )}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{scheme.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex space-x-2">
                        <div 
                          className="w-6 h-6 rounded-full" 
                          style={{ background: `hsl(${scheme.colors.primary})` }}
                        />
                        <div 
                          className="w-6 h-6 rounded-full" 
                          style={{ background: `hsl(${scheme.colors.secondary})` }}
                        />
                        <div 
                          className="w-6 h-6 rounded-full" 
                          style={{ background: `hsl(${scheme.colors.accent})` }}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSetColorScheme(activeSchemeId === scheme.id ? null : scheme.id)}
                      >
                        {activeSchemeId === scheme.id ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Ativo
                          </>
                        ) : "Aplicar"}
                      </Button>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => editScheme(scheme)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {scheme.id !== 'default' && scheme.id !== 'blue' && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteColorScheme(scheme.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="accessibility" className="mt-4 space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Tamanho da Fonte</Label>
                  <RadioGroup 
                    value={fontSize} 
                    onValueChange={(value) => handleSetFontSize(value as 'normal' | 'large' | 'extra-large')}
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
                    onCheckedChange={handleToggleReducedMotion}
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
                    onCheckedChange={handleToggleHighContrast}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
}