/**
 * JWT Authentication Module
 * Handles login, token generation, and token verification middleware.
 */
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "boxless-ai-dashboard-secret-key-2024";

// Hardcoded users as per spec
const USERS = {
  sylvia: {
    password: "sylvia2024",
    role: "admin",
    name: "Sylvia",
  },
  joseph: {
    password: "joseph2024",
    role: "approver",
    name: "Joseph",
  },
};

/**
 * Authenticate a user by username and password.
 * @param {string} username
 * @param {string} password
 * @returns {Object|null} User object without password, or null if invalid.
 */
export function authenticateUser(username, password) {
  const user = USERS[username];
  if (!user) return null;
  if (user.password !== password) return null;
  return {
    username,
    name: user.name,
    role: user.role,
  };
}

/**
 * Generate a JWT token for a user.
 * @param {Object} user - { username, name, role }
 * @returns {string} JWT token
 */
export function generateToken(user) {
  return jwt.sign(
    {
      username: user.username,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

/**
 * Verify a JWT token.
 * @param {string} token
 * @returns {Object|null} Decoded payload or null.
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Express middleware: require valid Bearer token.
 * Attaches `req.user` if valid.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
  }
  const token = authHeader.slice(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
  req.user = decoded;
  next();
}

export { USERS, JWT_SECRET };
