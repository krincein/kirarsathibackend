const jwt = require("jsonwebtoken");
const { UserSchema } = require("../schemaCollections");

// Exported blacklist so other files can import it
const tokenBlacklist = new Set();

const isAuthorized = async (req, res, next) => {
  const jwtKey = process.env.JWT_KEY;
  const authHeader = req.headers.authorization;

  try {
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing.",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (tokenBlacklist.has(token)) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    const decoded = jwt.verify(token, jwtKey);
    const userId = decoded._id || decoded.id;

    const user = await UserSchema.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or authentication failed.",
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    const message =
      error.name === "TokenExpiredError"
        ? "Token expired. Please log in again."
        : "Invalid authentication token.";
    return res.status(401).json({ success: false, message });
  }
};

module.exports = { isAuthorized, tokenBlacklist };
