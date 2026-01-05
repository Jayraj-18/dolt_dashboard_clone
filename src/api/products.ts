const API_URL = (import.meta.env.VITE_PUBLIC_BACKEND_URL) + "/api/products";

export interface ProductData {
    _id?: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    image: string;
    description: string;
    rating?: number;
    providerId?: string;
}

export const createProduct = async (productData: ProductData) => {
    try {
        const response = await fetch(`${API_URL}/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to create product");
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
};

export const getProducts = async (providerId?: string) => {
    try {
        const url = new URL(`${API_URL}/get`);
        if (providerId) {
            url.searchParams.append("providerId", providerId);
        }

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

export const deleteProduct = async (id: string) => {
    try {
        const response = await fetch(`${API_URL}/delete/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to delete product");
        }

        return await response.json();
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
};
