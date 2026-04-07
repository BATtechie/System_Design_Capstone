import { Router, Request, Response } from "express";
// Note: We use 'Request' here for generic type safety, but rely on AuthRequest
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

/**
 * Defines the handler function for the /me protected route.
 * Separation of Concerns (SoC) principle applied: The logic is extracted 
 * from the router setup itself, making the file cleaner and easier to test.
 * @param req - The authenticated request object, guaranteed to contain userId.
 * @param res - The Express response object.
 */
const getMeHandler = async (req: AuthRequest, res: Response) => {
  try {
    // Use explicit logging or data retrieval here if needed (e.g., fetch user details from DB).
    // For this simple route, we directly use the authenticated data.

    res.status(200).json({
      message: "Protected resource accessed successfully.", // More descriptive message
      userId: req.userId,
    });
  } catch (error) {
    console.error("Error accessing protected user route /me:", error);
    // Ensure we return a standardized 500 Internal Server Error response upon failure.
    res.status(500).json({ message: "Internal server error while retrieving profile." });
  }
};

/**
 * Initializes and exports the router for user-specific protected routes.
 */
const userRouter = Router();

// The router setup is now clean, relying on the extracted handler function.
userRouter.get("/me", authMiddleware, getMeHandler);

export default userRouter;
