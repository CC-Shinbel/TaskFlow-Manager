import { createContext } from "react";
import type { User } from "../types/User";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => Promise<void>;
  logout: () => void;
}

export const AuthContext =
  createContext<AuthContextType | undefined>(undefined);