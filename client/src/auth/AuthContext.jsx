import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (emailOrUsername, password) => {
    const { data } = await api.post("/auth/login", { emailOrUsername, password });
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const logout = () => { localStorage.removeItem("token"); setUser(null); };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) api.get("/auth/me").then(({ data }) => setUser(data.user)).catch(() => logout());
  }, []);

  return <Ctx.Provider value={{ user, login, register, logout }}>{children}</Ctx.Provider>;
}
