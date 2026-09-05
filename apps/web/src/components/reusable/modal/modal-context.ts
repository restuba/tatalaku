import { createContext } from "react";
import type { Scroll } from "./types";

export interface ModalContextType {
  onClose?: (() => void) | undefined;
  scroll: Scroll;
}

export const ModalContext = createContext<ModalContextType>({ scroll: "paper" });
