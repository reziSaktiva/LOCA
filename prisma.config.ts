import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load .env.local agar Prisma CLI dapat membaca environment variables
// yang sama dengan yang digunakan oleh Next.js
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL digunakan oleh Prisma CLI (migrate, introspect, generate)
    // agar bypass connection pooler (PgBouncer) yang tidak kompatibel dengan DDL
    url: env("DIRECT_URL"),
  },
});
