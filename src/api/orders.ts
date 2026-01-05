const API_URL = (import.meta.env.VITE_PUBLIC_BACKEND_URL) + "/api/orders";

export interface OrderData {
    userid: string;
    username: string;
    details: {
        email: string;
        fullName: string;
        address: string;
        city: string;
        zipCode: string;
    };
    items: Array<{
        productId: string;
        quantity: number;
        price: number;
        name?: string;
    }>;
    total_amount: number;
    payment_method?: string;
}

export const createOrder = async (orderData: OrderData) => {
    try {
        const response = await fetch(`${API_URL}/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to create order");
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
};

export const getUserOrders = async (userId: string) => {
    try {
        const response = await fetch(`${API_URL}/user/${userId}`);

        if (!response.ok) {
            throw new Error("Failed to fetch orders");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching user orders:", error);
        throw error;
    }
};

export const getProviderOrders = async (currentUserId?: string) => {
    try {
        const url = new URL(`${API_URL}/provider/all`);
        if (currentUserId) {
            url.searchParams.append("currentUserId", currentUserId);
        }

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch provider orders");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching provider orders:", error);
        throw error;
    }
};

export const acceptOrder = async (orderId: string, providerId: string) => {
    try {
        const response = await fetch(`${API_URL}/accept`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId, providerId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to accept order");
        }

        return await response.json();
    } catch (error) {
        console.error("Error accepting order:", error);
        throw error;
    }
};

export const updateOrderStatus = async (orderId: string, status: string, providerId: string) => {
    try {
        const response = await fetch(`${API_URL}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId, status, providerId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to update status to ${status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error updating order status to ${status}:`, error);
        throw error;
    }
};
