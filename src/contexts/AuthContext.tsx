import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { User, AuthContextType, UserRole } from "../types/auth";
import { Booking } from "../types/booking";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🟢 Bookings for homeowners
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // 🟢 Bookings for providers
  const [providerBookings, setProviderBookings] = useState<Booking[]>([]);
  const [loadingProviderBookings, setLoadingProviderBookings] = useState(false);

  const [loading, setLoading] = useState(false);

  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  // Use env var or default to localhost
  const Backend_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const MAIN_URL = isLocalhost ? "http://localhost:3000" : (import.meta.env.VITE_PUBLIC_FRONTEND_MAIN_URL || "http://localhost:3000");

  // // console.log("---------------- DEBUG AUTH CONTEXT ----------------");
  // // console.log("Hostname:", window.location.hostname);
  // // console.log("isLocalhost:", isLocalhost);
  // // console.log("Resolved MAIN_URL:", MAIN_URL);
  // // console.log("Env MAIN_URL:", import.meta.env.VITE_PUBLIC_FRONTEND_MAIN_URL);
  // // console.log("----------------------------------------------------");



  // ✅ Verify user session when app loads
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${Backend_URL}/api/auth/verify`, {
          withCredentials: true,
        });
        if (res.data?.user) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to verify session:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [Backend_URL]);

  // ✅ Login with Firebase ID Token
  const login = async (idToken: string, role?: UserRole) => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${Backend_URL}/api/auth/login-firebase`,
        { idToken, role },
        { withCredentials: true }
      );
      const user = res.data.user;
      setUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
      return user;
    } catch (error: any) {
      console.error("Login failed:", error.response?.data || error.message);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Logout
  const logout = async () => {
    try {
      await axios.post(
        `${Backend_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout request failed:", err);
    }
    setUser(null);
    localStorage.removeItem("currentUser");

    // Force runtime check for localhost to avoid any environment variable or closure staleness
    const isLocalhostRuntime = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const targetUrl = isLocalhostRuntime ? "http://localhost:3000/login" : `${MAIN_URL}/login`;

    // console.log("Redirecting logout to:", targetUrl);
    window.location.href = targetUrl;
  };

  // ✅ Fetch user’s bookings
  const fetchBookings = async (userId: string) => {
    setLoadingBookings(true);
    try {
      const response = await axios.get(
        `${Backend_URL}/api/bookings/getbookingdata`,
        { params: { userId } }
      );
      if (response.data.success) {
        setBookings(response.data.data);
      } else {
        console.error("❌ Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  // ✅ Cancel a booking
  const cancelBooking = async (bookingId: string) => {
    try {
      const response = await axios.put(
        `${Backend_URL}/api/bookings/cancel/${bookingId}`
      );
      const data = response.data;

      if (data?.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: "cancelled" } : b
          )
        );
        alert("Booking cancelled successfully");
        return true;
      } else {
        alert(data?.message || "Failed to cancel booking");
        return false;
      }
    } catch (error: any) {
      console.error("Error cancelling booking:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Something went wrong while cancelling the booking";
      alert(errorMessage);
      return false;
    }
  };

  // ✅ Fetch bookings for a provider
  const fetchBookingsProviders = async (providerId: string) => {
    try {
      setLoadingProviderBookings(true);
      const response = await axios.get(
        `${Backend_URL}/api/bookings/provider/bookings/${providerId}`
      );
      if (response.data.success) {
        setProviderBookings(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching provider bookings:", error);
    } finally {
      setLoadingProviderBookings(false);
    }
  };

  // ✅ Accept a booking (Provider)
  const handleAccept = async (job: Booking) => {
    try {
      setLoading(true);
      const providerDetails = {
        provider_id: user?.id,
        name: user?.fullName || user?.name,
        email: user?.email,
        user_id: job.user_id,
      };

      const res = await axios.put(`${Backend_URL}/api/bookings/updateBooking/${job.id}`, {
        providerDetails,
        status: "accepted",
        isBooked: true,
      });

      if (res.status === 200) {
        alert("✅ Booking accepted successfully");
        await fetchBookingsProviders(user!.id);
      }
    } catch (err) {
      console.error("❌ Error accepting booking:", err);
      alert("Failed to accept booking");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (jobId: string, providerId: string) => {
    try {
      setLoading(true);
      const res = await axios.put(`${Backend_URL}/api/bookings/updateBooking/${jobId}`, {
        status: "completed",
      });

      if (res.status === 200) {
        alert("Job marked as completed ✅");
        await fetchBookingsProviders(providerId);
      }
    } catch (err) {
      console.error("❌ Error marking job complete:", err);
      alert("Failed to mark job as complete");
    } finally {
      setLoading(false);
    }
  };




  // ✅ Switch role (for testing multi-role access)
  // const switchRole = (role: UserRole) => {
  //   if (user) {
  //     const updatedUser = { ...user, role };
  //     setUser(updatedUser);
  //     localStorage.setItem("currentUser", JSON.stringify(updatedUser));
  //   }
  // };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isLoading,
        bookings,
        fetchBookings,
        cancelBooking,
        loadingBookings,
        handleAccept,
        providerBookings,
        loadingProviderBookings,

        fetchBookingsProviders,
        handleComplete,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook for usage in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
