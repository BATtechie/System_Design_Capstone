import dotenv from "dotenv";
dotenv.config();
import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";

const setupApp = (): Application => {
  const app = express();

  // ✅ Middleware

  app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,            
}));
  app.use(express.json());
  app.use(cookieParser()); // ✅ MUST be before routes

  // ✅ Debug
  app.get("/test", (req, res) => {
    res.send("Server working ✅");
  });

  // ✅ Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/user", userRoutes);

  // ✅ Error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
};

const startServer = async () => {
  const app = setupApp();
  const PORT = 3000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();