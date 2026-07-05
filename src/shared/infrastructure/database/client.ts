import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "../../../generated/prisma/client";
import { env } from "../env";

// Prisma 7 wajib menggunakan driver adapter.
// DATABASE_URL menggunakan connection pooler (PgBouncer port 6543)
// agar aman digunakan di environment serverless (Vercel).
function createPrismaClient() {
  const pool = new Pool({
    connectionString: env.database.url,
    max: 10,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

type PrismaClientInstance = ReturnType<typeof createPrismaClient>;

// Singleton pattern: satu instance di seluruh aplikasi.
// Gunakan global object di development agar tidak membuat koneksi baru setiap hot-reload.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientInstance | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
