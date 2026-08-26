import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  /** Extra-wide for nested editors */
  xwide?: boolean;
}

const Modal = ({ open, title, onClose, children, wide, xwide }: ModalProps) => (
  <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
    <DialogContent
      className={`${xwide ? "sm:max-w-4xl" : wide ? "sm:max-w-2xl" : "sm:max-w-lg"} max-h-[90vh] overflow-y-auto`}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">{children}</div>
    </DialogContent>
  </Dialog>
);

export default Modal;
