import axios from "axios";

const Backend_URL =
  import.meta.env.VITE_PUBLIC_BACKEND_URL

export const fetchCounts = async () => {
  try {
    const response = await axios.get(`${Backend_URL}/api/admin/users/count`);
    if (response.data.success) {

      return response.data.data; // ✅ return the data instead of setting state
    } else {
      throw new Error("Failed to fetch user counts");
    }
  } catch (error) {
    console.error("Error fetching counts:", error);
    throw error;
  }
};


export const fetchBooks = async () => {
  try {
    const response = await axios.get(`${Backend_URL}/api/admin/books`);
    if (response.data.success) {

      return response.data;
    } else {
      throw new Error("Failed to fetch books");
    }
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
};

export const fetchUsers = async () => {
  try {
    const response = await axios.get(`${Backend_URL}/api/admin/users`);

    if (response.data.success) {
      return response.data.data;   // return list of users
    } else {
      throw new Error("Failed to fetch users");
    }

  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};



export const fetchserviceproviders= async () => {
  try {
    const response = await axios.get(`${Backend_URL}/api/admin/serviceproviders`);

    if (response.data.success) {
      return response.data.data;   // return list of users
    } else {
      throw new Error("Failed to fetch service providers");
    }

  } catch (error) {
    console.error("Error fetching service providers:", error);
    throw error;
  }
};


export const getFullUserDetails = async () => {
  try {
    const res = await axios.get(`${Backend_URL}/api/auth/me`, {
      withCredentials: true,
    });

    return res.data;

  } catch (error) {
    console.error("Error fetching logged-in user details:", error);

    // You can return null or throw error again based on your need
    return null;
  }
};

export const updateProviderProfile = async (formData) => {
  try {


    const res = await axios.put(
      `${Backend_URL}/api/auth/update-profile`,
      formData,
      {
        withCredentials: true,
      }
    );

    return res.data;

  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const updateBooking = async (bookingId, updates) => {
  try {
    const res = await axios.put(
      `${Backend_URL}/api/bookings/updateBooking/${bookingId}`,
      updates,
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error updating booking:", error);
    throw error;
  }
};

// ?
export const rateBooking = async (data) => {
  try {
    const res = await axios.post(
      `${Backend_URL}/api/bookings/rate`,
      data,
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    console.error("Error rating booking:", error);
    throw error;
  }
};

export const reportIssue = async (data) => {
  try {
    const res = await axios.post(
      `${Backend_URL}/api/bookings/report-issue`,
      data,
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    console.error("Error reporting issue:", error);
    throw error;
  }
};
export const getProviderBookings = async (providerId) => {
  try {
    const res = await axios.get(
      `${Backend_URL}/api/bookings/provider/bookings/${providerId}`,
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching provider bookings:", error);
    throw error;
  }
};
