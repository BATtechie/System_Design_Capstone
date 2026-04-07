import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Client } from "pg";

dotenv.config({
path: path.resolve(__dirname, "../../../.env"),
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
throw new Error("DATABASE_URL is missing. Please set it in your .env file.");
}

const parsedUrl = new URL(databaseUrl);
const envSslMode = process.env.DATABASE_SSL_MODE?.toLowerCase();
const urlSslMode = parsedUrl.searchParams.get("sslmode")?.toLowerCase();

const resolvedSslMode = (
envSslMode ||
urlSslMode ||
(process.env.NODE_ENV === "production" ? "require" : "disable")
).toLowerCase();

const shouldUseSsl = resolvedSslMode !== "disable";

const ssl = shouldUseSsl
? { rejectUnauthorized: resolvedSslMode === "verify-full" }
: false;

if (!shouldUseSsl) {
parsedUrl.searchParams.delete("sslmode");
} else {
parsedUrl.searchParams.set("sslmode", "require");
}

const client = new Client({
connectionString: parsedUrl.toString(),
ssl,
});

const adapter = new PrismaPg(client);

export const prisma = new PrismaClient({
adapter,
});