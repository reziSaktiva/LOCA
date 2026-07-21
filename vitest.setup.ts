/**
 * Dummy env untuk unit/integration test yang mengimpor public facade
 * (Prisma / Supabase client dievaluasi saat module load).
 * Tidak dipakai untuk koneksi sungguhan di unit test in-memory.
 */
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??= "test-publishable-key";
process.env.DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:5432/postgres";
