
// Import jsonwebtoken to verify authentication tokens.
const jwt = require("jsonwebtoken");

// Authentication middleware.
// Protects routes by checking whether the user has a valid JWT token.
const protect = (req, res, next) => {
    try {
        // Get the Authorization header from the incoming request.
        const authHeader = req.headers.authorization;

        // Check whether the Authorization header exists
        // and uses the Bearer token authentication format.
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Please log in to access this resource"
            });
        }

        // Extract the JWT token from the Authorization header.
        const token = authHeader.split(" ")[1];

        // Verify the token using the secret key stored in environment variables.
        // This also checks whether the token has expired or is invalid.
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Attach the decoded user information to the request.
        // This allows protected controllers to access the authenticated user.
        req.user = decoded;

        // Continue to the next middleware or route handler
        // after successful authentication.
        next();
    } catch (error) {
        // Return an unauthorized response if token verification fails.
        return res.status(401).json({
            success: false,
            message: "Invalid or expired login token"
        });
    }
};

// Export the authentication middleware
// so it can be used to protect application routes.
module.exports = { protect };
