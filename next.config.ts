import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Home directory punya `package-lock.json` miliknya sendiri (di luar project ini),
    // sehingga Turbopack salah menebak workspace root. Kunci root ke folder project.
    root: __dirname,
  },
};

export default nextConfig;
