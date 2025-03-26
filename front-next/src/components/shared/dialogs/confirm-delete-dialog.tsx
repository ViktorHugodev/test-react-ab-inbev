import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  itemName: string;
  description?: string;
  onConfirm: () => Promise<void> | void;
  isLoading: boolean;
  variant?: "default" | "alert";
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  itemName,
  description,
  onConfirm,
  isLoading,
  variant = "default",
}: ConfirmDeleteDialogProps) {
  const defaultDescription = `Tem certeza que deseja excluir ${itemName}? Esta ação não pode ser desfeita.`;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm()}
            disabled={isLoading}
            className="rounded-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
