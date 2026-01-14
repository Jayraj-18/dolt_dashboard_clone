import axios from "axios";

const Backend_URL =
  import.meta.env.VITE_PUBLIC_BACKEND_URL || "http://localhost:5000";


// 🔹 Become a Provider
export const becomeProvider = async (userId) => {
  try {
    const res = await axios.post(`${Backend_URL}/api/auth/become-provider`, {
      userId,
    });

    if (res.data.success) {
      return { success: true, message: "You are now also a provider!" };
    } else {
      return {
        success: false,
        message: res.data.message || "Failed to become provider",
      };
    }
  } catch (err) {
    console.error("Become Provider Error:", err);
    return { success: false, message: "Something went wrong!" };
  }
};

// 🔹 Become a User
export const becomeUser = async (userId) => {
  try {
    const res = await axios.post(`${Backend_URL}/api/auth/become-user`, {
      userId,
    });

    if (res.data.success) {
      return { success: true, message: "You are now also a user!" };
    } else {
      return {
        success: false,
        message: res.data.message || "Failed to become user",
      };
    }
  } catch (err) {
    console.error("Become User Error:", err);
    return { success: false, message: "Something went wrong!" };
  }
};



export const switchRole = async (userId, currentRole, setUser) => {
  try {
    const newRole = currentRole === "user" ? "provider" : "user";

    const res = await axios.post(`${Backend_URL}/api/auth/switch-role`, {
      userId,
      newRole,
    });

    if (res.data.success) {
      // Update frontend state
      setUser((prev) => ({ ...prev, role: newRole }));
      alert(`Switched to ${newRole} mode`);
    }
  } catch (err) {
    console.error("Error switching role:", err);
    alert("Failed to switch role");
  }
};