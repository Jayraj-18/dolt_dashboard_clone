import axios from "axios";

const Backend_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL || "http://localhost:5000";



export const addService = async (serviceData) => {
  try {

    const res = await axios.post(`${Backend_URL}/api/services/add`, serviceData);

    return res.data;
  } catch (error) {
    console.error("Error adding service:", error);
    throw error;
  }
};

export const getAllServices = async () => {
  try {
    const res = await axios.get(`${Backend_URL}/api/services/all`);

    return res.data; // returns array of services
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};
export const updateService = async (id, updatedData) => {
  const res = await axios.put(`${Backend_URL}/api/services/update/${id}`, updatedData);
  return res.data;
};

// 🟥 Delete service
export const deleteService = async (id) => {
  try {
    const res = await axios.delete(`${Backend_URL}/api/services/delete/${id}`);
    alert(res.data.message || "Service deleted successfully!");
    return res.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Failed to delete service.";
    alert(message);
    console.error("Error deleting service:", error);
    throw error;
  }
};

