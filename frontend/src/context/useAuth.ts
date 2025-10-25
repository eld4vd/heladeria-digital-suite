import { useContext } from "react";
import type { AuthContextType } from "./AuthContext.types";
import { AuthContext } from "./AuthContext.shared";

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
