
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

type UserRole = "admin" | "spot" | "entry";

interface AuthContextType {
  role: UserRole | null;
  loading: boolean;
  login: (role: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const passwords: Record<string, string> = {
  admin: "admin#cc",
  spot: "spot#cc",
  entry: "entry@cc",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedRole = Cookies.get("user_role") as UserRole | undefined;
    if (storedRole && Object.keys(passwords).includes(storedRole)) {
      setRole(storedRole);
    }
    setLoading(false);
  }, []);

  const login = async (
    role: string,
    password: string
  ): Promise<boolean> => {
    if (passwords[role] && passwords[role] === password) {
      const userRole = role as UserRole;
      setRole(userRole);
      Cookies.set("user_role", userRole, { expires: 1 }); // Expires in 1 day
      return true;
    }
    return false;
  };

  const logout = () => {
    setRole(null);
    Cookies.remove("user_role");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
