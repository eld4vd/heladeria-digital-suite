import type { AuthUser } from "../models/auth";
import type { Empleado } from "../models/Empleado";

export interface AuthContextType {
  user: AuthUser | null;
  empleado: Empleado | null;
  loading: boolean;
  error: string;
  returnUrl: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  setReturnUrl: (url: string) => void;
}
