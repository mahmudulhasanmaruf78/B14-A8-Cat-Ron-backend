const jwt = require("jsonwebtoken");

/**
 * Middleware to verify JWT token in Authorization header
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access: No token provided or invalid format",
    });
  }

  const token = authHeader.split(" ")[1];
  const candidates = [
    process.env.JWT_SECRET,
    process.env.JWT_ACCESS_SECRET,
    "booknook_jwt_access_super_secret_key_2026_catron",
    "booknook_jwt_secret_key_change_me_in_production",
  ].filter(Boolean);

  let decodedUser = null;
  for (const secret of candidates) {
    try {
      decodedUser = jwt.verify(token, secret);
      break;
    } catch {
      // Try next secret candidate
    }
  }

  if (!decodedUser) {
    return res.status(403).json({
      success: false,
      message: "Forbidden access: Invalid or expired token",
    });
  }

  req.user = decodedUser;
  next();
};

module.exports = verifyToken;
