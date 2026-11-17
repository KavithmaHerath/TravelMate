
const API_URL = (
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api"
).replace(/\/$/, "");

// ======================================
// AUTHENTICATION STORAGE
// ======================================

export const getToken = () =>
    localStorage.getItem("travelmate_token");

export const saveAuth = (token, user) => {
    localStorage.setItem("travelmate_token", token);
    localStorage.setItem(
        "travelmate_user",
        JSON.stringify(user)
    );
};

export const clearAuth = () => {
    localStorage.removeItem("travelmate_token");
    localStorage.removeItem("travelmate_user");
};

export const getSavedUser = () => {
    try {
        return JSON.parse(
            localStorage.getItem("travelmate_user")
        ) || null;
    } catch {
        return null;
    }
};

// ======================================
// COMMON API REQUEST
// ======================================

export const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();

    let response;

    try {
        response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(token
                    ? { Authorization: `Bearer ${token}` }
                    : {}),
                ...options.headers
            }
        });
    } catch (error) {
        console.error("TravelMate API connection error:", error);

        throw new Error(
            "Cannot connect to TravelMate server. Make sure the backend is running on port 5000."
        );
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message || "Something went wrong"
        );
    }

    return data;
};

// ======================================
// DESTINATION APIs
// ======================================

export const getDestinations = (filters = {}) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            params.append(key, value);
        }
    });

    const query = params.toString();

    return apiRequest(
        `/destinations${query ? `?${query}` : ""}`
    );
};

export const getDestination = (id) =>
    apiRequest(`/destinations/${id}`);

export const compareDestinations = (ids) =>
    apiRequest(
        `/destinations/compare?ids=${ids.join(",")}`
    );

// ======================================
// AUTH APIs
// ======================================

export const registerUser = (userData) =>
    apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData)
    });

export const loginUser = (credentials) =>
    apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials)
    });

export const getCurrentUser = () =>
    apiRequest("/auth/me");

// Itinerary API functions

export const getItineraries = () =>
    apiRequest("/itineraries");

export const getItinerary = (id) =>
    apiRequest(`/itineraries/${id}`);

export const createItinerary = (data) =>
    apiRequest("/itineraries", {
        method: "POST",
        body: JSON.stringify(data)
    });

export const updateItinerary = (id, data) =>
    apiRequest(`/itineraries/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    });

export const deleteItinerary = (id) =>
    apiRequest(`/itineraries/${id}`, {
        method: "DELETE"
    });