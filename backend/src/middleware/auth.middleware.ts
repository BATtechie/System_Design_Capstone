import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";

// NOTE: Ensure this environment variable is securely loaded.
const ACCESS_SECRET = process.env.ACCESS_SECRET!; 

/**
 * Defines the extended request object to hold the authenticated user ID.
 */
export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Expert-level authentication middleware.
 * Handles token extraction, verification, and granular error reporting.
 * @param req The Express request object.
 * @param res The Express response object.
 * @param next The function to call when authentication succeeds.
 */
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // 1. Robust Token Extraction and Validation
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== 'string') {
    // Failure: No Authorization header provided.
    return res.status(401).json({ error: "Authentication required", message: "No token provided in the request." });
  }

  // Expecting format: Bearer <token>
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    // Failure: Malformed Authorization header.
    return res.status(401).json({ error: "Authentication required", message: "Malformed token format. Expected: Bearer <token>." });
  }

  const token = parts[1];

  try {
    // 2. Granular Token Verification (Catching specific JWT errors)
    const decoded = jwt.verify(token, ACCESS_SECRET) as { userId: string };
    
    // Success: Attach the payload to the request object and proceed.
    req.userId = decoded.userId;
    next(); 

  } catch (error) {
    let errorMessage: string;
    let statusCode: number = 401; // Default Unauthorized status

    if (error instanceof TokenExpiredError) {
      // Specific handling for expired tokens
      errorMessage = "Token has expired. Please log in again.";
      statusCode = 403; // Use 403 Forbidden, as the client is blocked by time/policy
    } else if (error instanceof JsonWebTokenError) {
      // Handles invalid signatures or malformed structure
      errorMessage = "Invalid token signature or payload. Token may be revoked.";
      statusCode = 401; 
    } else {
      // Catch-all for unexpected JWT errors (e.g., algorithm mismatch)
      console.error("JWT Verification Error:", error);
      errorMessage = "Authentication failed due to an unknown token issue.";
      statusCode = 500; // Internal Server Error if the failure is on our side
    }

    // Exit gracefully with a detailed error message
    return res.status(statusCode).json({ error: errorMessage, code: 'AUTH_FAILED' });
  }
};
