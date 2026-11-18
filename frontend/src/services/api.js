
// --------------------------------------------------
// API CONFIGURATION
// --------------------------------------------------

// Get the backend API URL from the frontend environment variables.
// Use the local backend URL if no custom URL is configured.
// Remove the trailing slash to prevent duplicate slashes in API requests.
const API_URL = (
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api"
).replace(/\/$/, "");


// ======================================
// AUTHENTICATION STORAGE
// ======================================

// Retrieve the authentication token saved in the browser.
export const getToken = () =>
    localStorage.getItem("travelmate_token");

// Save the authentication token and user information after login or registration.
export const saveAuth = (token, user) => {

    // Store the JWT authentication token in local storage.
    localStorage.setItem("travelmate_token", token);

    // Convert the user object into JSON and save it in local storage.
    localStorage.setItem(
        "travelmate_user",
        JSON.stringify(user)
    );
};

// Remove the saved authentication token and user information during logout.
export const clearAuth = () => {
    localStorage.removeItem("travelmate_token");
    localStorage.removeItem("travelmate_user");
};

// Retrieve the previously saved user information from local storage.
export const getSavedUser = () => {
    try {

        // Convert the stored JSON string back into a JavaScript object.
        return JSON.parse(
            localStorage.getItem("travelmate_user")
        ) || null;

    } catch {

        // Return null if the stored user information cannot be read.
        return null;
    }
};


// ======================================
// COMMON API REQUEST
// ======================================

// Reusable function for sending HTTP requests to the TravelMate backend.
// All API functions use this function to communicate with the server.
export const apiRequest = async (endpoint, options = {}) => {

    // Retrieve the saved authentication token.
    const token = getToken();

    // Variable for storing the server response.
    let response;

    try {

        // Send a request to the backend using the Fetch API.
        response = await fetch(`${API_URL}${endpoint}`, {
            ...options,

            // Configure request headers.
            headers: {

                // Specify that request data is sent in JSON format.
                "Content-Type": "application/json",

                // Include the JWT token when the user is authenticated.
                ...(token
                    ? { Authorization: `Bearer ${token}` }
                    : {}),

                // Include any additional headers provided by the API function.
                ...options.headers
            }
        });

    } catch (error) {

        // Display connection errors in the browser console.
        console.error("TravelMate API connection error:", error);

        // Inform the user that the backend server cannot be reached.
        throw new Error(
            "Cannot connect to TravelMate server. Make sure the backend is running on port 5000."
        );
    }

    // Convert the server response into JSON.
    // Return an empty object if the response does not contain valid JSON.
    const data = await response.json().catch(() => ({}));

    // Check whether the server returned an unsuccessful HTTP status.
    if (!response.ok) {

        // Display the error message returned by the backend.
        throw new Error(
            data.message || "Something went wrong"
        );
    }

    // Return the successful response data to the calling function.
    return data;
};


// ======================================
// DESTINATION APIs
// ======================================

// Retrieve all destinations from the backend.
// Optional filters can be passed as query parameters.
export const getDestinations = (filters = {}) => {

    // Create a URL query parameter collection.
    const params = new URLSearchParams();

    // Add valid filter values to the query parameters.
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            params.append(key, value);
        }
    });

    // Convert the query parameters into a URL string.
    const query = params.toString();

    // Send the request to retrieve destinations.
    // Include query parameters only when filters are provided.
    return apiRequest(
        `/destinations${query ? `?${query}` : ""}`
    );
};

// Retrieve the details of one destination using its ID.
export const getDestination = (id) =>
    apiRequest(`/destinations/${id}`);

// Compare multiple destinations using their IDs.
export const compareDestinations = (ids) =>
    apiRequest(
        `/destinations/compare?ids=${ids.join(",")}`
    );


// ======================================
// AUTH APIs
// ======================================

// Register a new user account by sending the registration details.
// The backend processes the information and creates the account.
export const registerUser = (userData) =>
    apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData)
    });

// Log in an existing user using their email and password.
// The backend verifies the credentials and returns authentication information.
export const loginUser = (credentials) =>
    apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials)
    });

// Retrieve the currently authenticated user's information.
// The authentication token is included by the common API request function.
export const getCurrentUser = () =>
    apiRequest("/auth/me");


// ======================================
// ITINERARY APIs
// ======================================

// Retrieve all itineraries belonging to the authenticated user.
export const getItineraries = () =>
    apiRequest("/itineraries");

// Retrieve one itinerary using its ID.
export const getItinerary = (id) =>
    apiRequest(`/itineraries/${id}`);

// Create a new travel itinerary by sending its information to the backend.
export const createItinerary = (data) =>
    apiRequest("/itineraries", {
        method: "POST",
        body: JSON.stringify(data)
    });

// Update an existing itinerary using its ID and updated information.
export const updateItinerary = (id, data) =>
    apiRequest(`/itineraries/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    });

// Delete an existing itinerary using its ID.
export const deleteItinerary = (id) =>
    apiRequest(`/itineraries/${id}`, {
        method: "DELETE"
    });


// ======================================
// DESTINATION REVIEW APIs
// ======================================

// Retrieve all reviews and rating information for a specific destination.
export const getDestinationReviews = (destinationId) =>
    apiRequest(`/reviews/${destinationId}`);

// Submit a new review for a destination.
export const createReview = (reviewData) =>
    apiRequest("/reviews", {
        method: "POST",
        body: JSON.stringify(reviewData)
    });

// Update an existing destination review using its review ID.
export const updateReview = (reviewId, reviewData) =>
    apiRequest(`/reviews/${reviewId}`, {
        method: "PUT",
        body: JSON.stringify(reviewData)
    });

// Delete an existing destination review using its review ID.
export const deleteReview = (reviewId) =>
    apiRequest(`/reviews/${reviewId}`, {
        method: "DELETE"
    });
