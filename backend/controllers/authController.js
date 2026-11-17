
// Import the MySQL database connection.
const db = require("../config/db");

// Import bcrypt for securely hashing and comparing passwords.
const bcrypt = require("bcryptjs");

// Import jsonwebtoken to create authentication tokens.
const jwt = require("jsonwebtoken");

// Create a JWT token containing the user's ID and email.
// The token remains valid for 7 days.
const createToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// REGISTER
// Handles new user registration.
const register = async (req, res) => {
    try {
        // Get the user's name, email, and password from the request body.
        const { name, email, password } = req.body;

        // Check whether all required registration fields are provided.
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        // Validate the email address using a regular expression.
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        // Ensure that the password contains at least 8 characters.
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        // Check whether an account with the given email already exists.
        const [existingUsers] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email.toLowerCase()]
        );

        // Prevent registration with an email that is already registered.
        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });
        }

        // Hash the password before saving it in the database.
        const passwordHash = await bcrypt.hash(password, 12);

        // Insert the new user's information into the MySQL users table.
        const [result] = await db.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES (?, ?, ?)`,
            [name.trim(), email.toLowerCase(), passwordHash]
        );

        // Create a user object using the newly generated database ID.
        const user = {
            id: result.insertId,
            name: name.trim(),
            email: email.toLowerCase()
        };

        // Generate an authentication token for the newly registered user.
        const token = createToken(user);

        // Return the registration success message, token, and user details.
        res.status(201).json({
            success: true,
            message: "Account created successfully",
            token,
            user
        });
    } catch (error) {
        // Log registration errors on the server.
        console.error("Registration error:", error.message);

        // Return a server error response if registration fails.
        res.status(500).json({
            success: false,
            message: "Unable to create account"
        });
    }
};

// LOGIN
// Handles authentication for existing users.
const login = async (req, res) => {
    try {
        // Get the email and password submitted by the user.
        const { email, password } = req.body;

        // Check whether both login fields are provided.
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find the user account using the provided email address.
        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email.toLowerCase()]
        );

        // Return an authentication error if no matching account exists.
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Get the matching user record from the database.
        const user = users[0];

        // Compare the entered password with the stored password hash.
        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        // Reject the login if the passwords do not match.
        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate an authentication token after successful login.
        const token = createToken(user);

        // Return the login success message, token, and user information.
        // The password hash is not included in the response.
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        // Log login errors on the server.
        console.error("Login error:", error.message);

        // Return a server error response if login fails.
        res.status(500).json({
            success: false,
            message: "Unable to log in"
        });
    }
};

// GET CURRENT USER
// Retrieves the details of the currently authenticated user.
const getMe = async (req, res) => {
    try {
        // Find the authenticated user's information using the ID
        // attached to the request by the authentication middleware.
        const [users] = await db.query(
            "SELECT id, name, email FROM users WHERE id = ?",
            [req.user.id]
        );

        // Return an error if the user account cannot be found.
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Return the current user's information.
        res.status(200).json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        // Log errors that occur while retrieving user information.
        console.error("Get user error:", error.message);

        // Return a server error response if the user cannot be loaded.
        res.status(500).json({
            success: false,
            message: "Unable to load user"
        });
    }
};

// Export the authentication controller functions
// so they can be used in the application routes.
module.exports = {
    register,
    login,
    getMe
};
