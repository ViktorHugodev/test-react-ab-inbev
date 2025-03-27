"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setShowWelcomeDialog } from "@/redux/features/ui/uiSlice";
import type { RootState } from "@/redux/store";
import { useAuth } from "@/hooks/use-auth";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function WelcomeDialog() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const showWelcomeDialog = useAppSelector((state: RootState) => state.ui.showWelcomeDialog);
  
  
  useEffect(() => {
    if (user) {
      const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
      if (!hasSeenWelcome) {
        dispatch(setShowWelcomeDialog(true));
      }
    }
  }, [user, dispatch]);
  
  
  const handleClose = () => {
    dispatch(setShowWelcomeDialog(false));
    localStorage.setItem("hasSeenWelcome", "true");
  };
  
  if (!user) return null;
  
  return (
    <Dialog open={showWelcomeDialog} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Bem-vindo ao Sistema AB InBev</DialogTitle>
          <DialogDescription>
            Estamos felizes em tê-lo conosco. Este sistema fornece ferramentas para gerenciar funcionários e departamentos da empresa.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-muted p-4">
            <h3 className="font-medium mb-2">O que você pode fazer:</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li>Visualizar e gerenciar funcionários</li>
              <li>Organizar departamentos</li>
              <li>Acessar estatísticas em tempo real</li>
              <li>Personalizar sua experiência no sistema</li>
            </ul>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Navegue pelo menu principal para explorar os recursos disponíveis. Se precisar de ajuda, 
            use o botão de configurações no canto superior direito.
          </p>
        </div>
        
        <DialogFooter>
          <Button onClick={handleClose} className="w-full sm:w-auto">
            Começar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}