import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthContextType, UserRole } from "../types/auth";
import axios from "axios";
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

const Backend_URL = process.env.VITE_PUBLIC_BACKEND_URL || 'http://api.d0lt.local:5000';

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${Backend_URL}/api/auth/verify`, {
          withCredentials: true, // send cookies for session auth
        });
        console.log(res)
        setUser(res.data?.user || null);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  // const login = async (email: string, role: UserRole) => {
  //   setIsLoading(true);
  //   // Simulate API call delay
  //   await new Promise((resolve) => setTimeout(resolve, 500));

  //   const newUser: User = {
  //     id: `user_${Date.now()}`,
  //     email,
  //     name: email.split("@")[0],
  //     role,
  //     avatar: `https://avatar.vercel.sh/${email}`,
  //     createdAt: new Date(),
  //   };

  //   setUser(newUser);
  //   localStorage.setItem("currentUser", JSON.stringify(newUser));
  //   setIsLoading(false);
  // };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, logout, switchRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
