import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { AuthContext, type User } from "@/contexts/auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem("accessToken"));
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    api
      .get<User>("/auth/me")
      .then(({ data }) => setUser(data))
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post<{ accessToken: string; refreshToken: string }>(
      "/auth/login",
      { email, password }
    );
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    const me = await api.get<User>("/auth/me");
    setUser(me.data);
    navigate("/");
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    const { data } = await api.post<{ accessToken: string; refreshToken: string }>(
      "/auth/register",
      { email, password, firstName, lastName }
    );
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    const me = await api.get<User>("/auth/me");
    setUser(me.data);
    navigate("/");
  };

  const logout = () => {
    api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    navigate("/auth/signin");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
