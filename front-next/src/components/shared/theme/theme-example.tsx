"use client";

import { useAppSelector } from "@/redux/hooks";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";


export function ThemeExample() {
  const { mode, accentColor, fontSize, reducedMotion, highContrast } = useAppSelector(state => state.theme);
  

  const cardClasses = cn(
    "max-w-md mx-auto",
    highContrast && "border-2",
    accentColor === "blue" && "border-blue-500",
    accentColor === "green" && "border-green-500",
    accentColor === "purple" && "border-purple-500",
    accentColor === "red" && "border-red-500",
    accentColor === "teal" && "border-teal-500"
  );
  
  const buttonClasses = cn(
    "transition-all",
    reducedMotion && "transition-none",
    fontSize === "large" && "text-lg py-3",
    fontSize === "extra-large" && "text-xl py-4"
  );
  
  return (
    <Card className={cardClasses}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Exemplo de Tema</CardTitle>
          <Badge variant="outline" className="capitalize">
            {mode}
          </Badge>
        </div>
        <CardDescription>
          Demonstração de como os componentes shadcn/ui são afetados pelo tema
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Shadcn</p>
            <p className="text-xs text-muted-foreground">Criador do shadcn/ui</p>
          </div>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-2 gap-2">
          <Button variant="default" className={buttonClasses}>
            Primário
          </Button>
          <Button variant="secondary" className={buttonClasses}>
            Secundário
          </Button>
          <Button variant="outline" className={buttonClasses}>
            Outline
          </Button>
          <Button variant="ghost" className={buttonClasses}>
            Ghost
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Modo: <span className="font-medium">{mode}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Cor: <span className="font-medium">{accentColor}</span>
        </p>
      </CardFooter>
    </Card>
  );
}
