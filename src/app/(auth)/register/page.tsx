import { RegisterForm } from "@/modules/auth/presentation";

export const metadata = {
  title: "Daftar — LOCA",
  description: "Buat akun LOCA untuk mulai belanja sports apparel essentials.",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <RegisterForm />
    </div>
  );
}
