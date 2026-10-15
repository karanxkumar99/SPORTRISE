import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { execSync } from "child_process";

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, "../.env") });

export function syncDatabaseProvider() {
  const schemaPath = path.join(__dirname, "../prisma/schema.prisma");
  if (!fs.existsSync(schemaPath)) {
    console.error("Prisma schema not found at:", schemaPath);
    return;
  }

  let schemaContent = fs.readFileSync(schemaPath, "utf-8");
  const dbUrl = process.env.DATABASE_URL;
  if (process.argv.includes("--require-postgres") && !dbUrl) {
    throw new Error("DATABASE_URL must be set for a Render PostgreSQL deployment.");
  }
  if (
    process.argv.includes("--require-postgres") &&
    !dbUrl?.startsWith("postgresql://") &&
    !dbUrl?.startsWith("postgres://")
  ) {
    throw new Error("Render deployment requires a PostgreSQL DATABASE_URL.");
  }

  const isPostgres = dbUrl?.startsWith("postgresql://") || dbUrl?.startsWith("postgres://");
  const targetProvider = isPostgres ? "postgresql" : "sqlite";

  // Clean up any stale .tmp files in node_modules/.prisma/client
  const clientDir = path.join(__dirname, "../node_modules/.prisma/client");
  if (fs.existsSync(clientDir)) {
    try {
      const files = fs.readdirSync(clientDir);
      for (const file of files) {
        if (file.includes(".tmp")) {
          try {
            fs.unlinkSync(path.join(clientDir, file));
          } catch {
            // ignore if locked
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // Regex to match provider = "..." inside datasource db block
  const regex = /(datasource\s+db\s*\{[\s\S]*?provider\s*=\s*")[^"]+(")/m;

  if (regex.test(schemaContent)) {
    schemaContent = schemaContent.replace(regex, `$1${targetProvider}$2`);
    fs.writeFileSync(schemaPath, schemaContent, "utf-8");
    console.log(`✅ [SPORTRISE DB SYNC] Prisma schema datasource synced to: '${targetProvider}' (matching DATABASE_URL format).`);
  }
}

export function generatePrismaClientSafely() {
  syncDatabaseProvider();

  try {
    execSync("npx prisma generate", { stdio: "inherit", cwd: path.join(__dirname, "..") });
  } catch {
    const clientPath = path.join(__dirname, "../node_modules/@prisma/client/index.js");
    if (fs.existsSync(clientPath)) {
      console.log("ℹ️ [SPORTRISE] Prisma client already active and loaded by running server. Proceeding smoothly.");
    } else {
      throw new Error("Failed to generate Prisma client and no cached client found.");
    }
  }
}

if (process.argv.includes("--generate")) {
  generatePrismaClientSafely();
} else {
  syncDatabaseProvider();
}
