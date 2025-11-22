// ✅ api/ProductApi.js
import axios from "axios";
const Backend_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL 


export const addProduct = async (productData) => {
  try {
 
    const res = await axios.post(`${Backend_URL}/api/products/add`, productData);
   
    return res.data;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

// 🟨 Get All Products
export const getAllProducts = async () => {
  try {
    const res = await axios.get(`${Backend_URL}/api/products/all`);
    
  return res.data?.data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// 🟦 Update Product
export const updateProduct = async (id, updatedData) => {
  try {
    const res = await axios.put(`${Backend_URL}/api/products/update/${id}`, updatedData);
    return res.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// 🟥 Delete Product
export const deleteProduct = async (id) => {
  try {
    const res = await axios.delete(`${Backend_URL}/api/products/delete/${id}`);
    alert(res.data.message || "Product deleted successfully!");
    return res.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Failed to delete product.";
    alert(message);
    console.error("Error deleting product:", error);
    throw error;
  }
};