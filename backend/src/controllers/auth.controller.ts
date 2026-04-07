// --- controllers/auth.controller.ts ---

import { Request, Response } from "express";
import { AuthService } from "../services/auth.service"; 


/**
 * Expert-level AuthController implementation.
 * Focuses purely on handling HTTP requests and delegating business logic.
 * All error boilerplate is handled by the 'asyncHandler' wrapper.
 */
export class AuthController {

    private setAuthCookies(res: Response, refreshToken: string): void {
        const maxAge = 7 * 24 * 60 * 60 * 1000;
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge,
        });
    }

    private clearAuthCookies(res: Response): void {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
    }

    // --- 1. Registration Handler ---
    public async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, name } = req.body;

            if (!email || !password || !name) {
                res.status(400).json({ error: "Validation Failed", message: "All fields are required." });
                return;
            }

            const user = await AuthService.register(email, password, name);
            res.status(201).json(user);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Registration failed.";
            res.status(400).json({ error: message });
        }
    }

    // --- 2. Login Handler (Initial Access Token Generation) ---
    public async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ error: "Validation Failed", message: "Email and password are required." });
                return;
            }

            const tokens = await AuthService.login(email, password);
            this.setAuthCookies(res, tokens.refreshToken);
            res.status(200).json({ accessToken: tokens.accessToken });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Login failed.";
            res.status(401).json({ error: message });
        }
    }

    // --- 3. Token Refresh Middleware/Handler ---
    public async refresh(req: Request, res: Response): Promise<void> {
        try {
            const oldToken = req.cookies.refreshToken;
            if (!oldToken) {
                res.status(401).json({ error: "No refresh token found." });
                return;
            }

            const { accessToken, refreshToken } = await AuthService.refresh(oldToken); 
            
            this.setAuthCookies(res, refreshToken);
            res.status(200).json({ accessToken });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Token refresh failed.";
            res.status(401).json({ error: message });
        }
    }

    // --- 4. Logout Handler (Clearing session) ---
    public async logout(req: Request, res: Response): Promise<void> {
        try {
            const token = req.cookies.refreshToken;
            if (token) {
                await AuthService.logout(token);
            }
            this.clearAuthCookies(res);
            res.status(200).json({ message: "Successfully logged out." });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Logout failed.";
            res.status(500).json({ error: message });
        }
    }

    // Note: The static methods are now obsolete as the request handling is centralized 
    // within a single class structure that handles middleware concerns gracefully.
}
